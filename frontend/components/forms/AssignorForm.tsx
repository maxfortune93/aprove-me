"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssignorSchema, CreateAssignorFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { assignorService } from "@/services/assignor.service";

export function AssignorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAssignorFormData>({
    resolver: zodResolver(createAssignorSchema),
    defaultValues: {
      document: "",
      email: "",
      phone: "",
      name: "",
    },
  });

  const onSubmit = async (data: CreateAssignorFormData) => {
    setIsSubmitting(true);
    try {
      const response = await assignorService.create(data);
      toast.success("Cedente cadastrado com sucesso!");
      router.push(`/assignors/${response.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cedente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Digite o nome do cedente"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Documento *</Label>
        <Input
          id="document"
          type="text"
          placeholder="Digite o documento (CPF/CNPJ)"
          {...register("document")}
          className={errors.document ? "border-red-500" : ""}
        />
        {errors.document && (
          <p className="text-sm text-red-500">{errors.document.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          type="text"
          placeholder="(00) 00000-0000"
          {...register("phone")}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
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
      </div>
    </form>
  );
}
