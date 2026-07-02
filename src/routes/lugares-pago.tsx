import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Clock, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/lugares-pago")({
  head: () => ({
    meta: [
      { title: "Lugares de Pago — AQUANET" },
      { name: "description", content: "Encuentra los puntos de pago cercanos a tu zona." },
    ],
  }),
  component: LugaresPagoPage,
});

type SearchState = "search" | "loading" | "results" | "empty";
type Scenario = "empty" | "with";

type PaymentPoint = {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  horarioInicio: string;
  horarioFin: string;
  dias: string;
};

const puntosDePago: PaymentPoint[] = [
  {
    id: "1",
    nombre: "Agencia Central SEDAPAL",
    tipo: "Ventanilla",
    direccion: "Av. Armando Blondet 250, Piso 5, San Juan de Lurigancho",
    horarioInicio: "08:00",
    horarioFin: "17:00",
    dias: "Lunes a Viernes",
  },
  {
    id: "2",
    nombre: "Agencia San Juan - SEDAPAL",
    tipo: "Ventanilla",
    direccion: "Jr. Principal 455, Urb. Las Flores, San Juan de Lurigancho",
    horarioInicio: "08:00",
    horarioFin: "16:00",
    dias: "Lunes a Viernes",
  },
  {
    id: "3",
    nombre: "Banco de la Nación - SJL",
    tipo: "Ventanilla",
    direccion: "Av. Tomás Guido 890, Centro Comercial, San Juan de Lurigancho",
    horarioInicio: "09:00",
    horarioFin: "17:30",
    dias: "Lunes a Viernes, Sábados hasta las 12:00",
  },
  {
    id: "4",
    nombre: "Agente BCP",
    tipo: "Agente Electrónico",
    direccion: "Av. Mariscal Ramón Castilla 123, Tienda Retail, San Juan de Lurigancho",
    horarioInicio: "07:00",
    horarioFin: "21:00",
    dias: "Lunes a Domingo",
  },
  {
    id: "5",
    nombre: "Caja Metropolitana",
    tipo: "Agente Multibanco",
    direccion: "Jr. Los Andes 678, Galer\u00eda Comercial, San Juan de Lurigancho",
    horarioInicio: "08:30",
    horarioFin: "18:00",
    dias: "Lunes a S\u00e1bados",
  },
];

function LugaresPagoPage() {
  const [searchState, setSearchState] = useState<SearchState>("search");
  const [scenario, setScenario] = useState<Scenario>("with");
  const [region, setRegion] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [selectedPoint, setSelectedPoint] = useState<PaymentPoint | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (scenario === "empty") return [];
    return puntosDePago;
  }, [scenario]);

  const handleBuscar = () => {
    if (!region || !tipo) {
      alert("Por favor selecciona región y tipo de canal");
      return;
    }
    setSearchState("loading");
    window.setTimeout(() => {
      if (scenario === "empty") {
        setSearchState("empty");
      } else {
        setSearchState("results");
      }
      setExpandedId(null);
      setSelectedPoint(null);
    }, 900);
  };

  const handleVolver = () => {
    setSearchState("search");
    setRegion("");
    setTipo("");
    setSelectedPoint(null);
    setExpandedId(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setSelectedPoint(expandedId === id ? null : puntosDePago.find((p) => p.id === id) || null);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary-deep">
            Ubicaciones
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Lugares de pago</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Encuentra los puntos de pago más cercanos a tu zona
          </p>
        </div>

        {searchState === "search" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-6">Buscar puntos de pago</h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Región / Provincia
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona una región...</option>
                    <option value="lima">Lima</option>
                    <option value="callao">Callao</option>
                    <option value="ica">Ica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Tipo de canal
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona un tipo...</option>
                    <option value="agencias">Agencias SEDAPAL</option>
                    <option value="bancos">Bancos autorizados</option>
                    <option value="agentes">Agentes multibanco</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleBuscar}
                    className="w-full rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep transition"
                  >
                    Buscar Puntos de Pago
                  </button>
                </div>
              </div>
            </div>

            {/* Escenarios de prueba */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">
                ESCENARIOS DE PRUEBA:
              </p>
              <div className="flex flex-wrap gap-2">
                {(["with", "empty"] as Scenario[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      scenario === s
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {s === "with" ? "✓ Con resultados" : "✗ Sin resultados"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {searchState === "loading" && (
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Buscando puntos de pago...</p>
            </div>
          </div>
        )}

        {searchState === "empty" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-12 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary-deep">
                <Sparkles className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No se encontraron puntos de pago disponibles en la ubicación seleccionada.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleVolver}
                className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground hover:bg-secondary transition"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {searchState === "results" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-4">
              <h2 className="font-semibold text-foreground mb-4">
                Puntos de pago encontrados ({results.length})
              </h2>

              <div className="space-y-3">
                {results.map((punto) => (
                  <div
                    key={punto.id}
                    className="rounded-2xl border border-border bg-background p-4 cursor-pointer hover:bg-primary/5 transition"
                  >
                    <div
                      onClick={() => toggleExpanded(punto.id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{punto.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-1">{punto.tipo}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(punto.direccion)}`,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }}
                          aria-label={`Ver mapa de ${punto.nombre}`}
                          title="Ver en el mapa"
                          className="grid h-9 w-9 place-items-center rounded-full text-primary-deep hover:bg-primary-soft transition"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        {expandedId === punto.id ? (
                          <ChevronUp className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {expandedId === punto.id && (
                      <div className="mt-4 space-y-3 border-t border-border pt-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                            Dirección
                          </p>
                          <p className="mt-1 text-sm text-foreground">{punto.direccion}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                              Horario
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {punto.horarioInicio} - {punto.horarioFin}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                              Disponible
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {punto.dias}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleVolver}
                className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground hover:bg-secondary transition"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
