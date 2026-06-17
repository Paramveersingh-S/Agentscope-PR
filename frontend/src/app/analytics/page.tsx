"use client"

import { useQuery } from '@tanstack/react-query'
import { getAnalyticsSummary, getAnalyticsTrends, getAgentPerformance } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { ShieldCheck, AlertTriangle, Activity, Target, Cpu } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: summary } = useQuery({ queryKey: ['analytics-summary'], queryFn: getAnalyticsSummary })
  const { data: trends } = useQuery({ queryKey: ['analytics-trends'], queryFn: getAnalyticsTrends })
  const { data: agentPerformance } = useQuery({ queryKey: ['agent-performance'], queryFn: getAgentPerformance })

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

        <div className="glass rounded-xl border border-border/50 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Agent Token Usage</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="agent_name" type="category" stroke="#64748b" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Legend />
                <Bar dataKey="total_tokens" name="Total Tokens" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-xl border border-border/50 p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-primary" />
          Swarm Worker Telemetry
        </h3>
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Agent Specialization</th>
              <th scope="col" className="px-6 py-4 font-semibold">Tasks Run</th>
              <th scope="col" className="px-6 py-4 font-semibold">Total Tokens</th>
              <th scope="col" className="px-6 py-4 font-semibold">Avg Latency (ms)</th>
            </tr>
          </thead>
          <tbody>
            {(agentPerformance || []).map((agent: any, i: number) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white capitalize">{agent.agent_name}</td>
                <td className="px-6 py-4">{agent.runs}</td>
                <td className="px-6 py-4 text-purple-400 font-medium">{agent.total_tokens.toLocaleString()}</td>
                <td className="px-6 py-4">{agent.avg_latency.toLocaleString()} ms</td>
              </tr>
            ))}
            {(!agentPerformance || agentPerformance.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">No telemetry data available yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
