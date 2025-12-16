"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { payableService, PayableResponse } from "@/services/payable.service";
import { Loader2, ArrowLeft, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export default function PayableDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [payable, setPayable] = useState<PayableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    const fetchPayable = async () => {
      try {
        const data = await payableService.getById(id);
        setPayable(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar pagável.");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPayable();
    }
  }, [id, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await payableService.delete(id);
      toast.success("Pagável excluído com sucesso!");
      router.push("/payables");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir pagável.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!payable) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/payables/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Detalhes do Pagável</CardTitle>
            <CardDescription>
              Informações do pagável cadastrado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                ID
              </Label>
              <p className="text-lg font-mono">{payable.id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Valor
              </Label>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(payable.value)}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Data de Emissão
              </Label>
              <p className="text-lg">{formatDate(payable.emissionDate)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  Cedente (ID)
                </Label>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/assignors/${payable.assignorId}`}>
                    <User className="mr-2 h-4 w-4" />
                    Ver Dados do Cedente
                  </Link>
                </Button>
              </div>
              <p className="text-lg font-mono">{payable.assignorId}</p>
              {payable.assignor && (
                <p className="text-sm text-muted-foreground">{payable.assignor.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir pagável"
        message="Tem certeza que deseja excluir este pagável"
      />
    </div>
  );
}

