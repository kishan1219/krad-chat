import { z } from 'zod';
import { idSchema } from './common';

/**
 * Centralized Request Payload Schemas
 * Enforces strict input validation on all API endpoints.
 */

export const organizationStatusUpdateSchema = z.object({
  tenant_id: z.coerce.number().int().positive().optional(),
  tenantId: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending', 'active', 'suspended', 'closed']),
  reason: z.string().trim().max(500).optional()
}).refine(data => data.tenant_id !== undefined || data.tenantId !== undefined, {
  message: 'tenant_id or tenantId is required'
});

export const featureFlagToggleSchema = z.object({
  featureKey: z.string().trim().min(1).max(100),
  enabled: z.boolean(),
  tenantId: z.coerce.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const repushCampaignSchema = z.object({
  campaign_id: z.coerce.number().int().positive().optional(),
  send_sms_id: z.coerce.number().int().positive().optional(),
  idempotency_key: z.string().max(255).optional()
}).refine(data => data.campaign_id !== undefined || data.send_sms_id !== undefined, {
  message: 'campaign_id or send_sms_id is required'
});

export const resendMessageSchema = z.object({
  campaign_id: idSchema,
  message_id: idSchema.optional(),
  idempotency_key: z.string().max(255).optional()
});

export const stopCampaignSchema = z.object({
  campaign_id: z.coerce.number().int().positive().optional(),
  send_sms_id: z.coerce.number().int().positive().optional(),
  voice_sms_id: z.coerce.number().int().positive().optional()
}).refine(data => data.campaign_id !== undefined || data.send_sms_id !== undefined || data.voice_sms_id !== undefined, {
  message: 'A valid campaign identifier is required'
});

export const assignPlanSchema = z.object({
  tenant_id: idSchema,
  plan_id: idSchema
});

export const paymentOrderRequestSchema = z.object({
  amount_paise: z.number().int().min(100).max(10_000_000)
});

export const devIncomingMessageSchema = z.object({
  phone: z.string().min(5).max(30),
  message: z.string().max(10_000)
});
