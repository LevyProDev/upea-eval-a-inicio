import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Building2, Phone, Briefcase, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface DirectorPersonalData {
  firstName: string;
  lastName: string;
  careerId: string;
  faculty: string;
  position: string;
  phoneNumber: string;
  documentType: string;
  documentNumber: string;
}

interface DirectorPersonalDataStepProps {
  data: DirectorPersonalData;
  email: string;
  onChange: (data: DirectorPersonalData) => void;
}

interface Career {
  id: string;
  name: string;
  faculty: string | null;
}

const FACULTIES = [
  "Facultad de Ingeniería",
  "Facultad de Ciencias Económicas y Financieras",
  "Facultad de Ciencias Sociales",
  "Facultad de Ciencias de la Salud",
  "Facultad de Humanidades y Ciencias de la Educación",
  "Facultad de Derecho y Ciencias Políticas",
  "Facultad de Arquitectura y Artes",
  "Facultad de Agronomía",
];

const DirectorPersonalDataStep = ({
  data,
  email,
  onChange,
}: DirectorPersonalDataStepProps) => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(true);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data: careersData, error } = await supabase
        .from("careers")
        .select("id, name, faculty")
        .order("name");

      if (error) throw error;
      setCareers(careersData || []);
    } catch (error) {
      console.error("Error fetching careers:", error);
    } finally {
      setLoadingCareers(false);
    }
  };

  const handleChange = (field: keyof DirectorPersonalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleCareerChange = (careerId: string) => {
    const selectedCareer = careers.find((c) => c.id === careerId);
    onChange({
      ...data,
      careerId,
      faculty: selectedCareer?.faculty || data.faculty,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Información Personal
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete los datos del Director de Carrera para el registro
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
          <Label htmlFor="careerId" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Carrera que Dirige <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.careerId}
            onValueChange={handleCareerChange}
            disabled={loadingCareers}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCareers ? "Cargando..." : "Seleccione carrera"} />
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

        <div className="space-y-2">
          <Label htmlFor="faculty" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Facultad <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.faculty}
            onValueChange={(value) => handleChange("faculty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione facultad" />
            </SelectTrigger>
            <SelectContent>
              {FACULTIES.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Cargo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="position"
            placeholder="Ej: Director de Carrera"
            value={data.position}
            onChange={(e) => handleChange("position", e.target.value)}
          />
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

        <div className="space-y-2 md:col-span-2">
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

export default DirectorPersonalDataStep;
