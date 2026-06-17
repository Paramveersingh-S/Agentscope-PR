import asyncio
import json
from fastapi import WebSocket
from typing import Dict, List
from redis.asyncio import Redis
from app.config import settings

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        self.listener_task = None
        
    async def connect(self, websocket: WebSocket, review_id: str):
        await websocket.accept()
        if review_id not in self.active_connections:
            self.active_connections[review_id] = []
            await self.pubsub.subscribe(f"review_{review_id}")
            if not self.listener_task:
                self.listener_task = asyncio.create_task(self._listen_redis())
        self.active_connections[review_id].append(websocket)

    def disconnect(self, websocket: WebSocket, review_id: str):
        if review_id in self.active_connections:
            if websocket in self.active_connections[review_id]:
                self.active_connections[review_id].remove(websocket)
            if not self.active_connections[review_id]:
                del self.active_connections[review_id]
                asyncio.create_task(self.pubsub.unsubscribe(f"review_{review_id}"))

    async def _listen_redis(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                channel = message["channel"]
                data = message["data"]
                if channel.startswith("review_"):
                    review_id = channel.replace("review_", "")
                    if review_id in self.active_connections:
                        for connection in self.active_connections[review_id]:
                            try:
                                await connection.send_text(data)
                            except Exception:
                                pass

    async def broadcast_to_review(self, review_id: str, message: dict):
        text_message = json.dumps(message)
        await self.redis.publish(f"review_{review_id}", text_message)

manager = ConnectionManager()
