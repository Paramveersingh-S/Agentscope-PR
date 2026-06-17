import { AgentRun } from "@/types";
import { AgentAvatar } from "@/components/shared/AgentAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function AgentStatusBar({ agentRuns }: { agentRuns: AgentRun[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-around">
        {agentRuns.map((run) => (
          <div key={run.id} className="flex flex-col items-center gap-2 p-2 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50 min-w-[120px]">
            <AgentAvatar agentName={run.agent_name} size="md" />
            <div className="text-sm font-medium capitalize">{run.agent_name.replace('_', ' ')}</div>
            <div className="flex items-center gap-1">
              {getStatusIcon(run.status)}
              <span className="text-xs text-muted-foreground capitalize">{run.status}</span>
            </div>
            {run.latency_ms && (
              <div className="text-[10px] text-muted-foreground">{(run.latency_ms / 1000).toFixed(1)}s</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
