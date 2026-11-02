import { Request, Response } from 'express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'KRAD Chat Platform API',
    version: '1.0.0',
    description: 'Enterprise WhatsApp Business Cloud API & Omnichannel Messaging Platform API Documentation. Use Bearer authorization to test protected endpoints directly.',
    contact: {
      name: 'KRAD Technologies Support',
      url: 'https://kradchat.in/'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API Base'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token or API Key (krad_...)'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: false },
          code: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
          outtime: { type: 'string', format: 'date-time' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: true },
          code: { type: 'integer', example: 401 },
          message: { type: 'string', example: 'Session expired or invalid.' },
          correlation_id: { type: 'string', format: 'uuid' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@platform.test' },
          password: { type: 'string', format: 'password', example: 'Password123!' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'admin@platform.test' },
          role: { type: 'string', example: 'admin' },
          access_token: { type: 'string', description: 'JWT Access Token' },
          refresh_token: { type: 'string', description: 'Token rotation secret' },
          ask_for_otp: { type: 'boolean', example: false }
        }
      }
    }
  },
  paths: {
    '/login': {
      post: {
        summary: 'Authenticate User & Issue JWT Session',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/LoginResponse' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials or expired account',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate Session & Issue Fresh Access Token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refresh_token'],
                properties: {
                  refresh_token: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Token refreshed successfully' },
          '401': { description: 'Refresh token invalid or expired' }
        }
      }
    },
    '/dashboard': {
      get: {
        summary: 'Retrieve Executive Platform Analytics & Metrics',
        tags: ['Analytics & Operations'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Platform metrics returned successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          },
          '401': { description: 'Unauthorized or session expired' }
        }
      },
      post: {
        summary: 'Retrieve Executive Platform Analytics (POST Compatibility)',
        tags: ['Analytics & Operations'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Platform metrics returned successfully' }
        }
      }
    },
    '/unread-notification-count': {
      get: {
        summary: 'Get Unread Notifications Count',
        tags: ['Notifications'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Unread count' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/notifications': {
      get: {
        summary: 'List In-App Notifications',
        tags: ['Notifications'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'per_page_record', in: 'query', schema: { type: 'integer', default: 15 } }
        ],
        responses: {
          '200': { description: 'Notifications list' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/whatsapp/connections': {
      get: {
        summary: 'List Registered WhatsApp Business Channels',
        tags: ['WhatsApp Cloud API'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Active WhatsApp connections' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'System Liveness & Readiness Healthcheck',
        tags: ['System Health'],
        responses: {
          '200': {
            description: 'Service operational',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'krad-chat' },
                    timestamp: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function renderSwaggerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KRAD Chat API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://kradchat.netlify.app/favicon.svg" />
  <style>
    body { margin: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui { color: #f8fafc; }
    .swagger-ui .info .title { color: #38bdf8; }
    .swagger-ui .scheme-container { background: #1e293b; box-shadow: none; border-bottom: 1px solid #334155; }
    .swagger-ui .opblock.opblock-post { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
    .swagger-ui .opblock.opblock-get { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; }
    .swagger-ui .btn.authorize { color: #10b981; border-color: #10b981; }
    .swagger-ui .btn.authorize svg { fill: #10b981; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/docs.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
}

export function handleDocsJson(_req: Request, res: Response): void {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(openApiSpec);
}

export function handleDocsUi(_req: Request, res: Response): void {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(renderSwaggerHtml());
}
