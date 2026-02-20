# CareerPilot AI Frontend - Architecture Guide

## System Overview

CareerPilot AI Frontend is a Next.js-based single-page application (SPA) that communicates with a FastAPI backend. The architecture follows modern React patterns with TypeScript for type safety.

```
┌─────────────────────────────────────────────────────────────┐
│                     CareerPilot Frontend                    │
│               (Next.js + TypeScript + Tailwind)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             React Components (Pages/UI)              │   │
│  │  - Authentication Pages                             │   │
│  │  - Dashboard                                         │   │
│  │  - Feature Pages (Resume, Cover Letter, etc.)       │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │        Auth Context (State Management)              │   │
│  │  - User state                                       │   │
│  │  - Authentication status                            │   │
│  │  - Error state                                      │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │           API Client (lib/utils/api.ts)             │   │
│  │  - HTTP requests                                    │   │
│  │  - Token management                                 │   │
│  │  - Error handling                                   │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │ Fetch API (HTTP/REST)
                      │
┌─────────────────────┴────────────────────────────────────────┐
│               CareerPilot Backend API                        │
│           (FastAPI @ http://localhost:8000)                 │
├─────────────────────────────────────────────────────────────┤
│  - Authentication (JWT)                                      │
│  - User Management                                           │
│  - AI Features (Resume, Cover Letter, STAR Stories)         │
│  - Usage & Credits Tracking                                 │
│  - Subscription Management                                  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure & Responsibilities

### `/app` - Next.js App Directory

```
app/
├── api/                    # API Routes (Backend serving)
│   └── health/
│       └── route.ts       # Health check endpoint
├── auth/                   # Authentication pages
│   ├── login/page.tsx     # Login page
│   └── register/page.tsx  # Registration page
├── components/             # Shared components
│   └── Navbar.tsx         # Navigation component
├── dashboard/              # User dashboard
│   └── page.tsx           # Dashboard page
├── tailor/                 # Resume tailoring feature
│   └── page.tsx           # Tailor resume page
├── analyze-job/            # Job analysis feature
│   └── page.tsx           # Analyze job page
├── cover-letter/           # Cover letter generation
│   └── page.tsx           # Cover letter page
├── star-stories/           # STAR story generation
│   └── page.tsx           # STAR stories page
├── pricing/                # Pricing page
│   └── page.tsx           # Pricing information
├── layout.tsx             # Root layout wrapper
├── page.tsx               # Homepage
└── globals.css            # Global styles
```

### `/lib` - Utility & Business Logic

```
lib/
├── context/
│   └── AuthContext.tsx         # Authentication state & logic
│                               # Provides useAuth() hook
├── types/
│   └── index.ts               # TypeScript interfaces
│                               # - User, Auth, API types
│                               # - Request/Response types
└── utils/
    └── api.ts                 # API client class
                               # - HTTP methods
                               # - Token management
                               # - Error handling
```

### `/docs` - Documentation

```
docs/
├── README.md               # Documentation index
├── SETUP.md               # Setup & installation
├── ARCHITECTURE.md        # This file
├── API_INTEGRATION.md     # Backend API guide
├── COMPONENTS.md          # Component documentation
├── DEVELOPMENT.md         # Development practices
├── ROADMAP.md            # Feature roadmap
├── ABOUTME.md            # Product overview
└── INSTRUCTIONS.md       # Backend specifications
```

## Core Concepts

### 1. Authentication Flow

```
User Input → Login Component
    ↓
API Request (email/password)
    ↓
Backend Verification
    ↓
JWT Token + User Data Response
    ↓
Store Token in localStorage
    ↓
Create User object in Context
    ↓
Redirect to Dashboard
```

**Key Points:**
- Token stored in `localStorage` under key `careerpilot_token`
- Token sent in `Authorization: Bearer <token>` header
- Token refresh happens automatically on app startup
- Protected pages redirect to login if not authenticated

### 2. State Management (Context API)

```typescript
// AuthContext provides:
interface AuthContextType {
  user: User | null;              // Current authenticated user
  isAuthenticated: boolean;        // Is user logged in
  isLoading: boolean;             // Loading state
  error: string | null;           // Error messages
  login(): Promise<void>;         // Login function
  register(): Promise<void>;      // Register function
  logout(): Promise<void>;        // Logout function
  refreshToken(): Promise<void>;  // Refresh token
}
```

**Usage:**
```typescript
const { user, isAuthenticated, login } = useAuth();
```

### 3. API Client Architecture

The `ApiClient` class handles all HTTP communication:

- **Methods**: GET, POST 
- **Headers**: Automatically includes JWT in Authorization header
- **Error Handling**: Consistent error response handling
- **Token Management**: Automatic token storage/retrieval

```typescript
// All methods are typed and async
await apiClient.login(email, password)      // → AuthResponse
await apiClient.register(...)               // → AuthResponse
await apiClient.tailorResume(...)           // → TailorResponse
await apiClient.generateCoverLetter(...)    // → CoverLetterResponse
// ...and more
```

### 4. Type Safety

All network operations are fully typed with TypeScript:

```typescript
// Request types specify what data is sent
interface TailorRequestPayload {
  user_id: string;
  resume_text: string;
  job_description: string;
  options: { ... };
}

// Response types specify what is returned
interface TailorResponse {
  tailored_resume: string;
  extracted_requirements: string;
  usage_id: string;
}

// Type-safe API calls
const response = await apiClient.tailorResume(payload);
// response is guaranteed to match TailorResponse
```

## Page Structure

Each feature page follows this pattern:

```typescript
"use client";  // Client component directive

export const dynamic = "force-dynamic";  // Don't pre-render

export default function FeaturePage() {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }
  
  // Feature logic here
  return <div>{/* UI */}</div>;
}
```

## Styling Architecture

- **Framework**: Tailwind CSS 4
- **Approach**: Utility-first CSS
- **Colors**: Blue/Indigo primary palette
- **Responsive**: Mobile-first design

```typescript
// Example: Responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Stacks on mobile, 2 cols on tablet, 3 cols on desktop */}
</div>
```

## Data Flow Patterns

### Reading Data (Pages to Component)

```
Component → useAuth() → Context → State → Render
```

### Updating Data (User Action to Backend)

```
User Input → Event Handler → API Call → Backend Processing → Response → Context Update → Re-render
```

### Example: Login Flow

```typescript
1. User fills form & clicks "Sign In"
2. handleSubmit() → login(email, password)
3. API Client sends POST /auth/login
4. Backend validates, returns tokens
5. Token stored in localStorage
6. User object created in Context
7. useAuth().isAuthenticated becomes true
8. Component re-renders with new state
9. Router redirects to /dashboard
```

## Performance Considerations

1. **Component Splitting**: Pages decomposed into smaller components
2. **Dynamic Rendering**: Protected pages with `export const dynamic = "force-dynamic"`
3. **Type Safety**: Reduces runtime errors and unexpected behavior
4. **Lazy Loading**: Images and heavy components can be lazy-loaded
5. **Token Caching**: JWT re-fetch only on token expiry

## Security Considerations

1. **Token Storage**: JWT stored in localStorage (browser)
   - Vulnerable to XSS attacks
   - Future improvement: Use httpOnly cookies
   
2. **HTTPS**: Must be used in production
   - Token is sent in every request header
   
3. **CORS**: Backend must allow frontend origin
   - Configured on backend
   
4. **CSRF**: Not needed for JWT-based APIs
   - But should implement for cookie-based sessions

## Future Architecture Changes

### Planned Improvements

1. **2FA Support**
   - Add TOTP verification page
   - Add email verification page
   - Update AuthContext for 2FA flow

2. **Advanced State Management**
   - Consider Redux/Zustand for complex state
   - Currently Context API is sufficient

3. **API Caching**
   - Implement React Query or SWR
   - Cache user data, usage stats, etc.

4. **Error Boundary**
   - Add error boundaries for graceful error handling
   - Show user-friendly error pages

5. **Analytics**
   - Track user interactions
   - Monitor API performance
   - Error logging and monitoring

## Scaling Considerations

Current architecture supports:
- Hundreds of concurrent users
- Complex page logic
- Multiple API integrations

For enterprise scaling:
- Implement request caching (React Query)
- Add service workers for offline support
- Implement progressive enhancement
- Add analytics and monitoring
- Use CDN for static assets

---

**Last Updated**: February 19, 2026
