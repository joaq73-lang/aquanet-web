import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/reclamos/registrar")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const body = await request.json();
        const { codigo_suministro, tipo_reclamo, descripcion } = body;

        if (!tipo_reclamo || !descripcion) {
          throw new HttpError(400, "Tipo de reclamo y descripción son requeridos");
        }

        // Verificar que el suministro pertenezca al cliente si se proporciona
        if (codigo_suministro) {
          const suministroCheck = await query(
            `SELECT codigo_suministro FROM suministro
             WHERE codigo_suministro = $1 AND codigo_cliente = $2`,
            [codigo_suministro, auth.codigo_cliente],
          );

          if (suministroCheck.rows.length === 0) {
            throw new HttpError(404, "Suministro no encontrado o no pertenece al cliente");
          }
        }

        const result = await query(
          `INSERT INTO reclamo (codigo_cliente, codigo_suministro, tipo_reclamo, descripcion, estado_reclamo)
           VALUES ($1, $2, $3, $4, 'registrado')
           RETURNING *`,
          [auth.codigo_cliente, codigo_suministro || null, tipo_reclamo, descripcion],
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
      }),
    },
  },
});
