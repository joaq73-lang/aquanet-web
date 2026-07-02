import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { query } from "@/server/db";

export const Route = createFileRoute("/api/medios-pago/list")({
  server: {
    handlers: {
      GET: jsonHandler(async () => {
        const result = await query(`SELECT * FROM medio_pago ORDER BY nombre_medio_pago`);

        return {
          medios_pago: result.rows.map((row: any) => ({
            codigo_medio_pago: row.codigo_medio_pago,
            nombre_medio_pago: row.nombre_medio_pago,
          })),
        };
      }),
    },
  },
});
