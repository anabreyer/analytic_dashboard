"""
Configuration module for Nola Analytics
This module loads all environment variables and provides centralized configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Database
    DATABASE_URL: str = "postgresql://challenge:challenge_2024@localhost:5432/challenge_db"
    
    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Nola Analytics"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Cache TTL Settings (in seconds)
    CACHE_TTL_OVERVIEW: int = 60
    CACHE_TTL_TIMELINE: int = 300
    CACHE_TTL_PRODUCTS: int = 600
    CACHE_TTL_INSIGHTS: int = 1800
    
    # Performance Settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()

# Helper function to check if in production
def is_production() -> bool:
    return not settings.DEBUG