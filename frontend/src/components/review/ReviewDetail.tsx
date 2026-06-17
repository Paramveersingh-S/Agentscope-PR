"use client";
import { PRReview } from "@/types";
import { ScoreGauge } from "./ScoreGauge";
import { AgentStatusBar } from "./AgentStatusBar";
import { FindingsPanel } from "./FindingsPanel";
import { DiffViewer } from "./DiffViewer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReviewStream } from "@/hooks/useReviewStream";
import { ExternalLink, GitMerge, FileText } from "lucide-react";

export function ReviewDetail({ initialReview }: { initialReview: PRReview }) {
  const review = useReviewStream(initialReview.id, initialReview) || initialReview;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white dark:bg-zinc-950 p-6 rounded-xl border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">#{review.pr_number} {review.pr_title}</h1>
            <Badge variant={review.status === "completed" ? "default" : "secondary"} className="uppercase">
              {review.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><GitMerge className="h-4 w-4" /> {review.base_branch} ← {review.head_branch}</span>
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> by @{review.pr_author}</span>
            {review.pr_url && (
              <a href={review.pr_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                <ExternalLink className="h-4 w-4" /> View on GitHub
              </a>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <ScoreGauge score={review.overall_score || 0} />
        </div>
      </div>

      <AgentStatusBar agentRuns={review.agent_runs || []} />

      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="findings">Findings ({review.findings?.length || 0})</TabsTrigger>
          <TabsTrigger value="diff">Code Diff</TabsTrigger>
          <TabsTrigger value="recommendation">Final Recommendation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="findings">
          <FindingsPanel findings={review.findings || []} />
        </TabsContent>
        
        <TabsContent value="diff">
          <div className="h-[800px] overflow-y-auto">
             <DiffViewer 
               oldCode="def calculate_total(items):\n    total = 0\n    for i in items:\n        total += i.price\n    return total" 
               newCode="def calculate_total(items):\n    return sum(item.price for item in items)" 
             />
          </div>
        </TabsContent>

        <TabsContent value="recommendation">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border whitespace-pre-wrap">
            {review.recommendation || "Waiting for aggregator agent to generate recommendation..."}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
