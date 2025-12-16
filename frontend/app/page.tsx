import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="rounded-full bg-blue-100 p-6 mb-4">
          <Image
            src="/logo-bankme.png"
            alt="Aprove-me Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          Aprove-me
        </h1>
        <p className="max-w-md text-xl text-gray-600">
          Sistema de gerenciamento de recebíveis e cedentes
        </p>
        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-6 text-lg"
          >
            <Link href="/login" className="flex items-center justify-center">
              Fazer Login
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
