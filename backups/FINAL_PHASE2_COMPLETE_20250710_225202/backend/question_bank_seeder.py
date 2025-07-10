"""
Enhanced Question Bank for StarGuide SkillScan™
Supports K-PhD+ adaptive assessment with diverse question types
"""

import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from adaptive_engine import GradeLevel, QuestionComplexity
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

class QuestionBankSeeder:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.db = self.client[DB_NAME]
    
    async def seed_adaptive_questions(self):
        """Seed the database with comprehensive adaptive questions"""
        
        questions = [
            # KINDERGARTEN LEVEL (K) - Basic Recognition
            {
                "question_text": "Which number is bigger: 3 or 5?",
                "question_type": "multiple_choice",
                "difficulty": "beginner",
                "subject": "Mathematics",
                "topic": "Number Recognition",
                "options": ["3", "5", "They are the same"],
                "correct_answer": "5",
                "explanation": "5 is bigger than 3. We can count: 1, 2, 3, 4, 5. Five comes after three!",
                "points": 5,
                "grade_level": GradeLevel.KINDERGARTEN.value,
                "complexity": QuestionComplexity.BASIC.value,
                "estimated_time_seconds": 20,
                "think_aloud_prompts": ["Point to the bigger number", "Count with your fingers"]
            },
            
            # GRADE 1 - Simple Addition
            {
                "question_text": "If you have 2 apples and find 3 more apples, how many apples do you have?",
                "question_type": "fill_blank",
                "difficulty": "beginner", 
                "subject": "Mathematics",
                "topic": "Basic Addition",
                "correct_answer": "5",
                "explanation": "2 + 3 = 5. You can count them all: 1, 2, 3, 4, 5 apples!",
                "points": 10,
                "grade_level": GradeLevel.GRADE_1.value,
                "complexity": QuestionComplexity.COMPREHENSION.value,
                "estimated_time_seconds": 30,
                "think_aloud_prompts": ["How did you count the apples?", "Can you draw them?"]
            },
            
            # GRADE 3 - Word Problems
            {
                "question_text": "Sarah has 24 stickers. She gives 8 to her brother and 6 to her sister. How many stickers does Sarah have left?",
                "question_type": "multiple_choice",
                "difficulty": "intermediate",
                "subject": "Mathematics", 
                "topic": "Multi-step Word Problems",
                "options": ["10", "14", "16", "18"],
                "correct_answer": "10",
                "explanation": "Sarah started with 24 stickers. She gave away 8 + 6 = 14 stickers. So she has 24 - 14 = 10 stickers left.",
                "points": 15,
                "grade_level": GradeLevel.GRADE_3.value,
                "complexity": QuestionComplexity.APPLICATION.value,
                "multi_step": True,
                "estimated_time_seconds": 45,
                "think_aloud_prompts": ["What steps do you need to solve this?", "What operation will you use first?"]
            },
            
            # GRADE 6 - Fractions
            {
                "question_text": "What is 3/4 + 1/8 in simplest form?",
                "question_type": "fill_blank",
                "difficulty": "intermediate",
                "subject": "Mathematics",
                "topic": "Fraction Operations",
                "correct_answer": "7/8",
                "explanation": "To add fractions, find common denominator. 3/4 = 6/8. So 6/8 + 1/8 = 7/8.",
                "points": 20,
                "grade_level": GradeLevel.GRADE_6.value,
                "complexity": QuestionComplexity.APPLICATION.value,
                "requires_prior_knowledge": True,
                "estimated_time_seconds": 60,
                "think_aloud_prompts": ["How do you find a common denominator?", "What's your strategy for adding fractions?"]
            },
            
            # GRADE 8 - Algebra
            {
                "question_text": "Solve for x: 3x + 7 = 22",
                "question_type": "fill_blank",
                "difficulty": "intermediate",
                "subject": "Mathematics",
                "topic": "Linear Equations",
                "correct_answer": "5",
                "explanation": "Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.",
                "points": 25,
                "grade_level": GradeLevel.GRADE_8.value,
                "complexity": QuestionComplexity.APPLICATION.value,
                "multi_step": True,
                "estimated_time_seconds": 90,
                "think_aloud_prompts": ["What's your first step?", "How do you isolate x?"]
            },
            
            # HIGH SCHOOL - Advanced Math
            {
                "question_text": "Find the derivative of f(x) = 3x² + 2x - 5",
                "question_type": "fill_blank",
                "difficulty": "advanced",
                "subject": "Mathematics",
                "topic": "Calculus - Derivatives",
                "correct_answer": "6x + 2",
                "explanation": "Using power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-5) = 0. So f'(x) = 6x + 2.",
                "points": 30,
                "grade_level": GradeLevel.GRADE_12.value,
                "complexity": QuestionComplexity.ANALYSIS.value,
                "requires_prior_knowledge": True,
                "abstract_reasoning": True,
                "estimated_time_seconds": 120,
                "think_aloud_prompts": ["Which rule are you applying?", "How do you handle each term?"]
            },
            
            # UNDERGRADUATE - Programming
            {
                "question_text": "What is the time complexity of this algorithm?\n\nfor i in range(n):\n    for j in range(i, n):\n        print(i, j)",
                "question_type": "multiple_choice",
                "difficulty": "advanced",
                "subject": "Computer Science",
                "topic": "Algorithm Analysis",
                "options": ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
                "correct_answer": "O(n²)",
                "explanation": "The outer loop runs n times. For each i, inner loop runs (n-i) times. Total: n + (n-1) + ... + 1 = n(n+1)/2 = O(n²).",
                "points": 40,
                "grade_level": GradeLevel.UNDERGRADUATE.value,
                "complexity": QuestionComplexity.ANALYSIS.value,
                "requires_prior_knowledge": True,
                "abstract_reasoning": True,
                "estimated_time_seconds": 180,
                "think_aloud_prompts": ["How do you analyze nested loops?", "What's the pattern in the inner loop?"]
            },
            
            # GRADUATE - Research Methods
            {
                "question_text": "In a randomized controlled trial, what is the primary purpose of blinding participants and researchers?",
                "question_type": "multiple_choice",
                "difficulty": "advanced",
                "subject": "Research Methods",
                "topic": "Experimental Design",
                "options": [
                    "To increase sample size",
                    "To reduce selection bias and placebo effects", 
                    "To ensure random assignment",
                    "To improve data collection speed"
                ],
                "correct_answer": "To reduce selection bias and placebo effects",
                "explanation": "Blinding prevents both conscious and unconscious bias from affecting the results, including placebo effects in participants and observer bias in researchers.",
                "points": 50,
                "grade_level": GradeLevel.GRADUATE.value,
                "complexity": QuestionComplexity.EVALUATION.value,
                "requires_prior_knowledge": True,
                "abstract_reasoning": True,
                "estimated_time_seconds": 240,
                "think_aloud_prompts": ["What biases are you considering?", "How does blinding address these issues?"]
            },
            
            # DOCTORAL - Advanced Theory
            {
                "question_text": "Explain how quantum entanglement challenges the classical notion of local realism, and discuss the implications of Bell's theorem for our understanding of physical reality.",
                "question_type": "short_answer",
                "difficulty": "expert",
                "subject": "Physics",
                "topic": "Quantum Mechanics Theory",
                "correct_answer": "Bell's theorem shows that no physical theory based on local hidden variables can reproduce all the predictions of quantum mechanics. Quantum entanglement demonstrates non-local correlations that violate Bell inequalities, challenging our classical intuitions about locality and realism.",
                "explanation": "This requires understanding of quantum mechanics, Bell's theorem, local realism, and the philosophical implications of quantum theory.",
                "points": 75,
                "grade_level": GradeLevel.DOCTORAL.value,
                "complexity": QuestionComplexity.RESEARCH.value,
                "requires_prior_knowledge": True,
                "abstract_reasoning": True,
                "multi_step": True,
                "estimated_time_seconds": 600,
                "think_aloud_prompts": ["How do you approach complex theoretical questions?", "What key concepts are you connecting?"]
            },
            
            # PROGRAMMING - Multiple Levels
            
            # Elementary Programming
            {
                "question_text": "What will this code print?\n\ncount = 0\nfor i in range(3):\n    count = count + 1\nprint(count)",
                "question_type": "fill_blank",
                "difficulty": "beginner",
                "subject": "Programming",
                "topic": "Basic Loops",
                "correct_answer": "3",
                "explanation": "The loop runs 3 times (i = 0, 1, 2), and count increases by 1 each time: 0 + 1 + 1 + 1 = 3.",
                "points": 15,
                "grade_level": GradeLevel.GRADE_8.value,
                "complexity": QuestionComplexity.APPLICATION.value,
                "estimated_time_seconds": 60,
                "think_aloud_prompts": ["Trace through the loop step by step", "What happens to count each iteration?"]
            },
            
            # Intermediate Programming
            {
                "question_text": "What is the main difference between a list and a tuple in Python?",
                "question_type": "multiple_choice",
                "difficulty": "intermediate",
                "subject": "Programming",
                "topic": "Data Structures",
                "options": [
                    "Lists are faster than tuples",
                    "Tuples are mutable, lists are immutable",
                    "Lists are mutable, tuples are immutable",
                    "There is no difference"
                ],
                "correct_answer": "Lists are mutable, tuples are immutable",
                "explanation": "Lists can be modified after creation (mutable), while tuples cannot be changed after creation (immutable).",
                "points": 20,
                "grade_level": GradeLevel.GRADE_10.value,
                "complexity": QuestionComplexity.COMPREHENSION.value,
                "estimated_time_seconds": 45,
                "think_aloud_prompts": ["What does mutable mean?", "Can you give examples of each?"]
            },
            
            # Advanced Programming
            {
                "question_text": "Implement a function that returns the nth Fibonacci number using dynamic programming with O(n) time and O(1) space complexity.",
                "question_type": "short_answer",
                "difficulty": "advanced",
                "subject": "Programming",
                "topic": "Dynamic Programming",
                "correct_answer": "def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for i in range(2, n + 1):\n        a, b = b, a + b\n    return b",
                "explanation": "This uses bottom-up DP with only two variables to track previous values, achieving O(1) space instead of O(n) for the recursive approach.",
                "points": 60,
                "grade_level": GradeLevel.UNDERGRADUATE.value,
                "complexity": QuestionComplexity.SYNTHESIS.value,
                "requires_prior_knowledge": True,
                "multi_step": True,
                "estimated_time_seconds": 300,
                "think_aloud_prompts": ["How do you optimize space complexity?", "What values do you need to track?"]
            },
            
            # SCIENCE - Multiple Levels
            
            # Elementary Science
            {
                "question_text": "What do plants need to grow?",
                "question_type": "multiple_choice",
                "difficulty": "beginner",
                "subject": "Science",
                "topic": "Plant Biology",
                "options": ["Only water", "Only sunlight", "Water, sunlight, and air", "Only soil"],
                "correct_answer": "Water, sunlight, and air",
                "explanation": "Plants need water for drinking, sunlight for energy, and air (carbon dioxide) to make food through photosynthesis.",
                "points": 10,
                "grade_level": GradeLevel.GRADE_2.value,
                "complexity": QuestionComplexity.BASIC.value,
                "estimated_time_seconds": 30,
                "think_aloud_prompts": ["What have you observed about plants?", "What happens to plants without sunlight?"]
            },
            
            # Middle School Science
            {
                "question_text": "If you dissolve salt in water, which statement is true?",
                "question_type": "multiple_choice",
                "difficulty": "intermediate",
                "subject": "Science",
                "topic": "Solutions and Mixtures",
                "options": [
                    "The salt disappears forever",
                    "The salt changes into water",
                    "The salt spreads evenly but can be recovered",
                    "The water changes into salt"
                ],
                "correct_answer": "The salt spreads evenly but can be recovered",
                "explanation": "Dissolving is a physical change. The salt molecules spread evenly throughout the water but can be recovered by evaporation.",
                "points": 20,
                "grade_level": GradeLevel.GRADE_7.value,
                "complexity": QuestionComplexity.COMPREHENSION.value,
                "estimated_time_seconds": 60,
                "think_aloud_prompts": ["What's the difference between physical and chemical changes?", "How could you get the salt back?"]
            },
            
            # High School Chemistry
            {
                "question_text": "Balance this chemical equation: C₂H₆ + O₂ → CO₂ + H₂O",
                "question_type": "fill_blank",
                "difficulty": "advanced",
                "subject": "Science",
                "topic": "Chemical Equations",
                "correct_answer": "2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O",
                "explanation": "Balance carbon first (4 CO₂), then hydrogen (6 H₂O), then oxygen (7 O₂). Check: C: 4=4, H: 12=12, O: 14=14.",
                "points": 35,
                "grade_level": GradeLevel.GRADE_11.value,
                "complexity": QuestionComplexity.APPLICATION.value,
                "multi_step": True,
                "estimated_time_seconds": 120,
                "think_aloud_prompts": ["Which element do you balance first?", "How do you check your answer?"]
            }
        ]
        
        # Add common fields and insert
        for question in questions:
            question.update({
                "id": str(uuid.uuid4()),
                "created_by": "system",
                "created_at": datetime.now(timezone.utc),
                "tags": [question["subject"].lower(), question["topic"].lower().replace(" ", "_")]
            })
        
        # Clear existing questions and insert new ones
        await self.db.questions.delete_many({})
        await self.db.questions.insert_many(questions)
        
        print(f"Successfully seeded {len(questions)} adaptive questions!")
        
        # Print grade level distribution
        grade_distribution = {}
        for q in questions:
            grade = q["grade_level"]
            grade_distribution[grade] = grade_distribution.get(grade, 0) + 1
        
        print("\nGrade Level Distribution:")
        for grade, count in sorted(grade_distribution.items()):
            print(f"  {grade}: {count} questions")
    
    async def close(self):
        self.client.close()

async def main():
    seeder = QuestionBankSeeder()
    await seeder.seed_adaptive_questions()
    await seeder.close()

if __name__ == "__main__":
    asyncio.run(main())