# How to Get Your TikTok Access Token

## Method 1: Browser Console (Easiest)

1. Open your Creator OS dashboard: https://creator-os-h4vg.onrender.com
2. Make sure you're logged in (you should see "Connected as: [username]")
3. Press **F12** to open Developer Tools
4. Go to **Console** tab
5. Type one of these commands:

```javascript
// Try this first (most common)
localStorage.getItem('tiktok_access_token')

// If that doesn't work, try:
localStorage.getItem('tiktok_refresh_token')

// Or see ALL TikTok-related keys:
Object.keys(localStorage).filter(k => k.includes('tiktok'))
```

## Method 2: Application Tab (Visual)

1. Open Developer Tools (F12)
2. Go to **Application** tab (or **Storage** in Firefox)
3. Click **Local Storage** in the left sidebar
4. Click on your domain: `creator-os-h4vg.onrender.com`
5. Look for keys starting with `tiktok_`
6. Find `tiktok_access_token` and copy its value

## Method 3: Check All Storage Keys

In the console, type:
```javascript
// See all localStorage keys
Object.keys(localStorage)

// See all localStorage with values
Object.keys(localStorage).forEach(key => {
    console.log(key + ':', localStorage.getItem(key))
})
```

## Method 4: Network Tab (If Token is Being Sent)

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Filter by "tiktok" or "api"
4. Click on any API request
5. Go to **Headers** tab
6. Look for `Authorization: Bearer act.xxx...`
7. Copy the token after "Bearer "

## Common Issues

**Problem:** `localStorage.getItem('tiktok_access_token')` returns `null`

**Solutions:**
- Make sure you're on the correct domain (creator-os-h4vg.onrender.com)
- Make sure you're logged in (check if you see "Connected as: [username]")
- Try refreshing the page
- Check if you're in incognito/private mode (localStorage might be disabled)
- Try the Application tab method instead

**Problem:** Token is there but very short

**Solution:** Make sure you copied the FULL token. It should be quite long (starts with `act.` and is 100+ characters)

## Quick Test Script

Once you have the token, test it:

```bash
# Replace YOUR_TOKEN with the actual token
TOKEN="act.your_token_here"

# Test basic user info
curl -X GET "https://creator-os-h4vg.onrender.com/api/tiktok/user/info/?fields=open_id,union_id,avatar_url,display_name" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

If you get a 401 error, the token might be expired. Try logging out and back in.
