import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DirectorRegisterModal from "@/components/director/DirectorRegisterModal";
import {
  Award,
  Users,
  BookOpen,
  GraduationCap,
  History,
  LogOut,
  Loader2,
  BarChart3,
  FileText,
  TrendingUp,
  Link as LinkIcon,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DirectorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  career_id: string | null;
  faculty: string | null;
  position: string;
  registration_completed: boolean | null;
}

interface Career {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string | null;
  specialty: string | null;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  semester: number | null;
}

interface Evaluation {
  id: string;
  total_score: number;
  evaluated_at: string;
  blockchain_hash: string | null;
  assignment_id: string;
}

interface SubjectAssignment {
  id: string;
  academic_year: number;
  period: string;
  subject: {
    name: string;
    code: string;
  };
  teacher: {
    first_name: string;
    last_name: string;
  };
}

const DirectorDashboard = () => {
  const { user, signOut, loading: authLoading, isDemoMode, demoUser } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "director" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [directorProfile, setDirectorProfile] = useState<DirectorProfile | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    // Handle demo users
    if (isDemoMode && demoUser) {
      setDirectorProfile({
        id: "demo-director",
        first_name: demoUser.profile.firstName,
        last_name: demoUser.profile.lastName,
        email: demoUser.email,
        career_id: null,
        faculty: "Facultad de Ingeniería",
        position: "Director de Carrera",
        registration_completed: true,
      });
      setLoading(false);
      return;
    }
    
    if (user) {
      fetchDirectorData();
    }
  }, [user, isDemoMode, demoUser]);

  const fetchDirectorData = async () => {
    if (!user) return;

    try {
      // Fetch director profile
      const { data: profile, error: profileError } = await supabase
        .from("director_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      setDirectorProfile(profile);

      if (!profile.registration_completed) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      // Fetch career info
      if (profile.career_id) {
        const { data: careerData } = await supabase
          .from("careers")
          .select("*")
          .eq("id", profile.career_id)
          .single();
        
        if (careerData) {
          setCareer(careerData);

          // Fetch students in this career
          const { data: studentsData } = await supabase
            .from("student_profiles")
            .select("id, first_name, last_name, email, semester")
            .eq("career_id", profile.career_id)
            .order("last_name");

          if (studentsData) setStudents(studentsData);

          // Fetch subjects for this career and their assignments
          const { data: subjectsData } = await supabase
            .from("subjects")
            .select("id")
            .eq("career_id", profile.career_id);

          if (subjectsData && subjectsData.length > 0) {
            const subjectIds = subjectsData.map(s => s.id);
            
            // Fetch assignments with teacher and subject info
            const { data: assignmentsData } = await supabase
              .from("subject_assignments")
              .select(`
                id,
                academic_year,
                period,
                subject_id,
                teacher_id
              `)
              .in("subject_id", subjectIds)
              .eq("is_active", true);

            if (assignmentsData && assignmentsData.length > 0) {
              // Fetch related subjects and teachers
              const teacherIds = [...new Set(assignmentsData.map(a => a.teacher_id))];
              
              const [subjectsRes, teachersRes] = await Promise.all([
                supabase.from("subjects").select("id, name, code").in("id", subjectIds),
                supabase.from("teachers").select("id, first_name, last_name, email, department, specialty").in("id", teacherIds),
              ]);

              const subjectsMap = new Map(subjectsRes.data?.map(s => [s.id, s]) || []);
              const teachersMap = new Map(teachersRes.data?.map(t => [t.id, t]) || []);

              setTeachers(teachersRes.data || []);

              const enrichedAssignments = assignmentsData.map(a => ({
                id: a.id,
                academic_year: a.academic_year,
                period: a.period,
                subject: subjectsMap.get(a.subject_id) || { name: "Desconocida", code: "N/A" },
                teacher: teachersMap.get(a.teacher_id) || { first_name: "Desconocido", last_name: "" },
              }));

              setAssignments(enrichedAssignments);

              // Fetch evaluations for these assignments
              const assignmentIds = assignmentsData.map(a => a.id);
              const { data: evalsData } = await supabase
                .from("teacher_evaluations")
                .select("*")
                .in("assignment_id", assignmentIds)
                .order("evaluated_at", { ascending: false })
                .limit(100);

              if (evalsData) setEvaluations(evalsData);
            }
          }
        }
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error fetching director data:", error);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Always use window.location to ensure full state reset
    window.location.href = "/";
  };

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, e) => sum + e.total_score, 0);
    return (total / evaluations.length).toFixed(1);
  };

  if (authLoading || roleLoading || loading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Award className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UPEA</h1>
              <p className="text-xs text-muted-foreground">Panel Director de Carrera</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {directorProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {directorProfile.first_name} {directorProfile.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {directorProfile.position}
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
        {/* Career Info */}
        {career && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">{career.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Código: {career.code} • {directorProfile?.faculty}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                  <p className="text-xs text-muted-foreground">Docentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
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
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getAverageScore()}</p>
                  <p className="text-xs text-muted-foreground">Promedio General</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teachers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="teachers" className="gap-1">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Docentes</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Estudiantes</span>
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Auditoría</span>
            </TabsTrigger>
          </TabsList>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Docentes de la Carrera
                </CardTitle>
                <CardDescription>
                  Lista de docentes asignados a materias de la carrera
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay docentes asignados a esta carrera.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Especialidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">
                              {teacher.first_name} {teacher.last_name}
                            </TableCell>
                            <TableCell>{teacher.email || "-"}</TableCell>
                            <TableCell>{teacher.department || "-"}</TableCell>
                            <TableCell>{teacher.specialty || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudiantes de la Carrera
                </CardTitle>
                <CardDescription>
                  Lista de estudiantes matriculados en la carrera
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay estudiantes registrados en esta carrera.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Semestre</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              {student.semester ? (
                                <Badge variant="outline">
                                  Semestre {student.semester}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evaluaciones por Asignatura
                </CardTitle>
                <CardDescription>
                  Resumen de evaluaciones docentes agregadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay asignaciones activas para esta carrera.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Materia</TableHead>
                          <TableHead>Docente</TableHead>
                          <TableHead>Periodo</TableHead>
                          <TableHead>Año</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              {assignment.subject.name}
                              <p className="text-xs text-muted-foreground">
                                {assignment.subject.code}
                              </p>
                            </TableCell>
                            <TableCell>
                              {assignment.teacher.first_name} {assignment.teacher.last_name}
                            </TableCell>
                            <TableCell>{assignment.period}</TableCell>
                            <TableCell>{assignment.academic_year}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Auditoría
                </CardTitle>
                <CardDescription>
                  Evaluaciones con registro en blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.filter(e => e.blockchain_hash).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay registros de auditoría disponibles.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Puntuación</TableHead>
                          <TableHead>Hash Blockchain</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluations
                          .filter((e) => e.blockchain_hash)
                          .map((evaluation) => (
                            <TableRow key={evaluation.id}>
                              <TableCell>
                                {new Date(evaluation.evaluated_at).toLocaleDateString("es-BO")}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{evaluation.total_score}/100</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {evaluation.blockchain_hash?.slice(0, 16)}...
                                  </code>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Register Modal */}
      <DirectorRegisterModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        userId={user?.id || ""}
        userEmail={user?.email || ""}
      />
    </div>
  );
};

export default DirectorDashboard;
