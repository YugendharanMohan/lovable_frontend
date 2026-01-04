import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication - replace with Firebase or your auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("asm_user");
    const storedToken = localStorage.getItem("asm_token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual Firebase auth
    // For demo purposes, accept any credentials
    const mockUser: User = {
      id: "1",
      email: email,
      name: "Admin User",
    };
    const mockToken = "mock_token_" + Date.now();

    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem("asm_user", JSON.stringify(mockUser));
    localStorage.setItem("asm_token", mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("asm_user");
    localStorage.removeItem("asm_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
