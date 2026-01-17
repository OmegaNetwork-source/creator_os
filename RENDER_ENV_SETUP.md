# Render Environment Variables Setup

## ⚠️ CRITICAL: The error "invalid_client" means your environment variables are not set correctly in Render!

## Step-by-Step Fix:

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Select your service: `creator-os` (or `creator_os`)

### 2. Go to Environment Tab
- Click on **"Environment"** in the left sidebar
- Or go to: Your Service → Environment

### 3. Add/Update These Environment Variables

Click **"Add Environment Variable"** for each:

```
Key: TIKTOK_CLIENT_KEY
Value: sbawfp2mg0wxqesz9n
```

```
Key: TIKTOK_CLIENT_SECRET
Value: taAgtouxyUrK7xwlC8cjAg2XulNm2jfu
```

```
Key: REDIRECT_URI
Value: https://creatoros.omeganetwork.co/callback.html
```

```
Key: NODE_ENV
Value: production
```

### 4. Save and Redeploy
- After adding all variables, click **"Save Changes"**
- Render will automatically redeploy your service
- Wait 2-3 minutes for deployment to complete

### 5. Verify Backend is Working
- Visit: https://creator-os-h4vg.onrender.com/api/health
- Should return: `{"status":"ok","timestamp":"..."}`

### 6. Test Again
- Go back to your website
- Try connecting TikTok again
- The error should be resolved

## Common Issues:

### Variables Not Showing
- Make sure you're in the correct service
- Check if you have edit permissions
- Try refreshing the page

### Still Getting Errors After Setting Variables
- Wait a few minutes for deployment to complete
- Check Render logs for any errors
- Verify the values are exactly as shown (no extra spaces)

### Backend Not Accessible
- Check if your Render service is running (not sleeping)
- Free tier services sleep after inactivity
- May need to wait 30-60 seconds for first request
