"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayableEditForm } from "@/components/forms/PayableEditForm";
import { payableService, PayableResponse } from "@/services/payable.service";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditPayablePage() {
  const params = useParams();
  const router = useRouter();
  const [payable, setPayable] = useState<PayableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchPayable = async () => {
      try {
        const data = await payableService.getById(id);
        setPayable(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar pagável.");
        router.push("/payables");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPayable();
    }
  }, [id, router]);

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
            <CardTitle className="text-2xl">Editar Pagável</CardTitle>
            <CardDescription>
              Atualize os dados do pagável abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayableEditForm payable={payable} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
