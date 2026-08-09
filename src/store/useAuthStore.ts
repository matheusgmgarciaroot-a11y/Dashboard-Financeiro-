import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: (user, session) => set({ user, session }),
  setLoading: (loading) => set({ isLoading: loading }),

  initializeAuth: () => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user || null, isLoading: false });
    });

    // Escuta mudanças de auth (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        set({ session, user: session?.user || null, isLoading: false });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
}));
