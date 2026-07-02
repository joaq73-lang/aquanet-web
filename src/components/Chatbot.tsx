import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

type Message = {
  from: "user" | "bot";
  text: string;
};

type Intent = {
  to: string;
  label: string;
  keywords: string[];
};

const intents: Intent[] = [
  {
    to: "/realizar-pago",
    label: "Realizar Pago",
    keywords: ["pagar", "pago", "pagos", "deuda", "recibo pendiente", "cobrar", "cuánto debo"],
  },
  {
    to: "/incidencias",
    label: "Incidencias",
    keywords: [
      "incidencia",
      "corte",
      "fuga",
      "avería",
      "averia",
      "sin agua",
      "no hay agua",
      "rotura",
    ],
  },
  {
    to: "/lugares-pago",
    label: "Lugares de pago",
    keywords: [
      "lugar",
      "lugares",
      "agencia",
      "sucursal",
      "dónde pago",
      "donde pago",
      "punto de pago",
      "cerca",
    ],
  },
  {
    to: "/historial",
    label: "Historial de Facturación",
    keywords: ["historial", "factura", "facturas", "recibo anterior", "consumo", "cuánto consumí"],
  },
  {
    to: "/seguimiento-reclamos",
    label: "Seguimiento de Reclamos",
    keywords: ["seguimiento", "estado de mi reclamo", "cómo va mi reclamo"],
  },
  {
    to: "/reclamo",
    label: "Registrar Reclamo",
    keywords: ["reclamo", "reclamar", "queja", "quejarme", "denuncia", "problema", "mal servicio"],
  },
];

function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function detectIntent(query: string): Intent | null {
  const normalized = normalizeText(query);

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of intents) {
    const score = intent.keywords.filter((keyword) =>
      normalized.includes(normalizeText(keyword)),
    ).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }
  return best?.intent ?? null;
}

interface ChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Chatbot({ open, onOpenChange }: ChatbotProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Hola, soy el asistente de AQUANET. Cuéntame qué necesitas: pagar un recibo, reportar una incidencia, buscar un lugar de pago, ver tu historial de facturación, registrar un reclamo o ver su seguimiento.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const goTo = (to: string, text: string) => {
    setMessages((current) => [...current, { from: "bot", text }]);
    window.setTimeout(() => {
      onOpenChange(false);
      navigate({ to });
    }, 700);
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || sending) return;

    const userMessage: Message = { from: "user", text: query };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const token = window.localStorage.getItem("aquanet-token");
      const response = await fetch("/api/chat/interpretar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mensaje: query }),
      });

      if (!response.ok) {
        throw new Error("No se pudo interpretar la consulta");
      }

      const data: { ruta: string | null; etiqueta: string | null; mensaje: string } =
        await response.json();

      if (data.ruta) {
        goTo(data.ruta, data.mensaje);
      } else {
        setMessages((current) => [...current, { from: "bot", text: data.mensaje }]);
      }
    } catch {
      const intent = detectIntent(query);
      if (!intent) {
        setMessages((current) => [
          ...current,
          {
            from: "bot",
            text: "No estoy seguro de a dónde llevarte. Prueba mencionando: pagar, incidencias, lugares de pago, historial, seguimiento o reclamo.",
          },
        ]);
      } else {
        goTo(intent.to, `Te llevo a "${intent.label}"...`);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Asistente AQUANET
          </DrawerTitle>
          <DrawerDescription>
            Escribe lo que necesitas y te llevo a la sección correcta.
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto px-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${message.from === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  message.from === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary-soft text-primary-deep"
                }`}
              >
                {message.from === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.from === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-deep">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                Pensando...
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder="Ej. quiero pagar mi recibo"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            aria-label="Enviar consulta"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-deep disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
