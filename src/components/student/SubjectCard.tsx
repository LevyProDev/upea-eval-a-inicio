import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, CheckCircle, ClipboardList } from "lucide-react";

interface SubjectCardProps {
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  isEvaluated: boolean;
  evaluationScore?: number;
  evaluationDate?: string;
  onEvaluate: () => void;
}

const SubjectCard = ({
  subjectName,
  subjectCode,
  teacherName,
  isEvaluated,
  evaluationScore,
  evaluationDate,
  onEvaluate,
}: SubjectCardProps) => {
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {subjectCode}
            </Badge>
          </div>
          {isEvaluated && (
            <Badge 
              variant="outline" 
              className="bg-green-500/10 text-green-700 border-green-500/30 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Evaluada
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-3 leading-tight line-clamp-2">
          {subjectName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <User className="h-4 w-4" />
          <span className="line-clamp-1">{teacherName}</span>
        </div>

        {isEvaluated ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div>
                <p className="text-xs text-muted-foreground">Puntaje obtenido</p>
                <p className="font-semibold text-green-700">{evaluationScore}/70 pts</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
            {evaluationDate && (
              <p className="text-xs text-muted-foreground text-center">
                Evaluado el {evaluationDate}
              </p>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              disabled
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Asignatura evaluada
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={onEvaluate}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Evaluar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
