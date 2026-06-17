from typing import Dict, List, Any

def parse_unified_diff(diff_text: str) -> List[Dict[str, Any]]:
    """Parse unified diff string into structured representation of files changed."""
    if not diff_text:
        return []
    
    files = []
    current_file = None
    
    for line in diff_text.splitlines():
        if line.startswith("diff --git "):
            if current_file:
                files.append(current_file)
            current_file = {
                "file_path": line.split(" b/")[-1] if " b/" in line else "",
                "additions": 0,
                "deletions": 0,
                "content": []
            }
        elif current_file is not None:
            current_file["content"].append(line)
            if line.startswith("+") and not line.startswith("+++"):
                current_file["additions"] += 1
            elif line.startswith("-") and not line.startswith("---"):
                current_file["deletions"] += 1
                
    if current_file:
        files.append(current_file)
        
    return files
