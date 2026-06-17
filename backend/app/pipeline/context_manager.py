# context_manager.py
# Manages diff chunking + token budgets

class ContextManager:
    def __init__(self, max_tokens: int = 50000):
        self.max_tokens = max_tokens
        
    def chunk_diff(self, diff_text: str) -> list[str]:
        # Simple placeholder for chunking diffs if they exceed token limits
        # In a real implementation, this would use tiktoken to count and split by file
        return [diff_text]
