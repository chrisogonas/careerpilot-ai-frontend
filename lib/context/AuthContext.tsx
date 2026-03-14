"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthContextType, AuthResponse, Subscription, Plan, Resume, JobApplication } from "@/lib/types";
import { apiClient } from "@/lib/utils/api";
import { useInactivityTimeout } from "@/lib/hooks/useInactivityTimeout";
import { useSubscriptionApi } from "@/lib/hooks/useSubscription";
import { useResumesApi } from "@/lib/hooks/useResumes";
import { useApplicationsApi } from "@/lib/hooks/useApplications";
import { useRemindersApi } from "@/lib/hooks/useReminders";
import { useTodosApi } from "@/lib/hooks/useTodos";
import { useAnalyticsApi } from "@/lib/hooks/useAnalytics";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert AuthResponse to User
function authResponseToUser(response: AuthResponse): User {
  return {
    id: response.user_id,
    email: response.email,
    full_name: response.full_name,
    is_verified: "verified",
    is_admin: response.is_admin ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ─── Core Auth State ───
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<AuthResponse | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [tempVerificationEmail, setTempVerificationEmail] = useState<string | null>(null);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  // ─── Shared Domain State (used by global components) ───
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // ─── Domain Hooks ───
  const subscriptionApi = useSubscriptionApi();
  const resumesApi = useResumesApi(setResumes);
  const applicationsApi = useApplicationsApi(setApplications);
  const remindersApi = useRemindersApi();
  const todosApi = useTodosApi();
  const analyticsApi = useAnalyticsApi();

  // --- Inactivity auto-logout (30 min) ---
  const handleInactivityLogout = useCallback(async () => {
    setInactivityWarning(false);
    try {
      await apiClient.logout();
    } catch {
      // best-effort
    }
    setUser(null);
    localStorage.removeItem("careerpilot_token");
    localStorage.removeItem("careerpilot_refresh_token");
    // Redirect to login with a message
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login?reason=inactivity";
    }
  }, []);

  const handleInactivityWarning = useCallback(() => {
    setInactivityWarning(true);
  }, []);

  const handleActivity = useCallback(() => {
    if (inactivityWarning) setInactivityWarning(false);
  }, [inactivityWarning]);

  useInactivityTimeout({
    onTimeout: handleInactivityLogout,
    onWarning: handleInactivityWarning,
    onActivity: handleActivity,
    enabled: !!user,
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("careerpilot_token");
        if (token) {
          // First, try to validate the current access token via /auth/profile
          try {
            const profile = await apiClient.getMe();
            setUser({
              id: profile.user_id,
              email: profile.email,
              full_name: profile.full_name,
              is_verified: "verified",
              is_admin: profile.is_admin ?? false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch {
            // Access token expired/invalid — try refreshing with refresh token
            try {
              const response = await apiClient.refreshToken();
              setUser(authResponseToUser(response));
            } catch {
              // Both tokens invalid — clear everything and force re-login
              localStorage.removeItem("careerpilot_token");
              localStorage.removeItem("careerpilot_refresh_token");
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }

      // Load subscription data silently so global components (e.g. ReminderBanner)
      // have isPaidPlan available immediately, without waiting for a specific page
      // to call getSubscription(). Fire-and-forget — failures are fine.
      if (localStorage.getItem("careerpilot_token")) {
        apiClient.getSubscription().then(data => {
          setSubscription(data.subscription);
          setCurrentPlan(data.current_plan);
        }).catch(() => {});
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

  const register = async (email: string, password: string, full_name: string, referral_code?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.register(email, password, full_name, referral_code);
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

  const resendVerificationEmail = async (email?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const emailToUse = email || tempVerificationEmail;
      if (!emailToUse) {
        throw new Error("No email address available for verification");
      }
      await apiClient.resendVerificationEmail({ email: emailToUse });
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

  // ─── Subscription/Billing (delegates to useSubscriptionApi) ───
  const getSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await subscriptionApi.getSubscription();
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
      return await subscriptionApi.getPlans();
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
      return await subscriptionApi.createCheckoutSession(priceId, successUrl, cancelUrl);
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
      await subscriptionApi.updateSubscription(subscription?.id || "", newPlan, billingCycle);
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
      await subscriptionApi.cancelSubscription(subscription?.id, atPeriodEnd);
      await getSubscription();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBillingHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await subscriptionApi.getBillingHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch billing history";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await subscriptionApi.getCreditPacks();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch credit packs";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCreditPackCheckout = async (
    packId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      return await subscriptionApi.createCreditPackCheckout(packId, successUrl, cancelUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create credit pack checkout";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resume Management (delegates to useResumesApi) ───
  const getResumes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.getResumes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch resumes";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getResume = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.getResume(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createResume = async (payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.createResume(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateResume = async (id: string, payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.updateResume(id, payload);
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
      await resumesApi.deleteResume(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultResume = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.setDefaultResume(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set default resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateResume = async (resumeId: string, newTitle: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.duplicateResume(resumeId, newTitle);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to duplicate resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.uploadResume(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResumeFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resumesApi.uploadResumeFile(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume file";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Job Applications (delegates to useApplicationsApi) ───
  const getApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsApi.getApplications();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch applications";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getApplication = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsApi.getApplication(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async (payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsApi.createApplication(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplication = async (id: string, payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsApi.updateApplication(id, payload);
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
      await applicationsApi.deleteApplication(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete application";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addFollowUp = async (applicationId: string, payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsApi.addFollowUp(applicationId, payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add follow-up";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFollowUp = async (applicationId: string, followUpId: string) => {
    try {
      await applicationsApi.deleteFollowUp(applicationId, followUpId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete follow-up";
      setError(message);
      throw err;
    }
  };

  // ─── Reminders (delegates to useRemindersApi) ───
  const {
    getDueReminders,
    getReminders,
    createReminder,
    dismissReminder,
    snoozeReminder,
    completeReminder,
    deleteReminder,
    updateReminder,
    getEmailQuota,
  } = remindersApi;

  // ─── Analytics (delegates to useAnalyticsApi) ───
  const getAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await analyticsApi.getAnalytics();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Todos (delegates to useTodosApi) ───
  const {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    createTodoReminder,
    updateTodoReminder,
    deleteTodoReminder,
    snoozeTodoReminder,
    dismissTodoReminder,
    completeTodoReminder,
    getDueTodoReminders,
  } = todosApi;

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.logout();
    } catch {
      // best-effort — always clear local state even if API call fails
    }
    setUser(null);
    localStorage.removeItem("careerpilot_token");
    localStorage.removeItem("careerpilot_refresh_token");
    setIsLoading(false);
    // Redirect to landing page
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      setUser(authResponseToUser(response));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("careerpilot_token");
      localStorage.removeItem("careerpilot_refresh_token");
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
    getCreditPacks,
    createCreditPackCheckout,
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
    deleteFollowUp,
    getDueReminders,
    getReminders,
    createReminder,
    dismissReminder,
    snoozeReminder,
    completeReminder,
    deleteReminder,
    updateReminder,
    getEmailQuota,
    getAnalytics,
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    createTodoReminder,
    updateTodoReminder,
    deleteTodoReminder,
    snoozeTodoReminder,
    dismissTodoReminder,
    completeTodoReminder,
    getDueTodoReminders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Inactivity warning toast */}
      {inactivityWarning && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm animate-bounce">
          <div className="bg-amber-50 border border-amber-300 shadow-lg rounded-lg p-4">
            <p className="text-amber-900 font-semibold">Session expiring soon</p>
            <p className="text-amber-700 text-sm mt-1">
              You will be logged out in 2 minutes due to inactivity. Move your
              mouse or press any key to stay logged in.
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
