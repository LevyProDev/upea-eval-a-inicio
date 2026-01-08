import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface RegistrationSummaryStepProps {
  onBack: () => void;
  onFinish: () => void;
  phoneNumber: string;
  email: string;
  personalData: {
    documentType: string;
    documentNumber: string;
    firstName: string;
    firstLastName: string;
    secondLastName: string;
    birthDate: string;
  };
  documents: {
    front: string | null;
    back: string | null;
    selfie: string | null;
  };
}

const RegistrationSummaryStep = ({
  onBack,
  onFinish,
  phoneNumber,
  email,
  personalData,
  documents,
}: RegistrationSummaryStepProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onFinish();
    navigate("/");
  };

  const handleFinalize = () => {
    // Validar que todos los datos estén completos
    if (
      !phoneNumber ||
      !email ||
      !personalData?.firstName ||
      !documents?.front ||
      !documents?.back ||
      !documents?.selfie
    ) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Falta completar o verificar uno o más campos. Revisa antes de continuar.",
      });
      return;
    }

    // Aquí iría la lógica de guardado en backend
    setShowSuccessModal(true);
  };

  const fullName = `${personalData?.firstName || ""} ${personalData?.firstLastName || ""} ${personalData?.secondLastName || ""}`.trim();

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Paso 6 de 6</p>
        </div>
        <DialogTitle className="text-2xl font-bold">
          Resumen de registro
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Verifica que tus datos sean correctos antes de finalizar el registro.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
        {/* Datos Personales */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground mb-3">Datos Personales</h3>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Nombre completo</Label>
            <p className="text-base text-foreground">{fullName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tipo de documento</Label>
              <p className="text-base text-foreground">{personalData?.documentType || "-"}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Número de documento</Label>
              <p className="text-base text-foreground">{personalData?.documentNumber || "-"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Fecha de nacimiento</Label>
            <p className="text-base text-foreground">{personalData?.birthDate || "-"}</p>
          </div>
        </Card>

        {/* Contacto y Verificación */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground mb-3">Contacto y Verificación</h3>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Número de celular</Label>
            <div className="flex items-center gap-2">
              <p className="text-base text-foreground">{phoneNumber || "-"}</p>
              {phoneNumber && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Verificado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Correo electrónico</Label>
            <div className="flex items-center gap-2">
              <p className="text-base text-foreground">{email || "-"}</p>
              {email && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Verificado
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Documentos Subidos */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground mb-3">Documentos Subidos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">CI/CIE Anverso</Label>
              {documents?.front ? (
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-border">
                  <img
                    src={documents.front}
                    alt="CI/CIE Anverso"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] rounded-lg border border-dashed border-border flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Imagen no disponible. Revisa el paso anterior.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">CI/CIE Reverso</Label>
              {documents?.back ? (
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-border">
                  <img
                    src={documents.back}
                    alt="CI/CIE Reverso"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] rounded-lg border border-dashed border-border flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Imagen no disponible. Revisa el paso anterior.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Fotografía personal</Label>
              {documents?.selfie ? (
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-border">
                  <img
                    src={documents.selfie}
                    alt="Fotografía personal"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] rounded-lg border border-dashed border-border flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Imagen no disponible. Revisa el paso anterior.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button
          onClick={handleFinalize}
          className="flex-1"
        >
          Finalizar registro
        </Button>
      </div>

      {/* Modal de éxito */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl">
              Registro completado con éxito
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Tus datos han sido guardados correctamente. Puedes continuar con el uso del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={handleSuccessClose}
              className="w-full"
            >
              Finalizar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RegistrationSummaryStep;
