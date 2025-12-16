"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { payableService, PayableResponse } from "@/services/payable.service";
import { Loader2, Plus, Eye, Edit, Trash2, FileText, Calendar, DollarSign, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export default function PayablesListPage() {
  const router = useRouter();
  const [payables, setPayables] = useState<PayableResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payableToDelete, setPayableToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayables = async () => {
      try {
        const data = await payableService.getAll();
        setPayables(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar pagáveis.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayables();
  }, []);

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

  const truncateId = (id: string) => {
    return `${id.substring(0, 8)}...`;
  };

  const handleDelete = async (id: string) => {
    setPayableToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!payableToDelete) return;

    try {
      await payableService.delete(payableToDelete);
      toast.success("Pagável excluído com sucesso!");
      setPayables(payables.filter((p) => p.id !== payableToDelete));
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir pagável.");
    } finally {
      setPayableToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando pagáveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Pagáveis
            </h1>
            <p className="text-gray-600 text-lg">
              Listagem de todos os recebíveis cadastrados
            </p>
          </div>
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 px-6"
          >
            <Link href="/payables/new" className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagável
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {payables.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Pagáveis</p>
                    <p className="text-3xl font-bold mt-1">{payables.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(payables.reduce((sum, p) => sum + p.value, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(payables.reduce((sum, p) => sum + p.value, 0) / payables.length)}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {payables.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Nenhum pagável cadastrado</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Comece cadastrando seu primeiro recebível para gerenciar seus pagáveis de forma organizada.
                </p>
                <div className="flex justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                  >
                    <Link href="/payables/new" className="flex items-center justify-center">
                      <Plus className="mr-2 h-5 w-5" />
                      Cadastrar Primeiro Pagável
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Payables List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payables.map((payable) => (
              <Card 
                key={payable.id} 
                className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-primary"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {formatCurrency(payable.value)}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        ID: {truncateId(payable.id)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/payables/${payable.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/payables/${payable.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(payable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Emissão:</span>
                      <span className="font-medium">{formatDate(payable.emissionDate)}</span>
                    </div>
                    {payable.assignor && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Cedente:</span>
                        <span className="font-medium truncate">{payable.assignor.name}</span>
                      </div>
                    )}
                    {payable.createdAt && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Cadastrado em {formatDate(payable.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPayableToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir pagável"
        message="Tem certeza que deseja excluir este pagável"
      />
    </div>
  );
}

