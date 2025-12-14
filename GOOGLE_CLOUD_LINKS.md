# Google Cloud Console Links

## Your Project Information
- **Project ID**: `total-thinker-477103-m6`
- **Service Account**: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`

## Quick Access Links

### 1. Project Dashboard
**Direct link to your project:**
https://console.cloud.google.com/home/dashboard?project=total-thinker-477103-m6

### 2. Enable APIs
**APIs Library:**
https://console.cloud.google.com/apis/library?project=total-thinker-477103-m6

Enable these APIs:
- [Cloud Speech-to-Text API](https://console.cloud.google.com/apis/library/speech.googleapis.com?project=total-thinker-477103-m6)
- [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com?project=total-thinker-477103-m6)
- [Cloud Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com?project=total-thinker-477103-m6)

### 3. Service Account Permissions
**IAM & Admin:**
https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6

Find your service account: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`

**Service Accounts:**
https://console.cloud.google.com/iam-admin/serviceaccounts?project=total-thinker-477103-m6

### 4. API Credentials
**Credentials:**
https://console.cloud.google.com/apis/credentials?project=total-thinker-477103-m6

## Step-by-Step Verification

### Step 1: Verify APIs are Enabled
1. Go to: https://console.cloud.google.com/apis/library?project=total-thinker-477103-m6
2. Search for each API and check if "API Enabled" is shown
3. If not enabled, click on the API and click "Enable"

### Step 2: Check Service Account Permissions
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=total-thinker-477103-m6
2. Click on: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
3. Go to the "PERMISSIONS" tab
4. Ensure these roles are present:
   - `Cloud Speech Client` (or `Cloud Speech-to-Text API User`)
   - `Cloud Translation API User`
   - `Cloud Text-to-Speech API User`

### Step 3: Grant Roles (if missing)
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=total-thinker-477103-m6
2. Find: `translation-app@total-thinker-477103-m6.iam.gserviceaccount.com`
3. Click the pencil icon to edit
4. Click "ADD ANOTHER ROLE"
5. Add these roles:
   - Cloud Speech Client
   - Cloud Translation API User
   - Cloud Text-to-Speech API User
6. Click "SAVE"

## Verify Setup
Run the verification script:
```bash
node verify-setup.js
```

This will test if everything is configured correctly.



