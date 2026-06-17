from app.utils.language_detector import detect_language
from app.utils.diff_parser import parse_unified_diff

def test_detect_language():
    assert detect_language("test.py") == "Python"
    assert detect_language("test.js") == "JavaScript"

def test_parse_diff():
    diff = "diff --git a/test.py b/test.py\n+import os\n-import sys"
    files = parse_unified_diff(diff)
    assert len(files) == 1
    assert files[0]["additions"] == 1
    assert files[0]["deletions"] == 1
