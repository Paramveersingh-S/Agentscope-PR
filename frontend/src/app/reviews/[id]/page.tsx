import { ReviewDetail } from "@/components/review/ReviewDetail";
import { PRReview } from "@/types";

const mockInitialReview: PRReview = {
  id: "123",
  repository_id: "repo-xyz",
  pr_number: 402,
  pr_title: "Implement Agentic Code Review Webhooks",
  pr_author: "johndoe",
  pr_url: "https://github.com/org/repo/pull/402",
  base_branch: "main",
  head_branch: "feature/agentic-webhooks",
  status: "running",
  block_merge: false,
  overall_score: 7.2,
  agent_runs: [
    { id: "a1", review_id: "123", agent_name: "security", status: "completed", latency_ms: 4200 },
    { id: "a2", review_id: "123", agent_name: "code_quality", status: "running" },
    { id: "a3", review_id: "123", agent_name: "test_coverage", status: "pending" }
  ],
  findings: [
    {
      id: "f1", review_id: "123", agent_name: "security", category: "Security",
      severity: "HIGH", title: "Hardcoded API Key", description: "Found a hardcoded API key in the webhook handler.",
      file_path: "backend/app/api/webhooks.py", line_start: 45, recommendation: "Use environment variables instead."
    }
  ]
};

export default function ReviewPage({ params }: { params: { id: string } }) {
  return <ReviewDetail initialReview={{...mockInitialReview, id: params.id}} />;
}
