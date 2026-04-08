#!/bin/bash

# This script will help you set up your .env.local file for OAuth

echo "🔧 Setting up .env.local for OAuth authentication"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file found"
    echo ""
    echo "📝 You need to add these lines to your .env.local file:"
    echo ""
else
    echo "❌ .env.local file not found"
    echo ""
fi

echo "Add these lines to /Users/apple/Desktop/personal_project/91w-cms/.env.local:"
echo ""
echo "# NextAuth Configuration"
echo "NEXTAUTH_URL=http://localhost:3000"
echo "NEXTAUTH_SECRET=REPLACE_WITH_SECRET_FROM_COMMAND_BELOW"
echo ""
echo "# Google OAuth Credentials"
echo "GOOGLE_CLIENT_ID=REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID"
echo "GOOGLE_CLIENT_SECRET=REPLACE_WITH_YOUR_GOOGLE_CLIENT_SECRET"
echo ""
echo "---"
echo ""
echo "📌 Step 1: Generate NEXTAUTH_SECRET"
echo "Run this command and copy the output:"
echo ""
echo "  openssl rand -base64 32"
echo ""
echo "---"
echo ""
echo "📌 Step 2: Get Google OAuth Credentials"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Create OAuth 2.0 Client ID"
echo "3. Add redirect URI: http://localhost:3000/api/auth/callback/google"
echo "4. Copy Client ID and Client Secret"
echo ""
echo "---"
echo ""
echo "📌 Step 3: Edit .env.local"
echo "Open the file and add the values above"
echo ""
echo "---"
echo ""
echo "🎯 After adding these values, restart your dev server:"
echo "  npm run dev"
echo ""
