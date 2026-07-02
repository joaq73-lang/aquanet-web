import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, optionalAuth } from "@/server/auth";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: jsonHandler(async (request) => {
        const auth = optionalAuth(request);

        if (!auth) {
          throw new HttpError(401, "No autenticado");
        }

        return {
          autenticado: true,
          usuario: {
            codigo_usuario: auth.usuario.codigo_usuario,
            codigo_cliente: auth.codigo_cliente,
            email: auth.usuario.email,
            nombre_completo: auth.usuario.nombre_completo,
          },
        };
      }),
    },
  },
});
