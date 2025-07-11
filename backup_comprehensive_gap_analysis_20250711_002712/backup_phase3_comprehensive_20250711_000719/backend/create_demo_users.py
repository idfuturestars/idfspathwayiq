#!/usr/bin/env python3
"""
Script to create demo users for PathwayIQ application
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
from pathlib import Path
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def create_demo_users():
    """Create demo users in the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "student@starguide.com",
            "username": "student_demo",
            "password": hash_password("demo123"),
            "role": "student",
            "full_name": "Demo Student",
            "created_at": "2025-01-01T00:00:00Z",
            "profile": {
                "grade_level": "middle_school",
                "learning_style": "visual",
                "interests": ["science", "math", "technology"]
            }
        },
        {
            "id": str(uuid.uuid4()),
            "email": "teacher@starguide.com",
            "username": "teacher_demo",
            "password": hash_password("demo123"),
            "role": "teacher",
            "full_name": "Demo Teacher",
            "created_at": "2025-01-01T00:00:00Z",
            "profile": {
                "subject_areas": ["mathematics", "science"],
                "experience_years": 5,
                "classroom_size": 25
            }
        }
    ]
    
    for user in demo_users:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user["email"]})
        if existing_user:
            print(f"User {user['email']} already exists, updating...")
            await db.users.update_one(
                {"email": user["email"]},
                {"$set": user}
            )
        else:
            print(f"Creating user {user['email']}...")
            await db.users.insert_one(user)
    
    print("✅ Demo users created successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_demo_users())