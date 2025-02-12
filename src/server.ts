import { app } from './app'
import { env } from './env/env-zod'

app
  .listen({
    port: env.DATABASE_PORT,
    host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
  })
  .then(() => {
    console.log('Http server running')
  })
  .catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
  })
