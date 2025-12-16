import { apiRequest } from "@/lib/api";
import { CreateAssignorFormData } from "@/lib/validations";

export interface AssignorResponse {
  id: string;
  document: string;
  email: string;
  phone: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export const assignorService = {
  async create(data: CreateAssignorFormData): Promise<AssignorResponse> {
    try {
      const response = await apiRequest<AssignorResponse>(
        "/integrations/assignor",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao cadastrar cedente. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  async getById(id: string): Promise<AssignorResponse> {
    try {
      const response = await apiRequest<AssignorResponse>(
        `/integrations/assignor/${id}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao buscar cedente. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  
  
  async getAll(): Promise<AssignorResponse[]> {
    try {
      const response = await apiRequest<AssignorResponse[]>(
        "/integrations/assignor",
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      
      if ((error as ApiError).statusCode === 404) {
        return [];
      }
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao listar cedentes. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },
};
