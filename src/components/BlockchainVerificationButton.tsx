import { useState } from "react";
import { ShieldCheck, ChevronRight, AlertCircle, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Determina si un hash pertenece al sistema institucional (mock).
 * Reglas: prefijo "HASH-" (>=10 chars) o formato hex "0x..." con al menos 6 caracteres.
 */
const isInstitutionalHash = (raw: string): boolean => {
  const hash = raw.trim();
  if (!hash) return false;
  const upper = hash.toUpperCase();
  if (upper.startsWith("HASH-") && hash.length >= 10) return true;
  if (/^0x[a-fA-F0-9]{4,}(\.\.\.[a-fA-F0-9]{2,})?$/.test(hash)) return true;
  if (/^0x[a-fA-F0-9]{8,}$/.test(hash)) return true;
  return false;
};

type VerificationStatus = "idle" | "valid" | "invalid";

const BlockchainVerificationButton = () => {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");

  const handleVerify = () => {
    if (isInstitutionalHash(hash)) {
      setStatus("valid");
    } else {
      setStatus("invalid");
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setHash("");
      setStatus("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-primary/40 bg-primary/5 hover:bg-primary hover:text-primary-foreground group"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verificación Blockchain
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Lock className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Verificación de Autenticidad
            </span>
          </div>
          <DialogTitle className="text-xl">
            Modelo de Evaluación Docente basado en Blockchain
          </DialogTitle>
          <DialogDescription>
            Ingresa el código de tu documento para verificar su autenticidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="doc-hash">Código del documento</Label>
          <Input
            id="doc-hash"
            placeholder="HASH-9f8a7c2d4b..."
            value={hash}
            onChange={(e) => {
              setHash(e.target.value);
              setStatus("idle");
            }}
            className="font-mono"
          />

          <Button
            onClick={handleVerify}
            disabled={!hash.trim()}
            className="w-full"
          >
            <ShieldCheck className="h-4 w-4" />
            Verificar Documento
          </Button>

          {status === "invalid" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>El documento ingresado no pertenece al sistema institucional.</span>
            </div>
          )}

          {status === "valid" && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="h-5 w-5" />
                Sobre la Verificación
              </div>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  Todos los documentos están protegidos con tecnología blockchain.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  La verificación es instantánea y completamente segura.
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  Puedes verificar documentos las 24 horas del día.
                </li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockchainVerificationButton;
