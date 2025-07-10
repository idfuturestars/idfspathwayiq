"""
Advanced Redis Caching System for PathwayIQ
Phase 2.1: Foundational Infrastructure

Chief Technical Architect Implementation
"""

import json
import pickle
import asyncio
import hashlib
import logging
from typing import Any, Optional, Union, Dict, List
from datetime import datetime, timedelta
import redis
import aioredis
from functools import wraps
import structlog

# Configure structured logging
logger = structlog.get_logger()

class AdvancedCacheManager:
    """Advanced Redis caching with clustering, compression, and analytics"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis_client = None
        self.async_redis = None
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0
        }
        
    async def initialize(self):
        """Initialize Redis connections"""
        try:
            # Synchronous Redis client
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                health_check_interval=30
            )
            
            # Asynchronous Redis client
            self.async_redis = await aioredis.from_url(
                self.redis_url,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                health_check_interval=30
            )
            
            # Test connections
            await self.health_check()
            logger.info("✅ Advanced Redis Cache Manager initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Redis: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check Redis health"""
        try:
            # Test sync client
            self.redis_client.ping()
            
            # Test async client
            await self.async_redis.ping()
            
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    def _generate_key(self, prefix: str, identifier: str, **kwargs) -> str:
        """Generate cache key with namespace and parameters"""
        key_parts = [f"pathwayiq:{prefix}:{identifier}"]
        
        if kwargs:
            params_str = json.dumps(kwargs, sort_keys=True)
            param_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
            key_parts.append(param_hash)
            
        return ":".join(key_parts)
    
    async def get(self, key: str, use_async: bool = True) -> Optional[Any]:
        """Get value from cache with fallback"""
        try:
            if use_async and self.async_redis:
                value = await self.async_redis.get(key)
            else:
                value = self.redis_client.get(key)
                
            if value is not None:
                self.stats['hits'] += 1
                # Try JSON first, then pickle
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    return pickle.loads(value.encode('latin1'))
            else:
                self.stats['misses'] += 1
                return None
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    async def set(self, 
                  key: str, 
                  value: Any, 
                  expire: int = 3600,
                  use_async: bool = True) -> bool:
        """Set value in cache with expiration"""
        try:
            # Serialize value
            try:
                serialized = json.dumps(value)
            except (TypeError, ValueError):
                serialized = pickle.dumps(value).decode('latin1')
            
            if use_async and self.async_redis:
                await self.async_redis.setex(key, expire, serialized)
            else:
                self.redis_client.setex(key, expire, serialized)
                
            self.stats['sets'] += 1
            return True
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str, use_async: bool = True) -> bool:
        """Delete key from cache"""
        try:
            if use_async and self.async_redis:
                await self.async_redis.delete(key)
            else:
                self.redis_client.delete(key)
                
            self.stats['deletes'] += 1
            return True
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all keys matching pattern"""
        try:
            keys = await self.async_redis.keys(pattern)
            if keys:
                await self.async_redis.delete(*keys)
                self.stats['deletes'] += len(keys)
                return len(keys)
            return 0
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Cache pattern invalidation error for {pattern}: {e}")
            return 0
    
    # Specialized cache methods for PathwayIQ
    
    async def cache_user_progress(self, user_id: str, progress_data: Dict) -> bool:
        """Cache user progress data"""
        key = self._generate_key("user_progress", user_id)
        return await self.set(key, progress_data, expire=1800)  # 30 minutes
    
    async def get_user_progress(self, user_id: str) -> Optional[Dict]:
        """Get cached user progress"""
        key = self._generate_key("user_progress", user_id)
        return await self.get(key)
    
    async def cache_assessment_session(self, session_id: str, session_data: Dict) -> bool:
        """Cache assessment session data"""
        key = self._generate_key("assessment_session", session_id)
        return await self.set(key, session_data, expire=7200)  # 2 hours
    
    async def get_assessment_session(self, session_id: str) -> Optional[Dict]:
        """Get cached assessment session"""
        key = self._generate_key("assessment_session", session_id)
        return await self.get(key)
    
    async def cache_learning_path(self, user_id: str, path_data: Dict) -> bool:
        """Cache personalized learning path"""
        key = self._generate_key("learning_path", user_id)
        return await self.set(key, path_data, expire=3600)  # 1 hour
    
    async def get_learning_path(self, user_id: str) -> Optional[Dict]:
        """Get cached learning path"""
        key = self._generate_key("learning_path", user_id)
        return await self.get(key)
    
    async def cache_ai_response(self, prompt_hash: str, response: Dict) -> bool:
        """Cache AI response to avoid redundant API calls"""
        key = self._generate_key("ai_response", prompt_hash)
        return await self.set(key, response, expire=1800)  # 30 minutes
    
    async def get_ai_response(self, prompt_hash: str) -> Optional[Dict]:
        """Get cached AI response"""
        key = self._generate_key("ai_response", prompt_hash)
        return await self.get(key)
    
    async def cache_analytics_data(self, metric_type: str, data: Dict) -> bool:
        """Cache analytics data"""
        key = self._generate_key("analytics", metric_type)
        return await self.set(key, data, expire=300)  # 5 minutes
    
    async def get_analytics_data(self, metric_type: str) -> Optional[Dict]:
        """Get cached analytics data"""
        key = self._generate_key("analytics", metric_type)
        return await self.get(key)
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.stats,
            'hit_rate': round(hit_rate, 2),
            'total_requests': total_requests
        }
    
    async def close(self):
        """Close Redis connections"""
        try:
            if self.async_redis:
                await self.async_redis.close()
            if self.redis_client:
                self.redis_client.close()
            logger.info("✅ Redis connections closed")
        except Exception as e:
            logger.error(f"Error closing Redis connections: {e}")

# Singleton instance
cache_manager = AdvancedCacheManager()

# Decorator for automatic caching
def cache_result(expire: int = 3600, key_prefix: str = "auto"):
    """Decorator to automatically cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key_data = f"{func.__name__}:{args}:{kwargs}"
            key_hash = hashlib.md5(key_data.encode()).hexdigest()
            cache_key = cache_manager._generate_key(key_prefix, key_hash)
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator

# Performance monitoring
class CachePerformanceMonitor:
    """Monitor cache performance and provide insights"""
    
    def __init__(self, cache_manager: AdvancedCacheManager):
        self.cache_manager = cache_manager
        self.performance_history = []
    
    async def collect_metrics(self):
        """Collect performance metrics"""
        stats = self.cache_manager.get_stats()
        timestamp = datetime.utcnow()
        
        metric = {
            'timestamp': timestamp,
            'hit_rate': stats['hit_rate'],
            'total_requests': stats['total_requests'],
            'errors': stats['errors']
        }
        
        self.performance_history.append(metric)
        
        # Keep only last 1000 metrics
        if len(self.performance_history) > 1000:
            self.performance_history = self.performance_history[-1000:]
        
        return metric
    
    def get_performance_report(self) -> Dict:
        """Generate performance report"""
        if not self.performance_history:
            return {'status': 'No data available'}
        
        recent_metrics = self.performance_history[-100:]  # Last 100 metrics
        
        avg_hit_rate = sum(m['hit_rate'] for m in recent_metrics) / len(recent_metrics)
        total_errors = sum(m['errors'] for m in recent_metrics)
        
        return {
            'average_hit_rate': round(avg_hit_rate, 2),
            'total_errors_last_100': total_errors,
            'cache_health': 'Good' if avg_hit_rate > 70 and total_errors < 5 else 'Needs Attention',
            'recommendations': self._generate_recommendations(avg_hit_rate, total_errors)
        }
    
    def _generate_recommendations(self, hit_rate: float, errors: int) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        if hit_rate < 50:
            recommendations.append("Consider increasing cache expiration times")
            recommendations.append("Review caching strategy for frequently accessed data")
        
        if errors > 10:
            recommendations.append("Investigate Redis connection stability")
            recommendations.append("Consider implementing cache fallback mechanisms")
        
        if hit_rate > 90:
            recommendations.append("Excellent cache performance - consider expanding cache coverage")
        
        return recommendations

# Initialize performance monitor
performance_monitor = CachePerformanceMonitor(cache_manager)