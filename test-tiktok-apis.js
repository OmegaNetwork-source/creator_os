/**
 * TikTok API Endpoint Testing Script
 * Tests all TikTok API endpoints we need for Creator OS features
 * 
 * Run: node test-tiktok-apis.js
 * 
 * Requires: ACCESS_TOKEN environment variable or pass as argument
 * Example: ACCESS_TOKEN=act.xxx node test-tiktok-apis.js
 * Or: node test-tiktok-apis.js act.xxx
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'https://creator-os-h4vg.onrender.com';
const ACCESS_TOKEN = process.argv[2] || process.env.ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error('❌ ACCESS_TOKEN required!');
    console.log('Usage: node test-tiktok-apis.js <access_token>');
    console.log('Or: ACCESS_TOKEN=act.xxx node test-tiktok-apis.js');
    process.exit(1);
}

const results = {
    working: [],
    failed: [],
    needs_scope: [],
    not_available: []
};

// Helper function to make API requests through backend
async function testEndpoint(name, endpoint, method = 'GET', body = null) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing: ${name}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`🔧 Method: ${method}`);
    
    const url = `${BACKEND_URL}/api/tiktok${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body && method === 'POST') {
        options.body = JSON.stringify(body);
    }
    
    try {
        const startTime = Date.now();
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;
        
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.log(`⚠️  Non-JSON response (${contentType}):`, text.substring(0, 200));
            results.failed.push({
                name,
                endpoint,
                status: response.status,
                error: 'Non-JSON response',
                response: text.substring(0, 200)
            });
            return;
        }
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`⏱️  Response Time: ${responseTime}ms`);
        
        if (response.ok) {
            if (data.error && data.error.code !== 'ok') {
                const errorCode = data.error?.code || 'unknown';
                const errorMsg = data.error?.message || 'Unknown error';
                
                if (errorCode === 'scope_not_authorized') {
                    console.log(`🔒 Scope not authorized: ${errorMsg}`);
                    results.needs_scope.push({
                        name,
                        endpoint,
                        error: errorCode,
                        message: errorMsg
                    });
                } else if (errorCode.includes('not_found') || errorCode.includes('404')) {
                    console.log(`❌ Endpoint not found: ${errorMsg}`);
                    results.not_available.push({
                        name,
                        endpoint,
                        error: errorCode,
                        message: errorMsg
                    });
                } else {
                    console.log(`❌ API Error: ${errorCode} - ${errorMsg}`);
                    results.failed.push({
                        name,
                        endpoint,
                        status: response.status,
                        error: errorCode,
                        message: errorMsg
                    });
                }
            } else {
                const hasData = data.data && Object.keys(data.data).length > 0;
                console.log(`✅ SUCCESS! Has data: ${hasData}`);
                if (hasData) {
                    console.log(`📦 Data keys:`, Object.keys(data.data));
                }
                results.working.push({
                    name,
                    endpoint,
                    status: response.status,
                    hasData
                });
            }
        } else {
            const errorCode = data.error?.code || 'unknown';
            const errorMsg = data.error?.message || 'Unknown error';
            console.log(`❌ FAILED: ${errorCode} - ${errorMsg}`);
            results.failed.push({
                name,
                endpoint,
                status: response.status,
                error: errorCode,
                message: errorMsg
            });
        }
        
        // Show response preview
        if (data.data) {
            const preview = JSON.stringify(data.data).substring(0, 150);
            console.log(`📄 Response preview: ${preview}...`);
        }
        
    } catch (error) {
        console.error(`💥 Exception: ${error.message}`);
        results.failed.push({
            name,
            endpoint,
            error: error.message
        });
    }
}

// Main test function
async function runTests() {
    console.log('\n🚀 Starting TikTok API Endpoint Tests');
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log(`🔑 Access Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
    
    // ==================== USER INFO ====================
    console.log('\n\n📋 ========== USER INFO ENDPOINTS ==========');
    
    // Basic user info (should work with user.info.basic)
    await testEndpoint(
        'User Info - Basic',
        '/user/info/?fields=open_id,union_id,avatar_url,display_name',
        'GET'
    );
    
    // User info with profile fields (requires user.info.profile scope)
    await testEndpoint(
        'User Info - With Profile',
        '/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description',
        'GET'
    );
    
    // User stats (requires user.info.stats scope)
    await testEndpoint(
        'User Info - With Stats',
        '/user/info/?fields=open_id,display_name,follower_count,following_count,likes_count,video_count',
        'GET'
    );
    
    // ==================== VIDEO ENDPOINTS ====================
    console.log('\n\n📹 ========== VIDEO ENDPOINTS ==========');
    
    // List user videos (requires video.list scope)
    await testEndpoint(
        'User Videos List',
        '/video/list/?fields=id,title,video_description,cover_image_url,create_time',
        'POST',
        { max_count: 10 }
    );
    
    // List user videos with statistics (requires video.list scope)
    await testEndpoint(
        'User Videos - With Stats',
        '/video/list/?fields=id,title,video_description,cover_image_url,create_time,statistics',
        'POST',
        { max_count: 10 }
    );
    
    // Query specific videos (requires video.list scope)
    await testEndpoint(
        'Video Query',
        '/video/query/?fields=id,title,video_description,cover_image_url',
        'POST',
        {
            filters: {
                video_ids: ['7080213458555737986'] // Example video ID
            }
        }
    );
    
    // ==================== TRENDING/DISCOVERY ====================
    console.log('\n\n🔥 ========== TRENDING/DISCOVERY ENDPOINTS ==========');
    
    // Trending hashtags (requires Research API access)
    await testEndpoint(
        'Trending Hashtags',
        '/research/hashtag/trending/',
        'GET'
    );
    
    // Search hashtags (may require Research API)
    await testEndpoint(
        'Hashtag Search',
        '/research/hashtag/search/',
        'GET'
    );
    
    // ==================== ANALYTICS/INSIGHTS ====================
    console.log('\n\n📊 ========== ANALYTICS/INSIGHTS ENDPOINTS ==========');
    
    // Video insights (requires video.insights.read scope)
    await testEndpoint(
        'Video Insights',
        '/video/query/?fields=id,statistics,view_count,like_count,comment_count,share_count',
        'POST',
        {
            filters: {
                video_ids: ['7080213458555737986'] // Example video ID
            }
        }
    );
    
    // User analytics (may require user.info.stats)
    await testEndpoint(
        'User Analytics',
        '/user/info/?fields=open_id,follower_count,following_count,likes_count,video_count',
        'GET'
    );
    
    // ==================== COMMENTS/ENGAGEMENT ====================
    console.log('\n\n💬 ========== COMMENTS/ENGAGEMENT ENDPOINTS ==========');
    
    // Video comments (requires video.comment scope)
    await testEndpoint(
        'Video Comments',
        '/video/comment/list/',
        'POST',
        {
            video_id: '7080213458555737986', // Example video ID
            max_count: 20
        }
    );
    
    // ==================== OTHER ENDPOINTS ====================
    console.log('\n\n🔍 ========== OTHER ENDPOINTS ==========');
    
    // Search users (may require search scope)
    await testEndpoint(
        'Search Users',
        '/user/search/',
        'GET'
    );
    
    // Trending sounds (may require Research API)
    await testEndpoint(
        'Trending Sounds',
        '/research/sound/trending/',
        'GET'
    );
    
    // ==================== SUMMARY ====================
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Working Endpoints (${results.working.length}):`);
    results.working.forEach(r => {
        console.log(`   • ${r.name} - ${r.endpoint}`);
    });
    
    console.log(`\n🔒 Needs Additional Scope (${results.needs_scope.length}):`);
    results.needs_scope.forEach(r => {
        console.log(`   • ${r.name} - ${r.endpoint}`);
        console.log(`     Error: ${r.error} - ${r.message}`);
    });
    
    console.log(`\n❌ Not Available/Not Found (${results.not_available.length}):`);
    results.not_available.forEach(r => {
        console.log(`   • ${r.name} - ${r.endpoint}`);
    });
    
    console.log(`\n💥 Failed Tests (${results.failed.length}):`);
    results.failed.forEach(r => {
        console.log(`   • ${r.name} - ${r.endpoint}`);
        console.log(`     Status: ${r.status || 'N/A'}, Error: ${r.error || r.message}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 Total Tests: ${results.working.length + results.needs_scope.length + results.not_available.length + results.failed.length}`);
    console.log(`✅ Working: ${results.working.length}`);
    console.log(`🔒 Needs Scope: ${results.needs_scope.length}`);
    console.log(`❌ Not Available: ${results.not_available.length}`);
    console.log(`💥 Failed: ${results.failed.length}`);
    console.log('\n');
}

// Run tests
runTests().catch(console.error);
