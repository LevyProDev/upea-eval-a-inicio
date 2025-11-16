import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhoneVerificationStepProps {
  onNext: (phone: string) => void;
  onBack: () => void;
}

const PhoneVerificationStep = ({ onNext, onBack }: PhoneVerificationStepProps) => {
  const [countryCode, setCountryCode] = useState("+591");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string, code: string): boolean => {
    if (!phone.trim()) {
      setError("Este campo es obligatorio");
      return false;
    }

    // Validación básica para Bolivia (+591): debe tener 8 dígitos
    if (code === "+591" && phone.length !== 8) {
      setError("Número de celular inválido");
      return false;
    }

    // Validación genérica para otros países: al menos 6 dígitos
    if (code !== "+591" && phone.length < 6) {
      setError("Número de celular inválido");
      return false;
    }

    setError("");
    return true;
  };

  const handleContinue = () => {
    if (validatePhoneNumber(phoneNumber, countryCode)) {
      const fullPhone = `${countryCode} ${phoneNumber}`;
      toast({
        title: "Número verificado",
        description: "Enviando código de verificación...",
      });
      onNext(fullPhone);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    const cleanValue = value.replace(/\D/g, "");
    setPhoneNumber(cleanValue);
    if (error && cleanValue) {
      validatePhoneNumber(cleanValue, countryCode);
    }
  };

  const isValid = phoneNumber.trim().length > 0 && !error;

  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">Paso 1 de 6</p>
        <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: "16.67%" }} />
        </div>
      </div>

      {/* Título e instrucción */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          Verificación de número de teléfono
        </h3>
        <p className="text-sm text-muted-foreground">
          Ingresa tu número de celular. Si es boliviano, te enviaremos un código de verificación por SMS.
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="countryCode">País</Label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger id="countryCode">
              <SelectValue placeholder="Selecciona un país" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+591">🇧🇴 Bolivia (+591)</SelectItem>
              <SelectItem value="+54">🇦🇷 Argentina (+54)</SelectItem>
              <SelectItem value="+55">🇧🇷 Brasil (+55)</SelectItem>
              <SelectItem value="+56">🇨🇱 Chile (+56)</SelectItem>
              <SelectItem value="+57">🇨🇴 Colombia (+57)</SelectItem>
              <SelectItem value="+593">🇪🇨 Ecuador (+593)</SelectItem>
              <SelectItem value="+51">🇵🇪 Perú (+51)</SelectItem>
              <SelectItem value="+1">🇺🇸 Estados Unidos (+1)</SelectItem>
              <SelectItem value="+34">🇪🇸 España (+34)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Número de celular</Label>
          <div className="flex gap-2">
            <div className="flex items-center justify-center px-3 py-2 rounded-md border border-input bg-muted/30 text-sm font-medium min-w-[80px]">
              {countryCode}
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="75123456"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={error ? "border-destructive" : ""}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Anterior
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
  );
};

export default PhoneVerificationStep;
