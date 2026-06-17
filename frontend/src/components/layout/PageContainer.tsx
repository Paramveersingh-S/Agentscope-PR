"use client";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export function PageContainer({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();
  
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 overflow-hidden font-sans">
      <div className={cn("hidden lg:block transition-all duration-300", sidebarOpen ? "w-64" : "w-0 overflow-hidden")}>
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50/30 dark:bg-zinc-900/10">
          {children}
        </main>
      </div>
    </div>
  );
}
