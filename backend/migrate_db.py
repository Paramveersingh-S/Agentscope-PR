import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.base import Base

# Import all models so Base metadata registers them
import app.models.repository
import app.models.pr_review
import app.models.finding
import app.models.review_policy

async def run_migration():
    DATABASE_URL = "postgresql+asyncpg://postgres.lcluwlhsoixtsjzjgjym:Torabora%4012@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Creating missing tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(run_migration())
