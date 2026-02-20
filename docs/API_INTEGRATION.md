# CareerPilot AI Frontend - Backend API Integration Guide

## API Overview

The frontend communicates with the CareerPilot Backend API via REST endpoints using the fetch API. All endpoints return JSON responses and authentication uses JWT bearer tokens.

**Base URL**: `http://localhost:8000/api/v1`

## Authentication

### JWT Token System

CareerPilot uses JWT (JSON Web Tokens) for stateless authentication.

**Token Details:**
- **Type**: Bearer token
- **Storage**: localStorage (key: `careerpilot_token`)
- **Expiry**: 60 minutes
- **Refresh Token**: 30 days expiry
- **Claims**: Must include `sub` (user_id)

### Token Lifecycle

```
1. User Login
   ├─ POST /auth/login
   └─ Receive: access_token, refresh_token
   
2. API Requests
   ├─ All requests include: "Authorization: Bearer {token}"
   └─ Token attached automatically by API client
   
3. Token Expiry
   ├─ Detect when token expires (401 response)
   └─ Automatically refresh token
   
4. Token Refresh
   ├─ POST /auth/refresh
   └─ Receive new access token and refresh token
   
5. Logout
   ├─ POST /auth/logout
   └─ Clear tokens from localStorage
```

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "plan": "free",
  "credits_remaining": 100,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.register(email, password, full_name);
// response contains user data and tokens
// Token automatically stored in localStorage
```

---

### POST /auth/login

Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "plan": "free",
  "credits_remaining": 100,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Frontend Usage:**
```typescript
const { login } = useAuth();
await login(email, password);
// User data stored in context
// Tokens stored in localStorage
// Redirects to dashboard
```

---

### POST /auth/logout

Logout the current user. Invalidates the session.

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{ "message": "Logged out successfully" }
```

**Frontend Usage:**
```typescript
const { logout } = useAuth();
await logout();
// Tokens cleared from localStorage
// User state cleared from context
// Redirects to home
```

---

### POST /auth/refresh

Refresh the access token using the refresh token.

**Headers Required:**
```
Authorization: Bearer {refresh_token}
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "plan": "free",
  "credits_remaining": 100,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Frontend Usage:**
```typescript
const { refreshToken } = useAuth();
await refreshToken();
// New tokens stored
// User data updated
```

---

### GET /auth/me

Get current authenticated user information.

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "plan": "free",
  "credits_remaining": 100,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.getMe();
// Returns current user info
```

---

## Email Verification Endpoints

### POST /auth/send-verification-email

Send a verification email to the user.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully",
  "email": "user@example.com"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.sendVerificationEmail({ 
  email: 'user@example.com' 
});
// Verification email sent to inbox
// User needs to click link within 24-48 hours
```

---

### POST /auth/verify-email

Verify user's email using the token from the verification email link.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "verified": true,
  "message": "Email verified successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.verifyEmail({ token });
if (response.verified) {
  // Email verification successful
  // User can now access protected features
}
```

---

### POST /auth/resend-verification-email

Resend the verification email to the user.

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Verification email resent successfully",
  "email": "user@example.com"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.resendVerificationEmail();
// New verification email sent
// User has another 24-48 hours to verify
```

---

## Feature Endpoints

### POST /jobs/analyze

Analyze a job description and extract requirements.

**Request:**
```json
{
  "job_description": "We are looking for a Software Engineer...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "job_id": "660e8400-e29b-41d4-a716-446655440001",
  "extracted_requirements": "• 5+ years of experience\n• Proficiency in Python and SQL\n• ..."
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.analyzeJob({
  job_description: jobText,
  user_id: user.id
});
// response.extracted_requirements contains parsed requirements
```

---

### POST /resumes/tailor

Tailor a resume to a specific job description.

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "resume_text": "John Doe\nExperienced Software Engineer...",
  "job_description": "We are looking for a Senior Engineer...",
  "options": {
    "target_role": "Senior Software Engineer",
    "tone": "professional"
  }
}
```

**Response:**
```json
{
  "tailored_resume": "John Doe\nSenior Software Engineer with 8+ years...",
  "extracted_requirements": "• Leadership experience\n• System design...",
  "usage_id": "760e8400-e29b-41d4-a716-446655440002"
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.tailorResume({
  user_id: user.id,
  resume_text: resumeText,
  job_description: jobText,
  options: {
    target_role: roleName,
    tone: "professional"
  }
});
// response.tailored_resume contains optimized resume
```

---

### POST /cover-letter/generate

Generate a personalized cover letter.

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "resume_text": "John Doe\nSoftware Engineer...",
  "job_description": "We are seeking...",
  "company_name": "Tech Corp",
  "role_title": "Senior Engineer"
}
```

**Response:**
```json
{
  "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Engineer position at Tech Corp..."
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.generateCoverLetter({
  user_id: user.id,
  resume_text: resumeText,
  job_description: jobText,
  company_name: companyName,
  role_title: roleTitle
});
// response.cover_letter contains generated letter
```

---

### POST /star/generate

Generate STAR (Situation, Task, Action, Result) interview stories.

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "resume_text": "John Doe\nLed team of 5 engineers...",
  "job_description": "We seek a leader...",
  "count": 5
}
```

**Response:**
```json
{
  "star_stories": [
    "Situation: Our team was struggling with...",
    "Task: I was assigned to...",
    "Action: I implemented...",
    "Result: We achieved..."
  ]
}
```

**Frontend Usage:**
```typescript
const response = await apiClient.generateStarStories({
  user_id: user.id,
  resume_text: resumeText,
  job_description: jobText,
  count: 5
});
// response.star_stories is array of stories
```

---

## Usage & Credits

### GET /usage/me

Get current user's usage data and remaining credits.

**Query Parameters:**
- `user_id` (optional): User ID for querying specific user

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "plan": "free",
  "credits_remaining": 50,
  "quotas": {
    "resume_tailors_per_month": 5,
    "cover_letters_per_month": 5,
    "star_stories_per_month": 10,
    "job_analyses_per_month": 20
  }
}
```

**Frontend Usage:**
```typescript
const usage = await apiClient.getUsage();
// usage.credits_remaining shows available credits
// usage.quotas shows monthly limits
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": "Additional details (optional)"
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `unauthorized` | 401 | Invalid or expired token |
| `insufficient_credits` | 402 | Not enough credits for operation |
| `invalid_input` | 400 | Request validation failed |
| `rate_limit_exceeded` | 429 | Too many requests |
| `subscription_required` | 402 | Feature requires paid subscription |

### Frontend Error Handling

```typescript
try {
  const response = await apiClient.tailorResume(payload);
} catch (error) {
  if (error instanceof Error) {
    // Handle error message
    console.error(error.message);
    
    if (error.message.includes("unauthorized")) {
      // Redirect to login
    } else if (error.message.includes("insufficient_credits")) {
      // Show upgrade prompt
    }
  }
}
```

---

## API Client Usage

### Direct API Calls

```typescript
import { apiClient } from "@/lib/utils/api";

// Authentication
await apiClient.login(email, password);
await apiClient.register(email, password, fullName);
await apiClient.logout();

// Features
await apiClient.analyzeJob({ job_description, user_id });
await apiClient.tailorResume({...});
await apiClient.generateCoverLetter({...});
await apiClient.generateStarStories({...});

// Usage
await apiClient.getUsage();
```

### In React Components

```typescript
import { useAuth } from "@/lib/context/AuthContext";

export default function MyComponent() {
  const { user, logout } = useAuth();
  
  // User is available here
  // logout() is available here
}
```

---

## Rate Limiting

**Limits**: 100 requests per 60 minutes per IP

**Response Header:**
```
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1614556800
```

When rate limited (429):
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later."
}
```

---

## Request/Response Lifecycle

Every API request follows this flow:

```
1. Request Creation
   ├─ Method: GET/POST
   ├─ Headers: Include JWT token
   ├─ Body: JSON payload
   
2. Network Request
   ├─ Sent via fetch API
   ├─ Timeout: 30 seconds (configurable)
   
3. Response Handling
   ├─ Check HTTP status (200, 401, 402, etc.)
   ├─ Parse JSON response
   ├─ Handle errors
   
4. State Update
   ├─ Update context/state
   ├─ Update localStorage if needed
   
5. UI Update
   ├─ Component re-renders
   ├─ User sees result
```

---

## Testing API Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Analyze Job
curl -X POST http://localhost:8000/api/v1/jobs/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"job_description":"..."}'
```

### Using Postman

1. Import the OpenAPI/Swagger spec:
   - Go to `http://localhost:8000/docs`
   - Export spec and import to Postman

2. Add Bearer token to Authorization

3. Test endpoints via Postman GUI

---

**Last Updated**: February 19, 2026
