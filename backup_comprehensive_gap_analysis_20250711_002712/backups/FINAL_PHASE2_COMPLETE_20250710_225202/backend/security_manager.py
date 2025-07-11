"""
Advanced Security Hardening for PathwayIQ
Phase 2.1: Foundational Infrastructure

Chief Technical Architect Implementation
"""

import hashlib
import secrets
import time
import json
import ipaddress
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import argon2
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import structlog
import jwt
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio
import redis

logger = structlog.get_logger()

class SecurityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatType(Enum):
    BRUTE_FORCE = "brute_force"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    DATA_BREACH_ATTEMPT = "data_breach_attempt"
    INJECTION_ATTACK = "injection_attack"

@dataclass
class SecurityEvent:
    event_id: str
    timestamp: datetime
    threat_type: ThreatType
    severity: SecurityLevel
    source_ip: str
    user_id: Optional[str]
    details: Dict[str, Any]
    action_taken: str

class AdvancedPasswordHasher:
    """Advanced password hashing with Argon2"""
    
    def __init__(self):
        self.hasher = argon2.PasswordHasher(
            time_cost=3,      # Number of iterations
            memory_cost=65536, # Memory usage in KiB
            parallelism=1,    # Number of parallel threads
            hash_len=32,      # Hash length
            salt_len=16       # Salt length
        )
    
    def hash_password(self, password: str) -> str:
        """Hash password with Argon2"""
        try:
            return self.hasher.hash(password)
        except Exception as e:
            logger.error(f"Password hashing failed: {e}")
            raise
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        try:
            self.hasher.verify(hashed, password)
            return True
        except argon2.exceptions.VerifyMismatchError:
            return False
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return False
    
    def needs_rehash(self, hashed: str) -> bool:
        """Check if password needs rehashing"""
        return self.hasher.check_needs_rehash(hashed)

class AdvancedEncryption:
    """Advanced encryption for sensitive data"""
    
    def __init__(self, key: Optional[str] = None):
        if key:
            self.key = key.encode()
        else:
            self.key = Fernet.generate_key()
        self.fernet = Fernet(self.key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            encrypted = self.fernet.encrypt(data.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            decrypted = self.fernet.decrypt(encrypted_data.encode())
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise
    
    def encrypt_dict(self, data: Dict) -> str:
        """Encrypt dictionary data"""
        json_data = json.dumps(data)
        return self.encrypt(json_data)
    
    def decrypt_dict(self, encrypted_data: str) -> Dict:
        """Decrypt dictionary data"""
        json_data = self.decrypt(encrypted_data)
        return json.loads(json_data)

class ThreatDetector:
    """Advanced threat detection system"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.suspicious_patterns = [
            'union select',
            'drop table',
            'script>',
            'javascript:',
            '../../../',
            'null byte',
            'cmd.exe',
            '/etc/passwd'
        ]
    
    async def analyze_request(self, request: Request, user_id: Optional[str] = None) -> Optional[SecurityEvent]:
        """Analyze incoming request for threats"""
        client_ip = self._get_client_ip(request)
        
        # Check for injection attempts
        if await self._check_injection_patterns(request):
            return SecurityEvent(
                event_id=secrets.token_hex(16),
                timestamp=datetime.utcnow(),
                threat_type=ThreatType.INJECTION_ATTACK,
                severity=SecurityLevel.HIGH,
                source_ip=client_ip,
                user_id=user_id,
                details={"url": str(request.url), "method": request.method},
                action_taken="Request blocked"
            )
        
        # Check for suspicious activity patterns
        if await self._check_suspicious_activity(client_ip, user_id):
            return SecurityEvent(
                event_id=secrets.token_hex(16),
                timestamp=datetime.utcnow(),
                threat_type=ThreatType.SUSPICIOUS_ACTIVITY,
                severity=SecurityLevel.MEDIUM,
                source_ip=client_ip,
                user_id=user_id,
                details={"pattern": "Unusual request pattern detected"},
                action_taken="Logged for review"
            )
        
        return None
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP with proxy support"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def _check_injection_patterns(self, request: Request) -> bool:
        """Check for SQL injection and XSS patterns"""
        # Check URL parameters
        query_params = str(request.query_params).lower()
        for pattern in self.suspicious_patterns:
            if pattern in query_params:
                return True
        
        # Check headers for suspicious content
        user_agent = request.headers.get("User-Agent", "").lower()
        if any(pattern in user_agent for pattern in self.suspicious_patterns):
            return True
        
        return False
    
    async def _check_suspicious_activity(self, client_ip: str, user_id: Optional[str]) -> bool:
        """Check for suspicious activity patterns"""
        current_time = int(time.time())
        window = 300  # 5 minutes
        
        # Check request frequency from IP
        ip_key = f"security:ip_requests:{client_ip}"
        try:
            requests = self.redis_client.get(ip_key)
            if requests and int(requests) > 100:  # More than 100 requests in 5 minutes
                return True
            
            # Increment counter
            pipe = self.redis_client.pipeline()
            pipe.incr(ip_key)
            pipe.expire(ip_key, window)
            pipe.execute()
            
        except Exception as e:
            logger.error(f"Error checking suspicious activity: {e}")
        
        return False

class BruteForceProtection:
    """Protection against brute force attacks"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.max_attempts = {
            'login': 5,
            'password_reset': 3,
            'api_access': 10
        }
        self.lockout_duration = {
            'login': 900,      # 15 minutes
            'password_reset': 1800,  # 30 minutes
            'api_access': 600   # 10 minutes
        }
    
    async def check_attempts(self, identifier: str, attempt_type: str) -> Tuple[bool, int]:
        """Check if identifier is locked out"""
        key = f"security:attempts:{attempt_type}:{identifier}"
        
        try:
            attempts = self.redis_client.get(key)
            attempts = int(attempts) if attempts else 0
            
            max_allowed = self.max_attempts.get(attempt_type, 5)
            
            if attempts >= max_allowed:
                # Check if lockout period has expired
                ttl = self.redis_client.ttl(key)
                if ttl > 0:
                    return False, ttl  # Still locked out
                else:
                    # Lockout expired, reset counter
                    self.redis_client.delete(key)
                    return True, 0
            
            return True, max_allowed - attempts
            
        except Exception as e:
            logger.error(f"Error checking brute force attempts: {e}")
            return True, 0  # Allow on error, but log it
    
    async def record_attempt(self, identifier: str, attempt_type: str, success: bool):
        """Record login attempt"""
        key = f"security:attempts:{attempt_type}:{identifier}"
        
        try:
            if success:
                # Clear attempts on successful login
                self.redis_client.delete(key)
            else:
                # Increment failed attempts
                pipe = self.redis_client.pipeline()
                attempts = pipe.incr(key)
                duration = self.lockout_duration.get(attempt_type, 900)
                pipe.expire(key, duration)
                pipe.execute()
                
                # Log security event
                if attempts and int(str(attempts)) >= self.max_attempts.get(attempt_type, 5):
                    logger.warning(f"Brute force protection activated for {identifier}")
                    
        except Exception as e:
            logger.error(f"Error recording brute force attempt: {e}")

class SecurityAuditor:
    """Security audit and monitoring"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.security_events = []
    
    async def log_security_event(self, event: SecurityEvent):
        """Log security event"""
        try:
            # Store in memory (limited)
            self.security_events.append(event)
            if len(self.security_events) > 1000:
                self.security_events = self.security_events[-1000:]
            
            # Store in Redis with TTL
            event_key = f"security:events:{event.event_id}"
            event_data = {
                'timestamp': event.timestamp.isoformat(),
                'threat_type': event.threat_type.value,
                'severity': event.severity.value,
                'source_ip': event.source_ip,
                'user_id': event.user_id,
                'details': event.details,
                'action_taken': event.action_taken
            }
            
            self.redis_client.setex(
                event_key, 
                86400 * 7,  # 7 days
                json.dumps(event_data)
            )
            
            # Update metrics
            metrics_key = f"security:metrics:{event.threat_type.value}"
            self.redis_client.incr(metrics_key)
            self.redis_client.expire(metrics_key, 86400)  # 24 hours
            
            logger.info(f"Security event logged: {event.event_id}")
            
        except Exception as e:
            logger.error(f"Error logging security event: {e}")
    
    def get_security_metrics(self) -> Dict:
        """Get security metrics"""
        try:
            metrics = {}
            for threat_type in ThreatType:
                key = f"security:metrics:{threat_type.value}"
                count = self.redis_client.get(key)
                metrics[threat_type.value] = int(count) if count else 0
            
            return {
                'threat_counts': metrics,
                'total_events': len(self.security_events),
                'last_24h_events': sum(metrics.values()),
                'security_status': self._assess_security_status(metrics)
            }
            
        except Exception as e:
            logger.error(f"Error getting security metrics: {e}")
            return {'error': 'Unable to retrieve metrics'}
    
    def _assess_security_status(self, metrics: Dict) -> str:
        """Assess overall security status"""
        total_threats = sum(metrics.values())
        
        if total_threats == 0:
            return "Secure"
        elif total_threats < 10:
            return "Low Risk"
        elif total_threats < 50:
            return "Medium Risk"
        else:
            return "High Risk"

class SecureTokenManager:
    """Advanced JWT token management with rotation"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.token_blacklist = set()
    
    def create_access_token(self, 
                          data: Dict, 
                          expires_delta: Optional[timedelta] = None) -> str:
        """Create access token with enhanced claims"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=1)
        
        # Add security claims
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": secrets.token_hex(16),  # Unique token ID
            "type": "access"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create refresh token"""
        data = {
            "user_id": user_id,
            "type": "refresh",
            "jti": secrets.token_hex(16),
            "exp": datetime.utcnow() + timedelta(days=30),
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """Verify and decode token"""
        try:
            # Check if token is blacklisted
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={"verify_exp": True}
            )
            
            if payload.get('jti') in self.token_blacklist:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
    
    def revoke_token(self, token: str):
        """Revoke token by adding to blacklist"""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={"verify_exp": False}
            )
            
            jti = payload.get('jti')
            if jti:
                self.token_blacklist.add(jti)
                
        except Exception as e:
            logger.error(f"Error revoking token: {e}")

# Initialize security components
password_hasher = AdvancedPasswordHasher()
encryption_manager = AdvancedEncryption()

# Security middleware factory
def create_security_middleware(redis_client):
    """Create security middleware instances"""
    threat_detector = ThreatDetector(redis_client)
    brute_force_protection = BruteForceProtection(redis_client)
    security_auditor = SecurityAuditor(redis_client)
    
    return {
        'threat_detector': threat_detector,
        'brute_force_protection': brute_force_protection,
        'security_auditor': security_auditor
    }

# Data sanitization utilities
class DataSanitizer:
    """Sanitize and validate input data"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            return ""
        
        # Remove null bytes and control characters
        sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\t\n\r')
        
        # Truncate to max length
        return sanitized[:max_length]
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_ip_address(ip: str) -> bool:
        """Validate IP address"""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False

# Rate limiting for API endpoints
class AdvancedRateLimiter:
    """Advanced rate limiting with different strategies"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.limits = {
            'default': {'requests': 100, 'window': 3600},  # 100 per hour
            'auth': {'requests': 5, 'window': 300},         # 5 per 5 minutes
            'api': {'requests': 1000, 'window': 3600},      # 1000 per hour
            'upload': {'requests': 10, 'window': 3600}      # 10 per hour
        }
    
    async def check_rate_limit(self, 
                              identifier: str, 
                              endpoint_type: str = 'default') -> Tuple[bool, Dict]:
        """Check if request is within rate limits"""
        limit_config = self.limits.get(endpoint_type, self.limits['default'])
        
        key = f"rate_limit:{endpoint_type}:{identifier}"
        current_time = int(time.time())
        window_start = current_time - limit_config['window']
        
        try:
            pipe = self.redis_client.pipeline()
            
            # Remove old entries
            pipe.zremrangebyscore(key, '-inf', window_start)
            
            # Count current requests
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiration
            pipe.expire(key, limit_config['window'])
            
            results = pipe.execute()
            current_requests = results[1]
            
            remaining = max(0, limit_config['requests'] - current_requests)
            reset_time = current_time + limit_config['window']
            
            rate_limit_info = {
                'limit': limit_config['requests'],
                'remaining': remaining,
                'reset': reset_time,
                'window': limit_config['window']
            }
            
            return current_requests < limit_config['requests'], rate_limit_info
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            # Allow request on error, but log it
            return True, {'error': 'Rate limit check failed'}

logger.info("✅ Advanced Security Hardening System initialized")