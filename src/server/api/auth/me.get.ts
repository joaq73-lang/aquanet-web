import { optionalAuth } from '~/server/auth';

export default defineEventHandler(async (event) => {
  const auth = optionalAuth(event);

  if (!auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autenticado',
    });
  }

  return {
    autenticado: true,
    usuario: {
      codigo_usuario: auth.usuario.codigo_usuario,
      codigo_cliente: auth.codigo_cliente,
      email: auth.usuario.email,
      nombre_completo: auth.usuario.nombre_completo,
    },
  };
});
