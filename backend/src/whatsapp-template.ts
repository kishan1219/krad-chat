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

export const buttonComponentSchema = z.object({
  type: z.literal('button'),
  sub_type: z.enum(['quick_reply', 'url', 'catalog']).optional(),
  index: z.union([z.string(), z.number()]),
  parameters: z.array(z.record(z.string(), z.any())).optional()
});

export const carouselCardComponentSchema = z.union([
  headerComponentSchema,
  bodyComponentSchema,
  buttonComponentSchema
]);

export const carouselCardSchema = z.object({
  card_index: z.number().int().min(0).max(9),
  components: z.array(carouselCardComponentSchema).min(1).max(10)
});

export const carouselComponentSchema = z.object({
  type: z.literal('carousel'),
  cards: z.array(carouselCardSchema).min(1).max(10)
});

export const templateComponentSchema = z.union([
  headerComponentSchema,
  bodyComponentSchema,
  carouselComponentSchema,
  buttonComponentSchema
]);

export const templateMessageSchema = z.object({
  name: z.string().regex(/^[a-z0-9_]{1,512}$/),
  language: z.object({ code: z.string().regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/) }),
  components: z.array(templateComponentSchema).max(15).optional()
});
