# Running the App on Your Mobile Phone

To use the translation app on your iPhone, you need to deploy it to a **public URL with HTTPS** (required for microphone access).

## Option 1: Deploy to Railway (Easiest - Recommended)

Railway is the easiest way to deploy and get a public URL.

### Steps:

1. **Create Railway Account**:
   - Go to https://railway.app
   - Sign up with GitHub (free tier available)

2. **Prepare Your Code**:
   ```bash
   cd /Users/maryam/translation-app
   # Make sure your code is committed to Git
   git init  # if not already a git repo
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to Railway**:
   - Click "New Project" in Railway
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

4. **Configure Environment Variables**:
   - In Railway dashboard, go to "Variables" tab
   - Add these variables:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./key.json
     PORT=3001
     NODE_ENV=production
     ```

5. **Upload Google Cloud Key**:
   - Go to "Settings" → "Variables"
   - Click "New Variable"
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: Paste the entire contents of your `key.json` file
   - OR: Upload the file in Railway's file system

6. **Deploy**:
   - Railway will automatically detect Node.js
   - Set these in settings if needed:
     - **Build Command**: `npm run install:all && cd client && npm run build`
     - **Start Command**: `npm start`
   - Railway will build and deploy automatically

7. **Get Your URL**:
   - Railway provides a URL like `https://your-app.railway.app`
   - This URL is HTTPS (required for microphone access)

### Access on iPhone:
1. Open Safari on your iPhone
2. Go to `https://your-app.railway.app`
3. Tap the Share button (square with arrow)
4. Select "Add to Home Screen"
5. Grant microphone permission when prompted
6. Start using the app!

---

## Option 2: Deploy to Render (Alternative)

1. Go to https://render.com
2. Sign up (free tier available)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Build Command**: `npm run install:all && cd client && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add your Google Cloud credentials
6. Deploy and get your HTTPS URL

---

## Option 3: Local Network Access (Testing Only)

For quick testing on your local network (iPhone and computer on same WiFi):

### Step 1: Find Your Computer's IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```
This will show something like `192.168.1.100`

### Step 2: Start the App

```bash
cd /Users/maryam/translation-app
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

### Step 3: Access from iPhone

1. Make sure iPhone and Mac are on the **same WiFi network**
2. On iPhone, open Safari
3. Go to: `http://YOUR_IP:3000` (replace YOUR_IP with the IP from step 1)
   - Example: `http://192.168.1.100:3000`

**⚠️ Important Limitations:**
- Microphone access **may not work** over HTTP (Safari requires HTTPS for microphone)
- This is only for testing the UI
- For full functionality, use HTTPS (Options 1 or 2)

---

## Option 4: ngrok (Temporary HTTPS Tunnel)

For quick testing with HTTPS without deploying:

1. **Install ngrok**:
   ```bash
   brew install ngrok
   # Or download from https://ngrok.com/download
   ```

2. **Sign up for free ngrok account** (get authtoken):
   - Go to https://dashboard.ngrok.com/signup

3. **Configure ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Start your app**:
   ```bash
   cd /Users/maryam/translation-app
   npm run dev
   ```

5. **In another terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

6. **Copy the HTTPS URL** ngrok provides (e.g., `https://abc123.ngrok.io`)

7. **Access on iPhone**:
   - Open Safari
   - Go to the ngrok URL
   - Add to home screen
   - Use the app!

**Note**: Free ngrok URLs change each time you restart it. Paid plans get permanent URLs.

---

## Recommended: Railway Deployment

For a permanent, production-ready solution, **Railway is recommended** because:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Automatic deployments from GitHub
- ✅ No credit card required for basic use

---

## Troubleshooting Mobile Access

### "Microphone permission denied"
- Make sure you're using **HTTPS** (not HTTP)
- Go to iPhone Settings → Safari → Camera & Microphone → Allow
- Try in Safari (not Chrome on iOS)

### "Connection failed"
- Check that the backend is running
- Verify WebSocket connections are allowed
- Check firewall settings on server

### "Can't access on same WiFi"
- Make sure both devices are on the same network
- Check Mac firewall isn't blocking connections
- Try disabling Mac firewall temporarily for testing

---

## Quick Checklist for Mobile Access

- [ ] App deployed to public URL OR ngrok tunnel active
- [ ] URL uses HTTPS (not HTTP)
- [ ] Google Cloud credentials configured
- [ ] App loads in browser
- [ ] Microphone permission granted
- [ ] Added to iPhone home screen (optional but recommended)

---

Once deployed, you'll have a permanent URL you can use anywhere, anytime! 🚀


