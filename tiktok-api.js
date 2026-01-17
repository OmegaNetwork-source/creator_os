// TikTok API Integration for Creator OS

class TikTokAPI {
    constructor() {
        this.config = TIKTOK_CONFIG;
        this.accessToken = localStorage.getItem(STORAGE_KEYS.access_token);
        this.refreshToken = localStorage.getItem(STORAGE_KEYS.refresh_token);
    }

    // Generate OAuth authorization URL
    getAuthUrl() {
        const params = new URLSearchParams({
            client_key: this.config.client_key,
            scope: this.config.scopes,
            response_type: 'code',
            redirect_uri: this.config.redirect_uri,
            state: this.generateState()
        });
        
        // For sandbox apps, TikTok may require additional parameters
        // Note: Sandbox apps only work with test users added in TikTok Developer Portal
        
        return `${this.config.auth_url}?${params.toString()}`;
    }

    // Generate random state for OAuth security
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(code) {
        // Use backend server for token exchange (secure)
        const backendUrl = this.getBackendUrl();
        const url = `${backendUrl}/api/tiktok/token`;
        
        console.log('🔄 Exchanging code for token at:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        console.log('📡 Token exchange response status:', response.status, response.statusText);

        const data = await response.json().catch(async (e) => {
            const text = await response.text();
            console.error('❌ Failed to parse response:', text);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        });

        if (!response.ok) {
            console.error('❌ Token exchange failed:', data);
            const errorMsg = data.error?.message || data.error_description || data.error || JSON.stringify(data);
            throw new Error(errorMsg);
        }

        console.log('✅ Token exchange successful');
        this.setTokens(data);
        return data;
    }

    // Get backend URL (use same domain or environment variable)
    getBackendUrl() {
        // In production, this should be your backend server URL
        // For now, try to use same origin, fallback to environment variable
        if (typeof window !== 'undefined') {
            // Check if we have a backend URL configured
            const backendUrl = window.CREATOR_OS_BACKEND_URL || window.location.origin;
            console.log('🌐 Backend URL:', backendUrl);
            return backendUrl;
        }
        console.error('❌ Window object not available');
        return '';
    }

    // Store tokens
    setTokens(tokenData) {
        console.log('💾 Storing tokens:', { 
            hasData: !!tokenData.data,
            hasAccessToken: !!(tokenData.data?.access_token || tokenData.access_token),
            hasRefreshToken: !!(tokenData.data?.refresh_token || tokenData.refresh_token)
        });
        
        // TikTok API returns tokens in data.data structure
        const accessToken = tokenData.data?.access_token || tokenData.access_token;
        const refreshToken = tokenData.data?.refresh_token || tokenData.refresh_token;
        
        if (accessToken) {
            this.accessToken = accessToken;
            localStorage.setItem(STORAGE_KEYS.access_token, accessToken);
            console.log('✅ Access token stored');
        } else {
            console.error('❌ No access token in response:', tokenData);
        }
        
        if (refreshToken) {
            this.refreshToken = refreshToken;
            localStorage.setItem(STORAGE_KEYS.refresh_token, refreshToken);
            console.log('✅ Refresh token stored');
        }
    }

    // Get access token
    getAccessToken() {
        return this.accessToken;
    }

    // Check if user is authenticated
    isAuthenticated() {
        // Check both instance variable and localStorage
        const storedToken = localStorage.getItem(STORAGE_KEYS.access_token);
        if (storedToken && !this.accessToken) {
            // Sync from localStorage if instance is out of sync
            this.accessToken = storedToken;
            this.refreshToken = localStorage.getItem(STORAGE_KEYS.refresh_token);
        }
        const hasToken = !!(this.accessToken || storedToken);
        console.log('🔐 isAuthenticated check:', {
            instanceToken: !!this.accessToken,
            localStorageToken: !!storedToken,
            result: hasToken
        });
        return hasToken;
    }

    // Logout
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem(STORAGE_KEYS.access_token);
        localStorage.removeItem(STORAGE_KEYS.refresh_token);
        localStorage.removeItem(STORAGE_KEYS.user_info);
    }

    // Make authenticated API request (through backend proxy)
    async apiRequest(endpoint, options = {}) {
        if (!this.accessToken) {
            throw new Error('Not authenticated. Please login first.');
        }

        const backendUrl = this.getBackendUrl();
        const url = `${backendUrl}/api/tiktok${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const requestBody = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined;

        console.log('API Request:', { url, method: options.method || 'POST', endpoint });

        const response = await fetch(url, {
            method: options.method || 'POST',
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            },
            body: requestBody
        });

        console.log('API Response:', { status: response.status, statusText: response.statusText });

        if (response.status === 401) {
            // Token expired, try to refresh
            console.log('Token expired, refreshing...');
            await this.refreshAccessToken();
            return this.apiRequest(endpoint, options);
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('API Error:', error);
            throw new Error(error.error?.message || error.message || `API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Success:', { endpoint, dataKeys: Object.keys(data) });
        return data;
    }

    // Refresh access token (through backend)
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const backendUrl = this.getBackendUrl();
        const response = await fetch(`${backendUrl}/api/tiktok/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: this.refreshToken })
        });

        if (!response.ok) {
            this.logout();
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || 'Failed to refresh token');
        }

        const data = await response.json();
        this.setTokens(data);
        return data;
    }

    // Get user info
    async getUserInfo(forceRefresh = false) {
        // Always fetch fresh data if forceRefresh is true
        if (!forceRefresh) {
            const cached = localStorage.getItem(STORAGE_KEYS.user_info);
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    // Return cached but also fetch fresh in background
                    this.apiRequest('user/info/', { method: 'POST', body: { fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username'] } })
                        .then(data => {
                            if (data.data?.user) {
                                localStorage.setItem(STORAGE_KEYS.user_info, JSON.stringify(data.data.user));
                            }
                        })
                        .catch(e => console.log('Background refresh failed:', e));
                    return { data: { user: cachedData } };
                } catch (e) {
                    // Invalid cache, fetch fresh
                }
            }
        }

        // TikTok API requires POST for user/info with fields
        const data = await this.apiRequest('user/info/', {
            method: 'POST',
            body: {
                fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username']
            }
        });

        if (data.data?.user) {
            localStorage.setItem(STORAGE_KEYS.user_info, JSON.stringify(data.data.user));
        }

        return data;
    }

    // Get user's videos
    async getUserVideos(fields = ['id', 'title', 'cover_image_url', 'create_time', 'video_description', 'statistics']) {
        return this.apiRequest('video/list/', {
            method: 'POST',
            body: {
                fields: fields
            }
        });
    }

    // Get video insights/analytics
    async getVideoInsights(videoId) {
        return this.apiRequest('video/query/', {
            method: 'POST',
            body: JSON.stringify({
                filters: {
                    video_ids: [videoId]
                },
                fields: [
                    'view_count',
                    'like_count',
                    'comment_count',
                    'share_count',
                    'play_duration_avg',
                    'total_play_time',
                    'video_view_rate',
                    'video_click_rate'
                ]
            })
        });
    }

    // Get trending hashtags (public data, doesn't require auth)
    async getTrendingHashtags() {
        // Try to get real trending data if authenticated
        if (this.accessToken) {
            try {
                return await this.apiRequest('research/hashtag/trending/', {
                    method: 'GET'
                });
            } catch (e) {
                console.log('Authenticated trending API failed, using public data:', e);
            }
        }
        
        // For now, return curated trending data (could be enhanced with public API)
        // In the future, this could use TikTok's public Research API or third-party services
        return {
            data: {
                hashtags: [
                    { name: 'Dance Challenges', engagement: '+125%', videos: '2.3M' },
                    { name: 'Quick Tips', engagement: '+89%', videos: '1.8M' },
                    { name: 'Behind the Scenes', engagement: '+67%', videos: '950K' },
                    { name: 'Morning Motivation', engagement: '+45%', videos: '680K' },
                    { name: 'Life Hacks', engagement: '+52%', videos: '1.2M' }
                ]
            }
        };
    }
}

// Export for use
window.TikTokAPI = TikTokAPI;
