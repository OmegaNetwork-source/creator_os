# TikTok API Endpoint Test Results

This document tracks which TikTok API endpoints work with our current setup.

## How to Run Tests

1. Get your access token from browser localStorage or Render logs
2. Run: `ACCESS_TOKEN=act.your_token_here node test-tiktok-apis.js`
3. Or: `node test-tiktok-apis.js act.your_token_here`

## Current Scopes

- ✅ `user.info.basic` - Authorized
- ❌ `user.info.profile` - Not authorized (commented out)
- ❌ `user.info.stats` - Not authorized
- ❌ `video.list` - Not authorized (commented out)
- ❌ `video.insights` - Not authorized
- ❌ `video.comment` - Not authorized

## Test Results

### ✅ Working Endpoints

*Results will be populated after running tests*

### 🔒 Needs Additional Scope

*Results will be populated after running tests*

### ❌ Not Available / Not Found

*Results will be populated after running tests*

### 💥 Failed Tests

*Results will be populated after running tests*

---

## Feature Requirements vs API Availability

### Trend Discovery 🔥
- **Trending Hashtags**: `/research/hashtag/trending/` - Requires Research API access
- **Trending Sounds**: `/research/sound/trending/` - Requires Research API access
- **Hashtag Search**: `/research/hashtag/search/` - Requires Research API access

### Performance Insights 📊
- **Video Statistics**: `/video/list/?fields=...,statistics` - Requires `video.list` scope
- **User Stats**: `/user/info/?fields=...,follower_count,...` - Requires `user.info.stats` scope
- **Video Insights**: `/video/query/?fields=statistics,...` - Requires `video.insights.read` scope

### Engagement Management 💬
- **Video Comments**: `/video/comment/list/` - Requires `video.comment` scope
- **Comment Replies**: May require additional permissions

### Content Planning 🗓
- **User Videos**: `/video/list/` - Requires `video.list` scope
- **Video Details**: `/video/query/` - Requires `video.list` scope

---

## Next Steps

After running tests, update this document with actual results and plan which scopes/products to enable in TikTok Developer Portal.
