import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Building2, Phone, Briefcase } from "lucide-react";

export interface AdminPersonalData {
  firstName: string;
  lastName: string;
  administrativePosition: string;
  department: string;
  phoneNumber: string;
  documentType: string;
  documentNumber: string;
}

interface AdminPersonalDataStepProps {
  data: AdminPersonalData;
  email: string;
  onChange: (data: AdminPersonalData) => void;
}

const ADMINISTRATIVE_POSITIONS = [
  "Responsable Académico",
  "Gestor de Carrera",
  "Director Académico",
  "Secretario Académico",
  "Coordinador de Área",
  "Jefe de Unidad",
  "Encargado de Registro",
  "Administrador de Sistema",
];

const DEPARTMENTS = [
  "Decanatura de Ingeniería",
  "Decanatura de Ciencias Económicas",
  "Decanatura de Ciencias Sociales",
  "Decanatura de Ciencias de la Salud",
  "Dirección Académica",
  "Registro Universitario",
  "Tecnologías de Información",
  "Planificación Académica",
  "Control Académico",
  "Secretaría General",
];

const AdminPersonalDataStep = ({
  data,
  email,
  onChange,
}: AdminPersonalDataStepProps) => {
  const handleChange = (field: keyof AdminPersonalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Información Personal
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete los datos del administrativo para el registro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nombre(s) <span className="text-destructive">*</span>
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
            Apellido(s) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Ingrese su apellido"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Correo Institucional
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-muted"
          />
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

        <div className="space-y-2">
          <Label htmlFor="administrativePosition" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Cargo Administrativo <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.administrativePosition}
            onValueChange={(value) => handleChange("administrativePosition", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione cargo" />
            </SelectTrigger>
            <SelectContent>
              {ADMINISTRATIVE_POSITIONS.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Área/Decanato <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.department}
            onValueChange={(value) => handleChange("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione área" />
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
          <Label htmlFor="documentType" className="flex items-center gap-2">
            Tipo de Documento <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.documentType}
            onValueChange={(value) => handleChange("documentType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CI">CI - Cédula de Identidad</SelectItem>
              <SelectItem value="CIE">CIE - Cédula de Identidad Extranjero</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="flex items-center gap-2">
            Número de Documento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="documentNumber"
            placeholder="Ej: 12345678"
            value={data.documentNumber}
            onChange={(e) => handleChange("documentNumber", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPersonalDataStep;
