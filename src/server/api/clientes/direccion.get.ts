import { query } from '~/server/db';
import { requireAuth } from '~/server/auth';

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);

  if (!auth.codigo_cliente) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado',
    });
  }

  try {
    const result = await query(
      `SELECT d.*
       FROM direccion d
       WHERE d.codigo_cliente = $1`,
      [auth.codigo_cliente]
    );

    return {
      direccion: result.rows.length > 0 ? {
        codigo_direccion: result.rows[0].codigo_direccion,
        ubigeo: result.rows[0].ubigeo,
        tipo_via: result.rows[0].tipo_via,
        nombre_via: result.rows[0].nombre_via,
        nro_via: result.rows[0].nro_via,
        urbanizacion: result.rows[0].urbanizacion,
        manzana: result.rows[0].manzana,
        nro_lote: result.rows[0].nro_lote,
        tipo_interior: result.rows[0].tipo_interior,
        nro_interior: result.rows[0].nro_interior,
      } : null,
    };
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    throw error;
  }
});
