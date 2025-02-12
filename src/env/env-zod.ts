import * as zod from 'zod'
import { config } from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = zod.object({
  NODE_ENV: zod
    .enum(['development', 'test', 'production'])
    .default('production'),
  DATABASE_CLIENT: zod.enum(['sqlite', 'pg']),
  DATABASE_URL: zod.string(),
  DATABASE_PORT: zod.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  throw new Error('error in environment variables')
}

export const env = _env.data
