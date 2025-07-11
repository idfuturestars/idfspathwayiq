"""
IDFS Content Manager - Integrates IDFS educational content into PathwayIQ
Handles content extraction, processing, and serving for various educational pathways
"""

import os
import json
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import requests
import asyncio
from pathlib import Path
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PathwayType(Enum):
    """Educational pathway types"""
    VOCATIONAL = "vocational"
    COMMUNITY_COLLEGE = "community_college"
    FOUR_YEAR_COLLEGE = "four_year_college"
    K12 = "k12"
    GRADUATE = "graduate"
    NON_COLLEGE = "non_college"
    CAREER_ASSESSMENT = "career_assessment"
    SOCIAL_JUSTICE = "social_justice"
    COMMUNITY_SERVICE = "community_service"

@dataclass
class ContentModule:
    """Represents a single educational content module"""
    id: str
    title: str
    pathway_type: PathwayType
    content: str
    learning_objectives: List[str]
    prerequisites: List[str]
    estimated_duration: str
    difficulty_level: str
    salary_info: Optional[Dict[str, Any]] = None
    career_clusters: List[str] = None
    assessment_questions: List[Dict[str, Any]] = None
    resources: List[Dict[str, str]] = None
    created_at: datetime = None
    updated_at: datetime = None

class IDFSContentManager:
    """Manages IDFS educational content integration"""
    
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client.pathwayiq
        self.content_collection = self.db.idfs_content
        self.pathways_collection = self.db.learning_pathways
        
        # IDFS GitHub repository configuration
        self.github_base_url = "https://raw.githubusercontent.com/idfuturestars/idfspathwayiq/main"
        
        # Content categories mapping
        self.content_categories = {
            "vocational": {
                "files": [
                    "2025 IDFS Paths Vocational with Salaries.docx",
                    "2022 Paths Vocational with Salaries[100].docx",
                    "2022 Vocational Sch 101 Dean Conver2 - Topic 2[73].docx",
                    "2022 Vocational Sch 102 Dean Conver1 - Topic 1[7].docx",
                    "2022 Vocational Sch 103 Dean Conver1 - Topic 1[14].docx"
                ],
                "pathway_type": PathwayType.VOCATIONAL
            },
            "community_college": {
                "files": [
                    "2025 COMMUNITY COLLEGE HIM 1 Paths 2 year 2nd copy Why Comm College.docx",
                    "2024 HIM 1 Paths 2 year 2nd copy Why Comm College.docx"
                ],
                "pathway_type": PathwayType.COMMUNITY_COLLEGE
            },
            "college_transition": {
                "files": [
                    "2022 College Trans 103 Dean Conver1 -Topic 1.docx",
                    "2022 College Trans 103 Dean Conver2 - Topic 2[13].docx",
                    "2022 College Trans 103 Dean Conver3 - Topic 3.docx",
                    "2022 College Trans Dean Conver2 - Topic 2.docx"
                ],
                "pathway_type": PathwayType.FOUR_YEAR_COLLEGE
            },
            "career_assessment": {
                "files": [
                    "2025 HIM 1 Paths4life 1 Career Interest Survey.docx"
                ],
                "pathway_type": PathwayType.CAREER_ASSESSMENT
            },
            "social_justice": {
                "files": [
                    "2022 Social Justice 101 Dean Conver1 - Topic 1.docx",
                    "2022 Social Justice 102 Dean Conver2 - Topic 2.docx",
                    "2022 Social Justice 103 Dean Conver3 - Topic 3.docx",
                    "SOCIAL JUSTICE 104  SO MANY CHOICES.docx"
                ],
                "pathway_type": PathwayType.SOCIAL_JUSTICE
            },
            "community_service": {
                "files": [
                    "2022 Comm Serv 101 Dean Conver2 - Topic 2.docx",
                    "2022 Comm Serv 102 Dean Conver1 - Topic 1.docx",
                    "2022 Comm Serv 103 Dean Conver1 - Topic 1.docx",
                    "2022 Comm Serv 104 Dean Conver1 - Topic 1.docx"
                ],
                "pathway_type": PathwayType.COMMUNITY_SERVICE
            },
            "hbcu": {
                "files": [
                    "2025 HBCU HIM.docx"
                ],
                "pathway_type": PathwayType.FOUR_YEAR_COLLEGE
            }
        }
        
    async def initialize_content_database(self):
        """Initialize the content database with IDFS materials"""
        try:
            logger.info("Initializing IDFS content database...")
            
            # Create indexes
            await self.content_collection.create_index("content_id")
            await self.content_collection.create_index("pathway_type")
            await self.content_collection.create_index("title")
            
            # Process content categories
            for category, config in self.content_categories.items():
                await self.process_content_category(category, config)
            
            # Create learning pathways
            await self.create_learning_pathways()
            
            logger.info("IDFS content database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing content database: {str(e)}")
            raise

    async def process_content_category(self, category: str, config: Dict[str, Any]):
        """Process a specific content category"""
        try:
            logger.info(f"Processing content category: {category}")
            
            for filename in config["files"]:
                content_module = await self.extract_content_from_file(
                    filename, config["pathway_type"]
                )
                
                if content_module:
                    await self.save_content_module(content_module)
                    
        except Exception as e:
            logger.error(f"Error processing category {category}: {str(e)}")

    async def extract_content_from_file(self, filename: str, pathway_type: PathwayType) -> Optional[ContentModule]:
        """Extract content from a specific file"""
        try:
            # Download file from GitHub
            file_url = f"{self.github_base_url}/{filename.replace(' ', '%20')}"
            
            # Create temporary file path
            temp_file = f"/tmp/{uuid.uuid4().hex}.docx"
            
            # Download file
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            
            with open(temp_file, 'wb') as f:
                f.write(response.content)
            
            # Extract content
            content_text = self.extract_docx_text(temp_file)
            
            # Clean up temporary file
            os.remove(temp_file)
            
            # Parse content and create module
            module = self.parse_content_to_module(filename, content_text, pathway_type)
            
            return module
            
        except Exception as e:
            logger.error(f"Error extracting content from {filename}: {str(e)}")
            return None

    def extract_docx_text(self, docx_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            with zipfile.ZipFile(docx_path, 'r') as zip_ref:
                document_xml = zip_ref.read('word/document.xml')
                root = ET.fromstring(document_xml)
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                text_elements = root.findall('.//w:t', ns)
                text = ' '.join([elem.text for elem in text_elements if elem.text])
                return text
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            return ""

    def parse_content_to_module(self, filename: str, content: str, pathway_type: PathwayType) -> ContentModule:
        """Parse content and create a ContentModule"""
        try:
            # Extract title from filename
            title = filename.replace('.docx', '').replace('.pdf', '')
            title = title.replace('[', '').replace(']', '').replace('  ', ' ')
            
            # Parse learning objectives
            learning_objectives = self.extract_learning_objectives(content)
            
            # Parse salary information
            salary_info = self.extract_salary_info(content)
            
            # Parse career clusters
            career_clusters = self.extract_career_clusters(content)
            
            # Parse assessment questions
            assessment_questions = self.extract_assessment_questions(content)
            
            # Estimate duration and difficulty
            estimated_duration = self.estimate_duration(content)
            difficulty_level = self.estimate_difficulty(content)
            
            # Create module
            module = ContentModule(
                id=str(uuid.uuid4()),
                title=title,
                pathway_type=pathway_type,
                content=content,
                learning_objectives=learning_objectives,
                prerequisites=[],
                estimated_duration=estimated_duration,
                difficulty_level=difficulty_level,
                salary_info=salary_info,
                career_clusters=career_clusters,
                assessment_questions=assessment_questions,
                resources=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            return module
            
        except Exception as e:
            logger.error(f"Error parsing content to module: {str(e)}")
            return None

    def extract_learning_objectives(self, content: str) -> List[str]:
        """Extract learning objectives from content"""
        objectives = []
        
        # Look for common patterns
        patterns = [
            "Learn about", "Understand", "Discover", "Explore", "Develop",
            "Benefits of", "Advantages of", "Why", "How to", "What is"
        ]
        
        sentences = content.split('.')
        for sentence in sentences:
            for pattern in patterns:
                if pattern.lower() in sentence.lower() and len(sentence.strip()) > 10:
                    objectives.append(sentence.strip())
                    break
        
        return objectives[:5]  # Limit to 5 objectives

    def extract_salary_info(self, content: str) -> Optional[Dict[str, Any]]:
        """Extract salary information from content"""
        import re
        
        # Look for salary patterns
        salary_patterns = [
            r'\$[\d,]+',
            r'[\d,]+\s*dollars?',
            r'earn.*\$[\d,]+',
            r'salary.*\$[\d,]+',
            r'pay.*\$[\d,]+',
            r'wage.*\$[\d,]+'
        ]
        
        salary_info = {}
        
        for pattern in salary_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                salary_info['ranges'] = matches
                break
        
        return salary_info if salary_info else None

    def extract_career_clusters(self, content: str) -> List[str]:
        """Extract career clusters from content"""
        clusters = []
        
        # Common career cluster keywords
        cluster_keywords = [
            "healthcare", "technology", "education", "business", "finance",
            "engineering", "construction", "transportation", "hospitality",
            "arts", "media", "manufacturing", "agriculture", "government",
            "nonprofit", "social services", "law", "science", "skilled trades"
        ]
        
        content_lower = content.lower()
        for keyword in cluster_keywords:
            if keyword in content_lower:
                clusters.append(keyword.title())
        
        return list(set(clusters))

    def extract_assessment_questions(self, content: str) -> List[Dict[str, Any]]:
        """Extract assessment questions from content"""
        questions = []
        
        # Look for question patterns
        import re
        question_patterns = [
            r'[?\n].*\?',
            r'Score.*from.*\d+.*to.*\d+',
            r'Rate.*from.*\d+.*to.*\d+',
            r'Check.*that.*describe'
        ]
        
        for pattern in question_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE | re.DOTALL)
            for match in matches:
                if len(match.strip()) > 10:
                    questions.append({
                        'question': match.strip(),
                        'type': 'multiple_choice',
                        'options': []
                    })
        
        return questions[:10]  # Limit to 10 questions

    def estimate_duration(self, content: str) -> str:
        """Estimate learning duration based on content length"""
        word_count = len(content.split())
        
        if word_count < 500:
            return "15-30 minutes"
        elif word_count < 1000:
            return "30-45 minutes"
        elif word_count < 2000:
            return "45-60 minutes"
        else:
            return "1-2 hours"

    def estimate_difficulty(self, content: str) -> str:
        """Estimate difficulty level based on content"""
        content_lower = content.lower()
        
        # Look for difficulty indicators
        beginner_keywords = ["basic", "introduction", "beginner", "start", "first"]
        intermediate_keywords = ["intermediate", "advanced", "complex", "detailed"]
        advanced_keywords = ["expert", "professional", "specialized", "mastery"]
        
        beginner_count = sum(1 for keyword in beginner_keywords if keyword in content_lower)
        intermediate_count = sum(1 for keyword in intermediate_keywords if keyword in content_lower)
        advanced_count = sum(1 for keyword in advanced_keywords if keyword in content_lower)
        
        if advanced_count > intermediate_count and advanced_count > beginner_count:
            return "Advanced"
        elif intermediate_count > beginner_count:
            return "Intermediate"
        else:
            return "Beginner"

    async def save_content_module(self, module: ContentModule):
        """Save a content module to the database"""
        try:
            module_dict = {
                'content_id': module.id,
                'title': module.title,
                'pathway_type': module.pathway_type.value,
                'content': module.content,
                'learning_objectives': module.learning_objectives,
                'prerequisites': module.prerequisites,
                'estimated_duration': module.estimated_duration,
                'difficulty_level': module.difficulty_level,
                'salary_info': module.salary_info,
                'career_clusters': module.career_clusters,
                'assessment_questions': module.assessment_questions,
                'resources': module.resources,
                'created_at': module.created_at,
                'updated_at': module.updated_at
            }
            
            await self.content_collection.insert_one(module_dict)
            logger.info(f"Saved content module: {module.title}")
            
        except Exception as e:
            logger.error(f"Error saving content module: {str(e)}")

    async def create_learning_pathways(self):
        """Create structured learning pathways from content modules"""
        try:
            pathways = [
                {
                    'pathway_id': str(uuid.uuid4()),
                    'name': 'Vocational Training Pathway',
                    'description': 'Fast-track career training in skilled trades and technical fields',
                    'pathway_type': PathwayType.VOCATIONAL.value,
                    'duration': '6 months - 2 years',
                    'target_audience': 'High school graduates, career changers',
                    'learning_outcomes': [
                        'Develop practical, hands-on skills',
                        'Prepare for high-paying skilled trades',
                        'Gain industry certifications',
                        'Build professional network'
                    ],
                    'modules': await self.get_modules_by_type(PathwayType.VOCATIONAL),
                    'created_at': datetime.now()
                },
                {
                    'pathway_id': str(uuid.uuid4()),
                    'name': 'Community College Pathway',
                    'description': 'Affordable education with transfer opportunities',
                    'pathway_type': PathwayType.COMMUNITY_COLLEGE.value,
                    'duration': '2 years',
                    'target_audience': 'Budget-conscious students, transfer students',
                    'learning_outcomes': [
                        'Complete general education requirements',
                        'Save money on college education',
                        'Explore career interests',
                        'Prepare for university transfer'
                    ],
                    'modules': await self.get_modules_by_type(PathwayType.COMMUNITY_COLLEGE),
                    'created_at': datetime.now()
                },
                {
                    'pathway_id': str(uuid.uuid4()),
                    'name': 'Career Exploration Pathway',
                    'description': 'Discover your interests and career potential',
                    'pathway_type': PathwayType.CAREER_ASSESSMENT.value,
                    'duration': '2-4 weeks',
                    'target_audience': 'All students, career changers',
                    'learning_outcomes': [
                        'Identify career interests and strengths',
                        'Explore career clusters',
                        'Understand education requirements',
                        'Create career action plan'
                    ],
                    'modules': await self.get_modules_by_type(PathwayType.CAREER_ASSESSMENT),
                    'created_at': datetime.now()
                },
                {
                    'pathway_id': str(uuid.uuid4()),
                    'name': 'Social Justice Leadership Pathway',
                    'description': 'Develop skills for social change and community impact',
                    'pathway_type': PathwayType.SOCIAL_JUSTICE.value,
                    'duration': '1-2 years',
                    'target_audience': 'Social justice advocates, community leaders',
                    'learning_outcomes': [
                        'Understand social justice principles',
                        'Develop leadership skills',
                        'Create community impact',
                        'Build advocacy capabilities'
                    ],
                    'modules': await self.get_modules_by_type(PathwayType.SOCIAL_JUSTICE),
                    'created_at': datetime.now()
                }
            ]
            
            for pathway in pathways:
                existing = await self.pathways_collection.find_one({'name': pathway['name']})
                if not existing:
                    await self.pathways_collection.insert_one(pathway)
                    logger.info(f"Created learning pathway: {pathway['name']}")
            
        except Exception as e:
            logger.error(f"Error creating learning pathways: {str(e)}")

    async def get_modules_by_type(self, pathway_type: PathwayType) -> List[str]:
        """Get module IDs for a specific pathway type"""
        try:
            modules = await self.content_collection.find(
                {'pathway_type': pathway_type.value}
            ).to_list(100)
            
            return [module['content_id'] for module in modules]
            
        except Exception as e:
            logger.error(f"Error getting modules by type: {str(e)}")
            return []

    async def get_content_by_pathway(self, pathway_type: str) -> List[Dict[str, Any]]:
        """Get all content for a specific pathway type"""
        try:
            modules = await self.content_collection.find(
                {'pathway_type': pathway_type}
            ).to_list(100)
            
            return modules
            
        except Exception as e:
            logger.error(f"Error getting content by pathway: {str(e)}")
            return []

    async def get_learning_pathways(self) -> List[Dict[str, Any]]:
        """Get all learning pathways"""
        try:
            pathways = await self.pathways_collection.find().to_list(100)
            
            # Remove MongoDB _id fields to avoid serialization issues
            for pathway in pathways:
                pathway.pop("_id", None)
            
            return pathways
            
        except Exception as e:
            logger.error(f"Error getting learning pathways: {str(e)}")
            return []

    async def search_content(self, query: str, pathway_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search content by query"""
        try:
            search_filter = {'$text': {'$search': query}}
            
            if pathway_type:
                search_filter['pathway_type'] = pathway_type
            
            results = await self.content_collection.find(search_filter).to_list(50)
            return results
            
        except Exception as e:
            logger.error(f"Error searching content: {str(e)}")
            return []

    async def get_career_assessment_questions(self) -> List[Dict[str, Any]]:
        """Get career assessment questions"""
        try:
            assessment_modules = await self.content_collection.find(
                {'pathway_type': PathwayType.CAREER_ASSESSMENT.value}
            ).to_list(10)
            
            all_questions = []
            for module in assessment_modules:
                if module.get('assessment_questions'):
                    all_questions.extend(module['assessment_questions'])
            
            return all_questions
            
        except Exception as e:
            logger.error(f"Error getting career assessment questions: {str(e)}")
            return []

    async def get_salary_insights(self, career_cluster: str) -> Dict[str, Any]:
        """Get salary insights for a career cluster"""
        try:
            modules = await self.content_collection.find(
                {'career_clusters': career_cluster}
            ).to_list(50)
            
            salary_data = []
            for module in modules:
                if module.get('salary_info'):
                    salary_data.append(module['salary_info'])
            
            return {
                'career_cluster': career_cluster,
                'salary_data': salary_data,
                'modules_count': len(modules)
            }
            
        except Exception as e:
            logger.error(f"Error getting salary insights: {str(e)}")
            return {}