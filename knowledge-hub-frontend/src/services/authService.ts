import api from "./api";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
} from "../types/auth";

export const authService = {
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await api.post<AdminLoginResponse>(
      "/admin/auth/login",
      credentials
    );
    return response.data;
  },

  async getMe(): Promise<AdminUser> {
    const response = await api.get<AdminUser>("/admin/auth/me");
    return response.data;
  },

  logout(): void {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("admin_user");
  },

  getStoredToken(): string | null {
    return sessionStorage.getItem("access_token");
  },

  getStoredAdmin(): AdminUser | null {
    const stored = sessionStorage.getItem("admin_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AdminUser;
    } catch {
      return null;
    }
  },

  storeSession(token: string, admin: AdminUser): void {
    sessionStorage.setItem("access_token", token);
    sessionStorage.setItem("admin_user", JSON.stringify(admin));
  },
};

export default authService;

