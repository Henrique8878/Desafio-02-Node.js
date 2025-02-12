import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../database'
import { randomUUID } from 'node:crypto'
import { VerifyCookie } from '../middlewares/verify-cookie'
import { BodyTreatment } from '../utils/body-treatment'
import { CaptureID } from '../utils/capture-id'
import { UserExists } from '../utils/user-exists'
import * as zod from 'zod'

interface ArrayMeal {
  diet_id: string
  name: string
  description: string
  created_at: string
  isDiet: string
  user_id: string
}

type TypeArrayMeal = ArrayMeal[]

export async function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userSchema = zod.object({
      name: zod.string(),
    })

    const body = userSchema.parse(request.body)

    const { name } = body

    let sessionId = request.cookies.session_id

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('session_id', sessionId, {
        path: '/',
        maxAge: 1 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await db('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    reply.status(201).send('Create User')
  })

  app.get('/', async (request, reply) => {
    const users = await db('users').select()
    await reply.status(200).send(users)
  })

  app.delete('/:id', async (request, reply) => {
    const id = await CaptureID(request)

    await UserExists(reply, id)
    await db('users').where('id', id).del()
    reply.status(200).send('Usuário deletado')
  })

  app.get('/:id/metrics', async (request, reply) => {
    const id = await CaptureID(request)
    await UserExists(reply, id)
    const countMeal = await db('diets').where('user_id', id).count().first()
    const countMealIsTrue = await db('diets')
      .first()
      .where({
        user_id: id,
        isDiet: 'true',
      })
      .count()
    const countMealIsFalse = await db('diets')
      .where({
        user_id: id,
        isDiet: 'false',
      })
      .count()
      .first()

    const arrayMeal: TypeArrayMeal = await db('diets').where('user_id', id)
    const decrescArraySort = arrayMeal.sort((a, b) =>
      a.isDiet.localeCompare(b.isDiet),
    )

    const countSequenceIsDietTrue = decrescArraySort.reduce(
      (accumulator, item) => {
        if (item.isDiet === 'true') {
          accumulator += 1
        }
        return accumulator
      },
      0,
    )

    reply.status(200).send({
      countMeal: Number(countMeal && countMeal['count(*)']),
      countMealIsTrue: Number(countMealIsTrue && countMealIsTrue['count(*)']),
      countMealIsFalse: Number(
        countMealIsFalse && countMealIsFalse['count(*)'],
      ),
      countSequenceIsDietTrue,
    })
  })

  app.post(
    '/diet/:id',
    { preHandler: VerifyCookie },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await BodyTreatment(request, reply)

      await db('diets').insert({
        diet_id: randomUUID(),
        name: data.name,
        description: data.description,
        isDiet: data.isDiet,
        user_id: data.id,
      })

      reply.status(201).send('Create Diet')
    },
  )

  app.get('/diet', async (request, reply) => {
    const diets = await db('diets').select()
    reply.status(200).send(diets)
  })

  app.put('/diet/:id', async (request, reply) => {
    const dietSchema = zod.object({
      name: zod.string(),
      description: zod.string(),
      isDiet: zod.string(),
    })

    const { name, description, isDiet } = dietSchema.parse(request.body)

    const id = await CaptureID(request)
    const dietExists = await db('diets').where('diet_id', id).select()
    if (!dietExists) {
      reply.status(401).send({
        error: `Esta dieta não foi cadastrada e, portanto, não pode ser atualizada`,
      })
    }

    await db('diets').where('diet_id', `${id}`).update({
      name,
      description,
      isDiet,
    })
  })

  app.delete('/diet/:id', async (request, reply) => {
    const id = await CaptureID(request)
    await db('diets').where('diet_id', id).del()

    reply.status(200).send('Dieta deletada')
  })

  app.get('/diet/diet_user/:id', async (request, reply) => {
    const id = await CaptureID(request)

    const responseGetUserDiet = await db('diets').where('user_id', id).select()
    reply.status(200).send(responseGetUserDiet)
  })

  app.get('/diet/:id', async (request, reply) => {
    const id = await CaptureID(request)
    console.log(id)
    const UniqueDiet = await db('diets').where('diet_id', id).select()
    reply.status(200).send(UniqueDiet)
  })
}
