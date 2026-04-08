# Quick Start - Fix OAuth Errors

## The errors you're seeing mean environment variables are not set.

### Step 1: Create `.env.local` file in frontend

Create this file: `/Users/apple/Desktop/personal_project/91w-cms/.env.local`

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=please-generate-a-secret-with-openssl-rand-base64-32

# Google OAuth Credentials (GET THESE FROM GOOGLE CLOUD CONSOLE)
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Step 2: Generate NEXTAUTH_SECRET

Run this command in terminal:
```bash
openssl rand -base64 32
```

Copy the output and replace `please-generate-a-secret-with-openssl-rand-base64-32` with it.

### Step 3: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "91W CMS"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**
9. Paste them in your `.env.local` file

### Step 4: Restart Next.js Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test

Go to http://localhost:3000/login and click "Sign in with Google"

---

## Common Issues

### "NEXTAUTH_URL warning"
**Fix:** Make sure `NEXTAUTH_URL=http://localhost:3000` is in `.env.local`

### "NO_SECRET warning"  
**Fix:** Generate secret with `openssl rand -base64 32` and add to `.env.local`

### "client_id is required"
**Fix:** Add your Google Client ID to `GOOGLE_CLIENT_ID` in `.env.local`

### "User not found in allowlist"
**Fix:** Add user to database first:
```sql
INSERT INTO 91wheels_users (first_name, last_name, email, role_id, backend_access_allowed)
VALUES ('Your', 'Name', 'your.email@unicorntechmedia.com', 
        (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'admin'), 1);
```

---

## Example `.env.local` (with real values)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=Kj8sD9fL2mN4pQ6rT8vW0xY2zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8z

GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx

NEXT_PUBLIC_API_URL=http://localhost:5001
```

**Note:** These are example values. Use your actual credentials!
