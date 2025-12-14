const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const speech = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');

const PROTO_PATH = path.join(__dirname, 'proto/translation.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const translationProto = grpc.loadPackageDefinition(packageDefinition).translation;

// Initialize Google Cloud clients with error handling
let speechClient, translateClient, ttsClient;

try {
  console.log('Initializing Google Cloud clients...');
  speechClient = new speech.SpeechClient();
  translateClient = new Translate();
  ttsClient = new textToSpeech.TextToSpeechClient();
  console.log('✅ Google Cloud clients initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud clients:', error);
  console.error('Please check:');
  console.error('  1. GOOGLE_APPLICATION_CREDENTIALS is set correctly');
  console.error('  2. key.json file exists and is valid');
  console.error('  3. Service account has necessary permissions');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// WebSocket bridge for gRPC (since browsers can't use gRPC directly)
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Language codes mapping
const languageCodes = {
  'french': 'fr-FR',
  'english': 'en-US',
  'spanish': 'es-ES',
  'german': 'de-DE',
  'italian': 'it-IT',
  'japanese': 'ja-JP',
  'chinese': 'zh-CN',
};

// Translation language codes (slightly different format)
const translateCodes = {
  'french': 'fr',
  'english': 'en',
  'spanish': 'es',
  'german': 'de',
  'italian': 'it',
  'japanese': 'ja',
  'chinese': 'zh',
};

// Active streams for each WebSocket connection
const activeStreams = new Map();

// Track gRPC server readiness
let grpcServerReady = false;

// gRPC service implementation
const streamTranslation = (call) => {
  let recognizeStream = null;
  let sourceLanguage = 'fr-FR';
  let targetLanguage = 'en-US';
  let sourceTranslateCode = 'fr';
  let targetTranslateCode = 'en';
  let lastInterimText = ''; // Track last interim text to avoid duplicate processing
  let lastInterimTime = 0; // Throttle interim results
  const INTERIM_THROTTLE_MS = 200; // Reduced to 200ms for more real-time feel
  const MIN_TEXT_LENGTH = 3; // Minimum text length before processing interim

  call.on('data', async (audioChunk) => {
    try {
      sourceLanguage = languageCodes[audioChunk.source_language.toLowerCase()] || sourceLanguage;
      targetLanguage = languageCodes[audioChunk.target_language.toLowerCase()] || targetLanguage;
      sourceTranslateCode = translateCodes[audioChunk.source_language.toLowerCase()] || sourceTranslateCode;
      targetTranslateCode = translateCodes[audioChunk.target_language.toLowerCase()] || targetTranslateCode;

      if (!recognizeStream) {
        // Initialize speech recognition stream
        console.log(`Initializing speech recognition: ${sourceLanguage} -> ${targetLanguage}`);
        
        // Create streaming config - pass it directly to streamingRecognize()
        const streamingConfig = {
          config: {
            encoding: audioChunk.encoding || 'LINEAR16',
            sampleRateHertz: audioChunk.sample_rate || 16000,
            languageCode: sourceLanguage,
            alternativeLanguageCodes: [],
            enableAutomaticPunctuation: true,
            model: 'latest_long',
          },
          interimResults: true,
        };
        
        console.log('Creating streaming recognize stream with config');
        
        // Create streaming recognize request stream with config
        recognizeStream = speechClient
          .streamingRecognize(streamingConfig)
          .on('error', (err) => {
            console.error('Speech recognition error:', err);
            call.destroy();
          })
          .on('data', async (data) => {
            console.log('Speech recognition data received');
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              if (result.alternatives && result.alternatives.length > 0) {
                const transcript = result.alternatives[0].transcript;
                const isFinal = result.isFinal;
                console.log(`Recognized text: "${transcript}" (final: ${isFinal})`);

                if (transcript && transcript.trim()) {
                  try {
                    const now = Date.now();
                    const transcriptLength = transcript.trim().length;
                    const isSignificantChange = transcript !== lastInterimText;
                    const timeSinceLastUpdate = now - lastInterimTime;
                    
                    // For real-time: process if:
                    // 1. It's a final result (always process)
                    // 2. Text has changed AND enough time has passed OR text is long enough
                    // 3. Text is long enough to be meaningful (avoid processing single words)
                    const shouldProcessInterim = isFinal || 
                      (isSignificantChange && 
                       (timeSinceLastUpdate > INTERIM_THROTTLE_MS || transcriptLength >= MIN_TEXT_LENGTH * 2));
                    
                    // Skip if it's too short or hasn't changed
                    if (!isFinal && (!shouldProcessInterim || transcriptLength < MIN_TEXT_LENGTH)) {
                      // Still send text update for display, but skip audio generation
                      call.write({
                        audio_data: Buffer.alloc(0),
                        text: transcript, // Show text even if we skip audio
                        is_final: false,
                      });
                      return;
                    }

                    // Update tracking
                    if (!isFinal) {
                      lastInterimText = transcript;
                      lastInterimTime = now;
                    } else {
                      // Reset on final result
                      lastInterimText = '';
                      lastInterimTime = 0;
                    }

                    // Skip translation if source and target are the same
                    let translation = transcript;
                    if (sourceTranslateCode !== targetTranslateCode) {
                      // Translate the text
                      console.log(`Translating from ${sourceTranslateCode} to ${targetTranslateCode}`);
                      const [translatedText] = await translateClient.translate(transcript, {
                        from: sourceTranslateCode,
                        to: targetTranslateCode,
                      });
                      translation = translatedText;
                      console.log(`Translated text: "${translation}"`);
                    } else {
                      console.log('Source and target languages are the same, skipping translation');
                    }

                    // Generate speech for both interim and final results for real-time experience
                    // Client will handle canceling previous audio when new audio arrives
                    const ttsRequest = {
                      input: { text: translation },
                      voice: {
                        languageCode: targetLanguage,
                        ssmlGender: 'NEUTRAL',
                        // Removed 'name' field - Google will auto-select best voice for language
                        // name: getNaturalVoiceName(targetLanguage),
                      },
                      audioConfig: {
                        audioEncoding: 'LINEAR16',
                        sampleRateHertz: 24000,
                        speakingRate: 1.0,
                        pitch: 0.0,
                        volumeGainDb: 0.0,
                      },
                    };

                    console.log(`Synthesizing speech for ${isFinal ? 'final' : 'interim'} result...`);
                    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
                    console.log('Speech synthesized, sending response');

                    // Send translated audio back (for both interim and final results)
                    call.write({
                      audio_data: ttsResponse.audioContent,
                      text: translation,
                      is_final: isFinal,
                    });
                  } catch (error) {
                    console.error('Translation/TTS error:', error);
                    console.error('Error details:', error.stack);
                  }
                } else {
                  console.log('Empty transcript, skipping');
                }
              }
            }
          });
        
        console.log('Stream created, ready to send audio');
      }

      // Send audio to recognition stream (AFTER config has been sent)
      // The helper will automatically wrap it in { audioContent: ... }
      if (recognizeStream) {
        recognizeStream.write(audioChunk.audio_data);
      } else {
        console.warn('Audio chunk received but recognizeStream not initialized');
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      console.error('Error details:', error.stack);
    }
  });

  call.on('end', () => {
    if (recognizeStream) {
      recognizeStream.end();
    }
    call.end();
  });

  call.on('error', (error) => {
    console.error('Stream error:', error);
    if (recognizeStream) {
      recognizeStream.end();
    }
  });
};

// Get natural voice name for each language
// Note: Voice names may need to be updated based on available voices in your Google Cloud project
function getNaturalVoiceName(languageCode) {
  const voices = {
    'en-US': 'en-US-Neural2-F', // Natural female voice
    'fr-FR': 'fr-FR-Neural2-D', // Use Neural2 voices (updated naming)
    'es-ES': 'es-ES-Neural2-F',
    'de-DE': 'de-DE-Neural2-F',
    'it-IT': 'it-IT-Neural2-A',
    'ja-JP': 'ja-JP-Neural2-B',
    'zh-CN': 'zh-CN-Neural2-A',
  };
  
  // Fallback: if specific voice doesn't work, let Google choose automatically
  // by returning undefined or just languageCode (which works with ssmlGender)
  return voices[languageCode] || 'en-US-Neural2-F';
}

// WebSocket bridge for browser compatibility
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message type:', data.type);
      
      if (data.type === 'start') {
        // Check if gRPC server is ready
        if (!grpcServerReady) {
          console.error('gRPC server not ready yet');
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Translation service is not ready yet. Please try again in a moment.' 
          }));
          return;
        }

        // Create gRPC call
        const grpcHost = process.env.GRPC_HOST || 'localhost:50051';
        console.log('Creating gRPC connection to:', grpcHost);
        
        try {
          const client = new translationProto.TranslationService(
            grpcHost,
            grpc.credentials.createInsecure()
          );
          
          const stream = client.StreamTranslation();
          activeStreams.set(ws, stream);
          console.log('gRPC stream created and ready to receive audio');

          stream.on('data', (response) => {
            console.log('Received translation response, text:', response.text);
            try {
              ws.send(JSON.stringify({
                type: 'audio',
                audioData: response.audio_data.toString('base64'),
                text: response.text,
                isFinal: response.is_final,
              }));
            } catch (error) {
              console.error('Error sending WebSocket message:', error);
            }
          });

          stream.on('error', (error) => {
            console.error('gRPC stream error:', error);
            try {
              ws.send(JSON.stringify({ type: 'error', message: error.message }));
            } catch (sendError) {
              console.error('Error sending error message:', sendError);
            }
          });

          stream.on('end', () => {
            console.log('gRPC stream ended');
            activeStreams.delete(ws);
          });
          
          // Send confirmation back to client
          ws.send(JSON.stringify({ type: 'stream_ready' }));
        } catch (error) {
          console.error('Error creating gRPC stream:', error);
          ws.send(JSON.stringify({ type: 'error', message: `Failed to create gRPC stream: ${error.message}` }));
        }
      } else if (data.type === 'audio') {
        const stream = activeStreams.get(ws);
        if (stream) {
          try {
            const audioBuffer = Buffer.from(data.audioData, 'base64');
            console.log(`Received audio chunk: ${audioBuffer.length} bytes, source: ${data.sourceLanguage}, target: ${data.targetLanguage}`);
            stream.write({
              audio_data: audioBuffer,
              source_language: data.sourceLanguage || 'french',
              target_language: data.targetLanguage || 'english',
              sample_rate: data.sampleRate || 16000,
              encoding: data.encoding || 'LINEAR16',
            });
          } catch (error) {
            console.error('Error writing to gRPC stream:', error);
            console.error('Error details:', error.stack);
          }
        } else {
          console.warn('Received audio data but no active stream found. Stream may not be initialized yet.');
        }
      } else if (data.type === 'stop') {
        console.log('Received stop message');
        const stream = activeStreams.get(ws);
        if (stream) {
          stream.end();
          activeStreams.delete(ws);
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      try {
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  });

  ws.on('close', () => {
    const stream = activeStreams.get(ws);
    if (stream) {
      stream.end();
    }
    activeStreams.delete(ws);
    console.log('WebSocket client disconnected');
  });
});

// gRPC server
const grpcServer = new grpc.Server();
grpcServer.addService(translationProto.TranslationService.service, {
  streamTranslation: streamTranslation,
});

const grpcPort = '0.0.0.0:50051';
grpcServer.bindAsync(grpcPort, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Failed to start gRPC server:', error);
    process.exit(1);
    return;
  }
  console.log(`gRPC server running on ${grpcPort}`);
  // Note: start() is no longer necessary in newer gRPC versions, but keeping for compatibility
  // grpcServer.start(); // Deprecated but harmless - removed for cleaner logs
  grpcServerReady = true;
  console.log('gRPC server is ready to accept connections');
  
  // Start HTTP server only after gRPC server is ready
  const httpPort = process.env.PORT || 3001;
  server.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
    console.log(`WebSocket server running on port ${httpPort}`);
    console.log('Translation server fully started and ready');
  });
});

console.log('Starting translation server...');
