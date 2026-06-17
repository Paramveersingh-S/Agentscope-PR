import time
import json
from locust import HttpUser, task, between

class GithubWebhookUser(HttpUser):
    """
    Simulates GitHub sending PR webhook events to the Sentinel API.
    To run: locust -f backend/tests/locustfile.py --host=http://localhost:8001
    """
    wait_time = between(0.5, 2)
    
    @task
    def simulate_pr_event(self):
        # Generate a unique PR number to avoid simple deduplication caching
        pr_number = int(time.time() * 1000) % 100000
        
        payload = {
            "action": "opened",
            "pull_request": {
                "number": pr_number,
                "title": f"Load Test PR {pr_number}"
            },
            "repository": {
                "full_name": "test/load-test-repo"
            },
            "installation": {
                "id": 123456
            }
        }
        
        payload_bytes = json.dumps(payload).encode("utf-8")
        
        headers = {
            "X-GitHub-Event": "pull_request",
            "Content-Type": "application/json"
        }
        
        self.client.post("/api/v1/webhooks/github", data=payload_bytes, headers=headers, name="Github Webhook (PR)")
