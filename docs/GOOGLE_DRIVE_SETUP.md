# Google Drive OAuth Setup Guide

This document explains how to configure OAuth credentials for Google Drive integration.

## 1. Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select or create a project

## 2. Enable Google Drive API

1. In the navigation menu, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API" and then **Enable**

## 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** as user type
3. Complete the required information:
   - **App name**: Plotify Cash Management
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Under **Scopes**, add the scope: `https://www.googleapis.com/auth/drive.file`
5. Under **Test users**, add your personal Gmail email
6. Save the configuration

## 4. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as type
4. Configure:
   - **Name**: Plotify OAuth Client
   - **Authorized redirect URIs**: 
     - For development: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://your-domain.vercel.app/api/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## 5. Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
# Google Drive OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=will_be_obtained_in_next_step
GOOGLE_DRIVE_FOLDER_ID=main_folder_id_here
```

## 6. Obtain Refresh Token

1. Start your development application: `npm run dev`
2. Go to `http://localhost:3000/api/auth/google`
3. Google authorization page will open
4. Accept the requested permissions
5. You'll be redirected to a page with the refresh token
6. Copy the **refresh_token** and add it to your `.env.local`

## 7. Configure Main Folder in Google Drive

### Option A: Personal Folder
1. Go to [Google Drive](https://drive.google.com)
2. Create a folder named "Plotify - Receipts" (or your preferred name)
3. Right-click the folder > **Get link** > **Copy link**
4. Extract the folder ID from the URL:
   - URL: `https://drive.google.com/drive/folders/1ABcDEfGhIjKlMnOpQrStUvWxYz123456`
   - ID: `1ABcDEfGhIjKlMnOpQrStUvWxYz123456`
5. Add the ID as `GOOGLE_DRIVE_FOLDER_ID` in your `.env.local`

### Option B: Shared Folder
1. Someone else creates the folder and shares it with you
2. Make sure you have **Editor** permissions on the shared folder
3. Go to the shared folder in your Google Drive
4. Copy the folder URL and extract the ID (same process as above)
5. Add the ID as `GOOGLE_DRIVE_FOLDER_ID` in your `.env.local`

**⚠️ Important for shared folders:**
- You need **Editor** permissions to create files and subfolders
- The folder owner will see all uploaded files
- If you lose access to the shared folder, the application will fail to upload files

## 8. Verify Configuration

Once everything is configured, restart your application and test uploading a receipt from the income or expense interface.

## Automatic Folder Structure

The system will automatically create the following simple structure in your Google Drive:

```
Plotify - Receipts/
├── Ingresos/
└── Gastos/
```

## File Naming Format

Files are automatically named following this format:
- **Income**: `YYYY-MM-DD_lot-XX_type_receipt-num_###.ext`
- **Expenses**: `YYYY-MM-DD_expense-category_receipt-num_###.ext`

**Examples:**
- `2025-07-30_lot-01_fee_receipt-001_001.pdf`
- `2025-07-30_expense-maintenance_002.jpg`
- `2025-07-30_expense-maintenance_003.pdf`

*The sequential counter (###) ensures that multiple files of the same type and day are automatically differentiated.*

## Production Configuration (Vercel)

1. In your Vercel dashboard, go to **Settings** > **Environment Variables**
2. Add all Google Drive environment variables
3. Update the **Authorized redirect URI** in Google Cloud Console with your production URL
4. Redeploy your application

## Security

- ⚠️ **NEVER** commit `.env` or `.env.local` files to the repository
- OAuth credentials only allow access to files created by the application
- Refresh tokens don't expire, but can be revoked from Google Account Settings

## Troubleshooting

### Error: "Access denied"
- Verify that your email is in the test users list in OAuth consent screen
- Make sure Google Drive API is enabled

### Error: "redirect_uri_mismatch"
- Verify that the redirect URI in Google Cloud Console matches exactly with your URL

### Error: "invalid_grant"
- The refresh token may have expired or been revoked
- Repeat the authorization process to get a new refresh token