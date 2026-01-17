// TikTok API Configuration
// NOTE: In production, client_secret should NEVER be exposed in frontend code
// This should be handled by a backend server for security

const TIKTOK_CONFIG = {
    // Sandbox credentials - replace with your actual values
    client_key: 'sbawfp2mg0wxqesz9n',
    client_secret: 'taAgtouxyUrK7xwlC8cjAg2XulNm2jfu', // Should be server-side only!
    
    // TikTok API endpoints
    auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
    token_url: 'https://open.tiktokapis.com/v2/oauth/token/',
    api_base: 'https://open.tiktokapis.com/v2/',
    
    // Redirect URI (must match your TikTok app settings)
    redirect_uri: 'https://creatoros.omeganetwork.co/callback.html',
    
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
