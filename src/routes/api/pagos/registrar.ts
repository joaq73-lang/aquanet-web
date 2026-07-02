import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/pagos/registrar")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const body = await request.json();
        const { codigo_factura, codigo_canal, codigo_medio_pago, monto_pagado } = body;

        if (!codigo_factura || !codigo_canal || !codigo_medio_pago || !monto_pagado) {
          throw new HttpError(400, "Parámetros requeridos faltantes");
        }

        // Verificar que la factura pertenezca al cliente
        const facturaCheck = await query(
          `SELECT f.* FROM factura f
           JOIN suministro s ON f.codigo_suministro = s.codigo_suministro
           WHERE f.codigo_factura = $1 AND s.codigo_cliente = $2`,
          [codigo_factura, auth.codigo_cliente],
        );

        if (facturaCheck.rows.length === 0) {
          throw new HttpError(404, "Factura no encontrada");
        }

        const factura = facturaCheck.rows[0];

        // Validar que el monto no exceda lo adeudado
        const deuda = parseFloat(factura.monto_total) - parseFloat(factura.monto_pagado);
        if (monto_pagado > deuda) {
          throw new HttpError(400, "El monto pagado excede la deuda pendiente");
        }

        // Registrar pago
        const pagoResult = await query(
          `INSERT INTO pago (codigo_factura, codigo_canal, codigo_medio_pago, fecha_pago, hora_pago, monto_pagado, estado_pago, numero_transaccion)
           VALUES ($1, $2, $3, NOW(), NOW(), $4, 'confirmado', $5)
           RETURNING *`,
          [codigo_factura, codigo_canal, codigo_medio_pago, monto_pagado, `TRX-${Date.now()}`],
        );

        // Actualizar montos en factura
        const nuevoMontoPagado = parseFloat(factura.monto_pagado) + monto_pagado;
        const nuevoEstado =
          nuevoMontoPagado >= parseFloat(factura.monto_total) ? "pagada" : "pendiente";

        await query(
          `UPDATE factura SET monto_pagado = $1, estado_factura = $2 WHERE codigo_factura = $3`,
          [nuevoMontoPagado, nuevoEstado, codigo_factura],
        );

        return {
          success: true,
          pago: {
            codigo_pago: pagoResult.rows[0].codigo_pago,
            numero_transaccion: pagoResult.rows[0].numero_transaccion,
            monto: parseFloat(pagoResult.rows[0].monto_pagado),
            fecha: pagoResult.rows[0].fecha_pago,
            estado: "confirmado",
          },
        };
      }),
    },
  },
});
