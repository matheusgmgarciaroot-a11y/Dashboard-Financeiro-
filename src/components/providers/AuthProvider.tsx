"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth, user, isLoading } = useAuthStore();
  const { fetchInitialData } = useFinanceStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initializeAuth();
    return () => {
      cleanup();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/auth") {
        router.push("/auth");
      } else if (user && pathname === "/auth") {
        router.push("/");
      }

      if (user) {
        fetchInitialData();
      }
    }
  }, [user, isLoading, pathname, router, fetchInitialData]);

  // Enquanto carrega a sessão ou redireciona, mostra nada ou um loader
  if (isLoading || (!user && pathname !== "/auth")) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
