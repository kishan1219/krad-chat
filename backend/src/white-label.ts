import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError } from './common';
import { Db } from './db';

const whiteLabelInputSchema = z.object({
  domain: z.string().min(3).max(255).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format').optional().nullable(),
  company_name: z.string().min(1).max(200).default('Messaging Platform'),
  logo_url: z.string().url().max(1000).optional().nullable(),
  favicon_url: z.string().url().max(1000).optional().nullable(),
  primary_color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').default('#25D366'),
  accent_color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').default('#128C7E'),
  email_sender_name: z.string().min(1).max(100).default('Support'),
  support_email: z.string().email().max(255).default('support@messaging.test'),
  email_footer: z.string().max(1000).optional().nullable(),
  custom_css: z.string().max(10000).optional().nullable(),
});

export class WhiteLabel {
  constructor(private db: Db) {}

  async get(actor: Actor) {
    const row = (await this.db.query(
      'SELECT * FROM white_label_configs WHERE tenant_id=$1',
      [actor.tenant_id]
    )).rows[0];

    if (!row) {
      return {
        tenant_id: actor.tenant_id,
        domain: null,
        company_name: 'Messaging Platform',
        logo_url: null,
        favicon_url: null,
        primary_color: '#25D366',
        accent_color: '#128C7E',
        email_sender_name: 'Support',
        support_email: 'support@messaging.test',
        email_footer: null,
        custom_css: null,
      };
    }
    return row;
  }

  async update(actor: Actor, body: any) {
    if (!['admin', 'reseller'].includes(actor.role)) {
      throw new ApiError(403, 'Only administrators and resellers can configure white-label branding.');
    }
    const input = whiteLabelInputSchema.parse(body);

    if (input.domain) {
      const existing = (await this.db.query(
        'SELECT tenant_id FROM white_label_configs WHERE domain=$1 AND tenant_id != $2',
        [input.domain.toLowerCase(), actor.tenant_id]
      )).rows[0];
      if (existing) {
        throw new ApiError(409, 'Domain is already registered by another organization.');
      }
    }

    const row = (await this.db.query(
      `INSERT INTO white_label_configs(
         tenant_id, reseller_id, domain, company_name, logo_url, favicon_url,
         primary_color, accent_color, email_sender_name, support_email, email_footer, custom_css, updated_at
       ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
       ON CONFLICT (tenant_id)
       DO UPDATE SET
         reseller_id=EXCLUDED.reseller_id,
         domain=EXCLUDED.domain,
         company_name=EXCLUDED.company_name,
         logo_url=EXCLUDED.logo_url,
         favicon_url=EXCLUDED.favicon_url,
         primary_color=EXCLUDED.primary_color,
         accent_color=EXCLUDED.accent_color,
         email_sender_name=EXCLUDED.email_sender_name,
         support_email=EXCLUDED.support_email,
         email_footer=EXCLUDED.email_footer,
         custom_css=EXCLUDED.custom_css,
         updated_at=now()
       RETURNING *`,
      [
        actor.tenant_id,
        actor.id,
        input.domain ? input.domain.toLowerCase() : null,
        input.company_name,
        input.logo_url || null,
        input.favicon_url || null,
        input.primary_color,
        input.accent_color,
        input.email_sender_name,
        input.support_email,
        input.email_footer || null,
        input.custom_css || null,
      ]
    )).rows[0];

    return row;
  }

  async resolvePublic(domainOrHost?: string) {
    if (!domainOrHost) {
      return {
        company_name: 'Messaging Platform',
        logo_url: null,
        favicon_url: null,
        primary_color: '#25D366',
        accent_color: '#128C7E',
        email_sender_name: 'Support',
        support_email: 'support@messaging.test',
      };
    }

    const cleanedDomain = domainOrHost.split(':')[0].toLowerCase();
    const row = (await this.db.query(
      `SELECT company_name, logo_url, favicon_url, primary_color, accent_color, email_sender_name, support_email, custom_css
       FROM white_label_configs
       WHERE domain=$1`,
      [cleanedDomain]
    )).rows[0];

    if (!row) {
      return {
        company_name: 'Messaging Platform',
        logo_url: null,
        favicon_url: null,
        primary_color: '#25D366',
        accent_color: '#128C7E',
        email_sender_name: 'Support',
        support_email: 'support@messaging.test',
      };
    }
    return row;
  }
}
