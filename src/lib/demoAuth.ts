// Demo authentication utilities using sessionStorage
// Data persists only until browser is closed

const DEMO_USERS_KEY = "demo_registered_users";
const DEMO_SESSION_KEY = "demo_current_session";

export type DemoRole = "student" | "teacher" | "admin" | "director";

export interface DemoUser {
  email: string;
  password: string;
  role: DemoRole;
  profile: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate: string | null;
    documents: {
      front: string | null;
      back: string | null;
      selfie: string | null;
    };
  };
  createdAt: string;
}

// Predefined demo users for testing all roles
const PREDEFINED_DEMO_USERS: DemoUser[] = [
  {
    email: "estudiante@upea.edu.bo",
    password: "estudiante123",
    role: "student",
    profile: {
      phoneNumber: "+591 70000001",
      firstName: "Estudiante",
      lastName: "Demo",
      documentType: "CI",
      documentNumber: "12345678",
      birthDate: "2000-01-15",
      documents: { front: null, back: null, selfie: null },
    },
    createdAt: new Date().toISOString(),
  },
  {
    email: "docente@upea.edu.bo",
    password: "docente123",
    role: "teacher",
    profile: {
      phoneNumber: "+591 70000002",
      firstName: "Docente",
      lastName: "Demo",
      documentType: "CI",
      documentNumber: "23456789",
      birthDate: "1985-06-20",
      documents: { front: null, back: null, selfie: null },
    },
    createdAt: new Date().toISOString(),
  },
  {
    email: "admin@upea.edu.bo",
    password: "admin123",
    role: "admin",
    profile: {
      phoneNumber: "+591 70000003",
      firstName: "Administrador",
      lastName: "Demo",
      documentType: "CI",
      documentNumber: "34567890",
      birthDate: "1980-03-10",
      documents: { front: null, back: null, selfie: null },
    },
    createdAt: new Date().toISOString(),
  },
  {
    email: "director@upea.edu.bo",
    password: "director123",
    role: "director",
    profile: {
      phoneNumber: "+591 70000004",
      firstName: "Director",
      lastName: "Demo",
      documentType: "CI",
      documentNumber: "45678901",
      birthDate: "1975-11-25",
      documents: { front: null, back: null, selfie: null },
    },
    createdAt: new Date().toISOString(),
  },
];

// Find predefined demo user by credentials
const findPredefinedDemoUser = (email: string, password: string): DemoUser | undefined => {
  return PREDEFINED_DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
};

export interface DemoSession {
  user: DemoUser;
  loggedInAt: string;
}

export const getDemoUsers = (): DemoUser[] => {
  try {
    const data = sessionStorage.getItem(DEMO_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveDemoUser = (user: DemoUser): void => {
  const users = getDemoUsers();
  // Check if user already exists and update, otherwise add
  const existingIndex = users.findIndex((u) => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  sessionStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

export const findDemoUser = (email: string): DemoUser | undefined => {
  const users = getDemoUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

export const validateDemoCredentials = (
  email: string,
  password: string
): { valid: boolean; user?: DemoUser } => {
  // First check predefined demo users (for testing all roles)
  const predefinedUser = findPredefinedDemoUser(email, password);
  if (predefinedUser) {
    return { valid: true, user: predefinedUser };
  }
  
  // Then check registered demo users (from 9-step registration)
  const registeredUser = findDemoUser(email);
  if (registeredUser && registeredUser.password === password) {
    return { valid: true, user: registeredUser };
  }
  
  return { valid: false };
};

// Get redirect path based on demo user role
export const getDemoRedirectPath = (role: DemoRole): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "director":
      return "/director";
    case "teacher":
      return "/docente";
    case "student":
    default:
      return "/panel";
  }
};

export const clearDemoUsers = (): void => {
  sessionStorage.removeItem(DEMO_USERS_KEY);
};

// Session management for demo users
export const setDemoSession = (user: DemoUser): void => {
  const session: DemoSession = {
    user,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
};

export const getDemoSession = (): DemoSession | null => {
  try {
    const data = sessionStorage.getItem(DEMO_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearDemoSession = (): void => {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
};

export const isDemoSessionActive = (): boolean => {
  return getDemoSession() !== null;
};
