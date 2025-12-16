import { apiRequest } from "@/lib/api";
import { CreatePayableFormData } from "@/lib/validations";

export interface PayableResponse {
  id: string;
  value: number;
  emissionDate: string;
  assignorId: string;  
  assignor?: {         
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export const payableService = {
  async create(data: CreatePayableFormData): Promise<PayableResponse> {
    try {
      const response = await apiRequest<PayableResponse>(
        "/integrations/payable",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao cadastrar pagável. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  async getById(id: string): Promise<PayableResponse> {
    try {
      const response = await apiRequest<PayableResponse>(
        `/integrations/payable/${id}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao buscar pagável. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  async getAll(): Promise<PayableResponse[]> {
    try {
      const response = await apiRequest<PayableResponse[]>(
        "/integrations/payable",
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
          (error as ApiError).message || "Erro ao listar pagáveis. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  async update(id: string, data: Partial<CreatePayableFormData>): Promise<PayableResponse> {
    try {
      const response = await apiRequest<PayableResponse>(
        `/integrations/payable/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao atualizar pagável. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiRequest<{ message: string }>(
        `/integrations/payable/${id}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      const apiError: ApiError = {
        message:
          (error as ApiError).message || "Erro ao excluir pagável. Tente novamente.",
        statusCode: (error as ApiError).statusCode,
      };
      throw apiError;
    }
  },
};

