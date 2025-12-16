import { AssignorForm } from "@/components/forms/AssignorForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewAssignorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastrar Cedente</CardTitle>
            <CardDescription>
              Preencha os dados do cedente abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignorForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
