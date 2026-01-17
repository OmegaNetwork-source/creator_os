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
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || 'taAgtouxyUrK7xwlC8cjAg2XulNm2jfu';
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
        const { code } = req.body;

        console.log('[TOKEN] Received token exchange request');
        console.log('[TOKEN] Code:', code ? code.substring(0, 10) + '...' : 'MISSING');
        console.log('[TOKEN] Client Key:', TIKTOK_CLIENT_KEY);
        console.log('[TOKEN] Redirect URI:', REDIRECT_URI);

        if (!code) {
            console.error('[TOKEN] No authorization code provided');
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const requestBody = new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY,
            client_secret: TIKTOK_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        });

        console.log('[TOKEN] Requesting token from TikTok:', tokenUrl);
        console.log('[TOKEN] Request body (without secret):', {
            client_key: TIKTOK_CLIENT_KEY,
            code: code.substring(0, 10) + '...',
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
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
        console.log('[TOKEN] TikTok response data:', {
            hasError: !!data.error,
            error: data.error,
            errorDescription: data.error_description,
            hasAccessToken: !!data.data?.access_token
        });

        if (!response.ok) {
            console.error('[TOKEN] Token exchange failed:', data);
            return res.status(response.status).json({
                error: data.error || 'Token exchange failed',
                error_description: data.error_description || data.error?.message,
                ...data
            });
        }

        console.log('[TOKEN] Token exchange successful');
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
        const url = `https://open.tiktokapis.com/v2${endpoint}`;

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
        const url = `https://open.tiktokapis.com/v2${endpoint}`;

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
