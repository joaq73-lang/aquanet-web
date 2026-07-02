import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/reclamos/list")({
  server: {
    handlers: {
      GET: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const result = await query(
          `SELECT r.*, s.codigo_suministro
           FROM reclamo r
           LEFT JOIN suministro s ON r.codigo_suministro = s.codigo_suministro
           WHERE r.codigo_cliente = $1
           ORDER BY r.fecha_registro_reclamo DESC`,
          [auth.codigo_cliente],
        );

        return {
          reclamos: result.rows.map((row: any) => ({
            codigo_reclamo: row.codigo_reclamo,
            codigo_suministro: row.codigo_suministro,
            tipo_reclamo: row.tipo_reclamo,
            descripcion: row.descripcion,
            fecha_registro: row.fecha_registro_reclamo,
            fecha_notificacion: row.fecha_notificacion_solucion_reclamo,
            fecha_solucion: row.fecha_solucion_reclamo,
            estado: row.estado_reclamo,
          })),
        };
      }),
    },
  },
});
