// TikTok API Integration for Creator OS

class TikTokAPI {
    constructor() {
        this.config = TIKTOK_CONFIG;
        this.accessToken = localStorage.getItem(STORAGE_KEYS.access_token);
        this.refreshToken = localStorage.getItem(STORAGE_KEYS.refresh_token);
    }

    // Generate OAuth authorization URL
    getAuthUrl() {
        const redirectUri = this.config.redirect_uri;
        console.log('🔗 Generating auth URL with redirect_uri:', redirectUri);
        
        const params = new URLSearchParams({
            client_key: this.config.client_key,
            scope: this.config.scopes,
            response_type: 'code',
            redirect_uri: redirectUri,
            state: this.generateState()
        });
        
        // Store redirect_uri for later verification
        sessionStorage.setItem('tiktok_redirect_uri', redirectUri);
        
        // For sandbox apps, TikTok may require additional parameters
        // Note: Sandbox apps only work with test users added in TikTok Developer Portal
        
        const authUrl = `${this.config.auth_url}?${params.toString()}`;
        console.log('🔗 Full auth URL:', authUrl);
        console.log('🔗 Scopes being requested:', this.config.scopes);
        console.log('🔗 Scopes breakdown:', this.config.scopes.split(','));
        return authUrl;
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
        
        // Get the redirect_uri that was used in authorization
        const redirectUri = sessionStorage.getItem('tiktok_redirect_uri') || this.config.redirect_uri;
        console.log('🔄 Exchanging code for token at:', url);
        console.log('🔄 Redirect URI from authorization:', redirectUri);
        console.log('🔄 Redirect URI from config:', this.config.redirect_uri);
        
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    code,
                    redirect_uri: redirectUri // Send the redirect_uri used in authorization
                }),
                signal: controller.signal
            }).catch(err => {
                clearTimeout(timeoutId);
                if (err.name === 'AbortError') {
                    throw new Error('Request timed out. The backend may be sleeping. Please wait 30 seconds and try again.');
                }
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    throw new Error('Network error: Cannot reach backend server. The backend may be sleeping or unavailable.');
                }
                throw err;
            });
            
            clearTimeout(timeoutId);

            console.log('📡 Token exchange response status:', response.status, response.statusText);

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json().catch(async (e) => {
                    const text = await response.text();
                    console.error('❌ Failed to parse JSON response:', text);
                    throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 200)}`);
                });
            } else {
                const text = await response.text();
                console.error('❌ Non-JSON response received:', text.substring(0, 200));
                throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                console.error('❌ Token exchange failed:', data);
                const errorMsg = data.error?.message || data.error_description || data.error || JSON.stringify(data);
                throw new Error(errorMsg);
            }

            console.log('✅ Token exchange successful');
            this.setTokens(data);
            return data;
        } catch (err) {
            // Re-throw with better error messages
            if (err.message.includes('timeout') || err.message.includes('sleeping')) {
                throw err;
            }
            if (err.message.includes('Network error') || err.message.includes('fetch')) {
                throw new Error('Cannot connect to backend server. The server may be sleeping. Please wait 30 seconds and try again.');
            }
            throw err;
        }
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
        // TikTok API returns tokens at top level: { access_token, refresh_token, ... }
        // OR nested: { data: { access_token, refresh_token, ... } }
        const accessToken = tokenData.access_token || tokenData.data?.access_token;
        const refreshToken = tokenData.refresh_token || tokenData.data?.refresh_token;
        
        console.log('💾 Storing tokens:', { 
            hasData: !!tokenData.data,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            tokenLocation: tokenData.access_token ? 'top-level' : (tokenData.data?.access_token ? 'nested' : 'none')
        });
        
        if (accessToken) {
            this.accessToken = accessToken;
            localStorage.setItem(STORAGE_KEYS.access_token, accessToken);
            console.log('✅ Access token stored:', accessToken.substring(0, 20) + '...');
        } else {
            console.error('❌ No access token in response:', tokenData);
        }
        
        if (refreshToken) {
            this.refreshToken = refreshToken;
            localStorage.setItem(STORAGE_KEYS.refresh_token, refreshToken);
            console.log('✅ Refresh token stored:', refreshToken.substring(0, 20) + '...');
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
        // Remove leading slash from endpoint if present
        let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        // Ensure we have a proper path structure: api/tiktok/endpoint
        // Remove any trailing slashes from backendUrl and ensure proper path construction
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        // Use explicit string concatenation to ensure proper slashes
        const url = baseUrl + '/api/tiktok/' + cleanEndpoint;
        
        console.log('🔗 API Request URL construction:', {
            originalEndpoint: endpoint,
            cleanEndpoint: cleanEndpoint,
            backendUrl: backendUrl,
            baseUrl: baseUrl,
            finalUrl: url,
            urlLength: url.length
        });
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const requestBody = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined;
        const method = options.method || 'POST';

        console.log('🔗 API Request:', { 
            url, 
            method: method, 
            endpoint: endpoint,
            cleanEndpoint: cleanEndpoint,
            hasBody: !!requestBody
        });

        const response = await fetch(url, {
            method: method,
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

        // Check content type before parsing
        const contentType = response.headers.get('content-type') || '';
        const isJSON = contentType.includes('application/json');

        if (!response.ok) {
            // Try to parse as JSON first
            let error;
            
            if (isJSON) {
                try {
                    error = await response.json();
                } catch (jsonError) {
                    error = { message: `Failed to parse error response: ${jsonError.message}` };
                }
            } else {
                // Response is HTML or other format
                const text = await response.text();
                console.error('❌ API returned non-JSON error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    contentType: contentType,
                    preview: text.substring(0, 300)
                });
                
                // Check for common error patterns in HTML
                if (text.includes('scope_not_authorized') || text.includes('scope')) {
                    throw new Error('Scope not authorized. Please log out and log back in to grant required permissions.');
                } else if (text.includes('401') || text.includes('Unauthorized')) {
                    throw new Error('Unauthorized. Token may be expired or invalid.');
                } else {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}. Server returned ${contentType || 'HTML'} instead of JSON.`);
                }
            }
            
            console.error('API Error:', error);
            const errorMessage = error.error?.message || error.message || `API request failed: ${response.status} ${response.statusText}`;
            
            // Check for scope errors
            if (error.error?.code === 'scope_not_authorized' || errorMessage.includes('scope')) {
                throw new Error(`Scope not authorized: ${errorMessage}. Please log out and log back in to grant required permissions.`);
            }
            
            throw new Error(errorMessage);
        }

        // Success - parse JSON response
        if (!isJSON) {
            const text = await response.text();
            console.warn('⚠️ Success response is not JSON:', {
                contentType: contentType,
                preview: text.substring(0, 200)
            });
            throw new Error(`Invalid response format: Expected JSON, got ${contentType || 'unknown'}`);
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
                    this.getUserInfo(true)
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

        // TikTok Display API: GET /v2/user/info/ with fields as query params
        // user.info.basic scope supports: open_id, union_id, avatar_url, display_name
        // user.info.profile scope supports: bio_description, profile_web_link, profile_deep_link, is_verified
        // NOTE: Only request fields that match currently authorized scopes
        // If user.info.profile wasn't authorized, requesting bio_description will cause 401 error
        const fields = ['open_id', 'union_id', 'avatar_url', 'display_name'].join(',');
        // Explicitly construct endpoint without leading slash
        const endpoint = `user/info/?fields=${fields}`;
        console.log('📞 getUserInfo - calling apiRequest with endpoint:', endpoint);
        const data = await this.apiRequest(endpoint, {
            method: 'GET'
        });

        if (data.data?.user) {
            localStorage.setItem(STORAGE_KEYS.user_info, JSON.stringify(data.data.user));
        }

        return data;
    }

    // Get user's videos
    async getUserVideos(fields = ['id', 'title', 'cover_image_url', 'create_time', 'video_description', 'statistics'], maxCount = 20) {
        // TikTok Display API: POST /v2/video/list/ with fields as query params and max_count in body
        const fieldsStr = fields.join(',');
        return this.apiRequest(`/video/list/?fields=${fieldsStr}`, {
            method: 'POST',
            body: {
                max_count: maxCount
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

    // ==================== Content Posting API ====================
    
    // Query Creator Info - Required before posting content
    async queryCreatorInfo() {
        return this.apiRequest('post/publish/creator_info/query/', {
            method: 'POST'
        });
    }

    // Post Video - Direct post to TikTok
    // source: 'FILE_UPLOAD' or 'PULL_FROM_URL'
    async postVideo(postInfo, sourceInfo) {
        const body = {
            post_info: {
                title: postInfo.title || '',
                privacy_level: postInfo.privacy_level || 'PUBLIC_TO_EVERYONE',
                disable_duet: postInfo.disable_duet || false,
                disable_comment: postInfo.disable_comment || false,
                disable_stitch: postInfo.disable_stitch || false,
                video_cover_timestamp_ms: postInfo.video_cover_timestamp_ms || 1000
            },
            source_info: sourceInfo
        };

        return this.apiRequest('post/publish/video/init/', {
            method: 'POST',
            body: body
        });
    }

    // Upload video chunk (for FILE_UPLOAD method)
    // This is a direct upload to TikTok's upload server, not through our backend
    async uploadVideoChunk(uploadUrl, videoFile, chunkStart = 0, chunkSize = null) {
        const fileSize = videoFile.size;
        const end = chunkSize ? Math.min(chunkStart + chunkSize, fileSize - 1) : fileSize - 1;
        const chunk = videoFile.slice(chunkStart, end + 1);

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Range': `bytes ${chunkStart}-${end}/${fileSize}`,
                'Content-Type': 'video/mp4'
            },
            body: chunk
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${error}`);
        }

        return {
            uploaded: end + 1,
            total: fileSize,
            complete: end + 1 >= fileSize
        };
    }

    // Upload video in chunks (helper method)
    async uploadVideoFile(uploadUrl, videoFile, onProgress = null) {
        const chunkSize = 10 * 1024 * 1024; // 10MB chunks
        let uploaded = 0;

        while (uploaded < videoFile.size) {
            const result = await this.uploadVideoChunk(uploadUrl, videoFile, uploaded, chunkSize);
            uploaded = result.uploaded;

            if (onProgress) {
                onProgress({
                    uploaded,
                    total: videoFile.size,
                    percent: Math.round((uploaded / videoFile.size) * 100)
                });
            }

            if (result.complete) {
                break;
            }
        }

        return { success: true, uploaded, total: videoFile.size };
    }

    // Post Photo - Direct post to TikTok
    async postPhoto(postInfo, sourceInfo) {
        const body = {
            post_info: {
                title: postInfo.title || '',
                description: postInfo.description || '',
                disable_comment: postInfo.disable_comment || false,
                privacy_level: postInfo.privacy_level || 'PUBLIC_TO_EVERYONE',
                auto_add_music: postInfo.auto_add_music !== false
            },
            source_info: {
                source: sourceInfo.source || 'PULL_FROM_URL',
                photo_cover_index: sourceInfo.photo_cover_index || 1,
                photo_images: sourceInfo.photo_images || []
            },
            post_mode: 'DIRECT_POST',
            media_type: 'PHOTO'
        };

        return this.apiRequest('post/publish/content/init/', {
            method: 'POST',
            body: body
        });
    }

    // Get Post Status - Check upload/posting status
    async getPostStatus(publishId) {
        return this.apiRequest('post/publish/status/fetch/', {
            method: 'POST',
            body: {
                publish_id: publishId
            }
        });
    }

    // Get trending hashtags
    // NOTE: TikTok Research API requires special approval and may not be available in Sandbox
    // This will try the Research API first, then fall back to enhanced mock data
    async getTrendingHashtags() {
        // Try to get real trending data if authenticated
        if (this.accessToken) {
            try {
                console.log('🔍 Attempting to fetch trending hashtags from TikTok Research API...');
                // TikTok Research API endpoint - may require special access/approval
                const response = await this.apiRequest('research/hashtag/trending/', {
                    method: 'GET'
                });
                
                console.log('✅ TikTok Research API response received:', response);
                
                // Handle different possible response formats
                if (response.data?.list || response.data?.hashtags || response.data?.hashtag_list) {
                    const hashtags = response.data.list || response.data.hashtags || response.data.hashtag_list;
                    
                    // Helper to format numbers
                    const formatNum = (num) => {
                        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
                        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                        return num.toString();
                    };
                    
                    return {
                        data: {
                            hashtags: hashtags.map(item => ({
                                name: item.hashtag_name || item.name || item.title || 'Trending',
                                engagement: item.growth_rate ? `+${item.growth_rate}%` : null,
                                videos: item.video_count ? formatNum(item.video_count) : null,
                                views: item.view_count ? formatNum(item.view_count) : null,
                                tags: item.related_hashtags || []
                            }))
                        }
                    };
                }
                
                return response;
            } catch (e) {
                console.warn('⚠️ TikTok Research API not available or failed:', e.message);
                console.log('📝 Falling back to enhanced trending data');
            }
        }
        
        // Enhanced fallback data - more realistic trending hashtags
        // In production, consider using third-party APIs like Apify, PrimeAPI, or ScraperX
        // for real-time trending data if TikTok Research API isn't accessible
        return {
            data: {
                hashtags: [
                    { name: '#fyp', engagement: '+245%', videos: '15.2M', views: '2.8B' },
                    { name: '#viral', engagement: '+189%', videos: '8.7M', views: '1.9B' },
                    { name: '#trending', engagement: '+156%', videos: '6.3M', views: '1.2B' },
                    { name: '#foryou', engagement: '+134%', videos: '5.1M', views: '980M' },
                    { name: '#tiktok', engagement: '+112%', videos: '4.2M', views: '750M' }
                ]
            }
        };
    }
}

// Export for use
window.TikTokAPI = TikTokAPI;
