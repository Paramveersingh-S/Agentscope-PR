import hmac
import hashlib

def verify_github_signature(secret: str, signature_header: str, payload: bytes) -> bool:
    """Verify HMAC-SHA256 signature from GitHub webhook."""
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    
    signature = signature_header[7:]
    mac = hmac.new(secret.encode(), msg=payload, digestmod=hashlib.sha256)
    expected_signature = mac.hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)
