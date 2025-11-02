"""
Main Application Entry Point
Configures FastAPI app with all routes, middleware, and startup events
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import uvicorn

from app.api import analytics
from app.core.config import settings
from app.core.database import check_database_connection
from app.core.cache import cache

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Nola Analytics API...")
    
    # Check database connection
    if check_database_connection():
        logger.info("✅ Database connected")
    else:
        logger.error("❌ Database connection failed")
    
    # Check cache connection
    if cache.client:
        logger.info("✅ Redis cache connected")
    else:
        logger.warning("⚠️ Redis cache disabled - running without cache")
    
    logger.info(f"📊 Nola Analytics API v{settings.VERSION} ready!")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down Nola Analytics API...")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Analytics platform for restaurant data visualization",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_STR}/analytics",
    tags=["analytics"]
)

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/analytics/health"
    }

# Run with uvicorn when executed directly
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )