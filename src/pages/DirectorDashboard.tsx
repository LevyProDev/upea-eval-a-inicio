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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Hash,
  Shield,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MOCK_DIRECTOR_STATS,
  MOCK_DIRECTOR_TEACHERS,
  MOCK_DIRECTOR_STUDENTS,
  MOCK_DIRECTOR_EVALUATIONS,
  MOCK_AUDIT_RECORDS,
  MOCK_TEACHER_EVALUATION_DETAILS,
  MOCK_STUDENT_HISTORIES,
  MOCK_EVALUATION_COMMENTS,
  MockDirectorTeacher,
  MockDirectorStudent,
  MockDirectorEvaluation,
  MockAuditRecord,
} from "@/lib/mockData";

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

const DirectorDashboard = () => {
  const { user, signOut, loading: authLoading, isDemoMode, demoUser } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "director" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [directorProfile, setDirectorProfile] = useState<DirectorProfile | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<MockDirectorTeacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<MockDirectorStudent | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<MockDirectorEvaluation | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedAuditPeriod, setSelectedAuditPeriod] = useState<MockAuditRecord | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Check if we should use demo data
  const useDemoData = isDemoMode || !user;

  useEffect(() => {
    if (isDemoMode && demoUser) {
      setDirectorProfile({
        id: "demo-director",
        first_name: demoUser.profile.firstName,
        last_name: demoUser.profile.lastName,
        email: demoUser.email,
        career_id: null,
        faculty: "Facultad de Humanidades y Ciencias de la Educación",
        position: "Director de Carrera",
        registration_completed: true,
      });
      setCareer({
        id: "demo-career",
        name: "Ciencias de la Educación",
        code: "CE-001",
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

      if (profile.career_id) {
        const { data: careerData } = await supabase
          .from("careers")
          .select("*")
          .eq("id", profile.career_id)
          .single();
        
        if (careerData) {
          setCareer(careerData);
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
    window.location.href = "/";
  };

  const handleExportEvaluationsPDF = () => {
    const currentDate = new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const evaluationsData = useDemoData ? MOCK_DIRECTOR_EVALUATIONS : [];
    const auditData = useDemoData ? MOCK_AUDIT_RECORDS : [];

    // Group evaluations by teacher
    const teacherMap = new Map<string, typeof evaluationsData>();
    evaluationsData.forEach(evaluation => {
      const existing = teacherMap.get(evaluation.teacherName) || [];
      teacherMap.set(evaluation.teacherName, [...existing, evaluation]);
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.",
      });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Evaluaciones - Director de Carrera</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            background: #fff;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            color: #1e3a5f;
            font-size: 20px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header h2 {
            color: #c41e3a;
            font-size: 14px;
            font-weight: normal;
            margin-bottom: 5px;
          }
          .header h3 {
            color: #666;
            font-size: 12px;
            font-weight: normal;
          }
          .director-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #1e3a5f;
          }
          .director-info h4 {
            color: #1e3a5f;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .director-info p {
            margin: 3px 0;
            font-size: 11px;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            color: #1e3a5f;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 2px solid #c41e3a;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            text-align: center;
            border: 1px solid #ddd;
          }
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .stat-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
          }
          .teacher-section {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .teacher-header {
            background: #1e3a5f;
            color: white;
            padding: 10px 15px;
            border-radius: 5px 5px 0 0;
          }
          .teacher-header h5 {
            font-size: 12px;
            margin: 0;
          }
          .teacher-content {
            padding: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f5f5f5;
            font-weight: bold;
            color: #1e3a5f;
          }
          .criteria-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-top: 10px;
          }
          .criteria-item {
            text-align: center;
            padding: 8px 5px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 9px;
          }
          .criteria-value {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .criteria-label {
            font-size: 8px;
            color: #666;
          }
          .progress-bar {
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            margin-top: 4px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #1e3a5f, #c41e3a);
            border-radius: 3px;
          }
          .audit-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
          }
          .audit-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e3a5f;
          }
          .hash-code {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            background: #e8e8e8;
            padding: 3px 6px;
            border-radius: 3px;
            word-break: break-all;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #1e3a5f;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          .score-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
          }
          .score-high { background: #d4edda; color: #155724; }
          .score-medium { background: #fff3cd; color: #856404; }
          .score-low { background: #f8d7da; color: #721c24; }
          @media print {
            body { padding: 0; }
            .section { page-break-inside: avoid; }
            .teacher-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Universidad Pública de El Alto</h1>
          <h2>Facultad de Humanidades y Ciencias de la Educación</h2>
          <h3>Carrera: ${career?.name || 'Ciencias de la Educación'} • Periodo Académico: I/2025</h3>
        </div>

        <div class="director-info">
          <h4>REPORTE CONSOLIDADO DE EVALUACIÓN DOCENTE</h4>
          <p><strong>Director:</strong> ${directorProfile?.first_name} ${directorProfile?.last_name}</p>
          <p><strong>Cargo:</strong> ${directorProfile?.position || 'Director de Carrera'}</p>
          <p><strong>Fecha de generación:</strong> ${currentDate}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalStudents.toLocaleString()}</div>
            <div class="stat-label">Estudiantes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalTeachers}</div>
            <div class="stat-label">Docentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalEvaluations.toLocaleString()}</div>
            <div class="stat-label">Evaluaciones</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.overallAverage}%</div>
            <div class="stat-label">Promedio General</div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Resumen de Evaluaciones por Docente y Asignatura</h3>
          
          ${Array.from(teacherMap.entries()).map(([teacherName, teacherEvals]) => `
            <div class="teacher-section">
              <div class="teacher-header">
                <h5>${teacherName}</h5>
              </div>
              <div class="teacher-content">
                <table>
                  <thead>
                    <tr>
                      <th>Asignatura</th>
                      <th>Código</th>
                      <th>Paralelo</th>
                      <th>Sede</th>
                      <th>Evaluados</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${teacherEvals.map(ev => `
                      <tr>
                        <td>${ev.subjectName}</td>
                        <td>${ev.subjectCode}</td>
                        <td>${ev.paralelo}</td>
                        <td>${ev.sede}</td>
                        <td>${ev.evaluatedCount}/${ev.totalStudents}</td>
                        <td>
                          <span class="score-badge ${ev.averageScore >= 85 ? 'score-high' : ev.averageScore >= 70 ? 'score-medium' : 'score-low'}">
                            ${ev.averageScore}%
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div style="margin-top: 10px;">
                  <strong style="font-size: 10px; color: #666;">Evaluación por Criterios (Promedio):</strong>
                  <div class="criteria-grid">
                    ${Object.entries(teacherEvals[0].criteria).map(([key, value]) => `
                      <div class="criteria-item">
                        <div class="criteria-value">${value}</div>
                        <div class="criteria-label">${getCriteriaLabel(key)}</div>
                        <div class="progress-bar">
                          <div class="progress-fill" style="width: ${(value / getCriteriaMax(key)) * 100}%"></div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h3 class="section-title">Trazabilidad Blockchain - Auditoría</h3>
          <div class="audit-section">
            <table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Total Evaluaciones</th>
                  <th>Hash Global</th>
                </tr>
              </thead>
              <tbody>
                ${auditData.map(record => `
                  <tr>
                    <td><strong>${record.period}</strong></td>
                    <td>${record.totalEvaluations.toLocaleString()}</td>
                    <td><code class="hash-code">${record.globalHash}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="footer">
          <p><strong>Universidad Pública de El Alto - UPEA</strong></p>
          <p>Sistema de Evaluación Docente con Trazabilidad Blockchain</p>
          <p>Documento generado el ${currentDate}</p>
          <p style="margin-top: 10px; font-size: 9px; color: #999;">
            Este documento es para uso exclusivo del Director de Carrera y tiene carácter informativo.
          </p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast({
      title: "PDF generado",
      description: "El reporte de evaluaciones está listo para descarga.",
    });
  };

  const getCriteriaLabel = (key: string): string => {
    const labels: Record<string, string> = {
      preparation: "Preparación pedagógica",
      domain: "Dominio del contenido",
      compliance: "Cumplimiento del plan",
      punctuality: "Puntualidad",
      objectivity: "Objetividad",
    };
    return labels[key] || key;
  };

  const getCriteriaMax = (key: string): number => {
    return key === "preparation" || key === "domain" ? 20 : 10;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  if (authLoading || roleLoading || loading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use mock data for demo mode
  const stats = useDemoData ? MOCK_DIRECTOR_STATS : { totalStudents: 0, totalTeachers: 0, totalEvaluations: 0, overallAverage: 0 };
  const teachers = useDemoData ? MOCK_DIRECTOR_TEACHERS : [];
  const students = useDemoData ? MOCK_DIRECTOR_STUDENTS : [];
  const evaluations = useDemoData ? MOCK_DIRECTOR_EVALUATIONS : [];
  const auditRecords = useDemoData ? MOCK_AUDIT_RECORDS : [];

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
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                  <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                  <p className="text-xs text-muted-foreground">Docentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvaluations.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overallAverage}%</p>
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
                  Lista de docentes activos en Ciencias de la Educación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map((teacher) => (
                    <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{teacher.academicDegree}. {teacher.firstName} {teacher.lastName}</h4>
                              <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            </div>
                            <Badge variant={getScoreBadgeVariant(teacher.averageScore)}>
                              {teacher.averageScore}%
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Especialidad:</strong> {teacher.specialty}</p>
                            <p><strong>Asignaturas:</strong> {teacher.subjects.join(", ")}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {teacher.evaluationStatus}
                            </Badge>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowTeacherModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver evaluación
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Semestre</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Evaluaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.enrollmentNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Semestre {student.semester}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.registrationStatus === "Activo" ? "default" : "secondary"}>
                              {student.registrationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.hasEvaluated ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">
                                {student.subjectsEvaluated}/{student.subjectsEnrolled}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver historial
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
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
                  Resumen consolidado de evaluaciones de estudiantes hacia docentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluations.map((evaluation) => (
                    <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{evaluation.subjectName}</h4>
                              <p className="text-xs text-muted-foreground">{evaluation.subjectCode}</p>
                            </div>
                            <Badge variant={getScoreBadgeVariant(evaluation.averageScore)} className="text-lg px-3">
                              {evaluation.averageScore}%
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <p><strong>Docente:</strong> {evaluation.teacherName}</p>
                            <p><strong>Paralelo:</strong> {evaluation.paralelo} • <strong>Sede:</strong> {evaluation.sede}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{evaluation.evaluatedCount}/{evaluation.totalStudents} estudiantes evaluaron</span>
                          </div>

                          {/* Criteria Progress */}
                          <div className="space-y-2">
                            {Object.entries(evaluation.criteria).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{getCriteriaLabel(key)}</span>
                                  <span>{value}/{getCriteriaMax(key)}</span>
                                </div>
                                <Progress value={(value / getCriteriaMax(key)) * 100} className="h-1" />
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedEvaluation(evaluation);
                              setShowEvaluationModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Export PDF Button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleExportEvaluationsPDF}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
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
                  Evaluaciones con trazabilidad blockchain por periodo académico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-primary/10 p-3">
                              <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">Periodo {record.period}</h4>
                              <p className="text-sm text-muted-foreground">
                                {record.totalEvaluations.toLocaleString()} evaluaciones registradas
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <code className="text-xs font-mono">
                                {record.globalHash.slice(0, 16)}...{record.globalHash.slice(-8)}
                              </code>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAuditPeriod(record);
                                setShowAuditModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver registros
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Teacher Evaluation Modal */}
      <Dialog open={showTeacherModal} onOpenChange={setShowTeacherModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Evaluación de Docente
            </DialogTitle>
            <DialogDescription>
              Resumen de evaluaciones recibidas por el docente
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id] && (
            <div className="space-y-6">
              {/* Teacher Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id].teacherName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeacher.department} • {selectedTeacher.specialty}
                  </p>
                </div>
                <Badge variant={getScoreBadgeVariant(MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id].overallAverage)} className="ml-auto text-lg px-4 py-1">
                  {MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id].overallAverage}%
                </Badge>
              </div>

              {/* Evaluations by Subject */}
              <div className="space-y-4">
                <h4 className="font-semibold">Evaluaciones por Asignatura</h4>
                {MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id].evaluationsBySubject.map((subjectEval, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium">{subjectEval.subjectName}</h5>
                          <p className="text-xs text-muted-foreground">{subjectEval.subjectCode}</p>
                        </div>
                        <Badge variant={getScoreBadgeVariant(subjectEval.averageScore)}>
                          {subjectEval.averageScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {subjectEval.evaluatedCount}/{subjectEval.totalStudents} estudiantes evaluaron
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(subjectEval.criteria).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{getCriteriaLabel(key)}</span>
                              <span>{value}/{getCriteriaMax(key)}</span>
                            </div>
                            <Progress value={(value / getCriteriaMax(key)) * 100} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feedback */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios de Estudiantes
                </h4>
                {MOCK_TEACHER_EVALUATION_DETAILS[selectedTeacher.id].feedback.map((fb, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm italic">"{fb.comment}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fb.subjectName} • {fb.date}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student History Modal */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Historial Académico
            </DialogTitle>
            <DialogDescription>
              Materias cursadas y estado de evaluación docente
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Matrícula: {selectedStudent.enrollmentNumber} • Semestre {selectedStudent.semester}
                  </p>
                </div>
                <Badge variant={selectedStudent.hasEvaluated ? "default" : "secondary"} className="ml-auto">
                  {selectedStudent.hasEvaluated ? "Ha evaluado" : "Pendiente"}
                </Badge>
              </div>

              {/* Subjects History */}
              <div className="space-y-3">
                <h4 className="font-semibold">Materias y Estado de Evaluación</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead>Evaluó</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MOCK_STUDENT_HISTORIES[selectedStudent.id] || MOCK_STUDENT_HISTORIES["ds-001"]).map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{history.subjectName}</p>
                            <p className="text-xs text-muted-foreground">{history.subjectCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{history.teacherName}</TableCell>
                        <TableCell>
                          {history.hasEvaluated ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Sí</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">No</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {history.evaluationDate || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                El director solo puede visualizar el estado de evaluación, no puede modificar datos del estudiante.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Detail Modal */}
      <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detalle de Evaluación
            </DialogTitle>
            <DialogDescription>
              Evaluaciones recibidas por el docente en esta asignatura
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvaluation && (
            <div className="space-y-6">
              {/* Subject Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedEvaluation.subjectName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvaluation.subjectCode} • {selectedEvaluation.teacherName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Paralelo {selectedEvaluation.paralelo} • {selectedEvaluation.sede}
                    </p>
                  </div>
                  <Badge variant={getScoreBadgeVariant(selectedEvaluation.averageScore)} className="text-xl px-4 py-2">
                    {selectedEvaluation.averageScore}%
                  </Badge>
                </div>
              </div>

              {/* Participation */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm">
                  <strong>{selectedEvaluation.evaluatedCount}</strong> de <strong>{selectedEvaluation.totalStudents}</strong> estudiantes evaluaron
                  <span className="text-muted-foreground"> ({Math.round((selectedEvaluation.evaluatedCount / selectedEvaluation.totalStudents) * 100)}%)</span>
                </span>
              </div>

              {/* Full Criteria Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold">Evaluación por Criterios</h4>
                {Object.entries(selectedEvaluation.criteria).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{getCriteriaLabel(key)}</span>
                      <span className={getScoreColor((value / getCriteriaMax(key)) * 100)}>
                        {value}/{getCriteriaMax(key)} ({Math.round((value / getCriteriaMax(key)) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(value / getCriteriaMax(key)) * 100} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios de Estudiantes
                </h4>
                {(MOCK_EVALUATION_COMMENTS[selectedEvaluation.id] || []).map((comment, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm italic">"{comment}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Detail Modal */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registros de Auditoría
            </DialogTitle>
            <DialogDescription>
              Evaluaciones con trazabilidad blockchain
            </DialogDescription>
          </DialogHeader>
          
          {selectedAuditPeriod && (
            <div className="space-y-6">
              {/* Period Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Periodo {selectedAuditPeriod.period}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAuditPeriod.totalEvaluations.toLocaleString()} evaluaciones registradas
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Hash global: {selectedAuditPeriod.globalHash.slice(0, 20)}...
                  </Badge>
                </div>
              </div>

              {/* Records Table */}
              <div className="space-y-3">
                <h4 className="font-semibold">Registros Individuales</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Asignatura</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead>Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAuditPeriod.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {record.date}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{record.subjectName}</TableCell>
                        <TableCell>{record.teacherName}</TableCell>
                        <TableCell>
                          <Badge variant={getScoreBadgeVariant(record.averageScore)}>
                            {record.averageScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3 text-muted-foreground" />
                            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                              {record.hash}
                            </code>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Todos los registros están respaldados en blockchain para garantizar transparencia e inmutabilidad.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

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