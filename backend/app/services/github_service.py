from github import Github, GithubIntegration
from app.config import settings

class GitHubService:
    def __init__(self, installation_id: int = None):
        if installation_id and settings.GITHUB_APP_PRIVATE_KEY:
            # Authenticate as GitHub App Installation
            integration = GithubIntegration(
                settings.GITHUB_APP_ID,
                settings.GITHUB_APP_PRIVATE_KEY
            )
            access_token = integration.get_access_token(installation_id).token
            self.gh = Github(access_token)
        else:
            # Fallback or dummy
            self.gh = Github()

    def get_pr_diff(self, repo_full_name: str, pr_number: int) -> str:
        """Fetches the raw diff of a pull request."""
        repo = self.gh.get_repo(repo_full_name)
        pr = repo.get_pull(pr_number)
        
        # PyGithub doesn't expose raw diff easily as a single string property, 
        # but we can construct a pseudo-diff from the files if direct API call is skipped.
        diff = ""
        for file in pr.get_files():
            diff += f"--- a/{file.filename}\n+++ b/{file.filename}\n"
            if file.patch:
                diff += f"{file.patch}\n"
        return diff

    def post_pr_comment(self, repo_full_name: str, pr_number: int, body: str) -> None:
        """Posts a markdown comment on the PR."""
        repo = self.gh.get_repo(repo_full_name)
        pr = repo.get_pull(pr_number)
        pr.create_issue_comment(body)
