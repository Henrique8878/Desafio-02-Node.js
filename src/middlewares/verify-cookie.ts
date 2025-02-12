import { FastifyReply, FastifyRequest } from 'fastify'

export async function VerifyCookie(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const cookie = request.cookies.session_id

  if (!cookie) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
