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
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const JWT_STORAGE_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "careerpilot_token";

class ApiClient {
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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "An error occurred");
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
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
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
    const response = await fetch(`${this.baseURL}/auth/request-password-reset`, {
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

  // Job Application Methods
  async getApplications(): Promise<JobApplication[]> {
    const response = await fetch(`${this.baseURL}/applications`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetApplicationsResponse>(response);
    return data.applications;
  }

  async getApplication(id: string): Promise<JobApplication> {
    const response = await fetch(`${this.baseURL}/applications/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<GetApplicationResponse>(response);
    return data.application;
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

    const data = await this.handleResponse<UpdateApplicationResponse>(response);
    // Fetch the full application data after update
    return this.getApplication(id);
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
}

export const apiClient = new ApiClient(API_BASE_URL);
