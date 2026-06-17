import asyncio
import tiktoken
from typing import Dict, Any
from agentscope.message import Msg
from app.config import settings

from app.agents.orchestrator import OrchestratorAgent
from app.agents.security import SecurityAuditAgent
from app.agents.performance import PerformanceAgent
from app.agents.code_quality import CodeQualityAgent
from app.agents.test_coverage import TestCoverageAgent
from app.agents.documentation import DocumentationAgent
from app.agents.dependency import DependencyRiskAgent
from app.agents.aggregator import AggregatorAgent

class PRReviewPipeline:
    def __init__(self):
        # We initialize with a dummy config during tests if real keys are absent
        # In a real run, Agentscope init has already provided the models.
        self.orchestrator = OrchestratorAgent()
        self.aggregator = AggregatorAgent()
        
        self.specialists = {
            "security": SecurityAuditAgent(),
            "performance": PerformanceAgent(),
            "code_quality": CodeQualityAgent(),
            "test_coverage": TestCoverageAgent(),
            "documentation": DocumentationAgent(),
            "dependency": DependencyRiskAgent()
        }

    async def run(self, pr_data: Dict[str, Any], policy: Dict[str, Any] = None) -> Dict[str, Any]:
        if policy is None:
            policy = {"agents_enabled": ["security", "performance", "code_quality", "test_coverage", "documentation", "dependency"]}
            
        pr_data_orch = dict(pr_data)
        pr_data_orch["diff"] = pr_data["diff_chunks"][0] if pr_data.get("diff_chunks") else ""
        input_msg = Msg(name="user", content=pr_data_orch, role="user")
        
        # 1. Orchestration
        plan_msg = self.orchestrator.reply(input_msg)
        plan = plan_msg.content
        
        agents_to_run = plan.get("agents_to_run", [])
        enabled_agents = policy.get("agents_enabled", [])
        agents_to_run = [a for a in agents_to_run if a in enabled_agents]
        agent_briefs = plan.get("agent_briefs", {})
        
        # 2. Parallel Dispatch
        all_valid_findings = []
        loop = asyncio.get_event_loop()
        
        total_tokens_used = 0
        budget = settings.DEFAULT_TOKEN_BUDGET
        budget_exceeded = False
        
        try:
            enc = tiktoken.get_encoding("cl100k_base")
        except Exception:
            enc = None
        
        for chunk in pr_data.get("diff_chunks", []):
            if budget_exceeded:
                break
                
            tasks = []
            for agent_name in agents_to_run:
                if agent_name in self.specialists:
                    agent = self.specialists[agent_name]
                    brief = agent_briefs.get(agent_name, "Review the diff.")
                    
                    agent_input = Msg(
                        name="orchestrator", 
                        content={"diff": chunk, "brief": brief, "pr_title": pr_data.get("pr_title")},
                        role="user"
                    )
                    
                    # Estimate tokens
                    input_text = str(agent_input.content)
                    input_tokens = len(enc.encode(input_text)) if enc else len(input_text) // 4
                    
                    total_tokens_used += input_tokens
                    if total_tokens_used > budget:
                        print(f"Token budget ({budget}) exceeded! Skipping remaining agents.")
                        budget_exceeded = True
                        break
                    
                    # AgentScope agents are synchronous. Run in executor.
                    tasks.append(loop.run_in_executor(None, agent.reply, agent_input))
                    
            # Wait for all specialists for this chunk
            findings_msgs = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions if an agent failed
            for msg in findings_msgs:
                if isinstance(msg, Msg):
                    all_valid_findings.append(msg.content)
                else:
                    # msg is an Exception
                    print(f"Agent failed on chunk: {msg}")
                    
        # 3. Aggregation
        aggregator_input = Msg(
            name="orchestrator",
            content={"plan": plan, "specialist_findings": all_valid_findings},
            role="user"
        )
        
        final_review_msg = self.aggregator.reply(aggregator_input)
        final_content = final_review_msg.content
        
        # Enforce review policy block_merge
        severity_thresholds = policy.get("severity_thresholds", {"block_on": ["CRITICAL"]})
        block_on = severity_thresholds.get("block_on", ["CRITICAL"])
        
        should_block = False
        dedup_findings = final_content.get("deduplicated_findings", [])
        for f in dedup_findings:
            if f.get("severity") in block_on:
                should_block = True
                break
                
        final_content["block_merge"] = should_block
        
        return {
            "orchestration_plan": plan,
            "findings": all_valid_findings,
            "final_review": final_content
        }
