#!/usr/bin/env python3
"""
PathwayIQ Authentication Flow Test
Focused testing for the authentication flow issue where frontend gets stuck at loading screen.
"""

import requests
import json
import time
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://f06e2f74-180c-4b41-b48d-724554ebd962.preview.emergentagent.com/api"

class AuthenticationFlowTest:
    """Test authentication flow with demo credentials"""
    
    def __init__(self):
        self.headers = {"Content-Type": "application/json"}
        self.demo_credentials = {
            "student": {
                "email": "student@starguide.com",
                "password": "demo123"
            },
            "teacher": {
                "email": "teacher@starguide.com", 
                "password": "demo123"
            }
        }
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_backend_connectivity(self):
        """Test basic backend connectivity"""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Backend Connectivity", True, 
                              f"Backend is accessible, status: {data.get('status', 'unknown')}")
                return True
            else:
                self.log_result("Backend Connectivity", False, 
                              f"Backend returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_result("Backend Connectivity", False, 
                          f"Cannot connect to backend: {str(e)}")
            return False
    
    def test_cors_preflight(self):
        """Test CORS preflight request"""
        try:
            # Simulate frontend CORS preflight request
            headers = {
                "Origin": "https://f06e2f74-180c-4b41-b48d-724554ebd962.preview.emergentagent.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization"
            }
            
            response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers, timeout=10)
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }
            
            if response.status_code in [200, 204]:
                self.log_result("CORS Preflight", True, 
                              "CORS preflight successful", cors_headers)
                return True
            else:
                self.log_result("CORS Preflight", False, 
                              f"CORS preflight failed with status {response.status_code}", 
                              cors_headers)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("CORS Preflight", False, 
                          f"CORS preflight request failed: {str(e)}")
            return False
    
    def test_demo_login(self, user_type="student"):
        """Test login with demo credentials"""
        try:
            credentials = self.demo_credentials[user_type]
            
            # Test login request
            response = requests.post(
                f"{BACKEND_URL}/auth/login",
                headers=self.headers,
                json=credentials,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["access_token", "token_type", "user"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(f"Demo Login ({user_type})", False,
                                  f"Missing required fields: {missing_fields}", data)
                    return None
                
                # Validate token format
                token = data["access_token"]
                if not token or len(token) < 10:
                    self.log_result(f"Demo Login ({user_type})", False,
                                  "Invalid token format", {"token_length": len(token)})
                    return None
                
                # Validate user data
                user_data = data["user"]
                if user_data.get("email") != credentials["email"]:
                    self.log_result(f"Demo Login ({user_type})", False,
                                  "User email mismatch", 
                                  {"expected": credentials["email"], "received": user_data.get("email")})
                    return None
                
                self.log_result(f"Demo Login ({user_type})", True,
                              f"Login successful for {credentials['email']}", 
                              {
                                  "user_id": user_data.get("id"),
                                  "role": user_data.get("role"),
                                  "token_type": data["token_type"],
                                  "token_length": len(token)
                              })
                return data
                
            elif response.status_code == 401:
                self.log_result(f"Demo Login ({user_type})", False,
                              "Invalid credentials - demo user may not exist", 
                              {"email": credentials["email"]})
                return None
            else:
                self.log_result(f"Demo Login ({user_type})", False,
                              f"Login failed with status {response.status_code}",
                              {"response": response.text[:200]})
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_result(f"Demo Login ({user_type})", False,
                          f"Login request failed: {str(e)}")
            return None
    
    def test_token_validation(self, auth_data):
        """Test token validation with /auth/me endpoint"""
        if not auth_data:
            self.log_result("Token Validation", False, "No auth data provided")
            return False
            
        try:
            token = auth_data["access_token"]
            auth_headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
            
            response = requests.get(
                f"{BACKEND_URL}/auth/me",
                headers=auth_headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                original_user = auth_data["user"]
                
                # Validate user data consistency
                if user_data.get("id") == original_user.get("id"):
                    self.log_result("Token Validation", True,
                                  "Token validation successful",
                                  {
                                      "user_id": user_data.get("id"),
                                      "email": user_data.get("email"),
                                      "role": user_data.get("role")
                                  })
                    return True
                else:
                    self.log_result("Token Validation", False,
                                  "User data mismatch between login and /auth/me",
                                  {
                                      "login_user_id": original_user.get("id"),
                                      "me_user_id": user_data.get("id")
                                  })
                    return False
            elif response.status_code == 401:
                self.log_result("Token Validation", False,
                              "Token validation failed - unauthorized")
                return False
            else:
                self.log_result("Token Validation", False,
                              f"Token validation failed with status {response.status_code}",
                              {"response": response.text[:200]})
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Token Validation", False,
                          f"Token validation request failed: {str(e)}")
            return False
    
    def test_error_scenarios(self):
        """Test authentication error scenarios"""
        
        # Test 1: Invalid credentials
        try:
            invalid_creds = {
                "email": "invalid@example.com",
                "password": "wrongpassword"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/auth/login",
                headers=self.headers,
                json=invalid_creds,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Invalid Credentials Test", True,
                              "Correctly rejected invalid credentials")
            else:
                self.log_result("Invalid Credentials Test", False,
                              f"Unexpected status for invalid credentials: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Credentials Test", False,
                          f"Error testing invalid credentials: {str(e)}")
        
        # Test 2: Missing token
        try:
            response = requests.get(
                f"{BACKEND_URL}/auth/me",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Missing Token Test", True,
                              "Correctly rejected request without token")
            else:
                self.log_result("Missing Token Test", False,
                              f"Unexpected status for missing token: {response.status_code}")
        except Exception as e:
            self.log_result("Missing Token Test", False,
                          f"Error testing missing token: {str(e)}")
        
        # Test 3: Invalid token format
        try:
            invalid_headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer invalid_token_format"
            }
            
            response = requests.get(
                f"{BACKEND_URL}/auth/me",
                headers=invalid_headers,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result("Invalid Token Test", True,
                              "Correctly rejected invalid token format")
            else:
                self.log_result("Invalid Token Test", False,
                              f"Unexpected status for invalid token: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Token Test", False,
                          f"Error testing invalid token: {str(e)}")
    
    def test_jwt_token_structure(self, auth_data):
        """Test JWT token structure"""
        if not auth_data:
            self.log_result("JWT Token Structure", False, "No auth data provided")
            return False
            
        try:
            token = auth_data["access_token"]
            
            # Basic JWT structure check (should have 3 parts separated by dots)
            parts = token.split('.')
            if len(parts) == 3:
                self.log_result("JWT Token Structure", True,
                              f"JWT token has correct structure (3 parts)",
                              {"token_parts": len(parts), "token_preview": token[:20] + "..."})
                return True
            else:
                self.log_result("JWT Token Structure", False,
                              f"JWT token has incorrect structure ({len(parts)} parts)",
                              {"token_parts": len(parts)})
                return False
                
        except Exception as e:
            self.log_result("JWT Token Structure", False,
                          f"Error checking JWT structure: {str(e)}")
            return False
    
    def test_response_headers(self):
        """Test response headers for security and CORS"""
        try:
            response = requests.post(
                f"{BACKEND_URL}/auth/login",
                headers=self.headers,
                json=self.demo_credentials["student"],
                timeout=10
            )
            
            # Check for security headers
            security_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options", 
                "X-XSS-Protection",
                "Strict-Transport-Security",
                "Content-Security-Policy",
                "X-Request-ID"
            ]
            
            present_headers = []
            missing_headers = []
            
            for header in security_headers:
                if header in response.headers:
                    present_headers.append(f"{header}: {response.headers[header]}")
                else:
                    missing_headers.append(header)
            
            if present_headers:
                self.log_result("Security Headers", True,
                              f"Found {len(present_headers)} security headers",
                              {"present": present_headers, "missing": missing_headers})
            else:
                self.log_result("Security Headers", False,
                              "No security headers found",
                              {"missing": missing_headers})
                
        except Exception as e:
            self.log_result("Security Headers", False,
                          f"Error checking response headers: {str(e)}")
    
    def run_comprehensive_test(self):
        """Run comprehensive authentication flow test"""
        print("=" * 60)
        print("PATHWAYIQ AUTHENTICATION FLOW TEST")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print()
        
        # Test 1: Backend connectivity
        if not self.test_backend_connectivity():
            print("\n❌ CRITICAL: Backend is not accessible. Cannot continue testing.")
            return self.generate_summary()
        
        # Test 2: CORS preflight
        self.test_cors_preflight()
        
        # Test 3: Response headers
        self.test_response_headers()
        
        # Test 4: Demo user login (student)
        student_auth = self.test_demo_login("student")
        
        # Test 5: Demo user login (teacher)  
        teacher_auth = self.test_demo_login("teacher")
        
        # Test 6: JWT token structure
        if student_auth:
            self.test_jwt_token_structure(student_auth)
        
        # Test 7: Token validation
        if student_auth:
            self.test_token_validation(student_auth)
        
        # Test 8: Error scenarios
        self.test_error_scenarios()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        print()
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if "❌ FAIL" in r["status"]]
        if failed_tests:
            print("FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        print()
        
        # Critical issues analysis
        critical_issues = []
        
        # Check for backend connectivity
        backend_test = next((r for r in self.test_results if r["test"] == "Backend Connectivity"), None)
        if backend_test and "❌ FAIL" in backend_test["status"]:
            critical_issues.append("Backend is not accessible")
        
        # Check for demo user login failures
        student_login = next((r for r in self.test_results if r["test"] == "Demo Login (student)"), None)
        teacher_login = next((r for r in self.test_results if r["test"] == "Demo Login (teacher)"), None)
        
        if student_login and "❌ FAIL" in student_login["status"]:
            critical_issues.append("Demo student login failed - user may not exist in database")
        
        if teacher_login and "❌ FAIL" in teacher_login["status"]:
            critical_issues.append("Demo teacher login failed - user may not exist in database")
        
        # Check for token validation issues
        token_test = next((r for r in self.test_results if r["test"] == "Token Validation"), None)
        if token_test and "❌ FAIL" in token_test["status"]:
            critical_issues.append("JWT token validation failed")
        
        if critical_issues:
            print("🚨 CRITICAL ISSUES IDENTIFIED:")
            for issue in critical_issues:
                print(f"  - {issue}")
        else:
            print("✅ No critical authentication issues found")
        
        print("\n" + "=" * 60)
        
        return {
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "success_rate": (passed/total*100) if total > 0 else 0,
            "critical_issues": critical_issues,
            "test_results": self.test_results
        }

if __name__ == "__main__":
    tester = AuthenticationFlowTest()
    summary = tester.run_comprehensive_test()
    
    # Exit with error code if critical issues found
    if summary["critical_issues"]:
        sys.exit(1)
    else:
        sys.exit(0)