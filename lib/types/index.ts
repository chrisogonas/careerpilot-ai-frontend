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

// Resume Library Types
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  content: string; // Full resume text content
  file_url?: string;
  is_default: boolean;
  tailor_count: number; // Number of times tailored
  version: number;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  content: string;
  change_summary?: string;
  created_at: string;
}

export interface CreateResumePayload {
  title: string;
  content: string;
  file_name?: string;
  is_default?: boolean;
}

export interface UpdateResumePayload {
  title?: string;
  content?: string;
  is_default?: boolean;
  status?: "draft" | "active" | "archived";
}

export interface CreateResumeResponse {
  id: string;
  title: string;
  file_name: string;
  version: number;
  created_at: string;
  message: string;
}

export interface UpdateResumeResponse {
  id: string;
  title: string;
  version: number;
  updated_at: string;
  message: string;
}

export interface GetResumesResponse {
  resumes: Resume[];
  total_count: number;
}

export interface GetResumeResponse {
  resume: Resume;
  versions: ResumeVersion[];
}

export interface DeleteResumeResponse {
  id: string;
  deleted: boolean;
  message: string;
}

export interface SetDefaultResumeResponse {
  resume_id: string;
  is_default: boolean;
  message: string;
}

export interface DuplicateResumePayload {
  resume_id: string;
  new_title: string;
}

export interface DuplicateResumeResponse {
  id: string;
  title: string;
  original_resume_id: string;
  created_at: string;
  message: string;
}

// Job Application Types
export type JobApplicationStatus = 
  | "saved"
  | "applied"
  | "phone_screen"
  | "interview"
  | "final_round"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  job_url?: string;
  job_description?: string;
  status: JobApplicationStatus;
  resume_id?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  job_type?: "full-time" | "part-time" | "contract" | "remote";
  applied_date?: string;
  follow_up_date?: string;
  applied_resume_id?: string; // Which resume was used to apply
  applied_resume_title?: string; // Name of the resume used
  tailor_id?: string; // ID if this came from tailor feature
  tags?: string[]; // Custom tags for organization
  follow_up_count: number;
  created_at: string;
  updated_at: string;
  last_follow_up_at?: string;
}

export interface FollowUp {
  id: string;
  application_id: string;
  follow_up_type: "email" | "phone" | "linkedin" | "note" | "interview_prep" | "other";
  note: string;
  status: "pending" | "completed";
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
}

export interface CreateApplicationPayload {
  job_title: string;
  company_name: string;
  job_url?: string;
  job_description?: string;
  status?: JobApplicationStatus;
  resume_id?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  job_type?: "full-time" | "part-time" | "contract" | "remote";
  applied_date?: string;
  tags?: string[];
}

export interface UpdateApplicationPayload {
  job_title?: string;
  company_name?: string;
  job_url?: string;
  job_description?: string;
  status?: JobApplicationStatus;
  resume_id?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  job_type?: "full-time" | "part-time" | "contract" | "remote";
  follow_up_date?: string;
  tags?: string[];
}

export interface AddFollowUpPayload {
  follow_up_type: "email" | "phone" | "linkedin" | "note" | "interview_prep" | "other";
  note: string;
  status?: "pending" | "completed";
  scheduled_date?: string;
}

export interface CreateApplicationResponse {
  id: string;
  job_title: string;
  company_name: string;
  status: JobApplicationStatus;
  created_at: string;
  message: string;
}

export interface UpdateApplicationResponse {
  id: string;
  job_title: string;
  status: JobApplicationStatus;
  updated_at: string;
  message: string;
}

export interface GetApplicationsResponse {
  applications: JobApplication[];
  total_count: number;
  pending_follow_ups_count: number;
}

export interface GetApplicationResponse {
  application: JobApplication;
  follow_ups: FollowUp[];
}

export interface DeleteApplicationResponse {
  id: string;
  deleted: boolean;
  message: string;
}

export interface AddFollowUpResponse {
  id: string;
  application_id: string;
  follow_up_type: string;
  created_at: string;
  message: string;
}

// Analytics Types
export interface ApplicationMetrics {
  total_applications: number;
  total_by_status: Record<JobApplicationStatus, number>;
  success_rate: number; // Percentage of applications that led to offers
  average_days_to_decision: number;
  most_common_location: string;
  most_common_job_type: string;
}

export interface ResumeUsageMetrics {
  total_resumes: number;
  resumes_used: number;
  total_tailors: number;
  average_tailors_per_resume: number;
  most_used_resume: {
    id: string;
    title: string;
    tailor_count: number;
  } | null;
}

export interface FollowUpMetrics {
  total_follow_ups: number;
  follow_ups_by_type: Record<string, number>;
  pending_follow_ups: number;
  average_follow_ups_per_application: number;
}

export interface ApplicationTimeline {
  date: string; // ISO date
  applications_created: number;
  status_changes: number;
  follow_ups_completed: number;
}

export interface ApplicationTrendData {
  timeline: ApplicationTimeline[]; // Last 30 days
  month_over_month_growth: number; // Percentage
  weekly_average_applications: number;
}

export interface JobMarketInsights {
  top_companies: Array<{
    company_name: string;
    application_count: number;
    success_rate: number;
  }>;
  top_locations: Array<{
    location: string;
    application_count: number;
    average_salary: number;
  }>;
  job_types_distribution: Record<string, number>;
  salary_statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
}

export interface UserAnalytics {
  metrics: ApplicationMetrics;
  resume_usage: ResumeUsageMetrics;
  follow_up_stats: FollowUpMetrics;
  trends: ApplicationTrendData;
  market_insights: JobMarketInsights;
  generated_at: string;
}

export interface AnalyticsResponse {
  analytics: UserAnalytics;
  message: string;
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
  getResumes: () => Promise<Resume[]>;
  getResume: (id: string) => Promise<Resume>;
  createResume: (payload: CreateResumePayload) => Promise<Resume>;
  updateResume: (id: string, payload: UpdateResumePayload) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setDefaultResume: (id: string) => Promise<Resume>;
  duplicateResume: (resumeId: string, newTitle: string) => Promise<Resume>;
  getApplications: () => Promise<JobApplication[]>;
  getApplication: (id: string) => Promise<JobApplication>;
  createApplication: (payload: CreateApplicationPayload) => Promise<JobApplication>;
  updateApplication: (id: string, payload: UpdateApplicationPayload) => Promise<JobApplication>;
  deleteApplication: (id: string) => Promise<void>;
  addFollowUp: (applicationId: string, payload: AddFollowUpPayload) => Promise<FollowUp>;
  getAnalytics: () => Promise<UserAnalytics>;
}
