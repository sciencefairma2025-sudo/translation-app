# Service Account Permissions Checklist

## Service Account Details
- **Email**: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
- **Project ID**: `total-thinker-477103-m6`

## Required Roles for Translation App

Your service account needs these **IAM roles** at the project level:

### 1. Cloud Speech-to-Text API
- **Role**: `Cloud Speech Client` 
- **Alternative**: `Cloud Speech-to-Text API User`
- **Link**: https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6

### 2. Cloud Translation API
- **Role**: `Cloud Translation API User`
- **Link**: https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6

### 3. Cloud Text-to-Speech API
- **Role**: `Cloud Text-to-Speech API User`
- **Link**: https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6

## How to Grant Roles

### Method 1: Via IAM & Admin Page
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6
2. Find the row with: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
3. Click the **pencil icon** (✏️) in the Roles column
4. Click **"ADD ANOTHER ROLE"**
5. Add each role:
   - `Cloud Speech Client`
   - `Cloud Translation API User`
   - `Cloud Text-to-Speech API User`
6. Click **"SAVE"**

### Method 2: Via Service Accounts Page
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=total-thinker-477103-m6
2. Click on: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
3. Go to the **"PERMISSIONS"** tab
4. Click **"GRANT ACCESS"**
5. In the "New principals" field, enter: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
6. Select roles:
   - `Cloud Speech Client`
   - `Cloud Translation API User`
   - `Cloud Text-to-Speech API User`
7. Click **"SAVE"**

## Required APIs (Must be Enabled)

Make sure these APIs are enabled in your project:

1. **Cloud Speech-to-Text API**
   - Link: https://console.cloud.google.com/apis/library/speech.googleapis.com?project=total-thinker-477103-m6
   - Click **"ENABLE"** if not already enabled

2. **Cloud Translation API**
   - Link: https://console.cloud.google.com/apis/library/translate.googleapis.com?project=total-thinker-477103-m6
   - Click **"ENABLE"** if not already enabled

3. **Cloud Text-to-Speech API**
   - Link: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com?project=total-thinker-477103-m6
   - Click **"ENABLE"** if not already enabled

## Verify Everything is Working

Run this command to test:
```bash
node verify-setup.js
```

Or test manually:
```bash
npm run dev
```

Then try translating something in your app. If you see errors like "PERMISSION_DENIED" or "API not enabled", follow the steps above.

## Quick Verification Checklist

- [ ] All 3 APIs are enabled
- [ ] Service account has `Cloud Speech Client` role
- [ ] Service account has `Cloud Translation API User` role
- [ ] Service account has `Cloud Text-to-Speech API User` role
- [ ] `key.json` file exists and is valid
- [ ] `.env` file points to `key.json`



