"use client"

import { useState } from 'react'
import Link from 'next/link'
import { GitPullRequest, Search, ShieldCheck, AlertCircle, Clock } from 'lucide-react'

// Mock data for UI demonstration
const MOCK_REVIEWS = [
  { id: "1001", repo: "frontend-repo", pr: 42, title: "Refactor user authentication flow", status: "completed", score: 8.5, time: "2 hours ago", issues: 0 },
  { id: "1002", repo: "backend-api", pr: 128, title: "Add Redis caching to webhooks", status: "completed", score: 5.2, time: "4 hours ago", issues: 2 },
  { id: "1003", repo: "infrastructure", pr: 15, title: "Update kubernetes manifests", status: "running", score: null, time: "Just now", issues: 0 },
  { id: "1004", repo: "mobile-app", pr: 88, title: "Fix iOS memory leak in lists", status: "completed", score: 9.8, time: "1 day ago", issues: 0 },
  { id: "1005", repo: "backend-api", pr: 129, title: "Bump dependency versions", status: "failed", score: null, time: "1 day ago", issues: 0 },
]

export default function ReviewsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pull Request Reviews</h1>
          <p className="text-muted-foreground">History and live status of all agent swarm analyses.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by repo, PR, or title..." 
            className="w-full glass bg-accent/20 border border-border/50 text-white rounded-lg pl-10 p-2.5 focus:ring-primary focus:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Repository & PR</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Quality Score</th>
                <th scope="col" className="px-6 py-4 font-semibold">Issues Blocked</th>
                <th scope="col" className="px-6 py-4 font-semibold">Time</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REVIEWS.map((review) => (
                <tr key={review.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center mr-3">
                        <GitPullRequest className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{review.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{review.repo} #{review.pr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {review.status === 'completed' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Completed</span>}
                    {review.status === 'running' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">Running</span>}
                    {review.status === 'failed' && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/20">Failed</span>}
                  </td>
                  <td className="px-6 py-4">
                    {review.score !== null ? (
                      <div className="flex items-center">
                        <span className={`font-bold ${review.score >= 8 ? 'text-green-400' : review.score >= 6 ? 'text-yellow-400' : 'text-destructive'}`}>
                          {review.score}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">/10</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {review.issues > 0 ? (
                      <div className="flex items-center text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        <span className="font-bold">{review.issues}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        <span>Clean</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {review.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/reviews/${review.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
