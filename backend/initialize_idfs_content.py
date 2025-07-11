#!/usr/bin/env python3
"""
IDFS Content Database Initialization Script
This script initializes the IDFS content database with educational materials from the GitHub repository.
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from idfs_content_manager import IDFSContentManager
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Initialize the IDFS content database"""
    try:
        # Load environment variables
        ROOT_DIR = Path(__file__).parent
        load_dotenv(ROOT_DIR / '.env')
        
        # Get MongoDB connection details
        MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL)
        
        # Initialize IDFS Content Manager
        idfs_manager = IDFSContentManager(client)
        
        logger.info("Starting IDFS content database initialization...")
        
        # Initialize the content database
        await idfs_manager.initialize_content_database()
        
        logger.info("IDFS content database initialization completed successfully!")
        
        # Close the connection
        client.close()
        
    except Exception as e:
        logger.error(f"Failed to initialize IDFS content database: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())