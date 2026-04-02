# Quick Start Guide - RBAC Implementation

## What Was Implemented

Your Next.js CMS now has a complete **JWT-based Role-Based Access Control (RBAC)** system, similar to your PHP tp-admin but modernized for Next.js.

## Key Features

✅ **JWT Authentication** - Stateless, scalable authentication  
✅ **3 User Roles** - Admin, Editor, Viewer with different permissions  
✅ **Module-based Permissions** - Granular control (create, read, update, delete)  
✅ **Protected API Routes** - All APIs secured with middleware  
✅ **Frontend Auth Context** - Easy authentication state management  
✅ **Login/Logout System** - Complete auth flow  
✅ **Password Security** - Bcrypt hashing with salt  

## Quick Setup (3 Steps)

### Step 1: Update Database

Run the updated SQL schema:

```bash
mysql -u 91w_staging -p91w@8iut 91wheels < database.sql
```

This creates:
- Updated `users` table with password field
- `modules` table for permission modules
- `role_permissions` table for role-based access
- Sample users with hashed passwords

### Step 2: Verify Environment Variables

Your `.env.local` already has the JWT_SECRET configured. For production, change it to a strong random string.

### Step 3: Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/login`

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@91wheels.com | password123 |
| Editor | editor@91wheels.com | password123 |
| Viewer | viewer@91wheels.com | password123 |

## How It Works

### 1. User Logs In
- User enters email/password at `/login`
- Backend validates credentials and generates JWT token
- Token stored in httpOnly cookie + localStorage
- User redirected to dashboard

### 2. API Requests
- Every API call includes JWT token (via cookie or Authorization header)
- Middleware validates token and checks permissions
- Request proceeds only if user has required permission

### 3. Permission Check Flow
```
Request → Middleware → Verify JWT → Get User Permissions → Check Module Access → Allow/Deny
```

## Permission Matrix

| Module | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| users | CRUD | R | R |
| posts | CRUD | CRU | R |
| categories | CRUD | CRU | R |
| vehicle-types | CRUD | CRU | R |
| vehicle-makes | CRUD | CRU | R |
| settings | CRUD | R | R |

**Legend:** C=Create, R=Read, U=Update, D=Delete

## File Structure

```
src/
├── lib/
│   └── auth.js                    # Auth utilities (JWT, password hashing)
├── middleware/
│   └── auth.js                    # Auth middleware (requireAuth, requirePermission)
├── contexts/
│   └── AuthContext.js             # React context for auth state
├── components/
│   └── ProtectedRoute.js          # Component to protect pages
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js     # Login endpoint
│   │   │   ├── logout/route.js    # Logout endpoint
│   │   │   └── me/route.js        # Get current user
│   │   ├── users/route.js         # Protected with requirePermission
│   │   ├── vehicle-types/route.js # Protected with requirePermission
│   │   └── upload/route.js        # Protected with requireAuth
│   ├── login/page.js              # Login page
│   └── layout.js                  # Wrapped with AuthProvider
└── utils/
    └── hashPassword.js            # Utility to generate password hashes
```

## Usage Examples

### Protect a Page (Frontend)

```javascript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function VehicleTypesPage() {
  const { user, hasPermission } = useAuth();

  return (
    <ProtectedRoute requiredPermission="vehicle-types:read">
      <div>
        <h1>Vehicle Types</h1>
        
        {hasPermission('vehicle-types', 'create') && (
          <button>Add New Type</button>
        )}
        
        {/* Your content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Protect an API Route (Backend)

```javascript
import { requirePermission } from '@/middleware/auth';

async function handler(request) {
  // User is authenticated and has permission
  // Access user info via request.user
  console.log('User:', request.user.name, request.user.role);
  
  return NextResponse.json({ success: true });
}

// Require 'read' permission on 'vehicle-types' module
export const GET = requirePermission('vehicle-types', 'read')(handler);

// Require 'create' permission on 'vehicle-types' module
export const POST = requirePermission('vehicle-types', 'create')(handler);
```

### Check Permissions in Components

```javascript
const { user, hasPermission, isAdmin } = useAuth();

// Check if user can delete
if (hasPermission('posts', 'delete')) {
  // Show delete button
}

// Check if user is admin
if (isAdmin()) {
  // Show admin-only features
}

// Get user info
console.log(user.name, user.email, user.role);
console.log(user.permissions); // All permissions for this user
```

## Adding New Protected Routes

### Example: Protect Vehicle Makes API

```javascript
// src/app/api/vehicle-makes/route.js
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { requirePermission } from '@/middleware/auth';

async function getHandler(request) {
  const makes = await executeQuery('SELECT * FROM vehicle_makes');
  return NextResponse.json({ success: true, data: makes });
}

async function postHandler(request) {
  const body = await request.json();
  // Create logic here
  return NextResponse.json({ success: true });
}

// Export with permission checks
export const GET = requirePermission('vehicle-makes', 'read')(getHandler);
export const POST = requirePermission('vehicle-makes', 'create')(postHandler);
```

## Testing the System

### Test 1: Login as Admin
1. Go to `/login`
2. Login with admin@91wheels.com / password123
3. You should have full access to all APIs

### Test 2: Login as Editor
1. Logout and login with editor@91wheels.com / password123
2. Try to delete a user via API - should get "Permission denied"
3. Try to create/update vehicle types - should work

### Test 3: Login as Viewer
1. Logout and login with viewer@91wheels.com / password123
2. Try to create anything - should get "Permission denied"
3. Try to read data - should work

### Test 4: API Without Auth
1. Logout
2. Try to access `/api/users` - should get "Authentication required"

## Creating New Users

### Via Database
```sql
-- First, hash the password using the utility
-- node src/utils/hashPassword.js

INSERT INTO users (name, email, password, role) VALUES 
('New User', 'newuser@91wheels.com', '$2a$10$...hashed...', 'editor');
```

### Via API (Future Enhancement)
You can create a user registration API route that uses the `hashPassword()` function from `@/lib/auth`.

## Customizing Permissions

### Add a New Module
```sql
-- 1. Add module
INSERT INTO modules (module_name, description) VALUES 
('analytics', 'Analytics and Reports');

-- 2. Set permissions for each role
INSERT INTO role_permissions (role, module_id, permissions) VALUES 
('admin', LAST_INSERT_ID(), '["create", "read", "update", "delete"]'),
('editor', LAST_INSERT_ID(), '["read"]'),
('viewer', LAST_INSERT_ID(), '["read"]');
```

### Modify Existing Permissions
```sql
-- Give editors delete permission on posts
UPDATE role_permissions 
SET permissions = '["create", "read", "update", "delete"]'
WHERE role = 'editor' AND module_id = (SELECT id FROM modules WHERE module_name = 'posts');
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change JWT_SECRET in production** - Use a strong random string
2. **Use HTTPS in production** - Never send tokens over HTTP
3. **Implement rate limiting** - Prevent brute force attacks on login
4. **Add password complexity rules** - Enforce strong passwords
5. **Implement password reset** - Allow users to reset forgotten passwords
6. **Add audit logging** - Track who did what and when
7. **Set token expiration** - Currently 7 days, adjust as needed

## Troubleshooting

### Issue: "Authentication required" error
**Solution:** Check if JWT_SECRET is set in .env.local and restart the dev server

### Issue: "Permission denied" error
**Solution:** Check the role_permissions table to ensure the user's role has the required permission

### Issue: Login not working
**Solution:** 
- Verify password hash in database matches bcrypt format
- Check database connection
- Look at server console for errors

### Issue: Token expired
**Solution:** Login again. Tokens expire after 7 days by default.

## Next Steps

1. ✅ Run database migration
2. ✅ Test login with different roles
3. ✅ Protect your existing pages with `<ProtectedRoute>`
4. ✅ Add permission checks to UI elements
5. 🔲 Implement password reset functionality
6. 🔲 Add user management UI
7. 🔲 Implement audit logging
8. 🔲 Add rate limiting

## Comparison: PHP vs Next.js

| Aspect | PHP tp-admin | Next.js CMS |
|--------|--------------|-------------|
| **Auth** | Session-based | JWT-based |
| **State** | Server sessions | Stateless tokens |
| **Scaling** | Sticky sessions needed | Fully stateless |
| **Mobile** | Limited | Native support |
| **Security** | Custom encryption | Industry-standard bcrypt |
| **Performance** | Session lookup per request | Token validation only |

## Support

For detailed documentation, see `README_AUTH.md`

For questions or issues, check the troubleshooting section or review the implementation files.
