# 🚀 Quick Guide: Run on Your iPhone

## Fastest Way: Deploy to Railway (5 minutes)

### 1. Push Code to GitHub
```bash
cd /Users/maryam/translation-app
git init
git add .
git commit -m "Translation app"
# Create a new repo on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Railway
1. Go to https://railway.app → Sign up (free)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. In "Variables" tab, add:
   - `GOOGLE_APPLICATION_CREDENTIALS` = (paste entire key.json content)
   - `PORT` = `3001`
5. Railway will automatically deploy!

### 3. Get Your URL
- Railway gives you: `https://your-app.railway.app`
- This is your permanent HTTPS URL!

### 4. Use on iPhone
1. Open Safari on iPhone
2. Go to `https://your-app.railway.app`
3. Tap **Share** button (square with arrow)
4. Tap **Add to Home Screen**
5. Grant **microphone permission** when asked
6. Start translating! 🎉

---

## Quick Test: Use ngrok (2 minutes)

For a temporary HTTPS URL to test:

```bash
# Install ngrok
brew install ngrok

# Sign up at https://dashboard.ngrok.com (free)
# Get your authtoken from dashboard

# Configure
ngrok config add-authtoken YOUR_TOKEN

# Start your app
cd /Users/maryam/translation-app
./run.sh

# In another terminal, start ngrok
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and open it on your iPhone!

**Note**: Free ngrok URLs change each restart. For permanent URL, use Railway.

---

## Why HTTPS is Required

- iPhone Safari requires HTTPS for microphone access
- HTTP won't work for the translation features
- Railway and ngrok both provide HTTPS automatically

---

## Need Help?

See `MOBILE_SETUP.md` for detailed instructions!


