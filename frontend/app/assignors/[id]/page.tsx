"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { assignorService, AssignorResponse } from "@/services/assignor.service";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AssignorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [assignor, setAssignor] = useState<AssignorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchAssignor = async () => {
      try {
        const data = await assignorService.getById(id);
        setAssignor(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar cedente.");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAssignor();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!assignor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Detalhes do Cedente</CardTitle>
            <CardDescription>
              Informações do cedente cadastrado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                ID
              </Label>
              <p className="text-lg font-mono">{assignor.id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Nome
              </Label>
              <p className="text-lg font-semibold">{assignor.name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Documento
              </Label>
              <p className="text-lg">{assignor.document}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <p className="text-lg">{assignor.email}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Telefone
              </Label>
              <p className="text-lg">{assignor.phone}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Data de Criação
              </Label>
              <p className="text-lg">{formatDate(assignor.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
