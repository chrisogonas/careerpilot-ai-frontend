"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType, AuthResponse, Subscription, Plan, BillingEvent, Resume, CreateResumePayload, UpdateResumePayload, ResumeUploadPayload, ResumeUploadResponse, ResumeFileUploadResponse, ParsedResumeData, JobApplication, CreateApplicationPayload, UpdateApplicationPayload, AddFollowUpPayload, FollowUp, UserAnalytics } from "@/lib/types";
import { apiClient } from "@/lib/utils/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert AuthResponse to User
function authResponseToUser(response: AuthResponse): User {
  return {
    id: response.user_id,
    email: response.email,
    full_name: response.full_name,
    is_verified: "verified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<AuthResponse | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [tempVerificationEmail, setTempVerificationEmail] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("careerpilot_token");
        if (token) {
          // Verify token is still valid by trying to refresh
          try {
            const response = await apiClient.refreshToken();
            setUser(authResponseToUser(response));
          } catch (err) {
            // Token is invalid, clear it
            localStorage.removeItem("careerpilot_token");
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      
      // If 2FA is required, store auth data temporarily and wait for 2FA verification
      if (response.requires_2fa) {
        setRequiresTwoFA(true);
        setTempAuthData(response);
      } else {
        // 2FA not enabled, log in directly
        setUser(authResponseToUser(response));
        setRequiresTwoFA(false);
        setTempAuthData(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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

  const verifyTwoFA = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!tempAuthData) {
        throw new Error("No pending 2FA verification");
      }

      const response = await apiClient.verifyTwoFALogin({
        user_id: tempAuthData.user_id,
        code,
      });

      setUser(authResponseToUser(response));
      setRequiresTwoFA(false);
      setTempAuthData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "2FA verification failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.verifyEmail({ token });
      if (response.verified) {
        setIsEmailVerified(true);
        setPendingEmailVerification(false);
        setTempVerificationEmail(null);
        // If we have auth data waiting (from registration), log in the user
        if (response.user_id && response.email) {
          setUser({
            id: response.user_id,
            email: response.email,
            full_name: "", // Will be fetched from backend if needed
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

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!tempVerificationEmail) {
        throw new Error("No email address available for verification");
      }
      await apiClient.resendVerificationEmail();
      // Verification email sent successfully
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.requestPasswordReset({ email });
      // Password reset email sent successfully
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.resetPassword({
        token,
        new_password: newPassword,
      });
      // Password successfully reset
      // User needs to log in again with new password
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password reset failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSubscription();
      setSubscription(data.subscription);
      setCurrentPlan(data.current_plan);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlans = async (): Promise<Plan[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiClient.getPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch plans";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.createCheckoutSession({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return response.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create checkout session";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (
    newPlan: "free" | "pro" | "premium",
    billingCycle?: "monthly" | "yearly"
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.updateSubscription({
        subscription_id: subscription?.id || "",
        new_plan: newPlan,
        billing_cycle: billingCycle,
      });
      // Refresh subscription data
      await getSubscription();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update subscription";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (atPeriodEnd: boolean = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.cancelSubscription({
        subscription_id: subscription?.id,
        at_period_end: atPeriodEnd,
      });
      // Refresh subscription data
      await getSubscription();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBillingHistory = async (): Promise<BillingEvent[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBillingHistory();
      return response.events;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch billing history";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getResumes = async (): Promise<Resume[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedResumes = await apiClient.getResumes();
      setResumes(fetchedResumes);
      return fetchedResumes;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch resumes";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getResume = async (id: string): Promise<Resume> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiClient.getResume(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createResume = async (payload: CreateResumePayload): Promise<Resume> => {
    setIsLoading(true);
    setError(null);
    try {
      const newResume = await apiClient.createResume(payload);
      setResumes([...resumes, newResume]);
      return newResume;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateResume = async (id: string, payload: UpdateResumePayload): Promise<Resume> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedResume = await apiClient.updateResume(id, payload);
      setResumes(resumes.map(r => r.id === id ? updatedResume : r));
      return updatedResume;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultResume = async (id: string): Promise<Resume> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedResume = await apiClient.setDefaultResume(id);
      setResumes(resumes.map(r => ({ ...r, is_default: r.id === id })));
      return updatedResume;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set default resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateResume = async (resumeId: string, newTitle: string): Promise<Resume> => {
    setIsLoading(true);
    setError(null);
    try {
      const duplicatedResume = await apiClient.duplicateResume(resumeId, newTitle);
      setResumes([...resumes, duplicatedResume]);
      return duplicatedResume;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to duplicate resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (payload: ResumeUploadPayload): Promise<ResumeUploadResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.uploadResume(payload);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResumeFile = async (file: File): Promise<ResumeFileUploadResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.uploadResumeFile(file);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume file";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Job Application Methods
  const getApplications = async (): Promise<JobApplication[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getApplications();
      setApplications(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch applications";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getApplication = async (id: string): Promise<JobApplication> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getApplication(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async (payload: CreateApplicationPayload): Promise<JobApplication> => {
    setIsLoading(true);
    setError(null);
    try {
      const newApplication = await apiClient.createApplication(payload);
      setApplications([...applications, newApplication]);
      return newApplication;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplication = async (id: string, payload: UpdateApplicationPayload): Promise<JobApplication> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedApplication = await apiClient.updateApplication(id, payload);
      setApplications(applications.map(a => a.id === id ? updatedApplication : a));
      return updatedApplication;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApplication = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.deleteApplication(id);
      setApplications(applications.filter(a => a.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addFollowUp = async (applicationId: string, payload: AddFollowUpPayload): Promise<FollowUp> => {
    setIsLoading(true);
    setError(null);
    try {
      const followUp = await apiClient.addFollowUp(applicationId, payload);
      // Update the application's follow_up_count
      setApplications(applications.map(a => 
        a.id === applicationId 
          ? { ...a, follow_up_count: a.follow_up_count + 1, last_follow_up_at: new Date().toISOString() }
          : a
      ));
      return followUp;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add follow-up";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics Methods
  const getAnalytics = async (): Promise<UserAnalytics> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAnalytics();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      setUser(authResponseToUser(response));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("careerpilot_token");
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    requiresTwoFA,
    isEmailVerified,
    pendingEmailVerification,
    subscription,
    currentPlan,
    login,
    register,
    logout,
    refreshToken,
    verifyTwoFA,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    getSubscription,
    getPlans,
    createCheckoutSession,
    updateSubscription,
    cancelSubscription,
    getBillingHistory,
    getResumes,
    getResume,
    createResume,
    updateResume,
    deleteResume,
    setDefaultResume,
    duplicateResume,
    uploadResume,
    uploadResumeFile,
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    addFollowUp,
    getAnalytics,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
