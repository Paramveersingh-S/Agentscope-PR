# notification_service.py
# Post review comments to GitHub (wraps GithubService potentially)

from app.services.github_service import GitHubService

class NotificationService:
    def __init__(self, github_service: GitHubService):
        self.github_service = github_service
        
    def notify_pr(self, repo_full_name: str, pr_number: int, comment_body: str):
        self.github_service.post_pr_comment(repo_full_name, pr_number, comment_body)
