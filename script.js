// Creator OS Dashboard - Complete Feature Implementation

let tiktokAPI = null;
let currentDate = new Date();
let savedIdeas = JSON.parse(localStorage.getItem('creator_os_ideas') || '[]');
let savedTrends = JSON.parse(localStorage.getItem('creator_os_trends') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Creator OS - Initializing...');
    console.log('Backend URL:', window.CREATOR_OS_BACKEND_URL);
    
    // Initialize TikTok rain animation
    initTikTokRain();
    
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
        initContentPosting();

        // Load saved data
        loadSavedIdeas();
        loadSavedTrends();
        console.log('✅ All features initialized');
    } catch (e) {
        console.error('❌ Initialization error:', e);
    }
});

// ==================== TikTok Rain Animation ====================
function initTikTokRain() {
    const leftContainer = document.querySelector('.tiktok-rain-left');
    const rightContainer = document.querySelector('.tiktok-rain-right');
    
    if (!leftContainer || !rightContainer) return;
    
    // Create symbols for left side
    for (let i = 0; i < 15; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'tiktok-symbol';
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.animationDelay = `${Math.random() * 3}s`;
        symbol.style.animationDuration = `${8 + Math.random() * 6}s`;
        symbol.style.fontSize = `${20 + Math.random() * 16}px`;
        leftContainer.appendChild(symbol);
    }
    
    // Create symbols for right side
    for (let i = 0; i < 15; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'tiktok-symbol';
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.animationDelay = `${Math.random() * 3}s`;
        symbol.style.animationDuration = `${8 + Math.random() * 6}s`;
        symbol.style.fontSize = `${20 + Math.random() * 16}px`;
        rightContainer.appendChild(symbol);
    }
}

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
    const qrLoginBtn = document.getElementById('tiktok-qr-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');
    const refreshBtn = document.getElementById('refresh-data-btn');

    console.log('Buttons found:', { loginBtn: !!loginBtn, qrLoginBtn: !!qrLoginBtn, logoutBtn: !!logoutBtn, refreshBtn: !!refreshBtn });

    if (qrLoginBtn) {
        qrLoginBtn.addEventListener('click', handleQRCodeLogin);
        console.log('✅ QR code login button event listener added');
    }

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

    // Check localStorage directly for debugging
    const storedToken = localStorage.getItem('tiktok_access_token');
    console.log('🔍 Checking auth status...');
    console.log('Stored token in localStorage:', storedToken ? storedToken.substring(0, 20) + '...' : 'NONE');
    console.log('TikTokAPI accessToken:', tiktokAPI.accessToken ? tiktokAPI.accessToken.substring(0, 20) + '...' : 'NONE');

    const isAuth = tiktokAPI.isAuthenticated();
    console.log('Auth status:', isAuth ? '✅ Authenticated' : '❌ Not authenticated');
    
    const loginBtn = document.getElementById('tiktok-login-btn');
    const qrLoginBtn = document.getElementById('tiktok-qr-login-btn');
    const logoutBtn = document.getElementById('tiktok-logout-btn');
    const userInfo = document.getElementById('user-info');

    console.log('Button elements:', { loginBtn: !!loginBtn, qrLoginBtn: !!qrLoginBtn, logoutBtn: !!logoutBtn, userInfo: !!userInfo });

    if (isAuth) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (qrLoginBtn) qrLoginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'block';
        console.log('✅ User is authenticated, showing logout button');
        
        // Load data immediately
        loadTikTokData();
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.style.visibility = 'visible';
            loginBtn.style.opacity = '1';
            console.log('✅ Showing Connect TikTok button');
        }
        if (qrLoginBtn) {
            qrLoginBtn.style.display = 'inline-block';
            qrLoginBtn.style.visibility = 'visible';
            qrLoginBtn.style.opacity = '1';
        }
        if (loginBtn) {
            console.log('Button computed style:', window.getComputedStyle(loginBtn).display);
        } else {
            console.error('❌ Login button element not found in DOM!');
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        console.log('❌ User not authenticated, showing login button');
        
        // If we have a token but API says not authenticated, there's a mismatch
        if (storedToken && !tiktokAPI.accessToken) {
            console.warn('⚠️ Token exists in localStorage but not in API instance. Re-initializing...');
            tiktokAPI.accessToken = storedToken;
            tiktokAPI.refreshToken = localStorage.getItem('tiktok_refresh_token');
            // Re-check
            if (tiktokAPI.isAuthenticated()) {
                console.log('✅ Fixed! User is now authenticated');
                checkAuthStatus(); // Recursive call to update UI
            }
        }
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

// QR Code Login
let qrPollingInterval = null;

async function handleQRCodeLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log('📱 QR code login button clicked');

    if (!tiktokAPI) {
        console.error('❌ TikTok API not initialized');
        alert('TikTok API not initialized. Please refresh the page.');
        return false;
    }

    // Show modal
    const modal = document.getElementById('qr-login-modal');
    const statusEl = document.getElementById('qr-status');
    const containerEl = document.getElementById('qr-code-container');
    const imageEl = document.getElementById('qr-code-image');
    const statusTextEl = document.getElementById('qr-status-text');
    const errorEl = document.getElementById('qr-error');

    modal.style.display = 'flex';
    containerEl.style.display = 'none';
    errorEl.style.display = 'none';
    statusEl.style.display = 'block';
    statusEl.innerHTML = '<p>Generating QR code...</p>';

    try {
        // Get QR code
        const qrData = await tiktokAPI.getQRCode();
        console.log('✅ QR code received:', { hasUrl: !!qrData.scan_qrcode_url, hasToken: !!qrData.token });

        // Generate QR code image
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(imageEl, qrData.scan_qrcode_url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (err) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    throw new Error('Failed to generate QR code image');
                }
            });
        } else {
            throw new Error('QRCode library not loaded');
        }

        // Show QR code
        statusEl.style.display = 'none';
        containerEl.style.display = 'block';
        statusTextEl.textContent = 'Waiting for scan...';

        // Start polling
        startQRPolling(qrData.token);

    } catch (error) {
        console.error('❌ Error with QR code login:', error);
        statusEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
    }

    return false;
}

function startQRPolling(token) {
    // Clear existing interval
    if (qrPollingInterval) {
        clearInterval(qrPollingInterval);
    }

    const statusTextEl = document.getElementById('qr-status-text');
    const errorEl = document.getElementById('qr-error');

    // Poll every 2 seconds
    qrPollingInterval = setInterval(async () => {
        try {
            const status = await tiktokAPI.checkQRCodeStatus(token);
            console.log('📱 QR code status:', status.status);

            if (status.status === 'new') {
                statusTextEl.textContent = 'Waiting for scan...';
            } else if (status.status === 'scanned') {
                statusTextEl.textContent = '✅ QR code scanned! Please confirm on your phone...';
            } else if (status.status === 'confirmed') {
                // Clear polling
                if (qrPollingInterval) {
                    clearInterval(qrPollingInterval);
                    qrPollingInterval = null;
                }

                statusTextEl.textContent = '✅ Authorized! Exchanging code for token...';

                // Extract code from redirect_uri or use code field
                let code = status.code;
                if (!code && status.redirect_uri) {
                    try {
                        const url = new URL(status.redirect_uri);
                        code = url.searchParams.get('code');
                    } catch (e) {
                        // If not a valid URL, try to extract from string
                        const match = status.redirect_uri.match(/code=([^&]+)/);
                        if (match) {
                            code = match[1];
                        }
                    }
                }

                if (!code) {
                    throw new Error('Authorization code not found in response');
                }

                // Exchange code for token
                try {
                    await tiktokAPI.exchangeCodeForToken(code);
                    statusTextEl.textContent = '✅ Successfully connected!';

                    // Close modal after 1 second
                    setTimeout(() => {
                        closeQRModal();
                        // Refresh auth status
                        checkAuthStatus();
                    }, 1000);
                } catch (tokenError) {
                    console.error('Token exchange error:', tokenError);
                    errorEl.style.display = 'block';
                    errorEl.innerHTML = `<p><strong>Error exchanging code:</strong> ${tokenError.message}</p>`;
                }
            } else if (status.status === 'expired') {
                // Clear polling
                if (qrPollingInterval) {
                    clearInterval(qrPollingInterval);
                    qrPollingInterval = null;
                }

                errorEl.style.display = 'block';
                errorEl.innerHTML = '<p><strong>QR code expired.</strong> Please close and try again.</p>';
                statusTextEl.textContent = '❌ QR code expired';
            } else if (status.status === 'utilised') {
                // Already used
                if (qrPollingInterval) {
                    clearInterval(qrPollingInterval);
                    qrPollingInterval = null;
                }
            }
        } catch (error) {
            console.error('Error checking QR status:', error);
            // Continue polling unless it's a fatal error
            if (error.message && error.message.includes('expired')) {
                if (qrPollingInterval) {
                    clearInterval(qrPollingInterval);
                    qrPollingInterval = null;
                }
                errorEl.style.display = 'block';
                errorEl.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
            }
        }
    }, 2000); // Poll every 2 seconds
}

function closeQRModal() {
    // Clear polling
    if (qrPollingInterval) {
        clearInterval(qrPollingInterval);
        qrPollingInterval = null;
    }

    const modal = document.getElementById('qr-login-modal');
    modal.style.display = 'none';

    // Clear session storage
    sessionStorage.removeItem('tiktok_qr_client_ticket');
    sessionStorage.removeItem('tiktok_qr_token');
}

// Initialize modal close handlers
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('qr-login-modal');
    const closeBtn = document.getElementById('qr-modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeQRModal);
    }

    // Close on background click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeQRModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeQRModal();
        }
    });
});

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
            const user = userInfo.data.user;
            console.log('📋 Full user data received:', user);
            
            const username = user.display_name || 'TikTok User';
            const avatarUrl = user.avatar_url;
            const bio = user.bio_description || user.bio || '';
            
            // Update username
            const usernameEl = document.getElementById('username');
            if (usernameEl) usernameEl.textContent = username;
            
            // Update avatar/profile picture
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) {
                if (avatarUrl) {
                    avatarEl.src = avatarUrl;
                    avatarEl.style.display = 'block';
                    avatarEl.alt = username + ' profile picture';
                    console.log('✅ Avatar URL set:', avatarUrl);
                } else {
                    console.warn('⚠️ No avatar_url in response');
                    avatarEl.style.display = 'none';
                }
            }
            
            // Update bio if available
            const bioEl = document.getElementById('user-bio');
            if (bioEl) {
                if (bio) {
                    bioEl.textContent = bio;
                    bioEl.style.display = 'block';
                    console.log('✅ Bio set:', bio);
                } else {
                    console.warn('⚠️ No bio_description in response (requires user.info.profile scope)');
                    bioEl.style.display = 'none';
                }
            }
            
            console.log('✅ User info updated:', { username, hasAvatar: !!avatarUrl, hasBio: !!bio });
        } else {
            console.error('❌ No user data in response:', userInfo);
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
            // Only show alert for user-actionable errors, not scope issues
            if (e.message && e.message.includes('scope')) {
                console.warn('⚠️ Video list requires video.list scope. Please log out and log back in to authorize it.');
            } else if (e.message && e.message.includes('Invalid response format')) {
                console.warn('⚠️ TikTok API returned HTML instead of JSON. This usually means the endpoint is not available or requires different scopes.');
            } else {
                // Only show alert for unexpected errors
                console.warn('⚠️ Video loading failed:', e.message);
            }
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

// Load trending data (works without authentication - uses TikTok Creative Center)
async function loadTrendingData() {
    if (!tiktokAPI) {
        console.log('TikTok API not initialized, using default trending data');
        return;
    }

    try {
        console.log('📈 Fetching trending data from Creative Center...');
        
        // Fetch hashtags and songs in parallel
        const [hashtagsResponse, songsResponse] = await Promise.all([
            tiktokAPI.getTrendingHashtags(),
            tiktokAPI.getTrendingSongs()
        ]);
        
        console.log('📈 Trending hashtags received:', hashtagsResponse);
        console.log('🎵 Trending songs received:', songsResponse);
        
        // Update hashtags
        if (hashtagsResponse.data?.hashtags) {
            updateTrendingList(hashtagsResponse.data.hashtags, hashtagsResponse.source);
        }
        
        // Update sounds/songs
        if (songsResponse.data?.songs) {
            updateSoundsList(songsResponse.data.songs, songsResponse.source);
        }
    } catch (e) {
        console.log('Could not load trending:', e);
    }
}

function updateTrendingList(hashtags, source = 'unknown') {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList || !hashtags) return;

    trendingList.innerHTML = '';
    
    // Show source indicator
    const sourceIndicator = document.createElement('div');
    sourceIndicator.className = 'source-indicator';
    sourceIndicator.innerHTML = source === 'tiktok_creative_center' 
        ? '<span class="live-badge">🔴 LIVE</span> Real-time data from TikTok'
        : '<span class="fallback-badge">📊</span> Cached trending data';
    trendingList.appendChild(sourceIndicator);
    
    hashtags.slice(0, 5).forEach((hashtag, index) => {
        const trendItem = document.createElement('div');
        trendItem.className = 'trend-item';
        
        // Determine badge based on trend type or position
        const trendType = hashtag.trend || (index === 0 ? 'rising' : 'hot');
        const badgeClass = trendType === 'rising' ? 'rising' : trendType === 'hot' ? 'hot' : 'stable';
        const badgeText = trendType === 'rising' ? '🚀 Rising' : trendType === 'hot' ? '🔥 Hot' : '📊 Stable';
        
        if (trendType === 'rising') trendItem.classList.add('rising');
        
        trendItem.innerHTML = `
            <span class="trend-badge ${badgeClass}">${badgeText}</span>
            <span class="trend-number">#${hashtag.rank || index + 1}</span>
            <div class="trend-content">
                <h3>${hashtag.name || hashtag}</h3>
                <p class="trend-meta">
                    ${hashtag.posts ? hashtag.posts + ' posts' : ''}
                    ${hashtag.views ? ' • ' + hashtag.views + ' views' : ''}
                    ${hashtag.change && hashtag.change !== '0' ? ' • Rank ' + hashtag.change : ''}
                </p>
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

function updateSoundsList(songs, source = 'unknown') {
    const soundsList = document.getElementById('sounds-list');
    if (!soundsList || !songs) return;

    soundsList.innerHTML = '';
    
    songs.slice(0, 5).forEach((song, index) => {
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        
        const trendClass = song.trend === 'rising' ? 'rising' : song.trend === 'hot' ? 'hot' : '';
        
        soundItem.innerHTML = `
            <div class="sound-info">
                <strong>${song.title}</strong>
                <p>${song.artist} • ${song.uses} uses</p>
                ${song.trend === 'rising' ? '<span class="trend-indicator">🚀 Rising</span>' : ''}
                ${song.trend === 'hot' ? '<span class="trend-indicator">🔥 Hot</span>' : ''}
            </div>
            <button class="btn-use-sound">Use</button>
        `;
        
        // Add use sound handler
        const useBtn = soundItem.querySelector('.btn-use-sound');
        if (useBtn) {
            useBtn.addEventListener('click', function() {
                addIdeaToPlanner(`Use sound: ${song.title} by ${song.artist}`);
                alert(`Added "${song.title}" to your content planner!`);
            });
        }
        
        soundsList.appendChild(soundItem);
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

// ==================== Content Posting ====================
function initContentPosting() {
    // Post tab navigation
    const postTabBtns = document.querySelectorAll('.post-tab-btn');
    const postTabContents = document.querySelectorAll('.post-tab-content');

    postTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-post-tab');
            
            postTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            postTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `post-${targetTab}`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Video source toggle
    const videoSource = document.getElementById('video-source');
    const videoFileGroup = document.getElementById('video-file-group');
    const videoUrlGroup = document.getElementById('video-url-group');

    if (videoSource) {
        videoSource.addEventListener('change', (e) => {
            if (e.target.value === 'FILE_UPLOAD') {
                videoFileGroup.style.display = 'block';
                videoUrlGroup.style.display = 'none';
            } else {
                videoFileGroup.style.display = 'none';
                videoUrlGroup.style.display = 'block';
            }
        });
    }

    // Post video button
    const postVideoBtn = document.getElementById('post-video-btn');
    if (postVideoBtn) {
        postVideoBtn.addEventListener('click', handlePostVideo);
    }

    // Post photo button
    const postPhotoBtn = document.getElementById('post-photo-btn');
    if (postPhotoBtn) {
        postPhotoBtn.addEventListener('click', handlePostPhoto);
    }

    // Check status button
    const checkStatusBtn = document.getElementById('check-status-btn');
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', handleCheckStatus);
    }

    // Load recent posts from localStorage
    loadRecentPosts();
}

async function handlePostVideo() {
    if (!tiktokAPI || !tiktokAPI.isAuthenticated()) {
        alert('Please connect your TikTok account first.');
        return;
    }

    const title = document.getElementById('video-title').value.trim();
    if (!title) {
        alert('Please enter a video title.');
        return;
    }

    const source = document.getElementById('video-source').value;
    const videoFile = document.getElementById('video-file').files[0];
    const videoUrl = document.getElementById('video-url').value.trim();
    const privacy = document.getElementById('video-privacy').value;
    const disableComment = document.getElementById('video-disable-comment').checked;
    const disableDuet = document.getElementById('video-disable-duet').checked;
    const disableStitch = document.getElementById('video-disable-stitch').checked;
    const coverTimestamp = parseInt(document.getElementById('video-cover-timestamp').value) || 1000;

    const postBtn = document.getElementById('post-video-btn');
    const resultDiv = document.getElementById('video-post-result');
    const progressDiv = document.getElementById('video-upload-progress');
    const progressFill = document.getElementById('video-progress-fill');
    const progressText = document.getElementById('video-progress-text');

    try {
        postBtn.disabled = true;
        postBtn.textContent = 'Posting...';
        resultDiv.innerHTML = '';

        // Query creator info first
        const creatorInfo = await tiktokAPI.queryCreatorInfo();
        console.log('Creator info:', creatorInfo);

        const postInfo = {
            title: title,
            privacy_level: privacy,
            disable_comment: disableComment,
            disable_duet: disableDuet,
            disable_stitch: disableStitch,
            video_cover_timestamp_ms: coverTimestamp
        };

        let sourceInfo;
        let publishId;

        if (source === 'FILE_UPLOAD') {
            if (!videoFile) {
                alert('Please select a video file.');
                postBtn.disabled = false;
                postBtn.textContent = 'Post Video';
                return;
            }

            // Calculate chunk info
            const chunkSize = 10 * 1024 * 1024; // 10MB
            const totalChunks = Math.ceil(videoFile.size / chunkSize);

            sourceInfo = {
                source: 'FILE_UPLOAD',
                video_size: videoFile.size,
                chunk_size: chunkSize,
                total_chunk_count: totalChunks
            };

            // Initialize post
            const initResponse = await tiktokAPI.postVideo(postInfo, sourceInfo);
            publishId = initResponse.data.publish_id;
            const uploadUrl = initResponse.data.upload_url;

            // Show progress
            progressDiv.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = 'Uploading video...';

            // Upload video
            await tiktokAPI.uploadVideoFile(uploadUrl, videoFile, (progress) => {
                progressFill.style.width = progress.percent + '%';
                progressText.textContent = `Uploading... ${progress.percent}%`;
            });

            progressText.textContent = 'Processing video...';
        } else {
            if (!videoUrl) {
                alert('Please enter a video URL.');
                postBtn.disabled = false;
                postBtn.textContent = 'Post Video';
                return;
            }

            sourceInfo = {
                source: 'PULL_FROM_URL',
                video_url: videoUrl
            };

            const initResponse = await tiktokAPI.postVideo(postInfo, sourceInfo);
            publishId = initResponse.data.publish_id;
        }

        // Save to recent posts
        saveRecentPost({
            publish_id: publishId,
            type: 'video',
            title: title,
            created_at: new Date().toISOString()
        });

        resultDiv.innerHTML = `
            <div class="success-message">
                <strong>✅ Video posted successfully!</strong>
                <p>Publish ID: <code>${publishId}</code></p>
                <p>Your video is being processed. Check the Post Status tab to monitor progress.</p>
            </div>
        `;

        // Hide progress
        progressDiv.style.display = 'none';

    } catch (error) {
        console.error('Error posting video:', error);
        resultDiv.innerHTML = `
            <div class="error-message">
                <strong>❌ Error posting video</strong>
                <p>${error.message}</p>
            </div>
        `;
        progressDiv.style.display = 'none';
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = 'Post Video';
    }
}

async function handlePostPhoto() {
    if (!tiktokAPI || !tiktokAPI.isAuthenticated()) {
        alert('Please connect your TikTok account first.');
        return;
    }

    const title = document.getElementById('photo-title').value.trim();
    if (!title) {
        alert('Please enter a photo title.');
        return;
    }

    const description = document.getElementById('photo-description').value.trim();
    const privacy = document.getElementById('photo-privacy').value;
    const disableComment = document.getElementById('photo-disable-comment').checked;
    const autoAddMusic = document.getElementById('photo-auto-music').checked;
    const photoUrls = document.getElementById('photo-urls').value.trim().split('\n').filter(url => url.trim());
    const coverIndex = parseInt(document.getElementById('photo-cover-index').value) || 1;

    if (photoUrls.length === 0) {
        alert('Please enter at least one photo URL.');
        return;
    }

    const postBtn = document.getElementById('post-photo-btn');
    const resultDiv = document.getElementById('photo-post-result');

    try {
        postBtn.disabled = true;
        postBtn.textContent = 'Posting...';
        resultDiv.innerHTML = '';

        const postInfo = {
            title: title,
            description: description,
            privacy_level: privacy,
            disable_comment: disableComment,
            auto_add_music: autoAddMusic
        };

        const sourceInfo = {
            source: 'PULL_FROM_URL',
            photo_cover_index: coverIndex,
            photo_images: photoUrls
        };

        const response = await tiktokAPI.postPhoto(postInfo, sourceInfo);
        const publishId = response.data.publish_id;

        // Save to recent posts
        saveRecentPost({
            publish_id: publishId,
            type: 'photo',
            title: title,
            created_at: new Date().toISOString()
        });

        resultDiv.innerHTML = `
            <div class="success-message">
                <strong>✅ Photo posted successfully!</strong>
                <p>Publish ID: <code>${publishId}</code></p>
                <p>Your photo is being processed. Check the Post Status tab to monitor progress.</p>
            </div>
        `;

    } catch (error) {
        console.error('Error posting photo:', error);
        resultDiv.innerHTML = `
            <div class="error-message">
                <strong>❌ Error posting photo</strong>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = 'Post Photo';
    }
}

async function handleCheckStatus() {
    if (!tiktokAPI || !tiktokAPI.isAuthenticated()) {
        alert('Please connect your TikTok account first.');
        return;
    }

    const publishId = document.getElementById('status-publish-id').value.trim();
    if (!publishId) {
        alert('Please enter a publish ID.');
        return;
    }

    const checkBtn = document.getElementById('check-status-btn');
    const resultDiv = document.getElementById('status-result');

    try {
        checkBtn.disabled = true;
        checkBtn.textContent = 'Checking...';
        resultDiv.innerHTML = '';

        const response = await tiktokAPI.getPostStatus(publishId);
        const status = response.data;

        let statusHtml = `
            <div class="status-info">
                <h4>Post Status</h4>
                <p><strong>Publish ID:</strong> <code>${publishId}</code></p>
                <p><strong>Status:</strong> <span class="status-badge ${status.status?.toLowerCase()}">${status.status || 'Unknown'}</span></p>
        `;

        if (status.fail_reason) {
            statusHtml += `<p><strong>Fail Reason:</strong> ${status.fail_reason}</p>`;
        }

        if (status.video_id) {
            statusHtml += `<p><strong>Video ID:</strong> ${status.video_id}</p>`;
        }

        statusHtml += `</div>`;

        resultDiv.innerHTML = statusHtml;

    } catch (error) {
        console.error('Error checking status:', error);
        resultDiv.innerHTML = `
            <div class="error-message">
                <strong>❌ Error checking status</strong>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = 'Check Status';
    }
}

function saveRecentPost(post) {
    const recentPosts = JSON.parse(localStorage.getItem('creator_os_recent_posts') || '[]');
    recentPosts.unshift(post);
    // Keep only last 10 posts
    if (recentPosts.length > 10) {
        recentPosts.pop();
    }
    localStorage.setItem('creator_os_recent_posts', JSON.stringify(recentPosts));
    loadRecentPosts();
}

function loadRecentPosts() {
    const recentPosts = JSON.parse(localStorage.getItem('creator_os_recent_posts') || '[]');
    const listDiv = document.getElementById('recent-posts-list');

    if (!listDiv) return;

    if (recentPosts.length === 0) {
        listDiv.innerHTML = '<p>No recent posts</p>';
        return;
    }

    listDiv.innerHTML = recentPosts.map(post => {
        const date = new Date(post.created_at).toLocaleString();
        return `
            <div class="recent-post-item">
                <div class="post-item-info">
                    <strong>${post.title || 'Untitled'}</strong>
                    <span class="post-type">${post.type === 'video' ? '📹' : '📷'}</span>
                </div>
                <div class="post-item-meta">
                    <code>${post.publish_id}</code>
                    <span>${date}</span>
                </div>
                <button class="btn-small" onclick="document.getElementById('status-publish-id').value='${post.publish_id}'; document.querySelector('[data-post-tab=\"status\"]').click();">Check Status</button>
            </div>
        `;
    }).join('');
}
