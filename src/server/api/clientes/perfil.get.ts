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
      `SELECT c.*, 
              COALESCE(ci.nombres, '') || ' ' || COALESCE(ci.apellido_paterno, '') || ' ' || COALESCE(ci.apellido_materno, '') as nombre_completo,
              ci.tipo_documento, ci.nro_documento,
              ce.ruc, ce.razon_social
       FROM cliente c
       LEFT JOIN cliente_individual ci ON c.codigo_cliente = ci.codigo_cliente
       LEFT JOIN cliente_empresa ce ON c.codigo_cliente = ce.codigo_cliente
       WHERE c.codigo_cliente = $1`,
      [auth.codigo_cliente]
    );

    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Cliente no encontrado',
      });
    }

    const cliente = result.rows[0];

    return {
      cliente: {
        codigo_cliente: cliente.codigo_cliente,
        tipo_cliente: cliente.tipo_cliente,
        nombre_completo: cliente.nombre_completo.trim(),
        tipo_documento: cliente.tipo_documento,
        nro_documento: cliente.nro_documento,
        ruc: cliente.ruc,
        razon_social: cliente.razon_social,
        telefono: cliente.telefono,
        correo: cliente.correo,
        total_suministros: cliente.total_suministros,
        saldo_deuda_por_pagar: parseFloat(cliente.saldo_deuda_por_pagar),
        saldo_deudas_pagadas: parseFloat(cliente.saldo_deudas_pagadas),
        total_facturas_pagadas: cliente.total_facturas_pagadas,
        total_factura_por_pagar: parseFloat(cliente.total_factura_por_pagar),
        estado_cliente: cliente.estado_cliente,
        fecha_registro: cliente.fecha_registro_cliente,
      },
    };
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
});
