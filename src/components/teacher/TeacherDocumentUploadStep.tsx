import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherDocuments } from "./TeacherRegisterModal";
import { FileImage, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeacherDocumentUploadStepProps {
  documents: TeacherDocuments;
  onChange: (documents: TeacherDocuments) => void;
}

const TeacherDocumentUploadStep = ({
  documents,
  onChange,
}: TeacherDocumentUploadStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof TeacherDocuments, value: string) => {
    onChange({ ...documents, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const documentFields = [
    {
      id: "documentFrontUrl",
      label: "CI/CIE Anverso",
      placeholder: "https://ejemplo.com/documento-frente.jpg",
      icon: FileImage,
      description: "URL de la imagen del frente de su documento de identidad",
    },
    {
      id: "documentBackUrl",
      label: "CI/CIE Reverso",
      placeholder: "https://ejemplo.com/documento-reverso.jpg",
      icon: FileImage,
      description: "URL de la imagen del reverso de su documento de identidad",
    },
    {
      id: "selfieUrl",
      label: "Foto Sosteniendo Documento",
      placeholder: "https://ejemplo.com/selfie-documento.jpg",
      icon: User,
      description: "URL de una foto suya sosteniendo su documento de identidad",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Documentos de Verificación
        </h3>
        <p className="text-sm text-muted-foreground">
          Ingrese las URLs de los documentos requeridos
        </p>
      </div>

      <Alert className="bg-muted/50 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Por favor, ingrese URLs válidas de imágenes para cada documento. Las
          imágenes deben ser claras y legibles.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {documentFields.map((field) => {
          const Icon = field.icon;
          const value = documents[field.id as keyof TeacherDocuments];
          const isValid = value ? validateUrl(value) : true;

          return (
            <Card
              key={field.id}
              className={`transition-all ${
                value && isValid
                  ? "border-primary/50 bg-primary/5"
                  : value && !isValid
                  ? "border-destructive/50 bg-destructive/5"
                  : ""
              }`}
            >
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor={field.id}
                    className="flex items-center gap-2 font-medium"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {field.label}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {field.description}
                  </p>
                  <Input
                    id={field.id}
                    type="url"
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        field.id as keyof TeacherDocuments,
                        e.target.value
                      )
                    }
                    className={
                      value && !isValid ? "border-destructive" : ""
                    }
                  />
                  {value && !isValid && (
                    <p className="text-xs text-destructive">
                      Por favor ingrese una URL válida
                    </p>
                  )}
                  {value && isValid && (
                    <div className="mt-2 rounded-lg overflow-hidden border bg-muted/30">
                      <img
                        src={value}
                        alt={field.label}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherDocumentUploadStep;
