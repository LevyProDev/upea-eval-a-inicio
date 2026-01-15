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
