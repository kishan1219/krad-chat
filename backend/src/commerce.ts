import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Actor, authorize } from './auth';
import { Db } from './db';
import { ApiError, idSchema, normalizePhone, sha256 } from './common';
import { Config } from './config';
import { PoolClient } from 'pg';

const money = z.number().int().min(0).max(100000000);
const productSchema = z.object({ sku: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(200), description: z.string().max(4000).default(''), category: z.string().max(100).default(''), price_paise: money, stock: z.number().int().min(0).max(1000000), active: z.boolean().default(true),parent_product_id:idSchema.nullable().default(null),options:z.record(z.string().min(1).max(50),z.string().min(1).max(100)).refine(v=>Object.keys(v).length<=10).default({}) });
export function orderTotals(subtotal:number,settings:any){const shipping=Number(settings?.shipping_paise||0),tax=Math.round(subtotal*Number(settings?.tax_basis_points||0)/10000);return {subtotal_paise:subtotal,shipping_paise:shipping,tax_paise:tax,total_paise:subtotal+shipping+tax};}
export class Commerce {
  constructor(private db: Db, private cfg: Config) {}
  async settings(actor:Actor,body?:any){
    if(body){authorize(actor,'resources:write');const input=z.object({shipping_paise:z.number().int().min(0).max(10000000),tax_basis_points:z.number().int().min(0).max(10000)}).parse(body);
      await this.db.query('INSERT INTO commerce_settings(tenant_id,shipping_paise,tax_basis_points) VALUES($1,$2,$3) ON CONFLICT(tenant_id) DO UPDATE SET shipping_paise=EXCLUDED.shipping_paise,tax_basis_points=EXCLUDED.tax_basis_points',[actor.tenant_id,input.shipping_paise,input.tax_basis_points]);
    }
    return (await this.db.query('SELECT shipping_paise,tax_basis_points FROM commerce_settings WHERE tenant_id=$1',[actor.tenant_id])).rows[0]||{shipping_paise:0,tax_basis_points:0};
  }
  async products(actor: Actor) { return (await this.db.query('SELECT * FROM products WHERE tenant_id=$1 ORDER BY id DESC LIMIT 500',[actor.tenant_id])).rows; }
  async saveProduct(actor: Actor, body: any, id?: string) {
    authorize(actor,'resources:write'); const input=productSchema.parse(body);
    if(input.parent_product_id&&!(await this.db.query('SELECT 1 FROM products WHERE tenant_id=$1 AND id=$2 AND parent_product_id IS NULL',[actor.tenant_id,input.parent_product_id])).rowCount)throw new ApiError(422,'Variant parent must be a base product in this business.');
    if (!id) return (await this.db.query('INSERT INTO products(tenant_id,sku,name,description,category,price_paise,stock,active,parent_product_id,options) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',[actor.tenant_id,input.sku,input.name,input.description,input.category,input.price_paise,input.stock,input.active,input.parent_product_id,input.options])).rows[0];
    const version=idSchema.parse(body.version);
    const result=await this.db.query('UPDATE products SET sku=$3,name=$4,description=$5,category=$6,price_paise=$7,stock=$8,active=$9,version=version+1 WHERE tenant_id=$1 AND id=$2 AND version=$10 AND reserved<=$8 RETURNING *',[actor.tenant_id,idSchema.parse(id),input.sku,input.name,input.description,input.category,input.price_paise,input.stock,input.active,version]);
    if (!result.rowCount) throw new ApiError(409,'Product changed or stock is below existing reservations. Refresh before editing.'); return result.rows[0];
  }
  async orders(actor:Actor) { authorize(actor,'chat:reply');return (await this.db.query('SELECT * FROM commerce_orders WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 200',[actor.tenant_id])).rows; }
  async checkout(actor:Actor,body:any,key:string,client?:PoolClient) {
    authorize(actor,'chat:reply');z.string().min(8).max(200).parse(key);
    const input=z.object({customer_phone:z.string(),customer_name:z.string().trim().min(1).max(200),address:z.object({line1:z.string().trim().min(3).max(300),city:z.string().trim().min(1).max(100),postcode:z.string().trim().min(3).max(20)}),items:z.array(z.object({product_id:idSchema,quantity:z.number().int().min(1).max(1000),expected_price_paise:money})).min(1).max(100),payment_method:z.enum(['cod','online']),expected_total_paise:money.optional()}).parse(body);
    const phone=normalizePhone(input.customer_phone);const ids=input.items.map(i=>i.product_id);
    if(new Set(ids).size!==ids.length) throw new ApiError(422,'Combine duplicate product lines.');
    if(input.payment_method==='online'&&this.cfg.PROVIDER_MODE!=='mock') throw new ApiError(503,'Live commerce checkout is not activated. Use the configured payment integration after validation.');
    const requestHash=sha256(JSON.stringify({...input,customer_phone:phone}));
    const perform=async(c:PoolClient)=>{
      // Tenant row serializes duplicate checkout references and reservation updates.
      await c.query('SELECT id FROM tenants WHERE id=$1 FOR UPDATE',[actor.tenant_id]);
      const existing=(await c.query('SELECT * FROM commerce_orders WHERE tenant_id=$1 AND reference=$2',[actor.tenant_id,key])).rows[0];
      if(existing){if(existing.request_hash!==requestHash)throw new ApiError(409,'Checkout reference already used with different details.');return existing;}
      const rows=(await c.query('SELECT * FROM products WHERE tenant_id=$1 AND id=ANY($2::bigint[]) ORDER BY id FOR UPDATE',[actor.tenant_id,ids])).rows;
      let total=0;const items=[];
      for(const item of input.items){const p=rows.find(p=>Number(p.id)===item.product_id);if(!p||!p.active)throw new ApiError(422,'Product unavailable.');if(Number(p.price_paise)!==item.expected_price_paise)throw new ApiError(409,'Price changed. Review the updated cart.');if(p.stock-p.reserved<item.quantity)throw new ApiError(409,`Insufficient stock: ${p.name}`);total+=Number(p.price_paise)*item.quantity;items.push({product_id:Number(p.id),sku:p.sku,name:p.name,quantity:item.quantity,price_paise:Number(p.price_paise)});}
      if(!Number.isSafeInteger(total)||total<=0||total>100000000)throw new ApiError(422,'Invalid order total.');
      const settings=(await c.query('SELECT * FROM commerce_settings WHERE tenant_id=$1',[actor.tenant_id])).rows[0];
      const totals=orderTotals(total,settings);
      if(totals.total_paise>100000000)throw new ApiError(422,'Order total exceeds the limit.');
      if((totals.shipping_paise||totals.tax_paise)&&input.expected_total_paise===undefined)throw new ApiError(409,'Review the shipping and tax quote before confirming.');
      if(input.expected_total_paise!==undefined&&input.expected_total_paise!==totals.total_paise)throw new ApiError(409,'Order total changed. Review shipping, tax and prices again.');
      total=totals.total_paise;
      const id=randomUUID();const online=input.payment_method==='online';
      const row=(await c.query(`INSERT INTO commerce_orders(id,tenant_id,customer_phone,customer_name,address,items,total_paise,payment_method,status,expires_at,reference,request_hash,created_by,subtotal_paise,shipping_paise,tax_paise) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,CASE WHEN $10 THEN now()+interval '30 minutes' ELSE NULL END,$11,$12,$13,$14,$15,$16) RETURNING *`,[id,actor.tenant_id,phone,input.customer_name,input.address,JSON.stringify(items),total,input.payment_method,online?'awaiting_payment':'confirmed',online,key,requestHash,actor.id,totals.subtotal_paise,totals.shipping_paise,totals.tax_paise])).rows[0];
      for(const i of items)await c.query('UPDATE products SET reserved=reserved+$3,version=version+1 WHERE tenant_id=$1 AND id=$2',[actor.tenant_id,i.product_id,i.quantity]);
      if(online)await c.query('INSERT INTO commerce_payments(id,tenant_id,order_id,amount) VALUES($1,$2,$3,$4)',[`commerce_mock_${id}`,actor.tenant_id,id,total]);
      await c.query("INSERT INTO order_events(tenant_id,order_id,action,user_id) VALUES($1,$2,'created',$3)",[actor.tenant_id,id,actor.id]);return row;
    };
    return client?perform(client):this.db.transaction(perform);
  }
  async shoppingReply(c:PoolClient,actor:Actor,conversation:any,text:string,runId:number):Promise<string>{
    await c.query('SELECT id FROM tenants WHERE id=$1 FOR UPDATE',[actor.tenant_id]);
    await c.query('INSERT INTO shopping_sessions(tenant_id,conversation_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[actor.tenant_id,conversation.id]);
    let cart=(await c.query('SELECT * FROM shopping_sessions WHERE tenant_id=$1 AND conversation_id=$2 FOR UPDATE',[actor.tenant_id,conversation.id])).rows[0];
    if(Date.now()-new Date(cart.updated_at).getTime()>30*60000){await c.query("UPDATE shopping_sessions SET items='[]',stage='browsing',customer_name=NULL,address=NULL,updated_at=now() WHERE tenant_id=$1 AND conversation_id=$2",[actor.tenant_id,conversation.id]);cart={...cart,items:[],stage:'browsing'};}
    const command=text.trim().toLowerCase();
    const pageCommand=/^(?:shop|menu|products)(?:\s+(\d+))?$/.exec(command),page=Math.max(1,Math.min(1000,Number(pageCommand?.[1]||1)));
    const catalog=(await c.query('SELECT * FROM products WHERE tenant_id=$1 AND active=true ORDER BY id LIMIT 10 OFFSET $2',[actor.tenant_id,(page-1)*10])).rows;
    const settings=(await c.query('SELECT * FROM commerce_settings WHERE tenant_id=$1',[actor.tenant_id])).rows[0];
    const price=(n:number)=>`INR ${(n/100).toFixed(2)}`;
    const save=async(items:any[],stage='browsing',name=cart.customer_name,address=cart.address)=>c.query('UPDATE shopping_sessions SET items=$3,stage=$4,customer_name=$5,address=$6,updated_at=now() WHERE tenant_id=$1 AND conversation_id=$2',[actor.tenant_id,conversation.id,JSON.stringify(items),stage,name,address]);
    const totals=(items:any[])=>orderTotals(items.reduce((sum,i)=>sum+i.price_paise*i.quantity,0),settings);
    const summary=(items:any[])=>items.map(i=>`${i.sku}: ${i.name} x ${i.quantity} — ${price(i.price_paise*i.quantity)}`).join('\n')+`\nSubtotal: ${price(totals(items).subtotal_paise)}\nShipping: ${price(totals(items).shipping_paise)}\nTax: ${price(totals(items).tax_paise)}\nTotal: ${price(totals(items).total_paise)}`;
    if(pageCommand||['hi','hello'].includes(command))return `Catalog page ${page}\n${catalog.map(p=>`${p.sku}: ${p.name} ${Object.entries(p.options||{}).map(([k,v])=>`${k}: ${v}`).join(', ')} — ${price(Number(p.price_paise))} (${p.stock-p.reserved} available)`).join('\n')||'No products on this page.'}\nType SHOP ${page+1} for the next page. ADD SKU QUANTITY to add an item. CART to view, CHECKOUT to order, STATUS for your latest order, AGENT for help. Checkout uses cash on delivery.`;
    if(command==='status'){const order=(await c.query('SELECT id,status,total_paise FROM commerce_orders WHERE tenant_id=$1 AND customer_phone=$2 ORDER BY created_at DESC LIMIT 1',[actor.tenant_id,conversation.phone])).rows[0];return order?`Order ${order.id}: ${order.status}. Total ${price(Number(order.total_paise))}.`:'You have no orders yet. Type SHOP to browse.';}
    if(command==='clear'){await save([]);return 'Cart cleared. Type SHOP to browse.';}
    const add=/^add\s+(\S+)\s+(\d+)$/i.exec(text.trim());
    if(add){const matches=(await c.query('SELECT * FROM products WHERE tenant_id=$1 AND active=true AND lower(sku)=lower($2) LIMIT 2',[actor.tenant_id,add[1]])).rows;const p=matches.length===1?matches[0]:null;const quantity=Number(add[2]);if(!p||quantity<1||quantity>1000)return 'Use ADD SKU QUANTITY with an available product. Type SHOP to see the catalog.';const items=cart.items.filter((i:any)=>i.product_id!==Number(p.id));const previous=cart.items.find((i:any)=>i.product_id===Number(p.id));const count=quantity+(previous?.quantity||0);if(count>p.stock-p.reserved)return `Only ${p.stock-p.reserved} units of ${p.name} are available.`;if(items.length>=10)return 'Cart limit reached. Type CART or CLEAR.';items.push({product_id:Number(p.id),sku:p.sku,name:p.name,quantity:count,price_paise:Number(p.price_paise)});await save(items);return `${summary(items)}\nType CHECKOUT to continue or ADD SKU QUANTITY to add another item.`;}
    if(command==='cart')return cart.items.length?`${summary(cart.items)}\nType CHECKOUT to continue or CLEAR to start again.`:'Your cart is empty. Type SHOP to browse.';
    if(command==='checkout'){if(!cart.items.length)return 'Your cart is empty. Type SHOP to browse.';await save(cart.items,'name',null,null);return 'Please reply with your full name. Type CLEAR to cancel checkout.';}
    if(cart.stage==='name'){if(text.trim().length<1||text.length>200)return 'Please enter a name under 200 characters.';await save(cart.items,'address',text.trim(),null);return 'Enter your delivery address as: street address | city | postcode';}
    if(cart.stage==='address'){const parts=text.split('|').map(p=>p.trim());if(parts.length!==3||parts[0].length<3||parts[0].length>300||!parts[1]||parts[1].length>100||parts[2].length<3||parts[2].length>20)return 'Please use: street address | city | postcode';const address={line1:parts[0],city:parts[1],postcode:parts[2]};await save(cart.items,'review',cart.customer_name,address);await c.query('UPDATE shopping_sessions SET quote_total_paise=$3 WHERE tenant_id=$1 AND conversation_id=$2',[actor.tenant_id,conversation.id,totals(cart.items).total_paise]);return `${summary(cart.items)}\nName: ${cart.customer_name}\nDelivery: ${parts.join(', ')}\nPayment: cash on delivery. Reply CONFIRM to place this order, or CLEAR to cancel.`;}
    if(cart.stage==='review'&&command==='confirm'){
      try{const order=await this.checkout(actor,{customer_phone:conversation.phone,customer_name:cart.customer_name,address:cart.address,payment_method:'cod',expected_total_paise:cart.quote_total_paise===null?undefined:Number(cart.quote_total_paise),items:cart.items.map((i:any)=>({product_id:i.product_id,quantity:i.quantity,expected_price_paise:i.price_paise}))},`shopping-run-${runId}`,c);await save([]);return `Order confirmed: ${order.id}\nTotal ${price(Number(order.total_paise))}. Pay on delivery. Type STATUS for updates or AGENT for help.`;}catch(e){if(e instanceof ApiError){await save([]);return `${e.message} Please type SHOP and create a new cart.`;}throw e;}
    }
    return 'Type SHOP, ADD SKU QUANTITY, CART, CHECKOUT, STATUS or AGENT. If reviewing checkout, reply CONFIRM to place your order.';
  }
  async transition(actor:Actor,id:string,body:any) {
    authorize(actor,'chat:reply');z.uuid().parse(id);const input=z.object({status:z.enum(['confirmed','packing','shipped','delivered','cancelled']),version:idSchema}).parse(body);
    const allowed:Record<string,string[]>={awaiting_payment:['cancelled'],confirmed:['packing','cancelled'],packing:['shipped','cancelled'],shipped:['delivered'],delivered:[],cancelled:[],expired:[]};
    return this.db.transaction(async c=>{
      const row=(await c.query('SELECT * FROM commerce_orders WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[actor.tenant_id,id])).rows[0];if(!row)throw new ApiError(404,'Order not found.');if(row.version!==input.version)throw new ApiError(409,'Order changed. Refresh first.');if(!allowed[row.status]?.includes(input.status))throw new ApiError(422,'Order transition is not allowed.');
      if(input.status==='cancelled'||input.status==='shipped')for(const i of [...row.items].sort((a,b)=>a.product_id-b.product_id))await c.query(`UPDATE products SET reserved=reserved-$3,stock=stock-$4,version=version+1 WHERE tenant_id=$1 AND id=$2`,[actor.tenant_id,i.product_id,i.quantity,input.status==='shipped'?i.quantity:0]);
      const result=(await c.query("UPDATE commerce_orders SET status=$3,version=version+1,payment_status=CASE WHEN $3='cancelled' AND payment_status='paid' THEN 'refund_required' ELSE payment_status END WHERE tenant_id=$1 AND id=$2 RETURNING *",[actor.tenant_id,id,input.status])).rows[0];
      await c.query('INSERT INTO order_events(tenant_id,order_id,action,user_id) VALUES($1,$2,$3,$4)',[actor.tenant_id,id,input.status,actor.id]);return result;
    });
  }
  async mockPay(actor:Actor,id:string) {
    authorize(actor,'billing:write');if(this.cfg.PROVIDER_MODE!=='mock'||this.cfg.NODE_ENV==='production')throw new ApiError(403,'Simulation is disabled.');z.uuid().parse(id);
    return this.db.transaction(async c=>{
      const order=(await c.query('SELECT * FROM commerce_orders WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[actor.tenant_id,id])).rows[0];if(!order)throw new ApiError(404,'Order not found.');
      if(order.payment_method!=='online')throw new ApiError(422,'This order uses cash on delivery.');if(order.payment_status==='paid')return order;
      if(order.status!=='awaiting_payment'||new Date(order.expires_at).getTime()<=Date.now())throw new ApiError(409,'Payment reservation expired. Reconciliation is required.');
      await c.query("UPDATE commerce_payments SET status='captured',provider_event=$3 WHERE tenant_id=$1 AND order_id=$2",[actor.tenant_id,id,`mock_capture_${id}`]);
      await c.query("INSERT INTO order_events(tenant_id,order_id,action,user_id) VALUES($1,$2,'payment.captured',$3)",[actor.tenant_id,id,actor.id]);
      return (await c.query("UPDATE commerce_orders SET status='confirmed',payment_status='paid',expires_at=NULL,version=version+1 WHERE tenant_id=$1 AND id=$2 RETURNING *",[actor.tenant_id,id])).rows[0];
    });
  }
  async expire() {
    await this.db.transaction(async c=>{
      const rows=(await c.query("SELECT * FROM commerce_orders WHERE status='awaiting_payment' AND expires_at<now() ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 50")).rows;
      for(const row of rows){for(const i of [...row.items].sort((a,b)=>a.product_id-b.product_id))await c.query('UPDATE products SET reserved=reserved-$3,version=version+1 WHERE tenant_id=$1 AND id=$2',[row.tenant_id,i.product_id,i.quantity]);await c.query("UPDATE commerce_orders SET status='expired',version=version+1 WHERE id=$1",[row.id]);await c.query("INSERT INTO order_events(tenant_id,order_id,action) VALUES($1,$2,'expired')",[row.tenant_id,row.id]);}
    });
  }
}

