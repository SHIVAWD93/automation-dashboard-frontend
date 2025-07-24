# Role-Based Authentication Implementation

This document describes the role-based authentication system implemented in the QA Automation Dashboard frontend.

## Overview

The application now supports two user roles with different access levels:

- **Admin**: Full access with read and write permissions
- **Maintainer**: Limited access with read-only permissions

## Architecture

### 1. User Model (`src/app/models/user.model.ts`)
- Defines the `User` interface with role information
- Includes `UserRole` enum with ADMIN and MAINTAINER values
- Contains authentication-related interfaces (LoginRequest, LoginResponse, etc.)

### 2. Authentication Service (`src/app/services/auth.service.ts`)
- Handles login/logout functionality
- Manages authentication state using BehaviorSubject
- Provides role-checking methods (`isAdmin()`, `isMaintainer()`, `hasWriteAccess()`)
- Stores authentication token and user data in localStorage
- Automatically adds Authorization headers to API requests

### 3. Auth Guard (`src/app/guards/auth.guard.ts`)
- Protects routes based on authentication and role requirements
- Redirects unauthenticated users to login page
- Redirects users without required permissions to unauthorized page

### 4. HTTP Interceptor (`src/app/interceptors/auth.interceptor.ts`)
- Automatically adds Bearer token to all API requests
- Handles 401 responses by logging out the user

### 5. Login Component (`src/app/components/auth/login.component.ts`)
- Modern, responsive login form with validation
- Shows available roles and their permissions
- Handles authentication errors gracefully

### 6. Role Access Directive (`src/app/directives/role-access.directive.ts`)
- Custom structural directive for showing/hiding elements based on roles
- Usage examples:
  - `*appRoleAccess="'write'"` - Shows only to users with write access (Admins)
  - `*appRoleAccess="'read'"` - Shows to all authenticated users
  - `*appRoleAccess="UserRole.ADMIN"` - Shows only to Admin users

## Role Permissions

### Administrator (Admin)
- **Full Access**: Can access all features and perform all operations
- **Available Routes**:
  - Dashboard (read/write)
  - Testers management
  - Project management
  - Test case management
  - Bulk upload
  - Jenkins results

### Maintainer
- **Read-Only Access**: Can view data but cannot modify it
- **Available Routes**:
  - Dashboard (read-only)
  - Jenkins results (read-only)
- **Restricted Routes**: Testers, Projects, Test Cases, Bulk Upload

## Protected Routes

Routes are protected using the `AuthGuard` with role-based data:

```typescript
{
  path: 'testers',
  component: TesterRegistrationComponent,
  canActivate: [AuthGuard],
  data: { roles: [UserRole.ADMIN] }  // Admin only
}
```

## Frontend-Backend Integration

### Expected Backend Endpoints

The frontend expects the following authentication endpoints:

1. **POST `/api/auth/login`**
   ```json
   Request: { "username": "string", "password": "string" }
   Response: {
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@example.com",
       "role": "admin",
       "firstName": "John",
       "lastName": "Doe"
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "message": "Login successful"
   }
   ```

2. **POST `/api/auth/logout`** (optional)
   - Used for server-side session cleanup

### Token Format
- Bearer token authentication
- JWT tokens recommended
- Token should include user role information

## UI/UX Features

### Navigation
- Role-based navigation menu (Admin sees more options)
- User dropdown with role badge and user information
- Logout functionality

### Dashboard
- Personalized welcome message with user role
- Role-specific quick action buttons
- Admin gets full management options
- Maintainer gets read-only options with helpful messages

### Visual Indicators
- Role badges with distinct colors:
  - Admin: Green badge with crown icon
  - Maintainer: Blue badge with eye icon

## Usage Examples

### In Templates
```html
<!-- Show only to admins -->
<button *appRoleAccess="'write'" class="btn btn-primary">
  Add New User
</button>

<!-- Show to all authenticated users -->
<div *appRoleAccess="'read'">
  View-only content
</div>

<!-- Check role in component -->
<div *ngIf="authService.isAdmin()">
  Admin-specific content
</div>
```

### In Components
```typescript
export class MyComponent {
  constructor(public authService: AuthService) {}

  someMethod() {
    if (this.authService.hasWriteAccess()) {
      // Perform admin action
    } else {
      // Show read-only view
    }
  }
}
```

## Security Notes

1. **Frontend Security**: All role checks are for UI/UX purposes only
2. **Backend Validation**: The backend must validate all permissions for API endpoints
3. **Token Storage**: Uses localStorage for simplicity - consider more secure options for production
4. **HTTPS**: Always use HTTPS in production for token security

## Development Setup

1. Ensure backend authentication endpoints are implemented
2. Update `src/environment/environment.ts` with correct API URL
3. Test with both Admin and Maintainer users
4. Verify all protected routes work correctly

## Testing Credentials

For development/testing, you can use these example credentials:

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: Administrator (full access)

**Maintainer User:**
- Username: `maintainer`
- Password: `maintainer123`
- Role: Maintainer (read-only access)

Note: The backend should be configured with these test users or similar ones for development.