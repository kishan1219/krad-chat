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
test('Zero-touch automated onboarding resolves WABA and Phone without manual IDs', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    providers.exchangeMetaCode = async () => 'test-user-access-token';
    (providers as any).request = async (url: string) => {
      if (url.includes('debug_token')) {
        return {
          data: {
            app_id: '1266340039018485',
            granular_scopes: [
              { scope: 'whatsapp_business_management', target_ids: ['88001'] },
              { scope: 'whatsapp_business_messaging', target_ids: ['99002'] }
            ]
          }
        };
      }
      return {};
    };

    providers.meta = async (path: string) => {
      if (path.startsWith('99002?fields=')) {
        return {
          id: '99002',
          display_phone_number: '+91 99999 88888',
          whatsapp_business_account: { id: '88001' }
        };
      }
      if (path.startsWith('88001/phone_numbers')) {
        return {
          data: [
            {
              id: '99002',
              display_phone_number: '+91 99999 88888',
              verified_name: 'Zero Touch Business',
              quality_rating: 'GREEN'
            }
          ]
        };
      }
      return { success: true };
    };

    const liveConfig = { ...testConfig, PROVIDER_MODE: 'live' as const };
    const connections = new MetaConnections(db, liveConfig, providers);
    const onboarding = new MetaOnboarding(db, testConfig, providers, connections);

    const session = await onboarding.begin({ ...actor, session_id: 'zero-touch-session' });

    // NO waba_id, NO phone_number_id passed! Pure zero-touch payload from frontend
    const zeroTouchPayload = {
      state: session.state,
      code: 'valid-meta-oauth-code',
      name: 'Zero Touch Auto Brand'
    };

    const result = await onboarding.complete({ ...actor, session_id: 'zero-touch-session' }, zeroTouchPayload);

    assert.equal(result.phone_number_id, '99002');
    assert.equal(result.waba_id, '88001');
    assert.equal(result.display_phone_number, '+91 99999 88888');

    const history = await onboarding.history(actor);
    assert.equal(history[0].status, 'completed');
  } finally {
    await close();
  }
});
