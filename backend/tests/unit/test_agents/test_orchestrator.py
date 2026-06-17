import pytest
from app.agents.orchestrator import OrchestratorAgent
from agentscope.message import Msg
from unittest.mock import patch, MagicMock

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_orchestrator_reply(mock_model_wrapper):
    # Mock the LLM response
    mock_model_instance = MagicMock()
    mock_model_instance.text = '''
    {
      "pr_summary": "Added a new authentication endpoint.",
      "languages": ["python"],
      "change_categories": {
        "authentication": true,
        "database": true,
        "api_endpoints": true,
        "configuration": false,
        "dependencies": false,
        "ui": false,
        "infrastructure": false,
        "data_processing": false
      },
      "agents_to_run": ["security", "code_quality", "test_coverage"],
      "agent_briefs": {
        "security": "Check for auth flaws.",
        "code_quality": "Review code smells.",
        "test_coverage": "Ensure tests exist for new endpoints."
      },
      "priority_files": ["auth.py"],
      "estimated_risk": "high",
      "orchestrator_confidence": 0.9
    }
    '''
    
    # We patch AgentScope initialization by mocking its model factory 
    # but for testing the agent we can directly inject the mocked model.
    agent = OrchestratorAgent(model_config_name="dummy_config")
    agent.model = mock_model_instance
    
    input_msg = Msg(name="user", content={"diff": "+ def login(): pass", "pr_title": "Add auth"})
    reply_msg = agent.reply(input_msg)
    
    assert isinstance(reply_msg, Msg)
    assert reply_msg.content["pr_summary"] == "Added a new authentication endpoint."
    assert "security" in reply_msg.content["agents_to_run"]
