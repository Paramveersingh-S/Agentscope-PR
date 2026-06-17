import { Search, Bell } from 'lucide-react'

export function TopNav() {
  return (
    <header className="h-16 border-b border-border/50 glass sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            className="bg-accent/30 border border-border/50 text-white text-sm rounded-full focus:ring-primary focus:border-primary block w-full pl-10 p-2 transition-all placeholder-muted-foreground" 
            placeholder="Search PRs, findings, repos..." 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-accent/50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse-glow"></span>
        </button>
      </div>
    </header>
  )
}
