// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_verified: "pending" | "verified";
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  full_name: string;
  plan: "free" | "pro" | "premium";
  credits_remaining: number;
  access_token: string;
  refresh_token: string;
  token_type: string;
  requires_2fa?: boolean;
}

// 2FA Types
export interface TwoFASetupResponse {
  secret: string;
  qr_code: string; // Data URL for QR code image
  backup_codes: string[]; // Recovery codes in case user loses authenticator
}

export interface TwoFAVerifyPayload {
  code: string; // 6-digit TOTP code
}

export interface TwoFAVerifyResponse {
  verified: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
}

export interface TwoFALoginPayload {
  user_id: string;
  code: string; // 6-digit TOTP code
}

export interface TwoFALoginResponse {
  user_id: string;
  email: string;
  full_name: string;
  plan: "free" | "pro" | "premium";
  credits_remaining: number;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Email Verification Types
export interface SendVerificationEmailPayload {
  email: string; // Email to send verification to
}

export interface SendVerificationEmailResponse {
  message: string;
  email: string;
}

export interface VerifyEmailPayload {
  token: string; // Token from email link
}

export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
  user_id?: string;
  email?: string;
}

export interface ResendVerificationEmailResponse {
  message: string;
  email: string;
}

// Password Reset Types
export interface RequestPasswordResetPayload {
  email: string; // Email to send password reset link to
}

export interface RequestPasswordResetResponse {
  message: string;
  email: string;
}

export interface ResetPasswordPayload {
  token: string; // Token from password reset email
  new_password: string; // New password
}

export interface ResetPasswordResponse {
  message: string;
  user_id: string;
  email: string;
}

// User Profile Types
export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  plan: "free" | "pro" | "premium";
  credits_remaining: number;
  email_verified: boolean;
  two_fa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string; // Optional: new full name
  email?: string; // Optional: new email address
}

export interface ChangePasswordPayload {
  old_password: string; // Current password for verification
  new_password: string; // New password
}

export interface ChangePasswordResponse {
  message: string;
  updated: boolean;
}

export interface DeleteAccountPayload {
  password: string; // Password for account deletion confirmation
}

export interface DeleteAccountResponse {
  message: string;
  deleted: boolean;
}

// Usage Types
export interface UsageResponse {
  user_id: string;
  plan: "free" | "pro" | "premium";
  credits_remaining: number;
  quotas: {
    resume_tailors_per_month: number;
    cover_letters_per_month: number;
    star_stories_per_month: number;
    job_analyses_per_month: number;
  };
}

// Resume Types
export interface Resume {
  id: string;
  user_id: string;
  original_text: string;
  title: string | null;
  file_name: string | null;
  created_at: string;
}

// Job Description Types
export interface JobDescription {
  id: string;
  user_id: string;
  raw_text: string;
  extracted_requirements: string | null;
  role_title: string | null;
  company_name: string | null;
  external_url: string | null;
  created_at: string;
}

// Resume Tailoring Types
export interface TailorRequestPayload {
  user_id: string;
  resume_text: string;
  job_description: string;
  options: {
    target_role: string;
    tone: "professional" | "conversational" | "concise";
  };
}

export interface TailoredResume {
  id: string;
  resume_id: string;
  job_id: string;
  tailored_text: string;
  extracted_requirements: string | null;
  created_at: string;
}

export interface TailorResponse {
  tailored_resume: string;
  extracted_requirements: string;
  usage_id: string;
}

// Job Analysis Types
export interface JobAnalysisPayload {
  job_description: string;
  user_id?: string;
}

export interface JobAnalysisResponse {
  job_id: string;
  extracted_requirements: string;
}

// Cover Letter Types
export interface CoverLetterPayload {
  user_id: string;
  resume_text: string;
  job_description: string;
  company_name: string;
  role_title: string;
}

export interface CoverLetter {
  id: string;
  resume_id: string;
  job_id: string;
  letter_text: string;
  company_name: string | null;
  role_title: string | null;
  created_at: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
}

// STAR Story Types
export interface StarStoryPayload {
  user_id: string;
  resume_text: string;
  job_description: string;
  count: number;
}

export interface StarStory {
  id: string;
  resume_id: string;
  job_id: string;
  story_number: number | null;
  story_text: string;
  created_at: string;
}

export interface StarStoryResponse {
  star_stories: string[];
}

// Stripe Subscription & Payment Types
export interface Plan {
  id: string;
  name: "free" | "pro" | "premium";
  display_name: string;
  price_monthly: number; // in cents
  price_yearly: number; // in cents
  currency: string;
  description: string;
  features: string[];
  max_resumes: number;
  monthly_credits: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "pro" | "premium";
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string;
  ended_at?: string;
  billing_cycle: "monthly" | "yearly";
  created_at: string;
  updated_at: string;
}

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutSessionPayload {
  price_id: string; // Stripe Price ID (monthly or yearly)
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  url: string;
  expires_at: number;
}

export interface CreateSubscriptionPayload {
  plan: "pro" | "premium";
  billing_cycle: "monthly" | "yearly";
  payment_method_id: string;
}

export interface CreateSubscriptionResponse {
  subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string;
  message: string;
}

export interface UpdateSubscriptionPayload {
  subscription_id: string;
  new_plan: "free" | "pro" | "premium";
  billing_cycle?: "monthly" | "yearly";
}

export interface UpdateSubscriptionResponse {
  subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string;
  message: string;
}

export interface CancelSubscriptionPayload {
  subscription_id?: string;
  at_period_end?: boolean; // if true, cancels at end of billing period
}

export interface CancelSubscriptionResponse {
  subscription_id: string;
  status: string;
  canceled_at: string;
  message: string;
}

export interface GetSubscriptionResponse {
  subscription: Subscription | null;
  current_plan: Plan;
  next_billing_date: string | null;
  can_upgrade: boolean;
  can_downgrade: boolean;
}

export interface GetPlansResponse {
  plans: Plan[];
}

export interface PaymentIntentPayload {
  amount: number; // in cents
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface BillingEvent {
  id: string;
  user_id: string;
  type: "charge" | "refund" | "subscription_start" | "subscription_end" | "subscription_upgrade";
  amount: number;
  currency: string;
  description: string;
  stripe_event_id?: string;
  created_at: string;
}

export interface GetBillingHistoryResponse {
  events: BillingEvent[];
  total_count: number;
  has_more: boolean;
}

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  details?: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresTwoFA: boolean;
  isEmailVerified: boolean;
  pendingEmailVerification: boolean;
  subscription: Subscription | null;
  currentPlan: Plan | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyTwoFA: (code: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getSubscription: () => Promise<void>;
  getPlans: () => Promise<Plan[]>;
  createCheckoutSession: (priceId: string, successUrl: string, cancelUrl: string) => Promise<string>;
  updateSubscription: (newPlan: "free" | "pro" | "premium", billingCycle?: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: (atPeriodEnd?: boolean) => Promise<void>;
  getBillingHistory: () => Promise<BillingEvent[]>;
}
