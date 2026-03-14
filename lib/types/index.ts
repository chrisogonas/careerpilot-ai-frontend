// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_verified: "pending" | "verified";
  is_admin?: boolean;
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
  is_admin?: boolean;
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
export interface UsageBreakdown {
  count: number;
  credits_spent: number;
}

export interface UsageResponse {
  user_id: string;
  plan: "free" | "pro" | "premium";
  credits_remaining: number;
  monthly_credits: number;
  operation_costs: Record<string, number>;
  usage_this_month: {
    resume_tailors: UsageBreakdown;
    cover_letters: UsageBreakdown;
    star_stories: UsageBreakdown;
    job_analyses: UsageBreakdown;
  };
  quotas: {
    resume_tailors_per_month: number;
    resume_tailors_used: number;
    cover_letters_per_month: number;
    cover_letters_used: number;
    star_stories_per_month: number;
    star_stories_used: number;
    job_analyses_per_month: number;
    job_analyses_used: number;
  };
  in_grace_period: boolean;
  grace_period_end: string | null;
  grace_period_days_remaining: number | null;
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
    company_name?: string;
    variation_style?: "balanced" | "skills-focused" | "experience-focused" | "concise";
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

export interface ATSScore {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string;
}


export interface JobURLExtractResponse {
  job_description: string;
  title?: string;
  company?: string;
}
export interface TailorResponse {
  tailored_resume: string;
  extracted_requirements: string;
  usage_id: string;
  job_id: string;
  ats_score?: ATSScore;
  gap_analysis?: string;
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
  tone?: "professional" | "conversational" | "concise";
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
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "grace_period";
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string;
  ended_at?: string;
  billing_cycle: "monthly" | "yearly";
  in_grace_period?: boolean;
  grace_period_end?: string;
  grace_period_days_remaining?: number;
  created_at: string;
  updated_at: string;
  purchased_credits: number;
  purchased_credits_original: number;
  purchased_credits_expires_at?: string;
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

// Credit Pack Types (one-time purchase)
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  price_usd: number;
  description: string;
  popular: boolean;
}

export interface GetCreditPacksResponse {
  packs: CreditPack[];
}

export interface CreditPackCheckoutPayload {
  pack_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CreditPackCheckoutResponse {
  session_id: string;
  url: string;
}

// Email Quota Pack Types (one-time purchase)
export interface EmailQuotaPack {
  id: string;
  name: string;
  emails: number;
  price_cents: number;
  price_usd: number;
  description: string;
  popular: boolean;
}

export interface GetEmailQuotaPacksResponse {
  packs: EmailQuotaPack[];
}

export interface EmailQuotaPackCheckoutPayload {
  pack_id: string;
  success_url: string;
  cancel_url: string;
}

export interface EmailQuotaPackCheckoutResponse {
  session_id: string;
  url: string;
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

// Resume Upload Types
export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  skills: string[];
  experience_text: string;
}

export interface ResumeUploadPayload {
  filename: string;
  content: string;
}

export interface ResumeUploadResponse {
  resume_id?: string;
  filename: string;
  parsed: ParsedResumeData;
}

export interface ResumeFileUploadResponse {
  resume_id?: string;
  filename: string;
  file_type: string;
  text_length: number;
  parsed: ParsedResumeData;
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
  applied_resume_text?: string; // Snapshot of resume content at time of linking
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
  reminders: Reminder[];
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
  applied_resume_text?: string;
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

// ============================================================================
// Follow-Up Reminders (Pro/Premium only)
// ============================================================================

export type ReminderType = "once" | "recurring";
export type RecurrenceInterval = "daily" | "every_2_days" | "weekly" | "biweekly" | "monthly";
export type ReminderStatus = "active" | "snoozed" | "dismissed" | "completed" | "expired";
export type SnoozeDuration = "5m" | "10m" | "15m" | "1h" | "4h" | "1d" | "1w";

export type ReminderTimingMode = "at_event" | "before_event" | "custom";
export type ReminderBeforeUnit = "minutes" | "hours" | "days" | "weeks";

export interface Reminder {
  id: string;
  user_id: string;
  follow_up_id: string;
  application_id: string;
  title: string;
  reminder_type: ReminderType;
  recurrence_interval?: RecurrenceInterval;
  recurrence_end_date?: string;
  recurrence_count?: number;
  occurrence_number?: number;
  reminder_date: string;
  next_reminder_date: string;
  status: ReminderStatus;
  snooze_until?: string;
  email_enabled: boolean;
  email_reminder_date?: string;
  email_sent_at?: string;
  dismissed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  application?: {
    id: string;
    job_title: string;
    company_name: string;
    status: string;
  };
}

export interface CreateReminderPayload {
  follow_up_id: string;
  reminder_date: string;
  reminder_type?: ReminderType;
  recurrence_interval?: RecurrenceInterval;
  recurrence_end_date?: string;
  recurrence_count?: number;
  title?: string;
  email_enabled?: boolean;
  email_reminder_date?: string;
}

export interface UpdateReminderPayload {
  title?: string;
  reminder_date?: string;
  next_reminder_date?: string;
  reminder_type?: ReminderType;
  recurrence_interval?: RecurrenceInterval;
  recurrence_end_date?: string | null;
  recurrence_count?: number | null;
  email_enabled?: boolean;
  email_reminder_date?: string | null;
  status?: ReminderStatus;
}

export interface EmailQuotaResponse {
  email_reminder_limit: number;
  email_reminders_used: number;
  email_reminders_remaining: number;
  can_create_email_reminder: boolean;
}

export interface DueRemindersResponse {
  due_reminders: Reminder[];
  count: number;
}

export interface RemindersListResponse {
  reminders: Reminder[];
  count: number;
}

// ============================================================================
// TODO List (Pro/Premium only)
// ============================================================================

export type TodoCategory = "career" | "learning" | "networking" | "personal" | "other";
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface TodoSubtask {
  id: string;
  todo_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface TodoReminder {
  id: string;
  user_id: string;
  todo_id: string;
  title: string;
  reminder_type: ReminderType;
  recurrence_interval?: RecurrenceInterval;
  recurrence_end_date?: string;
  recurrence_count?: number;
  occurrence_number?: number;
  reminder_date: string;
  next_reminder_date: string;
  status: ReminderStatus;
  snooze_until?: string;
  email_enabled: boolean;
  email_reminder_date?: string;
  email_sent_at?: string;
  dismissed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  todo?: {
    id: string;
    title: string;
    category: TodoCategory;
    priority: TodoPriority;
    status: TodoStatus;
  };
}

export interface TodoItem {
  id: string;
  user_id: string;
  application_id?: string;
  title: string;
  description?: string;
  notes?: string;
  category: TodoCategory;
  priority: TodoPriority;
  status: TodoStatus;
  due_date?: string;
  completed_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  subtasks: TodoSubtask[];
  reminder?: TodoReminder;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  notes?: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  due_date?: string;
  application_id?: string;
  subtasks?: { title: string }[];
  reminder?: {
    reminder_date: string;
    reminder_type?: ReminderType;
    recurrence_interval?: RecurrenceInterval;
    recurrence_end_date?: string;
    recurrence_count?: number;
    email_enabled?: boolean;
    email_reminder_date?: string;
  };
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  notes?: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  status?: TodoStatus;
  due_date?: string | null;
  application_id?: string | null;
  sort_order?: number;
}

export interface CreateTodoReminderPayload {
  reminder_date: string;
  reminder_type?: ReminderType;
  recurrence_interval?: RecurrenceInterval;
  recurrence_end_date?: string;
  recurrence_count?: number;
  email_enabled?: boolean;
  email_reminder_date?: string;
}

export interface TodoListResponse {
  todos: TodoItem[];
  count: number;
}

export interface DueTodoRemindersResponse {
  due_reminders: TodoReminder[];
  count: number;
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
  total_by_status: Record<string, number>;
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

// Progress Summary Types (chart-optimised)
export interface ProgressSummary {
  weekly_applications: { week: string; count: number }[];
  pipeline_funnel: { status: string; count: number }[];
  activity_breakdown: { type: string; count: number }[];
  interview_scores: { date: string; score: number; role: string }[];
  generated_at: string;
}

// Contact Form Types
export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  submission_id?: string;
}

// API Error Response
export interface ApiError {
  error?: string;
  message?: string;
  detail?: string | { error?: string; message?: string };
  details?: string;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminDashboardData {
  total_users: number;
  active_users_today: number;
  total_api_calls: number;
  api_calls_today: number;
  errors_today: number;
  error_rate_percent: number;
  avg_response_time_ms: number;
  top_endpoints: Array<{ endpoint: string; calls: number; avg_response_time_ms: number }>;
  security_events_today: number;
  webhook_success_rate: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  credits_remaining: number;
  subscription_plan: string;
  created_at: string;
  last_login: string | null;
  api_calls_month: number;
}

export interface AdminUserListResponse {
  success: boolean;
  users: AdminUserListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  full_name: string | null;
  is_verified: string;
  created_at: string;
  updated_at: string;
  subscription_id: string | null;
  plan: string;
  subscription_status: string;
  credits_remaining: number;
  purchased_credits: number;
  purchased_credits_expires_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  grace_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  last_login: string | null;
  api_calls_month: number;
  resume_count: number;
  application_count: number;
}

export interface AdminPlanOverride {
  id: string;
  plan_name: string;
  field_name: string;
  field_value: string;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminPlanConfig {
  plan_name: string;
  display_name: string;
  monthly_credits: number;
  price_monthly_cents: number;
  price_yearly_cents: number;
  price_usd: number;
  max_resumes: number;
  email_reminder_limit: number;
  description: string;
  features: string[];
  overrides: AdminPlanOverride[];
}

export interface AdminPlanConfigResponse {
  success: boolean;
  plans: AdminPlanConfig[];
  overridable_fields: string[];
}

// ── Credit Pack Admin Types ─────────────────────────────────────────────────

export interface AdminCreditPackOverride {
  id: string;
  pack_id: string;
  field_name: string;
  field_value: string;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminCreditPack {
  id: string;
  pack_id: string;
  name: string;
  credits: number;
  price_cents: number;
  price_usd: number;
  description: string;
  popular: boolean;
  overrides: AdminCreditPackOverride[];
}

export interface AdminCreditPackConfigResponse {
  success: boolean;
  packs: AdminCreditPack[];
  overridable_fields: string[];
  expiry_days: number;
}

export interface AdminRevenueSummary {
  total_paying_users: number;
  mrr_cents: number;
  arr_cents: number;
  total_subscriptions: number;
  subscriptions_by_plan: Record<string, number>;
  total_credit_pack_revenue_cents: number;
  active_grace_periods: number;
  churn_count_30d: number;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AdminAuditLogResponse {
  success: boolean;
  logs: AdminAuditLog[];
  total: number;
  skip: number;
  limit: number;
}

// ── Observability Types (Phase 7.2) ──────────────────────────────────────────

export interface SystemHealthData {
  status: "healthy" | "degraded" | "unhealthy";
  last_5_min: {
    requests: number;
    avg_latency_ms: number;
    errors_5xx: number;
    errors_4xx: number;
    rpm: number;
  };
  last_hour: {
    requests: number;
    avg_latency_ms: number;
    errors_5xx: number;
    error_rate_percent: number;
    rpm: number;
  };
  timestamp: string;
}

export interface LatencyPercentilesData {
  hours: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  avg_ms: number;
  total_requests: number;
}

export interface LatencyTimeseriesPoint {
  time: string;
  avg_ms: number;
  p95_ms: number;
  requests: number;
  errors: number;
}

export interface EndpointHeatmapItem {
  endpoint: string;
  method: string;
  calls: number;
  avg_ms: number;
  p95_ms: number;
  errors: number;
  error_rate_percent: number;
}

export interface ErrorBreakdownData {
  hours: number;
  by_status_code: Array<{ status_code: number; count: number }>;
  top_error_endpoints: Array<{ endpoint: string; method: string; count: number }>;
}

export interface EmailStatsData {
  days: number;
  total_sent: number;
  by_type: Record<string, number>;
  daily_trend: Array<{ date: string; count: number }>;
  top_senders: Array<{ user_id: string; count: number }>;
}

export interface WebhookEndpointHealth {
  id: string;
  url: string;
  active: boolean;
  consecutive_failures: number;
  deliveries: number;
  successes: number;
  success_rate_percent: number;
}

export interface WebhookHealthData {
  hours: number;
  total_deliveries: number;
  successful: number;
  failed: number;
  success_rate_percent: number;
  avg_duration_ms: number;
  endpoints: WebhookEndpointHealth[];
  recent_failures: Array<{
    id: string;
    endpoint_url: string;
    status_code: number | null;
    error: string | null;
    at: string;
  }>;
}

export interface AlertThresholdData {
  id: string;
  metric_name: string;
  operator: string;
  threshold_value: number;
  severity: string;
  enabled: boolean;
  cooldown_minutes: number;
  last_triggered_at: string | null;
  notify_email: boolean;
  created_at: string;
}

export interface AlertHistoryItem {
  id: string;
  metric_name: string;
  metric_value: string;
  threshold_value: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

// ── Phase 7.3: Advanced Admin Types ──────────────────────────────────────────

export interface AdminRevenueDetailed {
  daily_mrr: Array<{ date: string; mrr_cents: number }>;
  churn_waterfall: Array<{
    date: string;
    upgrades: number;
    downgrades: number;
    churns: number;
    reactivations: number;
    net_mrr_change_cents: number;
  }>;
  cohort_retention: Array<{
    cohort_date: string;
    cohort_size: number;
    retention_day_7?: number;
    retention_day_14?: number;
    retention_day_30?: number;
    retention_day_60?: number;
    retention_day_90?: number;
  }>;
  conversion_funnel: {
    total_users: number;
    free_users: number;
    pro_users: number;
    premium_users: number;
    conversion_rate: number;
  };
  total_ltv_cents: number;
  avg_ltv_cents: number;
}

export interface AdminAICostSummary {
  total_tokens_used: number;
  total_credits_consumed: number;
  daily_usage: Array<{
    date: string;
    tokens_used: number;
    credits_consumed: number;
    operation_count: number;
  }>;
  by_operation: Array<{
    operation: string;
    total_tokens: number;
    total_credits: number;
    count: number;
    avg_tokens_per_call: number;
  }>;
  by_user: Array<{
    user_id: string;
    email: string;
    total_tokens: number;
    total_credits: number;
    count: number;
  }>;
  estimated_cost_usd: number;
}

export interface AdminFeatureFlag {
  id: string;
  flag_name: string;
  description: string | null;
  enabled: boolean;
  target_type: string; // "global" | "plan" | "user"
  target_value: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminFeatureFlagCreateRequest {
  flag_name: string;
  description?: string;
  enabled?: boolean;
  target_type?: string;
  target_value?: string;
}

export interface AdminFeatureFlagUpdateRequest {
  flag_name?: string;
  description?: string;
  enabled?: boolean;
  target_type?: string;
  target_value?: string;
}

export interface AdminSupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string; // "new" | "read" | "replied" | "closed"
  user_id: string | null;
  created_at: string;
}

export interface AdminSupportTicketListResponse {
  success: boolean;
  tickets: AdminSupportTicket[];
  total: number;
  skip: number;
  limit: number;
}

// ============================================================================
// MOCK INTERVIEW TYPES (Phase 8)
// ============================================================================

export type InterviewMode = "text" | "audio";
export type InterviewStatus = "in_progress" | "completed" | "cancelled";

export interface InterviewAccessResponse {
  has_access: boolean;
  modes_available: InterviewMode[];
  is_trial: boolean;
  trial_days_remaining: number | null;
  plan: string;
  reason: string;
}

export interface InterviewStartPayload {
  resume_text: string;
  job_description: string;
  target_role?: string;
  company_name?: string;
  job_url?: string;
  interview_mode?: InterviewMode;
}

export interface InterviewStartResponse {
  session_id: string;
  first_question: string;
  question_type: string;
  question_number: number;
  total_planned: number;
  credits_remaining: number;
}

export interface InterviewRespondPayload {
  answer: string;
}

export interface InterviewRespondResponse {
  session_id: string;
  answer_feedback: string;
  answer_score: number;
  next_question: string | null;
  next_question_type: string | null;
  question_number: number;
  total_planned: number;
  is_complete: boolean;
}

export interface InterviewMessageOut {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  message_index: number;
  question_type: string | null;
  score: string | null;
  feedback: string | null;
  created_at: string;
}

export interface InterviewFeedback {
  overall_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  star_adherence: string;
  communication_quality: string;
  confidence_impression: string;
  per_question: Array<{
    question: string;
    answer_summary: string;
    score: number;
    feedback: string;
  }>;
  recommended_focus_areas: string[];
}

export interface InterviewSessionOut {
  id: string;
  target_role: string | null;
  company_name: string | null;
  interview_mode: InterviewMode;
  status: InterviewStatus;
  total_questions: number;
  overall_score: string | null;
  feedback: InterviewFeedback | null;
  messages: InterviewMessageOut[];
  started_at: string;
  completed_at: string | null;
}

export interface InterviewSessionSummary {
  id: string;
  target_role: string | null;
  company_name: string | null;
  interview_mode: InterviewMode;
  status: InterviewStatus;
  total_questions: number;
  overall_score: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface InterviewEndResponse {
  session_id: string;
  status: string;
  feedback: InterviewFeedback;
  credits_remaining: number;
}

// ============================================================================
// Job Board Search Types
// ============================================================================

export interface JobSearchRequest {
  query: string;
  location?: string;
  page?: number;
  num_pages?: number;
  date_posted?: string;       // all | today | 3days | week | month
  employment_type?: string;   // FULLTIME | PARTTIME | CONTRACTOR | INTERN
  remote_only?: boolean;
}

export interface JobSearchResultItem {
  job_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employment_type?: string;
  date_posted?: string;
  apply_link?: string;
  source?: string;            // Indeed | LinkedIn | Glassdoor | …
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;     // yearly | monthly | hourly
  is_remote: boolean;
  company_logo?: string;
  company_url?: string;
}

export interface JobSearchResponse {
  results: JobSearchResultItem[];
  total_results: number;
  page: number;
  credits_remaining: number;
  cached: boolean;
}

export interface SaveJobSearchRequest {
  name?: string;
  query: string;
  location?: string;
  date_posted?: string;
  employment_type?: string;
  remote_only?: boolean;
  results_count?: number;
}

export interface SavedJobSearch {
  id: string;
  name: string;
  query: string;
  location?: string;
  date_posted?: string;
  employment_type?: string;
  remote_only: boolean;
  results_count?: number;
  created_at: string;
}

export interface SavedJobSearchListResponse {
  searches: SavedJobSearch[];
}

export interface SaveJobAsApplicationRequest {
  job_id: string;
  title: string;
  company: string;
  location?: string;
  apply_link?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  source?: string;
}

// ============================================================================
// EMAIL OAUTH TYPES (Phase 4)
// ============================================================================

export type EmailOAuthProvider = "gmail" | "outlook";

export interface EmailOAuthAuthorizeResponse {
  authorization_url: string;
  provider: EmailOAuthProvider;
  state: string;
}

export interface EmailOAuthCallbackResponse {
  success: boolean;
  provider: EmailOAuthProvider;
  email: string;
  message?: string;
  error?: string;
}

export interface ConnectedEmailProvider {
  provider: EmailOAuthProvider;
  email: string;
  connected_at: string;
}

export interface ConnectedProvidersResponse {
  connected_providers: ConnectedEmailProvider[];
  count: number;
}

export interface DisconnectProviderResponse {
  success: boolean;
  provider: EmailOAuthProvider;
  message: string;
}

export interface EmailDraftResponse {
  app_id: string;
  job_title: string;
  company_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  has_resume: boolean;
  has_cover_letter: boolean;
  resume_name?: string;
  cover_letter_name?: string;
  job_url?: string;
  job_description?: string;
  cover_letter_text?: string;
  resumes?: Resume[];
}

export interface SendApplicationEmailPayload {
  provider: EmailOAuthProvider;
  recipient_email: string;
  subject: string;
  body: string;
  include_resume?: boolean;
  include_cover_letter?: boolean;
  selected_resume_id?: string;
  resume_text?: string;
  cover_letter_text?: string;
}

export interface SendApplicationEmailResponse {
  success: boolean;
  message: string;
  app_id: string;
  provider: EmailOAuthProvider;
  applied_at: string;
  status: string;
}

export interface TailorApplyPayload {
  provider: EmailOAuthProvider;
  recipient_email: string;
  subject: string;
  body: string;
  job_title: string;
  company_name: string;
  job_description?: string;
  job_url?: string;
  resume_text: string;
  cover_letter_text?: string;
  resume_id?: string;
}

export interface TailorApplyResponse {
  success: boolean;
  message: string;
  app_id: string;
  provider: EmailOAuthProvider;
  applied_at: string;
  status: string;
}

export interface GenerateApplyBodyPayload {
  job_title: string;
  company_name: string;
  include_cover_letter: boolean;
  user_name?: string;
  resume_text?: string;
  job_description?: string;
}

export interface GenerateApplyBodyResponse {
  body: string;
  subject: string;
  credits_remaining?: number;
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
  register: (email: string, password: string, full_name: string, referral_code?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyTwoFA: (code: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getSubscription: () => Promise<void>;
  getPlans: () => Promise<Plan[]>;
  createCheckoutSession: (priceId: string, successUrl: string, cancelUrl: string) => Promise<string>;
  updateSubscription: (newPlan: "free" | "pro" | "premium", billingCycle?: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: (atPeriodEnd?: boolean) => Promise<void>;
  getBillingHistory: () => Promise<BillingEvent[]>;
  getCreditPacks: () => Promise<CreditPack[]>;
  createCreditPackCheckout: (packId: string, successUrl: string, cancelUrl: string) => Promise<string>;
  getResumes: () => Promise<Resume[]>;
  getResume: (id: string) => Promise<Resume>;
  createResume: (payload: CreateResumePayload) => Promise<Resume>;
  updateResume: (id: string, payload: UpdateResumePayload) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setDefaultResume: (id: string) => Promise<Resume>;
  duplicateResume: (resumeId: string, newTitle: string) => Promise<Resume>;
  uploadResume: (payload: ResumeUploadPayload) => Promise<ResumeUploadResponse>;
  uploadResumeFile: (file: File) => Promise<ResumeFileUploadResponse>;
  getApplications: () => Promise<JobApplication[]>;
  getApplication: (id: string) => Promise<GetApplicationResponse>;
  createApplication: (payload: CreateApplicationPayload) => Promise<JobApplication>;
  updateApplication: (id: string, payload: UpdateApplicationPayload) => Promise<JobApplication>;
  deleteApplication: (id: string) => Promise<void>;
  addFollowUp: (applicationId: string, payload: AddFollowUpPayload) => Promise<FollowUp>;
  deleteFollowUp: (applicationId: string, followUpId: string) => Promise<void>;
  // Reminders (Pro/Premium)
  getDueReminders: () => Promise<DueRemindersResponse>;
  getReminders: (status?: string) => Promise<RemindersListResponse>;
  createReminder: (payload: CreateReminderPayload) => Promise<Reminder>;
  dismissReminder: (reminderId: string) => Promise<Reminder>;
  snoozeReminder: (reminderId: string, duration: SnoozeDuration) => Promise<Reminder>;
  completeReminder: (reminderId: string) => Promise<Reminder>;
  deleteReminder: (reminderId: string) => Promise<void>;
  updateReminder: (reminderId: string, payload: UpdateReminderPayload) => Promise<Reminder>;
  getEmailQuota: () => Promise<EmailQuotaResponse>;
  getAnalytics: () => Promise<UserAnalytics>;
  // Todos (Pro/Premium)
  getTodos: (filters?: { status?: TodoStatus; category?: TodoCategory; priority?: TodoPriority }) => Promise<TodoListResponse>;
  getTodo: (todoId: string) => Promise<TodoItem>;
  createTodo: (payload: CreateTodoPayload) => Promise<TodoItem>;
  updateTodo: (todoId: string, payload: UpdateTodoPayload) => Promise<TodoItem>;
  deleteTodo: (todoId: string) => Promise<void>;
  addSubtask: (todoId: string, title: string) => Promise<TodoSubtask>;
  updateSubtask: (todoId: string, subtaskId: string, data: Partial<TodoSubtask>) => Promise<TodoSubtask>;
  deleteSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  createTodoReminder: (todoId: string, payload: CreateTodoReminderPayload) => Promise<TodoReminder>;
  updateTodoReminder: (todoId: string, payload: Partial<CreateTodoReminderPayload>) => Promise<TodoReminder>;
  deleteTodoReminder: (todoId: string) => Promise<void>;
  snoozeTodoReminder: (todoId: string, duration: SnoozeDuration) => Promise<TodoReminder>;
  dismissTodoReminder: (todoId: string) => Promise<TodoReminder>;
  completeTodoReminder: (todoId: string) => Promise<TodoReminder>;
  getDueTodoReminders: () => Promise<DueTodoRemindersResponse>;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  credits_used?: number | null;
  created_at: string;
}

export interface RecentActivityResponse {
  items: ActivityItem[];
  total: number;
}

// ============================================================================
// CHAT (AI Career Coach) TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationDetail extends ChatConversation {
  messages: ChatMessage[];
}

export interface ChatSendRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatSendResponse {
  conversation_id: string;
  message: ChatMessage;
  credits_remaining: number;
}

export interface ChatConversationListResponse {
  conversations: ChatConversation[];
  total: number;
}

export interface ChatAccessResponse {
  allowed: boolean;
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
}

// ── Referral System ──────────────────────────────────────────────

export interface ReferralOut {
  id: string;
  referred_email: string | null;
  referred_name: string | null;
  status: string;
  referrer_rewarded: boolean;
  referred_rewarded: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralStatsOut {
  referral_code: string;
  referral_link: string;
  total_invited: number;
  total_completed: number;
  total_credits_earned: number;
}

export interface ReferralListResponse {
  referrals: ReferralOut[];
  stats: ReferralStatsOut;
}

// ── Resume Templates ──────────────────────────────────────────────────────

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  plan_required: string;
  accent_color: number[];
  preview_tag: string;
  available: boolean;
}

export interface ResumeTemplateListResponse {
  templates: ResumeTemplate[];
}
