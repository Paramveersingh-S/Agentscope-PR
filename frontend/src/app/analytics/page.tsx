"use client"

import { useQuery } from '@tanstack/react-query'
import { getAnalyticsSummary, getAnalyticsTrends } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ShieldCheck, AlertTriangle, Activity, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: summary } = useQuery({ queryKey: ['analytics-summary'], queryFn: getAnalyticsSummary })
  const { data: trends } = useQuery({ queryKey: ['analytics-trends'], queryFn: getAnalyticsTrends })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your repository's security posture and code quality metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Reviews</h3>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.total_reviews ?? '-'}</div>
        </div>
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.avg_score ?? '-'}/10</div>
        </div>
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Critical Blocked</h3>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold text-destructive">{summary?.critical_blocked ?? '-'}</div>
        </div>
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Clean PRs</h3>
            <ShieldCheck className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-white">{(summary?.total_reviews && summary?.critical_blocked !== undefined) ? summary.total_reviews - summary.critical_blocked : '-'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="glass rounded-xl border border-border/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Quality Score Trend (Last 7 Days)</h3>
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

        <div className="glass rounded-xl border border-border/50 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">More Analytics Coming Soon</h3>
          <p className="text-muted-foreground max-w-sm">
            Agent performance metrics, risk distribution charts, and repository leaderboards are currently being processed by the Swarm.
          </p>
        </div>
      </div>
    </div>
  )
}
