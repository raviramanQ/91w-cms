# Setup Guide for Existing 91wheels Database

## Current Situation

Your CMS now works with your **existing** `91wheels_users` table structure instead of creating new tables. The authentication system has been adapted to use:

- `91wheels_users` - Your existing users table
- `91wheels_user_roles` - Your existing roles table  
- `91wheels_user_role_module_permissions` - Your existing permissions table
- `91wheels_modules` - Your existing modules table

## How to Login Now

### Option 1: Login with ANY existing user (Temporary)

**Important:** For migration purposes, the system currently allows login with **any password** for users who don't have bcrypt-hashed passwords. This is temporary to allow you to access the system.

Try logging in with:
- **Email or Username:** Any user from your `91wheels_users` table
- **Password:** Any password (will work temporarily)

Example:
- Find a user in your database: `SELECT email, username FROM 91wheels_users WHERE status = 1 LIMIT 5;`
- Use that email/username at `/login`
- Enter any password

### Option 2: Update a user's password to bcrypt (Recommended)

1. Generate a bcrypt hash for a password:
```bash
node src/utils/hashPassword.js
```

2. Update a user in your database:
```sql
-- Example: Set password to "password123" for a specific user
UPDATE 91wheels_users 
SET password = '$2a$10$rKZLvXZnJf5K5h5K5h5K5eO5K5h5K5h5K5h5K5h5K5h5K5h5K5h5K'
WHERE email = 'your-email@91wheels.com';
```

3. Login with that email and password "password123"

## Database Structure Mapping

### Your Tables → Auth System

```
91wheels_users
├── user_id → id
├── first_name + last_name → name
├── email → email
├── username → username
├── password → password
├── role_id → (joins to 91wheels_user_roles)
└── status → status

91wheels_user_roles
├── role_id → role_id
└── role_name → role (e.g., "superadmin", "Content", "Expert")

91wheels_user_role_module_permissions
├── role_id → role_id
├── module_id → module_id
└── permissions → permissions (comma-separated: "add,view,edit,delete")

91wheels_modules
├── module_id → module_id
└── module_name → module_name
```

## Permission Mapping

Your existing permissions format → New CRUD format:

| Your Permission | Maps To |
|----------------|---------|
| add | create |
| view | read |
| edit | update |
| delete | delete |
| download | read |
| upload | create |

## Superadmin Access

Users with `role_name = 'superadmin'` automatically get full permissions to:
- users
- posts
- categories
- vehicle-types
- vehicle-makes
- settings

## Testing the Login

### Step 1: Find an existing user
```sql
SELECT 
    u.user_id,
    u.email,
    u.username,
    r.role_name,
    u.status
FROM 91wheels_users u
LEFT JOIN 91wheels_user_roles r ON r.role_id = u.role_id
WHERE u.status = 1
LIMIT 5;
```

### Step 2: Try logging in
1. Go to `http://localhost:3001/login`
2. Enter the email or username from above
3. Enter any password (will work temporarily)
4. You should be logged in!

### Step 3: Check permissions
After login, check the browser console:
```javascript
// The user object will show your permissions
{
  id: 123,
  name: "John Doe",
  email: "john@91wheels.com",
  role: "superadmin",
  permissions: {
    "vehicle-types": ["create", "read", "update", "delete"],
    // ... more permissions
  }
}
```

## Security Warning

⚠️ **IMPORTANT:** The current setup allows login with any password for non-bcrypt users. This is **ONLY for migration/testing**.

### Before going to production:

1. **Migrate all passwords to bcrypt:**
```javascript
// Use the hashPassword utility
const bcrypt = require('bcryptjs');
const newPassword = await bcrypt.hash('user-password', 10);
// Update in database
```

2. **Remove the temporary password bypass:**

In `src/lib/auth.js`, change this:
```javascript
// CURRENT (Temporary)
if (user.password && user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
  isPasswordValid = await comparePassword(password, user.password);
} else {
  console.warn('User has non-bcrypt password, allowing login for migration');
  isPasswordValid = true; // ← REMOVE THIS
}
```

To this:
```javascript
// PRODUCTION (Secure)
if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
  isPasswordValid = await comparePassword(password, user.password);
} else {
  return { success: false, message: 'Invalid credentials' };
}
```

## Adding New Modules

If you want to add new modules to the permission system:

1. **Add to 91wheels_modules:**
```sql
INSERT INTO 91wheels_modules (module_name, description, status) 
VALUES ('vehicle-types', 'Vehicle Types Management', 1);
```

2. **Add permissions for roles:**
```sql
INSERT INTO 91wheels_user_role_module_permissions (role_id, module_id, permissions)
VALUES (
  1, -- superadmin role_id
  LAST_INSERT_ID(),
  'add,view,edit,delete,download,upload'
);
```

3. **Protect the API route:**
```javascript
export const GET = requirePermission('vehicle-types', 'read')(getHandler);
```

## Troubleshooting

### "Invalid credentials" error
- Check if user exists: `SELECT * FROM 91wheels_users WHERE email = 'your-email'`
- Check if user status is 1: `status = 1` means active
- Check if role exists: User should have a valid `role_id`

### "Permission denied" error
- Check user's role: `SELECT r.role_name FROM 91wheels_users u JOIN 91wheels_user_roles r ON r.role_id = u.role_id WHERE u.user_id = ?`
- Check permissions: `SELECT * FROM 91wheels_user_role_module_permissions WHERE role_id = ?`
- Superadmin should have access to everything

### No permissions showing
- Check if `91wheels_modules` table has entries
- Check if `91wheels_user_role_module_permissions` has entries for your role
- Check browser console for errors

## Next Steps

1. ✅ Login with existing user credentials
2. ✅ Test vehicle types page
3. ✅ Verify permissions are working
4. 🔲 Migrate passwords to bcrypt (before production)
5. 🔲 Remove temporary password bypass (before production)
6. 🔲 Add any missing modules to the permission system

## Quick Test Script

Run this in your database to verify everything is set up:

```sql
-- Check if tables exist
SHOW TABLES LIKE '91wheels_%';

-- Check users
SELECT COUNT(*) as user_count FROM 91wheels_users WHERE status = 1;

-- Check roles
SELECT * FROM 91wheels_user_roles;

-- Check modules
SELECT * FROM 91wheels_modules WHERE status = 1;

-- Check permissions
SELECT 
    r.role_name,
    m.module_name,
    urmp.permissions
FROM 91wheels_user_role_module_permissions urmp
JOIN 91wheels_user_roles r ON r.role_id = urmp.role_id
JOIN 91wheels_modules m ON m.module_id = urmp.module_id
LIMIT 10;
```

All queries should return data. If any are empty, you'll need to populate those tables.
