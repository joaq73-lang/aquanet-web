import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError } from "@/server/auth";
import { login } from "@/server/auth";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          throw new HttpError(400, "Email y contraseña son requeridos");
        }

        const result = await login(email, password);

        if (!result) {
          throw new HttpError(401, "Credenciales inválidas");
        }

        return {
          success: true,
          token: result.token,
          usuario: {
            codigo_usuario: result.user.codigo_usuario,
            codigo_cliente: result.user.codigo_cliente,
            email: result.user.email,
            nombre_completo: result.user.nombre_completo,
          },
        };
      }),
    },
  },
});
