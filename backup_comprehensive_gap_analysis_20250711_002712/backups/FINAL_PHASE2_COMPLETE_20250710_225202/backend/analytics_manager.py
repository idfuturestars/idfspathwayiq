"""
Advanced Analytics Dashboard for PathwayIQ
Phase 2.2: Technical Infrastructure

Chief Technical Architect Implementation
"""

import mixpanel
import asyncio
import json
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
from collections import defaultdict, deque
import hashlib
import uuid

logger = structlog.get_logger()

class EventType(Enum):
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    ASSESSMENT_START = "assessment_start"
    ASSESSMENT_COMPLETE = "assessment_complete"
    QUESTION_ANSWERED = "question_answered"
    AI_INTERACTION = "ai_interaction"
    LEARNING_PATH_VIEW = "learning_path_view"
    ACHIEVEMENT_EARNED = "achievement_earned"
    PAGE_VIEW = "page_view"
    ERROR_OCCURRED = "error_occurred"
    PERFORMANCE_METRIC = "performance_metric"

class AnalyticsProvider(Enum):
    MIXPANEL = "mixpanel"
    INTERNAL = "internal"
    GOOGLE_ANALYTICS = "google_analytics"

@dataclass
class AnalyticsEvent:
    event_type: EventType
    user_id: Optional[str]
    session_id: str
    timestamp: datetime
    properties: Dict[str, Any]
    device_info: Optional[Dict[str, str]] = None
    location_info: Optional[Dict[str, str]] = None

@dataclass
class AnalyticsConfiguration:
    mixpanel_token: Optional[str] = None
    google_analytics_id: Optional[str] = None
    enable_internal_analytics: bool = True
    data_retention_days: int = 90
    batch_size: int = 100
    flush_interval: int = 60  # seconds

class AdvancedAnalyticsManager:
    """Advanced analytics with multiple providers and real-time insights"""
    
    def __init__(self, config: AnalyticsConfiguration):
        self.config = config
        self.mixpanel_client = None
        self.event_queue = deque(maxlen=10000)
        self.analytics_cache = {}
        self.real_time_metrics = defaultdict(int)
        self.user_sessions = {}
        
        # Analytics storage
        self.events_today = defaultdict(int)
        self.user_metrics = defaultdict(dict)
        self.performance_metrics = []
        
    async def initialize(self):
        """Initialize analytics providers"""
        try:
            # Initialize Mixpanel
            if self.config.mixpanel_token:
                self.mixpanel_client = mixpanel.Mixpanel(self.config.mixpanel_token)
                logger.info("✅ Mixpanel analytics initialized")
            
            # Initialize internal analytics
            if self.config.enable_internal_analytics:
                logger.info("✅ Internal analytics initialized")
            
            # Start background tasks
            asyncio.create_task(self._flush_events_periodically())
            asyncio.create_task(self._generate_insights_periodically())
            
            logger.info("✅ Advanced Analytics Manager initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize analytics: {e}")
            raise
    
    async def track_event(self, event: AnalyticsEvent):
        """Track analytics event"""
        try:
            # Add to queue for batch processing
            self.event_queue.append(event)
            
            # Update real-time metrics
            self.real_time_metrics[event.event_type.value] += 1
            self.real_time_metrics['total_events'] += 1
            
            # Track today's events
            today = datetime.utcnow().date()
            self.events_today[f"{today}_{event.event_type.value}"] += 1
            
            # Track user sessions
            if event.user_id:
                if event.user_id not in self.user_sessions:
                    self.user_sessions[event.user_id] = {
                        'start_time': event.timestamp,
                        'last_activity': event.timestamp,
                        'events_count': 0,
                        'session_id': event.session_id
                    }
                
                self.user_sessions[event.user_id]['last_activity'] = event.timestamp
                self.user_sessions[event.user_id]['events_count'] += 1
            
            # Immediate tracking for critical events
            if event.event_type in [EventType.USER_LOGIN, EventType.ERROR_OCCURRED]:
                await self._track_immediately(event)
            
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
    
    async def _track_immediately(self, event: AnalyticsEvent):
        """Track event immediately (for critical events)"""
        try:
            if self.mixpanel_client:
                properties = {
                    **event.properties,
                    'timestamp': event.timestamp.isoformat(),
                    'session_id': event.session_id
                }
                
                if event.device_info:
                    properties.update(event.device_info)
                
                if event.location_info:
                    properties.update(event.location_info)
                
                self.mixpanel_client.track(
                    event.user_id or 'anonymous',
                    event.event_type.value,
                    properties
                )
            
        except Exception as e:
            logger.error(f"Immediate tracking failed: {e}")
    
    async def _flush_events_periodically(self):
        """Flush events to analytics providers periodically"""
        while True:
            try:
                await asyncio.sleep(self.config.flush_interval)
                await self._flush_events()
            except Exception as e:
                logger.error(f"Event flushing error: {e}")
    
    async def _flush_events(self):
        """Flush queued events to analytics providers"""
        if not self.event_queue:
            return
        
        # Get batch of events
        batch = []
        for _ in range(min(self.config.batch_size, len(self.event_queue))):
            if self.event_queue:
                batch.append(self.event_queue.popleft())
        
        if not batch:
            return
        
        try:
            # Send to Mixpanel
            if self.mixpanel_client:
                for event in batch:
                    await self._track_immediately(event)
            
            logger.info(f"✅ Flushed {len(batch)} events to analytics providers")
            
        except Exception as e:
            logger.error(f"Event flushing failed: {e}")
            # Put events back in queue
            for event in reversed(batch):
                self.event_queue.appendleft(event)
    
    async def _generate_insights_periodically(self):
        """Generate insights periodically"""
        while True:
            try:
                await asyncio.sleep(300)  # Every 5 minutes
                await self._generate_real_time_insights()
            except Exception as e:
                logger.error(f"Insights generation error: {e}")
    
    async def _generate_real_time_insights(self):
        """Generate real-time insights"""
        try:
            current_time = datetime.utcnow()
            
            # Active users in last hour
            active_users = len([
                session for session in self.user_sessions.values()
                if (current_time - session['last_activity']).seconds < 3600
            ])
            
            # Popular events in last hour
            recent_events = {}
            for event_key, count in self.real_time_metrics.items():
                if isinstance(count, int) and count > 0:
                    recent_events[event_key] = count
            
            # Generate insights
            insights = {
                'timestamp': current_time.isoformat(),
                'active_users_last_hour': active_users,
                'total_sessions': len(self.user_sessions),
                'events_breakdown': recent_events,
                'top_events': sorted(recent_events.items(), key=lambda x: x[1], reverse=True)[:5]
            }
            
            # Cache insights
            self.analytics_cache['real_time_insights'] = insights
            
        except Exception as e:
            logger.error(f"Real-time insights generation failed: {e}")
    
    async def get_user_analytics(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """Get analytics for specific user"""
        try:
            user_events = []
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Filter events for user
            for event in list(self.event_queue):
                if event.user_id == user_id and event.timestamp > cutoff_date:
                    user_events.append(event)
            
            # Calculate user metrics
            total_events = len(user_events)
            session_info = self.user_sessions.get(user_id, {})
            
            event_breakdown = defaultdict(int)
            for event in user_events:
                event_breakdown[event.event_type.value] += 1
            
            return {
                'user_id': user_id,
                'period_days': days,
                'total_events': total_events,
                'event_breakdown': dict(event_breakdown),
                'session_info': session_info,
                'engagement_score': self._calculate_engagement_score(user_events)
            }
            
        except Exception as e:
            logger.error(f"User analytics failed: {e}")
            return {'error': str(e)}
    
    def _calculate_engagement_score(self, events: List[AnalyticsEvent]) -> float:
        """Calculate user engagement score"""
        if not events:
            return 0.0
        
        # Weight different event types
        event_weights = {
            EventType.USER_LOGIN: 1.0,
            EventType.ASSESSMENT_START: 2.0,
            EventType.ASSESSMENT_COMPLETE: 3.0,
            EventType.QUESTION_ANSWERED: 1.5,
            EventType.AI_INTERACTION: 2.0,
            EventType.ACHIEVEMENT_EARNED: 3.0,
            EventType.PAGE_VIEW: 0.5
        }
        
        total_score = 0
        for event in events:
            weight = event_weights.get(event.event_type, 1.0)
            total_score += weight
        
        # Normalize by time period (events per day)
        if len(events) > 0:
            time_span = (events[-1].timestamp - events[0].timestamp).days or 1
            return round(total_score / time_span, 2)
        
        return total_score
    
    async def get_platform_analytics(self, days: int = 7) -> Dict[str, Any]:
        """Get platform-wide analytics"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Overall metrics
            total_users = len(self.user_sessions)
            total_events = sum(self.real_time_metrics.values())
            
            # Active users
            active_users = len([
                session for session in self.user_sessions.values()
                if session['last_activity'] > cutoff_date
            ])
            
            # Event breakdown
            event_breakdown = dict(self.real_time_metrics)
            
            # Calculate trends
            daily_events = defaultdict(int)
            for event in list(self.event_queue):
                if event.timestamp > cutoff_date:
                    day = event.timestamp.date()
                    daily_events[str(day)] += 1
            
            return {
                'period_days': days,
                'total_users': total_users,
                'active_users': active_users,
                'total_events': total_events,
                'event_breakdown': event_breakdown,
                'daily_events': dict(daily_events),
                'user_retention': self._calculate_retention_rate(),
                'avg_session_duration': self._calculate_avg_session_duration()
            }
            
        except Exception as e:
            logger.error(f"Platform analytics failed: {e}")
            return {'error': str(e)}
    
    def _calculate_retention_rate(self) -> float:
        """Calculate user retention rate"""
        if len(self.user_sessions) < 2:
            return 0.0
        
        # Users active in last 7 days vs last 30 days
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        active_week = len([
            s for s in self.user_sessions.values()
            if s['last_activity'] > week_ago
        ])
        
        active_month = len([
            s for s in self.user_sessions.values()
            if s['last_activity'] > month_ago
        ])
        
        if active_month == 0:
            return 0.0
        
        return round((active_week / active_month) * 100, 2)
    
    def _calculate_avg_session_duration(self) -> float:
        """Calculate average session duration in minutes"""
        durations = []
        
        for session in self.user_sessions.values():
            if 'start_time' in session and 'last_activity' in session:
                duration = (session['last_activity'] - session['start_time']).total_seconds() / 60
                durations.append(duration)
        
        if not durations:
            return 0.0
        
        return round(sum(durations) / len(durations), 2)
    
    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get real-time metrics"""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'metrics': dict(self.real_time_metrics),
            'insights': self.analytics_cache.get('real_time_insights', {}),
            'queue_size': len(self.event_queue),
            'active_sessions': len(self.user_sessions)
        }
    
    async def create_custom_funnel(self, funnel_name: str, steps: List[EventType]) -> Dict[str, Any]:
        """Create custom conversion funnel"""
        try:
            funnel_data = {
                'name': funnel_name,
                'steps': [step.value for step in steps],
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Calculate funnel metrics from current data
            user_progressions = defaultdict(list)
            
            for event in list(self.event_queue):
                if event.event_type in steps and event.user_id:
                    user_progressions[event.user_id].append({
                        'step': event.event_type.value,
                        'timestamp': event.timestamp
                    })
            
            # Calculate conversion rates
            step_counts = [0] * len(steps)
            for user_id, events in user_progressions.items():
                user_steps = [e['step'] for e in sorted(events, key=lambda x: x['timestamp'])]
                
                for i, step in enumerate(steps):
                    if step.value in user_steps:
                        step_counts[i] += 1
            
            # Calculate conversion rates
            conversions = []
            for i, count in enumerate(step_counts):
                if i == 0:
                    conversion_rate = 100.0 if count > 0 else 0.0
                else:
                    conversion_rate = (count / step_counts[0] * 100) if step_counts[0] > 0 else 0.0
                
                conversions.append({
                    'step': steps[i].value,
                    'users': count,
                    'conversion_rate': round(conversion_rate, 2)
                })
            
            funnel_data['conversions'] = conversions
            
            return funnel_data
            
        except Exception as e:
            logger.error(f"Funnel creation failed: {e}")
            return {'error': str(e)}

class AnalyticsEventBuilder:
    """Builder for analytics events"""
    
    @staticmethod
    def user_login_event(user_id: str, session_id: str, login_method: str = 'email') -> AnalyticsEvent:
        return AnalyticsEvent(
            event_type=EventType.USER_LOGIN,
            user_id=user_id,
            session_id=session_id,
            timestamp=datetime.utcnow(),
            properties={
                'login_method': login_method,
                'user_type': 'registered'
            }
        )
    
    @staticmethod
    def assessment_event(user_id: str, session_id: str, assessment_type: str, action: str, **kwargs) -> AnalyticsEvent:
        event_type = EventType.ASSESSMENT_START if action == 'start' else EventType.ASSESSMENT_COMPLETE
        
        return AnalyticsEvent(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            timestamp=datetime.utcnow(),
            properties={
                'assessment_type': assessment_type,
                'action': action,
                **kwargs
            }
        )
    
    @staticmethod
    def ai_interaction_event(user_id: str, session_id: str, interaction_type: str, **kwargs) -> AnalyticsEvent:
        return AnalyticsEvent(
            event_type=EventType.AI_INTERACTION,
            user_id=user_id,
            session_id=session_id,
            timestamp=datetime.utcnow(),
            properties={
                'interaction_type': interaction_type,
                **kwargs
            }
        )
    
    @staticmethod
    def page_view_event(user_id: Optional[str], session_id: str, page: str, **kwargs) -> AnalyticsEvent:
        return AnalyticsEvent(
            event_type=EventType.PAGE_VIEW,
            user_id=user_id,
            session_id=session_id,
            timestamp=datetime.utcnow(),
            properties={
                'page': page,
                **kwargs
            }
        )

# Global analytics manager
analytics_manager = None

def initialize_analytics_manager(config: AnalyticsConfiguration) -> AdvancedAnalyticsManager:
    """Initialize global analytics manager"""
    global analytics_manager
    analytics_manager = AdvancedAnalyticsManager(config)
    return analytics_manager

logger.info("✅ Advanced Analytics Dashboard System initialized")