export interface AuthData {
  email: string;
  password?: string;
  accountType?: string;
}

export interface User {
  firstName: string;
  lastName: string;
  role: 'talent' | 'mentor' | 'employer';
  title?: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSetupToken: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setSetupToken: (token: string) => void;
  clearSetupToken: () => void;
}
