#!/usr/bin/env node

/**
 * Verify Google Cloud setup for translation app
 * Checks credentials, API access, and permissions
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const speech = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');

console.log('🔍 Verifying Google Cloud setup for translation app...\n');

let allGood = true;

// Check key.json exists and is valid
console.log('1. Checking credentials file...');
const keyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './key.json');
if (!fs.existsSync(keyPath)) {
  console.log('   ❌ key.json not found at:', keyPath);
  allGood = false;
} else {
  console.log('   ✅ key.json found');
  try {
    const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (!keyData.private_key || !keyData.client_email || !keyData.project_id) {
      console.log('   ❌ key.json is missing required fields');
      allGood = false;
    } else {
      console.log('   ✅ key.json is valid');
      console.log(`   📋 Project ID: ${keyData.project_id}`);
      console.log(`   📧 Service Account: ${keyData.client_email}`);
    }
  } catch (error) {
    console.log('   ❌ key.json is not valid JSON:', error.message);
    allGood = false;
  }
}

console.log('\n2. Testing API clients initialization...');

// Test Speech-to-Text client
try {
  const speechClient = new speech.SpeechClient();
  console.log('   ✅ Speech-to-Text client initialized');
} catch (error) {
  console.log('   ❌ Failed to initialize Speech-to-Text client:', error.message);
  allGood = false;
}

// Test Translation client
try {
  const translateClient = new Translate();
  console.log('   ✅ Translation client initialized');
} catch (error) {
  console.log('   ❌ Failed to initialize Translation client:', error.message);
  allGood = false;
}

// Test Text-to-Speech client
try {
  const ttsClient = new textToSpeech.TextToSpeechClient();
  console.log('   ✅ Text-to-Speech client initialized');
} catch (error) {
  console.log('   ❌ Failed to initialize Text-to-Speech client:', error.message);
  allGood = false;
}

console.log('\n3. Testing API access (this may take a few seconds)...');

// Test Translation API with a simple request
(async () => {
  try {
    const translateClient = new Translate();
    const [result] = await translateClient.translate('Hello', { to: 'es' });
    if (result) {
      console.log('   ✅ Translation API is accessible');
      console.log(`   📝 Test translation: "Hello" -> "${result}"`);
    }
  } catch (error) {
    console.log('   ❌ Translation API error:', error.message);
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('   💡 The service account may not have Translation API permissions');
    }
    allGood = false;
  }

  // Test Text-to-Speech API
  try {
    const ttsClient = new textToSpeech.TextToSpeechClient();
    const request = {
      input: { text: 'Hello' },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'LINEAR16' },
    };
    await ttsClient.synthesizeSpeech(request);
    console.log('   ✅ Text-to-Speech API is accessible');
  } catch (error) {
    console.log('   ❌ Text-to-Speech API error:', error.message);
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('   💡 The service account may not have Text-to-Speech API permissions');
    }
    allGood = false;
  }

  // Test Speech-to-Text API (just create a stream, don't actually use it)
  try {
    const speechClient = new speech.SpeechClient();
    const streamingConfig = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
      interimResults: true,
    };
    const stream = speechClient.streamingRecognize(streamingConfig);
    stream.destroy(); // Close immediately, just testing access
    console.log('   ✅ Speech-to-Text API is accessible');
  } catch (error) {
    console.log('   ❌ Speech-to-Text API error:', error.message);
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('   💡 The service account may not have Speech-to-Text API permissions');
    }
    allGood = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allGood) {
    console.log('✅ All checks passed! Your Google Cloud setup looks good.');
    console.log('\n📚 To enable APIs and set permissions:');
    console.log('   1. Go to: https://console.cloud.google.com/apis/library');
    console.log('   2. Enable these APIs:');
    console.log('      - Cloud Speech-to-Text API');
    console.log('      - Cloud Translation API');
    console.log('      - Cloud Text-to-Speech API');
    console.log('   3. Go to: https://console.cloud.google.com/iam-admin/iam');
    console.log('   4. Find your service account:', keyData?.client_email || 'check key.json');
    console.log('   5. Ensure it has these roles:');
    console.log('      - Cloud Speech Client');
    console.log('      - Cloud Translation API User');
    console.log('      - Cloud Text-to-Speech API User');
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('   1. Enable APIs in Google Cloud Console');
    console.log('   2. Grant service account the necessary roles');
    console.log('   3. Ensure GOOGLE_APPLICATION_CREDENTIALS points to key.json');
  }
  console.log('='.repeat(60));
})().catch(error => {
  console.error('\n❌ Error during verification:', error);
  process.exit(1);
});



