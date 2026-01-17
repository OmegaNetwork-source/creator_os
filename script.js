// Creator OS Dashboard with TikTok API Integration

let tiktokAPI = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize TikTok API
    if (typeof TikTokAPI !== 'undefined') {
        tiktokAPI = new TikTokAPI();
        checkAuthStatus();
    }

    // Content Planner functionality
    const plannerForm = document.querySelector('.planner-form');
    const inputField = document.querySelector('.input-field');
    const plannedContent = document.querySelector('.planned-content');

    if (plannerForm && inputField && plannedContent) {
        plannerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contentIdea = inputField.value.trim();
            if (contentIdea) {
                // Create new planned item
                const plannedItem = document.createElement('div');
                plannedItem.className = 'planned-item';
                
                const date = new Date();
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                plannedItem.innerHTML = `
                    <span class="planned-date">${dateStr}</span>
                    <p>${contentIdea}</p>
                `;
                
                plannedContent.appendChild(plannedItem);
                inputField.value = '';
            }
        });
    }

    // TikTok Login/Logout buttons
    const loginBtn = document.getElementById('tiktok-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleTikTokLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleTikTokLogout);
    }

    // Load data if authenticated
    if (tiktokAPI && tiktokAPI.isAuthenticated()) {
        loadTikTokData();
    }
});

// Check authentication status and update UI
function checkAuthStatus() {
    if (!tiktokAPI) return;

    const isAuth = tiktokAPI.isAuthenticated();
    const loginBtn = document.getElementById('tiktok-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');
    const userInfo = document.getElementById('user-info');

    if (isAuth) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Handle TikTok login
function handleTikTokLogin() {
    if (!tiktokAPI) {
        alert('TikTok API not initialized');
        return;
    }

    const authUrl = tiktokAPI.getAuthUrl();
    window.location.href = authUrl;
}

// Handle TikTok logout
function handleTikTokLogout() {
    if (!tiktokAPI) return;

    if (confirm('Are you sure you want to disconnect your TikTok account?')) {
        tiktokAPI.logout();
        checkAuthStatus();
        resetDashboard();
    }
}

// Load TikTok data
async function loadTikTokData() {
    if (!tiktokAPI || !tiktokAPI.isAuthenticated()) return;

    try {
        // Load user info
        const userInfo = await tiktokAPI.getUserInfo();
        if (userInfo.data?.user) {
            const username = userInfo.data.user.display_name || userInfo.data.user.username || 'TikTok User';
            const usernameEl = document.getElementById('username');
            if (usernameEl) usernameEl.textContent = username;
        }

        // Load user videos and calculate stats
        try {
            const videos = await tiktokAPI.getUserVideos();
            if (videos.data?.videos) {
                updatePerformanceStats(videos.data.videos);
            }
        } catch (e) {
            console.log('Could not load videos:', e);
        }

        // Load trending data
        try {
            const trending = await tiktokAPI.getTrendingHashtags();
            if (trending.data?.hashtags) {
                updateTrendingList(trending.data.hashtags);
            }
        } catch (e) {
            console.log('Could not load trending:', e);
        }

    } catch (error) {
        console.error('Error loading TikTok data:', error);
        alert('Error loading TikTok data. Please try reconnecting.');
    }
}

// Update performance stats from video data
function updatePerformanceStats(videos) {
    if (!videos || videos.length === 0) return;

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    // Sum up stats from all videos
    videos.forEach(video => {
        if (video.statistics) {
            totalViews += video.statistics.view_count || 0;
            totalLikes += video.statistics.like_count || 0;
            totalComments += video.statistics.comment_count || 0;
        }
    });

    // Update UI
    const viewsEl = document.getElementById('stat-views');
    const likesEl = document.getElementById('stat-likes');
    const commentsEl = document.getElementById('stat-comments');
    const engagementEl = document.getElementById('stat-engagement');
    const chartMsg = document.getElementById('chart-message');

    if (viewsEl) viewsEl.textContent = formatNumber(totalViews);
    if (likesEl) likesEl.textContent = formatNumber(totalLikes);
    if (commentsEl) commentsEl.textContent = formatNumber(totalComments);
    
    // Calculate engagement rate
    const engagementRate = totalViews > 0 
        ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1)
        : 0;
    if (engagementEl) engagementEl.textContent = engagementRate + '%';
    
    if (chartMsg) chartMsg.textContent = `Showing data from ${videos.length} video(s)`;
}

// Update trending list
function updateTrendingList(hashtags) {
    const trendingList = document.querySelector('.trending-list');
    if (!trendingList || !hashtags) return;

    trendingList.innerHTML = '';
    hashtags.slice(0, 3).forEach((hashtag, index) => {
        const trendItem = document.createElement('div');
        trendItem.className = 'trend-item';
        trendItem.innerHTML = `
            <span class="trend-number">#${index + 1}</span>
            <div class="trend-content">
                <h3>${hashtag.name || hashtag}</h3>
                <p>${hashtag.engagement || 'Trending now'}</p>
            </div>
        `;
        trendingList.appendChild(trendItem);
    });
}

// Format numbers (e.g., 12500 -> 12.5K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Reset dashboard to default state
function resetDashboard() {
    const viewsEl = document.getElementById('stat-views');
    const likesEl = document.getElementById('stat-likes');
    const commentsEl = document.getElementById('stat-comments');
    const engagementEl = document.getElementById('stat-engagement');
    const chartMsg = document.getElementById('chart-message');

    if (viewsEl) viewsEl.textContent = '12.5K';
    if (likesEl) likesEl.textContent = '1.2K';
    if (commentsEl) commentsEl.textContent = '89';
    if (engagementEl) engagementEl.textContent = '9.6%';
    if (chartMsg) chartMsg.textContent = 'Connect your TikTok account to see real performance data';
}
