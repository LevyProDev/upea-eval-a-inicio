import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import AdminRegisterModal from "@/components/admin/AdminRegisterModal";
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  History,
  User,
  LogOut,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  administrative_position: string;
  department: string;
  registration_completed: boolean | null;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  document_number: string;
  registration_completed: boolean | null;
  created_at: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string | null;
  registration_completed: boolean | null;
  created_at: string;
}

interface Career {
  id: string;
  name: string;
  code: string;
  faculty: string | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number | null;
  career_id: string | null;
  created_at: string;
}

interface Evaluation {
  id: string;
  total_score: number;
  evaluated_at: string;
  blockchain_hash: string | null;
  student_id: string;
  assignment_id: string;
}

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
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

  // Search states
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  // Dialog states
  const [showCareerDialog, setShowCareerDialog] = useState(false);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

  // Form states
  const [careerForm, setCareerForm] = useState({ name: "", code: "", faculty: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", semester: "", career_id: "" });

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;

    try {
      // Fetch admin profile
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      setAdminProfile(profile);

      if (!profile.registration_completed) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
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
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos administrativos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Career CRUD
  const handleSaveCareer = async () => {
    try {
      // Check for duplicate code
      const existingCareer = careers.find(
        (c) => c.code === careerForm.code && c.id !== editingCareer?.id
      );
      if (existingCareer) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El código de carrera ya existe.",
        });
        return;
      }

      if (editingCareer) {
        const { error } = await supabase
          .from("careers")
          .update({
            name: careerForm.name,
            code: careerForm.code,
            faculty: careerForm.faculty || null,
          })
          .eq("id", editingCareer.id);

        if (error) throw error;
        toast({ title: "Éxito", description: "Carrera actualizada correctamente." });
      } else {
        const { error } = await supabase.from("careers").insert({
          name: careerForm.name,
          code: careerForm.code,
          faculty: careerForm.faculty || null,
        });

        if (error) throw error;
        toast({ title: "Éxito", description: "Carrera creada correctamente." });
      }

      setShowCareerDialog(false);
      setEditingCareer(null);
      setCareerForm({ name: "", code: "", faculty: "" });
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al guardar la carrera.",
      });
    }
  };

  const handleDeleteCareer = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "career") return;

    try {
      const { error } = await supabase.from("careers").delete().eq("id", deleteConfirm.id);
      if (error) throw error;

      toast({ title: "Éxito", description: "Carrera eliminada correctamente." });
      setDeleteConfirm(null);
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al eliminar la carrera.",
      });
    }
  };

  // Subject CRUD
  const handleSaveSubject = async () => {
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from("subjects")
          .update({
            name: subjectForm.name,
            code: subjectForm.code,
            semester: subjectForm.semester ? parseInt(subjectForm.semester) : null,
            career_id: subjectForm.career_id || null,
          })
          .eq("id", editingSubject.id);

        if (error) throw error;
        toast({ title: "Éxito", description: "Materia actualizada correctamente." });
      } else {
        const { error } = await supabase.from("subjects").insert({
          name: subjectForm.name,
          code: subjectForm.code,
          semester: subjectForm.semester ? parseInt(subjectForm.semester) : null,
          career_id: subjectForm.career_id || null,
        });

        if (error) throw error;
        toast({ title: "Éxito", description: "Materia creada correctamente." });
      }

      setShowSubjectDialog(false);
      setEditingSubject(null);
      setSubjectForm({ name: "", code: "", semester: "", career_id: "" });
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al guardar la materia.",
      });
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "subject") return;

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", deleteConfirm.id);
      if (error) throw error;

      toast({ title: "Éxito", description: "Materia eliminada correctamente." });
      setDeleteConfirm(null);
      fetchAdminData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al eliminar la materia.",
      });
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.first_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.last_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.email?.toLowerCase() || "").includes(teacherSearch.toLowerCase())
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
                <p className="text-sm font-medium">
                  {adminProfile.first_name} {adminProfile.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminProfile.administrative_position}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{careers.length}</p>
                  <p className="text-xs text-muted-foreground">Carreras</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subjects.length}</p>
                  <p className="text-xs text-muted-foreground">Materias</p>
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
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="careers" className="gap-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Carreras</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Materias</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Auditoría</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Estudiantes
                      </CardTitle>
                      <CardDescription>Gestión de perfiles de estudiantes</CardDescription>
                    </div>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estudiante..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {student.email}
                            </TableCell>
                            <TableCell>
                              {student.registration_completed ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pendiente
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              No se encontraron estudiantes
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Teachers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Docentes
                      </CardTitle>
                      <CardDescription>Gestión de perfiles de docentes</CardDescription>
                    </div>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar docente..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">
                              {teacher.first_name} {teacher.last_name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {teacher.department || "Sin asignar"}
                            </TableCell>
                            <TableCell>
                              {teacher.registration_completed ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pendiente
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTeachers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              No se encontraron docentes
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Careers Tab */}
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
                      <Button
                        onClick={() => {
                          setEditingCareer(null);
                          setCareerForm({ name: "", code: "", faculty: "" });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Carrera
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCareer ? "Editar Carrera" : "Nueva Carrera"}
                        </DialogTitle>
                        <DialogDescription>
                          Complete los datos de la carrera
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre de la Carrera</Label>
                          <Input
                            value={careerForm.name}
                            onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })}
                            placeholder="Ej: Ingeniería de Sistemas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Código</Label>
                          <Input
                            value={careerForm.code}
                            onChange={(e) => setCareerForm({ ...careerForm, code: e.target.value })}
                            placeholder="Ej: ING-SIS"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Facultad/Decanatura</Label>
                          <Input
                            value={careerForm.faculty}
                            onChange={(e) => setCareerForm({ ...careerForm, faculty: e.target.value })}
                            placeholder="Ej: Facultad de Ingeniería"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCareerDialog(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveCareer}
                          disabled={!careerForm.name || !careerForm.code}
                        >
                          {editingCareer ? "Actualizar" : "Crear"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Facultad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {careers.map((career) => (
                      <TableRow key={career.id}>
                        <TableCell className="font-medium">{career.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{career.code}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {career.faculty || "Sin asignar"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCareer(career);
                                setCareerForm({
                                  name: career.name,
                                  code: career.code,
                                  faculty: career.faculty || "",
                                });
                                setShowCareerDialog(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm({ type: "career", id: career.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {careers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No hay carreras registradas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
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
                      <Button
                        onClick={() => {
                          setEditingSubject(null);
                          setSubjectForm({ name: "", code: "", semester: "", career_id: "" });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Materia
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSubject ? "Editar Materia" : "Nueva Materia"}
                        </DialogTitle>
                        <DialogDescription>
                          Complete los datos de la materia
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre de la Materia</Label>
                          <Input
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                            placeholder="Ej: Programación I"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Código</Label>
                          <Input
                            value={subjectForm.code}
                            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                            placeholder="Ej: PRG-101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Semestre</Label>
                          <Select
                            value={subjectForm.semester}
                            onValueChange={(value) => setSubjectForm({ ...subjectForm, semester: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione semestre" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                                <SelectItem key={sem} value={sem.toString()}>
                                  Semestre {sem}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Carrera</Label>
                          <Select
                            value={subjectForm.career_id}
                            onValueChange={(value) => setSubjectForm({ ...subjectForm, career_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione carrera" />
                            </SelectTrigger>
                            <SelectContent>
                              {careers.map((career) => (
                                <SelectItem key={career.id} value={career.id}>
                                  {career.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveSubject}
                          disabled={!subjectForm.name || !subjectForm.code}
                        >
                          {editingSubject ? "Actualizar" : "Crear"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Semestre</TableHead>
                      <TableHead>Carrera</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => {
                      const career = careers.find((c) => c.id === subject.career_id);
                      return (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{subject.code}</Badge>
                          </TableCell>
                          <TableCell>
                            {subject.semester ? `Semestre ${subject.semester}` : "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {career?.name || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingSubject(subject);
                                  setSubjectForm({
                                    name: subject.name,
                                    code: subject.code,
                                    semester: subject.semester?.toString() || "",
                                    career_id: subject.career_id || "",
                                  });
                                  setShowSubjectDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirm({ type: "subject", id: subject.id })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {subjects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay materias registradas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Panel de Auditoría y Blockchain
                </CardTitle>
                <CardDescription>
                  Historial de evaluaciones registradas con hash blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No hay evaluaciones registradas en el sistema.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>ID Estudiante</TableHead>
                          <TableHead>Puntaje</TableHead>
                          <TableHead>Hash Blockchain</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluations.map((evaluation) => (
                          <TableRow key={evaluation.id}>
                            <TableCell>
                              {new Date(evaluation.evaluated_at).toLocaleDateString("es-BO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {evaluation.student_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  evaluation.total_score >= 80
                                    ? "default"
                                    : evaluation.total_score >= 60
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {evaluation.total_score}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {evaluation.blockchain_hash ? (
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3 text-primary" />
                                  <span className="font-mono text-xs">
                                    {evaluation.blockchain_hash.substring(0, 16)}...
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Sin hash</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === "career" ? "carrera" : "materia"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteConfirm?.type === "career" ? handleDeleteCareer : handleDeleteSubject}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Register Modal */}
      {user && (
        <AdminRegisterModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
