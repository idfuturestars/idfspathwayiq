"""
Advanced Personalization Algorithms for PathwayIQ
Phase 2.3: AI/ML Enhancements

Chief Technical Architect Implementation
"""

import asyncio
import json
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import hashlib

logger = structlog.get_logger()

class LearningStyleType(Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"
    MULTIMODAL = "multimodal"

class PersonalityType(Enum):
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    PRACTICAL = "practical"
    SOCIAL = "social"
    COMPETITIVE = "competitive"

class DifficultyPreference(Enum):
    EASY_FIRST = "easy_first"
    GRADUAL_INCREASE = "gradual_increase"
    CHALLENGE_SEEKER = "challenge_seeker"
    MIXED_APPROACH = "mixed_approach"

@dataclass
class LearnerProfile:
    user_id: str
    learning_style: LearningStyleType
    personality_type: PersonalityType
    difficulty_preference: DifficultyPreference
    strengths: List[str]
    weaknesses: List[str]
    interests: List[str]
    optimal_session_length: int  # minutes
    preferred_study_time: str  # morning, afternoon, evening
    attention_span: int  # minutes
    motivation_triggers: List[str]
    learning_pace: float  # 0.5-2.0 multiplier
    confidence_level: float  # 0.0-1.0
    created_at: datetime
    updated_at: datetime

@dataclass
class ContentRecommendation:
    content_id: str
    content_type: str
    title: str
    description: str
    difficulty_level: float
    estimated_time: int
    relevance_score: float
    personalization_factors: List[str]
    learning_objectives: List[str]

@dataclass
class LearningPathStep:
    step_id: str
    title: str
    description: str
    content_recommendations: List[ContentRecommendation]
    prerequisites: List[str]
    estimated_completion_time: int
    difficulty_progression: float
    mastery_threshold: float

class AdvancedPersonalizationEngine:
    """Advanced personalization using machine learning and behavioral analysis"""
    
    def __init__(self):
        self.user_profiles = {}
        self.content_embeddings = {}
        self.interaction_matrix = {}
        self.learning_patterns = {}
        self.personalization_cache = {}
        
    async def create_learner_profile(self, 
                                   user_id: str,
                                   assessment_results: Dict[str, Any],
                                   behavioral_data: Dict[str, Any]) -> LearnerProfile:
        """Create comprehensive learner profile using assessment and behavioral data"""
        try:
            # Analyze learning style from assessment
            learning_style = self._determine_learning_style(assessment_results)
            
            # Determine personality type from interaction patterns
            personality_type = self._determine_personality_type(behavioral_data)
            
            # Analyze difficulty preference
            difficulty_preference = self._determine_difficulty_preference(assessment_results)
            
            # Extract strengths and weaknesses
            strengths, weaknesses = self._analyze_competencies(assessment_results)
            
            # Determine interests from engagement patterns
            interests = self._extract_interests(behavioral_data)
            
            # Calculate optimal session parameters
            optimal_session_length = self._calculate_optimal_session_length(behavioral_data)
            attention_span = self._calculate_attention_span(behavioral_data)
            
            # Determine preferred study time
            preferred_study_time = self._determine_preferred_study_time(behavioral_data)
            
            # Identify motivation triggers
            motivation_triggers = self._identify_motivation_triggers(behavioral_data)
            
            # Calculate learning pace and confidence
            learning_pace = self._calculate_learning_pace(assessment_results)
            confidence_level = self._calculate_confidence_level(assessment_results)
            
            profile = LearnerProfile(
                user_id=user_id,
                learning_style=learning_style,
                personality_type=personality_type,
                difficulty_preference=difficulty_preference,
                strengths=strengths,
                weaknesses=weaknesses,
                interests=interests,
                optimal_session_length=optimal_session_length,
                preferred_study_time=preferred_study_time,
                attention_span=attention_span,
                motivation_triggers=motivation_triggers,
                learning_pace=learning_pace,
                confidence_level=confidence_level,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            self.user_profiles[user_id] = profile
            logger.info(f"✅ Learner profile created for user {user_id}")
            
            return profile
            
        except Exception as e:
            logger.error(f"Failed to create learner profile: {e}")
            raise
    
    def _determine_learning_style(self, assessment_results: Dict[str, Any]) -> LearningStyleType:
        """Determine learning style from assessment responses"""
        visual_score = 0
        auditory_score = 0
        kinesthetic_score = 0
        reading_score = 0
        
        # Analyze response patterns for learning style indicators
        for response in assessment_results.get('responses', []):
            question_type = response.get('question_type', '')
            time_spent = response.get('time_spent', 0)
            confidence = response.get('confidence', 0)
            
            if 'visual' in question_type or 'diagram' in question_type:
                visual_score += confidence * (1 / max(time_spent, 1))
            elif 'audio' in question_type or 'listening' in question_type:
                auditory_score += confidence * (1 / max(time_spent, 1))
            elif 'hands-on' in question_type or 'interactive' in question_type:
                kinesthetic_score += confidence * (1 / max(time_spent, 1))
            elif 'text' in question_type or 'reading' in question_type:
                reading_score += confidence * (1 / max(time_spent, 1))
        
        scores = {
            LearningStyleType.VISUAL: visual_score,
            LearningStyleType.AUDITORY: auditory_score,
            LearningStyleType.KINESTHETIC: kinesthetic_score,
            LearningStyleType.READING_WRITING: reading_score
        }
        
        # Check if multimodal (balanced across styles)
        max_score = max(scores.values())
        high_scores = [style for style, score in scores.items() if score > max_score * 0.8]
        
        if len(high_scores) >= 2:
            return LearningStyleType.MULTIMODAL
        
        return max(scores, key=scores.get)
    
    def _determine_personality_type(self, behavioral_data: Dict[str, Any]) -> PersonalityType:
        """Determine personality type from behavioral patterns"""
        analytical_score = 0
        creative_score = 0
        practical_score = 0
        social_score = 0
        competitive_score = 0
        
        # Analyze interaction patterns
        if 'session_data' in behavioral_data:
            for session in behavioral_data['session_data']:
                # Analytical: detailed exploration, methodical approach
                if session.get('exploration_depth', 0) > 0.7:
                    analytical_score += 1
                
                # Creative: diverse content consumption, innovative approaches
                if session.get('content_diversity', 0) > 0.6:
                    creative_score += 1
                
                # Practical: focus on applicable skills, quick implementation
                if session.get('practical_focus', 0) > 0.8:
                    practical_score += 1
                
                # Social: collaboration features usage, group activities
                if session.get('social_interactions', 0) > 0:
                    social_score += 1
                
                # Competitive: rankings focus, challenge completion
                if session.get('competitive_activities', 0) > 0:
                    competitive_score += 1
        
        scores = {
            PersonalityType.ANALYTICAL: analytical_score,
            PersonalityType.CREATIVE: creative_score,
            PersonalityType.PRACTICAL: practical_score,
            PersonalityType.SOCIAL: social_score,
            PersonalityType.COMPETITIVE: competitive_score
        }
        
        return max(scores, key=scores.get)
    
    def _determine_difficulty_preference(self, assessment_results: Dict[str, Any]) -> DifficultyPreference:
        """Determine difficulty preference from assessment performance"""
        responses = assessment_results.get('responses', [])
        if not responses:
            return DifficultyPreference.GRADUAL_INCREASE
        
        correct_easy = sum(1 for r in responses if r.get('difficulty', 0) < 0.3 and r.get('correct', False))
        correct_medium = sum(1 for r in responses if 0.3 <= r.get('difficulty', 0) < 0.7 and r.get('correct', False))
        correct_hard = sum(1 for r in responses if r.get('difficulty', 0) >= 0.7 and r.get('correct', False))
        
        total_easy = sum(1 for r in responses if r.get('difficulty', 0) < 0.3)
        total_medium = sum(1 for r in responses if 0.3 <= r.get('difficulty', 0) < 0.7)
        total_hard = sum(1 for r in responses if r.get('difficulty', 0) >= 0.7)
        
        easy_rate = correct_easy / max(total_easy, 1)
        medium_rate = correct_medium / max(total_medium, 1)
        hard_rate = correct_hard / max(total_hard, 1)
        
        if hard_rate > 0.6:
            return DifficultyPreference.CHALLENGE_SEEKER
        elif easy_rate > 0.9 and medium_rate < 0.6:
            return DifficultyPreference.EASY_FIRST
        elif abs(easy_rate - medium_rate) < 0.2 and abs(medium_rate - hard_rate) < 0.2:
            return DifficultyPreference.MIXED_APPROACH
        else:
            return DifficultyPreference.GRADUAL_INCREASE
    
    def _analyze_competencies(self, assessment_results: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        """Extract strengths and weaknesses from assessment results"""
        topic_performance = {}
        
        for response in assessment_results.get('responses', []):
            topic = response.get('topic', 'general')
            correct = response.get('correct', False)
            difficulty = response.get('difficulty', 0.5)
            
            if topic not in topic_performance:
                topic_performance[topic] = {'correct': 0, 'total': 0, 'weighted_score': 0}
            
            topic_performance[topic]['total'] += 1
            if correct:
                topic_performance[topic]['correct'] += 1
                topic_performance[topic]['weighted_score'] += difficulty
        
        # Calculate strength and weakness scores
        topic_scores = {}
        for topic, perf in topic_performance.items():
            if perf['total'] > 0:
                accuracy = perf['correct'] / perf['total']
                complexity_bonus = perf['weighted_score'] / perf['total']
                topic_scores[topic] = accuracy + complexity_bonus * 0.5
        
        # Identify top strengths and weaknesses
        sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
        
        strengths = [topic for topic, score in sorted_topics[:3] if score > 0.7]
        weaknesses = [topic for topic, score in sorted_topics[-3:] if score < 0.4]
        
        return strengths, weaknesses
    
    def _extract_interests(self, behavioral_data: Dict[str, Any]) -> List[str]:
        """Extract interests from engagement patterns"""
        interests = []
        
        if 'content_engagement' in behavioral_data:
            engagement_data = behavioral_data['content_engagement']
            
            # Sort by engagement time and interaction frequency
            sorted_content = sorted(
                engagement_data.items(),
                key=lambda x: x[1].get('time_spent', 0) * x[1].get('interactions', 1),
                reverse=True
            )
            
            # Extract top interests
            for content_type, metrics in sorted_content[:5]:
                if metrics.get('time_spent', 0) > 300:  # More than 5 minutes
                    interests.append(content_type)
        
        return interests
    
    def _calculate_optimal_session_length(self, behavioral_data: Dict[str, Any]) -> int:
        """Calculate optimal session length based on engagement patterns"""
        session_lengths = []
        
        if 'session_data' in behavioral_data:
            for session in behavioral_data['session_data']:
                length = session.get('duration', 0)
                engagement = session.get('engagement_score', 0)
                
                # Only consider sessions with good engagement
                if engagement > 0.6 and length > 0:
                    session_lengths.append(length)
        
        if session_lengths:
            # Return median of successful sessions
            session_lengths.sort()
            median_idx = len(session_lengths) // 2
            return int(session_lengths[median_idx] / 60)  # Convert to minutes
        
        return 30  # Default 30 minutes
    
    def _calculate_attention_span(self, behavioral_data: Dict[str, Any]) -> int:
        """Calculate attention span from engagement decay patterns"""
        attention_spans = []
        
        if 'engagement_timeline' in behavioral_data:
            for timeline in behavioral_data['engagement_timeline']:
                # Find point where engagement drops significantly
                peak_engagement = max(timeline)
                drop_threshold = peak_engagement * 0.7
                
                for i, engagement in enumerate(timeline):
                    if engagement < drop_threshold:
                        attention_spans.append(i)  # Minutes into session
                        break
        
        if attention_spans:
            return int(np.mean(attention_spans))
        
        return 20  # Default 20 minutes
    
    def _determine_preferred_study_time(self, behavioral_data: Dict[str, Any]) -> str:
        """Determine preferred study time from session timestamps"""
        time_performance = {'morning': [], 'afternoon': [], 'evening': []}
        
        if 'session_data' in behavioral_data:
            for session in behavioral_data['session_data']:
                start_time = session.get('start_time')
                performance = session.get('performance_score', 0)
                
                if start_time and performance > 0:
                    hour = datetime.fromisoformat(start_time).hour
                    
                    if 6 <= hour < 12:
                        time_performance['morning'].append(performance)
                    elif 12 <= hour < 18:
                        time_performance['afternoon'].append(performance)
                    else:
                        time_performance['evening'].append(performance)
        
        # Calculate average performance for each time period
        avg_performance = {}
        for period, scores in time_performance.items():
            if scores:
                avg_performance[period] = np.mean(scores)
            else:
                avg_performance[period] = 0
        
        return max(avg_performance, key=avg_performance.get)
    
    def _identify_motivation_triggers(self, behavioral_data: Dict[str, Any]) -> List[str]:
        """Identify what motivates the learner"""
        triggers = []
        
        # Analyze engagement spikes
        if 'motivation_events' in behavioral_data:
            for event in behavioral_data['motivation_events']:
                event_type = event.get('type')
                engagement_increase = event.get('engagement_increase', 0)
                
                if engagement_increase > 0.2:  # Significant increase
                    triggers.append(event_type)
        
        # Default motivators if no data
        if not triggers:
            triggers = ['achievement_badges', 'progress_tracking', 'peer_comparison']
        
        return list(set(triggers))  # Remove duplicates
    
    def _calculate_learning_pace(self, assessment_results: Dict[str, Any]) -> float:
        """Calculate learning pace from assessment completion times"""
        completion_times = []
        
        for response in assessment_results.get('responses', []):
            expected_time = response.get('expected_time', 60)
            actual_time = response.get('time_spent', 60)
            correct = response.get('correct', False)
            
            # Only consider correct responses for pace calculation
            if correct and actual_time > 0:
                pace_ratio = expected_time / actual_time
                completion_times.append(pace_ratio)
        
        if completion_times:
            avg_pace = np.mean(completion_times)
            return max(0.5, min(2.0, avg_pace))  # Clamp between 0.5x and 2.0x
        
        return 1.0  # Default normal pace
    
    def _calculate_confidence_level(self, assessment_results: Dict[str, Any]) -> float:
        """Calculate confidence level from self-reported confidence and performance"""
        confidence_scores = []
        
        for response in assessment_results.get('responses', []):
            reported_confidence = response.get('confidence', 0.5)
            correct = response.get('correct', False)
            
            # Confidence accuracy: how well confidence matches performance
            actual_performance = 1.0 if correct else 0.0
            confidence_accuracy = 1.0 - abs(reported_confidence - actual_performance)
            
            confidence_scores.append(confidence_accuracy)
        
        if confidence_scores:
            return np.mean(confidence_scores)
        
        return 0.5  # Default moderate confidence
    
    async def generate_personalized_learning_path(self, 
                                                 user_id: str,
                                                 learning_objectives: List[str],
                                                 time_constraint: Optional[int] = None) -> List[LearningPathStep]:
        """Generate personalized learning path based on user profile"""
        try:
            if user_id not in self.user_profiles:
                raise ValueError(f"No profile found for user {user_id}")
            
            profile = self.user_profiles[user_id]
            
            # Generate content recommendations for each objective
            learning_path = []
            
            for i, objective in enumerate(learning_objectives):
                # Get personalized content recommendations
                recommendations = await self._get_personalized_content(
                    profile, objective, position=i
                )
                
                # Calculate difficulty progression based on user preference
                difficulty_progression = self._calculate_difficulty_progression(
                    profile.difficulty_preference, i, len(learning_objectives)
                )
                
                # Estimate completion time based on user pace
                estimated_time = self._estimate_completion_time(
                    recommendations, profile.learning_pace, profile.optimal_session_length
                )
                
                step = LearningPathStep(
                    step_id=f"step_{i+1}_{hashlib.md5(objective.encode()).hexdigest()[:8]}",
                    title=f"Master {objective}",
                    description=f"Personalized pathway to master {objective} based on your learning style",
                    content_recommendations=recommendations,
                    prerequisites=learning_objectives[:i],  # Previous objectives as prerequisites
                    estimated_completion_time=estimated_time,
                    difficulty_progression=difficulty_progression,
                    mastery_threshold=0.8  # 80% mastery threshold
                )
                
                learning_path.append(step)
            
            # Optimize path based on time constraints
            if time_constraint:
                learning_path = self._optimize_path_for_time(learning_path, time_constraint)
            
            logger.info(f"✅ Generated personalized learning path for user {user_id}")
            return learning_path
            
        except Exception as e:
            logger.error(f"Failed to generate personalized learning path: {e}")
            raise
    
    async def _get_personalized_content(self, 
                                      profile: LearnerProfile,
                                      objective: str,
                                      position: int) -> List[ContentRecommendation]:
        """Get personalized content recommendations for an objective"""
        recommendations = []
        
        # Mock content database (in real implementation, this would query actual content)
        content_database = {
            'javascript': [
                {
                    'id': 'js_basics_visual',
                    'type': 'video',
                    'title': 'JavaScript Fundamentals - Visual Guide',
                    'description': 'Interactive visual guide to JavaScript basics',
                    'difficulty': 0.3,
                    'time': 45,
                    'tags': ['visual', 'beginner', 'interactive']
                },
                {
                    'id': 'js_basics_text',
                    'type': 'article',
                    'title': 'JavaScript Fundamentals - Comprehensive Text',
                    'description': 'Detailed text-based JavaScript tutorial',
                    'difficulty': 0.4,
                    'time': 60,
                    'tags': ['reading', 'comprehensive', 'detailed']
                },
                {
                    'id': 'js_practice',
                    'type': 'exercise',
                    'title': 'JavaScript Hands-on Practice',
                    'description': 'Interactive coding exercises',
                    'difficulty': 0.6,
                    'time': 90,
                    'tags': ['kinesthetic', 'practice', 'coding']
                }
            ],
            'python': [
                {
                    'id': 'py_basics_visual',
                    'type': 'video',
                    'title': 'Python Fundamentals - Visual Learning',
                    'description': 'Visual approach to Python programming',
                    'difficulty': 0.3,
                    'time': 50,
                    'tags': ['visual', 'beginner', 'programming']
                }
            ]
        }
        
        # Find relevant content
        relevant_content = []
        for topic, contents in content_database.items():
            if topic.lower() in objective.lower():
                relevant_content.extend(contents)
        
        # If no specific content found, use general content
        if not relevant_content:
            relevant_content = content_database.get('javascript', [])
        
        # Score and rank content based on user profile
        for content in relevant_content:
            relevance_score = self._calculate_content_relevance(profile, content)
            
            if relevance_score > 0.3:  # Minimum relevance threshold
                recommendation = ContentRecommendation(
                    content_id=content['id'],
                    content_type=content['type'],
                    title=content['title'],
                    description=content['description'],
                    difficulty_level=content['difficulty'],
                    estimated_time=content['time'],
                    relevance_score=relevance_score,
                    personalization_factors=self._get_personalization_factors(profile, content),
                    learning_objectives=[objective]
                )
                recommendations.append(recommendation)
        
        # Sort by relevance score and return top recommendations
        recommendations.sort(key=lambda x: x.relevance_score, reverse=True)
        return recommendations[:3]  # Top 3 recommendations
    
    def _calculate_content_relevance(self, profile: LearnerProfile, content: Dict[str, Any]) -> float:
        """Calculate how relevant content is for the user"""
        relevance_score = 0.5  # Base score
        
        # Learning style match
        content_tags = content.get('tags', [])
        if profile.learning_style.value in content_tags:
            relevance_score += 0.3
        elif profile.learning_style == LearningStyleType.MULTIMODAL:
            # Multimodal learners benefit from diverse content
            relevance_score += 0.1
        
        # Difficulty preference match
        content_difficulty = content.get('difficulty', 0.5)
        if profile.difficulty_preference == DifficultyPreference.EASY_FIRST and content_difficulty < 0.4:
            relevance_score += 0.2
        elif profile.difficulty_preference == DifficultyPreference.CHALLENGE_SEEKER and content_difficulty > 0.7:
            relevance_score += 0.2
        elif profile.difficulty_preference == DifficultyPreference.GRADUAL_INCREASE:
            relevance_score += 0.1  # Gradual increase adapts to any difficulty
        
        # Session length match
        content_time = content.get('time', 30)
        if abs(content_time - profile.optimal_session_length) < 15:  # Within 15 minutes
            relevance_score += 0.1
        
        # Interest match
        for interest in profile.interests:
            if interest in content_tags:
                relevance_score += 0.1
        
        return min(1.0, relevance_score)  # Cap at 1.0
    
    def _get_personalization_factors(self, profile: LearnerProfile, content: Dict[str, Any]) -> List[str]:
        """Get factors that influenced content recommendation"""
        factors = []
        
        content_tags = content.get('tags', [])
        
        if profile.learning_style.value in content_tags:
            factors.append(f"Matches {profile.learning_style.value} learning style")
        
        if any(interest in content_tags for interest in profile.interests):
            factors.append("Aligns with your interests")
        
        content_time = content.get('time', 30)
        if abs(content_time - profile.optimal_session_length) < 15:
            factors.append("Fits your optimal session length")
        
        factors.append(f"Suited for {profile.personality_type.value} personality")
        
        return factors
    
    def _calculate_difficulty_progression(self, 
                                        preference: DifficultyPreference,
                                        position: int,
                                        total_steps: int) -> float:
        """Calculate difficulty progression for learning path step"""
        if preference == DifficultyPreference.EASY_FIRST:
            return 0.2 + (0.6 * position / max(total_steps - 1, 1))
        elif preference == DifficultyPreference.CHALLENGE_SEEKER:
            return 0.6 + (0.3 * position / max(total_steps - 1, 1))
        elif preference == DifficultyPreference.MIXED_APPROACH:
            return 0.3 + 0.4 * (0.5 + 0.5 * np.sin(2 * np.pi * position / total_steps))
        else:  # GRADUAL_INCREASE
            return 0.3 + (0.5 * position / max(total_steps - 1, 1))
    
    def _estimate_completion_time(self, 
                                recommendations: List[ContentRecommendation],
                                learning_pace: float,
                                optimal_session_length: int) -> int:
        """Estimate completion time for learning path step"""
        total_content_time = sum(rec.estimated_time for rec in recommendations)
        
        # Apply learning pace modifier
        adjusted_time = total_content_time / learning_pace
        
        # Add buffer for practice and review (20%)
        estimated_time = int(adjusted_time * 1.2)
        
        return max(optimal_session_length, estimated_time)
    
    def _optimize_path_for_time(self, 
                               learning_path: List[LearningPathStep],
                               time_constraint: int) -> List[LearningPathStep]:
        """Optimize learning path to fit within time constraints"""
        total_time = sum(step.estimated_completion_time for step in learning_path)
        
        if total_time <= time_constraint:
            return learning_path
        
        # Reduce content per step proportionally
        time_ratio = time_constraint / total_time
        
        for step in learning_path:
            step.estimated_completion_time = int(step.estimated_completion_time * time_ratio)
            
            # Reduce recommendations if necessary
            if len(step.content_recommendations) > 1:
                new_count = max(1, int(len(step.content_recommendations) * time_ratio))
                step.content_recommendations = step.content_recommendations[:new_count]
        
        return learning_path
    
    async def update_profile_from_interaction(self, 
                                            user_id: str,
                                            interaction_data: Dict[str, Any]):
        """Update user profile based on new interaction data"""
        if user_id not in self.user_profiles:
            return
        
        profile = self.user_profiles[user_id]
        
        # Update confidence level based on performance
        if 'performance' in interaction_data:
            performance = interaction_data['performance']
            profile.confidence_level = (profile.confidence_level * 0.8 + performance * 0.2)
        
        # Update learning pace
        if 'completion_time' in interaction_data and 'expected_time' in interaction_data:
            actual_pace = interaction_data['expected_time'] / interaction_data['completion_time']
            profile.learning_pace = (profile.learning_pace * 0.8 + actual_pace * 0.2)
        
        # Update interests based on engagement
        if 'content_engagement' in interaction_data:
            for content_type, engagement in interaction_data['content_engagement'].items():
                if engagement > 0.8 and content_type not in profile.interests:
                    profile.interests.append(content_type)
        
        profile.updated_at = datetime.utcnow()
        
        logger.info(f"✅ Updated profile for user {user_id}")

# Global personalization engine
personalization_engine = AdvancedPersonalizationEngine()

logger.info("✅ Advanced Personalization Algorithms initialized")