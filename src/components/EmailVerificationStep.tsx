import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationStepProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

const EmailVerificationStep = ({ onNext, onBack }: EmailVerificationStepProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setError("Formato de correo inválido");
    } else if (!value) {
      setError("Este campo es obligatorio");
    } else {
      setError("");
    }
  };

  const handleContinue = () => {
    if (!email) {
      setError("Este campo es obligatorio");
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "Debes ingresar un correo electrónico válido para continuar",
      });
      return;
    }

    if (!validateEmail(email)) {
      setError("Formato de correo inválido");
      toast({
        variant: "destructive",
        title: "Correo inválido",
        description: "Debes ingresar un correo electrónico válido para continuar",
      });
      return;
    }

    onNext(email);
  };

  const isValidEmail = email && validateEmail(email);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm text-muted-foreground">Paso 2 de 6</div>
        </div>
        <DialogTitle className="text-2xl font-bold">
          Verificación de correo electrónico
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Ingresa tu correo electrónico. Te enviaremos un código de verificación para validarlo.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-6">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={handleEmailChange}
              className={`pl-10 ${error ? "border-destructive" : ""}`}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
            disabled={!isValidEmail}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </>
  );
};

export default EmailVerificationStep;
