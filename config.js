// TikTok API Configuration
// NOTE: In production, client_secret should NEVER be exposed in frontend code
// This should be handled by a backend server for security

const TIKTOK_CONFIG = {
    // Client key (public, safe to expose)
    client_key: 'awu2ck7bpzpah596',
    // NOTE: client_secret is now handled by backend server only!
    
    // TikTok API endpoints
    auth_url: 'https://www.tiktok.com/v2/auth/authorize/',
    api_base: 'https://open.tiktokapis.com/v2/',
    
    // Redirect URI (must match your TikTok app settings)
    redirect_uri: window.CREATOR_OS_REDIRECT_URI || 'https://creator-os-h4vg.onrender.com/callback.html',
    
    // Backend API URL (set this to your Render backend URL)
    // If not set, will use same origin
    backend_url: window.CREATOR_OS_BACKEND_URL || window.location.origin,
    
    // Scopes for TikTok API - Production app with full access
    // user.info.basic: avatar_url, display_name, open_id, union_id
    // user.info.profile: bio_description, profile_web_link, profile_deep_link, is_verified
    // user.info.stats: follower_count, following_count, likes_count, video_count
    // video.list: Read user's public videos with statistics
    // video.insights.read: Detailed video analytics and insights
    // video.comment: Read and manage video comments
    // video.publish: Direct post content to TikTok (Content Posting API)
    // video.upload: Upload content to user's inbox for review (Content Posting API)
    scopes: [
        'user.info.basic',
        'user.info.profile',
        'user.info.stats',
        'video.list',
        'video.insights.read',
        'video.comment',
        'video.publish', // For Content Posting API - Direct Post
        'video.upload' // For Content Posting API - Upload to Inbox
    ].filter(s => s).join(',')
};

// Production mode - app approved for public use
const IS_SANDBOX = false;

// Storage keys
const STORAGE_KEYS = {
    access_token: 'tiktok_access_token',
    refresh_token: 'tiktok_refresh_token',
    user_info: 'tiktok_user_info'
};
