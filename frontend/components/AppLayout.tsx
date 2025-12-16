"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showNavbar, setShowNavbar] = useState(false);

  
  const publicRoutes = ["/login", "/register", "/"];

  useEffect(() => {
    
    setShowNavbar(isAuthenticated && !publicRoutes.includes(pathname));
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}

