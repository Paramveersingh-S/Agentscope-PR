import pytest

@pytest.fixture
def sample_payload():
    return {"action": "opened", "number": 1, "repository": {"id": 123, "name": "repo", "full_name": "org/repo"}}
