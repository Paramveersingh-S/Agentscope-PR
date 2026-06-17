import Link from 'next/link'
import { ShieldCheck, LayoutDashboard, GitPullRequest, Settings, PieChart } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border/50 glass h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <ShieldCheck className="text-primary w-8 h-8 mr-3" />
        <span className="font-bold text-xl tracking-tight text-white">PR Sentinel</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link href="/" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-white transition-colors group">
          <LayoutDashboard className="w-5 h-5 mr-3 group-hover:text-primary transition-colors" />
          Dashboard
        </Link>
        <Link href="/reviews" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-white transition-colors group">
          <GitPullRequest className="w-5 h-5 mr-3 group-hover:text-secondary transition-colors" />
          Reviews
        </Link>
        <Link href="/analytics" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-white transition-colors group">
          <PieChart className="w-5 h-5 mr-3 group-hover:text-primary transition-colors" />
          Analytics
        </Link>
        <Link href="/repositories" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-white transition-colors group">
          <Settings className="w-5 h-5 mr-3 group-hover:text-secondary transition-colors" />
          Repositories
        </Link>
      </nav>
      
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
            <span className="text-xs font-bold text-white">AS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Agent Swarm</span>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
