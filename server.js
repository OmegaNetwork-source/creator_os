// Backend server for Creator OS - TikTok API Proxy
// Deploy this to Render and set environment variables

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Environment variables (set these in Render)
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || 'sbawfp2mg0wxqesz9n';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || 'taAgtouxyUrK7xwlC8cjAg2XuINm2jfu';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://creatoros.omeganetwork.co/callback.html';

// Log environment variable status (without exposing secrets)
console.log('🔧 Environment Check:');
console.log('  TIKTOK_CLIENT_KEY:', TIKTOK_CLIENT_KEY ? TIKTOK_CLIENT_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('  TIKTOK_CLIENT_SECRET:', TIKTOK_CLIENT_SECRET ? 'SET (' + TIKTOK_CLIENT_SECRET.length + ' chars)' : 'NOT SET');
console.log('  REDIRECT_URI:', REDIRECT_URI);
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');

// Check if using environment variable (not fallback)
const usingEnvSecret = !!process.env.TIKTOK_CLIENT_SECRET;
if (!usingEnvSecret) {
    console.warn('⚠️  WARNING: Using default client secret. Make sure to set TIKTOK_CLIENT_SECRET in Render environment variables!');
} else {
    console.log('  ✅ Using environment variable for client secret (not fallback)');
}

// OAuth Token Exchange Endpoint
app.post('/api/tiktok/token', async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;

        console.log('[TOKEN] Received token exchange request');
        console.log('[TOKEN] Code:', code ? code.substring(0, 10) + '...' : 'MISSING');
        console.log('[TOKEN] Client Key:', TIKTOK_CLIENT_KEY);
        console.log('[TOKEN] Redirect URI from request:', redirect_uri || 'NOT PROVIDED');
        console.log('[TOKEN] Redirect URI from env var:', REDIRECT_URI);
        
        // Use redirect_uri from request if provided, otherwise use env var
        // This ensures we use the exact same redirect_uri that was used in authorization
        const finalRedirectUri = redirect_uri || REDIRECT_URI;
        console.log('[TOKEN] Using redirect URI:', finalRedirectUri);

        if (!code) {
            console.error('[TOKEN] No authorization code provided');
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        
        // Verify values before sending
        console.log('[TOKEN] === PRE-FLIGHT CHECK ===');
        console.log('[TOKEN] Client Key:', TIKTOK_CLIENT_KEY);
        console.log('[TOKEN] Client Key length:', TIKTOK_CLIENT_KEY?.length || 0);
        console.log('[TOKEN] Client Secret length:', TIKTOK_CLIENT_SECRET?.length || 0);
        console.log('[TOKEN] Client Secret first 4 chars:', TIKTOK_CLIENT_SECRET?.substring(0, 4) || 'NONE');
        console.log('[TOKEN] Client Secret last 4 chars:', TIKTOK_CLIENT_SECRET?.substring(TIKTOK_CLIENT_SECRET.length - 4) || 'NONE');
        console.log('[TOKEN] Redirect URI:', finalRedirectUri);
        console.log('[TOKEN] Code length:', code?.length || 0);
        console.log('[TOKEN] ========================');
        
        const requestBody = new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY,
            client_secret: TIKTOK_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: finalRedirectUri
        });

        console.log('[TOKEN] Requesting token from TikTok:', tokenUrl);
        console.log('[TOKEN] Request body (without secret):', {
            client_key: TIKTOK_CLIENT_KEY,
            code: code.substring(0, 10) + '...',
            grant_type: 'authorization_code',
            redirect_uri: finalRedirectUri,
            client_secret_length: TIKTOK_CLIENT_SECRET?.length || 0
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody
        });

        console.log('[TOKEN] TikTok response status:', response.status, response.statusText);

        const data = await response.json();
        
        // TikTok returns tokens at top level: { access_token, refresh_token, ... }
        // OR nested: { data: { access_token, refresh_token, ... } }
        const accessToken = data.access_token || data.data?.access_token;
        const refreshToken = data.refresh_token || data.data?.refresh_token;
        
        console.log('[TOKEN] TikTok response data:', {
            hasError: !!data.error,
            error: data.error,
            errorDescription: data.error_description,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            tokenLocation: data.access_token ? 'top-level' : (data.data?.access_token ? 'nested' : 'none')
        });

        // TikTok returns 200 OK even when there's an error in the response body
        // Check for errors in the response data, not just HTTP status
        if (data.error || !accessToken) {
            console.error('[TOKEN] ❌ Token exchange failed');
            console.error('[TOKEN] HTTP Status:', response.status, response.statusText);
            console.error('[TOKEN] Error response:', JSON.stringify(data, null, 2));
            
            if (data.error === 'invalid_client') {
                console.error('[TOKEN] ⚠️  INVALID_CLIENT ERROR - Possible causes:');
                console.error('[TOKEN]   1. Client secret in Render does not match TikTok Developer Portal');
                console.error('[TOKEN]   2. Client secret has leading/trailing spaces');
                console.error('[TOKEN]   3. Client key is incorrect');
                console.error('[TOKEN]   4. Using wrong app credentials (sandbox vs production)');
                console.error('[TOKEN]');
                console.error('[TOKEN] 🔍 DEBUG INFO:');
                console.error('[TOKEN]   Client Key being used:', TIKTOK_CLIENT_KEY);
                console.error('[TOKEN]   Client Secret length:', TIKTOK_CLIENT_SECRET?.length || 0);
                console.error('[TOKEN]   Expected secret length: 32');
                console.error('[TOKEN]   Secret from env var:', !!process.env.TIKTOK_CLIENT_SECRET);
                console.error('[TOKEN]   Secret first 4 chars:', TIKTOK_CLIENT_SECRET?.substring(0, 4));
                console.error('[TOKEN]   Secret last 4 chars:', TIKTOK_CLIENT_SECRET?.substring(TIKTOK_CLIENT_SECRET.length - 4));
                console.error('[TOKEN]');
                console.error('[TOKEN] 📋 ACTION REQUIRED:');
                console.error('[TOKEN]   1. Go to TikTok Developer Portal: https://developers.tiktok.com');
                console.error('[TOKEN]   2. Navigate to your app → Basic Information');
                console.error('[TOKEN]   3. Copy the EXACT Client Secret (no spaces)');
                console.error('[TOKEN]   4. Update TIKTOK_CLIENT_SECRET in Render environment variables');
                console.error('[TOKEN]   5. Redeploy the service');
            }
            
            return res.status(400).json({
                error: data.error || 'Token exchange failed',
                error_description: data.error_description || data.error?.message || 'No access token in response',
                ...data
            });
        }

        console.log('[TOKEN] ✅ Token exchange successful');
        console.log('[TOKEN] Access token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NONE');
        console.log('[TOKEN] Refresh token:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'NONE');
        
        // Return the response as-is (TikTok format)
        res.json(data);
    } catch (error) {
        console.error('[TOKEN] Token exchange error:', error);
        res.status(500).json({ 
            error: 'Failed to exchange token',
            error_description: error.message,
            details: error.toString()
        });
    }
});

// Refresh Token Endpoint
app.post('/api/tiktok/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Proxy API Requests (POST)
app.post('/api/tiktok/*', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const endpoint = req.path.replace('/api/tiktok', '');
        // Ensure endpoint starts with / for TikTok API
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `https://open.tiktokapis.com/v2${cleanEndpoint}`;

        console.log(`[POST] Proxying to TikTok: ${url}`, { body: req.body });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        console.log(`[POST] TikTok response:`, { status: response.status, endpoint, hasData: !!data });

        if (!response.ok) {
            console.error(`[POST] TikTok API error:`, data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[POST] API proxy error:', error);
        res.status(500).json({ error: 'API request failed', message: error.message });
    }
});

// Get API endpoint (TikTok API mostly uses POST, but handle GET for compatibility)
app.get('/api/tiktok/*', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const endpoint = req.path.replace('/api/tiktok', '');
        // Ensure endpoint starts with / for TikTok API
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `https://open.tiktokapis.com/v2${cleanEndpoint}`;

        console.log(`[GET] Proxying to TikTok: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log(`[GET] TikTok response:`, { status: response.status, hasData: !!data });

        if (!response.ok) {
            console.error(`[GET] TikTok API error:`, data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[GET] API proxy error:', error);
        res.status(500).json({ error: 'API request failed', message: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to verify environment variables (without exposing secrets)
app.get('/api/debug/env', (req, res) => {
    res.json({
        client_key: TIKTOK_CLIENT_KEY,
        client_key_length: TIKTOK_CLIENT_KEY?.length || 0,
        client_secret_set: !!TIKTOK_CLIENT_SECRET,
        client_secret_length: TIKTOK_CLIENT_SECRET?.length || 0,
        client_secret_first_4: TIKTOK_CLIENT_SECRET?.substring(0, 4) || 'NONE',
        client_secret_last_4: TIKTOK_CLIENT_SECRET?.substring(TIKTOK_CLIENT_SECRET.length - 4) || 'NONE',
        redirect_uri: REDIRECT_URI,
        from_env_var: {
            client_key: !!process.env.TIKTOK_CLIENT_KEY,
            client_secret: !!process.env.TIKTOK_CLIENT_SECRET,
            redirect_uri: !!process.env.REDIRECT_URI
        },
        expected_secret: 'taAgtouxyUrK7xwlC8cjAg2XulNm2jfu',
        secret_matches: TIKTOK_CLIENT_SECRET === 'taAgtouxyUrK7xwlC8cjAg2XulNm2jfu'
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Creator OS backend server running on port ${PORT}`);
    console.log(`TikTok Client Key: ${TIKTOK_CLIENT_KEY.substring(0, 10)}...`);
    console.log(`Environment Variables Status:`);
    console.log(`  TIKTOK_CLIENT_KEY: ${TIKTOK_CLIENT_KEY ? '✅ SET' : '❌ MISSING'}`);
    console.log(`  TIKTOK_CLIENT_SECRET: ${TIKTOK_CLIENT_SECRET ? '✅ SET (' + TIKTOK_CLIENT_SECRET.length + ' chars)' : '❌ MISSING'}`);
    console.log(`  REDIRECT_URI: ${REDIRECT_URI}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    // Verify client secret matches expected value
    const expectedSecret = 'taAgtouxyUrK7xwlC8cjAg2XulNm2jfu';
    if (TIKTOK_CLIENT_SECRET === expectedSecret) {
        console.log(`  ✅ Client secret matches expected value`);
    } else {
        console.log(`  ⚠️  Client secret does NOT match expected value`);
        console.log(`  Expected length: ${expectedSecret.length}, Got: ${TIKTOK_CLIENT_SECRET?.length || 0}`);
    }
});
