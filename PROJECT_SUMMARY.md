# Project Summary: Real-Time Translation App

## Overview

A complete real-time language translation application that translates spoken language from one language to another using Google Cloud services. The app is designed to work on mobile devices (including iPhone) as a Progressive Web App (PWA).

## Architecture

### Frontend (React PWA)
- **Location**: `client/`
- **Technology**: React 18
- **Features**:
  - Microphone audio capture
  - Real-time audio streaming via WebSocket
  - Live audio playback of translated speech
  - Language selection (7 languages supported)
  - Responsive design for mobile devices
  - PWA support for iPhone home screen installation

### Backend (Node.js)
- **Location**: `server/`
- **Technology**: Node.js with Express
- **Components**:
  1. **gRPC Server** (port 50051)
     - Handles bidirectional audio streaming
     - Protocol defined in `server/proto/translation.proto`
  
  2. **WebSocket Bridge** (port 3001, same as HTTP)
     - Bridges browser WebSocket connections to gRPC
     - Allows browser compatibility (browsers can't use gRPC directly)
  
  3. **HTTP Server** (port 3001)
     - Serves the React frontend
     - Handles API requests

### Cloud Services (Google Cloud)
1. **Speech-to-Text API**
   - Converts audio stream to text
   - Supports streaming recognition
   - Language detection based on selection

2. **Translation API**
   - Translates text from source to target language
   - Real-time translation processing

3. **Text-to-Speech API** (Neural voices)
   - Converts translated text to natural-sounding speech
   - Uses WaveNet neural voices for natural intonation
   - Multiple voice options per language

## Data Flow

```
iPhone Microphone
    ↓
React App (WebSocket)
    ↓
Backend WebSocket Bridge
    ↓
gRPC Stream
    ↓
Google Cloud Speech-to-Text
    ↓
Google Cloud Translation
    ↓
Google Cloud Text-to-Speech
    ↓
gRPC Stream (translated audio)
    ↓
Backend WebSocket Bridge
    ↓
React App (WebSocket)
    ↓
iPhone Speaker
```

## Supported Languages

- 🇫🇷 French (fr-FR)
- 🇺🇸 English (en-US)
- 🇪🇸 Spanish (es-ES)
- 🇩🇪 German (de-DE)
- 🇮🇹 Italian (it-IT)
- 🇯🇵 Japanese (ja-JP)
- 🇨🇳 Chinese (zh-CN)

## Key Features

1. **Real-Time Streaming**: Low-latency audio streaming for near-instant translation
2. **Natural Voice**: Uses Google's Neural TTS voices for human-like speech
3. **Mobile-First**: PWA design works perfectly on iPhone and Android
4. **No App Store Required**: Install directly from browser to home screen
5. **Secure**: Uses HTTPS/WSS for all connections (required for microphone)

## File Structure

```
translation-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/               # React components
│   │   ├── App.js        # Main component
│   │   └── App.css       # Styles
│   └── package.json
├── server/                # Node.js backend
│   ├── proto/            # gRPC protocol definitions
│   │   └── translation.proto
│   └── index.js          # Main server file
├── scripts/              # Utility scripts
│   └── check-setup.js   # Setup verification
├── package.json          # Root dependencies
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Docker Compose config
├── README.md             # Main documentation
├── QUICKSTART.md         # Quick setup guide
├── DEPLOYMENT.md         # Deployment instructions
└── .env.example          # Environment template
```

## Deployment Options

1. **Railway** (Recommended - Easiest)
   - Deploy full stack in one go
   - Automatic HTTPS
   - Environment variable management

2. **Separate Deployment**
   - Frontend: Vercel/Netlify
   - Backend: Railway/Render

3. **VPS**
   - Manual setup with PM2
   - Full control over infrastructure

## Requirements

- Node.js 16+
- Google Cloud account with billing enabled
- Service account with required APIs enabled

## Next Steps

1. **Setup**: Follow `QUICKSTART.md`
2. **Test Locally**: Run `npm run dev`
3. **Deploy**: Follow `DEPLOYMENT.md`
4. **Test on iPhone**: Add to home screen and grant microphone access

## Notes

- Microphone access requires HTTPS in production
- WebSocket uses same port as HTTP server for simpler deployment
- gRPC is internal only (browsers connect via WebSocket bridge)
- All audio processing happens in Google Cloud for accuracy and natural voices


