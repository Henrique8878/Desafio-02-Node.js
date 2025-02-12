import { FastifyRequest, FastifyReply } from 'fastify'
import * as zod from 'zod'
import { db } from '../database'

export async function BodyTreatment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const dietSchema = zod.object({
    name: zod.string(),
    description: zod.string(),
    isDiet: zod.string(),
  })

  const paramsSchema = zod.object({
    id: zod.string().uuid(),
  })

  const params = paramsSchema.parse(request.params)
  const { id } = params

  const existId = await db('users').where('id', `${id}`).first()

  if (!existId) {
    return reply.status(401).send({
      error: 'Este usuário não existe. Cadastre-se primeiro e depois retorne!',
    })
  }

  const body = dietSchema.parse(request.body)

  return {
    name: body.name,
    description: body.description,
    isDiet: body.isDiet,
    id,
  }
}
