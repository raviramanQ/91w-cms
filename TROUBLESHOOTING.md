# Troubleshooting - Vehicle Types Not Showing Data

## Problem
After implementing authentication, the vehicle types module shows no data because:
1. All API routes are now protected with authentication
2. Frontend components weren't sending authentication credentials

## Solution Applied

### ✅ Fixed Files

1. **`/src/components/VehicleTypesManager.js`**
   - Added `credentials: 'include'` to all fetch calls
   - This sends the authentication cookie with every request

2. **`/src/app/vehicle-types/page.js`**
   - Wrapped with `<ProtectedRoute>` component
   - Requires authentication to access the page

3. **`/src/app/api/vehicle-makes/route.js`** & **`[id]/route.js`**
   - Protected with `requirePermission()` middleware
   - Ensures only authenticated users with proper permissions can access

## How to Test

### 1. Login First
Visit `http://localhost:3001/login` and login with:
- **Admin:** admin@91wheels.com / password123
- **Editor:** editor@91wheels.com / password123
- **Viewer:** viewer@91wheels.com / password123

### 2. Access Vehicle Types
After login, navigate to `/vehicle-types` - data should now load properly.

### 3. Check Browser Console
If data still doesn't show:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors
4. Check Network tab to see API responses

## Common Issues

### Issue: "Authentication required" error
**Cause:** Not logged in or token expired  
**Solution:** Login again at `/login`

### Issue: "Permission denied" error
**Cause:** User role doesn't have required permission  
**Solution:** 
- Login as Admin (has all permissions)
- Or update role_permissions in database

### Issue: Still no data after login
**Cause:** Database might not have vehicle types data  
**Solution:** Check if `91wheels_vehicle_types` table has data:
```sql
SELECT * FROM 91wheels_vehicle_types;
```

If empty, run the sample data from `database.sql`:
```sql
INSERT INTO 91wheels_vehicle_types (v_type_name, v_type_display_name, v_type_slug, v_type_description, v_type_status, sort_order) VALUES 
('Cars', 'Cars', 'cars', 'Four-wheeled motor vehicles designed for passenger transportation', 'Active', 1),
('Bike', 'Bikes', 'bike', 'Two-wheeled motor vehicles, motorcycles and scooters', 'Active', 2),
('Scooter', 'Scooters', 'scooter', 'Lightweight two-wheeled vehicles with step-through frame', 'Active', 3),
('Cycle', 'Cycles', 'cycle', 'Human-powered vehicles with two wheels', 'Active', 4);
```

## What Changed

### Before (Not Working)
```javascript
// Missing credentials
const response = await fetch('/api/vehicle-types')
```

### After (Working)
```javascript
// Includes authentication cookie
const response = await fetch('/api/vehicle-types', {
  credentials: 'include'
})
```

## Other Components to Update

If you have other components making API calls, add `credentials: 'include'` to all fetch calls:

```javascript
// Example for any component
const response = await fetch('/api/your-endpoint', {
  method: 'GET', // or POST, PUT, DELETE
  credentials: 'include', // ← Add this
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## Next Steps

1. ✅ Login to the system
2. ✅ Test vehicle types page
3. ✅ Test vehicle makes page (also updated)
4. 🔲 Update any other components that fetch data
5. 🔲 Wrap other pages with `<ProtectedRoute>` as needed

## Need Help?

Check these files for reference:
- `IMPLEMENTATION_GUIDE.md` - Complete auth setup guide
- `README_AUTH.md` - Detailed auth documentation
- `database.sql` - Database schema and sample data
