// Creator OS Dashboard - Complete Feature Implementation

let tiktokAPI = null;
let currentDate = new Date();
let savedIdeas = JSON.parse(localStorage.getItem('creator_os_ideas') || '[]');
let savedTrends = JSON.parse(localStorage.getItem('creator_os_trends') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Creator OS - Initializing...');
    console.log('Backend URL:', window.CREATOR_OS_BACKEND_URL);
    
    try {
        // Initialize TikTok API
        if (typeof TikTokAPI !== 'undefined') {
            console.log('✅ TikTokAPI class found, initializing...');
            tiktokAPI = new TikTokAPI();
            console.log('✅ TikTokAPI initialized');
            checkAuthStatus();
        } else {
            console.error('❌ TikTokAPI class not found! Check if tiktok-api.js is loaded.');
        }
    } catch (e) {
        console.error('❌ TikTok API initialization error:', e);
    }

    // Initialize all features
    try {
        console.log('Initializing features...');
        initTabNavigation();
        initTrendDiscovery();
        initContentPlanning();
        initPerformanceInsights();
        initEngagementManagement();
        initTikTokIntegration();

        // Load saved data
        loadSavedIdeas();
        loadSavedTrends();
        console.log('✅ All features initialized');
    } catch (e) {
        console.error('❌ Initialization error:', e);
    }
});

// ==================== Tab Navigation ====================
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ==================== Trend Discovery ====================
function initTrendDiscovery() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.trend-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Filter logic would go here
        });
    });

    // Save trend buttons
    document.querySelectorAll('.btn-save-trend').forEach(btn => {
        btn.addEventListener('click', function() {
            const trendItem = this.closest('.trend-item');
            const trendTitle = trendItem.querySelector('h3').textContent;
            savedTrends.push({
                title: trendTitle,
                savedAt: new Date().toISOString()
            });
            localStorage.setItem('creator_os_trends', JSON.stringify(savedTrends));
            this.textContent = 'Saved!';
            this.disabled = true;
        });
    });

    // Use sound buttons
    document.querySelectorAll('.btn-use-sound').forEach(btn => {
        btn.addEventListener('click', function() {
            const soundName = this.closest('.sound-item').querySelector('strong').textContent;
            // Add to content planner
            addIdeaToPlanner(`Use sound: ${soundName}`);
            alert(`Added "${soundName}" to your content planner!`);
        });
    });
}

// ==================== Content Planning ====================
function initContentPlanning() {
    // Planning tab buttons
    const planTabBtns = document.querySelectorAll('.plan-tab-btn');
    const planTabContents = document.querySelectorAll('.plan-tab-content');

    planTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-plan-tab');
            
            planTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            planTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `plan-${targetTab}`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Calendar
    initCalendar();
    
    // Ideas form
    const ideasForm = document.querySelector('#plan-ideas .ideas-form');
    if (ideasForm) {
        const textarea = ideasForm.querySelector('textarea');
        const dateInput = ideasForm.querySelector('#idea-date');
        const statusSelect = ideasForm.querySelector('#idea-status');
        const addBtn = ideasForm.querySelector('.btn-primary');

        // Set default date to today
        dateInput.valueAsDate = new Date();

        addBtn.addEventListener('click', () => {
            const idea = textarea.value.trim();
            const date = dateInput.value;
            const status = statusSelect.value;

            if (idea) {
                addIdea(idea, date, status);
                textarea.value = '';
                dateInput.valueAsDate = new Date();
                statusSelect.value = 'idea';
            }
        });
    }

    // Idea actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const ideaItem = e.target.closest('.idea-item');
            const ideaText = ideaItem.querySelector('h4').textContent;
            const newText = prompt('Edit idea:', ideaText);
            if (newText) {
                ideaItem.querySelector('h4').textContent = newText;
                saveIdeas();
            }
        }
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Delete this idea?')) {
                e.target.closest('.idea-item').remove();
                saveIdeas();
            }
        }
    });
}

function initCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthEl = document.getElementById('current-month');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (!calendarGrid) return;

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        if (currentMonthEl) {
            currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            header.style.fontWeight = '700';
            header.style.textAlign = 'center';
            header.style.padding = '0.5rem';
            calendarGrid.appendChild(header);
        });

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            calendarGrid.appendChild(empty);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayEl.appendChild(dayNumber);

            // Check if day has content
            const dayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayIdeas = savedIdeas.filter(idea => idea.date === dayDate);
            
            if (dayIdeas.length > 0) {
                dayEl.classList.add('has-content');
                const contentEl = document.createElement('div');
                contentEl.className = 'calendar-day-content';
                contentEl.textContent = `${dayIdeas.length} item(s)`;
                dayEl.appendChild(contentEl);
            }

            dayEl.addEventListener('click', () => {
                showDayIdeas(dayDate);
            });

            calendarGrid.appendChild(dayEl);
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();
}

function addIdea(text, date, status) {
    const idea = {
        id: Date.now(),
        text: text,
        date: date,
        status: status,
        createdAt: new Date().toISOString()
    };

    savedIdeas.push(idea);
    saveIdeas();
    renderIdeasList();
    initCalendar(); // Refresh calendar
}

function renderIdeasList() {
    const ideasList = document.getElementById('ideas-list');
    if (!ideasList) return;

    ideasList.innerHTML = '';

    savedIdeas.forEach(idea => {
        const ideaEl = document.createElement('div');
        ideaEl.className = 'idea-item';
        
        const statusEmoji = idea.status === 'idea' ? '💡' : idea.status === 'draft' ? '📝' : '📅';
        const statusText = idea.status === 'idea' ? 'Idea' : idea.status === 'draft' ? 'Draft' : 'Scheduled';
        
        const dateObj = new Date(idea.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        ideaEl.innerHTML = `
            <div class="idea-content">
                <span class="idea-status-badge ${idea.status}">${statusEmoji} ${statusText}</span>
                <h4>${idea.text}</h4>
                <p class="idea-date">Scheduled for: ${dateStr}</p>
            </div>
            <div class="idea-actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        `;

        ideasList.appendChild(ideaEl);
    });
}

function saveIdeas() {
    localStorage.setItem('creator_os_ideas', JSON.stringify(savedIdeas));
}

function loadSavedIdeas() {
    renderIdeasList();
}

function loadSavedTrends() {
    // Load saved trends if needed
}

function addIdeaToPlanner(text) {
    const ideasForm = document.querySelector('#plan-ideas .ideas-form');
    if (ideasForm) {
        const textarea = ideasForm.querySelector('textarea');
        textarea.value = text;
        // Switch to ideas tab
        document.querySelector('[data-plan-tab="ideas"]').click();
    }
}

function showDayIdeas(date) {
    const dayIdeas = savedIdeas.filter(idea => idea.date === date);
    if (dayIdeas.length > 0) {
        alert(`Ideas for ${date}:\n${dayIdeas.map(i => `- ${i.text}`).join('\n')}`);
    } else {
        alert(`No ideas scheduled for ${date}`);
    }
}

// ==================== Performance Insights ====================
function initPerformanceInsights() {
    // Chart placeholder - would integrate with Chart.js or similar
    const chartContainer = document.getElementById('performance-chart');
    if (chartContainer) {
        // Chart initialization would go here
    }
}

// ==================== Engagement Management ====================
function initEngagementManagement() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.engagement-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Filter comments logic
        });
    });

    // Comment actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-reply')) {
            const commentText = e.target.closest('.comment-item').querySelector('.comment-text').textContent;
            const reply = prompt('Reply:', '');
            if (reply) {
                alert('Reply sent! (In production, this would send via TikTok API)');
                e.target.closest('.comment-item').classList.remove('unread');
            }
        }
        if (e.target.classList.contains('btn-like')) {
            e.target.textContent = '👍 Liked';
            e.target.disabled = true;
        }
        if (e.target.classList.contains('btn-hide')) {
            e.target.closest('.comment-item').style.display = 'none';
        }
    });
}

// ==================== TikTok Integration ====================
function initTikTokIntegration() {
    console.log('🔧 Initializing TikTok integration...');
    
    const loginBtn = document.getElementById('tiktok-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');
    const refreshBtn = document.getElementById('refresh-data-btn');

    console.log('Buttons found:', { loginBtn: !!loginBtn, logoutBtn: !!logoutBtn, refreshBtn: !!refreshBtn });

    if (loginBtn) {
        // Add multiple event listeners to ensure it works
        loginBtn.addEventListener('click', handleTikTokLogin);
        loginBtn.addEventListener('click', (e) => {
            console.log('🔘 Button clicked (second listener)');
        }, true);
        
        // Also make it a link-like element for better UX
        loginBtn.setAttribute('role', 'button');
        loginBtn.setAttribute('tabindex', '0');
        loginBtn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleTikTokLogin(e);
            }
        });
        
        console.log('✅ Login button event listener added');
        console.log('Button element:', loginBtn);
        console.log('Button text:', loginBtn.textContent);
        console.log('Button visible:', window.getComputedStyle(loginBtn).display !== 'none');
    } else {
        console.error('❌ Login button not found!');
        console.error('Available buttons:', document.querySelectorAll('button'));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleTikTokLogout);
        console.log('✅ Logout button event listener added');
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Refresh button clicked');
            if (tiktokAPI && tiktokAPI.isAuthenticated()) {
                loadTikTokData();
            } else {
                console.log('⚠️ Not authenticated, cannot refresh');
            }
        });
        console.log('✅ Refresh button event listener added');
    }

    // Load trending data (works without auth)
    loadTrendingData();
    
    // Load user-specific data if authenticated
    if (tiktokAPI && tiktokAPI.isAuthenticated()) {
        console.log('✅ User authenticated, loading user data...');
        loadTikTokData();
    } else {
        console.log('ℹ️ User not authenticated, skipping user data load');
    }
}

function checkAuthStatus() {
    if (!tiktokAPI) {
        console.log('⚠️ TikTok API not initialized, cannot check auth status');
        return;
    }

    const isAuth = tiktokAPI.isAuthenticated();
    console.log('Auth status:', isAuth ? '✅ Authenticated' : '❌ Not authenticated');
    
    const loginBtn = document.getElementById('tiktok-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');
    const userInfo = document.getElementById('user-info');

    console.log('Button elements:', { loginBtn: !!loginBtn, logoutBtn: !!logoutBtn, userInfo: !!userInfo });

    if (isAuth) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'block';
        console.log('✅ User is authenticated, showing logout button');
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.style.visibility = 'visible';
            loginBtn.style.opacity = '1';
            console.log('✅ Showing Connect TikTok button');
            console.log('Button computed style:', window.getComputedStyle(loginBtn).display);
        } else {
            console.error('❌ Login button element not found in DOM!');
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        console.log('❌ User not authenticated, showing login button');
    }
}

function handleTikTokLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 Connect TikTok button clicked');
    console.log('Event:', e);
    
    if (!tiktokAPI) {
        console.error('❌ TikTok API not initialized');
        alert('TikTok API not initialized. Please refresh the page.');
        return false;
    }

    try {
        const authUrl = tiktokAPI.getAuthUrl();
        console.log('🔗 Redirecting to TikTok OAuth:', authUrl);
        console.log('Opening in 1 second...');
        
        // Small delay to ensure console logs are visible
        setTimeout(() => {
            window.location.href = authUrl;
        }, 100);
        
        return false;
    } catch (e) {
        console.error('❌ Error getting auth URL:', e);
        alert('Error connecting to TikTok: ' + e.message);
        return false;
    }
}

function handleTikTokLogout() {
    if (!tiktokAPI) return;

    if (confirm('Are you sure you want to disconnect your TikTok account?')) {
        tiktokAPI.logout();
        checkAuthStatus();
        resetDashboard();
    }
}

async function loadTikTokData() {
    if (!tiktokAPI || !tiktokAPI.isAuthenticated()) {
        console.log('Not authenticated, skipping data load');
        return;
    }

    console.log('Loading TikTok data...');

    try {
        // Load user info (force refresh)
        console.log('Fetching user info...');
        const userInfo = await tiktokAPI.getUserInfo(true);
        console.log('User info received:', userInfo);
        
        if (userInfo.data?.user) {
            const username = userInfo.data.user.display_name || userInfo.data.user.username || 'TikTok User';
            const usernameEl = document.getElementById('username');
            if (usernameEl) usernameEl.textContent = username;
        }

        // Load user videos and calculate stats
        try {
            console.log('Fetching user videos...');
            const videos = await tiktokAPI.getUserVideos();
            console.log('Videos received:', videos);
            
            if (videos.data?.videos) {
                updatePerformanceStats(videos.data.videos);
                updateBestPerforming(videos.data.videos);
            } else {
                console.warn('No videos in response:', videos);
            }
        } catch (e) {
            console.error('Could not load videos:', e);
            alert('Could not load videos: ' + e.message);
        }

        // Load trending data (also updates when authenticated for personalized trends)
        loadTrendingData();

    } catch (error) {
        console.error('Error loading TikTok data:', error);
        alert('Error loading TikTok data: ' + error.message);
    }
}

function updatePerformanceStats(videos) {
    if (!videos || videos.length === 0) return;

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    videos.forEach(video => {
        if (video.statistics) {
            totalViews += video.statistics.view_count || 0;
            totalLikes += video.statistics.like_count || 0;
            totalComments += video.statistics.comment_count || 0;
        }
    });

    const viewsEl = document.getElementById('stat-views');
    const likesEl = document.getElementById('stat-likes');
    const commentsEl = document.getElementById('stat-comments');
    const engagementEl = document.getElementById('stat-engagement');

    if (viewsEl) viewsEl.textContent = formatNumber(totalViews);
    if (likesEl) likesEl.textContent = formatNumber(totalLikes);
    if (commentsEl) commentsEl.textContent = formatNumber(totalComments);
    
    const engagementRate = totalViews > 0 
        ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1)
        : 0;
    if (engagementEl) engagementEl.textContent = engagementRate + '%';
}

function updateBestPerforming(videos) {
    const bestVideosList = document.getElementById('best-videos-list');
    if (!bestVideosList) return;

    // Sort by views
    const sorted = [...videos].sort((a, b) => 
        (b.statistics?.view_count || 0) - (a.statistics?.view_count || 0)
    ).slice(0, 5);

    bestVideosList.innerHTML = '';

    sorted.forEach(video => {
        const videoEl = document.createElement('div');
        videoEl.className = 'video-item';
        
        const views = video.statistics?.view_count || 0;
        const likes = video.statistics?.like_count || 0;
        const comments = video.statistics?.comment_count || 0;
        const title = video.title || video.video_description || 'Untitled Video';

        videoEl.innerHTML = `
            <div class="video-thumb">📹</div>
            <div class="video-info">
                <h4>${title.substring(0, 50)}${title.length > 50 ? '...' : ''}</h4>
                <p>${formatNumber(views)} views • ${formatNumber(likes)} likes • ${formatNumber(comments)} comments</p>
            </div>
            <div class="video-stats">
                <span class="stat-badge">Top Performer</span>
            </div>
        `;

        bestVideosList.appendChild(videoEl);
    });
}

// Load trending data (works without authentication)
async function loadTrendingData() {
    if (!tiktokAPI) {
        console.log('TikTok API not initialized, using default trending data');
        return;
    }

    try {
        console.log('📈 Fetching trending data...');
        const trending = await tiktokAPI.getTrendingHashtags();
        console.log('📈 Trending data received:', trending);
        
        if (trending.data?.hashtags) {
            updateTrendingList(trending.data.hashtags);
        }
    } catch (e) {
        console.log('Could not load trending:', e);
    }
}

function updateTrendingList(hashtags) {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList || !hashtags) return;

    trendingList.innerHTML = '';
    
    hashtags.slice(0, 3).forEach((hashtag, index) => {
        const trendItem = document.createElement('div');
        trendItem.className = 'trend-item';
        if (index === 0) trendItem.classList.add('rising');
        
        const badgeClass = index === 0 ? 'rising' : 'hot';
        const badgeText = index === 0 ? 'Rising' : 'Hot';
        
        trendItem.innerHTML = `
            <span class="trend-badge ${badgeClass}">${badgeText}</span>
            <span class="trend-number">#${index + 1}</span>
            <div class="trend-content">
                <h3>${hashtag.name || hashtag}</h3>
                <p class="trend-meta">${hashtag.engagement || 'Trending now'} ${hashtag.videos ? '• ' + hashtag.videos + ' videos' : ''}</p>
                ${hashtag.tags ? `<div class="trend-tags">${hashtag.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
            <button class="btn-save-trend">Save for Later</button>
        `;
        
        // Re-attach save button handler
        const saveBtn = trendItem.querySelector('.btn-save-trend');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                const trendTitle = trendItem.querySelector('h3').textContent;
                savedTrends.push({
                    title: trendTitle,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem('creator_os_trends', JSON.stringify(savedTrends));
                this.textContent = 'Saved!';
                this.disabled = true;
            });
        }
        
        trendingList.appendChild(trendItem);
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function resetDashboard() {
    const viewsEl = document.getElementById('stat-views');
    const likesEl = document.getElementById('stat-likes');
    const commentsEl = document.getElementById('stat-comments');
    const engagementEl = document.getElementById('stat-engagement');

    if (viewsEl) viewsEl.textContent = '12.5K';
    if (likesEl) likesEl.textContent = '1.2K';
    if (commentsEl) commentsEl.textContent = '89';
    if (engagementEl) engagementEl.textContent = '9.6%';
}
