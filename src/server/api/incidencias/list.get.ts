import { query } from '~/server/db';

export default defineEventHandler(async (event) => {
  const { ubigeo, tipo } = getQuery(event);

  try {
    let sql = `
      SELECT i.*, 
             COUNT(DISTINCT ic.codigo_suministro) as total_afectados
      FROM incidencia i
      LEFT JOIN incidencia_suministro ic ON i.codigo_incidencia = ic.codigo_incidencia
      WHERE i.estado_incidencia != 'cerrada'
    `;
    const params: any[] = [];

    if (ubigeo) {
      sql += ` AND i.ubigeo = $${params.length + 1}`;
      params.push(ubigeo);
    }

    if (tipo) {
      sql += ` AND i.tipo_incidencia = $${params.length + 1}`;
      params.push(tipo);
    }

    sql += ` GROUP BY i.codigo_incidencia
             ORDER BY i.fecha_inicio_incidencia DESC
             LIMIT 100`;

    const result = await query(sql, params);

    return {
      incidencias: result.rows.map((row: any) => ({
        codigo_incidencia: row.codigo_incidencia,
        tipo: row.tipo_incidencia,
        fecha_inicio: row.fecha_inicio_incidencia,
        fecha_aviso: row.fecha_aviso_incidencia,
        estado: row.estado_incidencia,
        tiempo_resolucion: row.tiempo_resolucion_minutos,
        total_afectados: row.total_afectados,
        descripcion: row.descripcion,
        zona: row.zona,
      })),
    };
  } catch (error) {
    console.error('Error obteniendo incidencias:', error);
    throw error;
  }
});
