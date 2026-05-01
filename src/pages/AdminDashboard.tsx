import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminRegisterModal from "@/components/admin/AdminRegisterModal";
import {
  Shield, Users, BookOpen, GraduationCap, User, LogOut, Loader2, Plus, Pencil, Trash2, Search, Building2, FileText, CheckCircle, XCircle, Upload, Settings, ClipboardList, Save, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Interfaces ──
interface AdminProfile {
  id: string; first_name: string; last_name: string; email: string;
  administrative_position: string; department: string; registration_completed: boolean | null;
}
interface StudentProfile {
  id: string; first_name: string; last_name: string; email: string;
  document_number: string; registration_completed: boolean | null; created_at: string;
}
interface Teacher {
  id: string; first_name: string; last_name: string; email: string | null;
  department: string | null; registration_completed: boolean | null; created_at: string;
}
interface Career {
  id: string; name: string; code: string; faculty: string | null; created_at: string;
}
interface Subject {
  id: string; name: string; code: string; semester: number | null;
  career_id: string | null; created_at: string;
}
interface Evaluation {
  id: string; total_score: number; evaluated_at: string;
  blockchain_hash: string | null; student_id: string; assignment_id: string;
}

// ── Mock data for demo ──
const MOCK_EVAL_QUESTIONS = [
  { id: "q1", text: "¿El docente demuestra preparación pedagógica adecuada?", maxScore: 20 },
  { id: "q2", text: "¿El docente domina el contenido de la materia?", maxScore: 20 },
  { id: "q3", text: "¿El docente cumple con el plan de estudios?", maxScore: 20 },
  { id: "q4", text: "¿El docente es puntual y responsable?", maxScore: 20 },
  { id: "q5", text: "¿El docente evalúa con objetividad y justicia?", maxScore: 20 },
];

const MOCK_MATERIALS = [
  { id: "m1", name: "Guía de Evaluación Docente 2025.pdf", type: "PDF", subject: "General", uploadedBy: "Admin", date: "2025-01-15" },
  { id: "m2", name: "Reglamento Académico.pdf", type: "PDF", subject: "General", uploadedBy: "Admin", date: "2025-01-10" },
  { id: "m3", name: "Planilla de Inscripción.xlsx", type: "Excel", subject: "General", uploadedBy: "Admin", date: "2025-02-01" },
];

const MOCK_ENROLLED_STUDENTS = [
  { id: "e1", name: "María López Quispe", matricula: "EST-2025-001", career: "Ciencias de la Educación", sede: "El Alto", semester: 5, subjects: ["Psicología Educativa", "Didáctica General", "Investigación Educativa"] },
  { id: "e2", name: "Juan Mamani Condori", matricula: "EST-2025-002", career: "Ciencias de la Educación", sede: "El Alto", semester: 3, subjects: ["Pedagogía", "Sociología de la Educación"] },
  { id: "e3", name: "Ana Flores Ticona", matricula: "EST-2025-003", career: "Ciencias de la Educación", sede: "Viacha", semester: 7, subjects: ["Psicología Educativa", "Práctica Profesional"] },
  { id: "e4", name: "Carlos Huanca Apaza", matricula: "EST-2025-004", career: "Ciencias de la Educación", sede: "El Alto", semester: 1, subjects: ["Introducción a la Educación", "Filosofía"] },
  { id: "e5", name: "Rosa Choque Poma", matricula: "EST-2025-005", career: "Ciencias de la Educación", sede: "El Alto", semester: 9, subjects: ["Tesis I", "Gestión Educativa"] },
];

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading, isDemoMode, demoUser } = useAuth();
  const { hasAccess, loading: roleLoading } = useRoleGuard({ requiredRole: "admin" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Search
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  // Dialogs
  const [showCareerDialog, setShowCareerDialog] = useState(false);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

  // Forms
  const [careerForm, setCareerForm] = useState({ name: "", code: "", faculty: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", semester: "", career_id: "" });
  const [userForm, setUserForm] = useState({
    role: "", firstName: "", lastNamePaterno: "", lastNameMaterno: "", documentNumber: "", matricula: "", email: "", phone: "", password: "",
    career: "", sede: "", semester: "", academicDegree: "", profession: "", subjects: "",
    period: "", area: "", accessLevel: "",
  });

  // Evaluation config
  const [evalQuestions, setEvalQuestions] = useState(MOCK_EVAL_QUESTIONS);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({ text: "", maxScore: 20 });

  // Materials
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [materialForm, setMaterialForm] = useState({ name: "", subject: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enrolled students (for Estudiantes tab)
  const [enrolledStudents] = useState(MOCK_ENROLLED_STUDENTS);
  const [enrolledSearch, setEnrolledSearch] = useState("");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ name: "", matricula: "", career: "", sede: "", semester: "", subjects: "" });

  // Demo data counts
  const useDemoData = isDemoMode && demoUser;
  const demoStudentCount = useDemoData ? 1250 : students.length;
  const demoTeacherCount = useDemoData ? 45 : teachers.length;
  const demoCareerCount = useDemoData ? 8 : careers.length;
  const demoSubjectCount = useDemoData ? 62 : subjects.length;
  const demoEvalCount = useDemoData ? 1080 : evaluations.length;

  useEffect(() => {
    if (isDemoMode && demoUser) {
      setAdminProfile({
        id: "demo-admin", first_name: demoUser.profile.firstName, last_name: demoUser.profile.lastName,
        email: demoUser.email, administrative_position: "Administrador del Sistema", department: "Sistemas", registration_completed: true,
      });
      setLoading(false);
      return;
    }
    if (user) fetchAdminData();
  }, [user, isDemoMode, demoUser]);

  const fetchAdminData = async () => {
    if (!user) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) { setShowRegisterModal(true); setLoading(false); return; }
      setAdminProfile(profile);
      if (!profile.registration_completed) { setShowRegisterModal(true); setLoading(false); return; }

      const [studentsRes, teachersRes, careersRes, subjectsRes, evalsRes] = await Promise.all([
        supabase.from("student_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("teachers").select("*").order("created_at", { ascending: false }),
        supabase.from("careers").select("*").order("name"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("teacher_evaluations").select("*").order("evaluated_at", { ascending: false }).limit(100),
      ]);
      if (studentsRes.error) throw studentsRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (careersRes.error) throw careersRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (evalsRes.error) throw evalsRes.error;
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setCareers(careersRes.data || []);
      setSubjects(subjectsRes.data || []);
      setEvaluations(evalsRes.data || []);
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error("Error fetching admin data:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos administrativos." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); window.location.href = "/"; };

  // ── Career CRUD ──
  const handleSaveCareer = async () => {
    try {
      const existingCareer = careers.find((c) => c.code === careerForm.code && c.id !== editingCareer?.id);
      if (existingCareer) { toast({ variant: "destructive", title: "Error", description: "El código de carrera ya existe." }); return; }
      if (editingCareer) {
        const { error } = await supabase.from("careers").update({ name: careerForm.name, code: careerForm.code, faculty: careerForm.faculty || null }).eq("id", editingCareer.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Carrera actualizada correctamente." });
      } else {
        const { error } = await supabase.from("careers").insert({ name: careerForm.name, code: careerForm.code, faculty: careerForm.faculty || null });
        if (error) throw error;
        toast({ title: "Éxito", description: "Carrera creada correctamente." });
      }
      setShowCareerDialog(false); setEditingCareer(null); setCareerForm({ name: "", code: "", faculty: "" }); fetchAdminData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al guardar la carrera.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  const handleDeleteCareer = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "career") return;
    try {
      const { error } = await supabase.from("careers").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Carrera eliminada correctamente." }); setDeleteConfirm(null); fetchAdminData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al eliminar la carrera.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  // ── Subject CRUD ──
  const handleSaveSubject = async () => {
    try {
      if (editingSubject) {
        const { error } = await supabase.from("subjects").update({ name: subjectForm.name, code: subjectForm.code, semester: subjectForm.semester ? parseInt(subjectForm.semester) : null, career_id: subjectForm.career_id || null }).eq("id", editingSubject.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Materia actualizada correctamente." });
      } else {
        const { error } = await supabase.from("subjects").insert({ name: subjectForm.name, code: subjectForm.code, semester: subjectForm.semester ? parseInt(subjectForm.semester) : null, career_id: subjectForm.career_id || null });
        if (error) throw error;
        toast({ title: "Éxito", description: "Materia creada correctamente." });
      }
      setShowSubjectDialog(false); setEditingSubject(null); setSubjectForm({ name: "", code: "", semester: "", career_id: "" }); fetchAdminData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al guardar la materia.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "subject") return;
    try {
      const { error } = await supabase.from("subjects").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Materia eliminada correctamente." }); setDeleteConfirm(null); fetchAdminData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al eliminar la materia.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  // ── User creation (demo) ──
  const handleCreateUser = () => {
    toast({ title: "Usuario creado (simulado)", description: `Se creó el usuario ${userForm.firstName} ${userForm.lastNamePaterno} ${userForm.lastNameMaterno} con rol ${userForm.role}.` });
    setShowUserDialog(false);
    setUserForm({ role: "", firstName: "", lastNamePaterno: "", lastNameMaterno: "", documentNumber: "", matricula: "", email: "", phone: "", password: "", career: "", sede: "", semester: "", academicDegree: "", profession: "", subjects: "", period: "", area: "", accessLevel: "" });
  };

  // ── Evaluation config ──
  const handleSaveQuestion = (qId: string) => {
    setEvalQuestions(prev => prev.map(q => q.id === qId ? { ...q, text: questionForm.text, maxScore: questionForm.maxScore } : q));
    setEditingQuestion(null);
    toast({ title: "Pregunta actualizada", description: "La pregunta de evaluación fue modificada correctamente." });
  };

  // ── Materials ──
  const handleUploadMaterial = () => {
    const newMaterial = {
      id: `m${Date.now()}`, name: materialForm.name || "Archivo sin nombre", type: "PDF",
      subject: materialForm.subject || "General", uploadedBy: adminProfile?.first_name || "Admin",
      date: new Date().toISOString().split("T")[0],
    };
    setMaterials(prev => [newMaterial, ...prev]);
    setShowMaterialDialog(false);
    setMaterialForm({ name: "", subject: "" });
    toast({ title: "Material subido", description: "El archivo fue registrado correctamente." });
  };

  // ── Enroll student (demo) ──
  const handleEnrollStudent = () => {
    toast({ title: "Estudiante inscrito (simulado)", description: `${enrollForm.name} fue inscrito en ${enrollForm.career}.` });
    setShowEnrollDialog(false);
    setEnrollForm({ name: "", matricula: "", career: "", sede: "", semester: "", subjects: "" });
  };

  // ── Filters ──
  const filteredStudents = students.filter(s =>
    s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const filteredTeachers = teachers.filter(t =>
    t.first_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.last_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.email?.toLowerCase() || "").includes(teacherSearch.toLowerCase())
  );
  const filteredEnrolled = enrolledStudents.filter(e =>
    e.name.toLowerCase().includes(enrolledSearch.toLowerCase()) ||
    e.matricula.toLowerCase().includes(enrolledSearch.toLowerCase())
  );

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
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UPEA</h1>
              <p className="text-xs text-muted-foreground">Panel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {adminProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{adminProfile.first_name} {adminProfile.last_name}</p>
                <p className="text-xs text-muted-foreground">{adminProfile.administrative_position}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { icon: Users, label: "Estudiantes", value: demoStudentCount },
            { icon: GraduationCap, label: "Docentes", value: demoTeacherCount },
            { icon: Building2, label: "Carreras", value: demoCareerCount },
            { icon: BookOpen, label: "Materias", value: demoSubjectCount },
            { icon: FileText, label: "Evaluaciones", value: demoEvalCount },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blockchain Verification */}
        <div className="mb-6">
          <BlockchainVerificationButton />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /><span className="hidden sm:inline">Usuarios</span></TabsTrigger>
            <TabsTrigger value="careers" className="gap-1"><Building2 className="h-4 w-4" /><span className="hidden sm:inline">Carreras</span></TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Materias</span></TabsTrigger>
            <TabsTrigger value="students" className="gap-1"><GraduationCap className="h-4 w-4" /><span className="hidden sm:inline">Estudiantes</span></TabsTrigger>
            <TabsTrigger value="evaluations" className="gap-1"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Evaluaciones</span></TabsTrigger>
            <TabsTrigger value="materials" className="gap-1"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Materiales</span></TabsTrigger>
          </TabsList>

          {/* ═══ USUARIOS ═══ */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Gestión de Usuarios</CardTitle>
                    <CardDescription>Crear usuarios con roles: Estudiante, Docente, Director, Administrador</CardDescription>
                  </div>
                  <Button onClick={() => { setUserForm({ role: "", firstName: "", lastNamePaterno: "", lastNameMaterno: "", documentNumber: "", matricula: "", email: "", phone: "", password: "", career: "", sede: "", semester: "", academicDegree: "", profession: "", subjects: "", period: "", area: "", accessLevel: "" }); setShowUserDialog(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Nuevo Usuario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Students list */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Estudiantes ({useDemoData ? "1,250" : students.length})</h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar estudiante..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="pl-9" />
                    </div>
                    <ScrollArea className="h-[350px]">
                      <Table>
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {useDemoData ? (
                            MOCK_ENROLLED_STUDENTS.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{s.matricula}</TableCell>
                                <TableCell><Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge></TableCell>
                              </TableRow>
                            ))
                          ) : (
                            filteredStudents.map(s => (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                                <TableCell>{s.registration_completed ? <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge> : <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Pendiente</Badge>}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                  {/* Teachers list */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Docentes ({useDemoData ? "45" : teachers.length})</h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar docente..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} className="pl-9" />
                    </div>
                    <ScrollArea className="h-[350px]">
                      <Table>
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Departamento</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {useDemoData ? (
                            [
                              { id: "t1", name: "Msc. Carlos Mamani", dept: "Educación", active: true },
                              { id: "t2", name: "Lic. María Quispe", dept: "Psicología", active: true },
                              { id: "t3", name: "Dr. Pedro Condori", dept: "Investigación", active: true },
                              { id: "t4", name: "Msc. Ana Flores", dept: "Didáctica", active: true },
                              { id: "t5", name: "Lic. Jorge Huanca", dept: "Sociología", active: false },
                            ].filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).map(t => (
                              <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{t.dept}</TableCell>
                                <TableCell>{t.active ? <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge> : <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Pendiente</Badge>}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            filteredTeachers.map(t => (
                              <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.first_name} {t.last_name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{t.department || "Sin asignar"}</TableCell>
                                <TableCell>{t.registration_completed ? <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge> : <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Pendiente</Badge>}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CARRERAS ═══ */}
          <TabsContent value="careers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Carreras</CardTitle>
                    <CardDescription>Crear, editar y administrar carreras universitarias</CardDescription>
                  </div>
                  <Dialog open={showCareerDialog} onOpenChange={setShowCareerDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingCareer(null); setCareerForm({ name: "", code: "", faculty: "" }); }}>
                        <Plus className="h-4 w-4 mr-1" /> Nueva Carrera
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingCareer ? "Editar Carrera" : "Nueva Carrera"}</DialogTitle>
                        <DialogDescription>Complete los datos de la carrera</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Nombre de la Carrera</Label><Input value={careerForm.name} onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })} placeholder="Ej: Ingeniería de Sistemas" /></div>
                        <div className="space-y-2"><Label>Código / Sigla</Label><Input value={careerForm.code} onChange={(e) => setCareerForm({ ...careerForm, code: e.target.value })} placeholder="Ej: ING-SIS" /></div>
                        <div className="space-y-2"><Label>Facultad/Decanatura</Label><Input value={careerForm.faculty} onChange={(e) => setCareerForm({ ...careerForm, faculty: e.target.value })} placeholder="Ej: Facultad de Humanidades" /></div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCareerDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCareer} disabled={!careerForm.name || !careerForm.code}>{editingCareer ? "Actualizar" : "Crear"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Código</TableHead><TableHead>Facultad</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {careers.map(career => (
                      <TableRow key={career.id}>
                        <TableCell className="font-medium">{career.name}</TableCell>
                        <TableCell><Badge variant="outline">{career.code}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{career.faculty || "Sin asignar"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingCareer(career); setCareerForm({ name: career.name, code: career.code, faculty: career.faculty || "" }); setShowCareerDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ type: "career", id: career.id })}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {careers.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No hay carreras registradas</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MATERIAS ═══ */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Materias</CardTitle>
                    <CardDescription>Crear, editar y asignar materias a carreras</CardDescription>
                  </div>
                  <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingSubject(null); setSubjectForm({ name: "", code: "", semester: "", career_id: "" }); }}>
                        <Plus className="h-4 w-4 mr-1" /> Nueva Materia
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSubject ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
                        <DialogDescription>Complete los datos de la materia</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Nombre</Label><Input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="Ej: Programación I" /></div>
                        <div className="space-y-2"><Label>Sigla</Label><Input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="Ej: PRG-101" /></div>
                        <div className="space-y-2">
                          <Label>Semestre</Label>
                          <Select value={subjectForm.semester} onValueChange={(v) => setSubjectForm({ ...subjectForm, semester: v })}>
                            <SelectTrigger><SelectValue placeholder="Seleccione semestre" /></SelectTrigger>
                            <SelectContent>{[1,2,3,4,5,6,7,8,9,10].map(s => <SelectItem key={s} value={s.toString()}>Semestre {s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Carrera</Label>
                          <Select value={subjectForm.career_id} onValueChange={(v) => setSubjectForm({ ...subjectForm, career_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Seleccione carrera" /></SelectTrigger>
                            <SelectContent>{careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSaveSubject} disabled={!subjectForm.name || !subjectForm.code}>{editingSubject ? "Actualizar" : "Crear"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Sigla</TableHead><TableHead>Semestre</TableHead><TableHead>Carrera</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {subjects.map(subject => {
                      const career = careers.find(c => c.id === subject.career_id);
                      return (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell><Badge variant="outline">{subject.code}</Badge></TableCell>
                          <TableCell>{subject.semester ? `Semestre ${subject.semester}` : "Sin asignar"}</TableCell>
                          <TableCell className="text-muted-foreground">{career?.name || "Sin asignar"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingSubject(subject); setSubjectForm({ name: subject.name, code: subject.code, semester: subject.semester?.toString() || "", career_id: subject.career_id || "" }); setShowSubjectDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ type: "subject", id: subject.id })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {subjects.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay materias registradas</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ESTUDIANTES / ASIGNACIÓN ═══ */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Inscripción y Asignación de Estudiantes</CardTitle>
                    <CardDescription>Inscripción manual o masiva, asignación de carrera, sede y materias</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}>
                      <Upload className="h-4 w-4 mr-1" /> Subir Excel
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={() => toast({ title: "Excel cargado (simulado)", description: "Los datos del archivo serían procesados para inscripción masiva." })} />
                    <Button onClick={() => setShowEnrollDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Inscribir Estudiante
                    </Button>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre o matrícula..." value={enrolledSearch} onChange={(e) => setEnrolledSearch(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead><TableHead>Matrícula</TableHead><TableHead>Carrera</TableHead>
                        <TableHead>Sede</TableHead><TableHead>Semestre</TableHead><TableHead>Materias</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnrolled.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell><Badge variant="outline">{s.matricula}</Badge></TableCell>
                          <TableCell className="text-sm">{s.career}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{s.sede}</TableCell>
                          <TableCell>{s.semester}°</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {s.subjects.map(sub => <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ EVALUACIONES (Configuración) ═══ */}
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Configuración de Evaluaciones</CardTitle>
                <CardDescription>Gestione las preguntas y puntajes de la encuesta estudiantil hacia docentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evalQuestions.map((q, idx) => (
                    <div key={q.id} className="border rounded-lg p-4">
                      {editingQuestion === q.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Pregunta {idx + 1}</Label>
                            <Textarea value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor máximo</Label>
                            <Input type="number" value={questionForm.maxScore} onChange={(e) => setQuestionForm({ ...questionForm, maxScore: parseInt(e.target.value) || 0 })} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveQuestion(q.id)}><Save className="h-4 w-4 mr-1" /> Guardar</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Pregunta {idx + 1}</p>
                            <p className="text-sm text-muted-foreground mt-1">{q.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Máx: {q.maxScore} pts</Badge>
                              <Progress value={(q.maxScore / 20) * 100} className="w-24 h-2" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(q.id); setQuestionForm({ text: q.text, maxScore: q.maxScore }); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Puntaje total: <span className="font-bold text-foreground">{evalQuestions.reduce((a, q) => a + q.maxScore, 0)} pts</span></p>
                    <Badge variant={evalQuestions.reduce((a, q) => a + q.maxScore, 0) === 100 ? "default" : "destructive"}>
                      {evalQuestions.reduce((a, q) => a + q.maxScore, 0) === 100 ? "✓ Puntaje válido" : "⚠ Ajustar puntajes"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MATERIALES ═══ */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Materiales y Archivos</CardTitle>
                    <CardDescription>Subir y gestionar archivos asignados a materias o carreras</CardDescription>
                  </div>
                  <Button onClick={() => setShowMaterialDialog(true)}>
                    <Upload className="h-4 w-4 mr-1" /> Subir Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Nombre</TableHead><TableHead>Tipo</TableHead><TableHead>Asignatura</TableHead><TableHead>Subido por</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell><Badge variant="outline">{m.type}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{m.subject}</TableCell>
                        <TableCell className="text-sm">{m.uploadedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setMaterials(prev => prev.filter(x => x.id !== m.id)); toast({ title: "Material eliminado" }); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {materials.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay materiales registrados</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══ DIALOGS ═══ */}

      {/* Create User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Seleccione un rol y complete los datos correspondientes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="teacher">Docente</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userForm.role && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Nombre</Label><Input value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Apellido Paterno</Label><Input value={userForm.lastNamePaterno} onChange={(e) => setUserForm({ ...userForm, lastNamePaterno: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Apellido Materno</Label><Input value={userForm.lastNameMaterno} onChange={(e) => setUserForm({ ...userForm, lastNameMaterno: e.target.value })} /></div>
                </div>

                {userForm.role === "student" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>CI</Label><Input value={userForm.documentNumber} onChange={(e) => setUserForm({ ...userForm, documentNumber: e.target.value })} placeholder="12345678" /></div>
                      <div className="space-y-2"><Label>Matrícula</Label><Input value={userForm.matricula} onChange={(e) => setUserForm({ ...userForm, matricula: e.target.value })} placeholder="EST-2025-001" /></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sede</Label>
                      <Select value={userForm.sede} onValueChange={(v) => setUserForm({ ...userForm, sede: v })}>
                        <SelectTrigger><SelectValue placeholder="Seleccione sede" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="central">Sede Central – El Alto</SelectItem>
                          <SelectItem value="viacha">Sede Viacha</SelectItem>
                          <SelectItem value="desaguadero">Sede Desaguadero</SelectItem>
                          <SelectItem value="copacabana">Sede Copacabana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2"><Label>CI</Label><Input value={userForm.documentNumber} onChange={(e) => setUserForm({ ...userForm, documentNumber: e.target.value })} placeholder="12345678" /></div>
                )}

                <div className="space-y-2"><Label>Correo electrónico</Label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Contraseña</Label><Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>

                {userForm.role === "teacher" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Grado académico</Label><Input value={userForm.academicDegree} onChange={(e) => setUserForm({ ...userForm, academicDegree: e.target.value })} placeholder="Maestría" /></div>
                    <div className="space-y-2"><Label>Profesión</Label><Input value={userForm.profession} onChange={(e) => setUserForm({ ...userForm, profession: e.target.value })} placeholder="Lic. en Educación" /></div>
                  </div>
                )}
                {userForm.role === "director" && (
                  <>
                    <div className="space-y-2"><Label>Grado académico</Label><Input value={userForm.academicDegree} onChange={(e) => setUserForm({ ...userForm, academicDegree: e.target.value })} placeholder="Doctorado" /></div>
                    <div className="space-y-2"><Label>Carrera asignada</Label><Input value={userForm.career} onChange={(e) => setUserForm({ ...userForm, career: e.target.value })} placeholder="Ciencias de la Educación" /></div>
                    <div className="space-y-2"><Label>Periodo de gestión</Label><Input value={userForm.period} onChange={(e) => setUserForm({ ...userForm, period: e.target.value })} placeholder="2025-2027" /></div>
                  </>
                )}
                {userForm.role === "admin" && (
                  <div className="space-y-2"><Label>Área de responsabilidad</Label><Input value={userForm.area} onChange={(e) => setUserForm({ ...userForm, area: e.target.value })} placeholder="Sistemas" /></div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={!userForm.role || !userForm.firstName || !userForm.email || !userForm.password}>Crear Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Student Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir Estudiante</DialogTitle>
            <DialogDescription>Complete los datos de inscripción</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nombre completo</Label><Input value={enrollForm.name} onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Matrícula</Label><Input value={enrollForm.matricula} onChange={(e) => setEnrollForm({ ...enrollForm, matricula: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Carrera</Label><Input value={enrollForm.career} onChange={(e) => setEnrollForm({ ...enrollForm, career: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sede</Label><Input value={enrollForm.sede} onChange={(e) => setEnrollForm({ ...enrollForm, sede: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Semestre</Label><Input value={enrollForm.semester} onChange={(e) => setEnrollForm({ ...enrollForm, semester: e.target.value })} /></div>
            <div className="space-y-2"><Label>Materias (separadas por coma)</Label><Input value={enrollForm.subjects} onChange={(e) => setEnrollForm({ ...enrollForm, subjects: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>Cancelar</Button>
            <Button onClick={handleEnrollStudent} disabled={!enrollForm.name || !enrollForm.career}>Inscribir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Material Dialog */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Material</DialogTitle>
            <DialogDescription>Cargue un archivo y asígnelo a una materia o carrera</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nombre del archivo</Label><Input value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} placeholder="Guía de evaluación.pdf" /></div>
            <div className="space-y-2"><Label>Asignar a materia/carrera</Label><Input value={materialForm.subject} onChange={(e) => setMaterialForm({ ...materialForm, subject: e.target.value })} placeholder="General" /></div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Arrastre un archivo o haga clic para seleccionar</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, Excel, Word (máx. 20MB)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>Cancelar</Button>
            <Button onClick={handleUploadMaterial} disabled={!materialForm.name}>Subir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === "career" ? "carrera" : "materia"}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteConfirm?.type === "career" ? handleDeleteCareer : handleDeleteSubject}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Register Modal */}
      {user && (
        <AdminRegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} userId={user.id} userEmail={user.email || ""} />
      )}
    </div>
  );
};

export default AdminDashboard;
