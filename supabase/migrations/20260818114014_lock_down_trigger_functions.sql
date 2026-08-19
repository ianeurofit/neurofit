-- Las funciones de trigger no deben ser invocables por la API publica
revoke execute on function public.handle_new_user () from public, anon, authenticated;
revoke execute on function public.guard_profile_privileges () from public, anon, authenticated;
revoke execute on function public.handle_updated_at () from public, anon, authenticated;
