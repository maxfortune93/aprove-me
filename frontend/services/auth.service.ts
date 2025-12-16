import { apiRequest } from "@/lib/api";
import { LoginFormData } from "@/lib/validations";

export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: string;
  login: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

export const authService = {
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await apiRequest<LoginResponse>(
        "/integrations/auth",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );

      
      if (typeof window !== "undefined" && response.access_token) {
        localStorage.setItem("auth_token", response.access_token);
      }

      return response;
    } catch (error) {
      const authError: AuthError = {
        message:
          (error as AuthError).message || "Erro ao fazer login. Tente novamente.",
        statusCode: (error as AuthError).statusCode,
      };
      throw authError;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  async register(credentials: { login: string; password: string }): Promise<RegisterResponse> {
    try {
      const response = await apiRequest<RegisterResponse>(
        "/integrations/users",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );
      return response;
    } catch (error) {
      const authError: AuthError = {
        message:
          (error as AuthError).message || "Erro ao cadastrar usuário. Tente novamente.",
        statusCode: (error as AuthError).statusCode,
      };
      throw authError;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000; 
      return Date.now() < exp;
    } catch {
      return false;
    }
  },
};
