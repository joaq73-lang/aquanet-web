import { login } from '~/server/auth';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Método no permitido',
    });
  }

  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email y contraseña son requeridos',
    });
  }

  const result = await login(email, password);

  if (!result) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas',
    });
  }

  return {
    success: true,
    token: result.token,
    usuario: {
      codigo_usuario: result.user.codigo_usuario,
      codigo_cliente: result.user.codigo_cliente,
      email: result.user.email,
      nombre_completo: result.user.nombre_completo,
    },
  };
});
