# 📱 Deployment Checklist for Mobile

Use this checklist to deploy your translation app to your phone/iPad.

## ✅ Pre-Deployment Checklist

- [ ] Google Cloud credentials set up (`key.json` exists)
- [ ] Google Cloud APIs enabled (Speech, Translation, Text-to-Speech)
- [ ] Service account has proper permissions
- [ ] App works locally (`npm run dev` works)
- [ ] Code is ready (no errors in console)

## 🚀 Deployment Steps

### Step 1: Prepare Code
- [ ] Run `./prepare-deploy.sh` to check everything
- [ ] Initialize git: `git init` (if not done)
- [ ] Create `.gitignore` (script does this automatically)
- [ ] Commit code: `git add . && git commit -m "Ready for deployment"`

### Step 2: Push to GitHub
- [ ] Create new repository on GitHub
- [ ] Add remote: `git remote add origin YOUR_REPO_URL`
- [ ] Push: `git push -u origin main`

### Step 3: Deploy to Railway
- [ ] Sign up at https://railway.app
- [ ] Create new project from GitHub repo
- [ ] Add environment variable: `GOOGLE_APPLICATION_CREDENTIALS` (paste key.json content)
- [ ] Add environment variable: `PORT=3001`
- [ ] Add environment variable: `NODE_ENV=production`
- [ ] Set build command: `npm run install:all && cd client && npm run build`
- [ ] Set start command: `npm start`
- [ ] Wait for deployment to complete
- [ ] Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Step 4: Test on Mobile
- [ ] Open Safari on iPhone/iPad
- [ ] Go to your Railway URL
- [ ] Tap Share → "Add to Home Screen"
- [ ] Open app from home screen
- [ ] Grant microphone permission
- [ ] Test translation (speak and hear translation)

## 🎯 Quick Commands

```bash
# 1. Prepare for deployment
./prepare-deploy.sh

# 2. Commit code
git add .
git commit -m "Ready for deployment"

# 3. Push to GitHub (after creating repo)
git remote add origin https://github.com/YOUR_USERNAME/translation-app.git
git push -u origin main
```

## 📋 Railway Environment Variables

Copy these into Railway's Variables tab:

```
GOOGLE_APPLICATION_CREDENTIALS=<paste entire key.json content>
PORT=3001
NODE_ENV=production
```

## 🔗 Your Deployment URL

Once deployed, your app will be available at:
```
https://your-app-name.railway.app
```

## 📱 Using on iPhone/iPad

1. Open Safari
2. Go to your Railway URL
3. Share → Add to Home Screen
4. Open from home screen
5. Allow microphone access
6. Start translating!

## ⚠️ Important Notes

- **HTTPS is required** for microphone access on mobile
- Use **Safari** (not Chrome) for best PWA experience
- Railway free tier includes $5/month credit
- Google Cloud free tier includes $300 credit
- Both are free for development/testing!

## 🆘 Need Help?

See `DEPLOY_NOW.md` for detailed step-by-step instructions!

