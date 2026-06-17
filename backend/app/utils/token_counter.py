import tiktoken

def estimate_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """Estimate number of tokens for a given string."""
    if not text:
        return 0
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback encoding
        encoding = tiktoken.get_encoding("cl100k_base")
        
    return len(encoding.encode(text))
