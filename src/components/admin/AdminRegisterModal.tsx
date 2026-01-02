import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import AdminPersonalDataStep, { AdminPersonalData } from "./AdminPersonalDataStep";
import AdminDocumentUploadStep, { AdminDocuments } from "./AdminDocumentUploadStep";
import AdminSummaryStep from "./AdminSummaryStep";

interface AdminRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

const STEPS = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Documentos" },
  { id: 3, title: "Confirmación" },
];

const AdminRegisterModal = ({
  open,
  onOpenChange,
  userId,
  userEmail,
}: AdminRegisterModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalData, setPersonalData] = useState<AdminPersonalData>({
    firstName: "",
    lastName: "",
    administrativePosition: "",
    department: "",
    phoneNumber: "",
    documentType: "CI",
    documentNumber: "",
  });
  const [documents, setDocuments] = useState<AdminDocuments>({
    documentFrontUrl: "",
    documentBackUrl: "",
    selfieUrl: "",
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePersonalDataChange = (data: AdminPersonalData) => {
    setPersonalData(data);
  };

  const handleDocumentsChange = (docs: AdminDocuments) => {
    setDocuments(docs);
  };

  const isPersonalDataValid = () => {
    return (
      personalData.firstName.trim() !== "" &&
      personalData.lastName.trim() !== "" &&
      personalData.administrativePosition.trim() !== "" &&
      personalData.department.trim() !== "" &&
      personalData.documentType.trim() !== "" &&
      personalData.documentNumber.trim() !== ""
    );
  };

  const isDocumentsValid = () => {
    return (
      documents.documentFrontUrl.trim() !== "" &&
      documents.documentBackUrl.trim() !== "" &&
      documents.selfieUrl.trim() !== ""
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isPersonalDataValid();
      case 2:
        return isDocumentsValid();
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AdminPersonalDataStep
            data={personalData}
            email={userEmail}
            onChange={handlePersonalDataChange}
          />
        );
      case 2:
        return (
          <AdminDocumentUploadStep
            documents={documents}
            onChange={handleDocumentsChange}
          />
        );
      case 3:
        return (
          <AdminSummaryStep
            personalData={personalData}
            documents={documents}
            email={userEmail}
            userId={userId}
            onSuccess={() => onOpenChange(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary p-2">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Registro Administrativo</DialogTitle>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Paso {currentStep} de {STEPS.length}</span>
              <span>{STEPS[currentStep - 1].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-4">{renderStep()}</div>

        {currentStep < 3 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button onClick={handleNextStep} disabled={!canProceed()}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminRegisterModal;
