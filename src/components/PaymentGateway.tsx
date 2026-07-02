import { useEffect, useState } from "react";
import { CreditCard, Smartphone, QrCode, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MedioPago = "tarjeta" | "billetera";
type Step = "card" | "wallet-choice" | "wallet-qr" | "wallet-phone";

interface PaymentGatewayProps {
  open: boolean;
  medioPago: MedioPago;
  monto: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function PaymentGateway({
  open,
  medioPago,
  monto,
  onOpenChange,
  onConfirm,
}: PaymentGatewayProps) {
  const [step, setStep] = useState<Step>(medioPago === "tarjeta" ? "card" : "wallet-choice");
  const [processing, setProcessing] = useState(false);

  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [titular, setTitular] = useState("");

  const [telefono, setTelefono] = useState("");
  const [codigoAprobacion, setCodigoAprobacion] = useState("");

  useEffect(() => {
    if (open) {
      setStep(medioPago === "tarjeta" ? "card" : "wallet-choice");
      setProcessing(false);
      setNumeroTarjeta("");
      setVencimiento("");
      setCvv("");
      setTitular("");
      setTelefono("");
      setCodigoAprobacion("");
    }
  }, [open, medioPago]);

  const confirmar = () => {
    setProcessing(true);
    window.setTimeout(() => {
      onConfirm();
    }, 900);
  };

  const cardValido =
    numeroTarjeta.replace(/\s/g, "").length >= 15 &&
    vencimiento.trim().length >= 4 &&
    cvv.trim().length >= 3 &&
    titular.trim().length > 0;

  const phoneValido = telefono.trim().length >= 9 && codigoAprobacion.trim().length >= 4;

  return (
    <Dialog open={open} onOpenChange={(next) => !processing && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        {step === "card" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pago con tarjeta
              </DialogTitle>
              <DialogDescription>
                Ingresa los datos de tu tarjeta de crédito o débito para pagar S/.{" "}
                {monto.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="numero-tarjeta">Número de tarjeta</Label>
                <Input
                  id="numero-tarjeta"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vencimiento">Vencimiento</Label>
                  <Input
                    id="vencimiento"
                    placeholder="MM/AA"
                    value={vencimiento}
                    onChange={(e) => setVencimiento(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    inputMode="numeric"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="titular">Nombre del titular</Label>
                <Input
                  id="titular"
                  placeholder="Como aparece en la tarjeta"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={!cardValido || processing}
                onClick={confirmar}
                className="w-full gap-2"
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Pagar S/. {monto.toFixed(2)}
              </Button>
            </div>
          </>
        )}

        {step === "wallet-choice" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Billetera electrónica
              </DialogTitle>
              <DialogDescription>
                ¿Cómo deseas pagar con tu billetera (Yape / Plin)?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStep("wallet-qr")}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border p-6 transition hover:border-primary hover:bg-primary/5"
              >
                <QrCode className="h-8 w-8 text-primary-deep" />
                <span className="text-sm font-semibold text-foreground">Con QR</span>
              </button>
              <button
                type="button"
                onClick={() => setStep("wallet-phone")}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border p-6 transition hover:border-primary hover:bg-primary/5"
              >
                <Smartphone className="h-8 w-8 text-primary-deep" />
                <span className="text-sm font-semibold text-foreground">Con celular</span>
              </button>
            </div>
          </>
        )}

        {step === "wallet-qr" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Escanea para pagar
              </DialogTitle>
              <DialogDescription>
                Escanea este código con tu app de Yape o Plin para pagar S/. {monto.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div
                aria-label="Código QR de pago (demo)"
                className="grid h-48 w-48 grid-cols-8 grid-rows-8 gap-0.5 rounded-lg border border-border bg-white p-3"
              >
                {Array.from({ length: 64 }).map((_, index) => (
                  <div
                    key={index}
                    className={(index * 37 + index * index) % 5 === 0 ? "bg-black" : "bg-white"}
                  />
                ))}
              </div>
              <Button
                type="button"
                disabled={processing}
                onClick={confirmar}
                className="w-full gap-2"
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Ya escaneé y pagué
              </Button>
            </div>
          </>
        )}

        {step === "wallet-phone" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Pagar con celular
              </DialogTitle>
              <DialogDescription>
                Ingresa tu número y el código de aprobación de tu billetera para pagar S/.{" "}
                {monto.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Número de celular</Label>
                <Input
                  id="telefono"
                  inputMode="numeric"
                  placeholder="999 999 999"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  maxLength={9}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="codigo-aprobacion">Código de aprobación</Label>
                <Input
                  id="codigo-aprobacion"
                  placeholder="Enviado a tu app"
                  value={codigoAprobacion}
                  onChange={(e) => setCodigoAprobacion(e.target.value)}
                  maxLength={8}
                />
              </div>
              <Button
                type="button"
                disabled={!phoneValido || processing}
                onClick={confirmar}
                className="w-full gap-2"
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar pago
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
