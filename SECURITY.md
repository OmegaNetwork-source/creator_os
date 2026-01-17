# Security Notice - TikTok API Integration

## ⚠️ Important: Client Secret Security

The current implementation includes the TikTok client secret in the frontend code (`config.js`). **This is only acceptable for sandbox/testing purposes.**

### For Production:

**You MUST move the client secret to a backend server.** The client secret should NEVER be exposed in frontend JavaScript code in production.

### Recommended Architecture:

1. **Backend Server** (Node.js, Python, etc.)
   - Store `client_secret` securely (environment variables)
   - Handle OAuth token exchange
   - Proxy API requests to TikTok
   - Implement rate limiting and caching

2. **Frontend**
   - Only store `client_key` (public)
   - Redirect to backend OAuth endpoint
   - Receive access tokens from backend
   - Make API requests through backend proxy

### Current Sandbox Setup:

- Client Key: `sbawfp2mg0wxqesz9n`
- Client Secret: `taAgtouxyUrK7xwlC8cjAg2XulNm2jfu` (⚠️ Should be server-side only!)

### Next Steps:

1. Set up a backend server (Express.js, Flask, etc.)
2. Move token exchange logic to backend
3. Create API proxy endpoints
4. Update frontend to use backend endpoints
5. Remove client_secret from frontend code

### TikTok API Documentation:

- [TikTok for Developers](https://developers.tiktok.com/)
- [OAuth 2.0 Guide](https://developers.tiktok.com/doc/oauth-overview/)
