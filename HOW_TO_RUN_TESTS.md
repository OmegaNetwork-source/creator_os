# How to Run TikTok API Tests

## Quick Start

### Step 1: Get Your Access Token

**Option A: From Browser Console (Easiest)**
1. Open your Creator OS dashboard: https://creator-os-h4vg.onrender.com
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Type: `localStorage.getItem('tiktok_access_token')`
5. Copy the token (starts with `act.`)

**Option B: From Browser Storage**
1. Open Developer Tools (F12)
2. Go to Application tab → Local Storage
3. Find `tiktok_access_token`
4. Copy the value

### Step 2: Run the Test Script

```bash
# Using environment variable
ACCESS_TOKEN=act.your_token_here node test-tiktok-apis.js

# Or pass as argument
node test-tiktok-apis.js act.your_token_here
```

### Step 3: Review Results

The script will:
- ✅ Show which endpoints work
- 🔒 Show which endpoints need additional scopes
- ❌ Show which endpoints are not available
- 💥 Show which endpoints failed

Results are also saved in `API_TEST_RESULTS.md`

## What Gets Tested

The script tests all endpoints needed for Creator OS features:

### User Info
- Basic user info (should work ✅)
- Profile info with bio (needs `user.info.profile` scope)
- User stats (needs `user.info.stats` scope)

### Videos
- List user videos (needs `video.list` scope)
- Video details with statistics
- Query specific videos

### Trending
- Trending hashtags (needs Research API access)
- Trending sounds
- Hashtag search

### Analytics
- Video insights/statistics
- User analytics
- Engagement metrics

### Engagement
- Video comments (needs `video.comment` scope)
- Comment replies

## Expected Results

Based on current scopes (`user.info.basic` only):

**✅ Should Work:**
- `/user/info/?fields=open_id,union_id,avatar_url,display_name` - Basic user info

**🔒 Should Need Scope:**
- `/user/info/?fields=...,bio_description` - Needs `user.info.profile`
- `/user/info/?fields=...,follower_count` - Needs `user.info.stats`
- `/video/list/` - Needs `video.list`
- `/video/comment/list/` - Needs `video.comment`

**❌ Likely Not Available:**
- `/research/hashtag/trending/` - Research API requires special approval

## Next Steps After Testing

1. Review `API_TEST_RESULTS.md` for actual results
2. Update `config.js` to request needed scopes
3. Re-authenticate to get new scopes
4. Re-run tests to verify

---

**Note:** Make sure you're in the project directory and have Node.js installed!
