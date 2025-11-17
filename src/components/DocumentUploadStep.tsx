import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, Image as ImageIcon, RotateCw, Trash2, Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadStepProps {
  onNext: (data?: any) => void;
  onBack: () => void;
}

interface UploadedImage {
  file: File;
  preview: string;
}

const DocumentUploadStep = ({ onNext, onBack }: DocumentUploadStepProps) => {
  const [frontImage, setFrontImage] = useState<UploadedImage | null>(null);
  const [backImage, setBackImage] = useState<UploadedImage | null>(null);
  const [selfieImage, setSelfieImage] = useState<UploadedImage | null>(null);
  const [currentModal, setCurrentModal] = useState<"front" | "back" | "selfie" | null>(null);
  const [tempImage, setTempImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Solo se permiten imágenes en formatos PNG, JPG y JPEG.",
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setTempImage({ file, preview });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSave = () => {
    if (!tempImage) return;

    if (currentModal === "front") {
      setFrontImage(tempImage);
    } else if (currentModal === "back") {
      setBackImage(tempImage);
    } else if (currentModal === "selfie") {
      setSelfieImage(tempImage);
    }

    setCurrentModal(null);
    setTempImage(null);
  };

  const handleCancel = () => {
    if (tempImage?.preview) {
      URL.revokeObjectURL(tempImage.preview);
    }
    setTempImage(null);
    setCurrentModal(null);
  };

  const handleRotate = () => {
    // Placeholder for rotate functionality
    toast({
      title: "Función no disponible",
      description: "La rotación de imagen estará disponible próximamente.",
    });
  };

  const handleDelete = () => {
    if (tempImage?.preview) {
      URL.revokeObjectURL(tempImage.preview);
    }
    setTempImage(null);
  };

  const handleContinue = () => {
    if (frontImage && backImage && selfieImage) {
      onNext({
        frontImage: frontImage.file,
        backImage: backImage.file,
        selfieImage: selfieImage.file,
      });
    }
  };

  const canContinue = frontImage && backImage && selfieImage;

  const renderUploadModal = () => {
    const isSelfie = currentModal === "selfie";

    return (
      <Dialog open={currentModal !== null} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentModal === "front" && "CI/CIE Anverso"}
              {currentModal === "back" && "CI/CIE Reverso"}
              {currentModal === "selfie" && "Fotografía tuya sosteniendo tu CI/CIE"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isSelfie && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 text-sm mb-2">
                      Importante — Asegúrate de que la fotografía cumpla con los siguientes requisitos:
                    </p>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
                      <li>Sin lentes, gorras u otros accesorios</li>
                      <li>Sin brillo excesivo ni sombras</li>
                      <li>La imagen debe estar completa, sin cortes en el rostro</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Solo se permiten imágenes en formatos PNG, JPG y JPEG.</p>
              <p>La imagen debe ser legible para su procesamiento.</p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {tempImage ? (
                <div className="flex justify-center">
                  <img
                    src={tempImage.preview}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta tu imagen aquí
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!tempImage}
                onClick={() => document.getElementById("camera-input")?.click()}
                title="Cámara"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("file-input")?.click()}
                title="Galería"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!tempImage}
                onClick={handleRotate}
                title="Rotar"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!tempImage}
                onClick={handleDelete}
                title="Borrar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              className="hidden"
              onChange={handleFileInput}
            />
            <input
              id="camera-input"
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              capture="environment"
              className="hidden"
              onChange={handleFileInput}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!tempImage}
                onClick={handleSave}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderUploadSection = (
    title: string,
    image: UploadedImage | null,
    onOpen: () => void
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{title}</label>
      <div className="flex gap-3 items-center">
        {image ? (
          <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden bg-muted">
            <img
              src={image.preview}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onOpen}
          className="flex-1"
        >
          {image ? "Cambiar imagen" : "Subir imagen"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          Fotografías del documento
        </DialogTitle>
        <DialogDescription className="text-base pt-2">
          Paso 5 de 6
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <p className="text-sm text-muted-foreground">
          Sube las tres fotografías obligatorias para continuar con el registro.
        </p>

        {renderUploadSection("📄 CI/CIE Anverso", frontImage, () =>
          setCurrentModal("front")
        )}
        {renderUploadSection("📄 CI/CIE Reverso", backImage, () =>
          setCurrentModal("back")
        )}
        {renderUploadSection(
          "🧍 Fotografía personal sosteniendo CI/CIE",
          selfieImage,
          () => setCurrentModal("selfie")
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </div>
      </div>

      {renderUploadModal()}
    </>
  );
};

export default DocumentUploadStep;
