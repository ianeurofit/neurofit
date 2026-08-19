import { requireSuperuser, assertRole } from '~~/server/utils/adminGuard'

interface Body {
  full_name?: string
  role?: string
  is_active?: boolean
  password?: string
}

export default defineEventHandler(async (event) => {
  const { admin, user } = await requireSuperuser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identificador requerido' })
  }

  const body = await readBody<Body>(event)
  const updates: Record<string, unknown> = {}

  if (body.full_name !== undefined) updates.full_name = body.full_name.trim()
  if (body.role !== undefined) updates.role = assertRole(body.role)
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)

  // Nadie puede quitarse a si mismo el rol de superusuario ni desactivarse
  if (id === user.id && updates.role !== undefined && updates.role !== 'superuser') {
    throw createError({ statusCode: 400, statusMessage: 'No puedes cambiar tu propio rol de superusuario' })
  }

  if (id === user.id && updates.is_active === false) {
    throw createError({ statusCode: 400, statusMessage: 'No puedes desactivar tu propia cuenta' })
  }

  if (body.password) {
    if (body.password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'La contrasena debe tener al menos 8 caracteres' })
    }
    const { error } = await admin.auth.admin.updateUserById(id, { password: body.password })
    if (error) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
  }

  if (!Object.keys(updates).length) {
    return { ok: true }
  }

  const { data, error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { profile: data }
})
