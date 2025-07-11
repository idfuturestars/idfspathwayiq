# STARGUIDE DOMAIN SWITCHING GUIDE

## 🎯 Current Status

**Active Domain**: `https://emergency-stargate.emergent.host`
**Target Domain**: `https://stargateai.emergent.host`
**Status**: Ready for switch when infrastructure team completes deployment

## 🔄 Quick Domain Switch Instructions

### To Switch to stargateai.emergent.host:

1. **Update Frontend Configuration**:
   ```bash
   # Edit /app/frontend/.env
   REACT_APP_BACKEND_URL=https://stargateai.emergent.host
   ```

2. **Restart Frontend Service**:
   ```bash
   sudo supervisorctl restart frontend
   ```

3. **Verify Domain is Working**:
   ```bash
   curl https://stargateai.emergent.host/api/health
   ```

### Current Configuration Files Updated:

- ✅ **Frontend .env**: Ready for both domains
- ✅ **Backend CORS**: Configured for both domains  
- ✅ **Mobile optimization**: Applied to both
- ✅ **Security headers**: Updated for both

## 🧪 Domain Verification Commands

```bash
# Test current domain
curl https://emergency-stargate.emergent.host/api/health

# Test target domain  
curl https://stargateai.emergent.host/api/health

# Full authentication test
python /app/test_domain_switch.py
```

## ⚙️ Technical Implementation Details

### CORS Configuration
Both domains are pre-configured in backend CORS settings:
- `https://emergency-stargate.emergent.host` ✅
- `https://stargateai.emergent.host` ✅
- Wildcard support for `*.emergent.host` ✅

### SSL/HTTPS Support  
- Both domains have SSL certificates
- HTTPS redirects configured
- Security headers applied

### API Routing
- All endpoints use `/api` prefix
- Authentication tokens work across domains
- Database connections maintained

## 🚨 Deployment Checklist

When infrastructure team confirms stargateai deployment:

- [ ] Verify stargateai.emergent.host/api/health returns 200
- [ ] Update frontend .env file
- [ ] Restart frontend service
- [ ] Test authentication flow
- [ ] Verify AI features functionality
- [ ] Test mobile responsiveness
- [ ] Confirm all educational features

## 📞 Support Contacts

**Infrastructure Team**: Confirm stargateai.emergent.host backend deployment
**Frontend Ready**: ✅ Immediate switch capability
**Backend Ready**: ✅ CORS pre-configured
**Testing Ready**: ✅ Comprehensive verification scripts