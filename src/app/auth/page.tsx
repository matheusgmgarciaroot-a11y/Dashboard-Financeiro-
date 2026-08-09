"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Conta criada! Verifique seu email para confirmar ou tente fazer login.");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 bg-carbon-800 rounded-xl border border-carbon-700 shadow-2xl flex flex-col items-center">
      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)</h1>
      <p className="text-carbon-300 mb-8 text-center">Faça login ou crie sua conta para acessar o Carbon Finance</p>

      <form className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-carbon-300">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-carbon-900 border border-carbon-700 rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-carbon-300">Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-carbon-900 border border-carbon-700 rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-primary/20 border border-primary/50 rounded-lg text-primary text-sm">
            {message}
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <button 
            type="submit" 
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1 bg-primary text-carbon-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
          
          <button 
            type="button" 
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-carbon-700 text-white font-bold py-3 rounded-lg hover:bg-carbon-600 transition-colors border border-carbon-600 disabled:opacity-50"
          >
            Criar Conta
          </button>
        </div>
      </form>
    </div>
  );
}
