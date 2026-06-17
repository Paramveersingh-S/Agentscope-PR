import { Finding } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { AgentAvatar } from "@/components/shared/AgentAvatar";
import { AlertCircle, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Card className="overflow-hidden border-l-4" style={{
      borderLeftColor: 
        finding.severity === "CRITICAL" ? "#ef4444" : 
        finding.severity === "HIGH" ? "#f97316" : 
        finding.severity === "MEDIUM" ? "#eab308" : "#3b82f6"
    }}>
      <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="text-xs font-mono text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              {finding.finding_id_label || "ISSUE"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AgentAvatar agentName={finding.agent_name} size="sm" />
            <span className="capitalize">{finding.agent_name.replace('_', ' ')}</span>
          </div>
        </div>
        <CardTitle className="text-base mt-2 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          {finding.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {finding.file_path && (
          <div className="flex items-center gap-2 text-sm mb-3 bg-zinc-100 dark:bg-zinc-900 p-2 rounded border font-mono">
            <FileCode2 className="h-4 w-4 text-blue-500" />
            <span>{finding.file_path}</span>
            {finding.line_start && (
              <span className="text-muted-foreground">
                Lines {finding.line_start}-{finding.line_end || finding.line_start}
              </span>
            )}
          </div>
        )}
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 whitespace-pre-wrap">
          {finding.description}
        </p>
        
        {finding.recommendation && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded p-3 text-sm">
            <div className="font-semibold text-green-800 dark:text-green-300 mb-1">Recommendation</div>
            <div className="text-green-700 dark:text-green-400">{finding.recommendation}</div>
          </div>
        )}

        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" size="sm">Reject</Button>
          <Button size="sm">Accept</Button>
        </div>
      </CardContent>
    </Card>
  );
}
