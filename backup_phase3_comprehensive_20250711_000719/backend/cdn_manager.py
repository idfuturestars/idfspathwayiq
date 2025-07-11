"""
CDN Integration & Optimization for PathwayIQ
Phase 2.2: Technical Infrastructure

Chief Technical Architect Implementation
"""

import cloudflare
import hashlib
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import structlog
import json
import os
from dataclasses import dataclass

logger = structlog.get_logger()

@dataclass
class CDNConfiguration:
    """CDN configuration settings"""
    zone_id: str
    api_token: str
    domain: str
    cache_ttl: int = 86400  # 24 hours default
    cache_levels: Dict[str, int] = None
    
    def __post_init__(self):
        if self.cache_levels is None:
            self.cache_levels = {
                'static_assets': 31536000,    # 1 year for CSS, JS, images
                'api_responses': 300,         # 5 minutes for API responses
                'user_content': 1800,         # 30 minutes for user content
                'dynamic_content': 60         # 1 minute for dynamic content
            }

class CloudflareCDNManager:
    """Advanced CDN management with Cloudflare"""
    
    def __init__(self, config: CDNConfiguration):
        self.config = config
        self.cf = None
        self.cache_stats = {
            'cache_hits': 0,
            'cache_misses': 0,
            'purge_requests': 0,
            'bandwidth_saved': 0
        }
        
    async def initialize(self):
        """Initialize Cloudflare client"""
        try:
            self.cf = cloudflare.CloudFlare(token=self.config.api_token)
            
            # Test connection
            zones = self.cf.zones.get(params={'name': self.config.domain})
            if not zones:
                raise ValueError(f"Zone not found for domain: {self.config.domain}")
            
            logger.info(f"✅ CDN Manager initialized for domain: {self.config.domain}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize CDN: {e}")
            raise
    
    async def setup_cache_rules(self) -> Dict[str, Any]:
        """Setup intelligent caching rules"""
        try:
            cache_rules = []
            
            # Static assets - Long cache
            static_rule = {
                "expression": "(http.request.uri.path matches \"\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$\")",
                "action": "cache",
                "cache_ttl": self.config.cache_levels['static_assets'],
                "description": "Cache static assets for 1 year"
            }
            cache_rules.append(static_rule)
            
            # API responses - Short cache
            api_rule = {
                "expression": "(http.request.uri.path matches \"^/api/\")",
                "action": "cache", 
                "cache_ttl": self.config.cache_levels['api_responses'],
                "description": "Cache API responses for 5 minutes"
            }
            cache_rules.append(api_rule)
            
            # User content - Medium cache
            content_rule = {
                "expression": "(http.request.uri.path matches \"^/(dashboard|profile|results)\")",
                "action": "cache",
                "cache_ttl": self.config.cache_levels['user_content'],
                "description": "Cache user content for 30 minutes"
            }
            cache_rules.append(content_rule)
            
            # Apply cache rules via Page Rules API
            for rule in cache_rules:
                try:
                    page_rule = self.cf.zones.pagerules.post(
                        self.config.zone_id,
                        data={
                            "targets": [{"target": "url", "constraint": {"operator": "matches", "value": f"*{self.config.domain}/*"}}],
                            "actions": [
                                {"id": "cache_level", "value": "cache_everything"},
                                {"id": "edge_cache_ttl", "value": rule['cache_ttl']}
                            ],
                            "status": "active"
                        }
                    )
                    logger.info(f"✅ Cache rule created: {rule['description']}")
                except Exception as e:
                    logger.warning(f"Cache rule creation failed: {e}")
            
            return {"status": "success", "rules_created": len(cache_rules)}
            
        except Exception as e:
            logger.error(f"Failed to setup cache rules: {e}")
            return {"status": "error", "error": str(e)}
    
    async def setup_security_features(self) -> Dict[str, Any]:
        """Setup CDN security features"""
        try:
            security_settings = []
            
            # Enable DDoS protection
            ddos_setting = self.cf.zones.settings.ddos_protection.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            security_settings.append("DDoS Protection: ON")
            
            # Enable WAF (Web Application Firewall)
            waf_setting = self.cf.zones.settings.waf.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            security_settings.append("WAF: ON")
            
            # Enable Bot Fight Mode
            bot_setting = self.cf.zones.settings.bot_fight_mode.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            security_settings.append("Bot Fight Mode: ON")
            
            # Enable Always Use HTTPS
            https_setting = self.cf.zones.settings.always_use_https.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            security_settings.append("Always HTTPS: ON")
            
            logger.info("✅ CDN security features enabled")
            return {"status": "success", "features": security_settings}
            
        except Exception as e:
            logger.error(f"Failed to setup security features: {e}")
            return {"status": "error", "error": str(e)}
    
    async def setup_performance_optimization(self) -> Dict[str, Any]:
        """Setup performance optimization features"""
        try:
            optimizations = []
            
            # Enable Minification
            minify_setting = self.cf.zones.settings.minify.patch(
                self.config.zone_id,
                data={
                    "value": {
                        "css": "on",
                        "html": "on", 
                        "js": "on"
                    }
                }
            )
            optimizations.append("Minification: CSS, HTML, JS")
            
            # Enable Brotli compression
            brotli_setting = self.cf.zones.settings.brotli.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            optimizations.append("Brotli Compression: ON")
            
            # Enable Rocket Loader for async JS
            rocket_setting = self.cf.zones.settings.rocket_loader.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            optimizations.append("Rocket Loader: ON")
            
            # Enable Auto Minify
            auto_minify = self.cf.zones.settings.auto_minify.patch(
                self.config.zone_id,
                data={
                    "value": {
                        "css": True,
                        "html": True,
                        "js": True
                    }
                }
            )
            optimizations.append("Auto Minify: ON")
            
            logger.info("✅ CDN performance optimizations enabled")
            return {"status": "success", "optimizations": optimizations}
            
        except Exception as e:
            logger.error(f"Failed to setup performance optimization: {e}")
            return {"status": "error", "error": str(e)}
    
    async def purge_cache(self, urls: Optional[List[str]] = None, purge_all: bool = False) -> Dict[str, Any]:
        """Purge CDN cache selectively or completely"""
        try:
            if purge_all:
                purge_result = self.cf.zones.purge_cache.post(
                    self.config.zone_id,
                    data={"purge_everything": True}
                )
                self.cache_stats['purge_requests'] += 1
                logger.info("✅ Full cache purge completed")
                return {"status": "success", "type": "full_purge"}
            
            elif urls:
                # Selective purge
                purge_result = self.cf.zones.purge_cache.post(
                    self.config.zone_id,
                    data={"files": urls}
                )
                self.cache_stats['purge_requests'] += 1
                logger.info(f"✅ Selective cache purge completed for {len(urls)} URLs")
                return {"status": "success", "type": "selective_purge", "urls_purged": len(urls)}
            
            else:
                return {"status": "error", "error": "No purge parameters specified"}
                
        except Exception as e:
            logger.error(f"Cache purge failed: {e}")
            return {"status": "error", "error": str(e)}
    
    async def get_analytics(self, days: int = 7) -> Dict[str, Any]:
        """Get CDN analytics and performance metrics"""
        try:
            # Get zone analytics
            since = (datetime.utcnow() - timedelta(days=days)).isoformat() + 'Z'
            until = datetime.utcnow().isoformat() + 'Z'
            
            analytics = self.cf.zones.analytics.dashboard.get(
                self.config.zone_id,
                params={
                    'since': since,
                    'until': until,
                    'continuous': True
                }
            )
            
            # Calculate metrics
            if analytics and 'result' in analytics:
                result = analytics['result']
                
                total_requests = sum(item.get('requests', {}).get('all', 0) for item in result.get('timeseries', []))
                cached_requests = sum(item.get('requests', {}).get('cached', 0) for item in result.get('timeseries', []))
                cache_hit_ratio = (cached_requests / total_requests * 100) if total_requests > 0 else 0
                
                bandwidth_saved = sum(item.get('bandwidth', {}).get('cached', 0) for item in result.get('timeseries', []))
                
                return {
                    "status": "success",
                    "period_days": days,
                    "total_requests": total_requests,
                    "cached_requests": cached_requests,
                    "cache_hit_ratio": round(cache_hit_ratio, 2),
                    "bandwidth_saved_bytes": bandwidth_saved,
                    "bandwidth_saved_mb": round(bandwidth_saved / (1024 * 1024), 2)
                }
            
            return {"status": "no_data", "message": "No analytics data available"}
            
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return {"status": "error", "error": str(e)}
    
    async def optimize_images(self) -> Dict[str, Any]:
        """Setup image optimization"""
        try:
            # Enable Polish (image optimization)
            polish_setting = self.cf.zones.settings.polish.patch(
                self.config.zone_id,
                data={"value": "lossless"}
            )
            
            # Enable WebP conversion
            webp_setting = self.cf.zones.settings.webp.patch(
                self.config.zone_id,
                data={"value": "on"}
            )
            
            logger.info("✅ Image optimization enabled (Polish + WebP)")
            return {
                "status": "success",
                "features": ["Polish: Lossless", "WebP: ON"]
            }
            
        except Exception as e:
            logger.error(f"Image optimization setup failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_cdn_status(self) -> Dict[str, Any]:
        """Get overall CDN status and statistics"""
        return {
            "cdn_provider": "Cloudflare",
            "domain": self.config.domain,
            "zone_id": self.config.zone_id,
            "cache_statistics": self.cache_stats,
            "cache_levels": self.config.cache_levels,
            "status": "operational"
        }

class ContentOptimizer:
    """Optimize content for CDN delivery"""
    
    def __init__(self):
        self.optimization_stats = {
            'files_optimized': 0,
            'bytes_saved': 0,
            'compression_ratio': 0
        }
    
    def optimize_static_assets(self, asset_path: str) -> Dict[str, Any]:
        """Optimize static assets for CDN delivery"""
        optimizations = []
        
        # Add cache headers for different asset types
        if asset_path.endswith(('.css', '.js')):
            optimizations.append({
                'header': 'Cache-Control',
                'value': f'public, max-age={86400 * 365}, immutable'  # 1 year
            })
        elif asset_path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
            optimizations.append({
                'header': 'Cache-Control', 
                'value': f'public, max-age={86400 * 30}'  # 30 days
            })
        elif asset_path.endswith(('.woff', '.woff2', '.ttf', '.eot')):
            optimizations.append({
                'header': 'Cache-Control',
                'value': f'public, max-age={86400 * 365}, immutable'  # 1 year
            })
        
        # Add compression headers
        optimizations.append({
            'header': 'Vary',
            'value': 'Accept-Encoding'
        })
        
        return {
            'asset_path': asset_path,
            'optimizations': optimizations,
            'cdn_ready': True
        }
    
    def generate_cache_manifest(self, assets: List[str]) -> Dict[str, Any]:
        """Generate cache manifest for assets"""
        manifest = {
            'version': hashlib.md5(str(datetime.utcnow()).encode()).hexdigest()[:8],
            'timestamp': datetime.utcnow().isoformat(),
            'assets': {}
        }
        
        for asset in assets:
            # Generate hash for asset versioning
            asset_hash = hashlib.md5(asset.encode()).hexdigest()[:8]
            manifest['assets'][asset] = {
                'hash': asset_hash,
                'cache_optimized': True,
                'optimization': self.optimize_static_assets(asset)
            }
        
        return manifest

# Global CDN manager instance
cdn_manager = None

def initialize_cdn_manager(config: CDNConfiguration) -> CloudflareCDNManager:
    """Initialize global CDN manager"""
    global cdn_manager
    cdn_manager = CloudflareCDNManager(config)
    return cdn_manager

# Content optimization utilities
content_optimizer = ContentOptimizer()

logger.info("✅ CDN Integration & Optimization System initialized")