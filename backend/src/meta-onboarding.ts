import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {Actor,authorize} from './auth';
import {ApiError,decrypt,encrypt,equalSecret,sha256,token} from './common';
import {Config,requiredEnv} from './config';
import {Db} from './db';
import {Providers} from './providers';
import {MetaConnections} from './meta-connections';

function authorizeAdminOrChannel(actor: Actor) {
  if (actor.role === 'admin' || actor.role === 'reseller' || actor.permissions.includes('admin:write') || actor.permissions.includes('campaign:create')) return;
  authorize(actor, 'admin:write');
}

export class MetaOnboarding {
 constructor(private db:Db,private cfg:Config,private providers:Providers,private connections:MetaConnections){}
 private signature(id:string){return createHmac('sha256',this.cfg.JWT_SECRET).update(`meta-onboarding:${id}`).digest('hex');}

 private async resolveConfig(): Promise<{ app_id: string | null; config_id: string | null; graph_version: string; app_secret: string | null; configured: boolean }> {
  let appId = process.env.META_APP_ID || process.env.META_ID || process.env.REACT_APP_META_APP_ID || process.env.WHATSAPP_APP_ID || process.env.FACEBOOK_APP_ID || process.env.META_CLIENT_ID || process.env.APP_ID || null;
  let configId = process.env.META_CONFIG_ID || process.env.CONFIG_ID || process.env.META_CONFIG || process.env.REACT_APP_META_CONFIG_ID || process.env.WHATSAPP_CONFIG_ID || process.env.FACEBOOK_CONFIG_ID || null;
  let graphVersion = process.env.META_GRAPH_VERSION || process.env.REACT_APP_META_GRAPH_VERSION || process.env.WHATSAPP_GRAPH_VERSION || process.env.GRAPH_VERSION || 'v22.0';
  let appSecret = process.env.META_APP_SECRET || process.env.META_SECRET || process.env.META_SECRET_KEY || process.env.SECRET_KEY || process.env.REACT_APP_META_APP_SECRET || process.env.WHATSAPP_APP_SECRET || process.env.FACEBOOK_APP_SECRET || process.env.APP_SECRET || process.env.META_CLIENT_SECRET || null;

  if (!appId || !configId || !appSecret) {
   try {
    const rows = (await this.db.query("SELECT key, value_encrypted FROM platform_settings WHERE key IN ('meta_app_id','meta_config_id','meta_graph_version','meta_app_secret')")).rows;
    for (const row of rows) {
     try {
      const val = decrypt(row.value_encrypted, this.cfg.ENCRYPTION_KEY);
      if (row.key === 'meta_app_id' && !appId) appId = val;
      if (row.key === 'meta_config_id' && !configId) configId = val;
      if (row.key === 'meta_graph_version' && (!graphVersion || graphVersion === 'v22.0')) graphVersion = val;
      if (row.key === 'meta_app_secret' && !appSecret) appSecret = val;
     } catch {
      // ignore decryption failure
     }
    }
   } catch {
    // table may not exist yet
   }
  }

  const configured = Boolean(appId && configId && appSecret);
  return { app_id: appId, config_id: configId, graph_version: graphVersion, app_secret: appSecret, configured };
 }

 async getConfig(actor:Actor){
  authorizeAdminOrChannel(actor);
  const resolved = await this.resolveConfig();
  return {
   configured: resolved.configured,
   app_id: resolved.app_id,
   config_id: resolved.config_id,
   graph_version: resolved.graph_version,
   simulated: this.cfg.PROVIDER_MODE==='mock'
  };
 }

 async saveConfig(actor:Actor,body:any){
  authorizeAdminOrChannel(actor);
  const resolved = await this.resolveConfig();
  const input=z.object({
   app_id:z.string().trim().min(1).max(100),
   config_id:z.string().trim().min(1).max(100),
   graph_version:z.string().trim().min(1).max(20).default('v22.0'),
   app_secret:z.string().trim().max(200).optional()
  }).parse(body);

  const effectiveSecret = input.app_secret || resolved.app_secret || process.env.META_APP_SECRET || '';
  if (!effectiveSecret) {
    throw new ApiError(400, 'Meta App Secret is required for live onboarding. Please enter your App Secret or set META_APP_SECRET on Render.');
  }

  process.env.META_APP_ID=input.app_id;
  process.env.META_CONFIG_ID=input.config_id;
  process.env.META_GRAPH_VERSION=input.graph_version;
  process.env.META_APP_SECRET=effectiveSecret;

  try {
   const items = [
    ['meta_app_id', input.app_id],
    ['meta_config_id', input.config_id],
    ['meta_graph_version', input.graph_version],
    ['meta_app_secret', effectiveSecret]
   ];
   for (const [k, v] of items) {
    const encrypted = encrypt(v, this.cfg.ENCRYPTION_KEY);
    await this.db.query(
     `INSERT INTO platform_settings(key, value_encrypted, updated_at)
      VALUES($1, $2, now())
      ON CONFLICT(key) DO UPDATE SET value_encrypted=EXCLUDED.value_encrypted, updated_at=now()`,
     [k, encrypted]
    );
   }
  } catch {
   // ignore if migration not applied yet
  }

  return {success:true,configured:true,app_id:input.app_id,config_id:input.config_id,graph_version:input.graph_version};
 }

 async begin(actor:Actor,body?:any){
  authorizeAdminOrChannel(actor);if(actor.session_id.startsWith('api:'))throw new ApiError(403,'Sign in to connect a business.');
  const requestedMode=body?.mode;
  const resolved = await this.resolveConfig();
  const simulated=this.cfg.PROVIDER_MODE==='mock' || requestedMode==='sandbox' || (!resolved.configured && requestedMode!=='live');
  if(!simulated && !resolved.configured)throw new ApiError(503,'Meta Embedded Signup is not configured on this server yet. Enter credentials or select Sandbox mode.');
  const config=simulated
   ? {app_id:resolved.app_id||'123456789012345',config_id:resolved.config_id||'sandbox_config',graph_version:resolved.graph_version||'v22.0'}
   : {app_id:resolved.app_id!,config_id:resolved.config_id!,graph_version:resolved.graph_version};
  const id=token();
  await this.db.query("INSERT INTO meta_onboarding_sessions(id,tenant_id,user_id,session_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  return {...config,state:`${id}.${this.signature(id)}`,simulated,expires_in:600,configured:resolved.configured};
 }
 async history(actor:Actor){authorizeAdminOrChannel(actor);return (await this.db.query('SELECT id,status,connection_id,error,created_at,completed_at,expires_at FROM meta_onboarding_sessions WHERE tenant_id=$1 AND user_id=$2 ORDER BY created_at DESC LIMIT 50',[actor.tenant_id,actor.id])).rows;}
 async complete(actor:Actor,body:any){
  authorizeAdminOrChannel(actor);
  const input=z.object({
    state:z.string().regex(/^[a-f0-9]{64}\.[a-f0-9]{64}$/),
    code:z.string().min(1).max(4096),
    name:z.string().trim().min(1).max(150),
    waba_id: z.any().optional().nullable().transform((v) => {
      if (typeof v !== 'string' && typeof v !== 'number') return undefined;
      const digits = String(v).replace(/[^\d]/g, '');
      return digits.length > 0 ? digits : undefined;
    }),
    phone_number_id: z.any().optional().nullable().transform((v) => {
      if (typeof v !== 'string' && typeof v !== 'number') return undefined;
      const digits = String(v).replace(/[^\d]/g, '');
      return digits.length > 0 ? digits : undefined;
    }),
    connection_mode: z.enum(['dedicated', 'coexistence']).optional(),
    is_on_biz_app: z.boolean().optional(),
    business_id: z.string().optional()
  }).parse(body);
  const [id,signature]=input.state.split('.');
  if(!equalSecret(signature,this.signature(id)))throw new ApiError(403,'Invalid onboarding state.');
  const claimed=await this.db.query("UPDATE meta_onboarding_sessions SET status='exchanging' WHERE id=$1 AND tenant_id=$2 AND user_id=$3 AND session_hash=$4 AND status != 'completed' AND expires_at>now() RETURNING id, access_token_encrypted",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  if(!claimed.rowCount)throw new ApiError(409,'Onboarding expired, was already used, or belongs to another login. Start again.');
  try{
   const resolved = await this.resolveConfig();
   if (!process.env.META_APP_SECRET && resolved.app_secret) process.env.META_APP_SECRET = resolved.app_secret;
   if (!process.env.META_APP_ID && resolved.app_id) process.env.META_APP_ID = resolved.app_id;
   if (!process.env.META_GRAPH_VERSION && resolved.graph_version) process.env.META_GRAPH_VERSION = resolved.graph_version;
   
   let accessToken: string;
   const existingEncToken = claimed.rows[0]?.access_token_encrypted;
   if (existingEncToken) {
     try {
       accessToken = decrypt(existingEncToken, this.cfg.ENCRYPTION_KEY);
     } catch {
       accessToken = await this.providers.exchangeMetaCode(input.code);
     }
   } else {
     accessToken = await this.providers.exchangeMetaCode(input.code);
     try {
       await this.db.query("UPDATE meta_onboarding_sessions SET access_token_encrypted=$1 WHERE id=$2", [
         encrypt(accessToken, this.cfg.ENCRYPTION_KEY),
         id
       ]);
     } catch {}
   }
   let targetWaba = input.waba_id;
   let targetPhone = input.phone_number_id;

   // Self-healing: Check if user-entered WABA ID is actually a Phone Number ID
   if (targetWaba) {
     try {
       const directCheck: any = await this.providers.meta(
         `${targetWaba}?fields=id,display_phone_number,whatsapp_business_account`,
         'GET',
         undefined,
         accessToken
       );
       if (directCheck?.whatsapp_business_account?.id) {
         const realPhone = String(directCheck.id);
         const realWaba = String(directCheck.whatsapp_business_account.id);
         console.info(`[MetaOnboarding] Auto-corrected input WABA ID to Phone=${realPhone}, WABA=${realWaba}`);
         targetPhone = targetPhone || realPhone;
         targetWaba = realWaba;
       }
     } catch {}

     // Check if user-entered WABA ID is a Business Portfolio ID
     if (!targetPhone) {
       try {
         const bizWabas: any = await this.providers.meta(
           `${targetWaba}/owned_whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}`,
           'GET',
           undefined,
           accessToken
         );
         const candWaba = bizWabas?.data?.[0];
         if (candWaba?.id) {
           targetWaba = String(candWaba.id);
           if (candWaba.phone_numbers?.data?.length) {
             targetPhone = String(candWaba.phone_numbers.data[0].id);
           }
         }
       } catch {}
     }
   }

   // 1. Direct reverse Phone query if phone number is known
   if (!targetWaba && targetPhone) {
     try {
       const phoneInfo: any = await this.providers.meta(
         `${targetPhone}?fields=id,display_phone_number,whatsapp_business_account`,
         'GET',
         undefined,
         accessToken
       );
       if (phoneInfo?.whatsapp_business_account?.id) {
         targetWaba = String(phoneInfo.whatsapp_business_account.id);
       }
     } catch (err: any) {
       console.warn('[MetaOnboarding] Direct phone lookup failed:', err?.message || err);
     }
   }

   // 2. Primary Auto-Detection via /debug_token with App Access Token
   if (!targetWaba || !targetPhone) {
     try {
       const version = process.env.META_GRAPH_VERSION || resolved.graph_version || 'v22.0';
       const appId = process.env.META_APP_ID || resolved.app_id || '';
       const appSecret = process.env.META_APP_SECRET || resolved.app_secret || '';
       let appToken = appId && appSecret ? `${appId}|${appSecret}` : accessToken;
       if (appId && appSecret) {
         try {
           const tokenRes: any = await (this.providers as any).request(
             `https://graph.facebook.com/${version}/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&grant_type=client_credentials`,
             { method: 'GET' }
           );
           if (tokenRes?.access_token) appToken = tokenRes.access_token;
         } catch (err: any) {
           console.warn('[MetaOnboarding] client_credentials token request fallback:', err?.message || err);
         }
       }

       const debugRes: any = await (this.providers as any).request(
         `https://graph.facebook.com/${version}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appToken)}`,
         { method: 'GET' }
       );
       const granularScopes = debugRes?.data?.granular_scopes || [];
       const candidateWabas: string[] = [];
       const candidatePhones: string[] = [];
       const otherCandidates: string[] = [];

       for (const s of granularScopes) {
         if (s.scope === 'whatsapp_business_management' && Array.isArray(s.target_ids)) {
           for (const tid of s.target_ids) if (tid) candidateWabas.push(String(tid));
         } else if (s.scope === 'whatsapp_business_messaging' && Array.isArray(s.target_ids)) {
           for (const tid of s.target_ids) if (tid) candidatePhones.push(String(tid));
         } else if (Array.isArray(s.target_ids)) {
           for (const tid of s.target_ids) if (tid) otherCandidates.push(String(tid));
         }
       }

       const allCandidates = Array.from(new Set([...candidatePhones, ...candidateWabas, ...otherCandidates]));

       for (const cid of allCandidates) {
         if (targetWaba && targetPhone) break;
         if (!targetPhone) {
           try {
             const pCheck: any = await this.providers.meta(
               `${cid}?fields=id,display_phone_number,whatsapp_business_account`,
               'GET',
               undefined,
               accessToken
             );
             if (pCheck?.id && pCheck?.whatsapp_business_account?.id) {
               targetPhone = String(pCheck.id);
               targetWaba = targetWaba || String(pCheck.whatsapp_business_account.id);
               continue;
             }
           } catch {}
         }

         if (!targetWaba) {
           try {
             const wCheck: any = await this.providers.meta(
               `${cid}?fields=id,name,phone_numbers{id,display_phone_number,verified_name}`,
               'GET',
               undefined,
               accessToken
             );
             if (wCheck?.id) {
               targetWaba = String(wCheck.id);
               if (!targetPhone && wCheck.phone_numbers?.data?.length) {
                 targetPhone = String(wCheck.phone_numbers.data[0].id);
               }
             }
           } catch {}
         }
       }

       if (!targetWaba && candidateWabas.length > 0) targetWaba = candidateWabas[0];
       if (!targetPhone && candidatePhones.length > 0) targetPhone = candidatePhones[0];
     } catch (err: any) {
       console.warn('[MetaOnboarding] debug_token resolution error:', err?.message || err);
     }
   }

   // 3. Resolve phone numbers from the discovered WABA with Eventual Consistency Retry
   if (targetWaba && !targetPhone) {
     for (let attempt = 0; attempt < 3; attempt++) {
       try {
         const phoneList: any = await this.providers.meta(
           `${targetWaba}/phone_numbers?fields=id,display_phone_number,verified_name&limit=20`,
           'GET',
           undefined,
           accessToken
         );
         if (phoneList?.data?.length) {
           targetPhone = String(phoneList.data[0].id);
           console.info('[MetaOnboarding] Discovered phone number from WABA phone_numbers on attempt', attempt + 1, ':', targetPhone);
           break;
         }
       } catch (err: any) {
         console.warn('[MetaOnboarding] WABA phone_numbers query attempt', attempt + 1, 'failed:', err?.message || err);
       }

       if (!targetPhone) {
         try {
           const wabaObj: any = await this.providers.meta(
             `${targetWaba}?fields=phone_numbers{id,display_phone_number,verified_name}`,
             'GET',
             undefined,
             accessToken
           );
           if (wabaObj?.phone_numbers?.data?.length) {
             targetPhone = String(wabaObj.phone_numbers.data[0].id);
             console.info('[MetaOnboarding] Discovered phone number from WABA node query on attempt', attempt + 1, ':', targetPhone);
             break;
           }
         } catch (err: any) {
           console.warn('[MetaOnboarding] WABA node query attempt', attempt + 1, 'failed:', err?.message || err);
         }
       }

       if (attempt < 2 && !targetPhone) {
         await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
       }
     }
   }

   // 4. detectWaba fallback
   if (!targetWaba || !targetPhone) {
     try {
       const detected = await this.connections.detectWaba(actor, { access_token: accessToken });
       if (detected) {
         targetWaba = targetWaba || detected.waba_id;
         if (!targetPhone && detected.phone_numbers?.length) {
           targetPhone = String(detected.phone_numbers[0].id);
         }
       }
     } catch (err: any) {
       console.warn('[MetaOnboarding] detectWaba fallback failed:', err?.message || err);
     }
   }

   // 5. Direct user businesses and accounts query fallback
   if (!targetWaba || !targetPhone) {
     try {
       const meRes = await this.providers.meta(
         'me?fields=id,name,businesses{id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}}',
         'GET',
         undefined,
         accessToken
       );
       const businesses = meRes?.businesses?.data || [];
       for (const b of businesses) {
         const wabas = [...(b.owned_whatsapp_business_accounts?.data || []), ...(b.client_whatsapp_business_accounts?.data || [])];
         for (const w of wabas) {
           targetWaba = targetWaba || String(w.id);
           if (!targetPhone && w.phone_numbers?.data?.length) {
             targetPhone = String(w.phone_numbers.data[0].id);
             break;
           }
         }
         if (targetWaba && targetPhone) break;
       }
     } catch (err: any) {
       console.warn('[MetaOnboarding] me/businesses fallback failed:', err?.message || err);
     }
   }

   // 6. Direct me/whatsapp_business_accounts query fallback
   if (!targetWaba || !targetPhone) {
     try {
       const wabaAccounts: any = await this.providers.meta('me/whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}', 'GET', undefined, accessToken);
       if (wabaAccounts?.data?.length) {
         const firstAccount = wabaAccounts.data[0];
         targetWaba = targetWaba || String(firstAccount.id);
         if (!targetPhone && firstAccount.phone_numbers?.data?.length) {
           targetPhone = String(firstAccount.phone_numbers.data[0].id);
         }
       }
     } catch (err: any) {
       console.warn('[MetaOnboarding] me/whatsapp_business_accounts fallback failed:', err?.message || err);
     }
   }

   if (!targetWaba || !targetPhone) {
     throw new ApiError(422, 'Could not determine WABA or Phone Number ID. Please specify them manually.');
   }

   const connection = await this.connections.connect(actor, {
     name: input.name,
     waba_id: targetWaba,
     phone_number_id: targetPhone,
     access_token: accessToken,
     connection_mode: input.connection_mode,
     is_on_biz_app: input.is_on_biz_app,
     business_id: input.business_id
   });

   // Auto-subscribe WABA to Meta Webhook events including phone_number_name_update
   try {
     await this.providers.meta(
       `${targetWaba}/subscribed_apps`,
       'POST',
       { subscribed_fields: ['messages', 'messaging_postbacks', 'message_template_status_update', 'phone_number_name_update', 'phone_number_quality_update', 'account_update', 'business_capability_update'] },
       accessToken
     );
     await this.db.query('UPDATE meta_connections SET subscribed=true WHERE id=$1', [connection.id]);
   } catch {
     try {
       await this.providers.meta(`${targetWaba}/subscribed_apps`, 'POST', {}, accessToken);
       await this.db.query('UPDATE meta_connections SET subscribed=true WHERE id=$1', [connection.id]);
     } catch {}
   }

   await this.db.query("UPDATE meta_onboarding_sessions SET status='completed',connection_id=$2,completed_at=now() WHERE id=$1",[id,connection.id]);
   await this.db.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.onboarding.completed',$3)",[actor.tenant_id,actor.id,String(connection.id)]);
   return connection;
  }catch(err: any){
   const msg = (err && err.message) || 'Connection could not be verified. Start signup again or reconnect an existing number.';
   await this.db.query("UPDATE meta_onboarding_sessions SET status='failed',error=$2 WHERE id=$1",[id, (typeof msg === 'string' ? msg : JSON.stringify(msg)).slice(0, 500)]).catch(() => {});
   throw (err && err.statusCode ? err : new ApiError(422, msg));
  }
 }
}