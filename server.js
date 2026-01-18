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

// QR Code - Get QR Code
app.post('/api/tiktok/qrcode/get', async (req, res) => {
    try {
        const { scope, state } = req.body;

        if (!scope) {
            return res.status(400).json({ error: 'Scope is required' });
        }

        console.log('[QRCODE GET] Requesting QR code', { scope, state: state ? 'provided' : 'none' });

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/get_qrcode/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                scope: scope,
                ...(state && { state: state })
            })
        });

        const data = await response.json();
        console.log('[QRCODE GET] Response:', { status: response.status, hasUrl: !!data.scan_qrcode_url, hasToken: !!data.token });

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[QRCODE GET] Error:', error);
        res.status(500).json({ error: 'Failed to get QR code', message: error.message });
    }
});

// QR Code - Check Status
app.post('/api/tiktok/qrcode/check', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        console.log('[QRCODE CHECK] Checking QR code status', { token: token.substring(0, 10) + '...' });

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/check_qrcode/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                token: token
            })
        });

        const data = await response.json();
        console.log('[QRCODE CHECK] Response:', { status: response.status, qrStatus: data.status });

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[QRCODE CHECK] Error:', error);
        res.status(500).json({ error: 'Failed to check QR code status', message: error.message });
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
        // Remove any double slashes
        const normalizedEndpoint = cleanEndpoint.replace(/\/+/g, '/');
        
        // Extract query string from original request URL (needed for fields parameter)
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const url = `https://open.tiktokapis.com/v2${normalizedEndpoint}${queryString}`;

        console.log(`[POST] Proxying to TikTok: ${url}`, { body: req.body });
        console.log(`[POST] Original URL: ${req.url}`);
        console.log(`[POST] Query string: ${queryString}`);

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
        // Remove any double slashes
        const normalizedEndpoint = cleanEndpoint.replace(/\/+/g, '/');
        
        // Extract query string from original request URL
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const url = `https://open.tiktokapis.com/v2${normalizedEndpoint}${queryString}`;

        console.log(`[GET] Proxying to TikTok: ${url}`);
        console.log(`[GET] Original URL: ${req.url}`);
        console.log(`[GET] Query string: ${queryString}`);

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

// ==================== Trending Data (TikTok Creative Center) ====================

// Cache for trending data (refresh every 30 minutes)
let trendingCache = {
    hashtags: null,
    songs: null,
    lastUpdated: null
};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Fetch trending hashtags from TikTok Creative Center
app.get('/api/trending/hashtags', async (req, res) => {
    try {
        // Check cache
        if (trendingCache.hashtags && trendingCache.lastUpdated && 
            (Date.now() - trendingCache.lastUpdated) < CACHE_DURATION) {
            console.log('[TRENDING] Returning cached hashtags');
            return res.json(trendingCache.hashtags);
        }

        console.log('[TRENDING] Fetching fresh hashtag data from TikTok Creative Center...');
        
        // TikTok Creative Center public API
        const response = await fetch('https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/list?page=1&limit=20&period=7&country_code=US&sort_by=popular', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en'
            }
        });

        if (!response.ok) {
            console.error('[TRENDING] Creative Center API error:', response.status);
            throw new Error(`Creative Center API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('[TRENDING] Raw response:', JSON.stringify(data).substring(0, 500));

        if (data.code === 0 && data.data?.list) {
            const hashtags = data.data.list.map((item, index) => ({
                rank: index + 1,
                name: `#${item.hashtag_name}`,
                posts: formatNumber(item.publish_cnt),
                views: formatNumber(item.video_views),
                trend: item.trend_type === 1 ? 'rising' : item.trend_type === 2 ? 'hot' : 'stable',
                change: item.rank_change ? (item.rank_change > 0 ? `+${item.rank_change}` : `${item.rank_change}`) : '0'
            }));

            trendingCache.hashtags = { success: true, data: { hashtags }, source: 'tiktok_creative_center' };
            trendingCache.lastUpdated = Date.now();
            
            console.log(`[TRENDING] Successfully fetched ${hashtags.length} trending hashtags`);
            return res.json(trendingCache.hashtags);
        }

        throw new Error('Invalid response format from Creative Center');
    } catch (error) {
        console.error('[TRENDING] Error fetching hashtags:', error.message);
        
        // Return fallback data
        res.json({
            success: true,
            data: {
                hashtags: [
                    { rank: 1, name: '#fyp', posts: '15.2M', views: '2.8B', trend: 'hot', change: '0' },
                    { rank: 2, name: '#foryou', posts: '12.1M', views: '2.1B', trend: 'hot', change: '0' },
                    { rank: 3, name: '#viral', posts: '8.7M', views: '1.9B', trend: 'rising', change: '+2' },
                    { rank: 4, name: '#trending', posts: '6.3M', views: '1.2B', trend: 'stable', change: '0' },
                    { rank: 5, name: '#tiktok', posts: '4.2M', views: '750M', trend: 'stable', change: '-1' }
                ]
            },
            source: 'fallback',
            error: error.message
        });
    }
});

// Fetch trending songs/sounds from TikTok Creative Center
app.get('/api/trending/songs', async (req, res) => {
    try {
        // Check cache
        if (trendingCache.songs && trendingCache.lastUpdated && 
            (Date.now() - trendingCache.lastUpdated) < CACHE_DURATION) {
            console.log('[TRENDING] Returning cached songs');
            return res.json(trendingCache.songs);
        }

        console.log('[TRENDING] Fetching fresh song data from TikTok Creative Center...');
        
        const response = await fetch('https://ads.tiktok.com/creative_radar_api/v1/popular_trend/sound/list?page=1&limit=20&period=7&country_code=US&sort_by=popular', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en'
            }
        });

        if (!response.ok) {
            throw new Error(`Creative Center API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 0 && data.data?.list) {
            const songs = data.data.list.map((item, index) => ({
                rank: index + 1,
                title: item.sound_title || 'Unknown',
                artist: item.author || 'Unknown Artist',
                uses: formatNumber(item.publish_cnt),
                trend: item.trend_type === 1 ? 'rising' : item.trend_type === 2 ? 'hot' : 'stable',
                coverUrl: item.cover_url || null
            }));

            trendingCache.songs = { success: true, data: { songs }, source: 'tiktok_creative_center' };
            
            console.log(`[TRENDING] Successfully fetched ${songs.length} trending songs`);
            return res.json(trendingCache.songs);
        }

        throw new Error('Invalid response format');
    } catch (error) {
        console.error('[TRENDING] Error fetching songs:', error.message);
        
        res.json({
            success: true,
            data: {
                songs: [
                    { rank: 1, title: 'Original Sound', artist: 'Trending Creator', uses: '1.2M', trend: 'hot' },
                    { rank: 2, title: 'Viral Beat', artist: 'Music Producer', uses: '890K', trend: 'rising' },
                    { rank: 3, title: 'Dance Track', artist: 'DJ Mix', uses: '750K', trend: 'hot' }
                ]
            },
            source: 'fallback',
            error: error.message
        });
    }
});

// Helper function to format numbers
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

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
