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
        
        const response = await fetch(`${backendUrl}/api/tiktok/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || 'Failed to exchange code for token');
        }

        const data = await response.json();
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
            return backendUrl;
        }
        return '';
    }

    // Store tokens
    setTokens(tokenData) {
        if (tokenData.access_token) {
            this.accessToken = tokenData.access_token;
            localStorage.setItem(STORAGE_KEYS.access_token, tokenData.access_token);
        }
        if (tokenData.refresh_token) {
            this.refreshToken = tokenData.refresh_token;
            localStorage.setItem(STORAGE_KEYS.refresh_token, tokenData.refresh_token);
        }
    }

    // Get access token
    getAccessToken() {
        return this.accessToken;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.accessToken;
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

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            method: options.method || 'POST',
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            },
            body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
        });

        if (response.status === 401) {
            // Token expired, try to refresh
            await this.refreshAccessToken();
            return this.apiRequest(endpoint, options);
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || 'API request failed');
        }

        return response.json();
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
    async getUserInfo() {
        const cached = localStorage.getItem(STORAGE_KEYS.user_info);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                // Invalid cache, fetch fresh
            }
        }

        const data = await this.apiRequest('user/info/', {
            method: 'GET'
        });

        if (data.data?.user) {
            localStorage.setItem(STORAGE_KEYS.user_info, JSON.stringify(data.data.user));
        }

        return data;
    }

    // Get user's videos
    async getUserVideos(fields = ['id', 'title', 'cover_image_url', 'create_time', 'video_description']) {
        return this.apiRequest('video/list/', {
            method: 'POST',
            body: JSON.stringify({
                fields: fields
            })
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

    // Get trending hashtags (if available in API)
    async getTrendingHashtags() {
        // This endpoint may vary based on TikTok API version
        // Using a placeholder structure
        try {
            return await this.apiRequest('research/hashtag/trending/', {
                method: 'GET'
            });
        } catch (e) {
            // Fallback to mock data if endpoint doesn't exist
            return {
                data: {
                    hashtags: [
                        { name: 'Dance Challenges', engagement: '+125%' },
                        { name: 'Quick Tips', engagement: '+89%' },
                        { name: 'Behind the Scenes', engagement: '+67%' }
                    ]
                }
            };
        }
    }
}

// Export for use
window.TikTokAPI = TikTokAPI;
