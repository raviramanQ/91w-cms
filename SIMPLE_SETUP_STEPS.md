# Simple Setup Steps - What You Need to Do

## 🎯 Goal
Set up Google OAuth login so only authorized users from your company can access the CMS.

---

## 📝 What I've Built for You

I've created a complete OAuth authentication system that:
- Uses Google to login (no passwords needed)
- Only allows users you add to the database
- Only allows @unicorntechmedia.com email addresses
- Works with your existing backend

---

## ✅ Step-by-Step Instructions

### **STEP 1: Update Your Database** ⏱️ 2 minutes

Open your MySQL database and run this command:

```sql
-- Add OAuth support to your database
ALTER TABLE 91wheels_users 
ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER password,
ADD COLUMN profile_image VARCHAR(500) AFTER google_id;

-- Create superadmin role if it doesn't exist
INSERT INTO 91wheels_user_roles (role_name, role_description, status)
SELECT 'superadmin', 'Super Administrator', 1
WHERE NOT EXISTS (
    SELECT 1 FROM 91wheels_user_roles WHERE role_name = 'superadmin'
);

-- Create audit logs table
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
    FOREIGN KEY (user_id) REFERENCES 91wheels_users(user_id) ON DELETE CASCADE
);
```

**OR** run the migration file I created:
```bash
cd /Users/apple/Desktop/personal_project/91w-cms-backend
mysql -u root -p 91w_cms < database/oauth-migration.sql
```

---

### **STEP 2: Add Yourself as Admin** ⏱️ 1 minute

Add your email to the database so you can login:

```sql
-- Replace with YOUR actual email
INSERT INTO 91wheels_users (first_name, last_name, email, role_id, backend_access_allowed)
VALUES (
    'Your First Name', 
    'Your Last Name', 
    'your.email@unicorntechmedia.com',
    (SELECT role_id FROM 91wheels_user_roles WHERE role_name = 'superadmin'),
    1
);
```

**Important:** Use your real @unicorntechmedia.com email address!

---

### **STEP 3: Get Google OAuth Credentials** ⏱️ 5 minutes

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create or Select a Project**

3. **Enable Google+ API:**
   - Click "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Name: "91W CMS"

5. **Add Authorized URLs:**
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. **Click "Create"**

7. **Copy your credentials:**
   - Client ID (looks like: `123456-abc.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abc123`)

---

### **STEP 4: Create Frontend Environment File** ⏱️ 2 minutes

Create a new file in your frontend project:

**File location:** `/Users/apple/Desktop/personal_project/91w-cms/.env.local`

**File content:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=PASTE_SECRET_HERE
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
NEXT_PUBLIC_API_URL=http://localhost:5001
```

**To generate NEXTAUTH_SECRET, run this in terminal:**
```bash
openssl rand -base64 32
```
Copy the output and paste it in place of `PASTE_SECRET_HERE`

**Then paste your Google credentials from Step 3**

---

### **STEP 5: Update Backend Environment** ⏱️ 1 minute

Check your backend `.env` file has these values:

**File location:** `/Users/apple/Desktop/personal_project/91w-cms-backend/.env`

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

You should see:
```
✅ Database connected successfully
🚀 91Wheels CMS Backend Server running on port 5001
```

**Terminal 2 - Frontend:**
```bash
cd /Users/apple/Desktop/personal_project/91w-cms
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

### **STEP 7: Test Login** ⏱️ 1 minute

1. Open browser: http://localhost:3000/login
2. Click "SIGN IN WITH GOOGLE"
3. Choose your @unicorntechmedia.com account
4. You should be redirected to the home page!

---

## 🎉 That's It!

If you followed all steps, OAuth login should work.

---

## ❌ If Something Goes Wrong

### Error: "User not found in allowlist"
**Fix:** Make sure you added your email in Step 2

### Error: "client_id is required"
**Fix:** Make sure you created `.env.local` file in Step 4 with Google credentials

### Error: "Database connection failed"
**Fix:** Check your backend `.env` file has correct database password

### Error: "Only @unicorntechmedia.com emails are allowed"
**Fix:** Use an email with that domain, or change the domain in the code

---

## 📞 Need Help?

Check these files I created:
- `OAUTH_SETUP_GUIDE.md` - Detailed documentation
- `QUICK_START.md` - Quick reference
- `.env.example` - Example environment variables

---

## 🔑 Summary

**What you need to do:**
1. ✅ Run database migration (Step 1)
2. ✅ Add your email to database (Step 2)
3. ✅ Get Google OAuth credentials (Step 3)
4. ✅ Create `.env.local` file (Step 4)
5. ✅ Start both servers (Step 6)
6. ✅ Test login (Step 7)

**That's all!** The code is already written and ready to use.
