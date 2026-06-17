from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, review_id: str):
        await websocket.accept()
        if review_id not in self.active_connections:
            self.active_connections[review_id] = []
        self.active_connections[review_id].append(websocket)

    def disconnect(self, websocket: WebSocket, review_id: str):
        if review_id in self.active_connections:
            self.active_connections[review_id].remove(websocket)
            if not self.active_connections[review_id]:
                del self.active_connections[review_id]

    async def broadcast_to_review(self, review_id: str, message: dict):
        if review_id in self.active_connections:
            text_message = json.dumps(message)
            for connection in self.active_connections[review_id]:
                await connection.send_text(text_message)

manager = ConnectionManager()
