export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in duration-500">
      <div className="glass p-12 rounded-2xl border border-border/50 text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed metrics and charts are currently being compiled by the Swarm. Check back later!
        </p>
      </div>
    </div>
  )
}
