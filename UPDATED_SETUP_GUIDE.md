# Updated Setup Guide - Using Existing Database Tables

## ✅ What Changed

I've updated the OAuth implementation to use your **existing `91wheels_users` table** structure. No need to add new columns!

---

## 📊 Using Your Existing Table Structure

The OAuth system now uses these existing columns from `91wheels_users`:

- **`email`** - For OAuth email validation
- **`first_name`, `last_name`** - For user name
- **`backend_access_allowed`** - For active/inactive status (1 = active, 0 = inactive)
- **`role_id`** - Links to `91wheels_user_roles` for permissions

**No database schema changes needed for users table!**

---

## 🚀 Simple Setup Steps

### **STEP 1: Create Audit Logs Table** ⏱️ 1 minute

Run this SQL to create only the audit logs table:

```sql
CREATE TABLE IF NOT EXISTS 91wheels_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES 91wheels_users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity),
    INDEX idx_timestamp (timestamp)
);

-- Ensure superadmin role exists
INSERT INTO 91wheels_user_roles (role_name, role_description, status)
SELECT 'superadmin', 'Super Administrator with full system access', 1
WHERE NOT EXISTS (
    SELECT 1 FROM 91wheels_user_roles WHERE role_name = 'superadmin'
);
```

**OR** run the migration file:
```bash
cd /Users/apple/Desktop/personal_project/91w-cms-backend
mysql -u root -p 91w_cms < database/oauth-migration.sql
```

---

### **STEP 2: Add Your Email to Existing Users Table** ⏱️ 1 minute

If you don't already have a user, add yourself:

```sql
-- Check if you already exist
SELECT * FROM 91wheels_users WHERE email = 'your.email@unicorntechmedia.com';

-- If not, add yourself
INSERT INTO 91wheels_users (first_name, last_name, email, password, role_id, backend_access_allowed)
VALUES (
    'Your First Name',
    'Your Last Name', 
    'your.email@unicorntechmedia.com',
    'dummy-password-not-used-for-oauth',  -- Not used for OAuth login
    (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'superadmin'),
    1  -- Active
);
```

**OR** if you already exist, just make sure you're active:

```sql
-- Make sure your account is active
UPDATE 91wheels_users 
SET backend_access_allowed = 1,
    role_id = (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'superadmin')
WHERE email = 'your.email@unicorntechmedia.com';
```

---

### **STEP 3: Get Google OAuth Credentials** ⏱️ 5 minutes

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "91W CMS"
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. **Copy your Client ID and Client Secret**

---

### **STEP 4: Create Frontend `.env.local` File** ⏱️ 2 minutes

Create this file: `/Users/apple/Desktop/personal_project/91w-cms/.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET
GOOGLE_CLIENT_ID=REPLACE_WITH_YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_YOUR_CLIENT_SECRET
NEXT_PUBLIC_API_URL=http://localhost:5001
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and replace `REPLACE_WITH_GENERATED_SECRET`

**Then add your Google credentials from Step 3**

---

### **STEP 5: Verify Backend `.env` File** ⏱️ 1 minute

Make sure your backend has this file: `/Users/apple/Desktop/personal_project/91w-cms-backend/.env`

```env
PORT=5001
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=91w_cms
JWT_SECRET=your-jwt-secret
```

---

### **STEP 6: Start Both Servers** ⏱️ 1 minute

**Terminal 1 - Backend:**
```bash
cd /Users/apple/Desktop/personal_project/91w-cms-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/apple/Desktop/personal_project/91w-cms
npm run dev
```

---

### **STEP 7: Test Login** ⏱️ 1 minute

1. Open: http://localhost:3000/login
2. Click "SIGN IN WITH GOOGLE"
3. Choose your @unicorntechmedia.com account
4. Should redirect to home page ✅

---

## 🔍 How It Works

### **Login Flow:**

1. User clicks "Sign in with Google"
2. Google authenticates and returns email
3. Backend checks:
   - ✅ Email ends with `@unicorntechmedia.com`
   - ✅ Email exists in `91wheels_users` table
   - ✅ `backend_access_allowed = 1` (user is active)
4. If all checks pass → User logged in
5. If any check fails → Access denied

### **Database Columns Used:**

```sql
SELECT 
    u.user_id,           -- User ID
    u.first_name,        -- First name
    u.last_name,         -- Last name
    u.email,             -- Email (must match Google email)
    u.backend_access_allowed,  -- Active status (1 = active)
    r.role_name          -- Role (superadmin, admin, editor)
FROM 91wheels_users u
LEFT JOIN 91wheels_user_roles r ON u.role_id = r.role_id
WHERE u.email = 'user@unicorntechmedia.com';
```

---

## 👥 Managing Users

### **Add New User:**
```sql
INSERT INTO 91wheels_users (first_name, last_name, email, password, role_id, backend_access_allowed)
VALUES (
    'John',
    'Doe',
    'john.doe@unicorntechmedia.com',
    'not-used-for-oauth',
    (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'editor'),
    1
);
```

### **Activate User:**
```sql
UPDATE 91wheels_users 
SET backend_access_allowed = 1 
WHERE email = 'user@unicorntechmedia.com';
```

### **Deactivate User:**
```sql
UPDATE 91wheels_users 
SET backend_access_allowed = 0 
WHERE email = 'user@unicorntechmedia.com';
```

### **Change User Role:**
```sql
UPDATE 91wheels_users 
SET role_id = (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'superadmin')
WHERE email = 'user@unicorntechmedia.com';
```

---

## 🔒 Security Features

✅ **Strict Allowlist** - Only users in `91wheels_users` can login  
✅ **Domain Restriction** - Only @unicorntechmedia.com emails  
✅ **Active Status Check** - `backend_access_allowed = 1` required  
✅ **No Password Needed** - OAuth handles authentication  
✅ **Audit Logging** - All operations tracked in `91wheels_audit_logs`  
✅ **Role-Based Access** - Uses existing `91wheels_user_roles` system

---

## ❌ Troubleshooting

### "User not found in allowlist"
**Check if user exists:**
```sql
SELECT * FROM 91wheels_users WHERE email = 'your.email@unicorntechmedia.com';
```
**If not found, add the user (see Step 2)**

### "User account is inactive"
**Activate the user:**
```sql
UPDATE 91wheels_users SET backend_access_allowed = 1 
WHERE email = 'your.email@unicorntechmedia.com';
```

### "client_id is required"
**Make sure `.env.local` file exists with Google credentials**

### "Only @unicorntechmedia.com emails are allowed"
**Use an email with the correct domain or update the domain in:**
`/Users/apple/Desktop/personal_project/91w-cms-backend/routes/auth.js` (line 122)

---

## 📝 Summary

**What you need:**
1. ✅ Run migration (creates audit logs table only)
2. ✅ Add your email to existing `91wheels_users` table
3. ✅ Get Google OAuth credentials
4. ✅ Create `.env.local` file with credentials
5. ✅ Start both servers
6. ✅ Test login

**No changes to existing users table structure!** 🎉
