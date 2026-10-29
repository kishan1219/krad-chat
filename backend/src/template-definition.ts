import { z } from 'zod';
import { ApiError } from './common';

export function templateDefinition(body:unknown) {
 const input=z.object({name:z.string().regex(/^[a-z][a-z0-9_]{0,511}$/),language:z.string().regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/),category:z.enum(['UTILITY','MARKETING']),text:z.string().trim().min(1).max(1024),examples:z.array(z.string().trim().min(1).max(200)).max(20).default([]),header:z.string().trim().max(60).default(''),footer:z.string().trim().max(60).default('')}).strict().parse(body);
 const matches=[...input.text.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1]));
 const parameters=[...new Set(matches)].sort((a,b)=>a-b);
 if(input.text.replace(/\{\{\d+\}\}/g,'').match(/[{}]/)||parameters.some((n,i)=>n!==i+1)||parameters.length!==input.examples.length)throw new ApiError(422,'Use consecutive placeholders {{1}}, {{2}} and supply one example per placeholder.');
 if(/[{}]/.test(input.header+input.footer))throw new ApiError(422,'Header and footer must be static text.');
 const components:any[]=[];
 if(input.header)components.push({type:'HEADER',format:'TEXT',text:input.header});
 components.push({type:'BODY',text:input.text,...(parameters.length?{example:{body_text:[input.examples]}}:{})});
 if(input.footer)components.push({type:'FOOTER',text:input.footer});
 return {name:input.name,language:input.language,category:input.category,components};
}
