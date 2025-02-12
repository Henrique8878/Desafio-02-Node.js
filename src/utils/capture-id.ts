import { FastifyRequest } from 'fastify'
import * as zod from 'zod'

export async function CaptureID(request: FastifyRequest) {
  const captureIdSchema = zod.object({
    id: zod.string().uuid(),
  })

  const params = captureIdSchema.parse(request.params)

  const { id } = params
  return id
}
