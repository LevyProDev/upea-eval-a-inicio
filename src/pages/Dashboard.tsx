import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, LogOut, BookOpen, CheckCircle, ClipboardList, User } from "lucide-react";
import TeacherEvaluationModal from "@/components/TeacherEvaluationModal";

interface SubjectWithDetails {
  id: string;
  assignment_id: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  is_evaluated: boolean;
  evaluation_score?: number;
  blockchain_hash?: string;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  career_name?: string;
  semester?: number;
  enrollment_number?: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "student" });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [evaluationModal, setEvaluationModal] = useState<{
    open: boolean;
    assignmentId: string | null;
    subjectName: string;
    teacherName: string;
  }>({ open: false, assignmentId: null, subjectName: "", teacherName: "" });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSubjects();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select(`
          id,
          first_name,
          last_name,
          semester,
          enrollment_number,
          careers:career_id (name)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          career_name: (data.careers as any)?.name,
          semester: data.semester,
          enrollment_number: data.enrollment_number,
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSubjects = async () => {
    if (!user) return;

    try {
      // First get the student profile id
      const { data: profileData } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) {
        setLoadingSubjects(false);
        return;
      }

      // Get enrollments with subject and teacher info
      const { data: enrollments, error } = await supabase
        .from("student_enrollments")
        .select(`
          id,
          assignment_id,
          subject_assignments:assignment_id (
            id,
            subjects:subject_id (name, code),
            teachers:teacher_id (first_name, last_name)
          )
        `)
        .eq("student_id", profileData.id);

      if (error) throw error;

      // Get evaluations
      const { data: evaluations } = await supabase
        .from("teacher_evaluations")
        .select("assignment_id, total_score, blockchain_hash")
        .eq("student_id", profileData.id);

      const evaluationMap = new Map(
        evaluations?.map(e => [e.assignment_id, { score: e.total_score, hash: e.blockchain_hash }])
      );

      const subjectsWithDetails: SubjectWithDetails[] = (enrollments || []).map((enrollment: any) => {
        const assignment = enrollment.subject_assignments;
        const evaluation = evaluationMap.get(enrollment.assignment_id);
        
        return {
          id: enrollment.id,
          assignment_id: enrollment.assignment_id,
          subject_name: assignment?.subjects?.name || "Sin nombre",
          subject_code: assignment?.subjects?.code || "-",
          teacher_name: assignment?.teachers 
            ? `${assignment.teachers.first_name} ${assignment.teachers.last_name}` 
            : "Sin docente",
          is_evaluated: !!evaluation,
          evaluation_score: evaluation?.score,
          blockchain_hash: evaluation?.hash,
        };
      });

      setSubjects(subjectsWithDetails);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las materias",
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleOpenEvaluation = (subject: SubjectWithDetails) => {
    setEvaluationModal({
      open: true,
      assignmentId: subject.assignment_id,
      subjectName: subject.subject_name,
      teacherName: subject.teacher_name,
    });
  };

  const handleEvaluationComplete = () => {
    setEvaluationModal({ open: false, assignmentId: null, subjectName: "", teacherName: "" });
    fetchSubjects(); // Refresh the subjects list
    toast({
      title: "Evaluación registrada",
      description: "Tu evaluación ha sido guardada correctamente.",
    });
  };

  if (authLoading || roleLoading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UPEA</h1>
              <p className="text-xs text-muted-foreground">Sistema de Evaluación</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile.first_name} {profile.last_name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Perfil Académico</CardTitle>
                <CardDescription>Tu información como estudiante</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : profile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Carrera</p>
                  <p className="font-medium text-foreground">{profile.career_name || "Sin asignar"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Semestre</p>
                  <p className="font-medium text-foreground">{profile.semester || "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Matrícula</p>
                  <p className="font-medium text-foreground">{profile.enrollment_number || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No se encontró tu perfil de estudiante. Completa el registro para continuar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-secondary/10 p-3">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle>Materias del Semestre</CardTitle>
                  <CardDescription>Realiza la evaluación docente de tus materias activas</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubjects ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No tienes materias registradas este semestre.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Sigla</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, index) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{subject.subject_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{subject.subject_code}</Badge>
                        </TableCell>
                        <TableCell>{subject.teacher_name}</TableCell>
                        <TableCell className="text-right">
                          {subject.is_evaluated ? (
                            <div className="flex items-center justify-end gap-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Evaluado ({subject.evaluation_score}/70)
                              </Badge>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleOpenEvaluation(subject)}
                            >
                              Realizar evaluación
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluation History */}
        {subjects.some(s => s.is_evaluated) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Historial de Evaluaciones</CardTitle>
              <CardDescription>Evaluaciones completadas con su puntaje y hash de verificación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjects.filter(s => s.is_evaluated).map((subject) => (
                  <div 
                    key={subject.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{subject.subject_name}</p>
                      <p className="text-sm text-muted-foreground">{subject.teacher_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{subject.evaluation_score}/70 pts</p>
                      {subject.blockchain_hash && (
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                          Hash: {subject.blockchain_hash.slice(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Evaluation Modal */}
      {evaluationModal.assignmentId && profile && (
        <TeacherEvaluationModal
          open={evaluationModal.open}
          onOpenChange={(open) => setEvaluationModal(prev => ({ ...prev, open }))}
          assignmentId={evaluationModal.assignmentId}
          studentId={profile.id}
          subjectName={evaluationModal.subjectName}
          teacherName={evaluationModal.teacherName}
          onComplete={handleEvaluationComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
