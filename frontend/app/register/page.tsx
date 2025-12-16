import { RegisterForm } from "@/components/forms/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
