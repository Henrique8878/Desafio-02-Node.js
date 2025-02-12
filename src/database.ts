import knex from 'knex'
import { env } from './env/env-zod'

export const config: knex.Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './tmp/migrations',
  },
}

export const db = knex(config)
