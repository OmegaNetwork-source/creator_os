// TikTok API Configuration
// NOTE: In production, client_secret should NEVER be exposed in frontend code
// This should be handled by a backend server for security

const TIKTOK_CONFIG = {
    // Client key (public, safe to expose)
    client_key: 'sbawfp2mg0wxqesz9n',
    // NOTE: client_secret is now handled by backend server only!
    
    // TikTok API endpoints
    // For sandbox apps, use the same endpoints but ensure proper configuration
    auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
    api_base: 'https://open.tiktokapis.com/v2/',
    
    // Redirect URI (must match your TikTok app settings)
    // If testing on Render, use Render URL. For production, use your main domain.
    redirect_uri: window.CREATOR_OS_REDIRECT_URI || 'https://creator-os-h4vg.onrender.com/callback.html',
    
    // Backend API URL (set this to your Render backend URL)
    // If not set, will use same origin
    backend_url: window.CREATOR_OS_BACKEND_URL || window.location.origin,
    
    // Scopes for TikTok API
    // For sandbox apps, only basic scopes are available
    // Update these in TikTok Developer Portal → Your App → Products → Enable the products you need
    // user.info.basic: avatar_url, display_name, open_id, union_id (always requested)
    // user.info.profile: bio_description, profile_web_link, profile_deep_link, is_verified (optional)
    // video.list: Read user's public videos
    // video.publish: Direct post content to TikTok (Content Posting API)
    // video.upload: Upload content to user's inbox for review (Content Posting API)
    scopes: [
        'user.info.basic',
        'video.list',
        'video.publish' // For Content Posting API - Direct Post
        // 'video.upload' // For Content Posting API - Upload to Inbox
    ].filter(s => s).join(',')
};

// Check if we're in sandbox mode
const IS_SANDBOX = true;

// Storage keys
const STORAGE_KEYS = {
    access_token: 'tiktok_access_token',
    refresh_token: 'tiktok_refresh_token',
    user_info: 'tiktok_user_info'
};
