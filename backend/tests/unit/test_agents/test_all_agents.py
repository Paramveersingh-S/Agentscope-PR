import pytest
from unittest.mock import patch, MagicMock
from agentscope.message import Msg

from app.agents.security import SecurityAuditAgent
from app.agents.performance import PerformanceAgent
from app.agents.code_quality import CodeQualityAgent
from app.agents.test_coverage import TestCoverageAgent
from app.agents.documentation import DocumentationAgent
from app.agents.dependency import DependencyRiskAgent
from app.agents.aggregator import AggregatorAgent

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_security_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "security", "summary": "Sec issues found", "findings": [], "risk_score": 1.0, "has_critical": false, "has_hardcoded_secrets": false}'
    
    agent = SecurityAuditAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "security"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_performance_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "performance", "summary": "Perf issues found", "findings": [], "performance_score": 8.0}'
    
    agent = PerformanceAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "performance"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_quality_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "code_quality", "summary": "Code qual", "findings": [], "quality_score": 8.0, "complexity_hotspots": []}'
    
    agent = CodeQualityAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "code_quality"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_coverage_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "test_coverage", "summary": "Coverage", "findings": [], "coverage_estimate": "50%", "test_score": 5.0}'
    
    agent = TestCoverageAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "test_coverage"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_docs_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "documentation", "summary": "Docs", "findings": [], "docs_score": 9.0}'
    
    agent = DocumentationAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "documentation"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_dep_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"agent": "dependency", "summary": "Deps", "findings": [], "dependency_score": 10.0}'
    
    agent = DependencyRiskAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"diff": "test"}))
    assert reply.content["agent"] == "dependency"

@patch('agentscope.models.ModelWrapperBase', autospec=True)
def test_agg_agent(mock_wrapper):
    mock_model = MagicMock()
    mock_model.text = '{"overall_recommendation": "APPROVE", "overall_score": 9.5, "block_merge": false, "executive_summary": "All good", "must_fix": [], "should_fix": [], "nice_to_fix": [], "deduplicated_findings": [], "agent_scores": {}, "positive_observations": []}'
    
    agent = AggregatorAgent(model_config_name="dummy")
    agent.model = mock_model
    reply = agent.reply(Msg(name="u", content={"plan": {}, "specialist_findings": []}))
    assert reply.content["overall_recommendation"] == "APPROVE"
