#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking translation app setup...\n');

let allGood = true;

// Check for key.json
const keyPath = path.join(__dirname, '../key.json');
if (!fs.existsSync(keyPath)) {
  console.log('❌ key.json not found');
  console.log('   Please download your Google Cloud service account key and save it as key.json\n');
  allGood = false;
} else {
  console.log('✅ key.json found');
  try {
    const keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (!keyContent.private_key || !keyContent.client_email) {
      console.log('⚠️  key.json appears invalid (missing required fields)');
      allGood = false;
    }
  } catch (e) {
    console.log('❌ key.json is not valid JSON');
    allGood = false;
  }
}

// Check for .env
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found');
  console.log('   Creating .env from .env.example...');
  const examplePath = path.join(__dirname, '../.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ Created .env file');
  } else {
    console.log('   Please create .env file with GOOGLE_APPLICATION_CREDENTIALS\n');
    allGood = false;
  }
} else {
  console.log('✅ .env file found');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found');
  console.log('   Run: npm run install:all\n');
  allGood = false;
} else {
  console.log('✅ Dependencies installed');
}

const clientNodeModules = path.join(__dirname, '../client/node_modules');
if (!fs.existsSync(clientNodeModules)) {
  console.log('❌ client/node_modules not found');
  console.log('   Run: npm run install:all\n');
  allGood = false;
} else {
  console.log('✅ Client dependencies installed');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ Setup looks good! Run "npm run dev" to start the app.\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the issues above before running the app.\n');
  process.exit(1);
}


