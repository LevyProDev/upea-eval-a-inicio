import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import TeacherPersonalDataStep from "./TeacherPersonalDataStep";
import TeacherDocumentUploadStep from "./TeacherDocumentUploadStep";
import TeacherSummaryStep from "./TeacherSummaryStep";

interface TeacherRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

export interface TeacherPersonalData {
  firstName: string;
  lastName: string;
  specialty: string;
  academicDegree: string;
  department: string;
  phoneNumber: string;
}

export interface TeacherDocuments {
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
}

const STEPS = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Documentos" },
  { id: 3, title: "Confirmación" },
];

const TeacherRegisterModal = ({
  open,
  onOpenChange,
  userId,
  userEmail,
}: TeacherRegisterModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalData, setPersonalData] = useState<TeacherPersonalData>({
    firstName: "",
    lastName: "",
    specialty: "",
    academicDegree: "",
    department: "",
    phoneNumber: "",
  });
  const [documents, setDocuments] = useState<TeacherDocuments>({
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

  const handlePersonalDataChange = (data: TeacherPersonalData) => {
    setPersonalData(data);
  };

  const handleDocumentsChange = (docs: TeacherDocuments) => {
    setDocuments(docs);
  };

  const isPersonalDataValid = () => {
    return (
      personalData.firstName.trim() !== "" &&
      personalData.lastName.trim() !== "" &&
      personalData.specialty.trim() !== "" &&
      personalData.academicDegree.trim() !== "" &&
      personalData.department.trim() !== ""
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
          <TeacherPersonalDataStep
            data={personalData}
            onChange={handlePersonalDataChange}
          />
        );
      case 2:
        return (
          <TeacherDocumentUploadStep
            documents={documents}
            onChange={handleDocumentsChange}
          />
        );
      case 3:
        return (
          <TeacherSummaryStep
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
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Registro de Docente</DialogTitle>
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

export default TeacherRegisterModal;
