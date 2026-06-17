from github import Github, GithubIntegration
from app.config import settings
import tiktoken
import logging

logger = logging.getLogger(__name__)

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

    def get_pr_diff(self, repo_full_name: str, pr_number: int) -> list[str]:
        """Fetches the raw diff of a pull request and chunks it by file."""
        repo = self.gh.get_repo(repo_full_name)
        pr = repo.get_pull(pr_number)
        
        try:
            enc = tiktoken.get_encoding("cl100k_base")
        except Exception:
            # Fallback if tiktoken fails
            enc = None
            
        chunks = []
        current_chunk = ""
        current_tokens = 0
        
        for file in pr.get_files():
            file_diff = f"--- a/{file.filename}\n+++ b/{file.filename}\n"
            if file.patch:
                file_diff += f"{file.patch}\n"
                
            file_tokens = len(enc.encode(file_diff)) if enc else len(file_diff) // 4
            
            if current_tokens + file_tokens > 8000:
                if current_chunk:
                    chunks.append(current_chunk)
                    logger.warning(f"Diff chunking triggered for PR {repo_full_name}#{pr_number}. Exceeded 8000 tokens.")
                
                if file_tokens > 8000:
                    logger.warning(f"File {file.filename} is huge ({file_tokens} tokens). Model context might truncate.")
                    chunks.append(file_diff)
                    current_chunk = ""
                    current_tokens = 0
                else:
                    current_chunk = file_diff
                    current_tokens = file_tokens
            else:
                current_chunk += file_diff
                current_tokens += file_tokens
                
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks

    def post_pr_comment(self, repo_full_name: str, pr_number: int, body: str) -> None:
        """Posts a markdown comment on the PR."""
        repo = self.gh.get_repo(repo_full_name)
        pr = repo.get_pull(pr_number)
        pr.create_issue_comment(body)
