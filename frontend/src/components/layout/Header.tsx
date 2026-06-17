"use client";
import { Bell, Github, Menu, Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function Header() {
  const { setSidebarOpen, sidebarOpen } = useAppStore();

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-zinc-950 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search PRs or Repos..." 
            className="h-9 w-64 rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
          <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950" />
        </button>
        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border">
          <Github className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      </div>
    </header>
  );
}
