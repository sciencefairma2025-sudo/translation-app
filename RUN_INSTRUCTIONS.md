# How to Run the Translation App

## Step 1: Install Dependencies

First, install all required packages:

```bash
cd /Users/maryam/translation-app
npm run install:all
```

This will install:
- Backend dependencies (Express, gRPC, Google Cloud SDKs)
- Frontend dependencies (React, etc.)

**Time: ~2-3 minutes**

---

## Step 2: Set Up Google Cloud (Required for translation to work)

You need a Google Cloud account with APIs enabled:

### Quick Setup:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create/Select a Project**
   - Click project dropdown at top
   - Create new project or select existing

3. **Enable Required APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - ✅ Cloud Speech-to-Text API
     - ✅ Cloud Translation API  
     - ✅ Cloud Text-to-Speech API

4. **Create Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it (e.g., "translation-app")
   - Click "Create and Continue"
   - Add role: **"Editor"** 
     - (Note: "Cloud TTS User" role doesn't exist. "Editor" covers all APIs)
   - Click "Continue" then "Done"

5. **Download Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON"
   - Save the downloaded file as `key.json` in `/Users/maryam/translation-app/`

6. **Enable Billing** (Required - but free tier available):
   - Go to "Billing" in console
   - Link a billing account
   - Google provides $300 free credits

---

## Step 3: Create .env File

Create a file named `.env` in the project root:

```bash
cd /Users/maryam/translation-app
cat > .env << EOF
GOOGLE_APPLICATION_CREDENTIALS=./key.json
PORT=3001
EOF
```

Or manually create `.env` with:
```
GOOGLE_APPLICATION_CREDENTIALS=./key.json
PORT=3001
```

---

## Step 4: Run the App

Start the development servers:

```bash
npm run dev
```

This will:
- Start backend server on port 3001
- Start React frontend on port 3000
- Start gRPC server on port 50051
- Start WebSocket server on port 3001

**Wait for**: "Compiled successfully!" message

---

## Step 5: Open in Browser

Open your browser and go to:

**http://localhost:3000**

You should see the translation app interface!

---

## Step 6: Test It

1. **Allow Microphone Access**: 
   - Browser will ask for permission
   - Click "Allow"

2. **Select Languages**:
   - Choose "From" language (e.g., French)
   - Choose "To" language (e.g., English)

3. **Start Translation**:
   - Click "🎤 Start Translation" button
   - Wait for "🟢 Connected" status

4. **Speak**:
   - Speak clearly into your microphone
   - You'll see translated text appear
   - Hear the translated audio play!

---

## Quick Commands Reference

```bash
# Install dependencies
npm run install:all

# Run development servers
npm run dev

# Check setup
npm run check-setup

# Build for production
npm run build

# Run production server (after build)
npm start
```

---

## Troubleshooting

### "Cannot find module" errors
→ Run `npm run install:all` again

### "Google Cloud authentication" errors
→ Make sure `key.json` is in project root
→ Check `.env` file has correct path

### "Microphone not working"
→ Allow microphone permission in browser
→ Try Chrome or Safari
→ Make sure you're on http://localhost:3000 (not https)

### "WebSocket connection failed"
→ Make sure backend is running (check terminal)
→ Backend should show "WebSocket server running"

### Port already in use
→ Kill process using port: `lsof -ti:3000 | xargs kill`
→ Or change PORT in `.env` file

---

## Need Help?

- Check console for error messages
- See `README.md` for detailed docs
- See `QUICKSTART.md` for condensed guide

