import { createFileRoute } from "@tanstack/react-router";
import { jsonHandler } from "@/server/http";
import { HttpError, requireAuth } from "@/server/auth";

const DESTINOS = [
  {
    ruta: "/realizar-pago",
    etiqueta: "Realizar Pago",
    descripcion:
      "Pagar un recibo o deuda pendiente con tarjeta de crédito/débito o billetera electrónica (Yape, Plin)",
  },
  {
    ruta: "/incidencias",
    etiqueta: "Incidencias",
    descripcion: "Reportar o revisar cortes de agua, fugas, averías o falta de agua en la zona",
  },
  {
    ruta: "/lugares-pago",
    etiqueta: "Lugares de pago",
    descripcion:
      "Buscar agencias o puntos de pago físicos cercanos, filtrando por distrito de Lima",
  },
  {
    ruta: "/historial",
    etiqueta: "Historial de Facturación",
    descripcion: "Ver facturas anteriores, consumo de agua y descargar recibos",
  },
  {
    ruta: "/reclamo",
    etiqueta: "Registrar Reclamo",
    descripcion:
      "Presentar un reclamo formal sobre facturación, medidor de agua, servicio de agua potable, alcantarillado, fugas, conexión de agua o desagüe, o corte/restablecimiento del servicio",
  },
  {
    ruta: "/seguimiento-reclamos",
    etiqueta: "Seguimiento de Reclamos",
    descripcion: "Consultar el estado de reclamos que el cliente ya presentó",
  },
  {
    ruta: "/",
    etiqueta: "Inicio",
    descripcion: "Panel principal de la cuenta",
  },
] as const;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function buildPrompt(mensaje: string): string {
  const listaDestinos = DESTINOS.map((d) => `- "${d.ruta}" (${d.etiqueta}): ${d.descripcion}`).join(
    "\n",
  );

  return `Eres el asistente virtual de AQUANET, una app peruana de gestión de servicios de agua potable y alcantarillado. Un cliente que ya inició sesión te escribe una consulta en lenguaje natural. Decide a qué sección de la app debe ser dirigido.

Secciones disponibles:
${listaDestinos}

Reglas:
- Si la consulta corresponde claramente a una sección, responde con esa ruta exacta en "ruta".
- Si es un saludo, no tiene relación con ninguna sección, o es demasiado ambigua, responde "ruta": "ninguna".
- "mensaje" debe ser una respuesta breve y amable en español (máximo 2 frases). Si rutas a una sección dilo (ej. "Te llevo a..."). Si no hay coincidencia, sugiere qué puede preguntar.

Consulta del cliente: "${mensaje}"`;
}

export const Route = createFileRoute("/api/chat/interpretar")({
  server: {
    handlers: {
      POST: jsonHandler(async (request) => {
        requireAuth(request);

        const body = await request.json();
        const mensaje = typeof body?.mensaje === "string" ? body.mensaje.trim() : "";

        if (!mensaje) {
          throw new HttpError(400, "El mensaje es requerido");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new HttpError(503, "El asistente inteligente no está configurado");
        }

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildPrompt(mensaje) }] }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    ruta: {
                      type: "STRING",
                      enum: [...DESTINOS.map((d) => d.ruta), "ninguna"],
                    },
                    mensaje: { type: "STRING" },
                  },
                  required: ["ruta", "mensaje"],
                },
              },
            }),
          },
        );

        if (!geminiResponse.ok) {
          const errorBody = await geminiResponse.text();
          console.error("Error de Gemini:", geminiResponse.status, errorBody);
          throw new HttpError(502, "El asistente inteligente no pudo procesar la consulta");
        }

        const data = await geminiResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof rawText !== "string") {
          console.error("Respuesta de Gemini sin texto:", JSON.stringify(data));
          throw new HttpError(502, "El asistente inteligente no devolvió una respuesta válida");
        }

        let parsed: { ruta?: string; mensaje?: string };
        try {
          parsed = JSON.parse(rawText);
        } catch {
          console.error("Respuesta de Gemini no es JSON válido:", rawText);
          throw new HttpError(502, "El asistente inteligente devolvió una respuesta inválida");
        }

        const destino = DESTINOS.find((d) => d.ruta === parsed.ruta);

        return {
          ruta: destino?.ruta ?? null,
          etiqueta: destino?.etiqueta ?? null,
          mensaje: parsed.mensaje || "No estoy seguro de a dónde llevarte.",
        };
      }),
    },
  },
});
