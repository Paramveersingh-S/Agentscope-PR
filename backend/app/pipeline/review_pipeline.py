import asyncio
from typing import Dict, Any
from agentscope.message import Msg

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

    async def run(self, pr_data: Dict[str, Any]) -> Dict[str, Any]:
        input_msg = Msg(name="user", content=pr_data, role="user")
        
        # 1. Orchestration
        plan_msg = self.orchestrator.reply(input_msg)
        plan = plan_msg.content
        
        agents_to_run = plan.get("agents_to_run", [])
        agent_briefs = plan.get("agent_briefs", {})
        
        # 2. Parallel Dispatch
        tasks = []
        loop = asyncio.get_event_loop()
        for agent_name in agents_to_run:
            if agent_name in self.specialists:
                agent = self.specialists[agent_name]
                brief = agent_briefs.get(agent_name, "Review the diff.")
                
                agent_input = Msg(
                    name="orchestrator", 
                    content={"diff": pr_data.get("diff"), "brief": brief, "pr_title": pr_data.get("pr_title")},
                    role="user"
                )
                
                # AgentScope agents are synchronous. Run in executor.
                tasks.append(loop.run_in_executor(None, agent.reply, agent_input))
                
        # Wait for all specialists
        findings_msgs = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions if an agent failed
        valid_findings = []
        for msg in findings_msgs:
            if isinstance(msg, Msg):
                valid_findings.append(msg.content)
            else:
                # msg is an Exception
                print(f"Agent failed: {msg}")
                
        # 3. Aggregation
        aggregator_input = Msg(
            name="orchestrator",
            content={"plan": plan, "specialist_findings": valid_findings},
            role="user"
        )
        
        final_review_msg = self.aggregator.reply(aggregator_input)
        
        return {
            "orchestration_plan": plan,
            "findings": valid_findings,
            "final_review": final_review_msg.content
        }
