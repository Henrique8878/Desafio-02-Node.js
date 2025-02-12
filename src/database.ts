import knex from 'knex'
import { env } from './env/env-zod'

export const config: knex.Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './tmp/migrations',
  },
}

export const db = knex(config)
