import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/canales/list")({
  server: {
    handlers: {
      GET: jsonHandler(async (request) => {
        const url = new URL(request.url);
        const tipo = url.searchParams.get("tipo");
        const modalidad = url.searchParams.get("modalidad");

        let sql = `SELECT * FROM canal_pago WHERE estado_canal = TRUE`;
        const params: any[] = [];

        if (tipo) {
          sql += ` AND tipo_canal = $${params.length + 1}`;
          params.push(tipo);
        }

        if (modalidad) {
          sql += ` AND modalidad_canal = $${params.length + 1}`;
          params.push(modalidad);
        }

        sql += ` ORDER BY nombre_canal`;

        const result = await query(sql, params);

        return {
          canales: result.rows.map((row: any) => ({
            codigo_canal: row.codigo_canal,
            modalidad_canal: row.modalidad_canal,
            tipo_canal: row.tipo_canal,
            nombre_canal: row.nombre_canal,
            dias_disponibles: row.dias_disponibles,
            hora_inicio_abierto: row.hora_inicio_abierto,
            hora_fin_abierto: row.hora_fin_abierto,
            direccion: row.direccion,
            ubigeo: row.ubigeo,
            latitud: row.latitud ? parseFloat(row.latitud) : null,
            longitud: row.longitud ? parseFloat(row.longitud) : null,
          })),
        };
      }),
    },
  },
});
