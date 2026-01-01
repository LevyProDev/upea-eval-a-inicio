import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeacherPersonalData, TeacherDocuments } from "./TeacherRegisterModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Building2,
  Phone,
  FileImage,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface TeacherSummaryStepProps {
  personalData: TeacherPersonalData;
  documents: TeacherDocuments;
  email: string;
  userId: string;
  onSuccess: () => void;
}

const TeacherSummaryStep = ({
  personalData,
  documents,
  email,
  userId,
  onSuccess,
}: TeacherSummaryStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFinalize = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("teachers").insert({
        user_id: userId,
        first_name: personalData.firstName,
        last_name: personalData.lastName,
        email: email,
        specialty: personalData.specialty,
        academic_degree: personalData.academicDegree,
        department: personalData.department,
        phone_number: personalData.phoneNumber || null,
        document_front_url: documents.documentFrontUrl,
        document_back_url: documents.documentBackUrl,
        selfie_url: documents.selfieUrl,
        registration_completed: true,
      });

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error al registrar docente:", error);
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description:
          error.message || "Ocurrió un error al guardar los datos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSuccess();
    navigate("/teacher-dashboard");
  };

  const summaryItems = [
    { icon: User, label: "Nombre", value: `${personalData.firstName} ${personalData.lastName}` },
    { icon: Mail, label: "Correo", value: email },
    { icon: BookOpen, label: "Especialidad", value: personalData.specialty },
    { icon: GraduationCap, label: "Grado Académico", value: personalData.academicDegree },
    { icon: Building2, label: "Departamento", value: personalData.department },
    { icon: Phone, label: "Teléfono", value: personalData.phoneNumber || "No especificado" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Confirmación de Registro
        </h3>
        <p className="text-sm text-muted-foreground">
          Revise sus datos antes de finalizar
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-2">
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Documentos Cargados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "CI Anverso", url: documents.documentFrontUrl },
              { label: "CI Reverso", url: documents.documentBackUrl },
              { label: "Selfie", url: documents.selfieUrl },
            ].map((doc) => (
              <div key={doc.label} className="text-center">
                <div className="rounded-lg overflow-hidden border bg-muted/30 mb-1">
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.svg";
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{doc.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleFinalize}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Registro
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 rounded-full bg-green-100 p-3 w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Registro completado con éxito
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Tus datos han sido guardados correctamente. Puedes continuar con
              el uso del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center sm:justify-center">
            <Button onClick={handleSuccessClose} className="min-w-[120px]">
              Finalizar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherSummaryStep;
