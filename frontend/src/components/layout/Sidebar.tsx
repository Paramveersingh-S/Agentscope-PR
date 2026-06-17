"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitPullRequest, Settings, LineChart, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Reviews", href: "/reviews", icon: GitPullRequest },
  { name: "Repositories", href: "/repositories", icon: ShieldAlert },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <ShieldAlert className="text-zinc-900 dark:text-zinc-100" />
          PR Sentinel
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t mt-auto text-xs text-zinc-500 text-center">
        AgentScope PR Sentinel v1.0
      </div>
    </aside>
  );
}
