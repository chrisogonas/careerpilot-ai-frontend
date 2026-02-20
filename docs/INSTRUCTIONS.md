## **FRONTEND DEVELOPMENT PROMPT ARTIFACTS**

### **1. API BASE CONFIGURATION**
```
API Base URL: http://localhost:8000/api/v1
OpenAPI/Swagger: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

### **2. AUTHENTICATION**
```
Method: JWT Bearer Token
Header: Authorization: Bearer <jwt_token>
Token Claims: Must include 'sub' (user_id)
Expiry: 60 minutes
Refresh Token: 30 days

Authentication endpoints:
- POST /auth/register - User registration
- POST /auth/login - User login
- POST /auth/refresh - Refresh token
- POST /auth/logout - User logout
```

### **3. CORE FEATURES & ENDPOINTS**

#### **A. Job Analysis**
```
POST /jobs/analyze
Request:
{
  "job_description": "Full job description text",
  "user_id": "optional-uuid"
}

Response:
{
  "job_id": "uuid",
  "extracted_requirements": "Extracted requirements as bullet points"
}
```

#### **B. Resume Tailoring**
```
POST /resumes/tailor
Request:
{
  "user_id": "uuid",
  "resume_text": "Full resume text",
  "job_description": "Full job description text",
  "options": {
    "target_role": "Senior Data Scientist",
    "tone": "professional"
  }
}

Response:
{
  "tailored_resume": "Optimized resume text",
  "extracted_requirements": "Job requirements summary",
  "usage_id": "uuid"
}
```

#### **C. Cover Letter Generation**
```
POST /cover-letter/generate
Request:
{
  "user_id": "uuid",
  "resume_text": "Full resume text",
  "job_description": "Full job description text",
  "company_name": "Acme Corp",
  "role_title": "Machine Learning Engineer"
}

Response:
{
  "cover_letter": "Full customized cover letter"
}
```

#### **D. STAR Stories**
```
POST /star/generate
Request:
{
  "user_id": "uuid",
  "resume_text": "Full resume text",
  "job_description": "Full job description text",
  "count": 5
}

Response:
{
  "star_stories": [
    "Situation: ... Task: ... Action: ... Result: ...",
    "... (more stories)"
  ]
}
```

#### **E. Usage & Credits**
```
GET /usage/me
Query Params: user_id (optional)

Response:
{
  "user_id": "uuid",
  "plan": "free|pro|premium",
  "credits_remaining": 50,
  "quotas": {
    "resume_tailors_per_month": 5,
    "cover_letters_per_month": 5,
    "star_stories_per_month": 10,
    "job_analyses_per_month": 20
  }
}
```

#### **F. Subscription Management**
```
POST /subscriptions/create-payment-intent
GET /subscriptions/me
POST /subscriptions/cancel
```

### **4. USER MODELS**

```typescript
interface User {
  id: string (UUID)
  email: string
  full_name: string
  is_verified: "pending" | "verified"
  created_at: ISO8601 timestamp
  updated_at: ISO8601 timestamp
}

interface Subscription {
  id: string (UUID)
  user_id: string (UUID)
  plan: "free" | "pro" | "premium"
  stripe_customer_id: string | null
  status: "active" | "canceled" | "past_due"
  credits_remaining: number
  current_period_end: ISO8601 timestamp | null
}

interface Resume {
  id: string (UUID)
  user_id: string (UUID)
  original_text: string
  title: string | null
  file_name: string | null
  created_at: ISO8601 timestamp
}

interface JobDescription {
  id: string (UUID)
  user_id: string (UUID)
  raw_text: string
  extracted_requirements: string | null
  role_title: string | null
  company_name: string | null
  external_url: string | null
  created_at: ISO8601 timestamp
}

interface TailoredResume {
  id: string (UUID)
  resume_id: string (UUID)
  job_id: string (UUID)
  tailored_text: string
  extracted_requirements: string | null
  created_at: ISO8601 timestamp
}

interface CoverLetter {
  id: string (UUID)
  resume_id: string (UUID)
  job_id: string (UUID)
  letter_text: string
  company_name: string | null
  role_title: string | null
  created_at: ISO8601 timestamp
}

interface StarStory {
  id: string (UUID)
  resume_id: string (UUID)
  job_id: string (UUID)
  story_number: number | null
  story_text: string
  created_at: ISO8601 timestamp
}
```

### **5. SUBSCRIPTION PLANS**

```
Free Plan:
- 50 credits/month
- 5 resume tailors/month
- 5 cover letters/month
- 10 STAR stories/month
- 20 job analyses/month

Pro Plan:
- 500 credits/month
- 20 resume tailors/month
- 20 cover letters/month
- 50 STAR stories/month
- 100 job analyses/month

Premium Plan:
- 2000 credits/month
- Unlimited usage
```

### **6. ERROR HANDLING**

```
HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (auth required/failed)
- 402: Payment Required (insufficient credits)
- 403: Forbidden (admin access required)
- 404: Not Found
- 429: Rate Limited (too many requests)
- 500: Server Error

Error Response Format:
{
  "error": "error_code",
  "message": "Human readable message",
  "details": "Additional info (optional)"
}

Common Errors:
- insufficient_credits
- invalid_token
- rate_limit_exceeded
- subscription_required
- invalid_input
```

### **7. SECURITY & REQUIREMENTS**

```
- CORS enabled for all origins (configurable)
- Rate limiting: 100 requests per 60 minutes per IP
- Stripe integration for payments
- 2FA support (TOTP + Email OTP)
- Email verification required
- Password reset functionality
- Webhook support for external events
- API key generation for programmatic access
```

### **8. ENVIRONMENT VARIABLES NEEDED**

```
VITE_API_BASE_URL=http://localhost:8000
VITE_JWT_STORAGE_KEY=careerpilot_token
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (from backend)
```

### **9. KEY FEATURES TO IMPLEMENT**

- User registration/login with email verification
- Resume upload and storage
- Job description input/parsing
- Interactive resume tailoring UI
- Cover letter generation UI
- STAR story generation UI
- Usage/credit dashboard
- Subscription plan selection
- Payment integration (Stripe)
- User profile management
- 2FA setup (optional)
- Dark mode support (optional)
