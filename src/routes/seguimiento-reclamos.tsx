import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, XCircle, ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/seguimiento-reclamos")({
  head: () => ({
    meta: [
      { title: "Seguimiento de Reclamos — AQUANET" },
      { name: "description", content: "Consulta el estado de tus reclamos registrados." },
    ],
  }),
  component: SeguimientoReclamosPage,
});

type Reclamo = {
  codigo_reclamo: number;
  codigo_suministro: number | null;
  tipo_reclamo: string;
  descripcion: string;
  fecha_registro: string;
  fecha_notificacion: string | null;
  fecha_solucion: string | null;
  estado: string;
};

const ESTADO_LABELS: Record<string, string> = {
  registrado: "Registrado",
  pendiente: "Pendiente",
  en_evaluacion: "En evaluación",
  observado: "Observado",
  derivado: "Derivado",
  rechazado: "Rechazado",
  resuelto: "Resuelto",
  notificado: "Notificado",
};

const ESTADO_COLORS: Record<string, string> = {
  registrado: "bg-blue-100 text-blue-800",
  pendiente: "bg-yellow-100 text-yellow-800",
  en_evaluacion: "bg-purple-100 text-purple-800",
  observado: "bg-orange-100 text-orange-800",
  derivado: "bg-indigo-100 text-indigo-800",
  rechazado: "bg-red-100 text-red-800",
  resuelto: "bg-green-100 text-green-800",
  notificado: "bg-gray-100 text-gray-700",
};

const TIPO_LABELS: Record<string, string> = {
  facturacion: "Facturación",
  medidor_agua: "Medidor de agua",
  servicio_agua_potable: "Servicio de agua potable",
  servicio_alcantarillado: "Servicio de alcantarillado",
  fugas_agua: "Fugas de agua",
  conexion_agua_desague: "Conexión de agua o desagüe",
  corte_restablecimiento: "Corte o restablecimiento del servicio",
};

function SeguimientoReclamosPage() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReclamos = async () => {
      try {
        setLoading(true);
        const token = window.localStorage.getItem("aquanet-token");
        const response = await fetch("/api/reclamos/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener reclamos");

        const data = await response.json();
        setReclamos(data.reclamos || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching reclamos:", err);
        setError("Error al cargar el seguimiento de reclamos");
      } finally {
        setLoading(false);
      }
    };

    fetchReclamos();
  }, []);

  return (
    <AppShell>
      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Seguimiento de Reclamos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta el estado de los reclamos que has registrado.
            </p>
          </div>
          <Link to="/reclamo">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Registrar Reclamo
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-center text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && reclamos.length === 0 && (
          <div className="rounded-2xl border border-border bg-background p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Sin reclamos registrados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Todavía no has registrado ningún reclamo.
            </p>
          </div>
        )}

        {!loading && !error && reclamos.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Código</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Fecha de registro
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reclamos.map((reclamo) => (
                  <tr key={reclamo.codigo_reclamo} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-medium text-foreground">
                      RC-{new Date(reclamo.fecha_registro).getFullYear()}-
                      {String(reclamo.codigo_reclamo).padStart(6, "0")}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {TIPO_LABELS[reclamo.tipo_reclamo] ?? reclamo.tipo_reclamo}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(reclamo.fecha_registro).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          ESTADO_COLORS[reclamo.estado] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ESTADO_LABELS[reclamo.estado] ?? reclamo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
