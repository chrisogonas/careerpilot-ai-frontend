# CareerPilot AI Frontend - Project Roadmap

## Overview

This roadmap outlines the planned features and improvements for the CareerPilot AI frontend. Items are organized by phase and priority.

---

## Phase 1: Core Foundation ✅ (Completed)

### Completed Features

- [x] Project structure and configuration
- [x] TypeScript type system for all API operations
- [x] API client with endpoint methods and JWT token management
- [x] Authentication system (login, register, logout, token refresh)
- [x] React Context API for global authentication state
- [x] Dashboard with usage statistics and quotas
- [x] Resume tailoring feature with job matching
- [x] Cover letter generation
- [x] STAR story generation for interviews
- [x] Job analysis and requirement extraction
- [x] Professional landing page with hero and features
- [x] Pricing page with tier comparison
- [x] Responsive design with Tailwind CSS
- [x] Error handling and validation
- [x] Loading states and user feedback
- [x] Comprehensive documentation

---

## Phase 2: Authentication & Security (In Progress)

### Completed Features ✅
- [x] Basic JWT authentication
- [x] Token storage in localStorage
- [x] Automatic header injection for API calls
- [x] **Two-Factor Authentication (2FA) - TOTP**
  - [x] TOTP (Time-based One-Time Password) support
  - [x] 2FA setup/configuration page (`app/auth/setup-2fa/page.tsx`)
  - [x] 2FA verification flow on login (`app/auth/verify-2fa/page.tsx`)
  - [x] Recovery codes generation and storage
  - [x] QR code generation for authenticator apps
  - [x] AuthContext updated with 2FA state
  - [x] API integration for all 2FA endpoints

### 2.2 Email Verification ✅

- [x] Email verification on registration
- [x] Resend verification email option
- [x] Verify email page with token validation
- [x] Email verification API methods
- [x] Registration flow updated to require email verification
- [x] Email verification pages with Suspense boundaries
- [x] AuthContext integration with email state

**Completed**: February 20, 2026
**Priority**: High
**Complexity**: Low

**Implementation Details**:
1. ✅ Created `app/auth/verify-email/page.tsx` with Suspense boundary
2. ✅ Created `app/auth/resend-verification/page.tsx`
3. ✅ Added email verification state to AuthContext
4. ✅ Added API methods: `sendVerificationEmail()`, `verifyEmail()`, `resendVerificationEmail()`
5. ✅ Updated registration flow to redirect to email verification

---

### 2.3 Password Reset ✅

- [x] Forgot password page
- [x] Password reset email with link
- [x] Reset password page with token validation
- [x] Password requirements validation
- [x] "Forgot Password?" link on login page
- [x] Email-based password recovery flow

**Completed**: February 20, 2026
**Priority**: High
**Complexity**: Low

**Implementation Details**:
1. ✅ Created `app/auth/forgot-password/page.tsx`
2. ✅ Created `app/auth/reset-password/page.tsx` with Suspense boundary
3. ✅ Added API methods: `requestPasswordReset()`, `resetPassword()`
4. ✅ Updated login page with "Forgot Password?" link
5. ✅ Token extraction from URL with validation
6. ✅ Password validation (8+, uppercase, lowercase, number)

---

## Phase 3: User Profile & Account Management ✅ (Completed)

### 3.1 User Profile Page ✅

- [x] View profile information
- [x] Edit personal information
- [x] Change password
- [x] View subscription status and credits
- [x] Account preferences and settings
- [x] Quick action buttons

**Completed**: February 20, 2026
**Files Created**:
- ✅ `app/profile/page.tsx` - Main profile page with account info
- ✅ `app/profile/edit/page.tsx` - Edit profile form (name, email)
- ✅ `app/profile/security/page.tsx` - Password and security management
- ✅ Updated Navbar with profile links

**API Methods Added**:
- ✅ `getProfile()` - GET /user/profile
- ✅ `updateProfile(userData)` - PUT /user/profile
- ✅ `changePassword(oldPassword, newPassword)` - POST /user/change-password
- ✅ `deleteAccount(password)` - DELETE /user/account

**Features**:
- Profile view with member since date
- Account status display (email verified, 2FA enabled)
- Credits and usage dashboard
- Edit full name and email
- Change password with validation
- Security settings page
- Account deletion confirmation

---

### 3.2 Account Deletion ✅

- [x] Delete account confirmation flow
- [x] Password verification for deletion
- [x] Data handling on deletion

**Completed**: February 20, 2026
**Priority**: Medium

---

## Phase 4: Subscription & Payment ✅ (Completed)

### 4.1 Stripe Integration ✅

- [x] Implement Stripe.js library
- [x] Stripe/React-Stripe-JS library integration
- [x] Stripe type definitions and API client methods
- [x] Plan selection page with monthly/yearly options
- [x] Stripe checkout session creation
- [x] Payment processing integration

**Completed**: February 20, 2026
**Files Created**:
- ✅ `app/subscribe/page.tsx` - Plan selection and upgrade
- ✅ `app/billing/page.tsx` - Subscription dashboard and billing history
- ✅ Updated type system with Stripe types (lib/types/index.ts)
- ✅ Added Stripe API methods (lib/utils/api.ts)
- ✅ Updated AuthContext with subscription state
- ✅ Updated Navbar with billing links

**Dependencies Installed**:
- ✅ `@stripe/react-stripe-js`
- ✅ `@stripe/stripe-js`

**Features Implemented**:
- Plan display with Free, Pro, Premium tiers
- Billing cycle toggle (monthly/yearly with 20% savings)
- Feature comparison
- Stripe checkout integration
- Success/cancel handling
- Professional UI with dark mode
- FAQ section
- Payment redirection flow

**API Methods Added**:
- ✅ `getPlans()` - GET /stripe/plans
- ✅ `getSubscription()` - GET /stripe/subscription
- ✅ `createCheckoutSession(priceId, successUrl, cancelUrl)` - POST /stripe/checkout-session
- ✅ `createSubscription(payload)` - POST /stripe/create-subscription
- ✅ `updateSubscription(payload)` - POST /stripe/update-subscription
- ✅ `cancelSubscription(payload)` - POST /stripe/cancel-subscription
- ✅ `createPaymentIntent(payload)` - POST /stripe/payment-intent
- ✅ `getBillingHistory()` - GET /stripe/billing-history

---

### 4.2 Subscription Management ✅

- [x] View current subscription status
- [x] Upgrade/downgrade plans
- [x] Cancel subscription with confirmation
- [x] Billing history with transaction details
- [x] Plan change functionality

**Completed**: February 20, 2026
**Priority**: High

**Files Created**:
- ✅ `app/billing/page.tsx` - Comprehensive billing dashboard
  - Current plan display with status
  - Upgrade/change plan buttons
  - Cancellation confirmation modal
  - Billing history table
  - Payment method management link
  - Plan details card

**Features**:
- Subscription status display (active, canceled, etc.)
- Billing cycle information
- Current/next billing dates
- Transaction history with dates and amounts
- Plan comparison
- Change plan functionality
- Safe cancellation (end of period support)
- Link to Stripe customer portal

---

### 4.3 Stripe Configuration

**Environment Variables** (to be set):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
```

**Backend Stripe Setup**:
- Stripe Secret Key (backend only, not exposed to frontend)
- Webhook endpoints for subscription events
- Product/Price configuration in Stripe

**Documentation**:
- ✅ `docs/STRIPE_INTEGRATION.md` - Comprehensive Stripe integration guide
- ✅ Setup instructions
- ✅ Testing with Stripe test cards
- ✅ Troubleshooting guide
- ✅ Production migration steps

---

## Phase 5: Resume & Content Management (Q3 2026)

### 5.1 Resume Library
- [ ] Save multiple resumes
- [ ] Resume versioning
- [ ] Resume templates selection
- [ ] Resume import from file

**Files to Create**:
- `app/resumes/page.tsx` - Resume list
- `app/resumes/[id]/edit/page.tsx` - Resume editor
- `app/resumes/upload/page.tsx` - Resume upload

**API Methods Needed**:
- `saveResume(name, content)`
- `getResumes()`
- `deleteResume(id)`
- `updateResume(id, content)`
- `parseResume(file)` - Parse uploaded file

---

### 5.2 Job Application Tracker
- [ ] Track applications
- [ ] Interview scheduling
- [ ] Application status (Applied, Interviewed, Offer, Rejected)
- [ ] Notes and follow-ups
- [ ] Analytics dashboard

**Files to Create**:
- `app/applications/page.tsx` - Application list
- `app/applications/[id]/page.tsx` - Application details
- `app/applications/new/page.tsx` - New application form

---

## Phase 6: Advanced Features (Q3-Q4 2026)

### 6.1 Interview Preparation
- [ ] Practice interview questions
- [ ] STAR story templates
- [ ] Video interview recording
- [ ] Interview feedback

**Timeline**: Q3 2026
**Priority**: Medium

---

### 6.2 Resume Scoring
- [ ] ATS compatibility score
- [ ] Keyword analysis
- [ ] Resume strength metrics
- [ ] Improvement suggestions

**Timeline**: Q3 2026
**Priority**: Medium

---

### 6.3 LinkedIn Integration
- [ ] LinkedIn profile import
- [ ] Auto-populate profile fields
- [ ] Share achievements with LinkedIn

**Timeline**: Q4 2026
**Priority**: Low
**Complexity**: High

---

### 6.4 Email Preferences
- [ ] Email notification settings
- [ ] Weekly digest option
- [ ] Job alert preferences
- [ ] Marketing email opt-out

**Timeline**: Q3 2026
**Priority**: Medium

---

### 6.5 Browser Extensions
- [ ] Job posting capture extension
- [ ] Keyword analyzer extension
- [ ] Resume scanner extension

**Timeline**: Q4 2026
**Priority**: Low
**Complexity**: High

---

## Phase 7: Analytics & Insights (Q3-Q4 2026)

### 7.1 Advanced Analytics Dashboard
- [ ] Resume submission trends
- [ ] Success metrics
- [ ] Interview conversion rates
- [ ] Application status distribution

**Files to Create**:
- `app/analytics/page.tsx` - Analytics dashboard
- Analytics components and charts

**Dependencies**:
- `recharts` or `chart.js` for visualizations

---

### 7.2 Performance Recommendations
- [ ] AI-powered improvement suggestions
- [ ] Success patterns
- [ ] Personalized tips

---

## Phase 8: User Experience Improvements (Ongoing)

### 8.1 Dark Mode Support
- [ ] Dark theme colors
- [ ] System preference detection
- [ ] User preference toggle
- [ ] Persistent theme selection

**Implementation**:
1. Add dark mode colors to Tailwind config
2. Implement theme provider
3. Add toggle to Navbar
4. Store preference in localStorage

---

### 8.2 Internationalization (i18n)
- [ ] Support for multiple languages
- [ ] Language selection
- [ ] Translation files
- [ ] RTL support for Arabic/Hebrew

**Timeline**: Q4 2026
**Priority**: Low
**Complexity**: Medium

---

### 8.3 Accessibility (A11y)
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader optimization
- [ ] Keyboard navigation
- [ ] Color contrast improvements

**Priority**: High (Ongoing)

---

### 8.4 Performance Optimization
- [ ] Code splitting optimization
- [ ] Image lazy loading
- [ ] Bundle size reduction
- [ ] Caching strategies
- [ ] API response caching

**Priority**: Medium (Ongoing)

---

## Phase 9: Mobile Application (Q4 2026+)

### 9.1 React Native Mobile App
- [ ] iOS and Android apps
- [ ] Offline support
- [ ] Push notifications
- [ ] Camera resume capture

**Timeline**: Q4 2026+
**Priority**: Low
**Complexity**: Very High
**Approach**: React Native with Expo

---

## Implementation Considerations

### Code Quality
- [ ] Increase test coverage (unit, integration, e2e)
- [ ] Add Vitest or Jest testing framework
- [ ] Implement GitHub Actions CI/CD
- [ ] Code coverage reporting

### Deployment
- [ ] Staging environment setup
- [ ] Production deployment automation
- [ ] Monitoring and logging
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics/Mixpanel)

### Security
- [ ] HTTPS enforcement
- [ ] CORS policy review
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] XSS protection validation
- [ ] CSRF tokens for state-changing operations

### Documentation
- [ ] API documentation updates
- [ ] Database schema documentation
- [ ] Deployment guides
- [ ] Development setup for new team members
- [ ] Architecture decision records (ADRs)

---

## Key Metrics & Success Criteria

### User Engagement
- [ ] Monthly Active Users (MAU)
- [ ] Feature adoption rates
- [ ] Session duration
- [ ] Feature usage frequency

### Performance
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] 99.9% uptime
- [ ] Core Web Vitals optimization

### Conversion
- [ ] Registration completion rate
- [ ] Free to paid conversion
- [ ] Feature trial to subscription
- [ ] Customer retention rate

---

## Dependencies to Add

As features are implemented, these dependencies may be needed:

```json
{
  "testing": [
    "vitest",
    "@testing-library/react",
    "@testing-library/jest-dom"
  ],
  "payments": [
    "@stripe/react-stripe-js",
    "@stripe/stripe-js"
  ],
  "charts": [
    "recharts",
    "date-fns"
  ],
  "forms": [
    "react-hook-form",
    "zod"
  ],
  "utilities": [
    "lodash-es",
    "clsx",
    "zustand"
  ],
  "monitoring": [
    "@sentry/nextjs"
  ]
}
```

---

## Quarterly Planning Template

### Q[X] 2026 Priorities

**High Priority**:
- Feature 1
- Feature 2

**Medium Priority**:
- Feature 3
- Feature 4

**Low Priority**:
- Feature 5

**Estimated Effort**: X developer weeks

---

## Notes for Future Development

1. **API Backend Dependencies**: Many features depend on backend implementation. Coordinate with backend team for:
   - 2FA endpoints
   - Email verification
   - Password reset
   - Payment processing
   - Resume storage
   - Application tracking

2. **Third-Party Integrations**: Plan integrations early:
   - Stripe for payments
   - SendGrid/Mailgun for emails
   - AWS S3 for file storage
   - LinkedIn for profile import

3. **Database Schema**: Ensure backend supports:
   - User preferences table
   - Resume storage
   - Application tracking
   - Usage/credit tracking
   - Subscription information

4. **Testing Strategy**:
   - Unit tests for utilities
   - Component tests for UI
   - Integration tests for flows
   - E2E tests for critical paths

5. **Monitoring & Analytics**:
   - Set up error tracking early
   - Configure analytics
   - Monitor API performance
   - Track user funnels

---

## Future Document Updates

This roadmap should be reviewed and updated:
- **Quarterly**: Adjust timeline and priorities
- **After Feature Completion**: Mark as completed, update progress
- **On Major Changes**: Update affected phases
- **Quarterly Planning**: Create new quarterly summaries

**Last Updated**: February 19, 2026
**Next Review**: May 19, 2026

---

## Questions?

For roadmap discussions or feature requests:
1. Review existing features in [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Check implementation guide in [DEVELOPMENT.md](./DEVELOPMENT.md)
3. Reference API structure in [API_INTEGRATION.md](./API_INTEGRATION.md)
4. Review component patterns in [COMPONENTS.md](./COMPONENTS.md)
