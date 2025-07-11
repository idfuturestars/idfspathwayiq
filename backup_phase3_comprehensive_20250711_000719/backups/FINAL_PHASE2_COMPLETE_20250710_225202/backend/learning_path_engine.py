"""
Improved Learning Path Recommendations for PathwayIQ
Phase 2.3: AI/ML Enhancements

Chief Technical Architect Implementation
"""

import asyncio
import json
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import networkx as nx
import openai
import hashlib

logger = structlog.get_logger()

class PathwayType(Enum):
    CAREER_FOCUSED = "career_focused"
    SKILL_BASED = "skill_based"
    PROJECT_BASED = "project_based"
    ACADEMIC = "academic"
    CERTIFICATION = "certification"
    PERSONAL_INTEREST = "personal_interest"

class LearningGoalType(Enum):
    SHORT_TERM = "short_term"      # 1-4 weeks
    MEDIUM_TERM = "medium_term"    # 1-3 months
    LONG_TERM = "long_term"        # 3+ months
    CONTINUOUS = "continuous"       # Ongoing

class PathwayDifficulty(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MIXED = "mixed"

@dataclass
class LearningGoal:
    goal_id: str
    title: str
    description: str
    goal_type: LearningGoalType
    target_skills: List[str]
    prerequisites: List[str]
    estimated_time: int  # hours
    priority: float  # 0-1
    deadline: Optional[datetime]
    career_relevance: float  # 0-1
    personal_interest: float  # 0-1

@dataclass
class LearningResource:
    resource_id: str
    title: str
    description: str
    resource_type: str  # video, article, exercise, project, quiz
    difficulty_level: float  # 0-1
    estimated_time: int  # minutes
    skills_covered: List[str]
    prerequisites: List[str]
    learning_objectives: List[str]
    engagement_score: float  # 0-1
    completion_rate: float  # 0-1
    user_ratings: float  # 0-5
    tags: List[str]

@dataclass
class PathwayStep:
    step_id: str
    step_number: int
    title: str
    description: str
    learning_objectives: List[str]
    resources: List[LearningResource]
    estimated_time: int  # minutes
    difficulty_progression: float  # 0-1
    prerequisites_met: bool
    mastery_criteria: Dict[str, float]
    optional: bool

@dataclass
class LearningPathway:
    pathway_id: str
    title: str
    description: str
    pathway_type: PathwayType
    difficulty: PathwayDifficulty
    total_estimated_time: int  # hours
    steps: List[PathwayStep]
    target_goals: List[str]  # goal_ids
    skill_outcomes: List[str]
    career_paths: List[str]
    personalization_score: float  # 0-1
    success_probability: float  # 0-1
    created_at: datetime
    updated_at: datetime

@dataclass
class PathwayRecommendation:
    pathway: LearningPathway
    relevance_score: float  # 0-1
    reasoning: List[str]
    personalization_factors: List[str]
    predicted_completion_time: int  # hours
    success_indicators: List[str]
    potential_challenges: List[str]
    alternative_pathways: List[str]  # pathway_ids

class AdvancedLearningPathRecommendationEngine:
    """Advanced learning path recommendations using AI and graph algorithms"""
    
    def __init__(self):
        self.pathways_database = {}
        self.skills_graph = nx.DiGraph()
        self.career_pathways = {}
        self.user_progress = {}
        self.recommendation_cache = {}
        self.skill_embeddings = {}
        
        # Initialize OpenAI client
        self.openai_client = openai.OpenAI()
        
        # Load or create knowledge graph
        self._initialize_skills_graph()
        self._initialize_career_pathways()
        
    def _initialize_skills_graph(self):
        """Initialize the skills knowledge graph"""
        # Core programming skills hierarchy
        programming_skills = {
            # Beginner level
            'programming_basics': [],
            'variables_data_types': ['programming_basics'],
            'control_structures': ['variables_data_types'],
            'functions': ['control_structures'],
            
            # Intermediate level
            'object_oriented_programming': ['functions'],
            'data_structures': ['functions'],
            'algorithms': ['data_structures'],
            'debugging': ['functions'],
            
            # Advanced level
            'design_patterns': ['object_oriented_programming'],
            'system_design': ['algorithms', 'design_patterns'],
            'performance_optimization': ['algorithms'],
            'testing': ['debugging'],
            
            # Web development
            'html_css': ['programming_basics'],
            'javascript': ['html_css', 'functions'],
            'frontend_frameworks': ['javascript', 'object_oriented_programming'],
            'backend_development': ['javascript', 'data_structures'],
            'database_design': ['backend_development'],
            'web_security': ['backend_development'],
            
            # Data science
            'statistics': ['programming_basics'],
            'data_analysis': ['statistics', 'functions'],
            'machine_learning': ['data_analysis', 'algorithms'],
            'data_visualization': ['data_analysis'],
            'deep_learning': ['machine_learning'],
            
            # DevOps
            'version_control': ['programming_basics'],
            'containerization': ['backend_development'],
            'cloud_platforms': ['containerization'],
            'ci_cd': ['version_control', 'testing'],
        }
        
        # Add skills to graph
        for skill, prerequisites in programming_skills.items():
            self.skills_graph.add_node(skill)
            for prereq in prerequisites:
                self.skills_graph.add_edge(prereq, skill)
        
        logger.info(f"✅ Skills graph initialized with {len(self.skills_graph.nodes)} skills")
    
    def _initialize_career_pathways(self):
        """Initialize career pathway templates"""
        self.career_pathways = {
            'frontend_developer': {
                'title': 'Frontend Developer',
                'core_skills': ['html_css', 'javascript', 'frontend_frameworks'],
                'advanced_skills': ['performance_optimization', 'testing', 'web_security'],
                'estimated_time': 480,  # 6 months
                'difficulty': PathwayDifficulty.INTERMEDIATE
            },
            'backend_developer': {
                'title': 'Backend Developer',
                'core_skills': ['programming_basics', 'backend_development', 'database_design'],
                'advanced_skills': ['system_design', 'web_security', 'performance_optimization'],
                'estimated_time': 600,  # 7.5 months
                'difficulty': PathwayDifficulty.INTERMEDIATE
            },
            'fullstack_developer': {
                'title': 'Full Stack Developer',
                'core_skills': ['html_css', 'javascript', 'frontend_frameworks', 'backend_development'],
                'advanced_skills': ['system_design', 'database_design', 'testing'],
                'estimated_time': 720,  # 9 months
                'difficulty': PathwayDifficulty.ADVANCED
            },
            'data_scientist': {
                'title': 'Data Scientist',
                'core_skills': ['statistics', 'data_analysis', 'machine_learning'],
                'advanced_skills': ['deep_learning', 'data_visualization'],
                'estimated_time': 600,  # 7.5 months
                'difficulty': PathwayDifficulty.ADVANCED
            },
            'devops_engineer': {
                'title': 'DevOps Engineer',
                'core_skills': ['backend_development', 'containerization', 'cloud_platforms'],
                'advanced_skills': ['ci_cd', 'system_design'],
                'estimated_time': 540,  # 6.75 months
                'difficulty': PathwayDifficulty.ADVANCED
            }
        }
    
    async def generate_personalized_pathways(self, 
                                           user_id: str,
                                           goals: List[LearningGoal],
                                           current_skills: List[str],
                                           learning_preferences: Dict[str, Any],
                                           time_constraints: Optional[Dict[str, int]] = None) -> List[PathwayRecommendation]:
        """Generate personalized learning pathway recommendations"""
        try:
            # Analyze user context
            user_context = await self._analyze_user_context(
                user_id, goals, current_skills, learning_preferences
            )
            
            # Generate candidate pathways
            candidate_pathways = await self._generate_candidate_pathways(
                goals, current_skills, user_context
            )
            
            # Score and rank pathways
            scored_pathways = await self._score_pathways(
                candidate_pathways, user_context, time_constraints
            )
            
            # Create recommendations with explanations
            recommendations = []
            for pathway, score in scored_pathways[:5]:  # Top 5 recommendations
                recommendation = await self._create_pathway_recommendation(
                    pathway, score, user_context
                )
                recommendations.append(recommendation)
            
            # Cache recommendations
            cache_key = f"{user_id}_{hash(str(goals))}"
            self.recommendation_cache[cache_key] = {
                'recommendations': recommendations,
                'timestamp': datetime.utcnow()
            }
            
            logger.info(f"✅ Generated {len(recommendations)} pathway recommendations for user {user_id}")
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate personalized pathways: {e}")
            raise
    
    async def _analyze_user_context(self, 
                                  user_id: str,
                                  goals: List[LearningGoal],
                                  current_skills: List[str],
                                  preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user context for pathway generation"""
        
        # Categorize goals by type and priority
        goal_analysis = {
            'career_goals': [g for g in goals if g.goal_type in [LearningGoalType.LONG_TERM] and g.career_relevance > 0.7],
            'skill_goals': [g for g in goals if g.goal_type in [LearningGoalType.SHORT_TERM, LearningGoalType.MEDIUM_TERM]],
            'urgent_goals': [g for g in goals if g.deadline and g.deadline < datetime.utcnow() + timedelta(weeks=4)],
            'high_priority': [g for g in goals if g.priority > 0.8]
        }
        
        # Analyze skill gaps
        target_skills = set()
        for goal in goals:
            target_skills.update(goal.target_skills)
        
        skill_gaps = target_skills - set(current_skills)
        
        # Calculate learning capacity
        time_budget = preferences.get('weekly_hours', 10)
        learning_pace = preferences.get('learning_pace', 1.0)
        
        # Identify learning style preferences
        learning_style = preferences.get('learning_style', 'mixed')
        preferred_formats = preferences.get('preferred_formats', ['video', 'exercise'])
        
        return {
            'goal_analysis': goal_analysis,
            'current_skills': set(current_skills),
            'skill_gaps': skill_gaps,
            'time_budget': time_budget,
            'learning_pace': learning_pace,
            'learning_style': learning_style,
            'preferred_formats': preferred_formats,
            'career_focus': any(g.career_relevance > 0.7 for g in goals),
            'urgency_level': len(goal_analysis['urgent_goals']) / max(len(goals), 1)
        }
    
    async def _generate_candidate_pathways(self, 
                                         goals: List[LearningGoal],
                                         current_skills: List[str],
                                         user_context: Dict[str, Any]) -> List[LearningPathway]:
        """Generate candidate learning pathways"""
        candidate_pathways = []
        
        # Career-based pathways
        if user_context['career_focus']:
            career_pathways = await self._generate_career_pathways(
                goals, current_skills, user_context
            )
            candidate_pathways.extend(career_pathways)
        
        # Skill-based pathways
        skill_pathways = await self._generate_skill_pathways(
            goals, current_skills, user_context
        )
        candidate_pathways.extend(skill_pathways)
        
        # Project-based pathways
        project_pathways = await self._generate_project_pathways(
            goals, current_skills, user_context
        )
        candidate_pathways.extend(project_pathways)
        
        return candidate_pathways
    
    async def _generate_career_pathways(self, 
                                      goals: List[LearningGoal],
                                      current_skills: List[str],
                                      user_context: Dict[str, Any]) -> List[LearningPathway]:
        """Generate career-focused pathways"""
        career_pathways = []
        
        for career_id, career_info in self.career_pathways.items():
            # Check if this career aligns with user goals
            required_skills = set(career_info['core_skills'] + career_info['advanced_skills'])
            goal_skills = set()
            for goal in goals:
                goal_skills.update(goal.target_skills)
            
            skill_overlap = len(required_skills.intersection(goal_skills)) / len(required_skills)
            
            if skill_overlap > 0.3:  # At least 30% skill overlap
                pathway = await self._build_career_pathway(
                    career_id, career_info, current_skills, user_context
                )
                career_pathways.append(pathway)
        
        return career_pathways
    
    async def _build_career_pathway(self, 
                                  career_id: str,
                                  career_info: Dict[str, Any],
                                  current_skills: List[str],
                                  user_context: Dict[str, Any]) -> LearningPathway:
        """Build a specific career pathway"""
        
        # Determine skill progression order
        all_required_skills = career_info['core_skills'] + career_info['advanced_skills']
        skill_order = self._get_optimal_skill_order(all_required_skills, current_skills)
        
        # Create pathway steps
        steps = []
        step_number = 1
        
        for skill in skill_order:
            if skill not in current_skills:
                step = await self._create_skill_step(
                    skill, step_number, user_context
                )
                steps.append(step)
                step_number += 1
        
        # Calculate total time
        total_time = sum(step.estimated_time for step in steps) // 60  # Convert to hours
        
        pathway_id = f"career_{career_id}_{hashlib.md5(str(current_skills).encode()).hexdigest()[:8]}"
        
        return LearningPathway(
            pathway_id=pathway_id,
            title=f"Path to {career_info['title']}",
            description=f"Comprehensive pathway to become a {career_info['title']}",
            pathway_type=PathwayType.CAREER_FOCUSED,
            difficulty=career_info['difficulty'],
            total_estimated_time=total_time,
            steps=steps,
            target_goals=[],  # Will be filled by caller
            skill_outcomes=all_required_skills,
            career_paths=[career_id],
            personalization_score=0.0,  # Will be calculated later
            success_probability=0.0,  # Will be calculated later
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    def _get_optimal_skill_order(self, 
                                required_skills: List[str],
                                current_skills: List[str]) -> List[str]:
        """Get optimal order for learning skills based on dependencies"""
        
        # Create subgraph of required skills
        skill_subgraph = self.skills_graph.subgraph(required_skills)
        
        # Topological sort to get dependency order
        try:
            ordered_skills = list(nx.topological_sort(skill_subgraph))
        except nx.NetworkXError:
            # Fallback to original order if graph has cycles
            ordered_skills = required_skills
        
        # Filter out skills already possessed
        remaining_skills = [skill for skill in ordered_skills if skill not in current_skills]
        
        return remaining_skills
    
    async def _create_skill_step(self, 
                               skill: str,
                               step_number: int,
                               user_context: Dict[str, Any]) -> PathwayStep:
        """Create a learning step for a specific skill"""
        
        # Generate learning resources (mock data - would be real in production)
        resources = await self._get_skill_resources(skill, user_context)
        
        # Calculate estimated time
        estimated_time = sum(resource.estimated_time for resource in resources)
        
        # Adjust for learning pace
        estimated_time = int(estimated_time / user_context['learning_pace'])
        
        # Determine prerequisites
        prerequisites = list(self.skills_graph.predecessors(skill))
        prerequisites_met = all(prereq in user_context['current_skills'] for prereq in prerequisites)
        
        step_id = f"step_{step_number}_{skill}"
        
        return PathwayStep(
            step_id=step_id,
            step_number=step_number,
            title=f"Master {skill.replace('_', ' ').title()}",
            description=f"Learn and practice {skill.replace('_', ' ')} concepts",
            learning_objectives=[f"Understand {skill}", f"Apply {skill} in practice"],
            resources=resources,
            estimated_time=estimated_time,
            difficulty_progression=self._calculate_skill_difficulty(skill),
            prerequisites_met=prerequisites_met,
            mastery_criteria={'accuracy': 0.8, 'completion': 0.9},
            optional=False
        )
    
    async def _get_skill_resources(self, 
                                 skill: str,
                                 user_context: Dict[str, Any]) -> List[LearningResource]:
        """Get learning resources for a specific skill"""
        
        # Mock resource generation (would be real database in production)
        resources = []
        
        preferred_formats = user_context['preferred_formats']
        
        # Generate diverse resource types
        for i, resource_type in enumerate(['video', 'article', 'exercise', 'project']):
            if resource_type in preferred_formats or len(resources) < 2:
                resource = LearningResource(
                    resource_id=f"{skill}_{resource_type}_{i}",
                    title=f"{skill.replace('_', ' ').title()} - {resource_type.title()}",
                    description=f"Learn {skill} through {resource_type}",
                    resource_type=resource_type,
                    difficulty_level=self._calculate_skill_difficulty(skill),
                    estimated_time=self._get_resource_time(resource_type),
                    skills_covered=[skill],
                    prerequisites=list(self.skills_graph.predecessors(skill)),
                    learning_objectives=[f"Master {skill}"],
                    engagement_score=0.8,
                    completion_rate=0.75,
                    user_ratings=4.2,
                    tags=[skill, resource_type]
                )
                resources.append(resource)
        
        return resources
    
    def _calculate_skill_difficulty(self, skill: str) -> float:
        """Calculate difficulty level for a skill"""
        # Base difficulty on position in skills graph
        try:
            # Skills with more prerequisites are generally more difficult
            prereq_count = len(list(self.skills_graph.predecessors(skill)))
            max_prereqs = max(len(list(self.skills_graph.predecessors(node))) 
                            for node in self.skills_graph.nodes())
            
            if max_prereqs > 0:
                difficulty = prereq_count / max_prereqs
            else:
                difficulty = 0.3  # Default for skills with no prerequisites
            
            return min(max(difficulty, 0.1), 0.9)  # Clamp between 0.1 and 0.9
            
        except Exception:
            return 0.5  # Default difficulty
    
    def _get_resource_time(self, resource_type: str) -> int:
        """Get estimated time for resource type"""
        time_estimates = {
            'video': 45,      # 45 minutes
            'article': 30,    # 30 minutes
            'exercise': 60,   # 1 hour
            'project': 180,   # 3 hours
            'quiz': 20        # 20 minutes
        }
        return time_estimates.get(resource_type, 45)
    
    async def _generate_skill_pathways(self, 
                                     goals: List[LearningGoal],
                                     current_skills: List[str],
                                     user_context: Dict[str, Any]) -> List[LearningPathway]:
        """Generate skill-focused pathways"""
        skill_pathways = []
        
        # Group skills by domain
        skill_domains = self._group_skills_by_domain(user_context['skill_gaps'])
        
        for domain, skills in skill_domains.items():
            if len(skills) >= 2:  # Only create pathway if multiple skills
                pathway = await self._build_skill_domain_pathway(
                    domain, skills, current_skills, user_context
                )
                skill_pathways.append(pathway)
        
        return skill_pathways
    
    def _group_skills_by_domain(self, skills: Set[str]) -> Dict[str, List[str]]:
        """Group skills by domain/category"""
        domains = {
            'web_development': ['html_css', 'javascript', 'frontend_frameworks', 'backend_development'],
            'data_science': ['statistics', 'data_analysis', 'machine_learning', 'data_visualization'],
            'programming_fundamentals': ['programming_basics', 'variables_data_types', 'control_structures', 'functions'],
            'advanced_programming': ['object_oriented_programming', 'design_patterns', 'algorithms', 'system_design']
        }
        
        skill_groups = {}
        for domain, domain_skills in domains.items():
            matching_skills = [skill for skill in skills if skill in domain_skills]
            if matching_skills:
                skill_groups[domain] = matching_skills
        
        return skill_groups
    
    async def _build_skill_domain_pathway(self, 
                                        domain: str,
                                        skills: List[str],
                                        current_skills: List[str],
                                        user_context: Dict[str, Any]) -> LearningPathway:
        """Build pathway for a skill domain"""
        
        # Order skills by dependencies
        ordered_skills = self._get_optimal_skill_order(skills, current_skills)
        
        # Create steps
        steps = []
        for i, skill in enumerate(ordered_skills, 1):
            step = await self._create_skill_step(skill, i, user_context)
            steps.append(step)
        
        # Calculate total time
        total_time = sum(step.estimated_time for step in steps) // 60
        
        pathway_id = f"skill_{domain}_{hashlib.md5(str(skills).encode()).hexdigest()[:8]}"
        
        return LearningPathway(
            pathway_id=pathway_id,
            title=f"{domain.replace('_', ' ').title()} Mastery",
            description=f"Master essential skills in {domain.replace('_', ' ')}",
            pathway_type=PathwayType.SKILL_BASED,
            difficulty=PathwayDifficulty.INTERMEDIATE,
            total_estimated_time=total_time,
            steps=steps,
            target_goals=[],
            skill_outcomes=skills,
            career_paths=[],
            personalization_score=0.0,
            success_probability=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def _generate_project_pathways(self, 
                                       goals: List[LearningGoal],
                                       current_skills: List[str],
                                       user_context: Dict[str, Any]) -> List[LearningPathway]:
        """Generate project-based pathways"""
        # Simplified project pathway generation
        project_pathways = []
        
        # Example project pathway
        if 'web_development' in self._group_skills_by_domain(user_context['skill_gaps']):
            project_pathway = await self._create_web_project_pathway(current_skills, user_context)
            project_pathways.append(project_pathway)
        
        return project_pathways
    
    async def _create_web_project_pathway(self, 
                                        current_skills: List[str],
                                        user_context: Dict[str, Any]) -> LearningPathway:
        """Create a web development project pathway"""
        
        # Mock project-based pathway
        steps = [
            PathwayStep(
                step_id="project_1",
                step_number=1,
                title="Build a Personal Portfolio",
                description="Create a responsive personal portfolio website",
                learning_objectives=["HTML/CSS mastery", "JavaScript fundamentals", "Responsive design"],
                resources=[],  # Would be populated with real resources
                estimated_time=480,  # 8 hours
                difficulty_progression=0.4,
                prerequisites_met=True,
                mastery_criteria={'completion': 1.0},
                optional=False
            )
        ]
        
        return LearningPathway(
            pathway_id=f"project_web_portfolio",
            title="Web Development Through Projects",
            description="Learn web development by building real projects",
            pathway_type=PathwayType.PROJECT_BASED,
            difficulty=PathwayDifficulty.INTERMEDIATE,
            total_estimated_time=8,
            steps=steps,
            target_goals=[],
            skill_outcomes=['html_css', 'javascript'],
            career_paths=['frontend_developer'],
            personalization_score=0.0,
            success_probability=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def _score_pathways(self, 
                            pathways: List[LearningPathway],
                            user_context: Dict[str, Any],
                            time_constraints: Optional[Dict[str, int]]) -> List[Tuple[LearningPathway, float]]:
        """Score and rank pathways based on user context"""
        
        scored_pathways = []
        
        for pathway in pathways:
            score = await self._calculate_pathway_score(pathway, user_context, time_constraints)
            
            # Update pathway with score
            pathway.personalization_score = score
            pathway.success_probability = self._calculate_success_probability(pathway, user_context)
            
            scored_pathways.append((pathway, score))
        
        # Sort by score (highest first)
        scored_pathways.sort(key=lambda x: x[1], reverse=True)
        
        return scored_pathways
    
    async def _calculate_pathway_score(self, 
                                     pathway: LearningPathway,
                                     user_context: Dict[str, Any],
                                     time_constraints: Optional[Dict[str, int]]) -> float:
        """Calculate relevance score for a pathway"""
        
        score = 0.0
        
        # Goal alignment (30% weight)
        goal_skills = user_context['skill_gaps']
        pathway_skills = set(pathway.skill_outcomes)
        skill_overlap = len(goal_skills.intersection(pathway_skills)) / max(len(goal_skills), 1)
        score += skill_overlap * 0.3
        
        # Time feasibility (25% weight)
        if time_constraints:
            max_time = time_constraints.get('max_total_time', pathway.total_estimated_time)
            time_feasibility = min(max_time / max(pathway.total_estimated_time, 1), 1.0)
            score += time_feasibility * 0.25
        else:
            score += 0.25  # Full score if no time constraints
        
        # Career relevance (20% weight)
        if user_context['career_focus'] and pathway.pathway_type == PathwayType.CAREER_FOCUSED:
            score += 0.2
        elif not user_context['career_focus'] and pathway.pathway_type == PathwayType.SKILL_BASED:
            score += 0.2
        
        # Learning style match (15% weight)
        preferred_formats = user_context['preferred_formats']
        format_match = 0.0
        for step in pathway.steps:
            step_formats = [resource.resource_type for resource in step.resources]
            format_overlap = len(set(step_formats).intersection(set(preferred_formats)))
            format_match += format_overlap / max(len(step_formats), 1)
        
        if pathway.steps:
            format_match /= len(pathway.steps)
        
        score += format_match * 0.15
        
        # Urgency match (10% weight)
        if user_context['urgency_level'] > 0.5:
            # Prefer shorter pathways for urgent goals
            urgency_score = 1.0 - (pathway.total_estimated_time / 1000)  # Normalize
            score += max(urgency_score, 0) * 0.1
        else:
            score += 0.1  # Full score if no urgency
        
        return min(score, 1.0)  # Clamp to maximum 1.0
    
    def _calculate_success_probability(self, 
                                     pathway: LearningPathway,
                                     user_context: Dict[str, Any]) -> float:
        """Calculate probability of successfully completing pathway"""
        
        probability = 0.7  # Base probability
        
        # Adjust based on time budget
        required_weekly_hours = pathway.total_estimated_time / 12  # Assume 12 weeks
        if required_weekly_hours <= user_context['time_budget']:
            probability += 0.2
        else:
            probability -= 0.3
        
        # Adjust based on difficulty vs current skills
        current_skill_count = len(user_context['current_skills'])
        if current_skill_count > 5:  # Experienced learner
            probability += 0.1
        elif current_skill_count < 2:  # Beginner
            if pathway.difficulty in [PathwayDifficulty.ADVANCED, PathwayDifficulty.EXPERT]:
                probability -= 0.3
        
        # Adjust based on prerequisites
        unmet_prereqs = 0
        for step in pathway.steps:
            if not step.prerequisites_met:
                unmet_prereqs += 1
        
        if unmet_prereqs > 0:
            probability -= unmet_prereqs * 0.05
        
        return max(0.1, min(probability, 1.0))  # Clamp between 0.1 and 1.0
    
    async def _create_pathway_recommendation(self, 
                                           pathway: LearningPathway,
                                           score: float,
                                           user_context: Dict[str, Any]) -> PathwayRecommendation:
        """Create detailed pathway recommendation with explanations"""
        
        # Generate reasoning
        reasoning = []
        if score > 0.8:
            reasoning.append("Excellent match for your goals and preferences")
        elif score > 0.6:
            reasoning.append("Good alignment with your learning objectives")
        else:
            reasoning.append("Reasonable option with some trade-offs")
        
        # Personalization factors
        personalization_factors = []
        if pathway.pathway_type == PathwayType.CAREER_FOCUSED and user_context['career_focus']:
            personalization_factors.append("Aligned with your career goals")
        
        preferred_formats = user_context['preferred_formats']
        pathway_formats = set()
        for step in pathway.steps:
            for resource in step.resources:
                pathway_formats.add(resource.resource_type)
        
        if pathway_formats.intersection(preferred_formats):
            personalization_factors.append("Matches your preferred learning formats")
        
        # Success indicators
        success_indicators = []
        if pathway.success_probability > 0.7:
            success_indicators.append("High probability of successful completion")
        if pathway.total_estimated_time <= user_context['time_budget'] * 12:
            success_indicators.append("Fits within your available time")
        
        # Potential challenges
        challenges = []
        if pathway.difficulty == PathwayDifficulty.ADVANCED:
            challenges.append("Advanced difficulty level may require additional preparation")
        if pathway.total_estimated_time > user_context['time_budget'] * 12:
            challenges.append("May require more time than currently available")
        
        # Predicted completion time (adjusted for user's pace)
        predicted_time = int(pathway.total_estimated_time / user_context['learning_pace'])
        
        return PathwayRecommendation(
            pathway=pathway,
            relevance_score=score,
            reasoning=reasoning,
            personalization_factors=personalization_factors,
            predicted_completion_time=predicted_time,
            success_indicators=success_indicators,
            potential_challenges=challenges,
            alternative_pathways=[]  # Would be populated with similar pathways
        )

# Global learning path recommendation engine
learning_path_engine = AdvancedLearningPathRecommendationEngine()

logger.info("✅ Advanced Learning Path Recommendation Engine initialized")