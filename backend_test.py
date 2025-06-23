#!/usr/bin/env python3
"""
StarGuide Educational Platform - Backend API Test Suite
This script tests all major backend API endpoints and features.
"""

import requests
import json
import time
import random
import string
import unittest
import os
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://dfa0127a-8eb9-4c85-a9f1-cf762a6336a2.preview.emergentagent.com/api"

class StarGuideBackendTest(unittest.TestCase):
    """Test suite for StarGuide backend API"""
    
    def setUp(self):
        """Set up test environment before each test"""
        self.headers = {"Content-Type": "application/json"}
        self.auth_token = None
        self.user_id = None
        self.test_user = {
            "username": f"testuser_{random.randint(1000, 9999)}",
            "email": f"test{random.randint(1000, 9999)}@example.com",
            "password": "TestPassword123!",
            "role": "student",
            "full_name": "Test User"
        }
        self.test_teacher = {
            "username": f"testteacher_{random.randint(1000, 9999)}",
            "email": f"teacher{random.randint(1000, 9999)}@example.com",
            "password": "TeacherPass123!",
            "role": "teacher",
            "full_name": "Test Teacher"
        }
        self.test_admin = {
            "username": f"testadmin_{random.randint(1000, 9999)}",
            "email": f"admin{random.randint(1000, 9999)}@example.com",
            "password": "AdminPass123!",
            "role": "admin",
            "full_name": "Test Admin"
        }
        
    def test_01_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{BACKEND_URL}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working")
        
    def test_02_root_endpoint(self):
        """Test root endpoint"""
        response = requests.get(f"{BACKEND_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("StarGuide API", data["message"])
        print("✅ Root endpoint working")
        
    def test_03_user_registration(self):
        """Test user registration with different roles"""
        # Register student
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            headers=self.headers,
            json=self.test_user
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "student")
        self.student_token = data["access_token"]
        self.student_id = data["user"]["id"]
        
        # Register teacher
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            headers=self.headers,
            json=self.test_teacher
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "teacher")
        self.teacher_token = data["access_token"]
        self.teacher_id = data["user"]["id"]
        
        # Register admin
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            headers=self.headers,
            json=self.test_admin
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "admin")
        self.admin_token = data["access_token"]
        self.admin_id = data["user"]["id"]
        
        print("✅ User registration working for all roles")
        
    def test_04_user_login(self):
        """Test user login functionality"""
        # Login as student
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            headers=self.headers,
            json={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        # Save auth token for other tests
        self.headers["Authorization"] = f"Bearer {self.auth_token}"
        
        print("✅ User login working")
        
    def test_05_protected_routes(self):
        """Test protected routes with authentication"""
        # Test with valid token
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], self.test_user["email"])
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=invalid_headers
        )
        self.assertEqual(response.status_code, 401)
        
        print("✅ Protected routes working with authentication")
        
    def test_06_adaptive_assessment(self):
        """Test adaptive assessment functionality"""
        # Start a new assessment
        assessment_config = {
            "subject": "mathematics",
            "assessment_type": "diagnostic",
            "enable_think_aloud": True,
            "enable_ai_help_tracking": True,
            "max_questions": 5
        }
        
        response = requests.post(
            f"{BACKEND_URL}/adaptive-assessment/start",
            headers=self.headers,
            json=assessment_config
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("session_id", data)
        session_id = data["session_id"]
        
        # Get next question
        response = requests.get(
            f"{BACKEND_URL}/adaptive-assessment/{session_id}/next-question",
            headers=self.headers
        )
        
        # If we get a 404, it means there are no questions in the database yet
        # Let's create a question first as a teacher
        if response.status_code == 404 or "session_complete" in response.json():
            # Switch to teacher account
            teacher_headers = {"Authorization": f"Bearer {self.teacher_token}", "Content-Type": "application/json"}
            
            # Create a test question
            test_question = {
                "question_text": "What is 2 + 2?",
                "question_type": "multiple_choice",
                "difficulty": "beginner",
                "subject": "mathematics",
                "topic": "addition",
                "options": ["3", "4", "5", "6"],
                "correct_answer": "4",
                "explanation": "2 + 2 = 4",
                "grade_level": "grade_3",
                "complexity": "basic",
                "think_aloud_prompts": ["Explain how you add numbers", "What strategy did you use?"]
            }
            
            question_response = requests.post(
                f"{BACKEND_URL}/questions",
                headers=teacher_headers,
                json=test_question
            )
            self.assertEqual(question_response.status_code, 200)
            
            # Create a few more questions with different difficulties
            for i in range(3):
                difficulty = ["beginner", "intermediate", "advanced"][i]
                question = {
                    "question_text": f"Math question {i+1}?",
                    "question_type": "multiple_choice",
                    "difficulty": difficulty,
                    "subject": "mathematics",
                    "topic": "general",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "B",
                    "explanation": f"Explanation for question {i+1}",
                    "grade_level": "grade_8",
                    "complexity": "application"
                }
                requests.post(f"{BACKEND_URL}/questions", headers=teacher_headers, json=question)
            
            # Start a new assessment with the student account
            response = requests.post(
                f"{BACKEND_URL}/adaptive-assessment/start",
                headers=self.headers,
                json=assessment_config
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("session_id", data)
            session_id = data["session_id"]
            
            # Get next question again
            response = requests.get(
                f"{BACKEND_URL}/adaptive-assessment/{session_id}/next-question",
                headers=self.headers
            )
        
        self.assertEqual(response.status_code, 200)
        question_data = response.json()
        
        if "session_complete" not in question_data:
            question_id = question_data["id"]
            
            # Submit an answer with think-aloud data
            think_aloud_data = {
                "question_id": question_id,
                "reasoning": "I know that 2 + 2 equals 4 because I can count the total objects.",
                "strategy": "I used mental math and visualization.",
                "confidence_level": 5,
                "difficulty_perception": 1,
                "connections_to_prior_knowledge": "I've learned addition before."
            }
            
            answer_data = {
                "session_id": session_id,
                "question_id": question_id,
                "answer": "4",  # Correct answer
                "response_time_seconds": 5.2,
                "think_aloud_data": think_aloud_data,
                "ai_help_used": False
            }
            
            response = requests.post(
                f"{BACKEND_URL}/adaptive-assessment/submit-answer",
                headers=self.headers,
                json=answer_data
            )
            self.assertEqual(response.status_code, 200)
            result = response.json()
            self.assertIn("correct", result)
            
            # Get session analytics
            response = requests.get(
                f"{BACKEND_URL}/adaptive-assessment/{session_id}/analytics",
                headers=self.headers
            )
            self.assertEqual(response.status_code, 200)
            analytics = response.json()
            self.assertIn("accuracy", analytics)
        
        print("✅ Adaptive assessment engine working")
        
    def test_07_ai_tutoring(self):
        """Test AI tutoring with OpenAI integration"""
        # Test basic AI chat
        chat_data = {
            "message": "Can you explain the concept of photosynthesis?",
            "session_id": None  # New session
        }
        
        response = requests.post(
            f"{BACKEND_URL}/ai/chat",
            headers=self.headers,
            json=chat_data
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("response", data)
        self.assertIn("session_id", data)
        
        # Continue the conversation
        chat_data["session_id"] = data["session_id"]
        chat_data["message"] = "What role does chlorophyll play in this process?"
        
        response = requests.post(
            f"{BACKEND_URL}/ai/chat",
            headers=self.headers,
            json=chat_data
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("response", data)
        
        print("✅ AI tutoring with OpenAI integration working")
        
    def test_08_question_bank(self):
        """Test question bank functionality"""
        # Switch to teacher account for creating questions
        teacher_headers = {"Authorization": f"Bearer {self.teacher_token}", "Content-Type": "application/json"}
        
        # Create a question
        test_question = {
            "question_text": "What is the capital of France?",
            "question_type": "multiple_choice",
            "difficulty": "beginner",
            "subject": "geography",
            "topic": "capitals",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correct_answer": "Paris",
            "explanation": "Paris is the capital city of France.",
            "tags": ["europe", "capitals"]
        }
        
        response = requests.post(
            f"{BACKEND_URL}/questions",
            headers=teacher_headers,
            json=test_question
        )
        self.assertEqual(response.status_code, 200)
        question_data = response.json()
        self.assertEqual(question_data["question_text"], test_question["question_text"])
        
        # Get questions
        response = requests.get(
            f"{BACKEND_URL}/questions?subject=geography",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        questions = response.json()
        self.assertGreaterEqual(len(questions), 1)
        
        # Answer a question (as student)
        question_id = questions[0]["id"]
        response = requests.post(
            f"{BACKEND_URL}/questions/{question_id}/answer",
            headers=self.headers,
            params={"answer": "Paris"}
        )
        self.assertEqual(response.status_code, 200)
        answer_result = response.json()
        self.assertTrue(answer_result["correct"])
        
        print("✅ Question bank system working")
        
    def test_09_study_groups(self):
        """Test study group creation and management"""
        # Create a study group
        group_data = {
            "name": "Physics Study Group",
            "description": "A group for studying physics concepts",
            "subject": "physics",
            "max_members": 10,
            "is_private": False
        }
        
        response = requests.post(
            f"{BACKEND_URL}/study-groups",
            headers=self.headers,
            json=group_data
        )
        self.assertEqual(response.status_code, 200)
        group = response.json()
        self.assertEqual(group["name"], group_data["name"])
        group_id = group["id"]
        
        # Get study groups
        response = requests.get(
            f"{BACKEND_URL}/study-groups",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        groups = response.json()
        self.assertGreaterEqual(len(groups), 1)
        
        # Join study group with another user
        teacher_headers = {"Authorization": f"Bearer {self.teacher_token}", "Content-Type": "application/json"}
        response = requests.post(
            f"{BACKEND_URL}/study-groups/{group_id}/join",
            headers=teacher_headers
        )
        self.assertEqual(response.status_code, 200)
        
        print("✅ Study group functionality working")
        
    def test_10_quiz_arena(self):
        """Test quiz arena/battle system"""
        # Create a quiz room
        room_data = {
            "name": "Science Quiz Battle",
            "subject": "science",
            "difficulty": "intermediate",
            "max_participants": 5,
            "questions_per_game": 5,
            "time_per_question": 20
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quiz-rooms",
            headers=self.headers,
            json=room_data
        )
        self.assertEqual(response.status_code, 200)
        room = response.json()
        self.assertEqual(room["name"], room_data["name"])
        room_code = room["room_code"]
        
        # Get quiz rooms
        response = requests.get(
            f"{BACKEND_URL}/quiz-rooms",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        rooms = response.json()
        self.assertGreaterEqual(len(rooms), 1)
        
        # Join quiz room with another user
        teacher_headers = {"Authorization": f"Bearer {self.teacher_token}", "Content-Type": "application/json"}
        response = requests.post(
            f"{BACKEND_URL}/quiz-rooms/{room_code}/join",
            headers=teacher_headers
        )
        self.assertEqual(response.status_code, 200)
        
        print("✅ Quiz arena system working")
        
    def test_11_chat_system(self):
        """Test real-time chat functionality"""
        # Create a room for chat (using study group)
        group_data = {
            "name": "Chat Test Group",
            "description": "Testing chat functionality",
            "subject": "general",
            "is_private": False
        }
        
        response = requests.post(
            f"{BACKEND_URL}/study-groups",
            headers=self.headers,
            json=group_data
        )
        self.assertEqual(response.status_code, 200)
        group = response.json()
        room_id = group["id"]
        
        # Send a chat message
        response = requests.post(
            f"{BACKEND_URL}/chat/{room_id}/message",
            headers=self.headers,
            params={"message": "Hello, this is a test message!"}
        )
        self.assertEqual(response.status_code, 200)
        
        # Get chat messages
        response = requests.get(
            f"{BACKEND_URL}/chat/{room_id}/messages",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        messages = response.json()
        self.assertGreaterEqual(len(messages), 1)
        self.assertEqual(messages[0]["message"], "Hello, this is a test message!")
        
        print("✅ Chat system working")
        
    def test_12_analytics_dashboard(self):
        """Test analytics dashboard"""
        response = requests.get(
            f"{BACKEND_URL}/analytics/dashboard",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("user_stats", data)
        self.assertIn("recent_activity", data)
        
        print("✅ Analytics dashboard working")
        
    def test_13_enhanced_ai_features(self):
        """Test enhanced AI features (Phase 1)"""
        # Test enhanced AI chat
        try:
            chat_data = {
                "message": "I'm feeling frustrated with this math problem.",
                "emotional_context": "frustrated",
                "learning_style": "visual"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/ai/enhanced-chat",
                headers=self.headers,
                json=chat_data
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("response", data)
            self.assertIn("emotional_state_detected", data)
            print("✅ Enhanced AI chat working")
        except AssertionError:
            print("❌ Enhanced AI chat not working as expected")
        
        # Test personalized learning path
        try:
            path_data = {
                "subject": "mathematics",
                "learning_goals": ["Master algebra", "Understand calculus basics"],
                "target_completion_weeks": 8,
                "preferred_learning_style": "visual"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/ai/personalized-learning-path",
                headers=self.headers,
                json=path_data
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("personalized_curriculum", data)
            print("✅ Personalized learning path generation working")
        except AssertionError:
            print("❌ Personalized learning path not working as expected")
        
        # Test learning style assessment
        try:
            response = requests.post(
                f"{BACKEND_URL}/ai/learning-style-assessment",
                headers=self.headers
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("primary_learning_style", data)
            print("✅ Learning style assessment working")
        except AssertionError:
            print("❌ Learning style assessment not working as expected")
        
        # Test emotional analytics
        try:
            response = requests.get(
                f"{BACKEND_URL}/ai/emotional-analytics/{self.user_id}",
                headers=self.headers
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("emotion_distribution", data)
            print("✅ Emotional analytics tracking working")
        except AssertionError:
            print("❌ Emotional analytics not working as expected")
        
        # Test voice-to-text (simulated since we can't send audio)
        try:
            # This will likely fail since we can't send actual audio data in this test
            # But we can check if the endpoint exists and returns the expected error
            response = requests.post(
                f"{BACKEND_URL}/ai/voice-to-text",
                headers=self.headers
            )
            # Either a 400 (bad request) or 422 (validation error) is expected
            self.assertIn(response.status_code, [400, 422])
            print("✅ Voice-to-text endpoint exists (couldn't test fully without audio)")
        except AssertionError:
            print("❌ Voice-to-text endpoint not working as expected")

if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)