# Quick Fix: Login Error & Logout

## Issue: "Table 'users' doesn't exist" Error

The error is showing because Next.js cached the old code. The changes to use `91wheels_users` are saved correctly, but you need to clear the cache.

### Fix Steps:

1. **Stop the dev server** (Ctrl+C if running)

2. **Delete the .next cache folder:**
```bash
cd /Users/apple/Desktop/personal_project/91w-cms
rm -rf .next
```

3. **Start the dev server again:**
```bash
npm run dev
```

4. **Try logging in** with any user from your `91wheels_users` table

## How to Logout

### Method 1: Use the Logout Button (Added to AdminLayout)

I've added a logout button to the header of your AdminLayout. It will appear in the top-right corner showing:
- Your name
- Your role
- A "Logout" button

Just click the "Logout" button and you'll be logged out and redirected to the login page.

### Method 2: Use Auth Context in Any Component

```javascript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { logout, user } = useAuth();

  return (
    <div>
      <p>Logged in as: {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Method 3: Direct API Call

```javascript
const handleLogout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  
  localStorage.removeItem('auth-token');
  window.location.href = '/login';
};
```

## What the Logout Function Does

1. Calls `/api/auth/logout` endpoint
2. Clears the authentication cookie
3. Removes token from localStorage
4. Redirects to `/login` page

## Test Login After Cache Clear

1. Go to `http://localhost:3001/login`
2. Enter any email/username from your `91wheels_users` table
3. Enter any password (will work temporarily)
4. You should be logged in and see your name in the header
5. Click "Logout" button to test logout

## If Still Having Issues

Check if the auth.js file has the correct code:

```bash
grep "91wheels_users" src/lib/auth.js
```

Should show multiple matches. If not, the file didn't save correctly.
