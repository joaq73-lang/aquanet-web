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
      text: "Hola, soy el asistente de AQUANET. Cuéntame qué necesitas: pagar un recibo, reportar una incidencia, buscar un lugar de pago, ver tu historial de facturación o registrar un reclamo.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    const query = input.trim();
    if (!query) return;

    const intent = detectIntent(query);
    const userMessage: Message = { from: "user", text: query };

    if (!intent) {
      setMessages((current) => [
        ...current,
        userMessage,
        {
          from: "bot",
          text: "No estoy seguro de a dónde llevarte. Prueba mencionando: pagar, incidencias, lugares de pago, historial o reclamo.",
        },
      ]);
      setInput("");
      return;
    }

    setMessages((current) => [
      ...current,
      userMessage,
      { from: "bot", text: `Te llevo a "${intent.label}"...` },
    ]);
    setInput("");

    window.setTimeout(() => {
      onOpenChange(false);
      navigate({ to: intent.to });
    }, 700);
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
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej. quiero pagar mi recibo"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="Enviar consulta"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-deep"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
