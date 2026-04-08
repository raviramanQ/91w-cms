# OAuth Authentication Setup Guide for 91W CMS

This guide will help you implement secure Google OAuth authentication with strict allowlist checking for your CMS.

## 🎯 Overview

This implementation provides:
- **Google OAuth authentication** via NextAuth.js
- **Strict allowlist checking** - Only users in the database can login
- **Domain restriction** - Only @unicorntechmedia.com emails allowed
- **Role-based access control** - superadmin, admin, editor roles
- **Audit logging** - Track all CMS operations
- **Separation of concerns** - Frontend handles UI, backend handles all database operations

---

## 📋 Prerequisites

1. Node.js installed (v16 or higher)
2. MySQL database running
3. Google Cloud Console account
4. Both frontend and backend projects set up

---

## 🗄️ Step 1: Database Setup

### Run the migration script on your MySQL database:

```bash
cd /Users/apple/Desktop/personal_project/91w-cms-backend
mysql -u root -p 91w_cms < database/oauth-migration.sql
```

This will:
- Add `google_id` and `profile_image` columns to users table
- Create `superadmin` role if it doesn't exist
- Create `audit_logs` table for tracking operations

### Set your initial superadmin user:

```sql
-- Replace with your actual email
UPDATE 91wheels_users 
SET role_id = (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'superadmin' LIMIT 1)
WHERE email = 'admin@unicorntechmedia.com';
```

---

## 🔑 Step 2: Google OAuth Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a new project or select existing one

### 3. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Application type: "Web application"
- Name: "91W CMS"

### 5. Configure Authorized URLs

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
```

### 6. Copy your credentials
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `xxxxx`

---

## ⚙️ Step 3: Backend Configuration

### 1. Navigate to backend directory:
```bash
cd /Users/apple/Desktop/personal_project/91w-cms-backend
```

### 2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

### 3. Update `.env` with your values:
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=91w_cms

JWT_SECRET=your-jwt-secret-here
```

### 4. Install dependencies (if not already installed):
```bash
npm install
```

### 5. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 91Wheels CMS Backend Server running on port 5001
```

---

## 🎨 Step 4: Frontend Configuration

### 1. Navigate to frontend directory:
```bash
cd /Users/apple/Desktop/personal_project/91w-cms
```

### 2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

### 3. Update `.env.local` with your values:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 4. Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Copy the output and paste it as `NEXTAUTH_SECRET` value.

### 5. Start the frontend:
```bash
npm run dev
```

---

## 🔐 Step 5: Authentication Flow

### How it works:

1. **User clicks "Sign in with Google"**
   - NextAuth redirects to Google OAuth
   
2. **Google returns user profile**
   - Email, name, profile image
   
3. **Frontend validates with backend** (`/api/auth/oauth/validate`)
   - Checks if email ends with `@unicorntechmedia.com`
   - Checks if user exists in database
   - Checks if user is active (`backend_access_allowed = 1`)
   
4. **If validation passes:**
   - User is logged in
   - Session created with user details and permissions
   - Redirected to `/home`
   
5. **If validation fails:**
   - Login denied
   - Error message shown

---

## 👥 Step 6: User Management

### Adding New Users (Superadmin Only)

Only superadmins can add new users to the allowlist.

**Via Database:**
```sql
INSERT INTO 91wheels_users (first_name, last_name, email, role_id, backend_access_allowed)
VALUES ('John', 'Doe', 'john.doe@unicorntechmedia.com', 
        (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'editor'), 1);
```

**Via API (when user management UI is built):**
```javascript
POST /api/users
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@unicorntechmedia.com",
  "role_id": 3,  // editor role
  "status": 1    // active
}
```

### Deactivating Users

```sql
UPDATE 91wheels_users 
SET backend_access_allowed = 0 
WHERE email = 'user@unicorntechmedia.com';
```

---

## 🔒 Security Features

### ✅ Implemented:

1. **Strict Allowlist** - Only database users can login
2. **Domain Restriction** - Only @unicorntechmedia.com emails
3. **Active Status Check** - Inactive users cannot login
4. **httpOnly Cookies** - Session tokens not accessible via JavaScript
5. **Role-Based Access Control** - Different permissions per role
6. **Audit Logging** - All operations tracked

### 🛡️ Security Best Practices:

- Never commit `.env` files to git
- Use strong `NEXTAUTH_SECRET` and `JWT_SECRET`
- Enable HTTPS in production
- Regularly review audit logs
- Keep dependencies updated

---

## 📊 Role Permissions

### Superadmin
- Full access to everything
- Can manage users (create, update, delete)
- Can view audit logs

### Admin
- Full access to content management
- Cannot manage users
- Can view audit logs

### Editor
- Can create, read, update content
- Cannot delete content
- Cannot manage users
- Cannot view audit logs

---

## 🔍 Testing the Setup

### 1. Test Backend Health:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok","message":"91Wheels CMS Backend is running"}
```

### 2. Test OAuth Validation:
```bash
curl -X POST http://localhost:5001/api/auth/oauth/validate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unicorntechmedia.com","name":"Admin User"}'
```

### 3. Test Frontend Login:
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your @unicorntechmedia.com account
4. Should redirect to /home if user exists in database

---

## 🐛 Troubleshooting

### Issue: "User not found in allowlist"
**Solution:** Add the user to the database first:
```sql
INSERT INTO 91wheels_users (first_name, last_name, email, role_id, backend_access_allowed)
VALUES ('Your', 'Name', 'your.email@unicorntechmedia.com', 
        (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'admin'), 1);
```

### Issue: "Only @unicorntechmedia.com emails are allowed"
**Solution:** Use an email with the correct domain or update the domain in:
- Backend: `/routes/auth.js` (line 122)
- Frontend: NextAuth config if needed

### Issue: "Database connection failed"
**Solution:** 
- Check MySQL is running
- Verify database credentials in backend `.env`
- Ensure database `91w_cms` exists

### Issue: "CORS error"
**Solution:**
- Ensure backend is running on port 5001
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify CORS settings in backend `server.js`

---

## 📝 API Endpoints

### Backend OAuth Endpoints:

**POST** `/api/auth/oauth/validate`
- Validates if user can login
- Checks domain, database existence, active status

**POST** `/api/auth/oauth/session`
- Gets user details for authenticated session
- Returns user with permissions

**GET** `/api/audit-logs`
- Get audit logs (superadmin/admin only)
- Query params: `userId`, `entity`, `page`, `limit`

---

## 🚀 Production Deployment

### Before deploying:

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use production database
4. Enable HTTPS
5. Update Google OAuth redirect URIs
6. Set secure cookie settings
7. Review and test all security measures

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review audit logs for errors
3. Check browser console and server logs
4. Verify all environment variables are set correctly

---

**Last Updated:** April 7, 2026
**Version:** 1.0.0
