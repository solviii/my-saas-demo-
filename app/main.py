import logging
from app.core.database import db
from contextlib import asynccontextmanager
from app.api.routes import chat as chats_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from app.core.logging import setup_logging

# Setup logging at application startup
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        logger.info("Starting up application...")
        await db.connect()
        logger.info("Database connected successfully")
        yield
    finally:
        # Shutdown
        logger.info("Shutting down application...")
        await db.disconnect()
        logger.info("Database disconnected successfully")


app = FastAPI(
    title="{**} API",
    version="1.0.0",
    docs_url="/api/v1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_db():
    if not await db.verify_connection():
        try:
            await db.connect()
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise HTTPException(status_code=503, detail="Database connection error")
    return db.prisma


app.include_router(
    chats_router.router,
    prefix="/api/v1/bots",
    tags=["chat"],
    dependencies=[Depends(verify_db)],
)
