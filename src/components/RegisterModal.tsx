import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CreditCard, Mail, Phone, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PhoneVerificationStep from "./PhoneVerificationStep";
import PhoneCodeVerificationStep from "./PhoneCodeVerificationStep";
import EmailVerificationStep from "./EmailVerificationStep";
import EmailCodeVerificationStep from "./EmailCodeVerificationStep";
import PersonalDataStep from "./PersonalDataStep";
import PasswordCreationStep from "./PasswordCreationStep";
import DocumentUploadStep from "./DocumentUploadStep";
import RegistrationSummaryStep from "./RegistrationSummaryStep";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RegisterModal = ({ open, onOpenChange }: RegisterModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [personalData, setPersonalData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [documents, setDocuments] = useState<any>(null);
  const { toast } = useToast();

  const handleStartRegistration = () => {
    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Términos y condiciones requeridos",
        description: "Debes aceptar los términos y condiciones para continuar",
      });
      return;
    }
    
    setCurrentStep(1);
  };

  const handleNextStep = (data?: any) => {
    if (currentStep === 1) {
      setPhoneNumber(data || "");
    } else if (currentStep === 3) {
      setEmail(data || "");
    } else if (currentStep === 5) {
      setPersonalData(data);
    } else if (currentStep === 6) {
      setPassword(data?.password || "");
    } else if (currentStep === 7) {
      // Convert File objects to preview URLs for display
      if (data?.frontImage && data?.backImage && data?.selfieImage) {
        setDocuments({
          front: URL.createObjectURL(data.frontImage),
          back: URL.createObjectURL(data.backImage),
          selfie: URL.createObjectURL(data.selfieImage),
        });
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {currentStep === 0 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Formulario de registro
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Antes de empezar, debes contar con los siguientes requisitos:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Lista de requisitos */}
              <div className="space-y-4">
                {/* Requisito 1 */}
                <div className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Carnet de identidad o Pasaporte vigente
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Debe ser tu carnet o pasaporte
                    </p>
                  </div>
                </div>

                {/* Requisito 2 */}
                <div className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-secondary/10 p-3">
                      <Mail className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Correo electrónico
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Enviaremos un correo de confirmación
                    </p>
                  </div>
                </div>

                {/* Requisito 3 */}
                <div className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-accent/10 p-3">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Número de celular boliviano o extranjero
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Enviaremos un SMS de confirmación si el número es boliviano
                    </p>
                  </div>
                </div>

                {/* Requisito 4 */}
                <div className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Cámara
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Para subir fotografía de tu carnet o pasaporte
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox de términos y condiciones */}
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  He leído y acepto los términos y condiciones
                </Label>
              </div>

              {/* Botón de acción */}
              <Button
                onClick={handleStartRegistration}
                disabled={!acceptedTerms}
                size="lg"
                className="w-full"
              >
                Empezar
              </Button>
            </div>
          </>
        ) : currentStep === 1 ? (
          <PhoneVerificationStep onNext={handleNextStep} onBack={handlePreviousStep} />
        ) : currentStep === 2 ? (
          <PhoneCodeVerificationStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            phoneNumber={phoneNumber}
          />
        ) : currentStep === 3 ? (
          <EmailVerificationStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        ) : currentStep === 4 ? (
          <EmailCodeVerificationStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            email={email}
          />
        ) : currentStep === 5 ? (
          <PersonalDataStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        ) : currentStep === 6 ? (
          <PasswordCreationStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        ) : currentStep === 7 ? (
          <DocumentUploadStep
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        ) : currentStep === 8 ? (
          <RegistrationSummaryStep
            onBack={handlePreviousStep}
            phoneNumber={phoneNumber}
            email={email}
            personalData={personalData}
            documents={documents}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
