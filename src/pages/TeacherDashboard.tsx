import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { getDemoRedirectPath } from "@/lib/demoAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeacherRegisterModal from "@/components/teacher/TeacherRegisterModal";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  History,
  User,
  LogOut,
  Loader2,
  AlertCircle,
  Star,
  Clock,
  CheckCircle,
  Target,
  Users,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeacherProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string | null;
  academic_degree: string | null;
  department: string | null;
  registration_completed: boolean | null;
}

interface SubjectAssignment {
  id: string;
  academic_year: number;
  period: string;
  is_active: boolean;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  evaluations_count?: number;
  average_score?: number;
}

interface Evaluation {
  id: string;
  total_score: number;
  evaluated_at: string;
  blockchain_hash: string | null;
  responses: any;
  student_id: string;
  assignment: {
    subject: {
      name: string;
      code: string;
    };
  };
}

const EVALUATION_CRITERIA = [
  { key: "preparation", label: "Preparación de clases", icon: BookOpen },
  { key: "domain", label: "Dominio del tema", icon: GraduationCap },
  { key: "compliance", label: "Cumplimiento del programa", icon: CheckCircle },
  { key: "punctuality", label: "Puntualidad", icon: Clock },
  { key: "objectivity", label: "Objetividad en evaluaciones", icon: Target },
];

const TeacherDashboard = () => {
  const { user, signOut, loading: authLoading, isDemoMode, demoUser } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "teacher" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    // Handle demo users
    if (isDemoMode && demoUser) {
      // Set demo profile data
      setTeacherProfile({
        id: "demo-teacher",
        first_name: demoUser.profile.firstName,
        last_name: demoUser.profile.lastName,
        email: demoUser.email,
        specialty: "Informática",
        academic_degree: "Magíster",
        department: "Departamento de Sistemas",
        registration_completed: true,
      });
      setLoading(false);
      return;
    }
    
    if (user) {
      fetchTeacherData();
    }
  }, [user, isDemoMode, demoUser]);

  const fetchTeacherData = async () => {
    if (!user) return;

    try {
      // Fetch teacher profile
      const { data: profile, error: profileError } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      setTeacherProfile(profile);

      if (!profile.registration_completed) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("subject_assignments")
        .select(`
          id,
          academic_year,
          period,
          is_active,
          subject:subjects(id, name, code)
        `)
        .eq("teacher_id", profile.id);

      if (assignmentsError) throw assignmentsError;

      // Fetch evaluations
      const assignmentIds = assignmentsData?.map((a) => a.id) || [];
      let evaluationsData: any[] = [];

      if (assignmentIds.length > 0) {
        const { data: evals, error: evalsError } = await supabase
          .from("teacher_evaluations")
          .select(`
            id,
            total_score,
            evaluated_at,
            blockchain_hash,
            responses,
            student_id,
            assignment:subject_assignments(
              subject:subjects(name, code)
            )
          `)
          .in("assignment_id", assignmentIds)
          .order("evaluated_at", { ascending: false });

        if (evalsError) throw evalsError;
        evaluationsData = evals || [];
      }

      // Calculate stats for assignments
      const enrichedAssignments = (assignmentsData || []).map((assignment) => {
        const assignmentEvals = evaluationsData.filter(
          (e) => e.assignment?.subject?.code === assignment.subject?.code
        );
        return {
          ...assignment,
          subject: assignment.subject as { id: string; name: string; code: string },
          evaluations_count: assignmentEvals.length,
          average_score:
            assignmentEvals.length > 0
              ? assignmentEvals.reduce((sum, e) => sum + e.total_score, 0) /
                assignmentEvals.length
              : 0,
        };
      });

      setAssignments(enrichedAssignments);
      setEvaluations(evaluationsData);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error fetching teacher data:", error);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del docente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      window.location.href = "/auth";
      return;
    }
    await signOut();
    navigate("/auth");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateCriteriaAverages = () => {
    if (evaluations.length === 0) return {};

    const totals: Record<string, { sum: number; count: number }> = {};

    evaluations.forEach((evaluation) => {
      const responses = evaluation.responses as Record<string, number>;
      Object.entries(responses).forEach(([key, value]) => {
        if (!totals[key]) {
          totals[key] = { sum: 0, count: 0 };
        }
        totals[key].sum += value;
        totals[key].count += 1;
      });
    });

    const averages: Record<string, number> = {};
    Object.entries(totals).forEach(([key, { sum, count }]) => {
      averages[key] = Math.round((sum / count) * 20); // Convert 1-5 to percentage
    });

    return averages;
  };

  if (authLoading || roleLoading || loading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const criteriaAverages = calculateCriteriaAverages();
  const overallAverage =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce((sum, e) => sum + e.total_score, 0) /
            evaluations.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UPEA</h1>
              <p className="text-xs text-muted-foreground">Panel Docente</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {teacherProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {teacherProfile.first_name} {teacherProfile.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {teacherProfile.department}
                </p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                  <p className="text-xs text-muted-foreground">Asignaturas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{evaluations.length}</p>
                  <p className="text-xs text-muted-foreground">Evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(overallAverage)}`}>
                    {overallAverage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Promedio General</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {assignments.filter((a) => a.is_active).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="subjects" className="gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Asignaturas</span>
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Asignaturas Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Mis Asignaturas</CardTitle>
                <CardDescription>
                  Lista de asignaturas asignadas por gestión y periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No tienes materias registradas en este periodo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <Card key={assignment.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">
                                  {assignment.subject?.name}
                                </h4>
                                <Badge variant={assignment.is_active ? "default" : "secondary"}>
                                  {assignment.is_active ? "Activa" : "Inactiva"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Código: {assignment.subject?.code} | Año:{" "}
                                {assignment.academic_year} | Periodo:{" "}
                                {assignment.period}
                              </p>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <p className="text-lg font-bold">
                                  {assignment.evaluations_count}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Evaluaciones
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className={`text-lg font-bold ${getScoreColor(
                                    assignment.average_score || 0
                                  )}`}
                                >
                                  {Math.round(assignment.average_score || 0)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Promedio
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluaciones Tab */}
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones Recibidas</CardTitle>
                <CardDescription>
                  Puntajes por criterio y resumen de evaluaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Aún no tienes evaluaciones registradas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {EVALUATION_CRITERIA.map((criteria) => {
                        const Icon = criteria.icon;
                        const average = criteriaAverages[criteria.key] || 0;
                        return (
                          <Card key={criteria.key}>
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium truncate">
                                  {criteria.label}
                                </span>
                              </div>
                              <p
                                className={`text-2xl font-bold ${getScoreColor(
                                  average
                                )}`}
                              >
                                {average}%
                              </p>
                              <Progress
                                value={average}
                                className="h-2 mt-2"
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">
                        Detalle por Asignatura
                      </h4>
                      <div className="space-y-3">
                        {assignments.map((assignment) => {
                          const assignmentEvals = evaluations.filter(
                            (e) =>
                              e.assignment?.subject?.code ===
                              assignment.subject?.code
                          );
                          if (assignmentEvals.length === 0) return null;

                          const avg = Math.round(
                            assignmentEvals.reduce(
                              (sum, e) => sum + e.total_score,
                              0
                            ) / assignmentEvals.length
                          );

                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div>
                                <p className="font-medium">
                                  {assignment.subject?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {assignmentEvals.length} evaluaciones
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={avg}
                                  className="w-24 h-2"
                                />
                                <span
                                  className={`font-bold ${getScoreColor(avg)}`}
                                >
                                  {avg}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historial Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Evaluaciones</CardTitle>
                <CardDescription>
                  Evaluaciones pasadas con trazabilidad blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No hay evaluaciones en el historial.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {evaluations.map((evaluation) => (
                        <Card key={evaluation.id}>
                          <CardContent className="pt-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {evaluation.assignment?.subject?.name}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    evaluation.evaluated_at
                                  ).toLocaleDateString("es-BO", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p
                                    className={`text-lg font-bold ${getScoreColor(
                                      evaluation.total_score
                                    )}`}
                                  >
                                    {evaluation.total_score}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Puntaje
                                  </p>
                                </div>
                                {evaluation.blockchain_hash && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <LinkIcon className="h-3 w-3" />
                                    <span className="font-mono truncate max-w-[100px]">
                                      {evaluation.blockchain_hash.slice(0, 12)}...
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      Verificado
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>
                  Información personal y académica
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teacherProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Nombre completo
                        </p>
                        <p className="font-medium">
                          {teacherProfile.first_name} {teacherProfile.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Correo electrónico
                        </p>
                        <p className="font-medium">{teacherProfile.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Especialidad
                        </p>
                        <p className="font-medium">
                          {teacherProfile.specialty || "No especificada"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Grado académico
                        </p>
                        <p className="font-medium">
                          {teacherProfile.academic_degree || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Departamento
                        </p>
                        <p className="font-medium">
                          {teacherProfile.department || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Estado de registro
                        </p>
                        <Badge
                          variant={
                            teacherProfile.registration_completed
                              ? "default"
                              : "secondary"
                          }
                        >
                          {teacherProfile.registration_completed
                            ? "Completo"
                            : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Register Modal */}
      {user && (
        <TeacherRegisterModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
