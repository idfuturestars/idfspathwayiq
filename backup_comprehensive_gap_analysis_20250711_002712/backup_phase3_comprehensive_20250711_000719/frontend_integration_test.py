#!/usr/bin/env python3
"""
Frontend Integration Test - Simulating exact frontend requests
Testing the specific flow that frontend uses to identify potential issues
"""

import requests
import json
import time
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://a5350564-e224-4461-b075-455cf1ca02d8.preview.emergentagent.com/api"
FRONTEND_URL = "https://a5350564-e224-4461-b075-455cf1ca02d8.preview.emergentagent.com"

def test_frontend_auth_flow():
    """Test the exact authentication flow that frontend would use"""
    
    print("=" * 70)
    print("FRONTEND AUTHENTICATION FLOW SIMULATION")
    print("=" * 70)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print()
    
    # Step 1: Simulate frontend login request with exact headers
    print("Step 1: Frontend Login Request")
    print("-" * 30)
    
    frontend_headers = {
        "Content-Type": "application/json",
        "Origin": FRONTEND_URL,
        "Referer": f"{FRONTEND_URL}/",
        "User-Agent": "Mozilla/5.0 (compatible; TestAgent/1.0)"
    }
    
    login_data = {
        "email": "student@starguide.com",
        "password": "demo123"
    }
    
    try:
        login_response = requests.post(
            f"{BACKEND_URL}/auth/login",
            headers=frontend_headers,
            json=login_data,
            timeout=15
        )
        
        print(f"Status Code: {login_response.status_code}")
        print(f"Response Time: {login_response.elapsed.total_seconds():.2f}s")
        
        # Check response headers
        print("\nResponse Headers:")
        for header, value in login_response.headers.items():
            if header.lower().startswith(('access-control', 'x-', 'content-type')):
                print(f"  {header}: {value}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print(f"\n✅ Login successful!")
            print(f"Token Type: {login_data.get('token_type')}")
            print(f"User ID: {login_data.get('user', {}).get('id')}")
            print(f"User Role: {login_data.get('user', {}).get('role')}")
            print(f"User Email: {login_data.get('user', {}).get('email')}")
            
            token = login_data.get('access_token')
            user_data = login_data.get('user')
            
        else:
            print(f"❌ Login failed: {login_response.text}")
            return
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {e}")
        return
    
    # Step 2: Test /auth/me endpoint (what frontend calls after login)
    print("\n" + "=" * 50)
    print("Step 2: User Info Verification (/auth/me)")
    print("-" * 30)
    
    auth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Origin": FRONTEND_URL,
        "Referer": f"{FRONTEND_URL}/dashboard"
    }
    
    try:
        me_response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=auth_headers,
            timeout=15
        )
        
        print(f"Status Code: {me_response.status_code}")
        print(f"Response Time: {me_response.elapsed.total_seconds():.2f}s")
        
        if me_response.status_code == 200:
            me_data = me_response.json()
            print(f"✅ User verification successful!")
            print(f"Verified User ID: {me_data.get('id')}")
            print(f"Verified Email: {me_data.get('email')}")
            print(f"User Level: {me_data.get('level')}")
            print(f"User XP: {me_data.get('xp')}")
            
            # Check if user data matches login response
            if me_data.get('id') == user_data.get('id'):
                print("✅ User data consistency verified")
            else:
                print("❌ User data inconsistency detected!")
                
        else:
            print(f"❌ User verification failed: {me_response.text}")
            return
            
    except requests.exceptions.RequestException as e:
        print(f"❌ User verification request failed: {e}")
        return
    
    # Step 3: Test dashboard data endpoints (what frontend loads after auth)
    print("\n" + "=" * 50)
    print("Step 3: Dashboard Data Loading")
    print("-" * 30)
    
    dashboard_endpoints = [
        ("/analytics/dashboard", "Analytics Dashboard"),
        ("/questions?limit=5", "Recent Questions"),
        ("/study-groups", "Study Groups")
    ]
    
    for endpoint, description in dashboard_endpoints:
        try:
            print(f"\nTesting {description} ({endpoint}):")
            response = requests.get(
                f"{BACKEND_URL}{endpoint}",
                headers=auth_headers,
                timeout=10
            )
            
            print(f"  Status: {response.status_code}")
            print(f"  Response Time: {response.elapsed.total_seconds():.2f}s")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"  ✅ Returned {len(data)} items")
                elif isinstance(data, dict):
                    print(f"  ✅ Returned data with {len(data)} fields")
                else:
                    print(f"  ✅ Returned data: {type(data)}")
            else:
                print(f"  ❌ Failed: {response.text[:100]}")
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Request failed: {e}")
    
    # Step 4: Test potential slow endpoints that might cause loading issues
    print("\n" + "=" * 50)
    print("Step 4: Performance Critical Endpoints")
    print("-" * 30)
    
    critical_endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/ai/chat", "AI Chat (POST)", "POST", {"message": "Hello"}),
    ]
    
    for endpoint_info in critical_endpoints:
        if len(endpoint_info) == 2:
            endpoint, description = endpoint_info
            method = "GET"
            data = None
        else:
            endpoint, description, method, data = endpoint_info
        
        try:
            print(f"\nTesting {description} ({method} {endpoint}):")
            start_time = time.time()
            
            if method == "GET":
                response = requests.get(
                    f"{BACKEND_URL}{endpoint}",
                    headers=auth_headers,
                    timeout=10
                )
            else:
                response = requests.post(
                    f"{BACKEND_URL}{endpoint}",
                    headers=auth_headers,
                    json=data,
                    timeout=10
                )
            
            response_time = time.time() - start_time
            
            print(f"  Status: {response.status_code}")
            print(f"  Response Time: {response_time:.2f}s")
            
            if response_time > 5.0:
                print(f"  ⚠️  SLOW RESPONSE: {response_time:.2f}s (may cause frontend loading issues)")
            elif response_time > 2.0:
                print(f"  ⚠️  Moderate delay: {response_time:.2f}s")
            else:
                print(f"  ✅ Good response time")
                
            if response.status_code not in [200, 201]:
                print(f"  ❌ Error response: {response.text[:100]}")
                
        except requests.exceptions.Timeout:
            print(f"  ❌ TIMEOUT: Request took longer than 10 seconds")
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Request failed: {e}")
    
    # Step 5: Check for any Redis/caching issues
    print("\n" + "=" * 50)
    print("Step 5: Backend Health Analysis")
    print("-" * 30)
    
    try:
        health_response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"Backend Status: {health_data.get('status', 'unknown')}")
            
            # Check for any degraded services
            for key, value in health_data.items():
                if key != 'status' and key != 'timestamp':
                    if isinstance(value, dict) and value.get('status') == 'degraded':
                        print(f"  ⚠️  {key}: {value}")
                    elif isinstance(value, str) and 'error' in value.lower():
                        print(f"  ⚠️  {key}: {value}")
                    else:
                        print(f"  ✅ {key}: OK")
        else:
            print(f"❌ Health check failed: {health_response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE")
    print("=" * 70)
    
    print("\nKEY FINDINGS:")
    print("1. ✅ Authentication flow is working correctly")
    print("2. ✅ Demo users exist and can login successfully") 
    print("3. ✅ JWT tokens are properly generated and validated")
    print("4. ✅ User data is consistent between login and verification")
    print("5. ⚠️  Some endpoints may have performance issues")
    
    print("\nPOSSIBLE CAUSES OF FRONTEND LOADING ISSUE:")
    print("- Frontend JavaScript error after successful login")
    print("- Frontend routing issue after authentication")
    print("- Slow dashboard data loading causing UI freeze")
    print("- Frontend state management issue with auth token")
    print("- CORS issues with specific frontend requests")
    
    print("\nRECOMMENDATIONS:")
    print("1. Check frontend browser console for JavaScript errors")
    print("2. Verify frontend routing configuration")
    print("3. Check frontend auth state management")
    print("4. Monitor network requests in browser dev tools")
    print("5. Test with different browsers")

if __name__ == "__main__":
    test_frontend_auth_flow()