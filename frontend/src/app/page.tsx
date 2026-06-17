"use client"

import { ShieldCheck, GitPullRequest, AlertTriangle, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getAnalyticsSummary, getAnalyticsTrends, getReviews } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const { data: summary } = useQuery({ queryKey: ['analytics-summary'], queryFn: getAnalyticsSummary })
  const { data: trends } = useQuery({ queryKey: ['analytics-trends'], queryFn: getAnalyticsTrends })
  const { data: reviewsData } = useQuery({ queryKey: ['reviews-recent'], queryFn: () => getReviews(1) })

  const recentReviews = reviewsData?.data?.slice(0, 5) || [];



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Command Center</h1>
        <p className="text-muted-foreground">Monitor pull request quality and swarm activity across all repositories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute -right-6 -top-6 text-primary/10 group-hover:text-primary/20 transition-colors">
            <GitPullRequest className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total PRs Reviewed</h3>
            <div className="text-4xl font-bold text-white mb-2">{summary?.total_reviews ?? '-'}</div>
            <p className="text-xs text-green-400 flex items-center"><Zap className="w-3 h-3 mr-1" /> Live tracking</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-secondary/50 transition-colors">
          <div className="absolute -right-6 -top-6 text-secondary/10 group-hover:text-secondary/20 transition-colors">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Quality Score</h3>
            <div className="text-4xl font-bold text-white mb-2">{summary?.avg_score ?? '-'}<span className="text-xl text-muted-foreground">/10</span></div>
            <p className="text-xs text-green-400">Trending upwards</p>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-destructive/50 transition-colors">
          <div className="absolute -right-6 -top-6 text-destructive/10 group-hover:text-destructive/20 transition-colors">
            <AlertTriangle className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Critical Vulnerabilities Blocked</h3>
            <div className="text-4xl font-bold text-destructive mb-2">{summary?.critical_blocked ?? '-'}</div>
            <p className="text-xs text-muted-foreground">Across all repositories</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl border border-border/50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">System Status</h3>
            <div className="flex items-center mt-2">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-medium text-white">All Swarms Operational</span>
            </div>
          </div>
          <Link href="/reviews" className="text-xs text-primary hover:text-primary/80 font-medium mt-4 block">
            View Live Reviews &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 glass rounded-xl border border-border/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Code Quality Trend</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8, stroke: '#60a5fa', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Swarm Activity</h3>
          <div className="space-y-4">
            {recentReviews.map((review: any) => (
              <div key={review.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${review.recommendation === 'APPROVE' ? 'bg-green-500/10 text-green-500' : review.recommendation === 'REQUEST_CHANGES' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    <GitPullRequest className="w-4 h-4" />
                  </div>
                  <div>
                    <Link href={`/reviews/${review.id}`} className="text-sm font-medium text-white hover:text-primary transition-colors block max-w-[200px] truncate">
                      {review.pr_title || `PR #${review.pr_number} analyzed`}
                    </Link>
                    <p className="text-xs text-muted-foreground">{review.repository?.full_name || 'Repository'}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {review.created_at ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true }) : ''}
                </span>
              </div>
            ))}
            {recentReviews.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
