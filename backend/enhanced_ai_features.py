"""
Enhanced Emotional Intelligence & Voice-to-Text for PathwayIQ
Phase 2.3: AI/ML Enhancements

Chief Technical Architect Implementation
"""

import asyncio
import json
import re
import speech_recognition as sr
import io
import tempfile
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
import numpy as np
import openai
import anthropic
import google.generativeai as genai

logger = structlog.get_logger()

class EmotionalState(Enum):
    CONFIDENT = "confident"
    FRUSTRATED = "frustrated"
    CONFUSED = "confused"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    BORED = "bored"
    MOTIVATED = "motivated"
    OVERWHELMED = "overwhelmed"

class SentimentPolarity(Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class VoiceAnalysisResult(Enum):
    CLEAR = "clear"
    HESITANT = "hesitant"
    CONFIDENT = "confident"
    UNCERTAIN = "uncertain"
    RUSHED = "rushed"
    THOUGHTFUL = "thoughtful"

@dataclass
class EmotionalAnalysis:
    primary_emotion: EmotionalState
    emotion_confidence: float
    sentiment_polarity: SentimentPolarity
    sentiment_score: float  # -1 to 1
    stress_indicators: List[str]
    engagement_level: float  # 0 to 1
    motivation_level: float  # 0 to 1
    attention_level: float  # 0 to 1
    timestamp: datetime

@dataclass
class VoiceToTextResult:
    transcribed_text: str
    confidence_score: float
    speech_pace: float  # words per minute
    pause_analysis: Dict[str, float]
    voice_analysis: VoiceAnalysisResult
    emotional_indicators: List[str]
    timestamp: datetime

@dataclass
class ThinkAloudAnalysis:
    reasoning_strategy: str
    cognitive_load: float
    problem_solving_approach: str
    misconceptions: List[str]
    knowledge_gaps: List[str]
    metacognitive_awareness: float
    learning_indicators: List[str]

class EnhancedEmotionalIntelligence:
    """Advanced emotional intelligence with multi-modal analysis"""
    
    def __init__(self):
        self.emotion_patterns = {}
        self.baseline_emotions = {}
        self.intervention_strategies = {}
        self.emotional_history = {}
        
        # Initialize AI clients with proper error handling
        try:
            openai_key = os.environ.get('OPENAI_API_KEY')
            claude_key = os.environ.get('CLAUDE_API_KEY')
            gemini_key = os.environ.get('GEMINI_API_KEY')
            
            if openai_key:
                self.openai_client = openai.OpenAI(api_key=openai_key)
            else:
                logger.warning("OPENAI_API_KEY not found, OpenAI features will be disabled")
                self.openai_client = None
                
            if claude_key:
                self.claude_client = anthropic.Anthropic(api_key=claude_key)
            else:
                logger.warning("CLAUDE_API_KEY not found, Claude features will be disabled")
                self.claude_client = None
                
            if gemini_key:
                genai.configure(api_key=gemini_key)
            else:
                logger.warning("GEMINI_API_KEY not found, Gemini features will be disabled")
                
        except Exception as e:
            logger.error(f"Failed to initialize AI clients: {e}")
            self.openai_client = None
            self.claude_client = None
        
    async def analyze_emotional_state(self, 
                                    user_id: str,
                                    text_input: str,
                                    context: Dict[str, Any],
                                    voice_data: Optional[VoiceToTextResult] = None) -> EmotionalAnalysis:
        """Comprehensive emotional state analysis using multiple AI models"""
        try:
            # Analyze text sentiment and emotion
            text_analysis = await self._analyze_text_emotion(text_input)
            
            # Analyze contextual indicators
            context_analysis = self._analyze_contextual_emotion(context)
            
            # Analyze voice data if available
            voice_analysis = None
            if voice_data:
                voice_analysis = self._analyze_voice_emotion(voice_data)
            
            # Combine analyses for final emotional state
            emotional_analysis = self._combine_emotional_analyses(
                text_analysis, context_analysis, voice_analysis
            )
            
            # Store in emotional history
            if user_id not in self.emotional_history:
                self.emotional_history[user_id] = []
            
            self.emotional_history[user_id].append(emotional_analysis)
            
            # Keep only last 100 emotional states
            if len(self.emotional_history[user_id]) > 100:
                self.emotional_history[user_id] = self.emotional_history[user_id][-100:]
            
            logger.info(f"✅ Emotional analysis completed for user {user_id}")
            return emotional_analysis
            
        except Exception as e:
            logger.error(f"Emotional analysis failed: {e}")
            # Return neutral state on error
            return EmotionalAnalysis(
                primary_emotion=EmotionalState.NEUTRAL,
                emotion_confidence=0.5,
                sentiment_polarity=SentimentPolarity.NEUTRAL,
                sentiment_score=0.0,
                stress_indicators=[],
                engagement_level=0.5,
                motivation_level=0.5,
                attention_level=0.5,
                timestamp=datetime.utcnow()
            )
    
    async def _analyze_text_emotion(self, text: str) -> Dict[str, Any]:
        """Analyze emotion from text using multiple AI models"""
        # Use Claude for emotional analysis
        try:
            response = self.claude_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": f"""Analyze the emotional state and sentiment of this text:
                    
                    "{text}"
                    
                    Provide a JSON response with:
                    - primary_emotion: one of [confident, frustrated, confused, excited, anxious, bored, motivated, overwhelmed]
                    - emotion_confidence: 0-1 score
                    - sentiment_polarity: positive/negative/neutral
                    - sentiment_score: -1 to 1
                    - stress_indicators: list of detected stress markers
                    - engagement_level: 0-1 score
                    - motivation_level: 0-1 score
                    - reasoning: brief explanation
                    
                    Focus on learning context and educational emotions."""
                }]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            logger.error(f"Claude emotional analysis failed: {e}")
            
            # Fallback to simple pattern matching
            return self._fallback_emotion_analysis(text)
    
    def _fallback_emotion_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback emotion analysis using pattern matching"""
        text_lower = text.lower()
        
        # Emotion keywords
        emotion_keywords = {
            'confident': ['sure', 'certain', 'confident', 'know', 'understand', 'clear'],
            'frustrated': ['frustrated', 'annoyed', 'stuck', 'difficult', 'hard', 'confused'],
            'excited': ['excited', 'amazing', 'awesome', 'love', 'great', 'fantastic'],
            'anxious': ['worried', 'nervous', 'scared', 'anxious', 'unsure', 'doubt'],
            'bored': ['bored', 'boring', 'tired', 'uninteresting', 'dull'],
            'motivated': ['motivated', 'ready', 'eager', 'determined', 'focused']
        }
        
        # Count emotion indicators
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            emotion_scores[emotion] = score
        
        # Determine primary emotion
        primary_emotion = max(emotion_scores, key=emotion_scores.get) if any(emotion_scores.values()) else 'neutral'
        
        # Calculate sentiment
        positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'easy', 'clear']
        negative_words = ['bad', 'terrible', 'hate', 'difficult', 'hard', 'confusing', 'wrong']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        sentiment_score = (positive_count - negative_count) / max(len(text.split()), 1)
        
        return {
            'primary_emotion': primary_emotion,
            'emotion_confidence': min(max(emotion_scores[primary_emotion] / max(len(text.split()), 1), 0.3), 0.9),
            'sentiment_polarity': 'positive' if sentiment_score > 0.1 else 'negative' if sentiment_score < -0.1 else 'neutral',
            'sentiment_score': sentiment_score,
            'stress_indicators': ['difficulty_words'] if negative_count > positive_count else [],
            'engagement_level': min(len(text) / 100, 1.0),
            'motivation_level': 0.7 if primary_emotion in ['confident', 'excited', 'motivated'] else 0.4,
            'reasoning': f"Detected {primary_emotion} emotion based on keyword analysis"
        }
    
    def _analyze_contextual_emotion(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze emotion from contextual indicators"""
        contextual_factors = {
            'engagement_level': 0.5,
            'stress_indicators': [],
            'motivation_factors': []
        }
        
        # Time spent on task
        time_spent = context.get('time_spent', 0)
        if time_spent > context.get('expected_time', 60) * 1.5:
            contextual_factors['stress_indicators'].append('extended_time')
            contextual_factors['engagement_level'] -= 0.2
        
        # Number of attempts
        attempts = context.get('attempts', 1)
        if attempts > 3:
            contextual_factors['stress_indicators'].append('multiple_attempts')
            contextual_factors['engagement_level'] -= 0.1
        
        # Performance history
        recent_performance = context.get('recent_performance', [])
        if recent_performance:
            avg_performance = np.mean(recent_performance)
            if avg_performance < 0.5:
                contextual_factors['stress_indicators'].append('declining_performance')
            elif avg_performance > 0.8:
                contextual_factors['motivation_factors'].append('high_performance')
        
        # Help requests
        help_requests = context.get('help_requests', 0)
        if help_requests > 2:
            contextual_factors['stress_indicators'].append('frequent_help_requests')
        
        return contextual_factors
    
    def _analyze_voice_emotion(self, voice_data: VoiceToTextResult) -> Dict[str, Any]:
        """Analyze emotion from voice characteristics"""
        voice_factors = {
            'confidence_indicators': [],
            'stress_indicators': [],
            'engagement_factors': []
        }
        
        # Speech pace analysis
        if voice_data.speech_pace > 180:  # Words per minute
            voice_factors['stress_indicators'].append('rapid_speech')
        elif voice_data.speech_pace < 100:
            voice_factors['stress_indicators'].append('slow_hesitant_speech')
        
        # Pause analysis
        if voice_data.pause_analysis.get('long_pauses', 0) > 3:
            voice_factors['stress_indicators'].append('frequent_long_pauses')
        
        # Voice analysis result
        if voice_data.voice_analysis == VoiceAnalysisResult.CONFIDENT:
            voice_factors['confidence_indicators'].append('confident_speech_pattern')
        elif voice_data.voice_analysis == VoiceAnalysisResult.HESITANT:
            voice_factors['stress_indicators'].append('hesitant_speech_pattern')
        
        # Transcription confidence
        if voice_data.confidence_score < 0.7:
            voice_factors['stress_indicators'].append('unclear_speech')
        
        return voice_factors
    
    def _combine_emotional_analyses(self, 
                                  text_analysis: Dict[str, Any],
                                  context_analysis: Dict[str, Any],
                                  voice_analysis: Optional[Dict[str, Any]]) -> EmotionalAnalysis:
        """Combine multiple analyses into final emotional state"""
        
        # Primary emotion from text analysis
        primary_emotion = EmotionalState(text_analysis.get('primary_emotion', 'neutral'))
        
        # Combine confidence scores
        emotion_confidence = text_analysis.get('emotion_confidence', 0.5)
        if voice_analysis:
            # Adjust confidence based on voice indicators
            if 'confident_speech_pattern' in voice_analysis.get('confidence_indicators', []):
                emotion_confidence += 0.1
            if 'hesitant_speech_pattern' in voice_analysis.get('stress_indicators', []):
                emotion_confidence -= 0.1
        
        # Sentiment from text
        sentiment_polarity = SentimentPolarity(text_analysis.get('sentiment_polarity', 'neutral'))
        sentiment_score = text_analysis.get('sentiment_score', 0.0)
        
        # Combine stress indicators
        stress_indicators = text_analysis.get('stress_indicators', [])
        stress_indicators.extend(context_analysis.get('stress_indicators', []))
        if voice_analysis:
            stress_indicators.extend(voice_analysis.get('stress_indicators', []))
        
        # Calculate engagement level
        engagement_level = text_analysis.get('engagement_level', 0.5)
        engagement_level = (engagement_level + context_analysis.get('engagement_level', 0.5)) / 2
        
        # Calculate motivation level
        motivation_level = text_analysis.get('motivation_level', 0.5)
        if context_analysis.get('motivation_factors'):
            motivation_level += 0.2
        
        # Calculate attention level based on various factors
        attention_level = 0.7  # Base attention
        if len(stress_indicators) > 3:
            attention_level -= 0.3
        if engagement_level > 0.7:
            attention_level += 0.2
        
        return EmotionalAnalysis(
            primary_emotion=primary_emotion,
            emotion_confidence=max(0.0, min(1.0, emotion_confidence)),
            sentiment_polarity=sentiment_polarity,
            sentiment_score=sentiment_score,
            stress_indicators=list(set(stress_indicators)),  # Remove duplicates
            engagement_level=max(0.0, min(1.0, engagement_level)),
            motivation_level=max(0.0, min(1.0, motivation_level)),
            attention_level=max(0.0, min(1.0, attention_level)),
            timestamp=datetime.utcnow()
        )
    
    async def generate_emotional_intervention(self, 
                                            user_id: str,
                                            emotional_state: EmotionalAnalysis) -> Dict[str, Any]:
        """Generate appropriate intervention based on emotional state"""
        intervention = {
            'type': 'none',
            'message': '',
            'actions': [],
            'tone_adjustment': 'neutral'
        }
        
        # Frustrated or overwhelmed - provide support
        if emotional_state.primary_emotion in [EmotionalState.FRUSTRATED, EmotionalState.OVERWHELMED]:
            intervention.update({
                'type': 'support',
                'message': "I notice you might be feeling a bit overwhelmed. That's completely normal when learning new concepts! Let's break this down into smaller, more manageable steps.",
                'actions': ['simplify_content', 'provide_hints', 'encourage_break'],
                'tone_adjustment': 'supportive'
            })
        
        # Confused - provide clarification
        elif emotional_state.primary_emotion == EmotionalState.CONFUSED:
            intervention.update({
                'type': 'clarification',
                'message': "I can see this concept might need some clarification. Let me explain it in a different way that might be clearer.",
                'actions': ['provide_examples', 'alternative_explanation', 'visual_aids'],
                'tone_adjustment': 'explanatory'
            })
        
        # Bored - increase engagement
        elif emotional_state.primary_emotion == EmotionalState.BORED:
            intervention.update({
                'type': 'engagement',
                'message': "Let's make this more exciting! I have some interactive challenges that might spark your interest.",
                'actions': ['gamify_content', 'interactive_elements', 'real_world_examples'],
                'tone_adjustment': 'energetic'
            })
        
        # Anxious - provide reassurance
        elif emotional_state.primary_emotion == EmotionalState.ANXIOUS:
            intervention.update({
                'type': 'reassurance',
                'message': "You're doing great! Remember, learning is a journey, and it's okay to take your time. I'm here to help you every step of the way.",
                'actions': ['positive_reinforcement', 'progress_reminder', 'breathing_exercise'],
                'tone_adjustment': 'calm'
            })
        
        # Confident/excited - capitalize on momentum
        elif emotional_state.primary_emotion in [EmotionalState.CONFIDENT, EmotionalState.EXCITED]:
            intervention.update({
                'type': 'momentum',
                'message': "Fantastic! I can see you're really getting this. Ready for the next challenge?",
                'actions': ['increase_difficulty', 'advanced_concepts', 'peer_teaching'],
                'tone_adjustment': 'enthusiastic'
            })
        
        return intervention

class AdvancedVoiceToText:
    """Advanced voice-to-text with emotional and cognitive analysis"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Calibrate microphone for ambient noise
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
    
    async def transcribe_audio_data(self, audio_data: bytes, file_format: str = "wav") -> VoiceToTextResult:
        """Transcribe audio data to text with advanced analysis"""
        try:
            # Save audio data to temporary file
            with tempfile.NamedTemporaryFile(suffix=f".{file_format}", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Load audio file
                with sr.AudioFile(temp_file_path) as source:
                    audio = self.recognizer.record(source)
                
                # Transcribe using Google Speech Recognition
                transcribed_text = self.recognizer.recognize_google(
                    audio, 
                    show_all=True,
                    language="en-US"
                )
                
                # Extract best result and confidence
                if isinstance(transcribed_text, dict) and 'alternative' in transcribed_text:
                    best_result = transcribed_text['alternative'][0]
                    text = best_result.get('transcript', '')
                    confidence = best_result.get('confidence', 0.0)
                else:
                    text = str(transcribed_text) if transcribed_text else ''
                    confidence = 0.8 if text else 0.0
                
                # Analyze speech characteristics
                speech_analysis = await self._analyze_speech_characteristics(audio, text)
                
                return VoiceToTextResult(
                    transcribed_text=text,
                    confidence_score=confidence,
                    speech_pace=speech_analysis['pace'],
                    pause_analysis=speech_analysis['pauses'],
                    voice_analysis=speech_analysis['voice_analysis'],
                    emotional_indicators=speech_analysis['emotional_indicators'],
                    timestamp=datetime.utcnow()
                )
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except sr.UnknownValueError:
            logger.warning("Could not understand audio")
            return VoiceToTextResult(
                transcribed_text="",
                confidence_score=0.0,
                speech_pace=0.0,
                pause_analysis={},
                voice_analysis=VoiceAnalysisResult.UNCERTAIN,
                emotional_indicators=['unclear_audio'],
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Voice transcription failed: {e}")
            raise
    
    async def _analyze_speech_characteristics(self, audio, text: str) -> Dict[str, Any]:
        """Analyze speech characteristics for emotional and cognitive indicators"""
        
        # Calculate speech pace (words per minute)
        word_count = len(text.split())
        audio_duration = len(audio.frame_data) / (audio.sample_rate * audio.sample_width)
        speech_pace = (word_count / audio_duration * 60) if audio_duration > 0 else 0
        
        # Analyze pauses (simplified - would need more sophisticated audio analysis)
        pause_analysis = {
            'total_pauses': text.count('...') + text.count('uh') + text.count('um'),
            'long_pauses': text.count('...'),
            'filler_words': text.lower().count('uh') + text.lower().count('um') + text.lower().count('er')
        }
        
        # Determine voice analysis result
        voice_analysis = VoiceAnalysisResult.CLEAR
        if pause_analysis['filler_words'] > 3:
            voice_analysis = VoiceAnalysisResult.HESITANT
        elif speech_pace > 180:
            voice_analysis = VoiceAnalysisResult.RUSHED
        elif speech_pace < 100:
            voice_analysis = VoiceAnalysisResult.THOUGHTFUL
        elif 'confident' in text.lower() or 'sure' in text.lower():
            voice_analysis = VoiceAnalysisResult.CONFIDENT
        elif 'not sure' in text.lower() or 'maybe' in text.lower():
            voice_analysis = VoiceAnalysisResult.UNCERTAIN
        
        # Identify emotional indicators
        emotional_indicators = []
        if pause_analysis['filler_words'] > 2:
            emotional_indicators.append('hesitation')
        if speech_pace > 200:
            emotional_indicators.append('excitement_or_stress')
        if speech_pace < 80:
            emotional_indicators.append('thoughtfulness_or_uncertainty')
        
        return {
            'pace': speech_pace,
            'pauses': pause_analysis,
            'voice_analysis': voice_analysis,
            'emotional_indicators': emotional_indicators
        }
    
    async def analyze_think_aloud_protocol(self, transcribed_text: str) -> ThinkAloudAnalysis:
        """Analyze think-aloud protocol for cognitive insights"""
        try:
            # Check if OpenAI client is available
            if not self.openai_client:
                logger.warning("OpenAI client not available, using fallback analysis")
                return ThinkAloudAnalysis(
                    reasoning_strategy="basic_analysis",
                    cognitive_load=0.5,
                    problem_solving_approach="analytical",
                    misconceptions=[],
                    knowledge_gaps=[],
                    metacognitive_awareness=0.5,
                    learning_indicators=["engagement"],
                    cognitive_strategies=["problem_decomposition"],
                    emotional_state=EmotionalState.NEUTRAL,
                    intervention_recommendations=["continue_monitoring"],
                    confidence_level=0.5
                )
            
            # Use OpenAI for cognitive analysis
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{
                    "role": "user",
                    "content": f"""Analyze this think-aloud protocol from a student solving a problem:
                    
                    "{transcribed_text}"
                    
                    Provide a JSON response with:
                    - reasoning_strategy: description of the approach used
                    - cognitive_load: 0-1 score indicating mental effort
                    - problem_solving_approach: systematic/trial-error/intuitive/analytical
                    - misconceptions: list of identified misconceptions
                    - knowledge_gaps: list of missing knowledge areas
                    - metacognitive_awareness: 0-1 score of self-awareness
                    - learning_indicators: positive learning behaviors observed
                    
                    Focus on educational psychology and learning science."""
                }]
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return ThinkAloudAnalysis(
                reasoning_strategy=result.get('reasoning_strategy', 'unclear'),
                cognitive_load=result.get('cognitive_load', 0.5),
                problem_solving_approach=result.get('problem_solving_approach', 'mixed'),
                misconceptions=result.get('misconceptions', []),
                knowledge_gaps=result.get('knowledge_gaps', []),
                metacognitive_awareness=result.get('metacognitive_awareness', 0.5),
                learning_indicators=result.get('learning_indicators', [])
            )
            
        except Exception as e:
            logger.error(f"Think-aloud analysis failed: {e}")
            
            # Fallback analysis
            return self._fallback_think_aloud_analysis(transcribed_text)
    
    def _fallback_think_aloud_analysis(self, text: str) -> ThinkAloudAnalysis:
        """Fallback think-aloud analysis using pattern matching"""
        
        # Identify reasoning strategies
        reasoning_indicators = {
            'systematic': ['first', 'then', 'next', 'step', 'order'],
            'trial_error': ['try', 'attempt', 'maybe', 'let me see'],
            'analytical': ['because', 'therefore', 'since', 'analyze'],
            'intuitive': ['feel', 'think', 'guess', 'seems']
        }
        
        text_lower = text.lower()
        strategy_scores = {}
        for strategy, keywords in reasoning_indicators.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            strategy_scores[strategy] = score
        
        reasoning_strategy = max(strategy_scores, key=strategy_scores.get) if any(strategy_scores.values()) else 'unclear'
        
        # Estimate cognitive load based on complexity indicators
        complexity_indicators = ['complicated', 'difficult', 'confusing', 'hard', 'complex']
        cognitive_load = min(sum(1 for indicator in complexity_indicators if indicator in text_lower) / 5, 1.0)
        
        # Identify misconceptions (basic pattern matching)
        misconception_patterns = ['always', 'never', 'all', 'none', 'must be']
        misconceptions = [f"Possible overgeneralization: '{pattern}'" for pattern in misconception_patterns if pattern in text_lower]
        
        # Identify knowledge gaps
        gap_indicators = ["don't know", "not sure", "confused", "what is", "how to"]
        knowledge_gaps = [f"Gap indicated by: '{indicator}'" for indicator in gap_indicators if indicator in text_lower]
        
        # Metacognitive awareness
        metacognitive_indicators = ['i think', 'i believe', 'i understand', 'i know', 'i realize']
        metacognitive_awareness = min(sum(1 for indicator in metacognitive_indicators if indicator in text_lower) / 3, 1.0)
        
        # Learning indicators
        learning_indicators = []
        if 'understand' in text_lower:
            learning_indicators.append('expressed_understanding')
        if 'makes sense' in text_lower:
            learning_indicators.append('connection_making')
        if 'learned' in text_lower:
            learning_indicators.append('learning_acknowledgment')
        
        return ThinkAloudAnalysis(
            reasoning_strategy=reasoning_strategy,
            cognitive_load=cognitive_load,
            problem_solving_approach=reasoning_strategy,
            misconceptions=misconceptions,
            knowledge_gaps=knowledge_gaps,
            metacognitive_awareness=metacognitive_awareness,
            learning_indicators=learning_indicators
        )

# Global instances
enhanced_emotional_intelligence = EnhancedEmotionalIntelligence()
advanced_voice_to_text = AdvancedVoiceToText()

logger.info("✅ Enhanced Emotional Intelligence & Voice-to-Text Systems initialized")