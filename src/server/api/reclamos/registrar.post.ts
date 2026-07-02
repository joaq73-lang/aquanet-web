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
  const { codigo_suministro, tipo_reclamo, descripcion } = body;

  if (!tipo_reclamo || !descripcion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipo de reclamo y descripción son requeridos',
    });
  }

  try {
    // Verificar que el suministro pertenezca al cliente si se proporciona
    if (codigo_suministro) {
      const suministroCheck = await query(
        `SELECT codigo_suministro FROM suministro 
         WHERE codigo_suministro = $1 AND codigo_cliente = $2`,
        [codigo_suministro, auth.codigo_cliente]
      );

      if (suministroCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Suministro no encontrado o no pertenece al cliente',
        });
      }
    }

    const result = await query(
      `INSERT INTO reclamo (codigo_cliente, codigo_suministro, tipo_reclamo, descripcion, estado_reclamo)
       VALUES ($1, $2, $3, $4, 'registrado')
       RETURNING *`,
      [auth.codigo_cliente, codigo_suministro || null, tipo_reclamo, descripcion]
    );

    return {
      success: true,
      reclamo: {
        codigo_reclamo: result.rows[0].codigo_reclamo,
        fecha_registro: result.rows[0].fecha_registro_reclamo,
        tipo_reclamo: result.rows[0].tipo_reclamo,
        estado: result.rows[0].estado_reclamo,
      },
    };
  } catch (error) {
    console.error('Error registrando reclamo:', error);
    throw error;
  }
});
