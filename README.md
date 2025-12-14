# Real-Time Language Translation App

A real-time language translation application that translates speech from one language to another using gRPC streaming, Google Cloud Speech-to-Text, Translation API, and Text-to-Speech.

## Features

- 🎤 Real-time audio input from microphone
- 🔄 Streaming translation via gRPC/WebSocket
- 🔊 Natural-sounding text-to-speech output (Neural voices)
- 📱 Progressive Web App (PWA) - works on iPhone and other devices
- 🌍 Support for multiple languages (French, English, Spanish, German, Italian, Japanese, Chinese)

## Architecture

- **Frontend**: React PWA with WebSocket client
- **Backend**: Node.js with gRPC server and WebSocket bridge
- **Cloud Services**: Google Cloud Speech-to-Text, Translation API, Text-to-Speech (Neural voices)

## Setup

### Prerequisites

1. Node.js (v16 or higher)
2. Google Cloud account with the following APIs enabled:
   - Cloud Speech-to-Text API
   - Cloud Translation API
   - Cloud Text-to-Speech API

### Installation

1. Install dependencies:
```bash
npm run install:all
```

2. Set up Google Cloud credentials:
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/key.json
   ```
   Or create a `.env` file in the root directory:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/key.json
   ```

### Running Locally

1. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on port 3001
- WebSocket server on port 8080
- gRPC server on port 50051
- React app on port 3000

2. Open your browser to `http://localhost:3000`

### Building for Production

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deployment

### Deploy to Vercel/Netlify (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel/Netlify):
1. Build the React app: `cd client && npm run build`
2. Deploy the `client/build` folder
3. Set environment variables:
   - `REACT_APP_WS_HOST`: Your backend WebSocket host
   - `REACT_APP_WS_PORT`: 8080

#### Backend (Railway/Render):
1. Connect your repository
2. Set build command: `npm install && cd client && npm install && npm run build`
3. Set start command: `npm start`
4. Set environment variables:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to key.json or paste JSON content
   - `PORT`: 3001

### Quick Deploy Script

For easy deployment, you can use the following services:
- **Vercel** (frontend): `vercel --prod`
- **Railway** (backend): Connect GitHub repo and deploy
- **Render** (backend): Connect GitHub repo and deploy

## Testing on iPhone

1. Deploy the app to a public URL (HTTPS required for microphone access)
2. Open Safari on your iPhone
3. Navigate to the app URL
4. Tap the share button and select "Add to Home Screen"
5. Grant microphone permissions when prompted
6. Select languages and start translation

## Configuration

### Environment Variables

- `PORT`: HTTP server port (default: 3001)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google Cloud service account key

### Client Environment Variables

Create a `.env` file in the `client/` directory:

- `REACT_APP_WS_HOST`: WebSocket host (default: current hostname)
- `REACT_APP_WS_PORT`: WebSocket port (default: 8080)

## Supported Languages

- French (fr)
- English (en)
- Spanish (es)
- German (de)
- Italian (it)
- Japanese (ja)
- Chinese (zh)

## License

MIT


