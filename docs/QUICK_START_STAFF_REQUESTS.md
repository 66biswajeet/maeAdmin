# Staff Requests Tab - Quick Start Guide

## 📋 Quick Overview

The **StaffRequestsTab** component provides a complete interface for managing admin staff requests. It's a drop-in component that:

- Fetches pending staff requests from the backend
- Allows approval, rejection, and suspension actions
- Provides filtering by status and search by name/email
- Shows pagination for large datasets

## ⚡ 5-Minute Setup

### Step 1: Confirm Files Are In Place

```bash
# Check component exists
ls src/components/StaffRequestsTab.*

# Check page exists
ls src/pages/StaffRequestsPage.jsx
```

Expected output:

```
src/components/StaffRequestsTab.jsx
src/components/StaffRequestsTab.css
src/pages/StaffRequestsPage.jsx
```

### Step 2: Verify Environment

Make sure `.env` file has:

```env
VITE_API_URL=http://localhost:8000/api
```

### Step 3: Check Backend Routes

Verify these endpoints exist in your backend:

```
GET    /api/auth/requests
PATCH  /api/auth/requests/:id/approve
PATCH  /api/auth/requests/:id/reject
PATCH  /api/auth/requests/:id/suspend
```

If not, follow the [Backend Implementation Guide](../makeauditeasy-backend/docs/STAFF_REQUESTS_API.md).

### Step 4: Test the Component

1. **Start your frontend**:

   ```bash
   cd maeAdminPanel
   npm run dev
   ```

2. **Start your backend**:

   ```bash
   cd makeauditeasy-backend
   npm start
   ```

3. **Navigate to**: `http://localhost:5173/staff/requests`

4. **You should see**:
   - Status tabs (Pending, Approved, Rejected, Suspended)
   - Search bar
   - List of admin requests (if any exist in DB)
   - Action buttons for each request

## 🧪 Manual Testing Steps

### Test 1: View Pending Requests

1. Click the "Pending" tab (should already be selected)
2. You should see a list of pending admin requests
3. Count should match the "Pending" badge

### Test 2: Search by Name

1. Type a name in the search box
2. List should filter immediately
3. Only matching names appear

### Test 3: Search by Email

1. Type an email in the search box
2. List should filter immediately
3. Only matching emails appear

### Test 4: Approve a Request

1. Find a pending request
2. Click "Approve" button
3. Wait for success toast (green notification)
4. Request should move to "Approved" tab

### Test 5: View Approved Requests

1. Click "Approved" tab
2. Should see the admin you just approved
3. Should show "Approved On" date
4. Buttons should be "Suspend"

### Test 6: Suspend an Admin

1. In Approved tab, click "Suspend"
2. Wait for success toast
3. Admin should move to "Suspended" tab
4. Should show "Re-approve" button

### Test 7: Pagination

1. If you have 10+ requests in same status
2. Should see "< Prev | Page 1 of X | Next >" at bottom
3. Click "Next" to load more
4. Should load different requests

### Test 8: Reject a Request

1. Go back to Pending tab
2. Click "Reject" button on any request
3. Wait for success toast
4. Request should move to "Rejected" tab

### Test 9: Re-approve Rejected Request

1. In Rejected tab, click "Re-approve"
2. Wait for success toast
3. Request should move back to "Approved" tab

## 🐛 Troubleshooting

### Issue: "Failed to load requests"

**Check**:

```bash
# 1. Is backend running?
curl http://localhost:8000/api/auth/requests

# 2. Is token valid? Check localStorage
# Open DevTools > Application > Local Storage > token

# 3. Check VITE_API_URL
echo $VITE_API_URL
```

**Fix**:

```bash
# If backend not running:
cd makeauditeasy-backend
npm start

# If token missing:
# Login first at /login page
```

### Issue: "No requests found"

**Check**:

```bash
# Are there any admin requests in your database?
# Connect to MongoDB and check:
db.admins.find({ status: "requested" }).count()
```

**Fix**:

```javascript
// Create test data in backend
// Save this as seed-admins.js and run: node seed-admins.js

const mongoose = require("mongoose");
const Admin = require("./models/Admin.model");

mongoose.connect("mongodb://localhost:27017/mae-db");

const testAdmins = [
  {
    name: "Test Admin 1",
    email: "admin1@test.com",
    password: "hashed_password",
    status: "requested",
    createdAt: new Date(),
  },
  {
    name: "Test Admin 2",
    email: "admin2@test.com",
    password: "hashed_password",
    status: "requested",
    createdAt: new Date(),
  },
];

Admin.insertMany(testAdmins)
  .then(() => {
    console.log("✓ Test admins created");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Error:", err);
    process.exit(1);
  });
```

### Issue: "Buttons not working"

**Check**:

```javascript
// Open browser console (F12)
// Watch console while clicking a button
// Look for error messages
```

**Common causes**:

- Token invalid or expired → Login again
- Endpoint doesn't exist → Check backend routes
- Admin status wrong → Check request status in DB

## 📊 Database Schema

Make sure your Admin model has these fields:

```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "status": "requested" | "approved" | "rejected" | "suspended",
  "createdAt": Date,
  "approvedAt": Date (optional),
  "role": "Admin"
}
```

## 🔌 API Endpoint Testing

### Test with cURL

```bash
# Get token first (from login)
TOKEN="your_jwt_token"

# Get pending requests
curl -X GET "http://localhost:8000/api/auth/requests?status=requested" \
  -H "Authorization: Bearer $TOKEN"

# Approve an admin (replace ID with real admin ID)
curl -X PATCH "http://localhost:8000/api/auth/requests/ADMIN_ID/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test in Postman

Import this collection (save as `staff-requests.postman_collection.json`):

```json
{
  "info": {
    "name": "Staff Requests API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Pending Requests",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/auth/requests?status=requested&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "requests"],
          "query": [
            { "key": "status", "value": "requested" },
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "10" }
          ]
        }
      }
    },
    {
      "name": "Approve Admin",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": { "mode": "raw", "raw": "{}" },
        "url": {
          "raw": "{{baseUrl}}/auth/requests/{{adminId}}/approve",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "requests", "{{adminId}}", "approve"]
        }
      }
    }
  ]
}
```

## 📝 Verification Checklist

- [ ] Component file exists: `src/components/StaffRequestsTab.jsx`
- [ ] CSS file exists: `src/components/StaffRequestsTab.css`
- [ ] Page file created: `src/pages/StaffRequestsPage.jsx`
- [ ] Backend endpoints implemented: 4 endpoints
- [ ] Database seeded with test data
- [ ] Environment variable configured
- [ ] Admin is logged in (has valid token)
- [ ] Component loads without errors
- [ ] Can view requests in each status
- [ ] Can search by name and email
- [ ] Can approve/reject/suspend requests
- [ ] Pagination works for large datasets
- [ ] Toast notifications appear

## 🎯 Common Use Cases

### "I want to test approval workflow"

1. Create 3 test admins with status: "requested"
2. Login as an admin user
3. Go to Staff Requests page
4. Click Approve on first admin
5. Click Approved tab
6. Verify admin appears there with approval date

### "I want to test re-approval workflow"

1. Have an admin with status: "rejected"
2. Go to Rejected tab
3. Click "Re-approve"
4. Check Approved tab to confirm

### "I want to test suspend workflow"

1. Have an admin with status: "approved"
2. Go to Approved tab
3. Click "Suspend"
4. Check Suspended tab to confirm

## 📚 Related Documentation

- **[Frontend Implementation Guide](../maeAdminPanel/docs/STAFF_REQUESTS_IMPLEMENTATION.md)** - Detailed component docs
- **[Backend API Guide](../makeauditeasy-backend/docs/STAFF_REQUESTS_API.md)** - API endpoint details
- **[Database Schema](../makeauditeasy-backend/docs/STAFF_REQUESTS_API.md#database-schema)** - DB model info

## 💡 Tips & Tricks

### Tip 1: Check DevTools Network Tab

When testing, open DevTools (F12) → Network tab to see:

- API requests being made
- Response data
- Any errors

### Tip 2: Use React DevTools

Install React DevTools browser extension to:

- Inspect component state
- Watch state changes
- Check props

### Tip 3: Create Sample Data

```bash
# Fastest way to create test admins:
# 1. Register multiple accounts via /register page
# 2. They'll be created with status: "requested"
# 3. View them in Staff Requests tab
```

### Tip 4: Monitor Console

```javascript
// Add this to component for debugging:
console.log("Active Status:", activeStatus);
console.log("Admins:", admins);
console.log("Page:", page, "of", pages);
```

## 🚀 Performance Tips

- Component loads 10 items per page (configurable)
- Search is client-side filtered (instant)
- Pagination is server-side (efficient for large datasets)
- Images not used (just initials in avatar)

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify backend endpoints** are responding
3. **Check database** for correct data structure
4. **Review documentation** above
5. **Check authentication** - login if needed

## ✅ Verification Test

Run this in browser console to verify setup:

```javascript
// Check token exists
console.log("Token:", localStorage.getItem("token") ? "✓" : "✗");

// Check API URL
console.log("API URL:", import.meta.env.VITE_API_URL || "✗");

// Test API connection
fetch("http://localhost:8000/api/auth/requests", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((r) => r.json())
  .then((data) => console.log("✓ API Working:", data))
  .catch((e) => console.log("✗ API Error:", e.message));
```

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Ready for Testing ✓
