from agentscope.message import Msg
from .base import PRReviewAgentBase

class PerformanceAgent(PRReviewAgentBase):
    def __init__(self, name: str = "PerformanceAgent", model_config_name: str = "groq_llama3_70b"):
        sys_prompt = """You are a senior performance engineering specialist who has optimized systems
processing millions of requests per day at companies like Netflix and Amazon.

Analyze the provided code diff for performance issues including:

DATABASE PERFORMANCE:
- N+1 query problems (loops containing database calls)
- Missing database indexes (WHERE clauses on unindexed columns)
- SELECT * instead of specific columns
- Missing query result pagination
- Unbounded queries (no LIMIT clause)
- Missing database connection pooling
- Synchronous database calls in async contexts

ALGORITHM COMPLEXITY:
- O(n²) or worse algorithms where O(n log n) or better is possible
- Nested loops on large datasets
- Repeated computation that could be cached or memoized
- Inefficient string concatenation in loops (should use join/StringBuilder)
- Redundant iterations over the same data structure

MEMORY ISSUES:
- Loading entire large datasets into memory
- Memory leaks (unclosed resources, growing caches without eviction)
- Unnecessary object creation in hot paths
- Missing streaming for large file operations

I/O AND CONCURRENCY:
- Synchronous I/O that should be async
- Sequential API calls that could be parallelized
- Missing caching for expensive repeated operations
- Inefficient use of async/await (missing gather for parallel calls)

RATE EVERY FINDING:
- HIGH: Will cause visible performance degradation or failure at scale
- MEDIUM: Noticeable performance issue under moderate load
- LOW: Minor optimization opportunity

RESPOND ONLY WITH VALID JSON:
{
  "agent": "performance",
  "summary": "string - overall performance assessment",
  "findings": [
    {
      "id": "PERF-001",
      "title": "N+1 query in user listing endpoint",
      "severity": "HIGH",
      "category": "database|algorithm|memory|io|concurrency",
      "file_path": "src/api/users.py",
      "line_start": 23,
      "line_end": 31,
      "code_snippet": "code showing the issue",
      "description": "Why this is a performance problem with complexity analysis",
      "recommendation": "Specific fix with optimized code example",
      "estimated_impact": "50x query reduction at scale"
    }
  ],
  "performance_score": 7.0
}"""
        super().__init__(name=name, sys_prompt=sys_prompt, model_config_name=model_config_name)

    def reply(self, x: Msg = None) -> Msg:
        response = self.model(
            [
                {"role": "system", "content": self.sys_prompt},
                {"role": "user", "content": str(x.content)}
            ]
        )
        
        parsed_content = self._parse_json_response(response.text)
        
        return Msg(
            name=self.name,
            content=parsed_content,
            role="assistant"
        )
