import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const LANGUAGES = [
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'english', name: 'English', flag: '🇺🇸' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹' },
  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
  { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { code: 'persian', name: 'Persian/Farsi', flag: '🇮🇷' },
];

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('french');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [translatedText, setTranslatedText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const playbackAudioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const isRecordingRef = useRef(false);
  const streamReadyRef = useRef(false);
  const currentAudioSourceRef = useRef(null); // Track current audio source to cancel it
  const lastPlayedTextRef = useRef(''); // Track last played text to avoid duplicates

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (playbackAudioContextRef.current) {
        playbackAudioContextRef.current.close();
      }
    };
  }, []);

  // Convert LINEAR16 PCM to WAV format
  const pcmToWav = (pcmArrayBuffer, sampleRate = 24000) => {
    const pcmData = new Uint8Array(pcmArrayBuffer);
    const length = pcmData.length;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, 1, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy PCM data
    const wavData = new Uint8Array(buffer);
    wavData.set(pcmData, 44);
    
    return buffer;
  };

  const playAudioChunk = async (audioData, text) => {
    // Use separate AudioContext for playback to avoid conflicts with recording
    if (!playbackAudioContextRef.current) {
      playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
      // Resume AudioContext if suspended (browsers require user interaction)
      if (playbackAudioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended playback AudioContext');
        await playbackAudioContextRef.current.resume();
      }

      // Cancel previous audio playback with smooth fade-out to prevent pop sounds
      if (currentAudioSourceRef.current && currentAudioSourceRef.current.gainNode) {
        try {
          const gainNode = currentAudioSourceRef.current.gainNode;
          const oldSource = currentAudioSourceRef.current.source;
          
          // Smooth fade-out (50ms) to prevent pop sounds
          const fadeOutDuration = 0.05;
          const currentTime = playbackAudioContextRef.current.currentTime;
          
          gainNode.gain.cancelScheduledValues(currentTime);
          gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
          gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);
          
          // Stop source after fade-out
          setTimeout(() => {
            try {
              if (oldSource) {
                oldSource.stop();
              }
            } catch (e) {
              // Source may have already ended
            }
          }, fadeOutDuration * 1000 + 10);
          
          console.log('Fading out previous audio playback');
        } catch (e) {
          // Audio source may have already ended, ignore error
        }
      }

      // Check if this text is significantly different from last played
      // Only skip if it's the exact same text (to avoid duplicate playback)
      if (text && text === lastPlayedTextRef.current && !text.trim().endsWith('.')) {
        console.log('Skipping duplicate audio for same text');
        return;
      }

      console.log('Decoding audio data, length:', audioData.length);
      const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
      console.log('PCM data size:', pcmData.length, 'bytes');
      
      // Add silence padding at the end to prevent pop sounds (100ms)
      const sampleRate = 24000;
      const paddingSamples = Math.floor(sampleRate * 0.1); // 100ms of silence
      const paddedLength = pcmData.length + (paddingSamples * 2); // *2 for 16-bit samples
      const paddedPcmData = new Uint8Array(paddedLength);
      paddedPcmData.set(pcmData);
      // Rest is already zeros (silence)
      
      // Convert LINEAR16 PCM to WAV format
      const wavBuffer = pcmToWav(paddedPcmData.buffer, sampleRate);
      console.log('WAV buffer size:', wavBuffer.byteLength, 'bytes');
      
      const audioBuffer = await playbackAudioContextRef.current.decodeAudioData(wavBuffer);
      console.log('Audio decoded successfully, duration:', audioBuffer.duration, 'seconds');
      
      // Create gain node for smooth volume control and fade-in
      const gainNode = playbackAudioContextRef.current.createGain();
      gainNode.gain.setValueAtTime(0, playbackAudioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, playbackAudioContextRef.current.currentTime + 0.01); // 10ms fade-in
      gainNode.connect(playbackAudioContextRef.current.destination);
      
      const source = playbackAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode); // Connect source -> gain -> destination
      
      // Store reference to both source and gain node for smooth cancellation
      currentAudioSourceRef.current = {
        source: source,
        gainNode: gainNode
      };
      
      // Track last played text
      if (text) {
        lastPlayedTextRef.current = text;
      }
      
      console.log('Starting audio playback with fade-in');
      await new Promise((resolve, reject) => {
        source.onended = () => {
          console.log('Audio playback finished');
          if (currentAudioSourceRef.current && currentAudioSourceRef.current.source === source) {
            currentAudioSourceRef.current = null;
          }
          resolve();
        };
        source.onerror = (error) => {
          console.error('Audio source error:', error);
          if (currentAudioSourceRef.current && currentAudioSourceRef.current.source === source) {
            currentAudioSourceRef.current = null;
          }
          reject(error);
        };
        try {
          source.start(0);
        } catch (error) {
          console.error('Error starting audio source:', error);
          if (currentAudioSourceRef.current && currentAudioSourceRef.current.source === source) {
            currentAudioSourceRef.current = null;
          }
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      console.error('Error details:', error.message, error.stack);
      currentAudioSourceRef.current = null;
    }
  };

  const processAudioQueue = async () => {
    // For real-time, always cancel current audio and play the latest
    // This ensures immediate response to new translations
    
    // Cancel any currently playing audio with smooth fade-out to prevent pop sounds
    if (currentAudioSourceRef.current && currentAudioSourceRef.current.gainNode) {
      try {
        const gainNode = currentAudioSourceRef.current.gainNode;
        const oldSource = currentAudioSourceRef.current.source;
        
        // Smooth fade-out (50ms) to prevent pop sounds
        const fadeOutDuration = 0.05;
        const currentTime = playbackAudioContextRef.current.currentTime;
        
        gainNode.gain.cancelScheduledValues(currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);
        
        // Stop source after fade-out
        setTimeout(() => {
          try {
            if (oldSource) {
              oldSource.stop();
            }
          } catch (e) {
            // Source may have already ended
          }
        }, fadeOutDuration * 1000 + 10);
        
        console.log('Fading out previous audio for real-time update');
      } catch (e) {
        // Audio source may have already ended
      }
    }

    if (audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    console.log('Processing audio queue, items:', audioQueueRef.current.length);
    
    try {
      // For real-time, only play the most recent audio (clear queue and play latest)
      // This ensures we always play the most up-to-date translation
      let latestAudio = null;
      let latestText = null;
      while (audioQueueRef.current.length > 0) {
        const item = audioQueueRef.current.shift();
        latestAudio = item.audioData;
        latestText = item.text;
      }
      
      // Play only the latest audio for real-time experience
      if (latestAudio) {
        await playAudioChunk(latestAudio, latestText);
      }
    } catch (error) {
      console.error('Error processing audio queue:', error);
    } finally {
      isPlayingRef.current = false;
    }
  };

  const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
      
      // In development, use the same port as the HTTP server (3001)
      // In production, use the same port as HTTP (WebSocket shares HTTP server)
      let wsPort = process.env.REACT_APP_WS_PORT;
      if (!wsPort) {
        if (process.env.NODE_ENV === 'production') {
          // In production, use same port as HTTP
          wsPort = window.location.port || '';
        } else {
          // In development, use port 3001 (same as HTTP server)
          wsPort = '3001';
        }
      }
      
      // If port is empty or 80/443, don't include it in URL
      const wsUrl = (wsPort && wsPort !== '80' && wsPort !== '443') 
        ? `${wsProtocol}//${wsHost}:${wsPort}` 
        : `${wsProtocol}//${wsHost}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      let connected = false;

      ws.onopen = () => {
        console.log('WebSocket connected');
        connected = true;
        setConnectionStatus('connected');
        ws.send(JSON.stringify({ type: 'start' }));
        wsRef.current = ws;
        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message from server:', data.type);
          
          if (data.type === 'audio') {
            console.log('Received translated text:', data.text, 'isFinal:', data.isFinal);
            
            // Only update text for final results OR better interim results (to prevent stacking)
            // For interim results, only update if it's longer or more complete than current
            if (data.isFinal) {
              // Always show final results
              setTranslatedText(data.text || '');
            } else {
              // For interim results, only update if it's significantly different/longer
              const currentText = translatedText;
              const newText = data.text || '';
              if (newText.length > currentText.length || !currentText) {
                setTranslatedText(newText);
              }
            }
            
            // Play audio for both interim and final results for real-time experience
            // Only if audioData exists and is not empty
            if (data.audioData && data.audioData.trim() !== '') {
              console.log(`Received audio data for ${data.isFinal ? 'final' : 'interim'} result, adding to queue`);
              // Store both audio and text for processing
              audioQueueRef.current.push({ audioData: data.audioData, text: data.text });
              processAudioQueue();
            } else {
              console.warn('Audio message received but no audioData field or empty');
            }
          } else if (data.type === 'error') {
            console.error('Server error:', data.message);
            setConnectionStatus('error');
          } else if (data.type === 'stream_ready') {
            console.log('gRPC stream is ready, audio processing can begin');
            streamReadyRef.current = true;
          } else {
            console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket failed to connect to:', wsUrl);
        setConnectionStatus('error');
        if (!connected) {
          reject(new Error(`Failed to connect to ${wsUrl}. Make sure the server is running on port ${wsPort}`));
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        if (!connected) {
          reject(new Error(`WebSocket closed with code ${event.code}: ${event.reason || 'Connection failed. Make sure the server is running.'}`));
        } else {
          setConnectionStatus('disconnected');
        }
        if (event.code !== 1000) { // Not a normal closure
          console.error('WebSocket closed abnormally. Code:', event.code, 'Reason:', event.reason);
        }
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!connected) {
          const state = ws.readyState;
          let errorMsg = `WebSocket connection timeout to ${wsUrl}`;
          if (state === WebSocket.CLOSED) {
            errorMsg = `WebSocket connection was closed. Is the server running on port ${wsPort}?`;
          } else if (state === WebSocket.CONNECTING) {
            errorMsg = `WebSocket connection timeout - still connecting to ${wsUrl}`;
          }
          console.error(errorMsg, 'State:', state);
          ws.close();
          reject(new Error(errorMsg));
        }
      }, 5000);
      
      wsRef.current = ws;
    });
  };

  const startRecording = async () => {
    try {
      // Initialize playback AudioContext early (browsers require user interaction)
      if (!playbackAudioContextRef.current) {
        playbackAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Playback AudioContext created, state:', playbackAudioContextRef.current.state);
        // Resume if suspended
        if (playbackAudioContextRef.current.state === 'suspended') {
          await playbackAudioContextRef.current.resume();
          console.log('Playback AudioContext resumed');
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      console.log('Microphone access granted, starting WebSocket connection...');

      // Reset stream ready flag
      streamReadyRef.current = false;
      
      // Connect WebSocket and wait for connection
      await connectWebSocket();

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }
      
      // Wait a bit for stream_ready message (it's sent immediately after stream creation)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create AudioContext for processing
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000,
        });
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      let audioChunkCount = 0;
      processor.onaudioprocess = (e) => {
        // Use ref instead of state for reliable check
        if (!isRecordingRef.current) {
          return;
        }
        
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          if (audioChunkCount % 100 === 0) { // Log every 100 chunks to avoid spam
            console.warn('WebSocket not ready, skipping audio chunk');
          }
          return;
        }
        
        // Wait for gRPC stream to be ready
        if (!streamReadyRef.current) {
          if (audioChunkCount % 100 === 0) {
            console.warn('gRPC stream not ready yet, skipping audio chunk');
          }
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const int16Array = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(int16Array.buffer)));

        try {
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            audioData: base64Audio,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            sampleRate: 16000,
            encoding: 'LINEAR16',
          }));
          
          audioChunkCount++;
          if (audioChunkCount === 1 || audioChunkCount % 100 === 0) {
            console.log(`Sent audio chunk #${audioChunkCount}`);
          }
        } catch (error) {
          console.error('Error sending audio data:', error);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      mediaRecorderRef.current = { stream, processor, source };
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('Recording started, audio processing active');
    } catch (error) {
      console.error('Error starting recording:', error);
      isRecordingRef.current = false;
      setIsRecording(false);
      alert(`Error starting translation: ${error.message}. Please check the console for details.`);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current.processor) {
        mediaRecorderRef.current.processor.disconnect();
      }
      if (mediaRecorderRef.current.source) {
        mediaRecorderRef.current.source.disconnect();
      }
      mediaRecorderRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
      } catch (error) {
        console.error('Error sending stop message:', error);
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus('disconnected');
    setTranslatedText('');
    console.log('Recording stopped');
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">🌍 Real-Time Translation</h1>
        
        <div className="language-selectors">
          <div className="language-selector">
            <label>From:</label>
            <select 
              value={sourceLanguage} 
              onChange={(e) => setSourceLanguage(e.target.value)}
              disabled={isRecording}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="language-selector">
            <label>To:</label>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={isRecording}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="status">
          <div className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connected' && '🟢 Connected'}
            {connectionStatus === 'disconnected' && '⚪ Disconnected'}
            {connectionStatus === 'error' && '🔴 Error'}
          </div>
        </div>

        <div className="controls">
          {!isRecording ? (
            <button className="btn btn-start" onClick={startRecording}>
              🎤 Start Translation
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopRecording}>
              ⏹️ Stop Translation
            </button>
          )}
        </div>

        {translatedText && (
          <div className="translation-box">
            <h3>Translated Text:</h3>
            <p className="translated-text">{translatedText}</p>
          </div>
        )}

        <div className="instructions">
          <p>📱 Make sure to allow microphone access when prompted</p>
          <p>🔊 Use headphones for the best experience</p>
          <p>🎤 Speak clearly into your microphone</p>
        </div>
      </div>
    </div>
  );
}

export default App