import { app } from './app'
import { env } from './env/env-zod'

app
  .listen({
    port: env.DATABASE_PORT,
  })
  .then(() => {
    console.log('Http server running')
  })
  .catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
  })
