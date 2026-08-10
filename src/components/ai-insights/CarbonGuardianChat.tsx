"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/store/useFinanceStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function CarbonGuardianChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lastAmount, setLastAmount] = useState<number | null>(null); // Memória de contexto
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Saudações, Matheus e Heloísa. Sou o Guardião Carbon. Minha missão é proteger o seu patrimônio e garantir que cada centavo esteja trabalhando para o futuro de vocês. Como posso ajudar hoje?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { summary, projections } = useFinanceStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input; // Salva para processamento
    setInput("");
    setIsTyping(true);

    // Lógica Avançada do Guardião Carbon
    setTimeout(() => {
      let response = "";
      const lowerInput = currentInput.toLowerCase();
      
      // Tenta extrair um valor numérico (ex: "104", "104,50", "R$ 104")
      const amountMatch = currentInput.match(/(\d+(?:[.,]\d+)?)/);
      let queriedAmount = amountMatch ? parseFloat(amountMatch[0].replace(",", ".")) : null;

      // Se não enviou valor agora, mas perguntou "cabe no orçamento" ou similar, usa o último valor falado
      if (!queriedAmount && (lowerInput.includes("cabe") || lowerInput.includes("posso") || lowerInput.includes("dá para")) && lastAmount) {
        queriedAmount = lastAmount;
      }

      if (queriedAmount) {
        setLastAmount(queriedAmount); // Salva na memória de contexto
        const sobra = summary.balance;
        const percentOfSobra = (queriedAmount / (sobra > 0 ? sobra : 1)) * 100;

        if (sobra <= 0) {
          response = `Matheus e Heloísa, analisei aqui: a projeção do mês está negativa em ${Math.abs(sobra).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. Gastar mais ${queriedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} agora vai piorar o fechamento. Minha recomendação técnica é: não compre agora.`;
        } else if (queriedAmount > sobra) {
          response = `Cuidado! Esse valor de ${queriedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} é superior à sobra que vocês terão no fim do mês (${sobra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Se gastarem isso, o saldo final será negativo.`;
        } else if (percentOfSobra > 50) {
          response = `Vocês têm ${sobra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de sobra projetada. Gastar ${queriedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} consome mais da metade da sua folga mensal. É possível, mas vai reduzir muito o que sobraria para investir.`;
        } else {
          response = `Análise concluída: Esse gasto de ${queriedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} cabe perfeitamente no orçamento! Representa apenas ${(percentOfSobra).toFixed(1)}% da sua sobra projetada (${sobra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Podem seguir sem medo.`;
        }
      } else if (lowerInput.includes("saldo") || lowerInput.includes("dinheiro") || lowerInput.includes("quanto temos") || lowerInput.includes("caixa")) {
        response = `Matheus e Heloísa, no momento vocês têm ${summary.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} líquidos. Se mantiverem os gastos planejados, terminarão o mês com ${summary.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de sobra real.`;
      } else if (lowerInput.includes("previsão") || lowerInput.includes("futuro") || lowerInput.includes("12 meses") || lowerInput.includes("ano que vem") || lowerInput.includes("projeção")) {
        const finalBalance = projections[projections.length - 1].projectedBalance;
        response = `Projeção Carbon de 12 meses: Se o ritmo atual for mantido, vocês chegarão ao fim do ciclo com ${finalBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} acumulados, já descontando as parcelas que terminam no caminho.`;
      } else if (lowerInput.includes("reserva") || lowerInput.includes("emergência")) {
        response = `A Reserva de Emergência está segura em ${summary.reserveBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. Isso garante o custo de vida de vocês por ${(summary.reserveBalance / (summary.totalExpenses || 1)).toFixed(1)} meses.`;
      } else {
        response = "Entendido. Estou monitorando o fluxo de caixa. Se você mencionar qualquer valor ou perguntar se um gasto 'cabe', eu farei a simulação de impacto no saldo final do mês para vocês.";
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-[90] p-4 rounded-full bg-primary text-carbon-black shadow-[0_0_20px_rgba(223,255,0,0.3)] border-2 border-primary/50",
          isOpen && "hidden"
        )}
      >
        <div className="relative">
          <Bot size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-primary rounded-full animate-pulse" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[100] w-[400px] h-[600px] bg-carbon-black border border-white/10 rounded-sm shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-carbon-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-primary/10 text-primary border border-primary/20">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest">Guardião Carbon</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Online - Protegendo Patrimônio</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-sm text-neutral-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-sm text-xs leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-carbon-black font-medium" 
                      : "bg-white/5 text-neutral-300 border border-white/10"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-neutral-600 mt-1 uppercase font-bold">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-primary rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Guardião está analisando...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/5 bg-carbon-900">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pergunte ao seu Guardião..."
                  className="w-full bg-carbon-black border border-white/5 rounded-sm p-3 pr-12 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary disabled:text-neutral-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[9px] text-neutral-600 mt-2 text-center font-bold uppercase tracking-tighter">
                Sua segurança financeira é nossa prioridade absoluta.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
