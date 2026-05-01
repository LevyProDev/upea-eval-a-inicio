import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, LogOut, BookOpen, User, Calendar, Hash } from "lucide-react";
import SubjectCard from "@/components/student/SubjectCard";
import EvaluationModal from "@/components/student/EvaluationModal";
import { 
  MOCK_STUDENT_PROFILE, 
  MOCK_SUBJECTS, 
  getStoredEvaluation, 
  saveEvaluation,
  StoredEvaluation 
} from "@/lib/mockData";

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
  const { user, loading: authLoading, signOut, isDemoMode, demoUser } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "student" });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [evaluations, setEvaluations] = useState<Record<string, StoredEvaluation>>({});
  const [evaluationModal, setEvaluationModal] = useState<{
    open: boolean;
    subject: typeof MOCK_SUBJECTS[0] | null;
  }>({ open: false, subject: null });

  // Load stored evaluations from localStorage
  useEffect(() => {
    const storedEvaluations: Record<string, StoredEvaluation> = {};
    MOCK_SUBJECTS.forEach(subject => {
      const stored = getStoredEvaluation(subject.code);
      if (stored) {
        storedEvaluations[subject.code] = stored;
      }
    });
    setEvaluations(storedEvaluations);
  }, []);

  useEffect(() => {
    // For demo mode or when no real user, use mock data
    if (isDemoMode || !user) {
      // Use mock profile data
      setProfile({
        id: MOCK_STUDENT_PROFILE.id,
        first_name: MOCK_STUDENT_PROFILE.firstName,
        last_name: MOCK_STUDENT_PROFILE.lastName,
        career_name: MOCK_STUDENT_PROFILE.career,
        semester: MOCK_STUDENT_PROFILE.semester,
        enrollment_number: MOCK_STUDENT_PROFILE.enrollmentNumber,
      });
      setLoadingProfile(false);
      setLoadingSubjects(false);
      return;
    }

    // Handle real Supabase users
    if (user) {
      fetchProfile();
      fetchSubjects();
    }
  }, [user, isDemoMode, demoUser]);

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
      if (import.meta.env.DEV) {
        console.error("Error fetching profile:", error);
      }
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
      const { data: dbEvaluations } = await supabase
        .from("teacher_evaluations")
        .select("assignment_id, total_score, blockchain_hash")
        .eq("student_id", profileData.id);

      const evaluationMap = new Map(
        dbEvaluations?.map(e => [e.assignment_id, { score: e.total_score, hash: e.blockchain_hash }])
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
      if (import.meta.env.DEV) {
        console.error("Error fetching subjects:", error);
      }
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
    window.location.href = "/";
  };

  const handleOpenEvaluation = (subject: typeof MOCK_SUBJECTS[0]) => {
    setEvaluationModal({
      open: true,
      subject,
    });
  };

  const handleEvaluationComplete = (score: number) => {
    if (evaluationModal.subject) {
      const storedEval = saveEvaluation(evaluationModal.subject.code, score);
      setEvaluations(prev => ({
        ...prev,
        [evaluationModal.subject!.code]: storedEval,
      }));
    }
    setEvaluationModal({ open: false, subject: null });
  };

  // Determine if we should show mock subjects (demo mode or no real subjects)
  const showMockSubjects = isDemoMode || (!loadingSubjects && subjects.length === 0);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30">
              Modo Demo
            </Badge>
            <span className="text-xs text-amber-700">
              Los datos se guardan temporalmente en el navegador
            </span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UPEA</h1>
              <p className="text-xs text-muted-foreground">Sistema de Evaluación Docente</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : profile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Nombre Completo</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Carrera</p>
                  </div>
                  <p className="font-semibold text-foreground">{profile.career_name || "Sin asignar"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Semestre</p>
                  </div>
                  <p className="font-semibold text-foreground">{profile.semester || "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Matrícula</p>
                  </div>
                  <p className="font-semibold text-foreground font-mono">{profile.enrollment_number || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No se encontró tu perfil de estudiante. Completa el registro para continuar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Verification */}
        <div className="mb-8">
          <BlockchainVerificationButton />
        </div>

        {/* Subjects Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-secondary/10 p-2">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Materias del Semestre</h2>
              <p className="text-sm text-muted-foreground">Realiza la evaluación docente de tus materias activas</p>
            </div>
          </div>

          {loadingSubjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : showMockSubjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_SUBJECTS.map((subject) => {
                const evaluation = evaluations[subject.code];
                return (
                  <SubjectCard
                    key={subject.id}
                    subjectName={subject.name}
                    subjectCode={subject.code}
                    teacherName={subject.teacherName}
                    isEvaluated={evaluation?.evaluated || false}
                    evaluationScore={evaluation?.score}
                    evaluationDate={evaluation?.date}
                    onEvaluate={() => handleOpenEvaluation(subject)}
                  />
                );
              })}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subjectName={subject.subject_name}
                  subjectCode={subject.subject_code}
                  teacherName={subject.teacher_name}
                  isEvaluated={subject.is_evaluated}
                  evaluationScore={subject.evaluation_score}
                  onEvaluate={() => {
                    // For real subjects, we'd handle differently
                    toast({
                      title: "Evaluación",
                      description: "Esta función está en desarrollo para usuarios registrados.",
                    });
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Evaluation Summary */}
        {Object.keys(evaluations).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Evaluaciones</CardTitle>
              <CardDescription>Evaluaciones completadas con su puntaje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(evaluations).map(([code, evaluation]) => {
                  const subject = MOCK_SUBJECTS.find(s => s.code === code);
                  return (
                    <div 
                      key={code} 
                      className="flex items-center justify-between p-4 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{subject?.name}</p>
                        <p className="text-sm text-muted-foreground">{subject?.teacherName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{evaluation.date}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-green-600 text-lg">{evaluation.score}/70</p>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 text-xs">
                          Completada
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Evaluation Modal */}
      {evaluationModal.subject && (
        <EvaluationModal
          open={evaluationModal.open}
          onOpenChange={(open) => setEvaluationModal(prev => ({ ...prev, open }))}
          subjectName={evaluationModal.subject.name}
          subjectCode={evaluationModal.subject.code}
          teacherName={evaluationModal.subject.teacherName}
          paralelo={evaluationModal.subject.paralelo}
          sede={evaluationModal.subject.sede}
          onComplete={handleEvaluationComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
