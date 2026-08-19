import { requireSuperuser, assertRole } from '~~/server/utils/adminGuard'

interface Body {
  email?: string
  password?: string
  full_name?: string
  role?: string
  is_active?: boolean
}

export default defineEventHandler(async (event) => {
  const { admin } = await requireSuperuser(event)
  const body = await readBody<Body>(event)

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const fullName = body.full_name?.trim() ?? ''
  const role = assertRole(body.role)

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Correo invalido' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'La contrasena debe tener al menos 8 caracteres' })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data.user) {
    throw createError({ statusCode: 400, statusMessage: error?.message ?? 'No se pudo crear el usuario' })
  }

  // El trigger crea el perfil con rol 'user'; el superusuario define el rol real.
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .update({
      full_name: fullName,
      role,
      is_active: body.is_active ?? true,
    })
    .eq('id', data.user.id)
    .select()
    .single()

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    throw createError({ statusCode: 500, statusMessage: 'No se pudo asignar el rol, se revirtio la creacion' })
  }

  return { profile }
})
