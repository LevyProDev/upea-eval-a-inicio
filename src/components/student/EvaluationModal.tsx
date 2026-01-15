import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  ThumbsUp, 
  Meh, 
  ThumbsDown, 
  Printer,
  Send,
  Edit,
  CheckCircle,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  paralelo?: string;
  sede?: string;
  onComplete: (score: number) => void;
}

interface EvaluationQuestion {
  id: number;
  category: string;
  question: string;
  maxPoints: number;
}

const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 1,
    category: "Preparación pedagógica",
    question: "Preparación pedagógica (didáctica y metodológica)",
    maxPoints: 20,
  },
  {
    id: 2,
    category: "Dominio del contenido",
    question: "Dominio del contenido educativo",
    maxPoints: 20,
  },
  {
    id: 3,
    category: "Cumplimiento",
    question: "Cumplimiento del plan académico",
    maxPoints: 10,
  },
  {
    id: 4,
    category: "Puntualidad",
    question: "Puntualidad en los horarios establecidos",
    maxPoints: 10,
  },
  {
    id: 5,
    category: "Evaluación",
    question: "Objetividad en la evaluación del aprendizaje",
    maxPoints: 10,
  },
];

interface ScoreOption {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const getScoreOptions = (maxPoints: number): ScoreOption[] => [
  { 
    value: maxPoints, 
    label: "Excelente", 
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-300 dark:border-amber-700"
  },
  { 
    value: Math.round(maxPoints * 0.7), 
    label: "Bueno", 
    icon: ThumbsUp,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-300 dark:border-green-700"
  },
  { 
    value: Math.round(maxPoints * 0.4), 
    label: "Regular", 
    icon: Meh,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-300 dark:border-orange-700"
  },
  { 
    value: 0, 
    label: "Pésimo", 
    icon: ThumbsDown,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-300 dark:border-red-700"
  },
];

const EvaluationModal = ({
  open,
  onOpenChange,
  subjectName,
  subjectCode,
  teacherName,
  paralelo = "A",
  sede = "Campus Central",
  onComplete,
}: EvaluationModalProps) => {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Reset responses when modal opens
  useEffect(() => {
    if (open) {
      setResponses({});
    }
  }, [open]);

  const handleSelectScore = (questionId: number, score: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(responses).reduce((sum, score) => sum + score, 0);
  };

  const allQuestionsAnswered = EVALUATION_QUESTIONS.every(
    q => responses[q.id] !== undefined
  );

  const handlePrintPDF = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = () => {
    const scoreLabels: Record<number, string> = {};
    EVALUATION_QUESTIONS.forEach(q => {
      const options = getScoreOptions(q.maxPoints);
      const selectedOption = options.find(o => o.value === responses[q.id]);
      scoreLabels[q.id] = selectedOption?.label || 'No respondida';
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evaluación Docente - ${subjectCode}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #577aa0; padding-bottom: 20px; }
          .header h1 { color: #577aa0; margin: 0; font-size: 24px; }
          .header h2 { color: #446285; margin: 10px 0; font-size: 18px; }
          .header p { margin: 5px 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; }
          .info-item { padding: 10px; background: #f5f7fa; border-radius: 8px; }
          .info-label { font-size: 12px; color: #666; }
          .info-value { font-weight: bold; color: #1e2733; }
          .questions { margin-bottom: 30px; }
          .question { padding: 15px; border: 1px solid #d0dae7; border-radius: 8px; margin-bottom: 10px; }
          .question-text { font-weight: bold; margin-bottom: 5px; }
          .question-response { color: #577aa0; }
          .total { text-align: center; font-size: 24px; color: #577aa0; font-weight: bold; padding: 20px; background: #f5f7fa; border-radius: 8px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d0dae7; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Universidad Pública de El Alto</h1>
          <h2>Carrera: Ciencias de la Educación</h2>
          <p><strong>Formulario de Evaluación Permanente Docente</strong></p>
          <p>Periodo Académico: Semestral I/2025</p>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Asignatura</div>
            <div class="info-value">${subjectName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Sigla</div>
            <div class="info-value">${subjectCode}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Docente</div>
            <div class="info-value">${teacherName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Paralelo / Sede</div>
            <div class="info-value">${paralelo} / ${sede}</div>
          </div>
        </div>
        <div class="questions">
          ${EVALUATION_QUESTIONS.map((q, i) => `
            <div class="question">
              <div class="question-text">${i + 1}. ${q.question} (máx. ${q.maxPoints} pts)</div>
              <div class="question-response">Respuesta: ${scoreLabels[q.id]} - ${responses[q.id] ?? 0} pts</div>
            </div>
          `).join('')}
        </div>
        <div class="total">
          Puntaje Total: ${calculateTotalScore()}/70 puntos
        </div>
        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleDateString('es-BO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>Sistema de Evaluación Docente - UPEA</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleSubmitClick = () => {
    if (!allQuestionsAnswered) {
      toast({
        variant: "destructive",
        title: "Evaluación incompleta",
        description: "Debes responder todas las preguntas antes de enviar.",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    const totalScore = calculateTotalScore();
    onComplete(totalScore);
    setShowConfirmDialog(false);
    onOpenChange(false);
    toast({
      title: "Evaluación registrada",
      description: `Tu evaluación ha sido guardada con un puntaje de ${totalScore}/70 puntos.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[95vh] p-0 overflow-hidden">
          {/* Institutional Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-white/20 p-2">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Universidad Pública de El Alto</h2>
                <p className="text-sm opacity-90">Carrera: Ciencias de la Educación</p>
              </div>
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl text-primary-foreground">
                Formulario de Evaluación Permanente Docente
              </DialogTitle>
              <p className="text-sm opacity-90">Periodo Académico: Semestral I/2025</p>
            </DialogHeader>
          </div>

          {/* Subject Info */}
          <div className="px-6 py-4 bg-muted/30 border-b border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Asignatura</p>
                <p className="font-medium">{subjectName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sigla</p>
                <p className="font-medium">{subjectCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Docente</p>
                <p className="font-medium">{teacherName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Paralelo / Sede</p>
                <p className="font-medium">{paralelo} / {sede}</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-6 space-y-8">
              {EVALUATION_QUESTIONS.map((question, index) => {
                const options = getScoreOptions(question.maxPoints);
                const selectedValue = responses[question.id];

                return (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {question.question}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Puntaje máximo: {question.maxPoints} puntos
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-11">
                      {options.map((option) => {
                        const isSelected = selectedValue === option.value;
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSelectScore(question.id, option.value)}
                            className={cn(
                              "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                              "hover:scale-[1.02] hover:shadow-md",
                              isSelected
                                ? `${option.bgColor} ${option.borderColor} ring-2 ring-offset-2 ring-offset-background`
                                : "bg-card border-border hover:border-muted-foreground/30",
                              selectedValue !== undefined && !isSelected && "opacity-40"
                            )}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Icon className={cn(
                                "h-8 w-8 transition-colors",
                                isSelected ? option.color : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "font-medium text-sm",
                                isSelected ? option.color : "text-foreground"
                              )}>
                                {option.label}
                              </span>
                              <span className={cn(
                                "text-xs font-semibold",
                                isSelected ? option.color : "text-muted-foreground"
                              )}>
                                {option.value} pts
                              </span>
                            </div>
                            {isSelected && (
                              <div className={cn(
                                "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center",
                                option.bgColor
                              )}>
                                <CheckCircle className={cn("h-4 w-4", option.color)} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-muted-foreground">Puntaje Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {calculateTotalScore()}<span className="text-lg text-muted-foreground">/70</span>
                  </p>
                </div>
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {Object.keys(responses).length} de {EVALUATION_QUESTIONS.length} preguntas respondidas
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handlePrintPDF}
                  disabled={!allQuestionsAnswered}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir PDF
                </Button>
                <Button 
                  onClick={handleSubmitClick}
                  disabled={!allQuestionsAnswered}
                  className="min-w-[140px]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar evaluación</AlertDialogTitle>
            <AlertDialogDescription>
              Los datos no se podrán modificar después de confirmar. 
              ¿Estás seguro de que deseas enviar tu evaluación con un puntaje de {calculateTotalScore()}/70 puntos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EvaluationModal;
