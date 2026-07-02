import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock3, MapPin, XCircle, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/incidencias")({
  head: () => ({
    meta: [
      { title: "Incidencias — AQUANET" },
      {
        name: "description",
        content: "Consulta y gestiona las incidencias en tu zona de servicio.",
      },
    ],
  }),
  component: IncidenciasPage,
});

type Incidencia = {
  codigo_incidencia: number;
  tipo: string;
  fecha_inicio: string;
  fecha_aviso: string;
  estado: string;
  tiempo_resolucion: number | null;
  total_afectados: number;
  descripcion: string;
  zona: string;
};

function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<Incidencia | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [ubigeo] = useState("150131"); // Zona default: San Juan de Miraflores

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/incidencias/list?ubigeo=${ubigeo}`);

        if (!response.ok) throw new Error("Error al obtener incidencias");

        const data = await response.json();
        setIncidencias(data.incidencias || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching incidencias:", err);
        setError("Error al cargar las incidencias");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, [ubigeo]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "registrada":
        return "bg-blue-100 text-blue-800";
      case "notificada":
        return "bg-purple-100 text-purple-800";
      case "en_atencion":
        return "bg-yellow-100 text-yellow-800";
      case "resuelta":
        return "bg-green-100 text-green-800";
      case "cerrada":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoIcon = (tipo: string) => {
    return <AlertTriangle className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-center text-sm text-destructive">{error}</p>
        </div>
      </AppShell>
    );
  }

  if (incidencias.length === 0) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-border bg-background p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Sin incidencias activas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No hay incidencias reportadas en tu zona en este momento.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Incidencias Activas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Incidencias reportadas en tu zona de servicio
          </p>
        </div>

        <div className="space-y-4">
          {incidencias.map((incidencia) => (
            <div
              key={incidencia.codigo_incidencia}
              className="cursor-pointer rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:shadow-md"
              onClick={() => {
                setSelectedIncidencia(incidencia);
                setOpenDrawer(true);
              }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-orange-600">{getTipoIcon(incidencia.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{incidencia.tipo}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{incidencia.zona}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(incidencia.estado)}`}
                    >
                      {incidencia.estado.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {new Date(incidencia.fecha_inicio).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {incidencia.total_afectados} suministros afectados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedIncidencia && (
          <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
            <DrawerContent className="bg-background">
              <DrawerHeader>
                <DrawerTitle>{selectedIncidencia.tipo}</DrawerTitle>
                <DrawerDescription>{selectedIncidencia.zona}</DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Inicio</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedIncidencia.fecha_inicio).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <p className="text-sm font-medium">
                      {selectedIncidencia.estado.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Suministros afectados</p>
                    <p className="text-sm font-medium">{selectedIncidencia.total_afectados}</p>
                  </div>
                  {selectedIncidencia.tiempo_resolucion && (
                    <div>
                      <p className="text-xs text-muted-foreground">Tiempo de resolución</p>
                      <p className="text-sm font-medium">
                        {selectedIncidencia.tiempo_resolucion} minutos
                      </p>
                    </div>
                  )}
                </div>

                {selectedIncidencia.descripcion && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Descripción</p>
                    <p className="mt-2 text-sm text-foreground">{selectedIncidencia.descripcion}</p>
                  </div>
                )}

                <DrawerClose className="w-full rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted">
                  Cerrar
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </AppShell>
  );
}
