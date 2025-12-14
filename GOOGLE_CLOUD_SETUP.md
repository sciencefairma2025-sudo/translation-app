# Google Cloud Setup Guide

## Important: Correct Role Names

Google Cloud Text-to-Speech API **doesn't have a specific IAM role** like "Cloud TTS User". Here's the correct way to set it up:

## Step-by-Step Setup

### Step 1: Create/Select Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Note your Project ID (you'll need it)

### Step 2: Enable Required APIs
**This is the most important step!** The APIs must be enabled for your project.

1. Go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs one by one:
   - ✅ **Cloud Speech-to-Text API** - Click "Enable"
   - ✅ **Cloud Translation API** - Click "Enable"  
   - ✅ **Cloud Text-to-Speech API** - Click "Enable"

### Step 3: Create Service Account
1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Fill in:
   - **Service account name**: `translation-app` (or any name)
   - **Service account ID**: Auto-filled (or customize)
   - Click **"Create and Continue"**

### Step 4: Grant Roles
**Important**: Since there's no "Cloud TTS User" role, use one of these options:

#### Option A: Use "Editor" Role (Simplest - Recommended)
- Click **"Select a role"** dropdown
- Search for: **"Editor"**
- Select **"Editor"** (includes permissions for all APIs)
- Click **"Continue"** then **"Done"**

#### Option B: Use Multiple Specific Roles
Grant these roles separately:
- **Cloud Speech Client** - For Speech-to-Text API
- **Cloud Translation API User** - For Translation API
- **Cloud Text-to-Speech** permissions are included in Editor role

For TTS specifically, the **Editor** or **Service Account User** role works because the API is enabled at the project level.

#### Option C: Minimal Permissions (Advanced)
If you want minimal permissions, you can:
- Use **"Service Account User"** 
- Or create a **Custom Role** with these permissions:
  - `cloudtranslate.generalModels.translate`
  - `speech.recognizer.recognize`
  - `cloudtts.texts.synthesize`

### Step 5: Create and Download Key
1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"Create"**
6. The JSON file will download automatically

### Step 6: Save the Key
1. Save the downloaded JSON file
2. Rename it to `key.json`
3. Move it to your project directory: `/Users/maryam/translation-app/key.json`

**⚠️ Important**: Keep this file secure! Never commit it to GitHub.

### Step 7: Enable Billing (Required)
1. Go to **"Billing"** in Google Cloud Console
2. Link a billing account to your project
3. **Good news**: Google provides $300 free credits for new accounts!

---

## Quick Summary

**What you need:**
- ✅ APIs enabled (most important!)
- ✅ Service account created
- ✅ Editor role assigned (or custom role with TTS permissions)
- ✅ JSON key downloaded
- ✅ Billing enabled

**What you DON'T need:**
- ❌ "Cloud TTS User" role (doesn't exist)
- ❌ Multiple specific roles (Editor covers everything)

---

## Verification

After setup, verify:

1. **Check APIs are enabled**:
   - Go to "APIs & Services" → "Enabled APIs"
   - You should see all three APIs listed

2. **Check service account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Your service account should have "Editor" role

3. **Test the key**:
   ```bash
   # Set the environment variable
   export GOOGLE_APPLICATION_CREDENTIALS=/Users/maryam/translation-app/key.json
   
   # Test with a simple command (if you have gcloud CLI)
   gcloud auth activate-service-account --key-file=key.json
   ```

---

## Troubleshooting

### "Permission denied" errors
- Make sure APIs are **enabled** (check "Enabled APIs" page)
- Verify service account has "Editor" role
- Check that key.json is in the correct location

### "API not enabled" errors
- Go to APIs & Services → Library
- Search for each API and click "Enable"
- Wait a few minutes for APIs to activate

### "Billing required" errors
- Link a billing account (free tier available)
- Wait a few minutes for billing to activate

---

## Alternative: API Key Method

If service account is too complex, you can also use API Keys (less secure but simpler):

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Enable the key for the three APIs
5. Add to your `.env` file (not recommended for production)

---

## Need Help?

- Google Cloud Documentation: https://cloud.google.com/text-to-speech/docs
- Check your project's "Enabled APIs" page
- Make sure billing is enabled


