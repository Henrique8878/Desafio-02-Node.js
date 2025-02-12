import { test, describe, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import supertest from 'supertest'
import { app } from '../app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(async () => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
})

describe('test users and diets routes', () => {
  test('It must be possible to register a user and generate an authentication cookie in the application', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Henrique',
      })
      .expect(201)
  })

  test('it must be possible to list a users', async () => {
    await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })
    const response = await supertest(app.server).get('/users')
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        name: 'Henrique',
      }),
    )
  })

  test('it must be possible to delete a user', async () => {
    await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const response = await supertest(app.server).get('/users')
    const { id } = response.body[0]
    await supertest(app.server).delete(`/users/${id}`).expect(200)
  })

  test('it must be possible to create a diet from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })
      .expect(201)
  })

  test('it must be a possible to list all diets from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    const responseDiet = await supertest(app.server).get('/users/diet')
    expect(responseDiet.body[0]).toEqual(
      expect.objectContaining({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      }),
    )
  })

  test('it must be a possible to list a unique diet from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    const responseGetDiet = await supertest(app.server).get('/users/diet')
    const dietId = responseGetDiet.body[0].diet_id
    const responseUniqueDiet = await supertest(app.server).get(
      `/users/diet/${dietId}`,
    )

    expect(responseUniqueDiet.body[0]).toEqual(
      expect.objectContaining({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      }),
    )
  })

  test('it must be a possible to delete a diet from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    const responseGetDiet = await supertest(app.server).get('/users/diet')
    const dietId = responseGetDiet.body[0].diet_id

    await supertest(app.server).delete(`/users/diet/${dietId}`).expect(200)
  })

  test('it must be possible to list all diets from a unique user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Almoço',
        description: '300 gramas de arroz branco e 300 gramas de frango',
        isDiet: 'true',
      })

    await supertest(app.server).get(`/users/diet/diet_user/${id}`).expect(200)
  })

  test('it must be possible to update a diet from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    const responseGetDiet = await supertest(app.server).get('/users/diet')
    const dietId = responseGetDiet.body[0].diet_id

    await supertest(app.server)
      .put(`/users/diet/${dietId}`)
      .send({
        name: 'Jantar',
        description: '400 gramas de sopa de legumes com bacon sem caldo',
        isDiet: 'false',
      })
      .expect(200)
  })

  test('it mus be possible list all metrics from user', async () => {
    const returningPost = await supertest(app.server).post('/users').send({
      name: 'Henrique',
    })

    const cookie = returningPost.get('Set-Cookie')

    if (!cookie) {
      throw new Error()
    }

    const response = await supertest(app.server).get('/users')

    const { id } = response.body[0]

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: '1 Pão inteiro + 3 ovos inteiros',
        isDiet: 'true',
      })

    await supertest(app.server)
      .post(`/users/diet/${id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Almoço',
        description: '300 gramas de arroz branco e 300 gramas de frango',
        isDiet: 'true',
      })

    await supertest(app.server).get(`/users/${id}/metrics`).expect(200)
  })
})
