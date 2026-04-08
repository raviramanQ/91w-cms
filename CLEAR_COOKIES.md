# Fix HTTP 431 Error - Clear Browser Cookies

The HTTP 431 error is caused by old session cookies that are too large.

## Quick Fix

### Option 1: Clear Cookies in Browser (Recommended)

1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Go to **Application** tab
3. In left sidebar, expand **Cookies**
4. Click on `http://localhost:3000`
5. Right-click and select **Clear**
6. Refresh the page

### Option 2: Use Incognito/Private Window

1. Open a new Incognito/Private window
2. Go to `http://localhost:3000/login`
3. Try logging in again

### Option 3: Clear All Site Data

1. In Chrome, go to: `chrome://settings/siteData`
2. Search for `localhost`
3. Click the trash icon to delete
4. Restart browser

---

## Then Test

1. Go to: `http://localhost:3000`
2. Should redirect to `/login`
3. Click "Sign in with Google"
4. Should successfully login and redirect to `/home`

The old session cookies had 156+ permissions stored in them, making them too large. The new implementation stores only basic user info in the session.
