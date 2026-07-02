import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/facturas/list")({
  server: {
    handlers: {
      GET: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const url = new URL(request.url);
        const estado = url.searchParams.get("estado");

        let sql = `
          SELECT f.*, s.codigo_cliente,
                 to_char(f.fecha_inicio_consumo, 'YYYY-MM-DD') AS fecha_inicio_consumo_iso,
                 to_char(f.fecha_fin_consumo, 'YYYY-MM-DD') AS fecha_fin_consumo_iso,
                 to_char(f.fecha_emision_factura, 'YYYY-MM-DD') AS fecha_emision_factura_iso,
                 to_char(f.fecha_vencimiento_factura, 'YYYY-MM-DD') AS fecha_vencimiento_factura_iso
          FROM factura f
          JOIN suministro s ON f.codigo_suministro = s.codigo_suministro
          WHERE s.codigo_cliente = $1
        `;
        const params: any[] = [auth.codigo_cliente];

        if (estado) {
          const estados = estado
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
          sql += ` AND f.estado_factura = ANY($${params.length + 1})`;
          params.push(estados);
        }

        sql += ` ORDER BY f.fecha_emision_factura DESC`;

        const result = await query(sql, params);

        return {
          facturas: result.rows.map((row: any) => ({
            codigo_factura: row.codigo_factura,
            periodo: `${row.fecha_inicio_consumo_iso} - ${row.fecha_fin_consumo_iso}`,
            emision: row.fecha_emision_factura_iso,
            vencimiento: row.fecha_vencimiento_factura_iso,
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
      }),
    },
  },
});
