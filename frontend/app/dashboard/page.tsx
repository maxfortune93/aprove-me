"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Loader2, LayoutDashboard, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { assignorService } from "@/services/assignor.service";

export default function DashboardPage() {
  const [assignorsCount, setAssignorsCount] = useState<number | null>(null);
  const [isLoadingAssignors, setIsLoadingAssignors] = useState(true);

  useEffect(() => {
    const fetchAssignorsCount = async () => {
      try {
        const assignors = await assignorService.getAll();
        setAssignorsCount(assignors.length);
      } catch (error) {
        console.error("Erro ao carregar contagem de cedentes:", error);
        setAssignorsCount(0);
      } finally {
        setIsLoadingAssignors(false);
      }
    };

    fetchAssignorsCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            Dashboard
          </h2>
          <p className="text-gray-600 text-lg">
            Bem-vindo ao sistema de gerenciamento de recebíveis e cedentes
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Recebíveis
              </CardTitle>
              <CardDescription>
                Gerencie seus recebíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-2" variant="outline" asChild>
                <Link href="/payables">Ver Lista de Recebíveis</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Cedentes
              </CardTitle>
              <CardDescription>
                Gerencie seus cedentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAssignors ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{assignorsCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Total de cedentes</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href="/payables/new">Cadastrar Recebível</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/assignors/new">Cadastrar Cedente</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Área de Conteúdo</CardTitle>
              <CardDescription>
                Esta área será preenchida com funcionalidades futuras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve você poderá visualizar e gerenciar seus recebíveis e cedentes aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

