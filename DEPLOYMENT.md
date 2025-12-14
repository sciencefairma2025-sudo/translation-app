# Deployment Guide

This guide will help you deploy the Real-Time Translation App to a website so you can test it on your iPhone.

## Option 1: Deploy to Railway (Easiest - Full Stack)

Railway can host both frontend and backend together.

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create a New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Configure Environment Variables**:
   - In Railway dashboard, go to "Variables"
   - Add:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./key.json
     PORT=3001
     ```
   - Upload your Google Cloud service account key file or paste the JSON content

4. **Deploy**:
   - Railway will automatically detect Node.js
   - Set build command: `npm run install:all && cd client && npm run build`
   - Set start command: `npm start`
   - Railway will provide a URL like `https://your-app.railway.app`

5. **Update WebSocket Connection**:
   - In `client/.env`, set:
     ```
     REACT_APP_WS_HOST=your-app.railway.app
     REACT_APP_WS_PORT=8080
     ```
   - Or Railway will handle this automatically

## Option 2: Separate Frontend/Backend Deployment

### Backend (Railway/Render)

1. **Deploy Backend**:
   - Same as Option 1, but only deploy the backend
   - Get your backend URL (e.g., `https://api-your-app.railway.app`)

### Frontend (Vercel/Netlify)

#### Using Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. In project root: `vercel`
3. Set environment variables:
   - `REACT_APP_WS_HOST`: Your backend hostname (without https://)
   - `REACT_APP_WS_PORT`: 8080
4. Build and deploy

#### Using Netlify:
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repo
3. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
4. Environment variables:
   - `REACT_APP_WS_HOST`: Your backend hostname
   - `REACT_APP_WS_PORT`: 8080

## Option 3: Manual Deployment (VPS)

1. **Set up Server**:
   - Get a VPS (DigitalOcean, AWS EC2, etc.)
   - Install Node.js 18+
   - Install PM2: `npm install -g pm2`

2. **Clone and Setup**:
   ```bash
   git clone your-repo-url
   cd translation-app
   npm run install:all
   ```

3. **Configure**:
   - Upload your Google Cloud key.json
   - Create `.env` file with credentials
   - Build frontend: `cd client && npm run build`

4. **Start with PM2**:
   ```bash
   pm2 start server/index.js --name translation-app
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx** (for HTTPS):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL Certificate** (Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Testing on iPhone

1. **Access the App**:
   - Open Safari on iPhone
   - Navigate to your deployed URL

2. **Add to Home Screen**:
   - Tap the Share button (square with arrow)
   - Select "Add to Home Screen"
   - Name it "Translation App"

3. **Grant Permissions**:
   - When you tap "Start Translation", Safari will ask for microphone permission
   - Tap "Allow"

4. **Test**:
   - Select languages (e.g., French → English)
   - Tap "Start Translation"
   - Speak into your iPhone's microphone
   - The translated audio should play through your speakers

## Troubleshooting

### Microphone Not Working:
- Ensure you're using HTTPS (required for microphone access)
- Check browser permissions in Settings > Safari > Camera & Microphone
- Try closing and reopening the app

### WebSocket Connection Issues:
- Ensure WebSocket port (8080) is open on your server
- Check firewall settings
- Verify REACT_APP_WS_HOST points to correct domain

### Audio Not Playing:
- Check device volume
- Ensure headphones are connected if using them
- Check browser console for errors

### Google Cloud Errors:
- Verify service account key is correct
- Check APIs are enabled in Google Cloud Console
- Verify billing is enabled on your Google Cloud project

## Quick Test Locally Before Deploying

1. Install dependencies: `npm run install:all`
2. Set up Google Cloud credentials
3. Run: `npm run dev`
4. Open `http://localhost:3000` in your browser
5. Test the translation flow

Once working locally, deploy to production!


