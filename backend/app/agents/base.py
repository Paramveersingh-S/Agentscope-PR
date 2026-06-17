import json
from typing import Optional, Dict, Any
from agentscope.agents import AgentBase
from agentscope.message import Msg

class PRReviewAgentBase(AgentBase):
    def __init__(self, name: str, sys_prompt: str, model_config_name: str, use_memory: bool = False):
        super().__init__(name=name, sys_prompt=sys_prompt, model_config_name=model_config_name, use_memory=use_memory)

    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Attempt to extract and parse JSON from the LLM response."""
        try:
            # Often LLMs wrap JSON in markdown blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except Exception as e:
            raise ValueError(f"Failed to parse agent output as JSON: {e}\nRaw output: {content}")
