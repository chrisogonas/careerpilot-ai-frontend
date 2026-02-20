# Email Verification Implementation Guide

## Overview

Email verification is a critical security feature that ensures users own the email addresses they register with. After registration, users receive an email with a verification link they must click to activate their account.

## Architecture

### System Components

```
User Registration
    ↓
Register Page (user provides email/password)
    ↓
API: POST /auth/register
    ↓
Backend: Generate verification token + send email
    ↓
Redirect to: /auth/resend-verification
    ↓
User clicks verification link in email:
    /auth/verify-email?token=<TOKEN>
    ↓
API: POST /auth/verify-email with token
    ↓
Backend: Validate token + activate account
    ↓
Redirect to: /dashboard (if login)
```

### State Management

**AuthContext Email Verification State**:
```typescript
interface AuthContextType {
  // Email verification flags
  isEmailVerified: boolean;           // Is current user's email verified?
  pendingEmailVerification: boolean;  // Is email verification pending?
  
  // Email verification methods
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}
```

**Internal State**:
- `isEmailVerified` - Initially true (but set to false after registration)
- `pendingEmailVerification` - Set after registration, cleared after verification
- `tempVerificationEmail` - Stores email address pending verification

## Type Definitions

Located in: `lib/types/index.ts`

```typescript
// Payload for sending verification email
interface SendVerificationEmailPayload {
  email: string;  // Email to send verification to
}

// Response when verification email sent
interface SendVerificationEmailResponse {
  message: string;
  email: string;
}

// Payload for verifying email with token
interface VerifyEmailPayload {
  token: string;  // Token from email link
}

// Response after email verification
interface VerifyEmailResponse {
  verified: boolean;
  message: string;
  user_id?: string;      // User ID if verified
  email?: string;        // User email if verified
}

// Response when resending verification email
interface ResendVerificationEmailResponse {
  message: string;
  email: string;
}
```

## API Methods

Located in: `lib/utils/api.ts`

### 1. Send Verification Email

```typescript
async sendVerificationEmail(payload: SendVerificationEmailPayload): Promise<SendVerificationEmailResponse>
```

**Endpoint**: `POST /auth/send-verification-email`

**Usage**:
```typescript
const response = await apiClient.sendVerificationEmail({ 
  email: 'user@example.com' 
});
```

**Response**:
```json
{
  "message": "Verification email sent successfully",
  "email": "user@example.com"
}
```

---

### 2. Verify Email Token

```typescript
async verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse>
```

**Endpoint**: `POST /auth/verify-email`

**Usage**:
```typescript
const response = await apiClient.verifyEmail({ 
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
});
```

**Response**:
```json
{
  "verified": true,
  "message": "Email verified successfully",
  "user_id": "user123",
  "email": "user@example.com"
}
```

---

### 3. Resend Verification Email

```typescript
async resendVerificationEmail(): Promise<ResendVerificationEmailResponse>
```

**Endpoint**: `POST /auth/resend-verification-email`

**Usage**:
```typescript
const response = await apiClient.resendVerificationEmail();
```

**Response**:
```json
{
  "message": "Verification email resent successfully",
  "email": "user@example.com"
}
```

## User Flows

### Registration Flow

1. **User enters registration details**
   - Email, password, full name
   - Page: `/auth/register`

2. **Submit registration form**
   - Client calls `register(email, password, fullName)`
   - Sets `pendingEmailVerification = true`
   - Sets `isEmailVerified = false`

3. **Redirect to resend-verification page**
   - Page: `/auth/resend-verification`
   - Displays message about email being sent
   - Allows user to resend email

4. **User receives verification email**
   - Contains link: `/auth/verify-email?token=<VERIFICATION_TOKEN>`

5. **User clicks verification link**
   - Page: `/auth/verify-email`
   - Automatically extracts token from URL
   - Calls `verifyEmail(token)`

6. **Email verification succeeds**
   - Sets `isEmailVerified = true`
   - Sets `pendingEmailVerification = false`
   - Auto-redirects to `/dashboard`

7. **User accesses dashboard**
   - Now fully authenticated
   - Can access all protected features

### Resend Email Flow

1. **User goes to resend page**
   - Page: `/auth/resend-verification`
   - Can manually request email resend

2. **Enter email and submit**
   - Calls `resendVerificationEmail()`
   - Shows confirmation message
   - Email is resent by backend

3. **User receives new verification email**
   - Can proceed from step 4 above

### Verification Link Flow

1. **User clicks verification link from email**
   - URL: `/auth/verify-email?token=<TOKEN>`

2. **Page loads and extracts token**
   - Token comes from URL search params
   - Automatically triggers verification

3. **Verification in progress**
   - Shows loading spinner
   - Calls `verifyEmail(token)`

4. **Verification result**
   - Success: Shows checkmark, redirects to dashboard
   - Failure: Shows error message with resend option

## Pages

### /auth/verify-email

**File**: `app/auth/verify-email/page.tsx`

**Features**:
- Accepts `token` query parameter
- Auto-verifies on page load
- Shows loading state during verification
- Success state with checkmark and redirect
- Error state with resend option
- Wrapped in Suspense boundary (required for useSearchParams)

**States**:
- `loading` - Verifying email
- `success` - Email verified successfully
- `error` - Verification failed

**User Actions**:
- Auto-redirects to `/dashboard` on success
- Can click "Resend Verification Email" on error
- Can return to login on error

---

### /auth/resend-verification

**File**: `app/auth/resend-verification/page.tsx`

**Features**:
- Manual email input field
- Resend verification email button
- Success message when email sent
- Error handling with clear messages
- Tips for checking spam folder

**User Actions**:
- Enter email address
- Click "Resend Verification Email"
- Auto-dismiss success message after 5 seconds
- Can return to login

---

## AuthContext Integration

Located in: `lib/context/AuthContext.tsx`

### State Variables

```typescript
const [isEmailVerified, setIsEmailVerified] = useState(true);
const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
const [tempVerificationEmail, setTempVerificationEmail] = useState<string | null>(null);
```

### sendVerificationEmail Method

```typescript
const sendVerificationEmail = async (email: string) => {
  setIsLoading(true);
  setError(null);
  try {
    await apiClient.sendVerificationEmail({ email });
    setTempVerificationEmail(email);
    setPendingEmailVerification(true);
    setIsEmailVerified(false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification email";
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

### verifyEmail Method

```typescript
const verifyEmail = async (token: string) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apiClient.verifyEmail({ token });
    if (response.verified) {
      setIsEmailVerified(true);
      setPendingEmailVerification(false);
      setTempVerificationEmail(null);
      // Set user if we have the data
      if (response.user_id && response.email) {
        setUser({
          id: response.user_id,
          email: response.email,
          full_name: "",
          is_verified: "verified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      throw new Error("Email verification failed");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email verification failed";
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

### resendVerificationEmail Method

```typescript
const resendVerificationEmail = async () => {
  setIsLoading(true);
  setError(null);
  try {
    if (!tempVerificationEmail) {
      throw new Error("No email address available for verification");
    }
    await apiClient.resendVerificationEmail();
    // Email resent successfully
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to resend verification email";
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

### Updated register Method

```typescript
const register = async (email: string, password: string, full_name: string) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apiClient.register(email, password, full_name);
    // After registration, mark email as not verified and pending verification
    setIsEmailVerified(false);
    setPendingEmailVerification(true);
    setTempVerificationEmail(response.email);
    // Don't set user yet - wait for email verification
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

## Security Considerations

### Token Generation
- Backend generates secure, time-limited verification tokens
- Tokens should expire (typically within 24-48 hours)
- Tokens should be single-use
- Tokens should be cryptographically random

### Email Validation
- Verify email format before sending
- Verify email domain is reachable
- Rate-limit verification attempts
- Log failed verification attempts

### User Experience
- Clear messaging about verification step
- Easy resend mechanism
- Helpful error messages
- Don't lock users out indefinitely

## Testing Checklist

### Registration Flow
- [ ] User can register with email/password
- [ ] After registration, redirected to `/auth/resend-verification`
- [ ] `pendingEmailVerification` is true
- [ ] `isEmailVerified` is false
- [ ] Cannot access protected pages without verification

### Email Link Flow
- [ ] Verification link works from email
- [ ] Token is extracted from URL correctly
- [ ] Page shows loading spinner while verifying
- [ ] Success state displays after verification
- [ ] Auto-redirects to dashboard on success
- [ ] Error state shows for invalid/expired tokens

### Resend Flow
- [ ] Can request resend from `/auth/resend-verification`
- [ ] Email input is validated
- [ ] Success message shows after resend
- [ ] Can resend multiple times
- [ ] Backend rate-limiting is respected

### Error Scenarios
- [ ] Missing token shows error
- [ ] Expired token shows error
- [ ] Invalid token shows error
- [ ] Already verified email shows error
- [ ] Network errors are handled gracefully

## Common Issues

### Issue: Suspense Boundary Warning
**Cause**: `useSearchParams()` used without Suspense boundary
**Solution**: Wrap page component in Suspense fallback (already implemented)

### Issue: Token Not Validating
**Cause**: Token format mismatch or expiration
**Solution**: Verify backend encoding matches frontend parsing

### Issue: User Not Getting Email
**Cause**: Spam folder, email server issues
**Solution**: Resend option, check email service status

## Performance Considerations

1. **Page Load**: Verify-email page uses Suspense for non-blocking rendering
2. **API Calls**: All async operations properly tracked with loading state
3. **Storage**: Only stores necessary email verification state
4. **Network**: Proper error handling for offline scenarios

## Future Enhancements

- [ ] Email verification OTP (alternative to link-based)
- [ ] Resend timeout (prevent spam)
- [ ] Email change after registration
- [ ] Email verified badge in profile
- [ ] Bulk email verification for existing users
- [ ] Custom email templates

## Related Documentation

- [2FA Implementation](./2FA_IMPLEMENTATION.md) - Two-factor authentication
- [Architecture](./ARCHITECTURE.md) - System design
- [API Integration](./API_INTEGRATION.md) - API endpoints
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

---

**Last Updated**: February 20, 2026
**Implementation Date**: February 20, 2026
**Author**: CareerPilot Development Team
