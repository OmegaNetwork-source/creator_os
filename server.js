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

// OAuth Token Exchange Endpoint
app.post('/api/tiktok/token', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange token' });
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

// Proxy API Requests
app.post('/api/tiktok/*', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const endpoint = req.path.replace('/api/tiktok', '');
        const url = `https://open.tiktokapis.com/v2${endpoint}`;

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...req.headers
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ error: 'API request failed' });
    }
});

// Get API endpoint
app.get('/api/tiktok/*', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const endpoint = req.path.replace('/api/tiktok', '');
        const url = `https://open.tiktokapis.com/v2${endpoint}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ error: 'API request failed' });
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
});
