import 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string(),
  SUPABASE_SERVICE_ROLE: z.string(),
  SUPABASE_URL: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
