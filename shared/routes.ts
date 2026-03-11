import { z } from 'zod';
import { generateResponseSchema, parseResponseSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  })
};

export const api = {
  coversheets: {
    parse: {
      method: 'POST' as const,
      path: '/api/parse' as const,
      responses: {
        200: parseResponseSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/generate' as const,
      responses: {
        200: generateResponseSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  templates: {
    list: {
      method: 'GET' as const,
      path: '/api/templates' as const,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
