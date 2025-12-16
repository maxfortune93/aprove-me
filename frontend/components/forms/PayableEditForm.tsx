"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPayableSchema, CreatePayableFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { payableService, PayableResponse } from "@/services/payable.service";
import { assignorService, AssignorResponse } from "@/services/assignor.service";
import Link from "next/link";

interface PayableEditFormProps {
  payable: PayableResponse;
}

export function PayableEditForm({ payable }: PayableEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignors, setAssignors] = useState<AssignorResponse[]>([]);
  const [isLoadingAssignors, setIsLoadingAssignors] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatePayableFormData>({
    resolver: zodResolver(createPayableSchema),
    defaultValues: {
      value: payable.value,
      emissionDate: payable.emissionDate.split("T")[0], 
      assignor: payable.assignorId,
    },
  });

  
  useEffect(() => {
    if (payable.assignor && assignors.length > 0) {
      setValue("assignor", payable.assignorId);
    }
  }, [assignors, payable.assignor, setValue]);

  useEffect(() => {
    const fetchAssignors = async () => {
      try {
        const data = await assignorService.getAll();
        setAssignors(data);
      } catch (error: any) {
        console.warn("Não foi possível carregar a lista de cedentes:", error.message);
      } finally {
        setIsLoadingAssignors(false);
      }
    };

    fetchAssignors();
  }, []);

  const onSubmit = async (data: CreatePayableFormData) => {
    setIsSubmitting(true);
    try {
      await payableService.update(payable.id, data);
      toast.success("Pagável atualizado com sucesso!");
      router.push(`/payables/${payable.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar pagável. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="value">Valor *</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register("value", {
            valueAsNumber: true,
          })}
          className={errors.value ? "border-red-500" : ""}
        />
        {errors.value && (
          <p className="text-sm text-red-500">{errors.value.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emissionDate">Data de Emissão *</Label>
        <Input
          id="emissionDate"
          type="date"
          {...register("emissionDate")}
          className={errors.emissionDate ? "border-red-500" : ""}
        />
        {errors.emissionDate && (
          <p className="text-sm text-red-500">{errors.emissionDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assignor">Cedente *</Label>
          <Link
            href="/assignors/new"
            className="text-xs text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push("/assignors/new");
            }}
          >
            Cadastrar novo cedente
          </Link>
        </div>
        {isLoadingAssignors ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando cedentes...
          </div>
        ) : assignors.length > 0 ? (
          <Select
            id="assignor"
            {...register("assignor")}
            className={errors.assignor ? "border-red-500" : ""}
          >
            <option value="">Selecione um cedente</option>
            {assignors.map((assignor) => (
              <option key={assignor.id} value={assignor.id}>
                {assignor.name} - {assignor.document}
              </option>
            ))}
          </Select>
        ) : (
          <>
            <Input
              id="assignor"
              type="text"
              placeholder="Digite o UUID do cedente"
              {...register("assignor")}
              className={errors.assignor ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Nenhum cedente encontrado. Digite o UUID manualmente ou{" "}
              <Link
                href="/assignors/new"
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/assignors/new");
                }}
              >
                cadastre um novo cedente
              </Link>
              .
            </p>
          </>
        )}
        {errors.assignor && (
          <p className="text-sm text-red-500">{errors.assignor.message}</p>
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
              Atualizando...
            </>
          ) : (
            "Atualizar"
          )}
        </Button>
      </div>
    </form>
  );
}
