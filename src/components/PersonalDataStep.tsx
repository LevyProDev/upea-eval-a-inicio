import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonalDataStepProps {
  onNext: (data?: any) => void;
  onBack: () => void;
}

const PersonalDataStep = ({ onNext, onBack }: PersonalDataStepProps) => {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [firstLastName, setFirstLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateDocumentNumber = (value: string, type: string): boolean => {
    if (!value) return false;
    
    // Formato: números y opcionalmente guión con complemento (ej: 1234567-1K)
    const ciPattern = /^\d{5,10}(-[0-9A-Z]{1,2})?$/;
    return ciPattern.test(value);
  };

  const validateDate = (value: string): boolean => {
    if (!value) return false;
    
    // Formato dd/mm/aaaa
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(datePattern);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Validar rangos básicos
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    // Validar fecha real
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const handleDocumentNumberChange = (value: string) => {
    setDocumentNumber(value);
    
    if (value && documentType) {
      if (!validateDocumentNumber(value, documentType)) {
        setErrors(prev => ({ ...prev, documentNumber: "Número de documento inválido" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.documentNumber;
          return newErrors;
        });
      }
    }
  };

  const handleBirthDateChange = (value: string) => {
    // Auto-formatear mientras escribe
    let formatted = value.replace(/\D/g, '');
    
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    
    setBirthDate(formatted);
    
    if (formatted.length === 10) {
      if (!validateDate(formatted)) {
        setErrors(prev => ({ ...prev, birthDate: "Formato de fecha inválido" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.birthDate;
          return newErrors;
        });
      }
    }
  };

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    if (!documentType) {
      newErrors.documentType = "Este campo es obligatorio";
    }

    if (!documentNumber) {
      newErrors.documentNumber = "Este campo es obligatorio";
    } else if (!validateDocumentNumber(documentNumber, documentType)) {
      newErrors.documentNumber = "Número de documento inválido";
    }

    if (!firstName.trim()) {
      newErrors.firstName = "Este campo es obligatorio";
    }

    if (!firstLastName.trim()) {
      newErrors.firstLastName = "Este campo es obligatorio";
    }

    if (!secondLastName.trim()) {
      newErrors.secondLastName = "Este campo es obligatorio";
    }

    if (!birthDate) {
      newErrors.birthDate = "Este campo es obligatorio";
    } else if (!validateDate(birthDate)) {
      newErrors.birthDate = "Formato de fecha inválido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        variant: "destructive",
        title: "Formulario incompleto",
        description: "Por favor completa todos los campos correctamente",
      });
      return;
    }

    const personalData = {
      documentType,
      documentNumber,
      firstName: firstName.trim(),
      firstLastName: firstLastName.trim(),
      secondLastName: secondLastName.trim(),
      birthDate,
    };

    onNext(personalData);
  };

  const isFormValid = 
    documentType &&
    documentNumber &&
    validateDocumentNumber(documentNumber, documentType) &&
    firstName.trim() &&
    firstLastName.trim() &&
    secondLastName.trim() &&
    birthDate &&
    validateDate(birthDate) &&
    Object.keys(errors).length === 0;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Paso 3 de 6</span>
        </div>
        <DialogTitle className="text-2xl font-bold">
          Datos personales
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Completa todos los campos obligatorios con tus datos reales.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Tipo de documento */}
        <div className="space-y-2">
          <Label htmlFor="documentType">
            Tipo de documento <span className="text-destructive">*</span>
          </Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="documentType" className={errors.documentType ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CI">CI - Carnet de Identidad</SelectItem>
              <SelectItem value="CIE">CIE - Carnet de Identidad Extranjero</SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && (
            <p className="text-sm text-destructive">{errors.documentType}</p>
          )}
        </div>

        {/* Número de documento */}
        <div className="space-y-2">
          <Label htmlFor="documentNumber">
            Número de documento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="documentNumber"
            placeholder="Ej: 1234567-1K"
            value={documentNumber}
            onChange={(e) => handleDocumentNumberChange(e.target.value)}
            className={errors.documentNumber ? "border-destructive" : ""}
          />
          {errors.documentNumber && (
            <p className="text-sm text-destructive">{errors.documentNumber}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Formato: números con complemento opcional (ej: 1234567-1K)
          </p>
        </div>

        {/* Nombre(s) */}
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nombre(s) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Ingresa tu(s) nombre(s)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        {/* Primer apellido */}
        <div className="space-y-2">
          <Label htmlFor="firstLastName">
            Primer apellido <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstLastName"
            placeholder="Ingresa tu primer apellido"
            value={firstLastName}
            onChange={(e) => setFirstLastName(e.target.value)}
            className={errors.firstLastName ? "border-destructive" : ""}
          />
          {errors.firstLastName && (
            <p className="text-sm text-destructive">{errors.firstLastName}</p>
          )}
        </div>

        {/* Segundo apellido */}
        <div className="space-y-2">
          <Label htmlFor="secondLastName">
            Segundo apellido <span className="text-destructive">*</span>
          </Label>
          <Input
            id="secondLastName"
            placeholder="Ingresa tu segundo apellido"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            className={errors.secondLastName ? "border-destructive" : ""}
          />
          {errors.secondLastName && (
            <p className="text-sm text-destructive">{errors.secondLastName}</p>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">
            Fecha de nacimiento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="birthDate"
            placeholder="dd/mm/aaaa"
            value={birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            maxLength={10}
            className={errors.birthDate ? "border-destructive" : ""}
          />
          {errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Formato: dd/mm/aaaa
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
        >
          Continuar
        </Button>
      </div>
    </>
  );
};

export default PersonalDataStep;
