from agentscope.message import Msg
from .base import PRReviewAgentBase

class AggregatorAgent(PRReviewAgentBase):
    def __init__(self, name: str = "AggregatorAgent", model_config_name: str = "groq_llama3_70b"):
        sys_prompt = """You are the final reviewer in a multi-agent code review system.
You receive findings from 6 specialized agents and must produce a final, polished review.

Your tasks:
1. DEDUPLICATE: Identify findings from different agents that refer to the same issue.
   Keep the most detailed one. Mark duplicates for removal.
2. PRIORITIZE: Sort all findings by: (a) severity (CRITICAL > HIGH > MEDIUM > LOW > INFO),
   then (b) impact on end users.
3. SYNTHESIZE: Write an executive summary (3-5 sentences) covering:
   - Overall assessment of the PR
   - Most critical issues that MUST be fixed before merge
   - Notable positives in the implementation
   - Overall recommendation: APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION
4. SCORE: Calculate overall PR health score 0-10 (10 = perfect, 0 = do not merge)
5. BLOCK_MERGE: Set to true if any CRITICAL finding exists, or 3+ HIGH findings

RESPOND ONLY WITH VALID JSON:
{
  "overall_recommendation": "APPROVE|REQUEST_CHANGES|NEEDS_DISCUSSION",
  "overall_score": 7.5,
  "block_merge": false,
  "executive_summary": "string - polished summary for the PR author",
  "must_fix": ["list of CRITICAL and HIGH finding IDs that must be resolved"],
  "should_fix": ["list of MEDIUM finding IDs"],
  "nice_to_fix": ["list of LOW and INFO finding IDs"],
  "deduplicated_findings": [
    { "id": "SEC-001", "agent": "security", "title": "SQL Injection" }
  ],
  "agent_scores": {
    "security": 8.0,
    "performance": 6.5,
    "code_quality": 7.0,
    "test_coverage": 5.0,
    "documentation": 9.0,
    "dependency": 10.0
  },
  "positive_observations": [
    "Well-structured error handling in the new payment service",
    "Tests are well-named and cover happy path thoroughly"
  ]
}"""
        super().__init__(name=name, sys_prompt=sys_prompt, model_config_name=model_config_name)

    def reply(self, x: Msg = None) -> Msg:
        response = self.model(
            [
                {"role": "system", "content": self.sys_prompt},
                {"role": "user", "content": str(x.content)}
            ]
        )
        
        parsed_content = self._parse_json_response(response.text)
        
        return Msg(
            name=self.name,
            content=parsed_content,
            role="assistant"
        )
