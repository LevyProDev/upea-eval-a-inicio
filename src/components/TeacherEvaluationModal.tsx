import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface TeacherEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  studentId: string;
  subjectName: string;
  teacherName: string;
  onComplete: () => void;
}

const EVALUATION_QUESTIONS = [
  {
    id: 1,
    category: "Dominio del tema",
    question: "¿El docente demuestra conocimiento profundo de la materia?",
    maxPoints: 10,
  },
  {
    id: 2,
    category: "Dominio del tema",
    question: "¿El docente responde adecuadamente las preguntas de los estudiantes?",
    maxPoints: 10,
  },
  {
    id: 3,
    category: "Metodología",
    question: "¿La metodología de enseñanza facilita el aprendizaje?",
    maxPoints: 10,
  },
  {
    id: 4,
    category: "Metodología",
    question: "¿El docente utiliza recursos didácticos apropiados?",
    maxPoints: 10,
  },
  {
    id: 5,
    category: "Puntualidad y asistencia",
    question: "¿El docente cumple con el horario de clases?",
    maxPoints: 10,
  },
  {
    id: 6,
    category: "Comunicación",
    question: "¿El docente se comunica de manera clara y efectiva?",
    maxPoints: 10,
  },
  {
    id: 7,
    category: "Evaluación",
    question: "¿Los criterios de evaluación son claros y justos?",
    maxPoints: 10,
  },
];

const SCORE_OPTIONS = [
  { value: 0, label: "Deficiente (0)" },
  { value: 3, label: "Regular (3)" },
  { value: 5, label: "Bueno (5)" },
  { value: 7, label: "Muy bueno (7)" },
  { value: 10, label: "Excelente (10)" },
];

const TeacherEvaluationModal = ({
  open,
  onOpenChange,
  assignmentId,
  studentId,
  subjectName,
  teacherName,
  onComplete,
}: TeacherEvaluationModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalQuestions = EVALUATION_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentQ = EVALUATION_QUESTIONS[currentQuestion];

  const handleScoreChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (responses[currentQ.id] === undefined) {
      toast({
        variant: "destructive",
        title: "Selecciona una opción",
        description: "Debes responder esta pregunta para continuar.",
      });
      return;
    }
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateTotalScore = () => {
    return Object.values(responses).reduce((sum, score) => sum + score, 0);
  };

  const generateSimulatedHash = () => {
    const chars = 'abcdef0123456789';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unanswered = EVALUATION_QUESTIONS.filter(q => responses[q.id] === undefined);
    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Evaluación incompleta",
        description: "Debes responder todas las preguntas.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totalScore = calculateTotalScore();
      const blockchainHash = generateSimulatedHash();

      const { error } = await supabase.from("teacher_evaluations").insert({
        student_id: studentId,
        assignment_id: assignmentId,
        total_score: totalScore,
        responses: responses,
        blockchain_hash: blockchainHash,
      });

      if (error) throw error;

      onComplete();
    } catch (error: any) {
      console.error("Error submitting evaluation:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la evaluación.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = EVALUATION_QUESTIONS.every(q => responses[q.id] !== undefined);
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Evaluación Docente</DialogTitle>
          <DialogDescription>
            {subjectName} - {teacherName}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Pregunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="font-medium text-primary">
              {calculateTotalScore()}/70 pts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="max-h-[400px] pr-4">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {currentQ.category}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {currentQ.question}
            </h3>

            <RadioGroup
              value={responses[currentQ.id]?.toString()}
              onValueChange={handleScoreChange}
              className="space-y-3"
            >
              {SCORE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    responses[currentQ.id] === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleScoreChange(option.value.toString())}
                >
                  <RadioGroupItem value={option.value.toString()} id={`q${currentQ.id}-${option.value}`} />
                  <Label 
                    htmlFor={`q${currentQ.id}-${option.value}`} 
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question Navigator */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {EVALUATION_QUESTIONS.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  responses[q.id] !== undefined
                    ? "bg-primary text-primary-foreground"
                    : index === currentQuestion
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          {isLastQuestion && allAnswered ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar evaluación
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherEvaluationModal;
