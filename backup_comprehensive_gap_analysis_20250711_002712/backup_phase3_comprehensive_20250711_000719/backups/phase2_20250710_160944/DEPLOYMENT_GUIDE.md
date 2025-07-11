# STARGUIDE PLATFORM DEPLOYMENT INSTRUCTIONS

## 🚀 QUICK SETUP

### 1. Environment Configuration
Copy template files and add your API keys:
```bash
cp backend/.env.template backend/.env
cp frontend/.env.template frontend/.env
```

### 2. Add Your API Keys to backend/.env:
```env
OPENAI_API_KEY=sk-proj-[your-openai-key]
CLAUDE_API_KEY=sk-ant-[your-claude-key] 
GEMINI_API_KEY=AIza[your-gemini-key]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-secret]
GITHUB_CLIENT_ID=[your-github-client-id]
GITHUB_CLIENT_SECRET=[your-github-secret]
JWT_SECRET=[your-jwt-secret]
PASSWORD_SALT=[your-password-salt]
```

### 3. Update frontend/.env:
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### 4. Install Dependencies:
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend  
cd frontend && yarn install
```

### 5. Seed Question Database:
```bash
cd backend && python question_bank_seeder.py
```

### 6. Start Services:
```bash
# Backend (port 8001)
cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (port 3000)
cd frontend && yarn start
```

## ✅ Verification
- Backend health: http://localhost:8001/api/health
- Frontend: http://localhost:3000
- Test login/register and AI chat functionality

## 🔐 Security Notes
- Never commit .env files with real API keys
- Use .env.template for sharing configuration
- Keep API keys secure and rotate regularly