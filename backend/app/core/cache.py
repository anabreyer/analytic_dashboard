"""
Redis cache management module
Handles caching strategies for different types of queries
"""

import redis
import json
from typing import Optional, Any, Callable
from datetime import datetime, date
from decimal import Decimal
from .config import settings
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """
    Redis cache wrapper with JSON serialization
    """
    
    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.client = redis.Redis.from_url(
                settings.REDIS_URL, 
                decode_responses=True,
                socket_connect_timeout=5
            )
            self.client.ping()
            logger.info("✅ Redis connection successful")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Cache disabled.")
            self.client = None
    
    def _serialize(self, obj: Any) -> str:
        """
        Custom JSON serializer for complex types
        """
        def default(o):
            if isinstance(o, (datetime, date)):
                return o.isoformat()
            elif isinstance(o, Decimal):
                return float(o)
            return str(o)
        
        return json.dumps(obj, default=default)
    
    def _deserialize(self, data: str) -> Any:
        """
        Deserialize JSON string back to Python object
        """
        return json.loads(data)
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        """
        if not self.client:
            return None
        
        try:
            data = self.client.get(key)
            if data:
                logger.debug(f"Cache HIT: {key}")
                return self._deserialize(data)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache GET error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Set value in cache with TTL
        """
        if not self.client:
            return False
        
        try:
            serialized = self._serialize(value)
            self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache SET error: {e}")
            return False
    
    def delete(self, pattern: str) -> int:
        """
        Delete keys matching pattern
        """
        if not self.client:
            return 0
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache DELETE error: {e}")
            return 0
    
    def flush(self) -> bool:
        """
        Clear all cache
        """
        if not self.client:
            return False
        
        try:
            self.client.flushdb()
            logger.info("Cache flushed")
            return True
        except Exception as e:
            logger.error(f"Cache FLUSH error: {e}")
            return False

# Global cache instance
cache = RedisCache()

def cache_key_builder(prefix: str, **params) -> str:
    """
    Build consistent cache keys from parameters
    """
    # Sort params for consistent keys
    sorted_params = sorted(params.items())
    params_str = "_".join(f"{k}={v}" for k, v in sorted_params if v is not None)
    return f"nola:{prefix}:{params_str}" if params_str else f"nola:{prefix}"

def cached_result(prefix: str, ttl: int = 300):
    """
    Decorator for caching function results
    
    Usage:
    @cached_result("overview", ttl=60)
    def get_overview(store_id: int = None):
        return expensive_computation()
    """
    def decorator(func: Callable):
        def wrapper(**kwargs):
            # Build cache key from function args
            key = cache_key_builder(prefix, **kwargs)
            
            # Try to get from cache
            cached = cache.get(key)
            if cached is not None:
                return cached
            
            # Compute and cache result
            result = func(**kwargs)
            cache.set(key, result, ttl)
            return result
        
        return wrapper
    return decorator