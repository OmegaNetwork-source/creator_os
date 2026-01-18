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

## Expected Test Results (Based on Current Scopes)

**Current Setup:**
- ✅ `user.info.basic` - Authorized
- ❌ All other scopes - Not authorized

### ✅ Should Work (user.info.basic scope)

1. **Basic User Info**
   - Endpoint: `/user/info/?fields=open_id,union_id,avatar_url,display_name`
   - Status: ✅ Should work
   - Returns: User's open_id, union_id, avatar_url, display_name

### 🔒 Needs Additional Scope

1. **User Info with Profile**
   - Endpoint: `/user/info/?fields=...,bio_description`
   - Needs: `user.info.profile` scope
   - Status: 🔒 Should return `scope_not_authorized`

2. **User Info with Stats**
   - Endpoint: `/user/info/?fields=...,follower_count,following_count,likes_count,video_count`
   - Needs: `user.info.stats` scope
   - Status: 🔒 Should return `scope_not_authorized`

3. **User Videos List**
   - Endpoint: `/video/list/?fields=id,title,video_description,cover_image_url,create_time`
   - Needs: `video.list` scope
   - Status: 🔒 Should return `scope_not_authorized`

4. **Video Statistics**
   - Endpoint: `/video/list/?fields=...,statistics`
   - Needs: `video.list` scope
   - Status: 🔒 Should return `scope_not_authorized`

5. **Video Comments**
   - Endpoint: `/video/comment/list/`
   - Needs: `video.comment` scope (likely)
   - Status: 🔒 Should return `scope_not_authorized` or `not_found`

### ❌ Not Available / Requires Special Access

1. **Trending Hashtags**
   - Endpoint: `/research/hashtag/trending/`
   - Needs: Research API product access (requires approval)
   - Status: ❌ Likely returns 404 or 403

2. **Trending Sounds**
   - Endpoint: `/research/sound/trending/`
   - Needs: Research API product access
   - Status: ❌ Likely returns 404 or 403

3. **Hashtag Search**
   - Endpoint: `/research/hashtag/search/`
   - Needs: Research API product access
   - Status: ❌ Likely returns 404 or 403

### 💥 May Fail for Other Reasons

1. **Video Query** (with specific video IDs)
   - Endpoint: `/video/query/?fields=id,title,...`
   - Needs: `video.list` scope + valid video IDs
   - Status: 💥 May fail due to scope or invalid video IDs

2. **User Search**
   - Endpoint: `/user/search/`
   - Needs: Search API product (may not exist in Display API)
   - Status: 💥 Likely returns 404

## Test Results (After Running Script)

### ✅ Working Endpoints

*Run `node test-tiktok-apis.js <token>` to populate*

### 🔒 Needs Additional Scope

*Run `node test-tiktok-apis.js <token>` to populate*

### ❌ Not Available / Not Found

*Run `node test-tiktok-apis.js <token>` to populate*

### 💥 Failed Tests

*Run `node test-tiktok-apis.js <token>` to populate*

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
