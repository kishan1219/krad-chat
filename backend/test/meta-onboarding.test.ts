import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Providers} from '../src/providers';
import {MetaConnections} from '../src/meta-connections';
import {MetaOnboarding} from '../src/meta-onboarding';

test('Embedded Signup is signed, login-bound, expiring and one-use without persisting codes',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig,db),connections=new MetaConnections(db,testConfig,providers),onboarding=new MetaOnboarding(db,testConfig,providers,connections);
  const session=await onboarding.begin({...actor,session_id:'session-a'});
  const body={state:session.state,code:'sensitive-code',name:'Demo',waba_id:'100',phone_number_id:'101'};
  await assert.rejects(onboarding.complete({...actor,session_id:'session-b'},body));
  await assert.rejects(onboarding.complete({...actor,session_id:'session-a'},{...body,state:`${session.state.slice(0,-1)}${session.state.endsWith('a')?'b':'a'}`}));
  const result=await onboarding.complete({...actor,session_id:'session-a'},body);assert.equal(result.phone_number_id,'101');
  await assert.rejects(onboarding.complete({...actor,session_id:'session-a'},body));
  assert.equal((await onboarding.history(actor))[0].status,'completed');
  assert.equal(JSON.stringify((await db.query('SELECT * FROM meta_onboarding_sessions')).rows).includes('sensitive-code'),false);
  const expired=await onboarding.begin(actor);await db.query("UPDATE meta_onboarding_sessions SET expires_at=now()-interval '1 second' WHERE id=$1",[expired.state.split('.')[0]]);
  await assert.rejects(onboarding.complete(actor,{...body,state:expired.state}));
  assert.equal((await onboarding.history({...actor,tenant_id:actor.tenant_id+1})).length,0);
 }finally{await close();}
});
