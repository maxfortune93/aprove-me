import { z } from "zod";

// Schema de validação para login
export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Login é obrigatório")
    .max(140, "Login deve ter no máximo 140 caracteres"),
  password: z
    .string()
    .min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema de validação para cadastro
export const registerSchema = z.object({
  login: z
    .string()
    .min(1, "Login é obrigatório")
    .max(140, "Login deve ter no máximo 140 caracteres"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema de validação para Payable
export const payableSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
  value: z
    .number()
    .positive("Valor deve ser um número positivo")
    .finite("Valor deve ser um número válido"),
  emissionDate: z.string().min(1, "Data de emissão é obrigatória"),
  assignor: z.string().uuid("Assignor deve ser um UUID válido"),
});

export type PayableFormData = z.infer<typeof payableSchema>;

// Schema de validação para criação de Payable (sem ID)
export const createPayableSchema = z.object({
  value: z
    .number()
    .positive("Valor deve ser um número positivo")
    .finite("Valor deve ser um número válido"),
  emissionDate: z
    .string()
    .min(1, "Data de emissão é obrigatória")
    .refine(
      (date) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;
        const d = new Date(date);
        return d instanceof Date && !isNaN(d.getTime());
      },
      { message: "Data de emissão deve estar no formato YYYY-MM-DD" }
    ),
  assignor: z
    .string()
    .min(1, "Cedente é obrigatório")
    .uuid("Cedente deve ser um UUID válido"),
});

export type CreatePayableFormData = z.infer<typeof createPayableSchema>;

// Schema de validação para Assignor
export const assignorSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
  document: z
    .string()
    .min(1, "Documento é obrigatório")
    .max(30, "Documento deve ter no máximo 30 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .max(140, "Email deve ter no máximo 140 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .max(20, "Telefone deve ter no máximo 20 caracteres"),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(140, "Nome deve ter no máximo 140 caracteres"),
});

export type AssignorFormData = z.infer<typeof assignorSchema>;

// Schema de validação para criação de Assignor (sem ID)
export const createAssignorSchema = z.object({
  document: z
    .string()
    .min(1, "Documento é obrigatório")
    .max(30, "Documento deve ter no máximo 30 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(140, "Email deve ter no máximo 140 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .max(20, "Telefone deve ter no máximo 20 caracteres"),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(140, "Nome deve ter no máximo 140 caracteres"),
});

export type CreateAssignorFormData = z.infer<typeof createAssignorSchema>;
