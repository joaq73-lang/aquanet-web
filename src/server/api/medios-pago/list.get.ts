import { query } from '~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const result = await query(`SELECT * FROM medio_pago ORDER BY nombre_medio_pago`);

    return {
      medios_pago: result.rows.map((row: any) => ({
        codigo_medio_pago: row.codigo_medio_pago,
        nombre_medio_pago: row.nombre_medio_pago,
      })),
    };
  } catch (error) {
    console.error('Error obteniendo medios de pago:', error);
    throw error;
  }
});
