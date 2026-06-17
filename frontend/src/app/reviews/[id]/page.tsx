"use client"

import { useLiveReview } from '@/hooks/useLiveReview';
import { AgentStatusBar } from '@/components/review/AgentStatusBar';
import { FindingsPanel } from '@/components/review/FindingsPanel';
import { DiffViewerComponent } from '@/components/review/DiffViewerComponent';
import { GitPullRequest, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  // Connect to the websocket stream for this review ID
  const { isConnected } = useLiveReview(params.id);

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
              Review #{params.id}
              {isConnected ? (
                <span className="flex items-center text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                  Live Stream
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-1 bg-muted text-muted-foreground border border-border/50 rounded-full">
                  Disconnected
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">frontend-repo &bull; PR #42 &bull; Refactor user authentication flow</p>
          </div>
        </div>
      </div>

      {/* Top Section: Live Agent Swarm Status */}
      <AgentStatusBar />

      {/* Main Content: Split View layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Code Diff */}
        <div className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Code Diff Context</h2>
          <DiffViewerComponent oldCode={oldCode} newCode={newCode} />
        </div>

        {/* Right Column: AI Findings Stream */}
        <div className="xl:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>
            Swarm Findings
          </h2>
          <FindingsPanel />
        </div>
      </div>
    </div>
  )
}
