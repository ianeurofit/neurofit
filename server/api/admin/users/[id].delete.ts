import { requireSuperuser } from '~~/server/utils/adminGuard'

export default defineEventHandler(async (event) => {
  const { admin, user } = await requireSuperuser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identificador requerido' })
  }

  if (id === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'No puedes eliminar tu propia cuenta' })
  }

  // El perfil se elimina en cascada junto con auth.users
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { ok: true }
})
