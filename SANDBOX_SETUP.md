# TikTok Sandbox Setup Guide

## ⚠️ Important: Sandbox Mode Limitations

The error `non_sandbox_target` occurs because **sandbox apps can ONLY be used by test users** that you add in the TikTok Developer Portal.

## How to Fix "non_sandbox_target" Error

### Step 1: Add Test Users in TikTok Developer Portal

1. Go to https://developers.tiktok.com/
2. Select your app (the sandbox version)
3. Go to **"Manage"** → **"Test Users"** (or **"Users"** tab)
4. Click **"Add Test User"**
5. Enter the TikTok username or user ID of accounts you want to test with
6. Save the test users

### Step 2: Use Test Accounts Only

- **Only test users you add can authenticate** with your sandbox app
- Regular TikTok accounts will get the `non_sandbox_target` error
- You must use the exact TikTok accounts you added as test users

### Step 3: Enable Products in TikTok Developer Portal

**CRITICAL**: You must enable the products (scopes) in your app settings:

1. Go to your app in TikTok Developer Portal
2. Click on **"Products"** tab
3. Enable these products:
   - ✅ **Login Kit** (provides `user.info.basic` scope)
   - ✅ **TikTok Video Kit** (provides `video.list` scope)
4. Save the changes

**Note**: Some products like `video.upload`, `video.publish`, and `video.insights` may not be available in sandbox mode or require additional approval.

### Step 4: Verify App Settings

In your TikTok Developer Portal, make sure:

1. **App Status**: Shows "Sandbox" (not Production)
2. **Redirect URI**: Exactly matches `https://creatoros.omeganetwork.co/callback.html`
3. **Test Users**: At least one test user is added
4. **Products Enabled**: 
   - Login Kit (for user info)
   - TikTok Video Kit (for video list)

### Step 4: Test with Test User Account

1. Make sure you're logged into TikTok with a test user account (on your phone/browser)
2. Visit: https://creatoros.omeganetwork.co
3. Click "Connect TikTok"
4. You should be able to authorize successfully

## Moving to Production

To use with any TikTok user (not just test users):

1. **Submit your app for review** in TikTok Developer Portal
2. Complete the app review process
3. Once approved, your app moves from Sandbox to Production
4. Then any TikTok user can authenticate

## Current Configuration

- **Client Key**: `sbawfp2mg0wxqesz9n`
- **App Type**: Sandbox
- **Redirect URI**: `https://creatoros.omeganetwork.co/callback.html`

## Troubleshooting

### Error: "scope"
- **Cause**: Requesting scopes that aren't enabled in your app's Products
- **Fix**: 
  1. Go to TikTok Developer Portal → Your App → Products
  2. Enable "Login Kit" and "TikTok Video Kit"
  3. Make sure the scopes in `config.js` match what's enabled
  4. Currently using: `user.info.basic,video.list`

### Error: "non_sandbox_target"
- **Cause**: Trying to authenticate with a non-test user account
- **Fix**: Add the TikTok account as a test user in Developer Portal, or use a test account

### Error: "redirect_uri_mismatch"
- **Cause**: Redirect URI doesn't match exactly
- **Fix**: Ensure it's exactly `https://creatoros.omeganetwork.co/callback.html` (no trailing slash, exact case)

### Can't Add Test Users
- Make sure you're the app owner/admin
- Check if your app is actually in sandbox mode
- Contact TikTok Developer Support if issues persist
