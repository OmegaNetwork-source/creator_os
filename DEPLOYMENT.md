# Creator OS - Deployment Guide

## Backend Server Setup (Required for Live Data)

The TikTok API requires a backend server to securely handle OAuth and API requests. Follow these steps:

### 1. Deploy Backend to Render

1. **Create a new Web Service on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

3. **Set Environment Variables in Render**
   
   Go to your service → Environment tab and add:

   ```
   TIKTOK_CLIENT_KEY=sbawfp2mg0wxqesz9n
   TIKTOK_CLIENT_SECRET=taAgtouxyUrK7xwlC8cjAg2XulNm2jfu
   REDIRECT_URI=https://creatoros.omeganetwork.co/callback.html
   NODE_ENV=production
   ```

4. **Get Your Backend URL**
   - After deployment, Render will give you a URL like: `https://creator-os-xxxx.onrender.com`
   - Copy this URL

### 2. Update Frontend Configuration

1. **Update `index.html`** - Add this before closing `</head>` tag:

```html
<script>
    // Set your Render backend URL here
    window.CREATOR_OS_BACKEND_URL = 'https://your-backend-url.onrender.com';
</script>
```

2. **Or set it in your hosting environment** (if using environment variables)

### 3. Update TikTok App Settings

1. Go to https://developers.tiktok.com/
2. Edit your app settings
3. Make sure **Redirect URI** is set to: `https://creatoros.omeganetwork.co/callback.html`

### 4. Test the Integration

1. Visit your website: https://creatoros.omeganetwork.co
2. Click "Connect TikTok"
3. Authorize the app
4. You should see real data loading!

## Troubleshooting

### No Data Loading
- Check browser console for errors
- Verify backend URL is correct
- Check Render logs for backend errors
- Ensure environment variables are set correctly

### CORS Errors
- Make sure backend has CORS enabled (already in server.js)
- Verify backend URL matches frontend domain

### Token Exchange Fails
- Check TikTok app redirect URI matches exactly
- Verify client_key and client_secret in Render environment variables
- Check Render logs for detailed error messages

## Architecture

```
Frontend (creatoros.omeganetwork.co)
    ↓
Backend (Render - your-backend-url.onrender.com)
    ↓
TikTok API (open.tiktokapis.com)
```

The backend:
- Securely stores client_secret
- Handles OAuth token exchange
- Proxies API requests to TikTok
- Avoids CORS issues
