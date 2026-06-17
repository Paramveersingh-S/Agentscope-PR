"use client"

import { useLiveReview } from '@/hooks/useLiveReview';
import { AgentStatusBar } from '@/components/review/AgentStatusBar';
import { FindingsPanel } from '@/components/review/FindingsPanel';
import { DiffViewerComponent } from '@/components/review/DiffViewerComponent';
import { GitPullRequest, ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getReviewDetail, getReviewFindings } from '@/lib/api';

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  // Connect to the websocket stream for this review ID
  const { isConnected } = useLiveReview(params.id);
  
  const { data: review, isLoading: reviewLoading } = useQuery({ 
    queryKey: ['review', params.id], 
    queryFn: () => getReviewDetail(params.id) 
  });
  
  const { data: findings } = useQuery({ 
    queryKey: ['review-findings', params.id], 
    queryFn: () => getReviewFindings(params.id) 
  });

  // Hardcoded diff strings for UI demonstration since we don't have the DB connected to frontend yet
  const oldCode = `function authenticateUser(req, res) {
  const token = req.headers.authorization;
  
  if (token) {
    const user = verifyToken(token);
    res.send({ user });
  } else {
    res.status(401).send("Unauthorized");
  }
}`;

  const newCode = `function authenticateUser(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).send({ error: "Missing Bearer token" });
  }
  
  try {
    const user = verifyToken(token);
    res.send({ user });
  } catch (err) {
    res.status(403).send({ error: "Invalid or expired token" });
  }
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/reviews" className="p-2 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {review?.pr_title || `Review #${params.id.substring(0, 8)}`}
              {isConnected && review?.status !== 'completed' ? (
                <span className="flex items-center text-xs font-semibold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1.5"></span>
                  Running
                </span>
              ) : review?.status === 'completed' || review?.status === 'success' ? (
                <span className="flex items-center text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              ) : review?.status === 'error' || review?.status === 'failed' ? (
                <span className="flex items-center text-xs font-semibold px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full">
                  <XCircle className="w-3 h-3 mr-1" />
                  Failed
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-muted-foreground">{review?.repository?.full_name || 'Repository'} &bull; PR #{review?.pr_number}</p>
          </div>
        </div>
      </div>

      {/* Top Section: Live Agent Swarm Status */}
      <AgentStatusBar />

      {/* Main Content: Split View layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Code Diff */}
        <div className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Final Summary</h2>
          {reviewLoading ? (
            <div className="flex justify-center p-12">
              <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <div className="glass p-6 rounded-xl border border-border/50 prose prose-invert max-w-none">
              {review?.final_summary ? (
                <div dangerouslySetInnerHTML={{ __html: review.final_summary.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-muted-foreground italic">No summary available yet. The AI is still working...</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Findings */}
        <div className="xl:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>
            Findings ({findings?.length || 0})
          </h2>
          <div className="space-y-4">
            {findings?.map((finding: any) => (
              <div key={finding.id} className="glass p-4 rounded-xl border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${finding.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive' : finding.severity === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{finding.agent_name}</span>
                </div>
                <p className="text-sm text-white mb-2">{finding.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-3">{finding.description}</p>
              </div>
            ))}
            {findings?.length === 0 && !reviewLoading && (
              <p className="text-muted-foreground text-sm">No findings reported.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
