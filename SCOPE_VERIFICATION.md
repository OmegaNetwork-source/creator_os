# TikTok Scope Verification Guide

## Current Error: `scope_not_authorized`

This error means your access token doesn't have the required scopes (`user.info.basic`, `video.list`).

## Critical Check: TikTok Developer Portal Products & Scopes

Your code is requesting these scopes:
- `user.info.basic`
- `video.list`

### Step 1: Verify Products Are Enabled

Go to TikTok Developer Portal → Your App → **Products**

You MUST have these products enabled:

1. **Login Kit** ✅ (should already be enabled)
   - Provides: `user.info.basic`
   - This allows reading basic user profile info

2. **Display API** ❓ (MAY NOT be enabled - THIS IS LIKELY THE ISSUE)
   - Provides: `video.list`
   - This allows reading user's video list

### Step 2: Verify Scopes in Developer Portal

After enabling Display API:

1. Go to: Your App → Products → **Display API**
2. Click on **Scopes** tab (or scroll to see available scopes)
3. Make sure `video.list` is listed and enabled

### Step 3: Check Your Authorization URL

When you click "Connect TikTok", check your browser console. You should see:

```
🔗 Full auth URL: https://www.tiktok.com/v2/auth/authorize/?client_key=...&scope=user.info.basic,video.list&...
🔗 Scopes being requested: user.info.basic,video.list
```

### Step 4: During Authorization Screen

When TikTok shows the authorization screen, it should list what permissions you're granting:
- "Read your profile information" (from `user.info.basic`)
- "Read your video list" (from `video.list`)

**IMPORTANT:** Make sure you see BOTH permissions and click "Authorize" for both.

### Step 5: If Display API Isn't Available in Sandbox

In TikTok Sandbox mode, some products may not be fully available. Check:

1. Is "Display API" listed as a product you can add?
2. If not, you may need to:
   - Wait for app review (move from Sandbox to Production)
   - Or request access to Display API in Sandbox mode

### Quick Test: Try with Only `user.info.basic`

Temporarily modify `config.js` to only request `user.info.basic`:

```javascript
scopes: ['user.info.basic'].join(',')
```

If this works, then the issue is `video.list` scope not being available.

### Common Issues:

1. **Display API not enabled** → Enable it in Developer Portal
2. **Scopes not checked during authorization** → Re-login and make sure to approve all permissions
3. **Sandbox limitations** → Some scopes may not be available in Sandbox mode
4. **App not approved** → May need to submit for review to get full access

## Next Steps:

1. Check if "Display API" product is enabled in TikTok Developer Portal
2. If not enabled, add it and enable `video.list` scope
3. Log out and log back in to get a fresh token with the new scopes
4. Check browser console to verify scopes are being requested correctly
