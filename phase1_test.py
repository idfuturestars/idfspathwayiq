#!/usr/bin/env python3
"""
StarGuide Phase 1 Strategic Enhancements Test Suite
This script specifically tests the Phase 1 strategic enhancements:
1. Rate Limiting System
2. Monitoring & Metrics
3. Security Infrastructure
4. AI Provider Integration
"""

import requests
import json
import time
import random
import string
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://76b382ff-b491-4ce5-91e0-b22087b7f6c7.preview.emergentagent.com/api"

def test_rate_limiting():
    """Test rate limiting system"""
    print("\n=== Testing Rate Limiting System ===")
    
    # Make multiple requests to test rate limiting
    print("Making 30 rapid requests to test rate limiting...")
    
    responses = []
    for i in range(30):
        response = requests.get(f"{BACKEND_URL}/health")
        responses.append(response)
        
    # Check if any responses have 429 status code (Too Many Requests)
    rate_limited = any(r.status_code == 429 for r in responses)
    
    # Check for rate limit headers
    rate_limit_headers = any("X-RateLimit-Limit" in r.headers for r in responses)
    rate_limit_current = any("X-RateLimit-Current" in r.headers for r in responses)
    rate_limit_reset = any("X-RateLimit-Reset" in r.headers for r in responses)
    
    if rate_limited:
        print("✅ Rate limiting is enforced (received 429 response)")
        # Find the 429 response and print its headers
        for r in responses:
            if r.status_code == 429:
                print(f"  - Rate limit headers in 429 response:")
                print(f"    - Limit: {r.headers.get('X-RateLimit-Limit')}")
                print(f"    - Current: {r.headers.get('X-RateLimit-Current')}")
                print(f"    - Reset: {r.headers.get('X-RateLimit-Reset')}")
                print(f"    - Retry-After: {r.headers.get('Retry-After')}")
                break
    elif rate_limit_headers and rate_limit_current and rate_limit_reset:
        print("✅ Rate limiting headers present but limit not exceeded")
        # Print headers from the last response
        last_response = responses[-1]
        print(f"  - Rate limit headers:")
        print(f"    - Limit: {last_response.headers.get('X-RateLimit-Limit')}")
        print(f"    - Current: {last_response.headers.get('X-RateLimit-Current')}")
        print(f"    - Reset: {last_response.headers.get('X-RateLimit-Reset')}")
    else:
        print("❌ Rate limiting could not be verified")
        
    # Check rate limiting for different endpoint types
    endpoint_types = [
        ("/", "API"),
        ("/auth/login", "Auth"),
        ("/ai/chat", "AI"),
        ("/adaptive-assessment/start", "Assessment")
    ]
    
    for endpoint, endpoint_type in endpoint_types:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            if any(header.startswith("X-RateLimit") for header in response.headers):
                print(f"✅ {endpoint_type} endpoint has rate limiting headers")
                print(f"  - Limit: {response.headers.get('X-RateLimit-Limit')}")
                print(f"  - Current: {response.headers.get('X-RateLimit-Current')}")
                print(f"  - Reset: {response.headers.get('X-RateLimit-Reset')}")
            else:
                print(f"❌ {endpoint_type} endpoint missing rate limiting headers")
        except:
            print(f"❓ {endpoint_type} endpoint could not be tested")
    
    return rate_limited or (rate_limit_headers and rate_limit_current and rate_limit_reset)

def test_monitoring_metrics():
    """Test monitoring and metrics endpoints"""
    print("\n=== Testing Monitoring & Metrics ===")
    
    # Test health check endpoint
    print("Testing health check endpoint...")
    health_response = requests.get(f"{BACKEND_URL}/health")
    
    if health_response.status_code == 200:
        health_data = health_response.json()
        print(f"✅ Health check endpoint working (status: {health_data.get('status')})")
        
        # Check for comprehensive health data
        has_comprehensive_data = (
            "components" in health_data or
            "services" in health_data or
            "database" in health_data or
            "redis" in health_data or
            "uptime" in health_data
        )
        
        if has_comprehensive_data:
            print("✅ Comprehensive health data available:")
            for key, value in health_data.items():
                if key not in ["status", "timestamp"]:
                    print(f"  - {key}: {value}")
        else:
            print("❌ Health check is basic, not comprehensive")
    else:
        print(f"❌ Health check endpoint failed with status {health_response.status_code}")
    
    # Test metrics endpoint
    print("\nTesting Prometheus metrics endpoint...")
    metrics_response = requests.get(f"{BACKEND_URL}/metrics")
    
    if metrics_response.status_code == 200:
        content_type = metrics_response.headers.get("Content-Type", "")
        if "text/plain" in content_type:
            print(f"✅ Metrics endpoint working with correct content type: {content_type}")
            
            # Check for Prometheus metrics
            content = metrics_response.text
            metrics_found = []
            
            prometheus_metrics = [
                "starguide_api_requests_total",
                "starguide_api_request_duration_seconds",
                "starguide_active_users_total",
                "starguide_ai_model_usage_total",
                "starguide_rate_limit_hits_total",
                "http_requests_total",
                "request_latency_seconds"
            ]
            
            for metric in prometheus_metrics:
                if metric in content:
                    metrics_found.append(metric)
            
            if metrics_found:
                print(f"✅ Found {len(metrics_found)} Prometheus metrics:")
                for metric in metrics_found[:5]:  # Show first 5 metrics
                    print(f"  - {metric}")
                if len(metrics_found) > 5:
                    print(f"  - ... and {len(metrics_found) - 5} more")
            else:
                print("❌ No standard Prometheus metrics found")
                
            # Print a sample of the metrics output
            lines = content.split('\n')
            non_comment_lines = [line for line in lines if line and not line.startswith('#')]
            if non_comment_lines:
                print("\nSample metrics:")
                for line in non_comment_lines[:3]:
                    print(f"  {line}")
        else:
            print(f"❌ Metrics endpoint has incorrect content type: {content_type}")
    else:
        print(f"❌ Metrics endpoint failed with status {metrics_response.status_code}")
    
    health_success = health_response.status_code == 200
    metrics_success = metrics_response.status_code == 200 and "text/plain" in metrics_response.headers.get("Content-Type", "")
    
    return health_success and metrics_success

def test_security_infrastructure():
    """Test security infrastructure and headers"""
    print("\n=== Testing Security Infrastructure ===")
    
    # Make a request to check security headers
    response = requests.get(f"{BACKEND_URL}/health")
    
    # Check for security headers
    security_headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": None,  # Any value is acceptable
        "Referrer-Policy": None  # Any value is acceptable
    }
    
    headers_present = []
    missing_headers = []
    
    for header, expected_value in security_headers.items():
        if header in response.headers:
            if expected_value is None or response.headers[header] == expected_value:
                headers_present.append(f"{header}: {response.headers[header]}")
            else:
                missing_headers.append(f"{header} (wrong value: {response.headers[header]})")
        else:
            missing_headers.append(header)
    
    if headers_present:
        print("✅ Security headers present:")
        for header in headers_present:
            print(f"  - {header}")
    
    if missing_headers:
        print("❌ Missing or incorrect security headers:")
        for header in missing_headers:
            print(f"  - {header}")
        
    # Check for request ID header (for request tracking)
    if "X-Request-ID" in response.headers:
        print(f"✅ Request tracking header (X-Request-ID) present: {response.headers.get('X-Request-ID')}")
    else:
        print("❌ No request tracking header detected")
        
    # Test CORS handling
    headers = {
        "Origin": "https://stargateai.emergent.host",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization"
    }
    
    cors_response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers)
    
    cors_headers_present = (
        "Access-Control-Allow-Origin" in cors_response.headers and
        "Access-Control-Allow-Methods" in cors_response.headers and
        "Access-Control-Allow-Headers" in cors_response.headers
    )
    
    if cors_headers_present:
        print("✅ CORS handling working for allowed domains")
        print(f"  - Allow-Origin: {cors_response.headers.get('Access-Control-Allow-Origin')}")
        print(f"  - Allow-Methods: {cors_response.headers.get('Access-Control-Allow-Methods')}")
        print(f"  - Allow-Headers: {cors_response.headers.get('Access-Control-Allow-Headers')}")
    else:
        print("❌ CORS headers not fully implemented")
    
    # Calculate success percentage
    security_header_success = len(headers_present) >= 3  # At least 3 security headers
    request_id_success = "X-Request-ID" in response.headers
    cors_success = cors_headers_present
    
    return security_header_success and request_id_success and cors_success

def test_ai_provider_integration():
    """Test AI provider integration"""
    print("\n=== Testing AI Provider Integration ===")
    
    # Create a test user for authentication
    username = f"testuser_{random.randint(1000, 9999)}"
    email = f"test{random.randint(1000, 9999)}@example.com"
    password = "TestPassword123!"
    
    print(f"Creating test user: {username} ({email})...")
    
    register_response = requests.post(
        f"{BACKEND_URL}/auth/register",
        headers={"Content-Type": "application/json"},
        json={
            "username": username,
            "email": email,
            "password": password,
            "role": "student",
            "full_name": "Test User"
        }
    )
    
    if register_response.status_code != 200:
        print(f"❌ Failed to create test user: {register_response.status_code}")
        return False
    
    auth_data = register_response.json()
    auth_token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }
    
    print("✅ Test user created successfully")
    
    # Test basic AI chat to verify OpenAI integration
    print("\nTesting basic AI chat (OpenAI integration)...")
    
    chat_data = {
        "message": "Can you explain the concept of photosynthesis?",
        "session_id": None  # New session
    }
    
    chat_response = requests.post(
        f"{BACKEND_URL}/ai/chat",
        headers=headers,
        json=chat_data
    )
    
    if chat_response.status_code == 200:
        chat_data = chat_response.json()
        print("✅ Basic AI chat with OpenAI integration working")
        print(f"  - Response preview: {chat_data.get('response', '')[:100]}...")
    else:
        print(f"❌ Basic AI chat failed with status {chat_response.status_code}")
    
    # Test advanced AI features
    advanced_features = [
        {
            "name": "Enhanced AI chat",
            "endpoint": "/ai/enhanced-chat",
            "method": "POST",
            "data": {
                "message": "I'm feeling frustrated with this math problem.",
                "emotional_context": "frustrated",
                "learning_style": "visual"
            }
        },
        {
            "name": "Personalized learning path",
            "endpoint": "/ai/personalized-learning-path",
            "method": "POST",
            "data": {
                "subject": "mathematics",
                "learning_goals": ["Master algebra", "Understand calculus basics"],
                "target_completion_weeks": 8,
                "preferred_learning_style": "visual"
            }
        },
        {
            "name": "Learning style assessment",
            "endpoint": "/ai/learning-style-assessment",
            "method": "POST",
            "data": {
                "responses": [{"question": "How do you prefer to learn?", "answer": "I like visual aids"}]
            }
        },
        {
            "name": "Emotional analytics",
            "endpoint": f"/ai/emotional-analytics/{user_id}",
            "method": "GET",
            "data": None
        },
        {
            "name": "Voice-to-text processing",
            "endpoint": "/ai/voice-to-text",
            "method": "POST",
            "data": {
                "audio_data": "base64_encoded_audio_placeholder"
            }
        }
    ]
    
    print("\nTesting advanced AI features...")
    feature_results = {}
    
    for feature in advanced_features:
        print(f"\nTesting {feature['name']}...")
        try:
            if feature["method"] == "POST":
                response = requests.post(
                    f"{BACKEND_URL}{feature['endpoint']}",
                    headers=headers,
                    json=feature["data"]
                )
            else:
                response = requests.get(
                    f"{BACKEND_URL}{feature['endpoint']}",
                    headers=headers
                )
            
            if response.status_code == 200:
                print(f"✅ {feature['name']} endpoint working (200 OK)")
                feature_results[feature["name"]] = True
            elif response.status_code == 403:
                print(f"✅ {feature['name']} endpoint exists but requires authentication (403 Forbidden)")
                feature_results[feature["name"]] = True
            elif response.status_code in [400, 422] and feature["name"] == "Voice-to-text processing":
                print(f"✅ {feature['name']} endpoint exists (couldn't test fully without audio)")
                feature_results[feature["name"]] = True
            elif response.status_code == 404:
                print(f"❌ {feature['name']} endpoint not found (404)")
                feature_results[feature["name"]] = False
            else:
                print(f"❓ {feature['name']} returned unexpected status: {response.status_code}")
                feature_results[feature["name"]] = False
        except Exception as e:
            print(f"❌ Error testing {feature['name']}: {e}")
            feature_results[feature["name"]] = False
    
    # Calculate success percentage
    basic_ai_success = chat_response.status_code == 200
    advanced_ai_success = sum(1 for result in feature_results.values() if result) / len(feature_results)
    
    print(f"\nAdvanced AI features success rate: {advanced_ai_success * 100:.1f}%")
    
    return basic_ai_success and advanced_ai_success >= 0.6  # At least 60% of advanced features working

def print_summary(results):
    """Print a summary of test results"""
    print("\n" + "="*80)
    print("STARGUIDE PHASE 1 STRATEGIC ENHANCEMENTS TEST SUMMARY")
    print("="*80)
    
    for component, success in results.items():
        status = "✅ WORKING" if success else "❌ NOT WORKING"
        print(f"{component}: {status}")
    
    overall_success = all(results.values())
    print("\nOverall Status:", "✅ ALL COMPONENTS WORKING" if overall_success else "❌ SOME COMPONENTS NOT WORKING")

if __name__ == "__main__":
    # Run all tests
    results = {
        "Rate Limiting System": test_rate_limiting(),
        "Monitoring & Metrics": test_monitoring_metrics(),
        "Security Infrastructure": test_security_infrastructure(),
        "AI Provider Integration": test_ai_provider_integration()
    }
    
    print_summary(results)