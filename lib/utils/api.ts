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
  Reminder,
  DueRemindersResponse,
  RemindersListResponse,
  SnoozeDuration,
  EmailQuotaResponse,
  UserAnalytics,
  AnalyticsResponse,
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
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
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
    async exportResumePDF(payload: { resume_text: string; title: string }): Promise<Blob> {
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
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, full_name }),
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

  async resendVerificationEmail(): Promise<ResendVerificationEmailResponse> {
    const response = await fetch(`${this.baseURL}/auth/resend-verification-email`, {
      method: "POST",
      headers: this.getHeaders(),
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
}

export const apiClient = new ApiClient(API_BASE_URL);
