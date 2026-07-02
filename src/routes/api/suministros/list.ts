import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/suministros/list")({
  server: {
    handlers: {
      GET: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const result = await query(
          `SELECT s.*, d.tipo_via, d.nombre_via, d.nro_via, d.urbanizacion,
                  d.manzana, d.nro_lote, d.tipo_interior, d.nro_interior, d.ubigeo
           FROM suministro s
           JOIN direccion d ON s.codigo_direccion = d.codigo_direccion
           WHERE s.codigo_cliente = $1
           ORDER BY s.fecha_alta DESC`,
          [auth.codigo_cliente],
        );

        return {
          suministros: result.rows.map((row: any) => ({
            codigo_suministro: row.codigo_suministro,
            tipo_suministro: row.tipo_suministro,
            fecha_alta: row.fecha_alta,
            fecha_baja: row.fecha_baja,
            consumo_total_agua: parseFloat(row.consumo_total_agua),
            total_beneficiarios: row.total_beneficiarios,
            total_facturas_generadas: row.total_facturas_generadas,
            estado_suministro: row.estado_suministro,
            direccion: {
              tipo_via: row.tipo_via,
              nombre_via: row.nombre_via,
              nro_via: row.nro_via,
              urbanizacion: row.urbanizacion,
              manzana: row.manzana,
              nro_lote: row.nro_lote,
              tipo_interior: row.tipo_interior,
              nro_interior: row.nro_interior,
              ubigeo: row.ubigeo,
            },
          })),
        };
      }),
    },
  },
});
