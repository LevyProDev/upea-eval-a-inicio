import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherPersonalData } from "./TeacherRegisterModal";
import { User, BookOpen, GraduationCap, Building2, Phone } from "lucide-react";

interface TeacherPersonalDataStepProps {
  data: TeacherPersonalData;
  onChange: (data: TeacherPersonalData) => void;
}

const ACADEMIC_DEGREES = [
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Especialidad",
  "Postdoctorado",
];

const DEPARTMENTS = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Ingeniería Civil",
  "Ingeniería Electrónica",
  "Administración de Empresas",
  "Contaduría Pública",
  "Economía",
  "Derecho",
  "Medicina",
  "Odontología",
  "Arquitectura",
  "Comunicación Social",
];

const TeacherPersonalDataStep = ({
  data,
  onChange,
}: TeacherPersonalDataStepProps) => {
  const handleChange = (field: keyof TeacherPersonalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Información Personal
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete los datos del docente para el registro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nombre(s)
          </Label>
          <Input
            id="firstName"
            placeholder="Ingrese su nombre"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Apellido(s)
          </Label>
          <Input
            id="lastName"
            placeholder="Ingrese su apellido"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Especialidad
          </Label>
          <Input
            id="specialty"
            placeholder="Ej: Programación, Base de Datos"
            value={data.specialty}
            onChange={(e) => handleChange("specialty", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicDegree" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Grado Académico
          </Label>
          <Select
            value={data.academicDegree}
            onValueChange={(value) => handleChange("academicDegree", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione grado" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_DEGREES.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Departamento/Carrera
          </Label>
          <Select
            value={data.department}
            onValueChange={(value) => handleChange("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione departamento" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Teléfono (opcional)
          </Label>
          <Input
            id="phoneNumber"
            placeholder="Ej: +591 12345678"
            value={data.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherPersonalDataStep;
