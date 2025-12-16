import { PayableForm } from "@/components/forms/PayableForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewPayablePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastrar Pagável</CardTitle>
            <CardDescription>
              Preencha os dados do pagável abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayableForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
