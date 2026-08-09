"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";

interface SupabaseContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  user: null,
  isLoading: true,
});

export const useSupabase = () => useContext(SupabaseContext);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (session) {
          useFinanceStore.getState().fetchInitialData();
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session) {
          useFinanceStore.getState().fetchInitialData();
        }
        
        if (session && pathname === "/auth") {
          router.push("/");
        } else if (!session && pathname !== "/auth") {
          router.push("/auth");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  useEffect(() => {
    // Redirect logic on load
    if (!isLoading && !session && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [isLoading, session, pathname, router]);

  return (
    <SupabaseContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}
