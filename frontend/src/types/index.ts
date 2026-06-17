export interface Repository {
  id: string;
  github_repo_id: number;
  full_name: string;
  display_name?: string;
  description?: string;
  default_branch: string;
  is_active: boolean;
  review_config: Record<string, any>;
}

export interface PRReview {
  id: string;
  repository_id: string;
  pr_number: number;
  pr_title?: string;
  pr_body?: string;
  pr_author?: string;
  pr_url?: string;
  base_branch?: string;
  head_branch?: string;
  head_sha?: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  overall_score?: number;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation?: string;
  block_merge: boolean;
  diff_stats?: { files_changed: number; additions: number; deletions: number };
  started_at?: string;
  completed_at?: string;
  agent_runs: AgentRun[];
  findings: Finding[];
}

export interface AgentRun {
  id: string;
  review_id: string;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  model_used?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  latency_ms?: number;
}

export interface Finding {
  id: string;
  review_id: string;
  agent_name: string;
  finding_id_label?: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description?: string;
  recommendation?: string;
  file_path?: string;
  line_start?: number;
  line_end?: number;
  code_snippet?: string;
}

export interface AnalyticsSummary {
  total_reviews: number;
  average_score: number;
  critical_findings_count: number;
  total_tokens_used: number;
  findings_by_category: Record<string, number>;
}
