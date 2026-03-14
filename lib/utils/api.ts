import {
  AuthResponse,
  ApiError,
  TailorRequestPayload,
  TailorResponse,
  JobAnalysisPayload,
  JobAnalysisResponse,
  CoverLetterPayload,
  CoverLetterResponse,
  StarStoryPayload,
  StarStoryResponse,
  UsageResponse,
  TwoFASetupResponse,
  TwoFAVerifyPayload,
  TwoFAVerifyResponse,
  TwoFALoginPayload,
  TwoFALoginResponse,
  SendVerificationEmailPayload,
  SendVerificationEmailResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  ResendVerificationEmailResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ProfileData,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ChangePasswordResponse,
  DeleteAccountPayload,
  DeleteAccountResponse,
  CreateCheckoutSessionPayload,
  CreateCheckoutSessionResponse,
  CreateSubscriptionPayload,
  CreateSubscriptionResponse,
  UpdateSubscriptionPayload,
  UpdateSubscriptionResponse,
  CancelSubscriptionPayload,
  CancelSubscriptionResponse,
  GetSubscriptionResponse,
  GetPlansResponse,
  PaymentIntentPayload,
  PaymentIntentResponse,
  GetBillingHistoryResponse,
  Plan,
  Subscription,
  CreditPack,
  GetCreditPacksResponse,
  CreditPackCheckoutResponse,
  GetEmailQuotaPacksResponse,
  EmailQuotaPackCheckoutResponse,
  Resume,
  CreateResumePayload,
  CreateResumeResponse,
  UpdateResumePayload,
  UpdateResumeResponse,
  GetResumesResponse,
  GetResumeResponse,
  DeleteResumeResponse,
  SetDefaultResumeResponse,
  DuplicateResumePayload,
  DuplicateResumeResponse,
  ResumeUploadPayload,
  ResumeUploadResponse,
  ResumeFileUploadResponse,
  ParsedResumeData,
  JobApplication,
  CreateApplicationPayload,
  CreateApplicationResponse,
  UpdateApplicationPayload,
  UpdateApplicationResponse,
  GetApplicationsResponse,
  GetApplicationResponse,
  DeleteApplicationResponse,
  AddFollowUpPayload,
  AddFollowUpResponse,
  FollowUp,
  CreateReminderPayload,
  UpdateReminderPayload,
  Reminder,
  DueRemindersResponse,
  RemindersListResponse,
  SnoozeDuration,
  EmailQuotaResponse,
  UserAnalytics,
  AnalyticsResponse,
  ProgressSummary,
  ContactFormPayload,
  ContactFormResponse,
  TodoItem,
  TodoSubtask,
  TodoReminder,
  TodoListResponse,
  CreateTodoPayload,
  UpdateTodoPayload,
  CreateTodoReminderPayload,
  DueTodoRemindersResponse,
  TodoStatus,
  TodoCategory,
  TodoPriority,
  AdminDashboardData,
  AdminUserListResponse,
  AdminUserDetail,
  AdminPlanConfigResponse,
  AdminCreditPackConfigResponse,
  AdminRevenueSummary,
  AdminAuditLogResponse,
  SystemHealthData,
  LatencyPercentilesData,
  LatencyTimeseriesPoint,
  EndpointHeatmapItem,
  ErrorBreakdownData,
  EmailStatsData,
  WebhookHealthData,
  AlertThresholdData,
  AlertHistoryItem,
  AdminRevenueDetailed,
  AdminAICostSummary,
  AdminFeatureFlag,
  AdminFeatureFlagCreateRequest,
  AdminFeatureFlagUpdateRequest,
  AdminSupportTicket,
  AdminSupportTicketListResponse,
  InterviewAccessResponse,
  InterviewStartPayload,
  InterviewStartResponse,
  InterviewRespondResponse,
  InterviewEndResponse,
  InterviewSessionOut,
  InterviewSessionSummary,
  JobSearchRequest,
  JobSearchResponse,
  SaveJobSearchRequest,
  SavedJobSearchListResponse,
  SaveJobAsApplicationRequest,
  EmailOAuthAuthorizeResponse,
  EmailOAuthCallbackResponse,
  ConnectedProvidersResponse,
  DisconnectProviderResponse,
  EmailDraftResponse,
  SendApplicationEmailPayload,
  SendApplicationEmailResponse,
  EmailOAuthProvider,
  TailorApplyPayload,
  TailorApplyResponse,
  GenerateApplyBodyPayload,
  GenerateApplyBodyResponse,
  RecentActivityResponse,
  ChatSendResponse,
  ChatConversationListResponse,
  ChatConversationDetail,
  ChatAccessResponse,
  ReferralStatsOut,
  ReferralListResponse,
  ResumeTemplateListResponse,
} from "@/lib/types";

// Dynamically determine API URL based on environment
const API_BASE_URL = (() => {
  // Explicit env var always wins
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // On the server side (SSR), use localhost
  if (typeof window === "undefined") {
    return "http://localhost:8000/api/v1";
  }
  // On the client side, derive from the current hostname
  // For tunnels (ngrok, tailscale, etc.), this will resolve to tunnel-hostname:8000
  const { protocol, hostname } = window.location;
  // For localhost development, keep as localhost:8000
  // For tunnels, this becomes tunnel-hostname:8000
  const host =
    hostname === "localhost" || hostname === "127.0.0.1"
      ? "localhost"
      : hostname;
  return `${protocol}//${host}:8000/api/v1`;
})();
const JWT_STORAGE_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "careerpilot_token";
const REFRESH_TOKEN_KEY = "careerpilot_refresh_token";

class ApiClient {
    // Save tailored resume endpoint
    async saveTailoredResume(payload: {
      tailored_text: string;
      job_title: string;
    }): Promise<{ message: string; resume_id: string }> {
      const response = await fetch(`${this.baseURL}/resumes/save-tailored`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return this.handleResponse<{ message: string; resume_id: string }>(response);
    }

    // PDF Export endpoint
    async exportResumePDF(payload: { resume_text: string; title: string; template?: string }): Promise<Blob> {
      const response = await fetch(`${this.baseURL}/resumes/export-pdf`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "PDF export failed");
      }
      return response.blob();
    }

    async extractJobFromURL(url: string): Promise<{ job_description: string; title?: string; company?: string }> {
      const response = await fetch(`${this.baseURL}/jobs/extract-from-url`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ url }),
      });
      return this.handleResponse<{ job_description: string; title?: string; company?: string }>(response);
    }

    async getTailorHistory(): Promise<{ history: Array<{ id: string; tailored_text: string; extracted_requirements?: string; role_title?: string; company_name?: string; created_at: string }> }> {
      const response = await fetch(`${this.baseURL}/resumes/tailor-history`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<{ history: Array<{ id: string; tailored_text: string; extracted_requirements?: string; role_title?: string; company_name?: string; created_at: string }> }>(response);
    }

    async editResumeSection(payload: { full_resume: string; section_name: string; instructions: string; job_description?: string }): Promise<{ updated_resume: string }> {
      const response = await fetch(`${this.baseURL}/resumes/edit-section`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return this.handleResponse<{ updated_resume: string }>(response);
    }
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(JWT_STORAGE_KEY);
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(JWT_STORAGE_KEY, token);
  }

  private removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(JWT_STORAGE_KEY);
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private removeRefreshToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = "An error occurred";
      try {
        const error = await response.json();
        message =
          error.message ||
          (typeof error.detail === "string"
            ? error.detail
            : error.detail?.message) ||
          message;
      } catch {
        // response body wasn't JSON
      }
      throw new Error(message);
    }
    return response.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Auth Endpoints
  async register(email: string, password: string, full_name: string, referral_code?: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, full_name, ...(referral_code ? { referral_code } : {}) }),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.access_token);
    if (data.refresh_token) this.setRefreshToken(data.refresh_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.access_token);
    if (data.refresh_token) this.setRefreshToken(data.refresh_token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(),
      });
    } finally {
      this.removeToken();
      this.removeRefreshToken();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.access_token);
    if (data.refresh_token) this.setRefreshToken(data.refresh_token);
    return data;
  }

  async getMe(): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // 2FA Endpoints
  async setupTwoFA(): Promise<TwoFASetupResponse> {
    const response = await fetch(`${this.baseURL}/auth/2fa/setup`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    return this.handleResponse<TwoFASetupResponse>(response);
  }

  async verifyTwoFASetup(payload: TwoFAVerifyPayload): Promise<TwoFAVerifyResponse> {
    const response = await fetch(`${this.baseURL}/auth/2fa/verify-setup`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<TwoFAVerifyResponse>(response);
  }

  async verifyTwoFALogin(payload: TwoFALoginPayload): Promise<TwoFALoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/2fa/verify-login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<TwoFALoginResponse>(response);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    if (data.refresh_token) {
      this.setRefreshToken(data.refresh_token);
    }
    return data;
  }

  async disableTwoFA(): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/auth/2fa/disable`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ success: boolean }>(response);
  }

  // Email Verification Endpoints
  async sendVerificationEmail(payload: SendVerificationEmailPayload): Promise<SendVerificationEmailResponse> {
    const response = await fetch(`${this.baseURL}/auth/send-verification-email`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<SendVerificationEmailResponse>(response);
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<VerifyEmailResponse>(response);
  }

  async resendVerificationEmail(payload: { email: string }): Promise<ResendVerificationEmailResponse> {
    const response = await fetch(`${this.baseURL}/auth/resend-verification-email`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ResendVerificationEmailResponse>(response);
  }

  // Password Reset Endpoints
  async requestPasswordReset(payload: RequestPasswordResetPayload): Promise<RequestPasswordResetResponse> {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<RequestPasswordResetResponse>(response);
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ResetPasswordResponse>(response);
  }

  // User Profile Endpoints
  async getProfile(): Promise<ProfileData> {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ProfileData>(response);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileData> {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ProfileData>(response);
  }

  async changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await fetch(`${this.baseURL}/user/change-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ChangePasswordResponse>(response);
  }

  async deleteAccount(payload: DeleteAccountPayload): Promise<DeleteAccountResponse> {
    const response = await fetch(`${this.baseURL}/user/account`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<DeleteAccountResponse>(response);
  }

  // Job Analysis Endpoints
  async analyzeJob(payload: JobAnalysisPayload): Promise<JobAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/jobs/analyze`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<JobAnalysisResponse>(response);
  }

  // Resume Tailoring Endpoints
  async tailorResume(payload: TailorRequestPayload): Promise<TailorResponse> {
    const response = await fetch(`${this.baseURL}/resumes/tailor`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<TailorResponse>(response);
  }

  // Streaming Resume Tailoring
  async tailorResumeStream(
    payload: TailorRequestPayload,
    onEvent: (event: { type: string; content?: string; message?: string; tailored_resume?: string; extracted_requirements?: string; gap_analysis?: string; ats_score?: any; job_id?: string; credits_remaining?: number }) => void,
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/resumes/tailor-stream`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Stream request failed" }));
      throw new Error(typeof err.detail === "string" ? err.detail : err.detail?.message || "Stream failed");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No readable stream");
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try { onEvent(JSON.parse(line)); } catch {}
      }
    }
    if (buffer.trim()) {
      try { onEvent(JSON.parse(buffer)); } catch {}
    }
  }

  // Cover Letter Endpoints
  async generateCoverLetter(payload: CoverLetterPayload): Promise<CoverLetterResponse> {
    const response = await fetch(`${this.baseURL}/cover-letter/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<CoverLetterResponse>(response);
  }

  // STAR Story Endpoints
  async generateStarStories(payload: StarStoryPayload): Promise<StarStoryResponse> {
    const response = await fetch(`${this.baseURL}/star/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<StarStoryResponse>(response);
  }

  // Usage Endpoints
  async getUsage(userId?: string): Promise<UsageResponse> {
    const url = new URL(`${this.baseURL}/usage/me`);
    if (userId) {
      url.searchParams.append("user_id", userId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<UsageResponse>(response);
  }

  // Stripe & Subscription Endpoints
  async getPlans(): Promise<Plan[]> {
    const response = await fetch(`${this.baseURL}/stripe/plans`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetPlansResponse>(response);
    return data.plans;
  }

  async getSubscription(): Promise<GetSubscriptionResponse> {
    const response = await fetch(`${this.baseURL}/stripe/subscription`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<GetSubscriptionResponse>(response);
  }

  async createCheckoutSession(
    payload: CreateCheckoutSessionPayload
  ): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch(`${this.baseURL}/stripe/checkout-session`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<CreateCheckoutSessionResponse>(response);
  }

  async createSubscription(
    payload: CreateSubscriptionPayload
  ): Promise<CreateSubscriptionResponse> {
    const response = await fetch(`${this.baseURL}/stripe/create-subscription`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<CreateSubscriptionResponse>(response);
  }

  async updateSubscription(
    payload: UpdateSubscriptionPayload
  ): Promise<UpdateSubscriptionResponse> {
    const response = await fetch(`${this.baseURL}/stripe/update-subscription`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<UpdateSubscriptionResponse>(response);
  }

  async cancelSubscription(
    payload: CancelSubscriptionPayload
  ): Promise<CancelSubscriptionResponse> {
    const response = await fetch(`${this.baseURL}/stripe/cancel-subscription`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<CancelSubscriptionResponse>(response);
  }

  async createPaymentIntent(
    payload: PaymentIntentPayload
  ): Promise<PaymentIntentResponse> {
    const response = await fetch(`${this.baseURL}/stripe/payment-intent`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<PaymentIntentResponse>(response);
  }

  async getBillingHistory(): Promise<GetBillingHistoryResponse> {
    const response = await fetch(`${this.baseURL}/stripe/billing-history`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<GetBillingHistoryResponse>(response);
  }

  // Credit Pack Endpoints (one-time purchase)
  async getCreditPacks(): Promise<GetCreditPacksResponse> {
    const response = await fetch(`${this.baseURL}/stripe/credit-packs`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<GetCreditPacksResponse>(response);
  }

  async createCreditPackCheckout(
    packId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CreditPackCheckoutResponse> {
    const response = await fetch(
      `${this.baseURL}/stripe/credit-packs/checkout`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          pack_id: packId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      }
    );

    return this.handleResponse<CreditPackCheckoutResponse>(response);
  }

  // Email Quota Pack Endpoints (one-time purchase)
  async getEmailQuotaPacks(): Promise<GetEmailQuotaPacksResponse> {
    const response = await fetch(`${this.baseURL}/stripe/email-quota-packs`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<GetEmailQuotaPacksResponse>(response);
  }

  async createEmailQuotaPackCheckout(
    packId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<EmailQuotaPackCheckoutResponse> {
    const response = await fetch(
      `${this.baseURL}/stripe/email-quota-packs/checkout`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          pack_id: packId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      }
    );

    return this.handleResponse<EmailQuotaPackCheckoutResponse>(response);
  }

  // Resume Library Endpoints
  async getResumes(): Promise<Resume[]> {
    const response = await fetch(`${this.baseURL}/resumes`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetResumesResponse>(response);
    return data.resumes;
  }

  async getResume(id: string): Promise<Resume> {
    const response = await fetch(`${this.baseURL}/resumes/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetResumeResponse>(response);
    return data.resume;
  }

  async createResume(payload: CreateResumePayload): Promise<Resume> {
    const response = await fetch(`${this.baseURL}/resumes`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<CreateResumeResponse>(response);
    return {
      id: data.id,
      user_id: "",
      title: data.title,
      file_name: data.file_name,
      content: payload.content,
      version: data.version,
      status: "active",
      tailor_count: 0,
      is_default: payload.is_default || false,
      created_at: data.created_at,
      updated_at: data.created_at,
    };
  }

  async updateResume(id: string, payload: UpdateResumePayload): Promise<Resume> {
    const response = await fetch(`${this.baseURL}/resumes/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<UpdateResumeResponse>(response);
    // Return minimal resume data (backend would return full data)
    return {
      id: data.id,
      user_id: "",
      title: data.title,
      file_name: "",
      content: payload.content || "",
      version: data.version,
      status: payload.status || "active",
      tailor_count: 0,
      is_default: payload.is_default || false,
      created_at: "",
      updated_at: data.updated_at,
    };
  }

  async deleteResume(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/resumes/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    await this.handleResponse<DeleteResumeResponse>(response);
  }

  async setDefaultResume(id: string): Promise<Resume> {
    const response = await fetch(`${this.baseURL}/resumes/${id}/set-default`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    const dataResponse = await this.handleResponse<SetDefaultResumeResponse>(response);
    // Fetch the full resume data after setting default
    return this.getResume(id);
  }

  async duplicateResume(resumeId: string, newTitle: string): Promise<Resume> {
    const response = await fetch(`${this.baseURL}/resumes/${resumeId}/duplicate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ new_title: newTitle }),
    });

    const data = await this.handleResponse<DuplicateResumeResponse>(response);
    // Fetch the full resume data after duplication
    return this.getResume(data.id);
  }

  async uploadResume(payload: ResumeUploadPayload): Promise<ResumeUploadResponse> {
    const response = await fetch(`${this.baseURL}/resumes/upload`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ResumeUploadResponse>(response);
  }

  async uploadResumeFile(file: File): Promise<ResumeFileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseURL}/resumes/upload-file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    return this.handleResponse<ResumeFileUploadResponse>(response);
  }

  // Job Application Methods
  async getApplications(): Promise<JobApplication[]> {
    const response = await fetch(`${this.baseURL}/applications`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetApplicationsResponse>(response);
    return data.applications;
  }

  async getApplication(id: string): Promise<GetApplicationResponse> {
    const response = await fetch(`${this.baseURL}/applications/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetApplicationResponse>(response);
    return data;
  }

  async createApplication(payload: CreateApplicationPayload): Promise<JobApplication> {
    const response = await fetch(`${this.baseURL}/applications`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<CreateApplicationResponse>(response);
    // Return minimal application data (backend would return full data)
    return {
      id: data.id,
      user_id: "",
      job_title: data.job_title,
      company_name: data.company_name,
      status: data.status,
      follow_up_count: 0,
      created_at: data.created_at,
      updated_at: data.created_at,
    };
  }

  async updateApplication(id: string, payload: UpdateApplicationPayload): Promise<JobApplication> {
    const response = await fetch(`${this.baseURL}/applications/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    await this.handleResponse<UpdateApplicationResponse>(response);
    // Fetch the full application data after update and extract the application object
    const fullData = await this.getApplication(id);
    return fullData.application;
  }

  async deleteApplication(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/applications/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    await this.handleResponse<DeleteApplicationResponse>(response);
  }

  async addFollowUp(applicationId: string, payload: AddFollowUpPayload): Promise<FollowUp> {
    const response = await fetch(`${this.baseURL}/applications/${applicationId}/follow-ups`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<AddFollowUpResponse>(response);
    // Return minimal follow-up data (backend would return full data)
    return {
      id: data.id,
      application_id: data.application_id,
      follow_up_type: data.follow_up_type as any,
      note: payload.note,
      status: payload.status || "pending",
      created_at: data.created_at,
      reminders: [],
    };
  }

  async deleteFollowUp(applicationId: string, followUpId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/applications/${applicationId}/follow-ups/${followUpId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    await this.handleResponse(response);
  }

  // =========================================================================
  // Reminder Methods (Follow-Up Reminders — Pro/Premium only)
  // =========================================================================

  async getDueReminders(): Promise<DueRemindersResponse> {
    const response = await fetch(`${this.baseURL}/reminders/due`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<DueRemindersResponse>(response);
  }

  async getReminders(status?: string): Promise<RemindersListResponse> {
    const url = status
      ? `${this.baseURL}/reminders?status=${encodeURIComponent(status)}`
      : `${this.baseURL}/reminders`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<RemindersListResponse>(response);
  }

  async createReminder(payload: CreateReminderPayload): Promise<Reminder> {
    const response = await fetch(`${this.baseURL}/reminders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<Reminder>(response);
  }

  async dismissReminder(reminderId: string): Promise<Reminder> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}/dismiss`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse<Reminder>(response);
  }

  async snoozeReminder(reminderId: string, duration: SnoozeDuration): Promise<Reminder> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}/snooze`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ duration }),
    });
    return this.handleResponse<Reminder>(response);
  }

  async completeReminder(reminderId: string): Promise<Reminder> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}/complete`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse<Reminder>(response);
  }

  async deleteReminder(reminderId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  async updateReminder(reminderId: string, payload: UpdateReminderPayload): Promise<Reminder> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<Reminder>(response);
  }

  async getEmailQuota(): Promise<EmailQuotaResponse> {
    const response = await fetch(`${this.baseURL}/reminders/email-quota`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailQuotaResponse>(response);
  }

  // Analytics Methods
  async getAnalytics(): Promise<UserAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<AnalyticsResponse>(response);
    return data.analytics;
  }

  async getProgressSummary(weeks: number = 12): Promise<ProgressSummary> {
    const response = await fetch(`${this.baseURL}/analytics/progress?weeks=${weeks}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ success: boolean; progress: ProgressSummary }>(response);
    return data.progress;
  }

  // Contact Form (public - no auth required)
  async submitContactForm(payload: ContactFormPayload): Promise<ContactFormResponse> {
    const response = await fetch(`${this.baseURL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ContactFormResponse>(response);
  }

  // =========================================================================
  // TODO Methods (Pro/Premium only)
  // =========================================================================

  async getTodos(filters?: { status?: TodoStatus; category?: TodoCategory; priority?: TodoPriority }): Promise<TodoListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.priority) params.set("priority", filters.priority);
    const qs = params.toString();
    const url = qs ? `${this.baseURL}/todos?${qs}` : `${this.baseURL}/todos`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<TodoListResponse>(response);
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<TodoItem>(response);
  }

  async createTodo(payload: CreateTodoPayload): Promise<TodoItem> {
    const response = await fetch(`${this.baseURL}/todos`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<TodoItem>(response);
  }

  async updateTodo(todoId: string, payload: UpdateTodoPayload): Promise<TodoItem> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<TodoItem>(response);
  }

  async deleteTodo(todoId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  async addSubtask(todoId: string, title: string): Promise<TodoSubtask> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/subtasks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return this.handleResponse<TodoSubtask>(response);
  }

  async updateSubtask(todoId: string, subtaskId: string, data: Partial<TodoSubtask>): Promise<TodoSubtask> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<TodoSubtask>(response);
  }

  async deleteSubtask(todoId: string, subtaskId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/subtasks/${subtaskId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  async createTodoReminder(todoId: string, payload: CreateTodoReminderPayload): Promise<TodoReminder> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<TodoReminder>(response);
  }

  async updateTodoReminder(todoId: string, payload: Partial<CreateTodoReminderPayload>): Promise<TodoReminder> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<TodoReminder>(response);
  }

  async deleteTodoReminder(todoId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  async snoozeTodoReminder(todoId: string, duration: SnoozeDuration): Promise<TodoReminder> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder/snooze`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ duration }),
    });
    return this.handleResponse<TodoReminder>(response);
  }

  async dismissTodoReminder(todoId: string): Promise<TodoReminder> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder/dismiss`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse<TodoReminder>(response);
  }

  async completeTodoReminder(todoId: string): Promise<TodoReminder> {
    const response = await fetch(`${this.baseURL}/todos/${todoId}/reminder/complete`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse<TodoReminder>(response);
  }

  async getDueTodoReminders(): Promise<DueTodoRemindersResponse> {
    const response = await fetch(`${this.baseURL}/todos/due`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<DueTodoRemindersResponse>(response);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await fetch(`${this.baseURL}/admin/dashboard`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminDashboardData>(response);
  }

  async getAdminUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<AdminUserListResponse> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await fetch(`${this.baseURL}/admin/users${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminUserListResponse>(response);
  }

  async getAdminUserDetail(userId: string): Promise<{ success: boolean; user: AdminUserDetail }> {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; user: AdminUserDetail }>(response);
  }

  async suspendUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async unsuspendUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/users/${userId}/unsuspend`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async adjustCredits(userId: string, amount: number, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/credits/adjust`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ user_id: userId, amount, reason }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getRevenueSummary(): Promise<{ success: boolean; revenue: AdminRevenueSummary }> {
    const response = await fetch(`${this.baseURL}/admin/revenue/summary`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; revenue: AdminRevenueSummary }>(response);
  }

  async extendGracePeriod(subscriptionId: string, days: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/subscriptions/${subscriptionId}/extend-grace`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ days }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getAdminPlanConfig(): Promise<AdminPlanConfigResponse> {
    const response = await fetch(`${this.baseURL}/admin/plan-config`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminPlanConfigResponse>(response);
  }

  async upsertPlanOverride(planName: string, fieldName: string, fieldValue: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/admin/plan-config`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ plan_name: planName, field_name: fieldName, field_value: fieldValue }),
    });
    return this.handleResponse<{ success: boolean }>(response);
  }

  async deletePlanOverride(planName: string, fieldName: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/plan-config?plan_name=${encodeURIComponent(planName)}&field_name=${encodeURIComponent(fieldName)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Credit Pack Config (admin)
  async getAdminCreditPackConfig(): Promise<AdminCreditPackConfigResponse> {
    const response = await fetch(`${this.baseURL}/admin/credit-packs`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminCreditPackConfigResponse>(response);
  }

  async upsertCreditPackOverride(packId: string, fieldName: string, fieldValue: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/admin/credit-packs`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ pack_id: packId, field_name: fieldName, field_value: fieldValue }),
    });
    return this.handleResponse<{ success: boolean }>(response);
  }

  async deleteCreditPackOverride(packId: string, fieldName: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/admin/credit-packs?pack_id=${encodeURIComponent(packId)}&field_name=${encodeURIComponent(fieldName)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getAuditLogs(params?: {
    skip?: number;
    limit?: number;
    action?: string;
    admin_id?: string;
  }): Promise<AdminAuditLogResponse> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.action) query.set("action", params.action);
    if (params?.admin_id) query.set("admin_id", params.admin_id);
    const qs = query.toString();
    const response = await fetch(`${this.baseURL}/admin/audit-logs${qs ? `?${qs}` : ""}`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminAuditLogResponse>(response);
  }

  async exportUsers(): Promise<{ success: boolean; format: string; data: string }> {
    const response = await fetch(`${this.baseURL}/admin/export/users?format=csv`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; format: string; data: string }>(response);
  }

  // ── Observability Endpoints (Phase 7.2) ──────────────────────────────────

  async getSystemHealth(): Promise<SystemHealthData> {
    const response = await fetch(`${this.baseURL}/admin/observability/health`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<SystemHealthData>(response);
  }

  async getLatencyPercentiles(hours = 24): Promise<LatencyPercentilesData> {
    const response = await fetch(`${this.baseURL}/admin/observability/latency?hours=${hours}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<LatencyPercentilesData>(response);
  }

  async getLatencyTimeseries(hours = 24, bucketMinutes = 15): Promise<LatencyTimeseriesPoint[]> {
    const response = await fetch(`${this.baseURL}/admin/observability/latency/timeseries?hours=${hours}&bucket_minutes=${bucketMinutes}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<LatencyTimeseriesPoint[]>(response);
  }

  async getEndpointHeatmap(hours = 24, limit = 20): Promise<EndpointHeatmapItem[]> {
    const response = await fetch(`${this.baseURL}/admin/observability/endpoints?hours=${hours}&limit=${limit}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EndpointHeatmapItem[]>(response);
  }

  async getErrorBreakdown(hours = 24): Promise<ErrorBreakdownData> {
    const response = await fetch(`${this.baseURL}/admin/observability/errors?hours=${hours}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ErrorBreakdownData>(response);
  }

  async getEmailStats(days = 30): Promise<EmailStatsData> {
    const response = await fetch(`${this.baseURL}/admin/observability/emails?days=${days}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailStatsData>(response);
  }

  async getWebhookHealth(hours = 24): Promise<WebhookHealthData> {
    const response = await fetch(`${this.baseURL}/admin/observability/webhooks?hours=${hours}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<WebhookHealthData>(response);
  }

  async getAlertThresholds(): Promise<AlertThresholdData[]> {
    const response = await fetch(`${this.baseURL}/admin/observability/alerts`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AlertThresholdData[]>(response);
  }

  async upsertAlertThreshold(data: {
    metric_name: string;
    operator: string;
    threshold_value: number;
    severity?: string;
    enabled?: boolean;
    cooldown_minutes?: number;
    notify_email?: boolean;
  }): Promise<{ id: string; metric_name: string; status: string }> {
    const response = await fetch(`${this.baseURL}/admin/observability/alerts`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ id: string; metric_name: string; status: string }>(response);
  }

  async deleteAlertThreshold(thresholdId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/admin/observability/alerts/${thresholdId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(response);
  }

  async evaluateAlerts(): Promise<{ triggered: number; alerts: Array<{ metric_name: string; metric_value: number; threshold: string; severity: string; message: string }> }> {
    const response = await fetch(`${this.baseURL}/admin/observability/alerts/evaluate`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ triggered: number; alerts: Array<{ metric_name: string; metric_value: number; threshold: string; severity: string; message: string }> }>(response);
  }

  async getAlertHistory(limit = 50, severity?: string): Promise<AlertHistoryItem[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (severity) params.set("severity", severity);
    const response = await fetch(`${this.baseURL}/admin/observability/alerts/history?${params}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AlertHistoryItem[]>(response);
  }

  async acknowledgeAlert(alertId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/admin/observability/alerts/history/${alertId}/acknowledge`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(response);
  }

  // ── Phase 7.3: Advanced Admin ────────────────────────────────────────────

  async getRevenueDetailed(days = 90): Promise<AdminRevenueDetailed> {
    const response = await fetch(`${this.baseURL}/admin/revenue/detailed?days=${days}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    const json = await this.handleResponse<{ success: boolean; revenue: AdminRevenueDetailed }>(response);
    return json.revenue;
  }

  async getAICosts(days = 30, startDate?: string, endDate?: string): Promise<AdminAICostSummary> {
    const params = new URLSearchParams({ days: String(days) });
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    const response = await fetch(`${this.baseURL}/admin/ai-costs?${params}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    const json = await this.handleResponse<{ success: boolean; costs: AdminAICostSummary }>(response);
    return json.costs;
  }

  async getFeatureFlags(): Promise<AdminFeatureFlag[]> {
    const response = await fetch(`${this.baseURL}/admin/feature-flags`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    const json = await this.handleResponse<{ success: boolean; flags: AdminFeatureFlag[] }>(response);
    return json.flags;
  }

  async createFeatureFlag(data: AdminFeatureFlagCreateRequest): Promise<AdminFeatureFlag> {
    const response = await fetch(`${this.baseURL}/admin/feature-flags`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await this.handleResponse<{ success: boolean; flag: AdminFeatureFlag }>(response);
    return json.flag;
  }

  async updateFeatureFlag(flagId: string, data: AdminFeatureFlagUpdateRequest): Promise<AdminFeatureFlag> {
    const response = await fetch(`${this.baseURL}/admin/feature-flags/${flagId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await this.handleResponse<{ success: boolean; flag: AdminFeatureFlag }>(response);
    return json.flag;
  }

  async deleteFeatureFlag(flagId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/admin/feature-flags/${flagId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(response);
  }

  async getSupportTickets(
    skip = 0,
    limit = 50,
    status?: string,
    search?: string,
  ): Promise<AdminSupportTicketListResponse> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const response = await fetch(`${this.baseURL}/admin/support/tickets?${params}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdminSupportTicketListResponse>(response);
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<AdminSupportTicket> {
    const response = await fetch(`${this.baseURL}/admin/support/tickets/${ticketId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await this.handleResponse<{ success: boolean; ticket: AdminSupportTicket }>(response);
    return json.ticket;
  }

  // ============================================================================
  // MOCK INTERVIEW ENDPOINTS (Phase 8)
  // ============================================================================

  async getInterviewAccess(): Promise<InterviewAccessResponse> {
    const response = await fetch(`${this.baseURL}/interviews/access`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<InterviewAccessResponse>(response);
  }

  async startInterview(payload: InterviewStartPayload): Promise<InterviewStartResponse> {
    const response = await fetch(`${this.baseURL}/interviews/start`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<InterviewStartResponse>(response);
  }

  async respondToInterview(sessionId: string, answer: string): Promise<InterviewRespondResponse> {
    const response = await fetch(`${this.baseURL}/interviews/${sessionId}/respond`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ answer }),
    });
    return this.handleResponse<InterviewRespondResponse>(response);
  }

  async endInterview(sessionId: string): Promise<InterviewEndResponse> {
    const response = await fetch(`${this.baseURL}/interviews/${sessionId}/end`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<InterviewEndResponse>(response);
  }

  async getInterviewSession(sessionId: string): Promise<InterviewSessionOut> {
    const response = await fetch(`${this.baseURL}/interviews/${sessionId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<InterviewSessionOut>(response);
  }

  async getInterviewSessions(skip = 0, limit = 20): Promise<InterviewSessionSummary[]> {
    const response = await fetch(`${this.baseURL}/interviews?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<InterviewSessionSummary[]>(response);
  }

  async deleteInterviewSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/interviews/${sessionId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  // ============================================================================
  // JOB BOARD SEARCH ENDPOINTS
  // ============================================================================

  async searchJobs(payload: JobSearchRequest): Promise<JobSearchResponse> {
    const response = await fetch(`${this.baseURL}/jobs/search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<JobSearchResponse>(response);
  }

  async getSavedSearches(): Promise<SavedJobSearchListResponse> {
    const response = await fetch(`${this.baseURL}/jobs/search/saved`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<SavedJobSearchListResponse>(response);
  }

  async saveJobSearch(payload: SaveJobSearchRequest): Promise<{ id: string; message: string }> {
    const response = await fetch(`${this.baseURL}/jobs/search/save`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ id: string; message: string }>(response);
  }

  async deleteSavedSearch(searchId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/jobs/search/saved/${searchId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async saveJobAsApplication(payload: SaveJobAsApplicationRequest): Promise<{ application_id: string; message: string }> {
    const response = await fetch(`${this.baseURL}/jobs/search/save-application`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ application_id: string; message: string }>(response);
  }

  // ============================================================================
  // EMAIL OAUTH ENDPOINTS (Phase 4)
  // ============================================================================

  async authorizeEmailOAuth(provider: EmailOAuthProvider): Promise<EmailOAuthAuthorizeResponse> {
    const response = await fetch(`${this.baseURL}/email/oauth/authorize/${provider}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailOAuthAuthorizeResponse>(response);
  }

  async handleGoogleOAuthCallback(code: string, state: string): Promise<EmailOAuthCallbackResponse> {
    const response = await fetch(`${this.baseURL}/email/oauth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailOAuthCallbackResponse>(response);
  }

  async handleOutlookOAuthCallback(code: string, state: string): Promise<EmailOAuthCallbackResponse> {
    const response = await fetch(`${this.baseURL}/email/oauth/outlook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailOAuthCallbackResponse>(response);
  }

  async getConnectedEmailProviders(): Promise<ConnectedProvidersResponse> {
    const response = await fetch(`${this.baseURL}/email/connected-providers`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ConnectedProvidersResponse>(response);
  }

  async disconnectEmailProvider(provider: EmailOAuthProvider): Promise<DisconnectProviderResponse> {
    const response = await fetch(`${this.baseURL}/email/disconnect/${provider}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<DisconnectProviderResponse>(response);
  }

  async getEmailDraft(applicationId: string): Promise<EmailDraftResponse> {
    const response = await fetch(`${this.baseURL}/email/applications/${applicationId}/draft`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<EmailDraftResponse>(response);
  }

  async sendApplicationEmail(applicationId: string, payload: SendApplicationEmailPayload): Promise<SendApplicationEmailResponse> {
    const response = await fetch(`${this.baseURL}/email/applications/${applicationId}/send`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<SendApplicationEmailResponse>(response);
  }

  async tailorApply(payload: TailorApplyPayload): Promise<TailorApplyResponse> {
    const response = await fetch(`${this.baseURL}/email/tailor-apply`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<TailorApplyResponse>(response);
  }

  async generateApplyBody(payload: GenerateApplyBodyPayload): Promise<GenerateApplyBodyResponse> {
    const response = await fetch(`${this.baseURL}/email/generate-apply-body`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<GenerateApplyBodyResponse>(response);
  }

  // Activity Feed
  async getRecentActivity(limit: number = 10): Promise<RecentActivityResponse> {
    const response = await fetch(`${this.baseURL}/activity/recent?limit=${limit}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<RecentActivityResponse>(response);
  }

  // AI Career Coach (Chat)
  async sendChatMessage(message: string, conversationId?: string): Promise<ChatSendResponse> {
    const body: Record<string, string> = { message };
    if (conversationId) body.conversation_id = conversationId;
    const response = await fetch(`${this.baseURL}/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<ChatSendResponse>(response);
  }

  async getChatConversations(limit = 20, offset = 0): Promise<ChatConversationListResponse> {
    const response = await fetch(`${this.baseURL}/chat/conversations?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ChatConversationListResponse>(response);
  }

  async getChatConversationDetail(conversationId: string): Promise<ChatConversationDetail> {
    const response = await fetch(`${this.baseURL}/chat/conversations/${encodeURIComponent(conversationId)}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ChatConversationDetail>(response);
  }

  async deleteChatConversation(conversationId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/chat/conversations/${encodeURIComponent(conversationId)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string }>(response);
  }

  async getChatAccess(): Promise<ChatAccessResponse> {
    const response = await fetch(`${this.baseURL}/chat/access`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ChatAccessResponse>(response);
  }

  // ── Referrals ─────────────────────────────────────────────────

  async getReferralStats(): Promise<ReferralStatsOut> {
    const response = await fetch(`${this.baseURL}/referrals/stats`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ReferralStatsOut>(response);
  }

  async getReferralList(): Promise<ReferralListResponse> {
    const response = await fetch(`${this.baseURL}/referrals/list`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ReferralListResponse>(response);
  }

  // ── Resume Templates ────────────────────────────────────────

  async getResumeTemplates(): Promise<ResumeTemplateListResponse> {
    const response = await fetch(`${this.baseURL}/resumes/templates`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<ResumeTemplateListResponse>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
