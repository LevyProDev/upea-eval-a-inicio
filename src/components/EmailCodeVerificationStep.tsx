import { useState, useEffect } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface EmailCodeVerificationStepProps {
  onNext: () => void;
  onBack: () => void;
  email: string;
}

const EmailCodeVerificationStep = ({ onNext, onBack, email }: EmailCodeVerificationStepProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (error) setError("");
  };

  const handleContinue = () => {
    if (code.length !== 6) {
      setError("Debes ingresar los 6 dígitos");
      toast({
        variant: "destructive",
        title: "Código incompleto",
        description: "Debes ingresar los 6 dígitos del código de verificación",
      });
      return;
    }

    // Simulación de validación del código
    // En producción, aquí se validaría contra el backend
    if (code !== "123456") {
      setError("Código incorrecto");
      toast({
        variant: "destructive",
        title: "Código incorrecto",
        description: "El código ingresado no es válido. Por favor, verifica e intenta nuevamente.",
      });
      return;
    }

    toast({
      title: "Código verificado",
      description: "Tu correo electrónico ha sido verificado exitosamente",
    });
    onNext();
  };

  const handleResend = () => {
    if (!canResend) return;

    toast({
      title: "Código reenviado",
      description: `Se ha enviado un nuevo código a ${email}`,
    });
    setTimer(60);
    setCanResend(false);
    setCode("");
    setError("");
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm text-muted-foreground">Paso 2 de 6</div>
        </div>
        <DialogTitle className="text-2xl font-bold">
          Código de verificación por correo
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-6">
        {/* Email Display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Código enviado a
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
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
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Resend Code Link */}
        <div className="text-center">
          <button
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={code.length !== 6}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </>
  );
};

export default EmailCodeVerificationStep;
