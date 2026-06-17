import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from app.config import settings

class EmbeddingService:
    def __init__(self):
        host = "localhost"
        port = 8000
        if settings.CHROMADB_URL:
            # strip http:// and get host/port
            cleaned = settings.CHROMADB_URL.replace("http://", "")
            if ":" in cleaned:
                host, port_str = cleaned.split(":")
                port = int(port_str.split("/")[0])
            else:
                host = cleaned
                
        try:
            self.client = chromadb.HttpClient(host=host, port=port)
            self.collection = self.client.get_or_create_collection(name="findings")
        except Exception as e:
            print(f"Failed to connect to ChromaDB: {e}")
            self.client = None
            
        # DefaultEmbeddingFunction uses all-MiniLM-L6-v2 which generates 384-dimensional embeddings
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        
    def generate_embedding(self, text: str) -> list[float]:
        try:
            return self.ef([text])[0]
        except Exception:
            return [0.0] * 384
            
    def add_finding(self, finding_id: str, text: str, metadata: dict):
        if not self.client:
            return
        try:
            self.collection.add(
                documents=[text],
                metadatas=[metadata],
                ids=[str(finding_id)]
            )
        except Exception as e:
            print(f"Error adding to ChromaDB: {e}")
            
    def find_similar(self, text: str, limit: int = 5, min_similarity: float = 0.0, where: dict = None):
        if not self.client:
            return []
        try:
            kwargs = {
                "query_texts": [text],
                "n_results": limit
            }
            if where:
                kwargs["where"] = where
                
            results = self.collection.query(**kwargs)
            output = []
            if results and results['ids'] and len(results['ids']) > 0:
                for i in range(len(results['ids'][0])):
                    distance = results['distances'][0][i] if 'distances' in results else 0
                    similarity = 1.0 - (distance / 2.0)
                    if similarity >= min_similarity:
                        output.append({
                            "id": results['ids'][0][i],
                            "distance": distance,
                            "similarity": similarity,
                            "metadata": results['metadatas'][0][i] if 'metadatas' in results else {}
                        })
            return output
        except Exception as e:
            print(f"Error querying ChromaDB: {e}")
            return []
