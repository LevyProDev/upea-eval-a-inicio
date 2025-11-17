import { useState, useEffect } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordCreationStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "Mínimo 8 caracteres", test: (pwd) => pwd.length >= 8 },
  { label: "Al menos una letra mayúscula", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Al menos una letra minúscula", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Al menos un número", test: (pwd) => /\d/.test(pwd) },
  { label: "Al menos un carácter especial", test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

const PasswordCreationStep = ({ onNext, onBack }: PasswordCreationStepProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const calculateSecurityLevel = () => {
    const metRequirements = requirements.filter(req => req.test(password)).length;
    return (metRequirements / requirements.length) * 100;
  };

  const getSecurityColor = () => {
    const level = calculateSecurityLevel();
    if (level < 40) return "#dc2626"; // red
    if (level < 80) return "#facc15"; // yellow
    return "#16a34a"; // green
  };

  const getSecurityLabel = () => {
    const level = calculateSecurityLevel();
    if (level < 40) return "Nivel bajo";
    if (level < 80) return "Nivel medio";
    return "Nivel alto";
  };

  const allRequirementsMet = requirements.every(req => req.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isValid = allRequirementsMet && passwordsMatch;

  const handleContinue = () => {
    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Campos obligatorios",
        description: "Este campo es obligatorio",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "La contraseña no cumple con los requisitos mínimos",
      });
      return;
    }

    onNext({ password });
  };

  return (
    <>
      <DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">Paso 4 de 6</div>
        <DialogTitle className="text-2xl font-bold">
          Crea tu contraseña
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Establece una contraseña segura para tu cuenta. Debe cumplir con los siguientes requisitos:
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Security Level Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nivel de seguridad:</span>
              <span className="font-medium" style={{ color: getSecurityColor() }}>
                {getSecurityLabel()}
              </span>
            </div>
            <Progress 
              value={calculateSecurityLevel()} 
              className="h-2"
              style={{
                ['--progress-background' as any]: getSecurityColor()
              }}
            />
            <style>{`
              [style*="--progress-background"] .bg-primary {
                background-color: var(--progress-background) !important;
              }
            `}</style>
          </div>
        )}

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-sm text-destructive">Las contraseñas no coinciden</p>
          )}
        </div>

        {/* Requirements List */}
        <div className="space-y-2 p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="text-sm font-semibold mb-3">Requisitos de la contraseña:</h4>
          <div className="space-y-2">
            {requirements.map((req, index) => {
              const isMet = req.test(password);
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {isMet ? (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={isMet ? "text-foreground" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </>
  );
};

export default PasswordCreationStep;
