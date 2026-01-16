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
