import { fastify } from 'fastify'
import { UsersRoutes } from './routes/users-routes.ts'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)
app.register(UsersRoutes, {
  prefix: '/users',
})
