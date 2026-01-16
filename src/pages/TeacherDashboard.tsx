import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  MapPin,
  Layers,
  Eye,
  MessageSquare,
  Download,
  Edit,
  Award,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MOCK_TEACHER_PROFILE,
  MOCK_TEACHER_SUBJECTS,
  MOCK_STUDENTS_BY_SUBJECT,
  MOCK_TEACHER_EVALUATIONS,
  MOCK_CURRENT_CRITERIA,
  MOCK_STUDENT_FEEDBACK,
  MOCK_TEACHER_STATS,
  type MockTeacherSubject,
  type MockStudent,
} from "@/lib/mockData";

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
  responses: Record<string, number>;
  student_id: string;
  assignment: {
    subject: {
      name: string;
      code: string;
    };
  };
}

const EVALUATION_CRITERIA = [
  { key: "preparation", label: "Preparación pedagógica", icon: BookOpen, maxScore: 20 },
  { key: "domain", label: "Dominio del contenido", icon: GraduationCap, maxScore: 20 },
  { key: "compliance", label: "Cumplimiento del plan", icon: CheckCircle, maxScore: 10 },
  { key: "punctuality", label: "Puntualidad", icon: Clock, maxScore: 10 },
  { key: "objectivity", label: "Objetividad", icon: Target, maxScore: 10 },
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
  
  // Modal state for subject details
  const [selectedSubject, setSelectedSubject] = useState<MockTeacherSubject | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Demo mode data
  const [useDemoData, setUseDemoData] = useState(false);

  useEffect(() => {
    if (isDemoMode && demoUser) {
      setTeacherProfile({
        id: "demo-teacher",
        first_name: MOCK_TEACHER_PROFILE.firstName,
        last_name: MOCK_TEACHER_PROFILE.lastName,
        email: MOCK_TEACHER_PROFILE.email,
        specialty: MOCK_TEACHER_PROFILE.specialty,
        academic_degree: MOCK_TEACHER_PROFILE.academicDegree,
        department: MOCK_TEACHER_PROFILE.department,
        registration_completed: true,
      });
      setUseDemoData(true);
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

      const assignmentIds = assignmentsData?.map((a) => a.id) || [];
      let evaluationsData: Evaluation[] = [];

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
        evaluationsData = (evals || []) as unknown as Evaluation[];
      }

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
      
      // If no real data, use demo data
      if (enrichedAssignments.length === 0) {
        setUseDemoData(true);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching teacher data:", error);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del docente.",
      });
      setUseDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getScoreColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleViewSubjectDetails = (subject: MockTeacherSubject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(true);
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "El reporte se está generando...",
    });
    // In a real app, this would generate a PDF
  };

  if (authLoading || roleLoading || loading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use demo data or real data
  const displaySubjects = useDemoData ? MOCK_TEACHER_SUBJECTS : assignments.map(a => ({
    id: a.id,
    code: a.subject?.code || "",
    name: a.subject?.name || "",
    paralelo: "A",
    sede: "Sede Central",
    studentsCount: a.evaluations_count || 0,
    evaluationPercentage: a.average_score || 0,
    academicYear: a.academic_year,
    period: a.period,
    isActive: a.is_active,
  }));

  const stats = useDemoData ? MOCK_TEACHER_STATS : {
    activeSubjects: assignments.filter(a => a.is_active).length || 0,
    totalEvaluations: evaluations.length,
    overallAverage: evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, e) => sum + e.total_score, 0) / evaluations.length)
      : 0,
    status: "Activo" as const,
  };

  const criteriaData = useDemoData ? MOCK_CURRENT_CRITERIA : {
    preparation: 0,
    domain: 0,
    compliance: 0,
    punctuality: 0,
    objectivity: 0,
  };

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
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeSubjects}</p>
                  <p className="text-xs text-muted-foreground">Asignaturas activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
                  <p className="text-xs text-muted-foreground">Evaluaciones recibidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.overallAverage)}`}>
                    {stats.overallAverage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Promedio general</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <Badge variant="default" className="text-sm">
                    {stats.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Estado</p>
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
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Mis Asignaturas
                </CardTitle>
                <CardDescription>
                  Lista de asignaturas asignadas por gestión y periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displaySubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No tienes materias registradas en este periodo.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displaySubjects.map((subject) => (
                      <Card key={subject.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {subject.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {subject.code} | Paralelo {subject.paralelo}
                                </p>
                              </div>
                              <Badge variant={subject.isActive ? "default" : "secondary"}>
                                {subject.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {subject.sede}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {subject.studentsCount} estudiantes
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Estado de evaluación</span>
                                <span className="font-medium">{subject.evaluationPercentage}% evaluaron</span>
                              </div>
                              <Progress 
                                value={subject.evaluationPercentage} 
                                className="h-2"
                              />
                            </div>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleViewSubjectDetails(subject as MockTeacherSubject)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
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
            <div className="space-y-6">
              {/* Criteria Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evaluaciones Recibidas
                  </CardTitle>
                  <CardDescription>
                    Resumen de puntajes por criterio de evaluación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {EVALUATION_CRITERIA.map((criteria) => {
                      const Icon = criteria.icon;
                      const score = criteriaData[criteria.key as keyof typeof criteriaData];
                      const percentage = (score / criteria.maxScore) * 100;
                      
                      return (
                        <Card key={criteria.key} className="text-center">
                          <CardContent className="pt-4">
                            <div className="flex flex-col items-center gap-2">
                              <div className="rounded-full bg-primary/10 p-3">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {criteria.label}
                              </span>
                              <p className={`text-2xl font-bold ${getScoreColor(score, criteria.maxScore)}`}>
                                {score}/{criteria.maxScore}
                              </p>
                              <Progress 
                                value={percentage} 
                                className="h-2 w-full"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Overall Score */}
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg mb-6">
                    <div className="text-center">
                      <Award className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Promedio General</p>
                      <p className={`text-4xl font-bold ${getScoreColor(stats.overallAverage)}`}>
                        {stats.overallAverage}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basado en {stats.totalEvaluations} evaluaciones
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Student Feedback */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comentarios de Estudiantes
                    </h4>
                    <div className="space-y-3">
                      {MOCK_STUDENT_FEEDBACK.map((feedback) => (
                        <Card key={feedback.id} className="bg-muted/30">
                          <CardContent className="pt-4">
                            <p className="text-sm italic text-foreground mb-2">
                              "{feedback.comment}"
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Estudiante anónimo</span>
                              <span>{new Date(feedback.date).toLocaleDateString('es-BO')}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={handleExportPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historial Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Evaluaciones
                </CardTitle>
                <CardDescription>
                  Evaluaciones pasadas con trazabilidad blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {MOCK_TEACHER_EVALUATIONS.map((evaluation) => (
                      <Card key={evaluation.id} className="border-l-4 border-l-accent">
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{evaluation.subjectName}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Periodo: {evaluation.period} | {evaluation.evaluationsCount} evaluaciones
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(evaluation.evaluatedAt).toLocaleDateString("es-BO", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className={`text-2xl font-bold ${getScoreColor(evaluation.averageScore)}`}>
                                  {evaluation.averageScore}%
                                </p>
                                <p className="text-xs text-muted-foreground">Promedio</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <LinkIcon className="h-3 w-3 text-green-600" />
                                  <span className="font-mono text-muted-foreground">
                                    {evaluation.blockchainHash}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verificado en Blockchain
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Criteria breakdown */}
                          <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-2 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Preparación</p>
                              <p className="font-medium">{evaluation.criteria.preparation}/20</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Dominio</p>
                              <p className="font-medium">{evaluation.criteria.domain}/20</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Cumplimiento</p>
                              <p className="font-medium">{evaluation.criteria.compliance}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Puntualidad</p>
                              <p className="font-medium">{evaluation.criteria.punctuality}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Objetividad</p>
                              <p className="font-medium">{evaluation.criteria.objectivity}/10</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Mi Perfil
                    </CardTitle>
                    <CardDescription>
                      Información personal y académica
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar perfil
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                        {teacherProfile?.first_name?.[0]}{teacherProfile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="default" className="text-sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Registro Completo
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nombre completo</p>
                        <p className="font-medium text-lg">
                          {teacherProfile?.first_name} {teacherProfile?.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Correo electrónico</p>
                        <p className="font-medium">{teacherProfile?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Especialidad</p>
                        <p className="font-medium">
                          {teacherProfile?.specialty || "No especificada"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Grado académico</p>
                        <Badge variant="secondary" className="text-sm">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {teacherProfile?.academic_degree || "No especificado"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Departamento</p>
                        <p className="font-medium">
                          {teacherProfile?.department || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Estado de registro</p>
                        <Badge
                          variant={teacherProfile?.registration_completed ? "default" : "secondary"}
                        >
                          {teacherProfile?.registration_completed ? "Completo" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Subject Details Modal */}
      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedSubject?.code} | Paralelo {selectedSubject?.paralelo} | {selectedSubject?.sede}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubject && (
            <div className="space-y-6">
              {/* Subject Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedSubject.studentsCount}</p>
                    <p className="text-xs text-muted-foreground">Estudiantes inscritos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedSubject.evaluationPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Ya evaluaron</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Layers className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedSubject.period}</p>
                    <p className="text-xs text-muted-foreground">Periodo académico</p>
                  </CardContent>
                </Card>
              </div>

              {/* Students List */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lista de Estudiantes
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead className="text-center">Parcial 1</TableHead>
                      <TableHead className="text-center">Parcial 2</TableHead>
                      <TableHead className="text-center">Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MOCK_STUDENTS_BY_SUBJECT[selectedSubject.code] || []).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.enrollmentNumber}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={student.grades.parcial1 >= 51 ? "default" : "destructive"}>
                            {student.grades.parcial1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={student.grades.parcial2 >= 51 ? "default" : "destructive"}>
                            {student.grades.parcial2}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={student.attendance} className="w-16 h-2" />
                            <span className="text-xs">{student.attendance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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