import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Commerce} from '../src/commerce';

test('variant inventory and shipping/tax quotes are validated before reserving stock',async()=>{
 const {db,actor,close}=await database();
 try{
  const commerce=new Commerce(db,testConfig);
  const parent=await commerce.saveProduct(actor,{sku:'SHIRT',name:'Shirt',stock:0,price_paise:10000});
  const variant=await commerce.saveProduct(actor,{sku:'SHIRT-L',name:'Shirt Large',stock:2,price_paise:12000,parent_product_id:Number(parent.id),options:{size:'Large'}});
  await assert.rejects(commerce.saveProduct({...actor,tenant_id:actor.tenant_id+1},{sku:'BAD',name:'Cross tenant',stock:1,price_paise:100,parent_product_id:Number(parent.id)}));
  await commerce.settings(actor,{shipping_paise:500,tax_basis_points:500});
  const input={customer_phone:'+919876543210',customer_name:'Buyer',address:{line1:'Street 12',city:'Delhi',postcode:'110001'},payment_method:'cod',items:[{product_id:Number(variant.id),quantity:1,expected_price_paise:12000}]};
  await assert.rejects(commerce.checkout(actor,{...input,expected_total_paise:12000},'outdated-quote'));
  assert.equal(Number((await commerce.products(actor))[0].reserved),0);
  const order=await commerce.checkout(actor,{...input,expected_total_paise:13100},'accepted-quote');
  assert.equal(Number(order.subtotal_paise),12000);assert.equal(Number(order.shipping_paise),500);assert.equal(Number(order.tax_paise),600);assert.equal(Number(order.total_paise),13100);
  assert.equal(Number((await db.query('SELECT reserved FROM products WHERE id=$1',[parent.id])).rows[0].reserved),0);
 }finally{await close();}
});
