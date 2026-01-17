// Mock data for student dashboard demo mode

export interface MockStudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  career: string;
  semester: number;
  enrollmentNumber: string;
}

export interface MockSubject {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  paralelo: string;
  sede: string;
}

export const MOCK_STUDENT_PROFILE: MockStudentProfile = {
  id: "mock-student-001",
  firstName: "Vicky Dashely",
  lastName: "",
  career: "Ciencias de la Educación",
  semester: 1,
  enrollmentNumber: "12345678",
};

export const MOCK_SUBJECTS: MockSubject[] = [
  {
    id: "subj-001",
    code: "EDU-100",
    name: "Introducción a las Ciencias de la Educación",
    teacherName: "Lic. María Quispe",
    paralelo: "A",
    sede: "Campus Central",
  },
  {
    id: "subj-002",
    code: "EDU-110",
    name: "Psicología Educativa",
    teacherName: "Msc. Carlos Mamani",
    paralelo: "A",
    sede: "Campus Central",
  },
  {
    id: "subj-003",
    code: "EDU-120",
    name: "Didáctica General",
    teacherName: "Lic. Ana Choque",
    paralelo: "A",
    sede: "Campus Central",
  },
  {
    id: "subj-004",
    code: "EDU-130",
    name: "Sociología de la Educación",
    teacherName: "Lic. Juan Flores",
    paralelo: "A",
    sede: "Campus Central",
  },
  {
    id: "subj-005",
    code: "EDU-140",
    name: "Filosofía de la Educación",
    teacherName: "Lic. Luis Condori",
    paralelo: "A",
    sede: "Campus Central",
  },
  {
    id: "subj-006",
    code: "EDU-150",
    name: "Comunicación Educativa",
    teacherName: "Lic. Mariela Apaza",
    paralelo: "A",
    sede: "Campus Central",
  },
];

// localStorage keys for evaluation persistence
const EVALUATION_STORAGE_PREFIX = "evaluacion_";

export interface StoredEvaluation {
  subjectCode: string;
  score: number;
  date: string;
  evaluated: boolean;
}

export const getStoredEvaluation = (subjectCode: string): StoredEvaluation | null => {
  try {
    const key = `${EVALUATION_STORAGE_PREFIX}${subjectCode}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
};

export const saveEvaluation = (subjectCode: string, score: number): StoredEvaluation => {
  const evaluation: StoredEvaluation = {
    subjectCode,
    score,
    date: new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    evaluated: true,
  };
  
  const key = `${EVALUATION_STORAGE_PREFIX}${subjectCode}`;
  localStorage.setItem(key, JSON.stringify(evaluation));
  
  return evaluation;
};

export const getAllStoredEvaluations = (): Record<string, StoredEvaluation> => {
  const evaluations: Record<string, StoredEvaluation> = {};
  
  MOCK_SUBJECTS.forEach(subject => {
    const stored = getStoredEvaluation(subject.code);
    if (stored) {
      evaluations[subject.code] = stored;
    }
  });
  
  return evaluations;
};

export const clearAllEvaluations = (): void => {
  MOCK_SUBJECTS.forEach(subject => {
    const key = `${EVALUATION_STORAGE_PREFIX}${subject.code}`;
    localStorage.removeItem(key);
  });
};

// ==========================================
// Mock data for teacher dashboard demo mode
// ==========================================

export interface MockTeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  academicDegree: string;
  department: string;
  registrationCompleted: boolean;
  photoUrl: string;
}

export interface MockTeacherSubject {
  id: string;
  code: string;
  name: string;
  paralelo: string;
  sede: string;
  studentsCount: number;
  evaluationPercentage: number;
  academicYear: number;
  period: string;
  isActive: boolean;
}

export interface MockStudent {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  career: string;
  grades: {
    parcial1: number;
    parcial2: number;
    final: number;
  };
  attendance: number;
}

export interface MockTeacherEvaluation {
  id: string;
  period: string;
  academicYear: number;
  subjectCode: string;
  subjectName: string;
  averageScore: number;
  evaluationsCount: number;
  blockchainHash: string;
  evaluatedAt: string;
  criteria: {
    preparation: number;
    domain: number;
    compliance: number;
    punctuality: number;
    objectivity: number;
  };
}

export interface MockStudentFeedback {
  id: string;
  studentId: string;
  comment: string;
  date: string;
  subjectCode: string;
}

export const MOCK_TEACHER_PROFILE: MockTeacherProfile = {
  id: "mock-teacher-001",
  firstName: "Docente",
  lastName: "Demo",
  email: "docente@upea.edu.bo",
  specialty: "Informática",
  academicDegree: "Magíster",
  department: "Departamento de Sistemas",
  registrationCompleted: true,
  photoUrl: "",
};

export const MOCK_TEACHER_SUBJECTS: MockTeacherSubject[] = [
  {
    id: "ts-001",
    code: "EDU-100",
    name: "Introducción a las Ciencias de la Educación",
    paralelo: "A",
    sede: "Sede Central",
    studentsCount: 35,
    evaluationPercentage: 80,
    academicYear: 2025,
    period: "I/2025",
    isActive: true,
  },
  {
    id: "ts-002",
    code: "EDU-110",
    name: "Psicología Educativa",
    paralelo: "B",
    sede: "Sede Villa Esperanza",
    studentsCount: 40,
    evaluationPercentage: 75,
    academicYear: 2025,
    period: "I/2025",
    isActive: true,
  },
  {
    id: "ts-003",
    code: "EDU-120",
    name: "Didáctica General",
    paralelo: "A",
    sede: "Sede Central",
    studentsCount: 30,
    evaluationPercentage: 90,
    academicYear: 2025,
    period: "I/2025",
    isActive: true,
  },
  {
    id: "ts-004",
    code: "EDU-140",
    name: "Filosofía de la Educación",
    paralelo: "C",
    sede: "Sede Central",
    studentsCount: 25,
    evaluationPercentage: 60,
    academicYear: 2025,
    period: "I/2025",
    isActive: true,
  },
];

export const MOCK_STUDENTS_BY_SUBJECT: Record<string, MockStudent[]> = {
  "EDU-100": [
    { id: "st-001", firstName: "María", lastName: "García", enrollmentNumber: "20230001", career: "Ciencias de la Educación", grades: { parcial1: 85, parcial2: 78, final: 0 }, attendance: 95 },
    { id: "st-002", firstName: "Carlos", lastName: "López", enrollmentNumber: "20230002", career: "Ciencias de la Educación", grades: { parcial1: 72, parcial2: 80, final: 0 }, attendance: 88 },
    { id: "st-003", firstName: "Ana", lastName: "Mamani", enrollmentNumber: "20230003", career: "Ciencias de la Educación", grades: { parcial1: 90, parcial2: 92, final: 0 }, attendance: 100 },
    { id: "st-004", firstName: "José", lastName: "Quispe", enrollmentNumber: "20230004", career: "Ciencias de la Educación", grades: { parcial1: 65, parcial2: 70, final: 0 }, attendance: 80 },
    { id: "st-005", firstName: "Lucia", lastName: "Flores", enrollmentNumber: "20230005", career: "Ciencias de la Educación", grades: { parcial1: 88, parcial2: 85, final: 0 }, attendance: 92 },
  ],
  "EDU-110": [
    { id: "st-006", firstName: "Pedro", lastName: "Condori", enrollmentNumber: "20230006", career: "Ciencias de la Educación", grades: { parcial1: 78, parcial2: 82, final: 0 }, attendance: 90 },
    { id: "st-007", firstName: "Rosa", lastName: "Choque", enrollmentNumber: "20230007", career: "Ciencias de la Educación", grades: { parcial1: 95, parcial2: 88, final: 0 }, attendance: 98 },
    { id: "st-008", firstName: "Juan", lastName: "Apaza", enrollmentNumber: "20230008", career: "Ciencias de la Educación", grades: { parcial1: 70, parcial2: 75, final: 0 }, attendance: 85 },
  ],
  "EDU-120": [
    { id: "st-009", firstName: "Elena", lastName: "Tarqui", enrollmentNumber: "20230009", career: "Ciencias de la Educación", grades: { parcial1: 82, parcial2: 86, final: 0 }, attendance: 94 },
    { id: "st-010", firstName: "Miguel", lastName: "Huanca", enrollmentNumber: "20230010", career: "Ciencias de la Educación", grades: { parcial1: 88, parcial2: 90, final: 0 }, attendance: 96 },
  ],
  "EDU-140": [
    { id: "st-011", firstName: "Sofía", lastName: "Callisaya", enrollmentNumber: "20230011", career: "Ciencias de la Educación", grades: { parcial1: 75, parcial2: 78, final: 0 }, attendance: 88 },
    { id: "st-012", firstName: "Diego", lastName: "Patzi", enrollmentNumber: "20230012", career: "Ciencias de la Educación", grades: { parcial1: 92, parcial2: 89, final: 0 }, attendance: 100 },
  ],
};

export const MOCK_TEACHER_EVALUATIONS: MockTeacherEvaluation[] = [
  {
    id: "eval-001",
    period: "I/2024",
    academicYear: 2024,
    subjectCode: "EDU-100",
    subjectName: "Introducción a las Ciencias de la Educación",
    averageScore: 83,
    evaluationsCount: 32,
    blockchainHash: "0x7a3f...8c2d",
    evaluatedAt: "2024-06-15T14:30:00Z",
    criteria: { preparation: 17, domain: 16, compliance: 8, punctuality: 9, objectivity: 8 },
  },
  {
    id: "eval-002",
    period: "II/2024",
    academicYear: 2024,
    subjectCode: "EDU-110",
    subjectName: "Psicología Educativa",
    averageScore: 87,
    evaluationsCount: 38,
    blockchainHash: "0x9b4e...2f1a",
    evaluatedAt: "2024-12-10T10:15:00Z",
    criteria: { preparation: 18, domain: 18, compliance: 9, punctuality: 9, objectivity: 9 },
  },
  {
    id: "eval-003",
    period: "I/2025",
    academicYear: 2025,
    subjectCode: "EDU-120",
    subjectName: "Didáctica General",
    averageScore: 85,
    evaluationsCount: 27,
    blockchainHash: "0x3c7d...5e9b",
    evaluatedAt: "2025-01-10T16:45:00Z",
    criteria: { preparation: 18, domain: 17, compliance: 8, punctuality: 9, objectivity: 9 },
  },
];

export const MOCK_CURRENT_CRITERIA: {
  preparation: number;
  domain: number;
  compliance: number;
  punctuality: number;
  objectivity: number;
} = {
  preparation: 18,
  domain: 17,
  compliance: 8,
  punctuality: 9,
  objectivity: 9,
};

export const MOCK_STUDENT_FEEDBACK: MockStudentFeedback[] = [
  {
    id: "fb-001",
    studentId: "anonymous",
    comment: "Explica con claridad y paciencia. Las clases son muy dinámicas.",
    date: "2025-01-08",
    subjectCode: "EDU-100",
  },
  {
    id: "fb-002",
    studentId: "anonymous",
    comment: "Debería mejorar la puntualidad en algunos casos.",
    date: "2025-01-05",
    subjectCode: "EDU-110",
  },
  {
    id: "fb-003",
    studentId: "anonymous",
    comment: "Muy buen docente, domina el tema a profundidad.",
    date: "2025-01-02",
    subjectCode: "EDU-120",
  },
  {
    id: "fb-004",
    studentId: "anonymous",
    comment: "Las evaluaciones son justas y objetivas.",
    date: "2024-12-28",
    subjectCode: "EDU-100",
  },
  {
    id: "fb-005",
    studentId: "anonymous",
    comment: "Me gustaría más material de apoyo digital.",
    date: "2024-12-20",
    subjectCode: "EDU-140",
  },
];

// Evaluation data per subject (how students evaluated the teacher for each subject)
export interface MockSubjectEvaluation {
  subjectCode: string;
  subjectName: string;
  evaluationsReceived: number;
  totalStudents: number;
  averageScore: number;
  criteria: {
    preparation: number;
    domain: number;
    compliance: number;
    punctuality: number;
    objectivity: number;
  };
}

export const MOCK_SUBJECT_EVALUATIONS: Record<string, MockSubjectEvaluation> = {
  "EDU-100": {
    subjectCode: "EDU-100",
    subjectName: "Introducción a las Ciencias de la Educación",
    evaluationsReceived: 28,
    totalStudents: 35,
    averageScore: 86,
    criteria: { preparation: 18, domain: 17, compliance: 9, punctuality: 9, objectivity: 9 },
  },
  "EDU-110": {
    subjectCode: "EDU-110",
    subjectName: "Psicología Educativa",
    evaluationsReceived: 30,
    totalStudents: 40,
    averageScore: 82,
    criteria: { preparation: 17, domain: 16, compliance: 8, punctuality: 9, objectivity: 8 },
  },
  "EDU-120": {
    subjectCode: "EDU-120",
    subjectName: "Didáctica General",
    evaluationsReceived: 27,
    totalStudents: 30,
    averageScore: 90,
    criteria: { preparation: 19, domain: 18, compliance: 9, punctuality: 10, objectivity: 9 },
  },
  "EDU-140": {
    subjectCode: "EDU-140",
    subjectName: "Filosofía de la Educación",
    evaluationsReceived: 15,
    totalStudents: 25,
    averageScore: 78,
    criteria: { preparation: 16, domain: 15, compliance: 8, punctuality: 8, objectivity: 8 },
  },
};

// Calculate mock stats
export const MOCK_TEACHER_STATS = {
  activeSubjects: MOCK_TEACHER_SUBJECTS.filter(s => s.isActive).length,
  totalEvaluations: 120,
  overallAverage: 85,
  status: "Activo" as const,
};

// ==========================================
// Mock data for Director dashboard demo mode
// ==========================================

export interface MockDirectorTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  specialty: string;
  academicDegree: string;
  subjects: string[];
  averageScore: number;
  evaluationStatus: string;
  evaluatedSubjects: number;
  totalSubjects: number;
}

export interface MockDirectorStudent {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  semester: number;
  registrationStatus: string;
  hasEvaluated: boolean;
  subjectsEnrolled: number;
  subjectsEvaluated: number;
}

export interface MockDirectorEvaluation {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  paralelo: string;
  sede: string;
  averageScore: number;
  evaluatedCount: number;
  totalStudents: number;
  criteria: {
    preparation: number;
    domain: number;
    compliance: number;
    punctuality: number;
    objectivity: number;
  };
}

export interface MockAuditRecord {
  id: string;
  period: string;
  academicYear: number;
  totalEvaluations: number;
  globalHash: string;
  records: {
    id: string;
    date: string;
    subjectName: string;
    teacherName: string;
    averageScore: number;
    hash: string;
  }[];
}

export interface MockStudentHistory {
  id: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  semester: number;
  hasEvaluated: boolean;
  evaluationDate?: string;
  score?: number;
}

// Mock director teachers
export const MOCK_DIRECTOR_TEACHERS: MockDirectorTeacher[] = [
  {
    id: "dt-001",
    firstName: "María",
    lastName: "Quispe",
    email: "m.quispe@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Pedagogía",
    academicDegree: "Licenciada",
    subjects: ["Introducción a las Ciencias de la Educación", "Metodología de la Investigación"],
    averageScore: 86,
    evaluationStatus: "Evaluado en 2 de 2 materias",
    evaluatedSubjects: 2,
    totalSubjects: 2,
  },
  {
    id: "dt-002",
    firstName: "Carlos",
    lastName: "Mamani",
    email: "c.mamani@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Psicología Educativa",
    academicDegree: "Magíster",
    subjects: ["Psicología Educativa", "Psicología del Desarrollo"],
    averageScore: 88,
    evaluationStatus: "Evaluado en 2 de 2 materias",
    evaluatedSubjects: 2,
    totalSubjects: 2,
  },
  {
    id: "dt-003",
    firstName: "Ana",
    lastName: "Choque",
    email: "a.choque@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Didáctica",
    academicDegree: "Licenciada",
    subjects: ["Didáctica General", "Planificación Educativa"],
    averageScore: 91,
    evaluationStatus: "Evaluado en 2 de 2 materias",
    evaluatedSubjects: 2,
    totalSubjects: 2,
  },
  {
    id: "dt-004",
    firstName: "Juan",
    lastName: "Flores",
    email: "j.flores@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Sociología",
    academicDegree: "Licenciado",
    subjects: ["Sociología de la Educación"],
    averageScore: 82,
    evaluationStatus: "Evaluado en 1 de 1 materias",
    evaluatedSubjects: 1,
    totalSubjects: 1,
  },
  {
    id: "dt-005",
    firstName: "Luis",
    lastName: "Condori",
    email: "l.condori@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Filosofía",
    academicDegree: "Licenciado",
    subjects: ["Filosofía de la Educación"],
    averageScore: 78,
    evaluationStatus: "Evaluado en 1 de 1 materias",
    evaluatedSubjects: 1,
    totalSubjects: 1,
  },
  {
    id: "dt-006",
    firstName: "Mariela",
    lastName: "Apaza",
    email: "m.apaza@upea.edu.bo",
    department: "Departamento de Educación",
    specialty: "Comunicación",
    academicDegree: "Licenciada",
    subjects: ["Comunicación Educativa"],
    averageScore: 84,
    evaluationStatus: "Evaluado en 1 de 1 materias",
    evaluatedSubjects: 1,
    totalSubjects: 1,
  },
];

// Mock director students
export const MOCK_DIRECTOR_STUDENTS: MockDirectorStudent[] = [
  { id: "ds-001", firstName: "María", lastName: "García", enrollmentNumber: "20230001", semester: 1, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 6, subjectsEvaluated: 6 },
  { id: "ds-002", firstName: "Carlos", lastName: "López", enrollmentNumber: "20230002", semester: 1, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 6, subjectsEvaluated: 5 },
  { id: "ds-003", firstName: "Ana", lastName: "Mamani", enrollmentNumber: "20230003", semester: 2, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 5, subjectsEvaluated: 5 },
  { id: "ds-004", firstName: "José", lastName: "Quispe", enrollmentNumber: "20230004", semester: 2, registrationStatus: "Activo", hasEvaluated: false, subjectsEnrolled: 5, subjectsEvaluated: 0 },
  { id: "ds-005", firstName: "Lucia", lastName: "Flores", enrollmentNumber: "20230005", semester: 1, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 6, subjectsEvaluated: 4 },
  { id: "ds-006", firstName: "Pedro", lastName: "Condori", enrollmentNumber: "20230006", semester: 3, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 5, subjectsEvaluated: 5 },
  { id: "ds-007", firstName: "Rosa", lastName: "Choque", enrollmentNumber: "20230007", semester: 3, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 5, subjectsEvaluated: 5 },
  { id: "ds-008", firstName: "Juan", lastName: "Apaza", enrollmentNumber: "20230008", semester: 4, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 4, subjectsEvaluated: 3 },
  { id: "ds-009", firstName: "Elena", lastName: "Tarqui", enrollmentNumber: "20230009", semester: 4, registrationStatus: "Activo", hasEvaluated: false, subjectsEnrolled: 4, subjectsEvaluated: 0 },
  { id: "ds-010", firstName: "Miguel", lastName: "Huanca", enrollmentNumber: "20230010", semester: 5, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 4, subjectsEvaluated: 4 },
  { id: "ds-011", firstName: "Sofía", lastName: "Callisaya", enrollmentNumber: "20230011", semester: 5, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 4, subjectsEvaluated: 4 },
  { id: "ds-012", firstName: "Diego", lastName: "Patzi", enrollmentNumber: "20230012", semester: 6, registrationStatus: "Activo", hasEvaluated: true, subjectsEnrolled: 3, subjectsEvaluated: 3 },
];

// Mock director evaluations by subject
export const MOCK_DIRECTOR_EVALUATIONS: MockDirectorEvaluation[] = [
  {
    id: "de-001",
    subjectCode: "EDU-100",
    subjectName: "Introducción a las Ciencias de la Educación",
    teacherName: "Lic. María Quispe",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 86,
    evaluatedCount: 32,
    totalStudents: 35,
    criteria: { preparation: 18, domain: 17, compliance: 9, punctuality: 9, objectivity: 9 },
  },
  {
    id: "de-002",
    subjectCode: "EDU-110",
    subjectName: "Psicología Educativa",
    teacherName: "Msc. Carlos Mamani",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 88,
    evaluatedCount: 38,
    totalStudents: 40,
    criteria: { preparation: 18, domain: 18, compliance: 9, punctuality: 9, objectivity: 9 },
  },
  {
    id: "de-003",
    subjectCode: "EDU-120",
    subjectName: "Didáctica General",
    teacherName: "Lic. Ana Choque",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 91,
    evaluatedCount: 28,
    totalStudents: 30,
    criteria: { preparation: 19, domain: 18, compliance: 9, punctuality: 10, objectivity: 10 },
  },
  {
    id: "de-004",
    subjectCode: "EDU-130",
    subjectName: "Sociología de la Educación",
    teacherName: "Lic. Juan Flores",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 82,
    evaluatedCount: 25,
    totalStudents: 28,
    criteria: { preparation: 17, domain: 16, compliance: 8, punctuality: 8, objectivity: 8 },
  },
  {
    id: "de-005",
    subjectCode: "EDU-140",
    subjectName: "Filosofía de la Educación",
    teacherName: "Lic. Luis Condori",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 78,
    evaluatedCount: 22,
    totalStudents: 25,
    criteria: { preparation: 16, domain: 15, compliance: 8, punctuality: 8, objectivity: 7 },
  },
  {
    id: "de-006",
    subjectCode: "EDU-150",
    subjectName: "Comunicación Educativa",
    teacherName: "Lic. Mariela Apaza",
    paralelo: "A",
    sede: "Sede Central",
    averageScore: 84,
    evaluatedCount: 30,
    totalStudents: 32,
    criteria: { preparation: 17, domain: 17, compliance: 8, punctuality: 9, objectivity: 8 },
  },
];

// Mock audit records
export const MOCK_AUDIT_RECORDS: MockAuditRecord[] = [
  {
    id: "ar-001",
    period: "I/2025",
    academicYear: 2025,
    totalEvaluations: 1080,
    globalHash: "0x4a7b8c9d2e3f1a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    records: [
      { id: "r-001", date: "2025-01-15", subjectName: "Introducción a las Ciencias de la Educación", teacherName: "Lic. María Quispe", averageScore: 86, hash: "0x7a3f...8c2d" },
      { id: "r-002", date: "2025-01-14", subjectName: "Psicología Educativa", teacherName: "Msc. Carlos Mamani", averageScore: 88, hash: "0x9b4e...2f1a" },
      { id: "r-003", date: "2025-01-13", subjectName: "Didáctica General", teacherName: "Lic. Ana Choque", averageScore: 91, hash: "0x3c7d...5e9b" },
      { id: "r-004", date: "2025-01-12", subjectName: "Sociología de la Educación", teacherName: "Lic. Juan Flores", averageScore: 82, hash: "0x6f2a...9c8d" },
      { id: "r-005", date: "2025-01-11", subjectName: "Filosofía de la Educación", teacherName: "Lic. Luis Condori", averageScore: 78, hash: "0x1d4e...7b3a" },
    ],
  },
  {
    id: "ar-002",
    period: "II/2024",
    academicYear: 2024,
    totalEvaluations: 980,
    globalHash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    records: [
      { id: "r-006", date: "2024-12-10", subjectName: "Introducción a las Ciencias de la Educación", teacherName: "Lic. María Quispe", averageScore: 84, hash: "0x5e8f...1a4b" },
      { id: "r-007", date: "2024-12-09", subjectName: "Psicología Educativa", teacherName: "Msc. Carlos Mamani", averageScore: 87, hash: "0x2c7d...8e5f" },
      { id: "r-008", date: "2024-12-08", subjectName: "Didáctica General", teacherName: "Lic. Ana Choque", averageScore: 89, hash: "0x9a3b...4c7d" },
    ],
  },
  {
    id: "ar-003",
    period: "I/2024",
    academicYear: 2024,
    totalEvaluations: 920,
    globalHash: "0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    records: [
      { id: "r-009", date: "2024-06-15", subjectName: "Introducción a las Ciencias de la Educación", teacherName: "Lic. María Quispe", averageScore: 82, hash: "0x4f6a...2d8e" },
      { id: "r-010", date: "2024-06-14", subjectName: "Psicología Educativa", teacherName: "Msc. Carlos Mamani", averageScore: 85, hash: "0x8c1d...5a9b" },
    ],
  },
];

// Mock student history (for student detail modal)
export const MOCK_STUDENT_HISTORIES: Record<string, MockStudentHistory[]> = {
  "ds-001": [
    { id: "sh-001", subjectName: "Introducción a las Ciencias de la Educación", subjectCode: "EDU-100", teacherName: "Lic. María Quispe", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-10", score: 85 },
    { id: "sh-002", subjectName: "Psicología Educativa", subjectCode: "EDU-110", teacherName: "Msc. Carlos Mamani", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-11", score: 88 },
    { id: "sh-003", subjectName: "Didáctica General", subjectCode: "EDU-120", teacherName: "Lic. Ana Choque", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-12", score: 90 },
    { id: "sh-004", subjectName: "Sociología de la Educación", subjectCode: "EDU-130", teacherName: "Lic. Juan Flores", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-13", score: 82 },
    { id: "sh-005", subjectName: "Filosofía de la Educación", subjectCode: "EDU-140", teacherName: "Lic. Luis Condori", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-14", score: 78 },
    { id: "sh-006", subjectName: "Comunicación Educativa", subjectCode: "EDU-150", teacherName: "Lic. Mariela Apaza", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-15", score: 84 },
  ],
  "ds-002": [
    { id: "sh-007", subjectName: "Introducción a las Ciencias de la Educación", subjectCode: "EDU-100", teacherName: "Lic. María Quispe", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-08", score: 86 },
    { id: "sh-008", subjectName: "Psicología Educativa", subjectCode: "EDU-110", teacherName: "Msc. Carlos Mamani", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-09", score: 87 },
    { id: "sh-009", subjectName: "Didáctica General", subjectCode: "EDU-120", teacherName: "Lic. Ana Choque", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-10", score: 89 },
    { id: "sh-010", subjectName: "Sociología de la Educación", subjectCode: "EDU-130", teacherName: "Lic. Juan Flores", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-11", score: 81 },
    { id: "sh-011", subjectName: "Filosofía de la Educación", subjectCode: "EDU-140", teacherName: "Lic. Luis Condori", semester: 1, hasEvaluated: true, evaluationDate: "2025-01-12", score: 79 },
    { id: "sh-012", subjectName: "Comunicación Educativa", subjectCode: "EDU-150", teacherName: "Lic. Mariela Apaza", semester: 1, hasEvaluated: false },
  ],
};

// Mock teacher evaluation detail (for teacher evaluation modal)
export interface MockTeacherEvaluationDetail {
  teacherId: string;
  teacherName: string;
  academicDegree: string;
  overallAverage: number;
  evaluationsBySubject: {
    subjectName: string;
    subjectCode: string;
    averageScore: number;
    evaluatedCount: number;
    totalStudents: number;
    criteria: {
      preparation: number;
      domain: number;
      compliance: number;
      punctuality: number;
      objectivity: number;
    };
  }[];
  feedback: {
    comment: string;
    date: string;
    subjectName: string;
  }[];
}

export const MOCK_TEACHER_EVALUATION_DETAILS: Record<string, MockTeacherEvaluationDetail> = {
  "dt-001": {
    teacherId: "dt-001",
    teacherName: "Lic. María Quispe",
    academicDegree: "Licenciada",
    overallAverage: 86,
    evaluationsBySubject: [
      { subjectName: "Introducción a las Ciencias de la Educación", subjectCode: "EDU-100", averageScore: 86, evaluatedCount: 32, totalStudents: 35, criteria: { preparation: 18, domain: 17, compliance: 9, punctuality: 9, objectivity: 9 } },
      { subjectName: "Metodología de la Investigación", subjectCode: "EDU-200", averageScore: 85, evaluatedCount: 28, totalStudents: 30, criteria: { preparation: 17, domain: 17, compliance: 8, punctuality: 9, objectivity: 9 } },
    ],
    feedback: [
      { comment: "Explica con claridad y paciencia. Las clases son muy dinámicas.", date: "2025-01-10", subjectName: "EDU-100" },
      { comment: "Muy buena metodología de enseñanza.", date: "2025-01-08", subjectName: "EDU-200" },
    ],
  },
  "dt-002": {
    teacherId: "dt-002",
    teacherName: "Msc. Carlos Mamani",
    academicDegree: "Magíster",
    overallAverage: 88,
    evaluationsBySubject: [
      { subjectName: "Psicología Educativa", subjectCode: "EDU-110", averageScore: 88, evaluatedCount: 38, totalStudents: 40, criteria: { preparation: 18, domain: 18, compliance: 9, punctuality: 9, objectivity: 9 } },
      { subjectName: "Psicología del Desarrollo", subjectCode: "EDU-210", averageScore: 87, evaluatedCount: 30, totalStudents: 32, criteria: { preparation: 18, domain: 17, compliance: 9, punctuality: 9, objectivity: 9 } },
    ],
    feedback: [
      { comment: "Excelente dominio del tema, muy profesional.", date: "2025-01-12", subjectName: "EDU-110" },
      { comment: "Las clases son interesantes y bien estructuradas.", date: "2025-01-11", subjectName: "EDU-210" },
    ],
  },
  "dt-003": {
    teacherId: "dt-003",
    teacherName: "Lic. Ana Choque",
    academicDegree: "Licenciada",
    overallAverage: 91,
    evaluationsBySubject: [
      { subjectName: "Didáctica General", subjectCode: "EDU-120", averageScore: 91, evaluatedCount: 28, totalStudents: 30, criteria: { preparation: 19, domain: 18, compliance: 9, punctuality: 10, objectivity: 10 } },
      { subjectName: "Planificación Educativa", subjectCode: "EDU-220", averageScore: 90, evaluatedCount: 25, totalStudents: 28, criteria: { preparation: 18, domain: 18, compliance: 9, punctuality: 10, objectivity: 9 } },
    ],
    feedback: [
      { comment: "La mejor docente de la carrera. Muy dedicada.", date: "2025-01-14", subjectName: "EDU-120" },
      { comment: "Siempre puntual y preparada.", date: "2025-01-13", subjectName: "EDU-220" },
    ],
  },
  "dt-004": {
    teacherId: "dt-004",
    teacherName: "Lic. Juan Flores",
    academicDegree: "Licenciado",
    overallAverage: 82,
    evaluationsBySubject: [
      { subjectName: "Sociología de la Educación", subjectCode: "EDU-130", averageScore: 82, evaluatedCount: 25, totalStudents: 28, criteria: { preparation: 17, domain: 16, compliance: 8, punctuality: 8, objectivity: 8 } },
    ],
    feedback: [
      { comment: "Buen docente, podría mejorar en puntualidad.", date: "2025-01-09", subjectName: "EDU-130" },
    ],
  },
  "dt-005": {
    teacherId: "dt-005",
    teacherName: "Lic. Luis Condori",
    academicDegree: "Licenciado",
    overallAverage: 78,
    evaluationsBySubject: [
      { subjectName: "Filosofía de la Educación", subjectCode: "EDU-140", averageScore: 78, evaluatedCount: 22, totalStudents: 25, criteria: { preparation: 16, domain: 15, compliance: 8, punctuality: 8, objectivity: 7 } },
    ],
    feedback: [
      { comment: "Conoce el tema pero las clases son algo monótonas.", date: "2025-01-07", subjectName: "EDU-140" },
      { comment: "Debería usar más material audiovisual.", date: "2025-01-05", subjectName: "EDU-140" },
    ],
  },
  "dt-006": {
    teacherId: "dt-006",
    teacherName: "Lic. Mariela Apaza",
    academicDegree: "Licenciada",
    overallAverage: 84,
    evaluationsBySubject: [
      { subjectName: "Comunicación Educativa", subjectCode: "EDU-150", averageScore: 84, evaluatedCount: 30, totalStudents: 32, criteria: { preparation: 17, domain: 17, compliance: 8, punctuality: 9, objectivity: 8 } },
    ],
    feedback: [
      { comment: "Muy buena comunicadora, clases amenas.", date: "2025-01-06", subjectName: "EDU-150" },
    ],
  },
};

// Mock director stats
export const MOCK_DIRECTOR_STATS = {
  totalStudents: 1250,
  totalTeachers: 45,
  totalEvaluations: 1080,
  overallAverage: 84,
};

// Mock evaluation comments for detail modal
export const MOCK_EVALUATION_COMMENTS: Record<string, string[]> = {
  "de-001": [
    "Explica con claridad y paciencia.",
    "Las clases son muy dinámicas y participativas.",
    "Buen material de apoyo.",
  ],
  "de-002": [
    "Excelente dominio del tema.",
    "Muy profesional y puntual.",
    "Las evaluaciones son justas.",
  ],
  "de-003": [
    "La mejor docente de la carrera.",
    "Siempre preparada y puntual.",
    "Muy dedicada a sus estudiantes.",
  ],
  "de-004": [
    "Buen docente pero podría mejorar en puntualidad.",
    "Conoce el tema pero las clases son algo extensas.",
  ],
  "de-005": [
    "Conoce el tema pero las clases son monótonas.",
    "Debería usar más material audiovisual.",
    "Falta de dinamismo en las clases.",
  ],
  "de-006": [
    "Muy buena comunicadora.",
    "Clases amenas e interesantes.",
    "Buena relación con los estudiantes.",
  ],
};
