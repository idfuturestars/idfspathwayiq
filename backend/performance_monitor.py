"""
Advanced Performance Monitoring & Diagnostics for PathwayIQ
Phase 2.1: Foundational Infrastructure

Chief Technical Architect Implementation
"""

import time
import psutil
import asyncio
import json
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import deque, defaultdict
import threading
import structlog
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest
import redis
import redis.asyncio as aioredis

logger = structlog.get_logger()

@dataclass
class PerformanceMetric:
    timestamp: datetime
    metric_name: str
    value: float
    tags: Dict[str, str]
    unit: str = ""

@dataclass
class SystemMetrics:
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, int]
    active_connections: int
    response_time: float

class MetricsCollector:
    """Collect system and application metrics"""
    
    def __init__(self):
        self.registry = CollectorRegistry()
        
        # Prometheus metrics
        self.request_counter = Counter(
            'pathwayiq_requests_total',
            'Total requests by endpoint and method',
            ['endpoint', 'method', 'status'],
            registry=self.registry
        )
        
        self.request_duration = Histogram(
            'pathwayiq_request_duration_seconds',
            'Request duration by endpoint',
            ['endpoint', 'method'],
            registry=self.registry
        )
        
        self.active_users = Gauge(
            'pathwayiq_active_users',
            'Number of active users',
            registry=self.registry
        )
        
        self.cache_operations = Counter(
            'pathwayiq_cache_operations_total',
            'Cache operations by type and result',
            ['operation', 'result'],
            registry=self.registry
        )
        
        self.ai_api_calls = Counter(
            'pathwayiq_ai_api_calls_total',
            'AI API calls by provider and endpoint',
            ['provider', 'endpoint', 'status'],
            registry=self.registry
        )
        
        self.database_operations = Histogram(
            'pathwayiq_db_operation_duration_seconds',
            'Database operation duration',
            ['operation', 'collection'],
            registry=self.registry
        )
        
        # System metrics
        self.cpu_usage = Gauge(
            'pathwayiq_cpu_usage_percent',
            'CPU usage percentage',
            registry=self.registry
        )
        
        self.memory_usage = Gauge(
            'pathwayiq_memory_usage_bytes',
            'Memory usage in bytes',
            registry=self.registry
        )
        
        self.disk_usage = Gauge(
            'pathwayiq_disk_usage_percent',
            'Disk usage percentage',
            registry=self.registry
        )
        
        # Custom application metrics
        self.assessment_sessions = Gauge(
            'pathwayiq_active_assessment_sessions',
            'Number of active assessment sessions',
            registry=self.registry
        )
        
        self.learning_paths_generated = Counter(
            'pathwayiq_learning_paths_generated_total',
            'Total learning paths generated',
            registry=self.registry
        )
        
        self.user_interactions = Counter(
            'pathwayiq_user_interactions_total',
            'User interactions by type',
            ['interaction_type'],
            registry=self.registry
        )
    
    def get_metrics_export(self) -> str:
        """Export metrics in Prometheus format"""
        return generate_latest(self.registry).decode('utf-8')

class PerformanceMonitor:
    """Advanced performance monitoring system"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.metrics_collector = MetricsCollector()
        self.metrics_history = deque(maxlen=10000)
        self.alert_thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0,
            'response_time': 5.0,  # seconds
            'error_rate': 5.0      # percent
        }
        self.is_monitoring = False
        self.monitoring_interval = 30  # seconds
        self._monitoring_task = None
    
    async def start_monitoring(self):
        """Start continuous monitoring"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self._monitoring_task = asyncio.create_task(self._monitoring_loop())
        logger.info("✅ Performance monitoring started")
    
    async def stop_monitoring(self):
        """Stop continuous monitoring"""
        self.is_monitoring = False
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
        logger.info("⏹️ Performance monitoring stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                await self.collect_metrics()
                await asyncio.sleep(self.monitoring_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(5)  # Short delay before retry
    
    async def collect_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            # Application metrics
            active_connections = self._get_active_connections()
            response_time = await self._measure_response_time()
            
            metrics = SystemMetrics(
                cpu_usage=cpu_percent,
                memory_usage=memory.percent,
                disk_usage=(disk.used / disk.total) * 100,
                network_io={
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                },
                active_connections=active_connections,
                response_time=response_time
            )
            
            # Update Prometheus metrics
            self.metrics_collector.cpu_usage.set(cpu_percent)
            self.metrics_collector.memory_usage.set(memory.used)
            self.metrics_collector.disk_usage.set(metrics.disk_usage)
            
            # Store metrics
            self.metrics_history.append({
                'timestamp': datetime.utcnow(),
                'metrics': asdict(metrics)
            })
            
            # Check for alerts
            await self._check_alerts(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            raise
    
    def _get_active_connections(self) -> int:
        """Get number of active network connections"""
        try:
            connections = psutil.net_connections(kind='inet')
            return len([conn for conn in connections if conn.status == 'ESTABLISHED'])
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            return 0
    
    async def _measure_response_time(self) -> float:
        """Measure application response time"""
        start_time = time.time()
        try:
            # Simple health check
            if self.redis_client:
                self.redis_client.ping()
            end_time = time.time()
            return end_time - start_time
        except Exception:
            return 0.0
    
    async def _check_alerts(self, metrics: SystemMetrics):
        """Check metrics against thresholds and trigger alerts"""
        alerts = []
        
        if metrics.cpu_usage > self.alert_thresholds['cpu_usage']:
            alerts.append(f"High CPU usage: {metrics.cpu_usage:.1f}%")
        
        if metrics.memory_usage > self.alert_thresholds['memory_usage']:
            alerts.append(f"High memory usage: {metrics.memory_usage:.1f}%")
        
        if metrics.disk_usage > self.alert_thresholds['disk_usage']:
            alerts.append(f"High disk usage: {metrics.disk_usage:.1f}%")
        
        if metrics.response_time > self.alert_thresholds['response_time']:
            alerts.append(f"High response time: {metrics.response_time:.2f}s")
        
        if alerts:
            await self._send_alerts(alerts)
    
    async def _send_alerts(self, alerts: List[str]):
        """Send performance alerts"""
        for alert in alerts:
            logger.warning(f"⚠️ PERFORMANCE ALERT: {alert}")
            
            # Store alert in Redis for dashboard
            if self.redis_client:
                try:
                    alert_data = {
                        'timestamp': datetime.utcnow().isoformat(),
                        'message': alert,
                        'severity': 'warning'
                    }
                    self.redis_client.lpush(
                        'pathwayiq:alerts',
                        json.dumps(alert_data)
                    )
                    self.redis_client.ltrim('pathwayiq:alerts', 0, 99)  # Keep last 100 alerts
                except Exception as e:
                    logger.error(f"Error storing alert: {e}")
    
    def get_performance_summary(self) -> Dict:
        """Get performance summary"""
        if not self.metrics_history:
            return {'status': 'No metrics available'}
        
        recent_metrics = list(self.metrics_history)[-10:]  # Last 10 metrics
        
        # Calculate averages
        avg_cpu = sum(m['metrics']['cpu_usage'] for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m['metrics']['memory_usage'] for m in recent_metrics) / len(recent_metrics)
        avg_response_time = sum(m['metrics']['response_time'] for m in recent_metrics) / len(recent_metrics)
        
        # Get latest metrics
        latest = recent_metrics[-1]['metrics']
        
        return {
            'current': latest,
            'averages': {
                'cpu_usage': round(avg_cpu, 2),
                'memory_usage': round(avg_memory, 2),
                'response_time': round(avg_response_time, 3)
            },
            'status': self._get_overall_status(latest),
            'uptime': self._get_uptime(),
            'total_metrics_collected': len(self.metrics_history)
        }
    
    def _get_overall_status(self, metrics: Dict) -> str:
        """Determine overall system status"""
        if (metrics['cpu_usage'] > 90 or 
            metrics['memory_usage'] > 95 or 
            metrics['disk_usage'] > 95):
            return "Critical"
        elif (metrics['cpu_usage'] > 80 or 
              metrics['memory_usage'] > 85 or 
              metrics['disk_usage'] > 90):
            return "Warning"
        else:
            return "Healthy"
    
    def _get_uptime(self) -> str:
        """Get system uptime"""
        try:
            uptime_seconds = time.time() - psutil.boot_time()
            uptime_delta = timedelta(seconds=uptime_seconds)
            days = uptime_delta.days
            hours, remainder = divmod(uptime_delta.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            return f"{days}d {hours}h {minutes}m"
        except Exception:
            return "Unknown"

class ApplicationProfiler:
    """Profile application performance"""
    
    def __init__(self):
        self.function_timings = defaultdict(list)
        self.request_timings = defaultdict(list)
        self.slow_queries = []
    
    def time_function(self, func_name: str = None):
        """Decorator to time function execution"""
        def decorator(func: Callable):
            name = func_name or f"{func.__module__}.{func.__name__}"
            
            if asyncio.iscoroutinefunction(func):
                async def async_wrapper(*args, **kwargs):
                    start_time = time.time()
                    try:
                        result = await func(*args, **kwargs)
                        return result
                    finally:
                        execution_time = time.time() - start_time
                        self.function_timings[name].append(execution_time)
                        
                        # Keep only last 1000 timings
                        if len(self.function_timings[name]) > 1000:
                            self.function_timings[name] = self.function_timings[name][-1000:]
                
                return async_wrapper
            else:
                def sync_wrapper(*args, **kwargs):
                    start_time = time.time()
                    try:
                        result = func(*args, **kwargs)
                        return result
                    finally:
                        execution_time = time.time() - start_time
                        self.function_timings[name].append(execution_time)
                        
                        # Keep only last 1000 timings
                        if len(self.function_timings[name]) > 1000:
                            self.function_timings[name] = self.function_timings[name][-1000:]
                
                return sync_wrapper
        
        return decorator
    
    def record_request_timing(self, endpoint: str, method: str, duration: float):
        """Record request timing"""
        key = f"{method}:{endpoint}"
        self.request_timings[key].append({
            'duration': duration,
            'timestamp': datetime.utcnow()
        })
        
        # Keep only last 1000 timings
        if len(self.request_timings[key]) > 1000:
            self.request_timings[key] = self.request_timings[key][-1000:]
    
    def record_slow_query(self, query: str, duration: float, collection: str = None):
        """Record slow database query"""
        if duration > 1.0:  # Queries slower than 1 second
            self.slow_queries.append({
                'query': query[:1000],  # Truncate long queries
                'duration': duration,
                'collection': collection,
                'timestamp': datetime.utcnow()
            })
            
            # Keep only last 100 slow queries
            if len(self.slow_queries) > 100:
                self.slow_queries = self.slow_queries[-100:]
    
    def get_performance_report(self) -> Dict:
        """Generate performance report"""
        report = {
            'function_performance': {},
            'endpoint_performance': {},
            'slow_queries': self.slow_queries[-10:],  # Last 10 slow queries
            'recommendations': []
        }
        
        # Function performance
        for func_name, timings in self.function_timings.items():
            if timings:
                avg_time = sum(timings) / len(timings)
                max_time = max(timings)
                min_time = min(timings)
                
                report['function_performance'][func_name] = {
                    'avg_duration': round(avg_time, 4),
                    'max_duration': round(max_time, 4),
                    'min_duration': round(min_time, 4),
                    'call_count': len(timings)
                }
                
                # Add recommendations
                if avg_time > 1.0:
                    report['recommendations'].append(
                        f"Function {func_name} is slow (avg: {avg_time:.2f}s)"
                    )
        
        # Endpoint performance
        for endpoint_key, timings in self.request_timings.items():
            if timings:
                durations = [t['duration'] for t in timings]
                avg_time = sum(durations) / len(durations)
                max_time = max(durations)
                
                report['endpoint_performance'][endpoint_key] = {
                    'avg_duration': round(avg_time, 4),
                    'max_duration': round(max_time, 4),
                    'request_count': len(timings)
                }
                
                # Add recommendations
                if avg_time > 2.0:
                    report['recommendations'].append(
                        f"Endpoint {endpoint_key} is slow (avg: {avg_time:.2f}s)"
                    )
        
        return report

class DiagnosticTools:
    """Diagnostic tools for troubleshooting"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
    
    async def run_health_check(self) -> Dict:
        """Comprehensive health check"""
        health = {
            'overall_status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'checks': {}
        }
        
        # System health
        try:
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            health['checks']['system'] = {
                'status': 'healthy' if cpu_usage < 90 and memory.percent < 90 else 'warning',
                'cpu_usage': cpu_usage,
                'memory_usage': memory.percent,
                'disk_usage': (disk.used / disk.total) * 100
            }
        except Exception as e:
            health['checks']['system'] = {'status': 'error', 'error': str(e)}
            health['overall_status'] = 'unhealthy'
        
        # Redis health
        if self.redis_client:
            try:
                response_time = time.time()
                self.redis_client.ping()
                response_time = time.time() - response_time
                
                health['checks']['redis'] = {
                    'status': 'healthy',
                    'response_time': round(response_time, 4),
                    'info': self._get_redis_info()
                }
            except Exception as e:
                health['checks']['redis'] = {'status': 'error', 'error': str(e)}
                health['overall_status'] = 'unhealthy'
        
        # Application specific checks
        health['checks']['application'] = await self._check_application_health()
        
        # Set overall status
        failed_checks = [name for name, check in health['checks'].items() 
                        if check.get('status') == 'error']
        if failed_checks:
            health['overall_status'] = 'unhealthy'
        elif any(check.get('status') == 'warning' for check in health['checks'].values()):
            health['overall_status'] = 'degraded'
        
        return health
    
    def _get_redis_info(self) -> Dict:
        """Get Redis server information"""
        try:
            info = self.redis_client.info()
            return {
                'version': info.get('redis_version'),
                'used_memory': info.get('used_memory_human'),
                'connected_clients': info.get('connected_clients'),
                'total_commands_processed': info.get('total_commands_processed')
            }
        except Exception:
            return {}
    
    async def _check_application_health(self) -> Dict:
        """Check application-specific health"""
        checks = {
            'status': 'healthy',
            'components': {}
        }
        
        # Add your application-specific health checks here
        # For example: database connectivity, external API availability, etc.
        
        return checks
    
    def generate_diagnostic_report(self) -> Dict:
        """Generate comprehensive diagnostic report"""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'system_info': self._get_system_info(),
            'process_info': self._get_process_info(),
            'network_info': self._get_network_info(),
            'recommendations': self._generate_recommendations()
        }
    
    def _get_system_info(self) -> Dict:
        """Get system information"""
        try:
            return {
                'platform': psutil.LINUX,
                'cpu_count': psutil.cpu_count(),
                'cpu_freq': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
                'memory_total': psutil.virtual_memory().total,
                'disk_total': psutil.disk_usage('/').total,
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _get_process_info(self) -> Dict:
        """Get current process information"""
        try:
            process = psutil.Process()
            return {
                'pid': process.pid,
                'memory_info': process.memory_info()._asdict(),
                'cpu_percent': process.cpu_percent(),
                'num_threads': process.num_threads(),
                'create_time': datetime.fromtimestamp(process.create_time()).isoformat(),
                'status': process.status()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _get_network_info(self) -> Dict:
        """Get network information"""
        try:
            return {
                'interfaces': {name: addr._asdict() for name, addrs in psutil.net_if_addrs().items() 
                             for addr in addrs if addr.family.name in ['AF_INET', 'AF_INET6']},
                'io_counters': psutil.net_io_counters()._asdict(),
                'connections_count': len(psutil.net_connections())
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _generate_recommendations(self) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        try:
            # CPU recommendations
            cpu_usage = psutil.cpu_percent(interval=1)
            if cpu_usage > 80:
                recommendations.append("High CPU usage detected - consider scaling horizontally")
            
            # Memory recommendations
            memory = psutil.virtual_memory()
            if memory.percent > 85:
                recommendations.append("High memory usage - consider increasing memory or optimizing code")
            
            # Disk recommendations
            disk = psutil.disk_usage('/')
            if (disk.used / disk.total) * 100 > 90:
                recommendations.append("Disk space running low - consider cleanup or expanding storage")
            
        except Exception:
            recommendations.append("Unable to generate recommendations due to system access issues")
        
        return recommendations

# Global instances
performance_monitor = PerformanceMonitor()
application_profiler = ApplicationProfiler()
diagnostic_tools = DiagnosticTools()

logger.info("✅ Advanced Performance Monitoring & Diagnostics System initialized")