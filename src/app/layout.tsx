"use client";

import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TransactionModal } from "@/components/forms/TransactionModal";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { Header } from "@/components/layout/Header";
import { CarbonGuardianChat } from "@/components/ai-insights/CarbonGuardianChat";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <html lang="pt-BR" className={`${outfit.variable} ${inter.variable} dark`} style={{ colorScheme: "dark" }}>
      <body className="bg-background text-foreground font-sans selection:bg-primary selection:text-carbon-black antialiased overflow-x-hidden">
        <SupabaseProvider>
          {isAuthPage ? (
            <main className="min-h-screen flex items-center justify-center">
              {children}
            </main>
          ) : (
            <div className="min-h-screen flex">
              <Sidebar />
              <main 
                className={cn(
                  "flex-1 transition-all duration-300 ease-in-out min-h-screen flex flex-col",
                  isExpanded ? "pl-[240px]" : "pl-20"
                )}
              >
                <Header />
                <div className="flex-1">
                  {children}
                </div>
              </main>
            </div>
          )}
          {!isAuthPage && <TransactionModal />}
          {!isAuthPage && <CarbonGuardianChat />}
        </SupabaseProvider>
      </body>
    </html>
  );
}
