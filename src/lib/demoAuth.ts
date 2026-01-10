// Demo authentication utilities using sessionStorage
// Data persists only until browser is closed

const DEMO_USERS_KEY = "demo_registered_users";

export interface DemoUser {
  email: string;
  password: string;
  role: "student";
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
  const user = findDemoUser(email);
  if (user && user.password === password) {
    return { valid: true, user };
  }
  return { valid: false };
};

export const clearDemoUsers = (): void => {
  sessionStorage.removeItem(DEMO_USERS_KEY);
};
