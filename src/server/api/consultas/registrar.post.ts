import { query } from '~/server/db';
import { requireAuth } from '~/server/auth';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Método no permitido',
    });
  }

  const auth = requireAuth(event);

  if (!auth.codigo_cliente) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado',
    });
  }

  const body = await readBody(event);
  const { asunto, descripcion } = body;

  if (!asunto || !descripcion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Asunto y descripción son requeridos',
    });
  }

  try {
    const result = await query(
      `INSERT INTO consulta (codigo_cliente, asunto, descripcion, estado_consulta)
       VALUES ($1, $2, $3, 'registrada')
       RETURNING *`,
      [auth.codigo_cliente, asunto, descripcion]
    );

    return {
      success: true,
      consulta: {
        codigo_consulta: result.rows[0].codigo_consulta,
        fecha_registro: result.rows[0].fecha_registro_consulta,
        estado: result.rows[0].estado_consulta,
      },
    };
  } catch (error) {
    console.error('Error registrando consulta:', error);
    throw error;
  }
});
