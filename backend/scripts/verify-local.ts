import {config} from 'dotenv';
import assert from 'node:assert/strict';
config({path:'.env.local',quiet:true});
const port=Number(process.env.PORT||4000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid local port.');
const base=`http://127.0.0.1:${port}/api`;
async function main(){
 const health=await fetch(`${base}/health`);assert.equal(health.status,200);
 assert.equal((await health.json() as any).data.provider_mode,'mock','Verification must run against the local mock server.');
 const login=await fetch(`${base}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});
 assert.equal(login.status,200,'Local login failed.');const session=(await login.json() as any).data;
 const headers={Authorization:`Bearer ${session.access_token}`};
 try{
  for(const path of ['me','whatsapp/connections','whatsapp/onboarding/history','whatsapp/senders','workflows','workflows/runs','whatsapp/webhook-events','inbox/agents','wa-reply-thread-users','commerce/products','commerce/orders','commerce/settings','whatsapp/broadcast-policy','whatsapp/consents']){
   const response=await fetch(`${base}/${path}`,{headers});assert.equal(response.status,200,`${path} failed`);
   const body=await response.json() as any;assert.equal(body.error,false,path);
   assert.equal(JSON.stringify(body).includes('token_encrypted'),false,'Encrypted credentials must not be returned.');
   console.log(`PASS ${path}`);
  }
 }finally{await fetch(`${base}/logout`,{method:'POST',headers});}
 console.log('Local API verification passed; provider delivery remains simulated.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
