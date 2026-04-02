# 91W CMS - Role-Based Access Control (RBAC) Implementation

## Overview

This Next.js CMS now includes a comprehensive JWT-based authentication and role-based access control system, similar to your PHP tp-admin implementation.

## Architecture

### 1. **Authentication Method: JWT (JSON Web Tokens)**
- **Why JWT?** 
  - Stateless authentication (no server-side session storage needed)
  - Works seamlessly with Next.js API routes
  - Easy to scale horizontally
  - Can be used for both web and mobile apps
  - Secure when implemented correctly

### 2. **Database Schema**

#### Users Table
```sql
- id: Primary key
- name: User's full name
- email: Unique email (used for login)
- password: Bcrypt hashed password
- role: ENUM('admin', 'editor', 'viewer')
- status: Active/Inactive flag
- created_at, updated_at: Timestamps
```

#### Modules Table
```sql
- id: Primary key
- module_name: Name of the module (e.g., 'users', 'posts', 'vehicle-types')
- description: Module description
- status: Active/Inactive flag
```

#### Role Permissions Table
```sql
- id: Primary key
- role: ENUM('admin', 'editor', 'viewer')
- module_id: Foreign key to modules
- permissions: JSON array of allowed actions ['create', 'read', 'update', 'delete']
```

### 3. **Permission Levels**

#### Admin
- Full access to all modules
- Can create, read, update, and delete everything
- Can manage users and their roles

#### Editor
- Can create, read, and update content
- Cannot delete or manage users
- Read-only access to settings

#### Viewer
- Read-only access to all modules
- Cannot create, update, or delete anything

## Implementation Files

### Backend (API)

1. **`/src/lib/auth.js`** - Authentication utilities
   - `hashPassword()` - Hash passwords with bcrypt
   - `comparePassword()` - Verify passwords
   - `generateToken()` - Create JWT tokens
   - `verifyToken()` - Validate JWT tokens
   - `authenticateUser()` - Login logic
   - `getUserWithPermissions()` - Fetch user with role permissions

2. **`/src/middleware/auth.js`** - Middleware functions
   - `authMiddleware()` - Verify authentication
   - `requireAuth()` - Protect routes (authentication required)
   - `requirePermission(module, action)` - Check specific permissions
   - `requireRole(...roles)` - Check user role

3. **API Routes**
   - `/api/auth/login` - POST: User login
   - `/api/auth/logout` - POST: User logout
   - `/api/auth/me` - GET: Get current user info
   - All other API routes now protected with `requirePermission()`

### Frontend

1. **`/src/contexts/AuthContext.js`** - React Context for auth state
   - `login()` - Login function
   - `logout()` - Logout function
   - `hasPermission(module, action)` - Check permissions
   - `isAdmin()` - Check if user is admin
   - `user` - Current user object with permissions

2. **`/src/app/login/page.js`** - Login page component

3. **`/src/components/ProtectedRoute.js`** - Route protection component
   - Wrap pages that require authentication
   - Can specify required permissions or roles

## Usage Examples

### Protecting API Routes

```javascript
// Require authentication only
import { requireAuth } from '@/middleware/auth';

async function handler(request) {
  // request.user is available here
  return NextResponse.json({ user: request.user });
}

export const GET = requireAuth(handler);
```

```javascript
// Require specific permission
import { requirePermission } from '@/middleware/auth';

async function handler(request) {
  // User has 'create' permission on 'posts' module
  return NextResponse.json({ success: true });
}

export const POST = requirePermission('posts', 'create')(handler);
```

```javascript
// Require specific role
import { requireRole } from '@/middleware/auth';

async function handler(request) {
  // Only admins can access
  return NextResponse.json({ success: true });
}

export const DELETE = requireRole('admin')(handler);
```

### Using Auth in Frontend Components

```javascript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  const { user, hasPermission, logout } = useAuth();

  return (
    <ProtectedRoute requiredPermission="posts:read">
      <div>
        <h1>Welcome, {user?.name}</h1>
        <p>Role: {user?.role}</p>
        
        {hasPermission('posts', 'create') && (
          <button>Create Post</button>
        )}
        
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls

```javascript
// The auth token is automatically sent via cookies
const response = await fetch('/api/users', {
  credentials: 'include' // Important: include cookies
});

// Or with Authorization header
const token = localStorage.getItem('auth-token');
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Setup Instructions

### 1. Update Database

Run the updated `database.sql` file to create the new tables:

```bash
mysql -u your_user -p your_database < database.sql
```

### 2. Generate Password Hashes

To create users with hashed passwords:

```bash
node src/utils/hashPassword.js
```

Copy the generated hash and use it in your SQL INSERT statements.

### 3. Environment Variables

Make sure `.env.local` has:

```env
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

**IMPORTANT:** Change `JWT_SECRET` to a strong random string in production!

### 4. Test Login

Default credentials (after running database.sql):
- **Admin:** admin@91wheels.com / password123
- **Editor:** editor@91wheels.com / password123
- **Viewer:** viewer@91wheels.com / password123

## Security Best Practices

1. **JWT Secret:** Use a strong, random secret in production
2. **HTTPS:** Always use HTTPS in production
3. **Password Policy:** Enforce strong passwords
4. **Token Expiration:** Tokens expire after 7 days (configurable)
5. **HttpOnly Cookies:** Tokens stored in httpOnly cookies prevent XSS attacks
6. **Password Hashing:** Using bcrypt with salt rounds = 10

## Adding New Modules

1. Add module to database:
```sql
INSERT INTO modules (module_name, description) VALUES 
('new-module', 'Description of new module');
```

2. Add permissions for each role:
```sql
INSERT INTO role_permissions (role, module_id, permissions) VALUES 
('admin', LAST_INSERT_ID(), '["create", "read", "update", "delete"]'),
('editor', LAST_INSERT_ID(), '["read", "update"]'),
('viewer', LAST_INSERT_ID(), '["read"]');
```

3. Protect your API routes:
```javascript
export const GET = requirePermission('new-module', 'read')(handler);
export const POST = requirePermission('new-module', 'create')(handler);
export const PUT = requirePermission('new-module', 'update')(handler);
export const DELETE = requirePermission('new-module', 'delete')(handler);
```

## Comparison with PHP tp-admin

| Feature | PHP tp-admin | Next.js CMS |
|---------|-------------|-------------|
| Auth Method | Session-based | JWT-based |
| Storage | Server sessions | Stateless tokens |
| Password | Custom encryption | Bcrypt hashing |
| Permissions | Database query per request | Cached in JWT |
| Scalability | Requires sticky sessions | Fully stateless |
| Mobile Support | Limited | Native support |

## Troubleshooting

### "Authentication required" error
- Check if JWT_SECRET is set in .env.local
- Verify token is being sent (check cookies or headers)
- Check token expiration

### "Permission denied" error
- Verify user role in database
- Check role_permissions table for correct permissions
- Ensure module name matches exactly

### Login not working
- Verify password hash in database
- Check database connection
- Look at server console for errors

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Audit logs for user actions
- [ ] IP-based access restrictions
- [ ] Rate limiting for login attempts
- [ ] Refresh token mechanism
