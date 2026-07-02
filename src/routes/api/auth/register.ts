import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, registerCliente } from "@/server/auth";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        const body = await request.json();
        const {
          tipo_cliente,
          documento_tipo,
          documento_numero,
          nombres,
          apellido_paterno,
          apellido_materno,
          ruc,
          razon_social,
          telefono,
          correo,
          password,
        } = body;

        if (!tipo_cliente || !documento_tipo || !documento_numero || !correo || !password) {
          throw new HttpError(400, "Faltan campos requeridos");
        }

        if (tipo_cliente === "individual") {
          if (!nombres || !apellido_paterno) {
            throw new HttpError(400, "Para clientes individuales se requieren nombres y apellidos");
          }
        } else if (tipo_cliente === "empresa") {
          if (!ruc || !razon_social) {
            throw new HttpError(400, "Para empresas se requieren RUC y razón social");
          }
        }

        const result = await registerCliente({
          tipo_cliente,
          documento_tipo,
          documento_numero,
          nombres,
          apellido_paterno,
          apellido_materno,
          ruc,
          razon_social,
          telefono,
          correo,
          password,
        });

        if (!result) {
          throw new HttpError(500, "Error al registrar el cliente");
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
