import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/consultas/registrar")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        const auth = requireAuth(request);

        if (!auth.codigo_cliente) {
          throw new HttpError(403, "No autorizado");
        }

        const body = await request.json();
        const { asunto, descripcion } = body;

        if (!asunto || !descripcion) {
          throw new HttpError(400, "Asunto y descripción son requeridos");
        }

        const result = await query(
          `INSERT INTO consulta (codigo_cliente, asunto, descripcion, estado_consulta)
           VALUES ($1, $2, $3, 'registrada')
           RETURNING *`,
          [auth.codigo_cliente, asunto, descripcion],
        );

        return {
          success: true,
          consulta: {
            codigo_consulta: result.rows[0].codigo_consulta,
            fecha_registro: result.rows[0].fecha_registro_consulta,
            estado: result.rows[0].estado_consulta,
          },
        };
      }),
    },
  },
});
