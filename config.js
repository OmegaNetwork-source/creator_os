// TikTok API Configuration
// NOTE: In production, client_secret should NEVER be exposed in frontend code
// This should be handled by a backend server for security

const TIKTOK_CONFIG = {
    // Client key (public, safe to expose)
    client_key: 'sbawfp2mg0wxqesz9n',
    // NOTE: client_secret is now handled by backend server only!
    
    // TikTok API endpoints
    auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
    api_base: 'https://open.tiktokapis.com/v2/',
    
    // Redirect URI (must match your TikTok app settings)
    redirect_uri: 'https://creatoros.omeganetwork.co/callback.html',
    
    // Backend API URL (set this to your Render backend URL)
    // If not set, will use same origin
    backend_url: window.CREATOR_OS_BACKEND_URL || window.location.origin,
    
    // Scopes for TikTok API
    scopes: [
        'user.info.basic',
        'video.list',
        'video.upload',
        'video.publish',
        'video.insights'
    ].join(',')
};

// Check if we're in sandbox mode
const IS_SANDBOX = true;

// Storage keys
const STORAGE_KEYS = {
    access_token: 'tiktok_access_token',
    refresh_token: 'tiktok_refresh_token',
    user_info: 'tiktok_user_info'
};
