# Staff Requests Tab - Implementation Guide

## Overview

The **StaffRequestsTab** is a professional, feature-rich component for managing admin registration requests in the MAE Admin Panel. It provides status-based filtering, search functionality, action workflows, and a responsive design.

## Features

### ✨ Core Features

- **Multi-tab Status Management**: Filter requests by status (Pending, Approved, Rejected, Suspended)
- **Smart Search**: Search by name or email across all requests
- **Action Workflows**:
  - Approve/Reject pending requests
  - Suspend approved staff
  - Re-approve rejected or suspended requests
- **Pagination**: Navigate through large datasets with numbered pagination
- **Loading States**: Visual feedback during data fetching and actions
- **Responsive Design**: Mobile-friendly interface that works on all screen sizes
- **Toast Notifications**: User feedback for successful operations and errors

### 🎨 UI Components

- Status badges with color-coded styling
- Admin avatars with initials
- Icon indicators using lucide-react
- Professional data table layout
- Action buttons with loading states

## File Structure

```
src/
├── components/
│   ├── StaffRequestsTab.jsx        # Main component (130+ lines)
│   └── StaffRequestsTab.css        # Styling (500+ lines)
└── pages/
    └── StaffRequestsPage.jsx       # Page container
```

## Component API

### Props

The component is **self-contained** and accepts no props. It manages all state internally.

### State Management

```javascript
-activeStatus - // Current filter tab: "requested", "approved", "rejected", "suspended"
  admins - // Array of admin request objects
  total - // Total count of pending requests
  loading - // Loading state during API calls
  actionLoading - // ID of the row currently being actioned
  search - // Search query string
  page - // Current page number
  pages; // Total number of pages
```

### API Endpoints Used

The component makes calls to `{API_BASE}/auth/` with the following endpoints:

#### GET `/auth/requests`

Fetches admin requests with filtering and pagination.

**Query Parameters:**

- `status`: Filter by status ("requested", "approved", "rejected", "suspended")
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**

```json
{
  "admins": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "status": "requested|approved|rejected|suspended",
      "createdAt": "ISO date",
      "approvedAt": "ISO date (optional)",
      "role": "Admin"
    }
  ],
  "total": "number",
  "pages": "number"
}
```

#### PATCH `/auth/requests/:id/approve`

Approves a staff request.

**Response:**

```json
{
  "message": "Admin approved successfully",
  "admin": {
    /* updated admin object */
  }
}
```

#### PATCH `/auth/requests/:id/reject`

Rejects a staff request.

**Response:**

```json
{
  "message": "Admin rejected successfully",
  "admin": {
    /* updated admin object */
  }
}
```

#### PATCH `/auth/requests/:id/suspend`

Suspends an approved staff member.

**Response:**

```json
{
  "message": "Admin suspended successfully",
  "admin": {
    /* updated admin object */
  }
}
```

## Usage

### Basic Integration

```jsx
import StaffRequestsTab from "../components/StaffRequestsTab";

export default function StaffRequestsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Staff Requests</h1>
      </div>
      <div className="card">
        <StaffRequestsTab />
      </div>
    </div>
  );
}
```

### With Parent Component State

If you need to lift state up or integrate with other components:

```jsx
"use client";
import { useState, useCallback } from "react";
import StaffRequestsTab from "../components/StaffRequestsTab";

export default function StaffPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div>
      <StaffRequestsTab key={refreshKey} />
    </div>
  );
}
```

## Configuration

### Environment Variables

Ensure your `.env` file includes:

```env
VITE_API_URL=http://localhost:8000/api
```

The component uses this for all API calls:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

### Authentication

The component automatically:

1. Retrieves the auth token from `localStorage.getItem("token")`
2. Includes it in the `Authorization: Bearer {token}` header
3. Handles 401 Unauthorized errors

```javascript
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };
```

## Styling

### CSS Classes Overview

All CSS classes use the `sr-` prefix (Staff Requests):

| Class             | Purpose                  |
| ----------------- | ------------------------ |
| `.sr-container`   | Main wrapper             |
| `.sr-header`      | Title and refresh button |
| `.sr-tabs`        | Status filter tabs       |
| `.sr-search-wrap` | Search input wrapper     |
| `.sr-table-wrap`  | Table container          |
| `.sr-buttons`     | Action buttons           |
| `.sr-badge`       | Status badges            |
| `.sr-pagination`  | Pagination controls      |

### Color Scheme

**Status Badges:**

- `.badge--pending`: Yellow (#fef3c7) - Pending requests
- `.badge--approved`: Green (#dcfce7) - Approved staff
- `.badge--rejected`: Red (#fee2e2) - Rejected requests
- `.badge--suspended`: Red (#fecaca) - Suspended staff

**Action Buttons:**

- Approve: Green (#059669)
- Reject: Red (#dc2626)
- Suspend: Orange (#f59e0b)

### Responsive Breakpoints

The component includes responsive adjustments for:

- **768px and below**: Tablet layout
- **640px and below**: Mobile layout
- **1024px and below**: Reflow columns

## Data Flow Diagram

```
User Interaction
      ↓
StaffRequestsTab Component
      ↓
┌─────────────────────────────┐
│ State Management            │
│ - activeStatus              │
│ - search                    │
│ - page                      │
│ - loading                   │
│ - actionLoading             │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ API Handler Functions       │
│ - fetchAdmins()             │
│ - handleAction()            │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ Backend API                 │
│ GET /auth/requests          │
│ PATCH /auth/requests/:id/*  │
└─────────────────────────────┘
      ↓
UI Rendering with Toast Feedback
```

## Error Handling

The component handles errors gracefully:

```javascript
// Failed API calls
.catch(err => {
  toast.error(err.response?.data?.message || "Failed to load requests")
})

// Action failures
.catch(err => {
  toast.error(err.response?.data?.message || `Failed to ${action}`)
})
```

Common error scenarios:

- **Network errors**: Displays fallback error message
- **401 Unauthorized**: User should log in again
- **500 Server errors**: Shows server error message
- **Validation errors**: Shows specific validation messages

## Performance Considerations

### Optimizations

1. **useCallback Hook**: Memoized `fetchAdmins` to prevent unnecessary re-renders
2. **Conditional Rendering**: Only shows "Approved On" column when viewing approved items
3. **Search Filtering**: Client-side filtering for instant search response
4. **Pagination**: Limits data to 10 items per page server-side

### Load Time Estimate

- Initial load: ~500-800ms (API call + rendering)
- Search: Instant (client-side filtering)
- Action: ~300-600ms (API call + refresh)
- Pagination: ~500-800ms (API call)

## Testing Recommendations

### Unit Tests

```javascript
// Test search filtering
test("filters admins by search term", () => {
  // Verify search results match query
});

// Test status tab switching
test("switches between status tabs", () => {
  // Verify activeStatus updates
});

// Test pagination
test("navigates between pages", () => {
  // Verify page state changes
});
```

### Integration Tests

```javascript
// Test approve workflow
test("approves pending request", async () => {
  // Mock API, click approve, verify success toast
});

// Test search + filter combination
test("combines search and status filter", () => {
  // Verify both filters work together
});
```

### E2E Tests

```javascript
// Full workflow
test("complete staff request workflow", async () => {
  // 1. Navigate to staff requests
  // 2. Search for admin
  // 3. Approve request
  // 4. Switch to approved tab
  // 5. Verify admin appears there
});
```

## Browser Compatibility

| Browser     | Support          |
| ----------- | ---------------- |
| Chrome 90+  | ✅ Full          |
| Firefox 88+ | ✅ Full          |
| Safari 14+  | ✅ Full          |
| Edge 90+    | ✅ Full          |
| IE 11       | ❌ Not supported |

## Accessibility Features

- Semantic HTML (`<table>`, `<button>`, `<input>`)
- ARIA labels on icon buttons
- Keyboard navigation support
- Color contrast ratios meet WCAG AA standards
- Loading spinner announces state changes

## Common Issues & Solutions

### Issue: "Failed to load requests" error

**Solution**:

- Check VITE_API_URL environment variable
- Verify backend is running
- Check network tab for 401/500 errors

### Issue: Actions not working

**Solution**:

- Verify authentication token is valid
- Check browser console for error messages
- Ensure admin has permission to approve/reject

### Issue: Search not filtering correctly

**Solution**:

- This is client-side filtering, so works only on loaded data
- For large datasets, consider server-side search

### Issue: Pagination shows incorrect count

**Solution**:

- Backend should return correct total count
- Verify API response includes total and pages fields

## Backend Requirements

The backend must provide:

1. **Admin Request Model** with fields:
   - `_id`: MongoDB ObjectId
   - `name`: String
   - `email`: String
   - `status`: Enum ("requested", "approved", "rejected", "suspended")
   - `createdAt`: Date
   - `approvedAt`: Date (optional)

2. **Middleware**: Auth validation on all endpoints

3. **Routes**: In `/routes/auth.routes.js`
   ```javascript
   router.get("/requests", authMiddleware, getAdminRequests);
   router.patch("/requests/:id/approve", authMiddleware, approveAdmin);
   router.patch("/requests/:id/reject", authMiddleware, rejectAdmin);
   router.patch("/requests/:id/suspend", authMiddleware, suspendAdmin);
   ```

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Actions**: Select multiple requests and approve/reject in batch
2. **Comments**: Add notes when rejecting requests
3. **Notifications**: Send email to admin when approved/rejected
4. **Export**: Export request history to CSV
5. **Advanced Filters**: Filter by date range, role, etc.
6. **Request Details Modal**: View full application details
7. **Activity Log**: Show admin action history
8. **Auto-decline**: Set expiry for pending requests

## Related Components

- **VendorRequestsPage**: Similar component for vendor requests
- **StaffPage**: View all approved staff members
- **AdminLayout**: Page container layout
- **Sidebar**: Navigation menu

## Support & Troubleshooting

For issues or questions:

1. Check the component's PropTypes
2. Verify API endpoints match backend implementation
3. Check browser console for detailed error messages
4. Review the Data Flow Diagram above
5. Test with React DevTools

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained By**: Admin Panel Team
