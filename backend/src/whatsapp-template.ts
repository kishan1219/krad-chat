import { z } from 'zod';

export const headerParameterSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1).max(2000)
  }),
  z.object({
    type: z.literal('image'),
    image: z.object({
      link: z.string().url().max(2048).optional(),
      id: z.string().max(256).optional()
    }).refine(v => Boolean(v.link || v.id), { message: 'Image header must specify link or id.' })
  }),
  z.object({
    type: z.literal('document'),
    document: z.object({
      link: z.string().url().max(2048).optional(),
      id: z.string().max(256).optional(),
      filename: z.string().max(255).optional()
    }).refine(v => Boolean(v.link || v.id), { message: 'Document header must specify link or id.' })
  }),
  z.object({
    type: z.literal('video'),
    video: z.object({
      link: z.string().url().max(2048).optional(),
      id: z.string().max(256).optional()
    }).refine(v => Boolean(v.link || v.id), { message: 'Video header must specify link or id.' })
  }),
  z.object({
    type: z.literal('audio'),
    audio: z.object({
      link: z.string().url().max(2048).optional(),
      id: z.string().max(256).optional()
    }).refine(v => Boolean(v.link || v.id), { message: 'Audio header must specify link or id.' })
  })
]);

export const headerComponentSchema = z.object({
  type: z.literal('header'),
  parameters: z.array(headerParameterSchema).min(1).max(5)
});

export const bodyComponentSchema = z.object({
  type: z.literal('body'),
  parameters: z.array(z.object({
    type: z.literal('text'),
    text: z.string().min(1).max(2000)
  })).max(30)
});

export const templateMessageSchema = z.object({
  name: z.string().regex(/^[a-z0-9_]{1,512}$/),
  language: z.object({ code: z.string().regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/) }),
  components: z.array(z.union([headerComponentSchema, bodyComponentSchema])).max(3).optional()
});
