"""
Database connection and session management
Handles PostgreSQL connections with proper pooling and session lifecycle
"""

from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from .config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()
metadata = MetaData()

def get_db() -> Session:
    """
    Dependency to get database session
    Ensures proper cleanup after request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_database_connection():
    """
    Test database connection on startup
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False
    finally:
        db.close()