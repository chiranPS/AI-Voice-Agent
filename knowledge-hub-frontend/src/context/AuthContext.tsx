import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import authService from "../services/authService";
import type { AdminUser, AdminLoginRequest } from "../types/auth";

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() =>
    authService.getStoredAdmin()
  );
  const [token, setToken] = useState<string | null>(() =>
    authService.getStoredToken()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    authService.logout();
    setAdmin(null);
    setToken(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = authService.getStoredToken();
    if (!storedToken) {
      setAdmin(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const currentAdmin = await authService.getMe();
      setAdmin(currentAdmin);
      sessionStorage.setItem("admin_user", JSON.stringify(currentAdmin));
    } catch {
      // Token is invalid or expired
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();

    // Handle global 401 unauthorized event from API interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [checkAuth, logout]);

  const login = async (credentials: AdminLoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      authService.storeSession(response.access_token, response.admin);
      setToken(response.access_token);
      setAdmin(response.admin);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated: Boolean(token && admin),
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

