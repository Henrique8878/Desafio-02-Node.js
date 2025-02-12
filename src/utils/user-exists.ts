import { db } from '../database'

export async function UserExists(reply, id) {
  const userExists = await db('users').where('id', id).select()
  if (!userExists) {
    reply.status(401).send({
      Error: `Não foi possível deletar este usuário. Id não encontrado na base de dados`,
    })
  }
}
