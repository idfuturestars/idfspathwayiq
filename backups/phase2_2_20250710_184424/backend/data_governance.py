"""
Advanced Data Governance Framework for PathwayIQ
Phase 2.1: Foundational Infrastructure

Chief Technical Architect Implementation
"""

import json
import hashlib
import uuid
from typing import Dict, List, Optional, Any, Union, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import structlog
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings

logger = structlog.get_logger()

class DataClassification(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

class DataSensitivity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RetentionPeriod(Enum):
    THIRTY_DAYS = 30
    NINETY_DAYS = 90
    ONE_YEAR = 365
    THREE_YEARS = 1095
    SEVEN_YEARS = 2555
    PERMANENT = -1

class DataProcessingPurpose(Enum):
    AUTHENTICATION = "authentication"
    PERSONALIZATION = "personalization"
    ANALYTICS = "analytics"
    MARKETING = "marketing"
    LEGAL_COMPLIANCE = "legal_compliance"
    SECURITY = "security"
    RESEARCH = "research"

@dataclass
class DataLineage:
    """Track data lineage and transformations"""
    source_system: str
    source_table: str
    transformation_steps: List[str] = field(default_factory=list)
    destination_system: str = ""
    destination_table: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    created_by: str = ""

@dataclass
class DataAccess:
    """Track data access events"""
    access_id: str
    user_id: str
    data_type: str
    access_purpose: DataProcessingPurpose
    timestamp: datetime
    ip_address: str
    user_agent: str
    success: bool
    details: Dict[str, Any] = field(default_factory=dict)

class DataSchema(BaseModel):
    """Define data schema with governance metadata"""
    name: str = Field(..., description="Schema name")
    version: str = Field(..., description="Schema version")
    classification: DataClassification = Field(..., description="Data classification")
    sensitivity: DataSensitivity = Field(..., description="Data sensitivity level")
    retention_period: RetentionPeriod = Field(..., description="Data retention period")
    processing_purposes: List[DataProcessingPurpose] = Field(..., description="Processing purposes")
    fields: Dict[str, Dict[str, Any]] = Field(..., description="Field definitions")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('fields')
    def validate_fields(cls, v):
        """Validate field definitions"""
        for field_name, field_def in v.items():
            if 'type' not in field_def:
                raise ValueError(f"Field {field_name} must have a type")
            if 'pii' not in field_def:
                field_def['pii'] = False
        return v

class DataGovernanceConfig(BaseSettings):
    """Data governance configuration"""
    enable_audit_logging: bool = True
    enable_data_masking: bool = True
    enable_encryption_at_rest: bool = True
    enable_access_control: bool = True
    max_retention_days: int = 2555  # 7 years
    pii_fields: Set[str] = {
        'email', 'phone', 'address', 'ssn', 'passport',
        'credit_card', 'bank_account', 'ip_address'
    }
    sensitive_keywords: Set[str] = {
        'password', 'secret', 'key', 'token', 'private'
    }
    
    class Config:
        env_prefix = "GOVERNANCE_"

class PIIDetector:
    """Detect Personally Identifiable Information"""
    
    def __init__(self):
        self.pii_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        }
        
    def scan_text(self, text: str) -> Dict[str, List[str]]:
        """Scan text for PII patterns"""
        import re
        detected_pii = {}
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                detected_pii[pii_type] = matches
        
        return detected_pii
    
    def scan_dict(self, data: Dict[str, Any]) -> Dict[str, Dict[str, List[str]]]:
        """Scan dictionary for PII"""
        results = {}
        
        def scan_recursive(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    new_path = f"{path}.{key}" if path else key
                    scan_recursive(value, new_path)
            elif isinstance(obj, (list, tuple)):
                for i, item in enumerate(obj):
                    new_path = f"{path}[{i}]"
                    scan_recursive(item, new_path)
            elif isinstance(obj, str):
                pii_found = self.scan_text(obj)
                if pii_found:
                    results[path] = pii_found
        
        scan_recursive(data)
        return results

class DataMasker:
    """Mask sensitive data"""
    
    @staticmethod
    def mask_email(email: str) -> str:
        """Mask email address"""
        if '@' not in email:
            return '*' * len(email)
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = '*' * len(local)
        else:
            masked_local = local[:2] + '*' * (len(local) - 2)
        
        return f"{masked_local}@{domain}"
    
    @staticmethod
    def mask_phone(phone: str) -> str:
        """Mask phone number"""
        digits_only = ''.join(filter(str.isdigit, phone))
        if len(digits_only) >= 10:
            return f"***-***-{digits_only[-4:]}"
        return '*' * len(phone)
    
    @staticmethod
    def mask_credit_card(card: str) -> str:
        """Mask credit card number"""
        digits_only = ''.join(filter(str.isdigit, card))
        if len(digits_only) >= 4:
            return f"****-****-****-{digits_only[-4:]}"
        return '*' * len(card)
    
    @staticmethod
    def mask_generic(value: str, mask_char: str = '*') -> str:
        """Generic masking for any string"""
        if len(value) <= 4:
            return mask_char * len(value)
        return value[:2] + mask_char * (len(value) - 4) + value[-2:]
    
    def mask_data(self, data: Any, pii_fields: Set[str] = None) -> Any:
        """Mask PII data in complex structures"""
        if pii_fields is None:
            pii_fields = DataGovernanceConfig().pii_fields
        
        def mask_recursive(obj):
            if isinstance(obj, dict):
                return {
                    key: self._mask_field_value(key, value, pii_fields)
                    for key, value in obj.items()
                }
            elif isinstance(obj, list):
                return [mask_recursive(item) for item in obj]
            return obj
        
        return mask_recursive(data)
    
    def _mask_field_value(self, field_name: str, value: Any, pii_fields: Set[str]) -> Any:
        """Mask field value if it's PII"""
        if not isinstance(value, str):
            return value
        
        field_lower = field_name.lower()
        
        if 'email' in field_lower:
            return self.mask_email(value)
        elif 'phone' in field_lower:
            return self.mask_phone(value)
        elif 'credit' in field_lower or 'card' in field_lower:
            return self.mask_credit_card(value)
        elif any(pii_field in field_lower for pii_field in pii_fields):
            return self.mask_generic(value)
        
        return value

class DataAccessController:
    """Control data access based on roles and permissions"""
    
    def __init__(self):
        self.role_permissions = {
            'admin': {
                'can_access_all': True,
                'can_export': True,
                'can_delete': True,
                'data_classifications': [
                    DataClassification.PUBLIC,
                    DataClassification.INTERNAL,
                    DataClassification.CONFIDENTIAL,
                    DataClassification.RESTRICTED
                ]
            },
            'analyst': {
                'can_access_all': False,
                'can_export': True,
                'can_delete': False,
                'data_classifications': [
                    DataClassification.PUBLIC,
                    DataClassification.INTERNAL,
                    DataClassification.CONFIDENTIAL
                ]
            },
            'user': {
                'can_access_all': False,
                'can_export': False,
                'can_delete': False,
                'data_classifications': [
                    DataClassification.PUBLIC,
                    DataClassification.INTERNAL
                ]
            },
            'guest': {
                'can_access_all': False,
                'can_export': False,
                'can_delete': False,
                'data_classifications': [
                    DataClassification.PUBLIC
                ]
            }
        }
    
    def check_access(self, 
                    user_role: str, 
                    data_classification: DataClassification,
                    operation: str = 'read') -> bool:
        """Check if user has access to data"""
        permissions = self.role_permissions.get(user_role, {})
        
        # Check classification access
        allowed_classifications = permissions.get('data_classifications', [])
        if data_classification not in allowed_classifications:
            return False
        
        # Check operation permissions
        if operation == 'export' and not permissions.get('can_export', False):
            return False
        
        if operation == 'delete' and not permissions.get('can_delete', False):
            return False
        
        return True
    
    def get_accessible_data(self, user_role: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Filter data based on user role"""
        permissions = self.role_permissions.get(user_role, {})
        
        if permissions.get('can_access_all', False):
            return data
        
        # Filter based on data classification
        # This would need to be implemented based on your data structure
        return data  # Simplified for example

class AuditLogger:
    """Audit logging for data governance"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.audit_logs = []
    
    async def log_data_access(self, access: DataAccess):
        """Log data access event"""
        try:
            audit_entry = {
                'event_type': 'data_access',
                'access_id': access.access_id,
                'user_id': access.user_id,
                'data_type': access.data_type,
                'purpose': access.access_purpose.value,
                'timestamp': access.timestamp.isoformat(),
                'ip_address': access.ip_address,
                'user_agent': access.user_agent,
                'success': access.success,
                'details': access.details
            }
            
            # Store in memory
            self.audit_logs.append(audit_entry)
            if len(self.audit_logs) > 10000:
                self.audit_logs = self.audit_logs[-10000:]
            
            # Store in Redis
            if self.redis_client:
                audit_key = f"pathwayiq:audit:data_access:{access.access_id}"
                self.redis_client.setex(
                    audit_key,
                    86400 * 90,  # 90 days retention
                    json.dumps(audit_entry)
                )
            
            logger.info(f"Data access logged: {access.access_id}")
            
        except Exception as e:
            logger.error(f"Error logging data access: {e}")
    
    async def log_data_modification(self, 
                                  user_id: str,
                                  data_type: str,
                                  operation: str,
                                  record_id: str,
                                  changes: Dict[str, Any],
                                  ip_address: str):
        """Log data modification event"""
        try:
            modification_id = str(uuid.uuid4())
            audit_entry = {
                'event_type': 'data_modification',
                'modification_id': modification_id,
                'user_id': user_id,
                'data_type': data_type,
                'operation': operation,
                'record_id': record_id,
                'changes': changes,
                'timestamp': datetime.utcnow().isoformat(),
                'ip_address': ip_address
            }
            
            # Store in memory
            self.audit_logs.append(audit_entry)
            if len(self.audit_logs) > 10000:
                self.audit_logs = self.audit_logs[-10000:]
            
            # Store in Redis
            if self.redis_client:
                audit_key = f"pathwayiq:audit:modification:{modification_id}"
                self.redis_client.setex(
                    audit_key,
                    86400 * 365,  # 1 year retention for modifications
                    json.dumps(audit_entry)
                )
            
            logger.info(f"Data modification logged: {modification_id}")
            
        except Exception as e:
            logger.error(f"Error logging data modification: {e}")
    
    def get_audit_summary(self, days: int = 7) -> Dict[str, Any]:
        """Get audit summary for specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        recent_logs = [
            log for log in self.audit_logs
            if datetime.fromisoformat(log['timestamp']) > cutoff_date
        ]
        
        summary = {
            'total_events': len(recent_logs),
            'access_events': len([l for l in recent_logs if l['event_type'] == 'data_access']),
            'modification_events': len([l for l in recent_logs if l['event_type'] == 'data_modification']),
            'unique_users': len(set(l['user_id'] for l in recent_logs)),
            'data_types_accessed': list(set(l['data_type'] for l in recent_logs)),
            'period_days': days
        }
        
        return summary

class DataRetentionManager:
    """Manage data retention policies"""
    
    def __init__(self):
        self.retention_policies = {
            'user_sessions': RetentionPeriod.THIRTY_DAYS,
            'user_progress': RetentionPeriod.THREE_YEARS,
            'assessment_results': RetentionPeriod.SEVEN_YEARS,
            'audit_logs': RetentionPeriod.ONE_YEAR,
            'system_logs': RetentionPeriod.NINETY_DAYS,
            'user_profiles': RetentionPeriod.PERMANENT
        }
    
    def should_retain(self, data_type: str, created_date: datetime) -> bool:
        """Check if data should be retained"""
        retention_period = self.retention_policies.get(data_type, RetentionPeriod.ONE_YEAR)
        
        if retention_period == RetentionPeriod.PERMANENT:
            return True
        
        days_old = (datetime.utcnow() - created_date).days
        return days_old < retention_period.value
    
    async def cleanup_expired_data(self) -> Dict[str, int]:
        """Clean up expired data (placeholder for actual implementation)"""
        cleanup_results = {}
        
        for data_type, retention_period in self.retention_policies.items():
            if retention_period == RetentionPeriod.PERMANENT:
                continue
            
            # This would need to be implemented with actual database queries
            # cleanup_results[data_type] = await self._cleanup_data_type(data_type, retention_period)
            cleanup_results[data_type] = 0  # Placeholder
        
        return cleanup_results

class DataGovernanceFramework:
    """Main data governance framework"""
    
    def __init__(self, redis_client=None):
        self.config = DataGovernanceConfig()
        self.pii_detector = PIIDetector()
        self.data_masker = DataMasker()
        self.access_controller = DataAccessController()
        self.audit_logger = AuditLogger(redis_client)
        self.retention_manager = DataRetentionManager()
        self.schemas = {}
    
    def register_schema(self, schema: DataSchema):
        """Register a data schema"""
        self.schemas[schema.name] = schema
        logger.info(f"Data schema registered: {schema.name} v{schema.version}")
    
    async def process_data_request(self,
                                 user_id: str,
                                 user_role: str,
                                 data_type: str,
                                 data: Dict[str, Any],
                                 purpose: DataProcessingPurpose,
                                 ip_address: str,
                                 user_agent: str) -> Dict[str, Any]:
        """Process data request with governance controls"""
        
        # Get schema for data type
        schema = self.schemas.get(data_type)
        if not schema:
            raise ValueError(f"No schema registered for data type: {data_type}")
        
        # Check access permissions
        if not self.access_controller.check_access(user_role, schema.classification):
            access = DataAccess(
                access_id=str(uuid.uuid4()),
                user_id=user_id,
                data_type=data_type,
                access_purpose=purpose,
                timestamp=datetime.utcnow(),
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
                details={'reason': 'Insufficient permissions'}
            )
            await self.audit_logger.log_data_access(access)
            raise PermissionError("Access denied: insufficient permissions")
        
        # Apply data masking if needed
        processed_data = data
        if schema.sensitivity in [DataSensitivity.HIGH, DataSensitivity.CRITICAL]:
            if user_role not in ['admin']:
                processed_data = self.data_masker.mask_data(data)
        
        # Log access
        access = DataAccess(
            access_id=str(uuid.uuid4()),
            user_id=user_id,
            data_type=data_type,
            access_purpose=purpose,
            timestamp=datetime.utcnow(),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
            details={'records_accessed': len(processed_data) if isinstance(processed_data, list) else 1}
        )
        await self.audit_logger.log_data_access(access)
        
        return processed_data
    
    async def scan_for_pii(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Scan data for PII"""
        return self.pii_detector.scan_dict(data)
    
    def get_governance_status(self) -> Dict[str, Any]:
        """Get governance framework status"""
        return {
            'schemas_registered': len(self.schemas),
            'config': {
                'audit_logging_enabled': self.config.enable_audit_logging,
                'data_masking_enabled': self.config.enable_data_masking,
                'encryption_enabled': self.config.enable_encryption_at_rest,
                'access_control_enabled': self.config.enable_access_control
            },
            'audit_summary': self.audit_logger.get_audit_summary(),
            'retention_policies': {
                name: period.value for name, period in self.retention_manager.retention_policies.items()
            }
        }

# Default schemas for PathwayIQ
def initialize_default_schemas(governance: DataGovernanceFramework):
    """Initialize default data schemas"""
    
    # User profile schema
    user_profile_schema = DataSchema(
        name="user_profile",
        version="1.0",
        classification=DataClassification.CONFIDENTIAL,
        sensitivity=DataSensitivity.HIGH,
        retention_period=RetentionPeriod.PERMANENT,
        processing_purposes=[
            DataProcessingPurpose.AUTHENTICATION,
            DataProcessingPurpose.PERSONALIZATION
        ],
        fields={
            "user_id": {"type": "string", "pii": False},
            "email": {"type": "string", "pii": True},
            "username": {"type": "string", "pii": False},
            "first_name": {"type": "string", "pii": True},
            "last_name": {"type": "string", "pii": True},
            "created_at": {"type": "datetime", "pii": False},
            "last_login": {"type": "datetime", "pii": False}
        }
    )
    
    # Assessment results schema
    assessment_schema = DataSchema(
        name="assessment_results",
        version="1.0",
        classification=DataClassification.CONFIDENTIAL,
        sensitivity=DataSensitivity.MEDIUM,
        retention_period=RetentionPeriod.SEVEN_YEARS,
        processing_purposes=[
            DataProcessingPurpose.PERSONALIZATION,
            DataProcessingPurpose.ANALYTICS,
            DataProcessingPurpose.RESEARCH
        ],
        fields={
            "session_id": {"type": "string", "pii": False},
            "user_id": {"type": "string", "pii": False},
            "results": {"type": "object", "pii": False},
            "timestamp": {"type": "datetime", "pii": False}
        }
    )
    
    # Analytics data schema
    analytics_schema = DataSchema(
        name="analytics_data",
        version="1.0",
        classification=DataClassification.INTERNAL,
        sensitivity=DataSensitivity.LOW,
        retention_period=RetentionPeriod.ONE_YEAR,
        processing_purposes=[
            DataProcessingPurpose.ANALYTICS,
            DataProcessingPurpose.RESEARCH
        ],
        fields={
            "event_id": {"type": "string", "pii": False},
            "user_id": {"type": "string", "pii": False},
            "event_type": {"type": "string", "pii": False},
            "properties": {"type": "object", "pii": False},
            "timestamp": {"type": "datetime", "pii": False}
        }
    )
    
    governance.register_schema(user_profile_schema)
    governance.register_schema(assessment_schema)
    governance.register_schema(analytics_schema)

# Global instance
data_governance = DataGovernanceFramework()

logger.info("✅ Advanced Data Governance Framework initialized")