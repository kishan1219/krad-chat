import {z} from 'zod';
export const templateMessageSchema=z.object({
 name:z.string().regex(/^[a-z0-9_]{1,512}$/),language:z.object({code:z.string().regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/)}),
 components:z.array(z.object({type:z.literal('body'),parameters:z.array(z.object({type:z.literal('text'),text:z.string().min(1).max(2000)})).max(30)})).max(1).optional()
});
