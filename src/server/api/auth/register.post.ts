import { registerCliente } from '~/server/auth';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Método no permitido',
    });
  }

  const body = await readBody(event);
  const {
    tipo_cliente,
    documento_tipo,
    documento_numero,
    nombres,
    apellido_paterno,
    apellido_materno,
    ruc,
    razon_social,
    telefono,
    correo,
    password,
  } = body;

  // Validaciones básicas
  if (!tipo_cliente || !documento_tipo || !documento_numero || !correo || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan campos requeridos',
    });
  }

  if (tipo_cliente === 'individual') {
    if (!nombres || !apellido_paterno) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Para clientes individuales se requieren nombres y apellidos',
      });
    }
  } else if (tipo_cliente === 'empresa') {
    if (!ruc || !razon_social) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Para empresas se requieren RUC y razón social',
      });
    }
  }

  const result = await registerCliente({
    tipo_cliente,
    documento_tipo,
    documento_numero,
    nombres,
    apellido_paterno,
    apellido_materno,
    ruc,
    razon_social,
    telefono,
    correo,
    password,
  });

  if (!result) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al registrar el cliente',
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
