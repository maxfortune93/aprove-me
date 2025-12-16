"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "./AppLayout";
import { Toaster } from "sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>
        {children}
      </AppLayout>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

