"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await authService.register(data);
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-login">Login</Label>
        <Input
          id="register-login"
          type="text"
          placeholder="Digite seu login"
          {...register("login")}
          className={errors.login ? "border-red-500" : ""}
        />
        {errors.login && (
          <p className="text-sm text-red-500">{errors.login.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="Digite sua senha (mínimo 6 caracteres)"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
}
