# Quick Start Guide

Get your translation app running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd translation-app
npm run install:all
```

## Step 2: Set Up Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Cloud Speech-to-Text API
   - Cloud Translation API
   - Cloud Text-to-Speech API
4. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "translation-app")
   - Grant role: **"Editor"** (this covers all APIs - note: "Cloud TTS User" role doesn't exist)
   - Create and download JSON key file
5. Save the key file as `key.json` in the project root

## Step 3: Configure Environment

Create a `.env` file in the project root:

```
GOOGLE_APPLICATION_CREDENTIALS=./key.json
PORT=3001
```

## Step 4: Run Locally

```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- React app on http://localhost:3000

Open http://localhost:3000 in your browser!

## Step 5: Test

1. Allow microphone access when prompted
2. Select languages (e.g., French → English)
3. Click "Start Translation"
4. Speak into your microphone
5. Hear the translated audio!

## Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

The easiest option is **Railway**:
1. Push code to GitHub
2. Connect Railway to your repo
3. Upload `key.json` or set credentials
4. Deploy!

Your app will be live at a URL like `https://your-app.railway.app`

## Troubleshooting

**"Microphone not working"**
- Make sure you're using HTTPS (required for microphone)
- Check browser permissions
- Try Chrome or Safari

**"Google Cloud errors"**
- Verify `key.json` is in the right place
- Check APIs are enabled
- Ensure billing is enabled on Google Cloud

**"WebSocket connection failed"**
- Check firewall allows port 8080 (dev) or your HTTP port (production)
- Verify REACT_APP_WS_HOST is set correctly

## Need Help?

Check the full [README.md](./README.md) for more details.

