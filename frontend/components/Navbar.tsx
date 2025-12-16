"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [userLogin, setUserLogin] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      const token = authService.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserLogin(payload.login || "Usuário");
        } catch (error) {
          console.error("Erro ao decodificar token:", error);
          setUserLogin("Usuário");
        }
      }
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo-bankme.png"
              alt="Aprove-me Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">Aprove-me</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">
              {userLogin}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

