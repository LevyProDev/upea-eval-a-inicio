import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhoneCodeVerificationStepProps {
  onNext: () => void;
  onBack: () => void;
  phoneNumber: string;
}

const PhoneCodeVerificationStep = ({
  onNext,
  onBack,
  phoneNumber,
}: PhoneCodeVerificationStepProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const validateCode = (value: string): boolean => {
    if (value.length < 6) {
      setError("Debes ingresar los 6 dígitos");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = () => {
    if (validateCode(code)) {
      // Simulación de validación de código
      // En producción, esto debería validar contra el backend
      toast({
        title: "Código verificado",
        description: "Continuando con el registro...",
      });
      onNext();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      toast({
        title: "Código reenviado",
        description: "Hemos enviado un nuevo código a tu número de celular",
      });
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (error && value.length === 6) {
      validateCode(value);
    }
  };

  const isValid = code.length === 6;

  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">Paso 1 de 6</p>
        <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: "16.67%" }}
          />
        </div>
      </div>

      {/* Título e instrucción */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          Código de verificación
        </h3>
        <p className="text-sm text-muted-foreground">
          Ingresa el código de 6 dígitos que enviamos a tu número de celular{" "}
          <span className="font-medium text-foreground">{phoneNumber}</span>
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp-input">Código de verificación</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              id="otp-input"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>

        {/* Enlace de reenvío */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`text-sm ${
              canResend
                ? "text-primary hover:underline cursor-pointer"
                : "text-muted-foreground cursor-not-allowed"
            }`}
          >
            ¿No te llegó aún? Solicita uno nuevo{" "}
            {!canResend && `en ${timer}s`}
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Anterior
        </Button>
        <Button onClick={handleContinue} disabled={!isValid} className="flex-1">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default PhoneCodeVerificationStep;
