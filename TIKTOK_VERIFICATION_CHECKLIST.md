# TikTok API Verification Checklist

## ✅ Confirmed Working:
- Client Secret matches between Render and TikTok Dashboard: `taAgtouxyUrK7xwlC8cjAg2XulNm2jfu`
- Client Key: `sbawfp2mg0wxqesz9n`

## 🔍 Critical Checks for `invalid_client` Error:

### 1. Redirect URI Must Match EXACTLY in 3 Places:

**A. TikTok Developer Portal → Login Kit → Redirect URI:**
- Must be: `https://creatoros.omeganetwork.co/callback.html`
- Check: No trailing slash, exact case, exact URL

**B. Frontend Authorization Request (tiktok-api.js):**
- Uses: `config.redirect_uri` = `https://creatoros.omeganetwork.co/callback.html`

**C. Backend Token Exchange (server.js):**
- Uses: `REDIRECT_URI` env var = `https://creatoros.omeganetwork.co/callback.html`

**⚠️ CRITICAL:** The redirect_uri in the token exchange MUST match exactly what was used in the authorization request.

### 2. Verify in TikTok Developer Portal:

1. Go to: https://developers.tiktok.com
2. Your App → Login Kit → Web
3. Check the Redirect URI listed there
4. It must be EXACTLY: `https://creatoros.omeganetwork.co/callback.html`
   - No `http://` (must be `https://`)
   - No trailing slash
   - Exact domain: `creatoros.omeganetwork.co` (not `www.creatoros...`)
   - Exact path: `/callback.html`

### 3. Check Authorization Code Flow:

The redirect_uri used when generating the auth URL must match the redirect_uri used in token exchange.

**Frontend (Authorization):**
- `getAuthUrl()` uses: `this.config.redirect_uri`

**Backend (Token Exchange):**
- Uses: `REDIRECT_URI` environment variable

These MUST be identical.

### 4. Common `invalid_client` Causes:

1. ✅ Client Secret mismatch - **VERIFIED: MATCHES**
2. ✅ Client Key mismatch - **VERIFIED: MATCHES**
3. ❓ Redirect URI mismatch - **NEEDS VERIFICATION**
4. ❓ Using wrong app (sandbox vs production) - **Check app status**
5. ❓ App not properly configured in TikTok Developer Portal

### 5. Next Steps:

1. **Verify Redirect URI in TikTok Developer Portal:**
   - Login Kit → Web tab
   - Should show: `https://creatoros.omeganetwork.co/callback.html`
   - If different, update it to match exactly

2. **Check App Status:**
   - Is the app in Sandbox or Production?
   - If Sandbox, is your TikTok account added as a Test User?

3. **Try a fresh authorization:**
   - Clear browser cache
   - Try connecting again
   - Check Render logs for the exact redirect_uri being sent
