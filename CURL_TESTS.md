# Quick CURL Tests for TikTok APIs

Copy your access token from browser console: `localStorage.getItem('tiktok_access_token')`

Replace `YOUR_TOKEN_HERE` with your actual token in the commands below.

## Backend URL
```
https://creator-os-h4vg.onrender.com
```

## Test 1: Basic User Info (Should Work ✅)
```bash
curl -X GET "https://creator-os-h4vg.onrender.com/api/tiktok/user/info/?fields=open_id,union_id,avatar_url,display_name" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Test 2: User Info with Bio (Needs user.info.profile scope)
```bash
curl -X GET "https://creator-os-h4vg.onrender.com/api/tiktok/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Test 3: User Stats (Needs user.info.stats scope)
```bash
curl -X GET "https://creator-os-h4vg.onrender.com/api/tiktok/user/info/?fields=open_id,display_name,follower_count,following_count,likes_count,video_count" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Test 4: User Videos List (Needs video.list scope)
```bash
curl -X POST "https://creator-os-h4vg.onrender.com/api/tiktok/video/list/?fields=id,title,video_description,cover_image_url,create_time" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"max_count": 10}'
```

## Test 5: User Videos with Stats (Needs video.list scope)
```bash
curl -X POST "https://creator-os-h4vg.onrender.com/api/tiktok/video/list/?fields=id,title,video_description,cover_image_url,create_time,statistics" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"max_count": 10}'
```

## Test 6: Trending Hashtags (Needs Research API - likely won't work)
```bash
curl -X GET "https://creator-os-h4vg.onrender.com/api/tiktok/research/hashtag/trending/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Test 7: Video Comments (Needs video.comment scope)
```bash
curl -X POST "https://creator-os-h4vg.onrender.com/api/tiktok/video/comment/list/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "7080213458555737986", "max_count": 20}'
```

## Expected Results

**✅ Should Work:**
- Test 1: Basic User Info

**🔒 Should Return scope_not_authorized:**
- Test 2: User Info with Bio
- Test 3: User Stats
- Test 4: User Videos List
- Test 5: User Videos with Stats
- Test 7: Video Comments

**❌ Should Return 404 or 403:**
- Test 6: Trending Hashtags (Research API not available)

## Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash
TOKEN="YOUR_TOKEN_HERE"
BASE="https://creator-os-h4vg.onrender.com/api/tiktok"

echo "Test 1: Basic User Info"
curl -X GET "$BASE/user/info/?fields=open_id,union_id,avatar_url,display_name" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo -e "\n\nTest 2: User Videos (needs video.list scope)"
curl -X POST "$BASE/video/list/?fields=id,title,video_description" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_count": 5}' | jq .

echo -e "\n\nTest 3: Trending Hashtags (needs Research API)"
curl -X GET "$BASE/research/hashtag/trending/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

Run: `chmod +x quick-test.sh && ./quick-test.sh`
