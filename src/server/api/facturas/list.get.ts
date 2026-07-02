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

  const { estado } = getQuery(event);

  try {
    let sql = `
      SELECT f.*, s.codigo_cliente
      FROM factura f
      JOIN suministro s ON f.codigo_suministro = s.codigo_suministro
      WHERE s.codigo_cliente = $1
    `;
    const params: any[] = [auth.codigo_cliente];

    if (estado) {
      sql += ` AND f.estado_factura = $${params.length + 1}`;
      params.push(estado);
    }

    sql += ` ORDER BY f.fecha_emision_factura DESC`;

    const result = await query(sql, params);

    return {
      facturas: result.rows.map((row: any) => ({
        codigo_factura: row.codigo_factura,
        periodo: `${row.fecha_inicio_consumo} - ${row.fecha_fin_consumo}`,
        emision: row.fecha_emision_factura,
        vencimiento: row.fecha_vencimiento_factura,
        monto_total: parseFloat(row.monto_total),
        monto_pagado: parseFloat(row.monto_pagado),
        saldo: parseFloat(row.monto_total) - parseFloat(row.monto_pagado),
        estado: row.estado_factura,
        detalles: {
          consumo: parseFloat(row.consumo_agua_factura),
          concepto_consumo: parseFloat(row.monto_concepto_consumo),
          concepto_alcantarillado: parseFloat(row.monto_concepto_alcantarillado),
          concepto_cargo_fijo: parseFloat(row.monto_concepto_cargo_fijo),
          concepto_igv: parseFloat(row.monto_concepto_igv),
          concepto_mora: parseFloat(row.monto_concepto_mora),
        },
      })),
    };
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    throw error;
  }
});
