"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { JobApplication, FollowUp, UpdateApplicationPayload, AddFollowUpPayload, JobApplicationStatus, Resume, ReminderType, RecurrenceInterval, CreateReminderPayload, UpdateReminderPayload, Reminder, EmailQuotaResponse, ReminderTimingMode, ReminderBeforeUnit } from "@/lib/types";
import ApplicationEmailModal from "@/app/components/email/ApplicationEmailModal";

function ApplicationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const { isAuthenticated, isLoading: authLoading, user, getApplication, updateApplication, addFollowUp, deleteFollowUp, getResumes, createReminder, updateReminder, deleteReminder, getEmailQuota, getSubscription, subscription, currentPlan } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local loading states to avoid sharing AuthContext's global isLoading
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingFollowUp, setAddingFollowUp] = useState(false);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);

  const [editData, setEditData] = useState<UpdateApplicationPayload>({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState<"apply" | "forward">("apply");
  const [followUpData, setFollowUpData] = useState<AddFollowUpPayload>({
    follow_up_type: "email",
    note: "",
    status: "pending",
  });

  // Reminder fields (separate from follow-up payload — layered on after follow-up created)
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType>("once");
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>("weekly");
  const [recurrenceEndMode, setRecurrenceEndMode] = useState<"never" | "count" | "date">("never");
  const [recurrenceCount, setRecurrenceCount] = useState(5);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  // Email reminder fields
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(false);
  const [emailQuota, setEmailQuota] = useState<EmailQuotaResponse | null>(null);
  const [emailQuotaError, setEmailQuotaError] = useState<string | null>(null);

  // In-app reminder timing
  const [reminderTimingMode, setReminderTimingMode] = useState<ReminderTimingMode>("at_event");
  const [reminderBeforeAmount, setReminderBeforeAmount] = useState(1);
  const [reminderBeforeUnit, setReminderBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [customReminderDate, setCustomReminderDate] = useState("");

  // Email reminder timing
  const [emailTimingMode, setEmailTimingMode] = useState<ReminderTimingMode>("at_event");
  const [emailBeforeAmount, setEmailBeforeAmount] = useState(1);
  const [emailBeforeUnit, setEmailBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [customEmailDate, setCustomEmailDate] = useState("");

  const isPaidPlan = subscription && currentPlan && currentPlan.name !== "free" && ["active", "trialing"].includes(subscription.status);

  // Reminder management on existing follow-ups
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [addingReminderToFollowUpId, setAddingReminderToFollowUpId] = useState<string | null>(null);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [editReminderData, setEditReminderData] = useState<UpdateReminderPayload>({});
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderType, setNewReminderType] = useState<ReminderType>("once");
  const [newRecurrenceInterval, setNewRecurrenceInterval] = useState<RecurrenceInterval>("weekly");
  const [newEmailEnabled, setNewEmailEnabled] = useState(false);

  // Edit-reminder timing & recurrence state (mirrors creation form)
  const [editBaseDate, setEditBaseDate] = useState("");
  const [editTimingMode, setEditTimingMode] = useState<ReminderTimingMode>("at_event");
  const [editBeforeAmount, setEditBeforeAmount] = useState(1);
  const [editBeforeUnit, setEditBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [editCustomDate, setEditCustomDate] = useState("");
  const [editRecurrenceEndMode, setEditRecurrenceEndMode] = useState<"never" | "count" | "date">("never");
  const [editRecurrenceCount, setEditRecurrenceCount] = useState(5);
  const [editRecurrenceEndDate, setEditRecurrenceEndDate] = useState("");
  const [editEmailTimingMode, setEditEmailTimingMode] = useState<ReminderTimingMode>("at_event");
  const [editEmailBeforeAmount, setEditEmailBeforeAmount] = useState(1);
  const [editEmailBeforeUnit, setEditEmailBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [editCustomEmailDate, setEditCustomEmailDate] = useState("");

  // Add-reminder timing & recurrence state (mirrors creation form)
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newTimingMode, setNewTimingMode] = useState<ReminderTimingMode>("at_event");
  const [newBeforeAmount, setNewBeforeAmount] = useState(1);
  const [newBeforeUnit, setNewBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [newCustomDate, setNewCustomDate] = useState("");
  const [newRecurrenceEndMode, setNewRecurrenceEndMode] = useState<"never" | "count" | "date">("never");
  const [newRecurrenceCount, setNewRecurrenceCount] = useState(5);
  const [newRecurrenceEndDate, setNewRecurrenceEndDate] = useState("");
  const [newEmailTimingMode, setNewEmailTimingMode] = useState<ReminderTimingMode>("at_event");
  const [newEmailBeforeAmount, setNewEmailBeforeAmount] = useState(1);
  const [newEmailBeforeUnit, setNewEmailBeforeUnit] = useState<ReminderBeforeUnit>("days");
  const [newCustomEmailDate, setNewCustomEmailDate] = useState("");

  // Ref for scrolling to the follow-up form from the Actions card
  const followUpSectionRef = useRef<HTMLDivElement>(null);

  // Use a ref for getApplication to avoid it being a useEffect dependency
  const getApplicationRef = useRef(getApplication);
  getApplicationRef.current = getApplication;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Only fetch once — prevent re-fetching on every context re-render
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadApplication = async () => {
      try {
        setLocalError(null);
        setPageLoading(true);
        const data = await getApplicationRef.current(applicationId);
        setApplication(data.application);
        setFollowUps(data.follow_ups || []);
        setEditData({});
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load application";
        setLocalError(message);
      } finally {
        setPageLoading(false);
      }
    };

    loadApplication();
  }, [isAuthenticated, authLoading, router, applicationId]);

  // Fetch saved resumes for the resume selector
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    const fetchResumes = async () => {
      try {
        const resumes = await getResumes();
        setSavedResumes(resumes);
      } catch {
        // Non-critical: resumes load lazily for the edit form
      }
    };
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Fetch subscription data so we know the current plan
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (!subscription) {
      getSubscription().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, subscription]);

  // Fetch email-reminder quota for paid plans
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isPaidPlan) return;
    const fetchQuota = async () => {
      try {
        const quota = await getEmailQuota();
        setEmailQuota(quota);
        setEmailQuotaError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setEmailQuotaError(msg);
      }
    };
    fetchQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, isPaidPlan]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setLocalError(null);
    setSaving(true);

    try {
      // Only include resume_id if user explicitly changed the dropdown
      const payload = { ...editData };
      if (payload.resume_id === "__unchanged__" || payload.resume_id === undefined) {
        delete payload.resume_id;
      }
      const updated = await updateApplication(applicationId, payload);
      setApplication(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes";
      setLocalError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFollowUpData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /** Compute a reminder date from event date + timing options */
  const computeDate = (eventDate: string, mode: ReminderTimingMode, amount: number, unit: ReminderBeforeUnit, custom: string): string => {
    if (mode === "custom" && custom) return new Date(custom).toISOString();
    if (mode === "before_event" && eventDate) {
      const ms: Record<ReminderBeforeUnit, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
      return new Date(new Date(eventDate).getTime() - amount * ms[unit]).toISOString();
    }
    return new Date(eventDate).toISOString();
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!followUpData.note.trim()) {
      setLocalError("Follow-up note is required");
      return;
    }

    // Include scheduled_date if reminder is enabled
    const payload: AddFollowUpPayload = {
      ...followUpData,
      ...(reminderEnabled && reminderDate ? { scheduled_date: new Date(reminderDate).toISOString() } : {}),
    };

    setAddingFollowUp(true);
    try {
      const newFollowUp = await addFollowUp(applicationId, payload);

      // Create reminder if enabled and user is on a paid plan
      if (reminderEnabled && reminderDate && isPaidPlan) {
        try {
          const computedReminderDate = computeDate(reminderDate, reminderTimingMode, reminderBeforeAmount, reminderBeforeUnit, customReminderDate);
          const computedEmailDate = emailTimingMode === "at_event"
            ? computedReminderDate
            : computeDate(reminderDate, emailTimingMode, emailBeforeAmount, emailBeforeUnit, customEmailDate);
          const reminderPayload: CreateReminderPayload = {
            follow_up_id: newFollowUp.id,
            reminder_date: computedReminderDate,
            reminder_type: reminderType,
            ...(reminderType === "recurring" ? { recurrence_interval: recurrenceInterval } : {}),
            ...(reminderType === "recurring" && recurrenceEndMode === "count" ? { recurrence_count: recurrenceCount } : {}),
            ...(reminderType === "recurring" && recurrenceEndMode === "date" && recurrenceEndDate ? { recurrence_end_date: new Date(recurrenceEndDate).toISOString() } : {}),
            ...(emailReminderEnabled ? { email_enabled: true, email_reminder_date: computedEmailDate } : {}),
          };
          const createdReminder = await createReminder(reminderPayload);
          newFollowUp.reminders = [createdReminder];
          // Refresh email quota after creating an email reminder
          if (emailReminderEnabled) {
            try {
              const updatedQuota = await getEmailQuota();
              setEmailQuota(updatedQuota);
            } catch { /* ignore */ }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Failed to create reminder";
          console.error("Failed to create reminder (follow-up was saved):", errMsg);
          // Show a non-blocking warning — follow-up was already created
          setLocalError(`Follow-up saved, but reminder failed: ${errMsg}`);
        }
      }

      setFollowUps([newFollowUp, ...followUps]);
      setFollowUpData({
        follow_up_type: "email",
        note: "",
        status: "pending",
      });
      setReminderEnabled(false);
      setEmailReminderEnabled(false);
      setReminderDate("");
      setReminderType("once");
      setRecurrenceInterval("weekly");
      setRecurrenceEndMode("never");
      setRecurrenceCount(5);
      setRecurrenceEndDate("");
      setReminderTimingMode("at_event");
      setReminderBeforeAmount(1);
      setReminderBeforeUnit("days");
      setCustomReminderDate("");
      setEmailTimingMode("at_event");
      setEmailBeforeAmount(1);
      setEmailBeforeUnit("days");
      setCustomEmailDate("");
      setIsAddingFollowUp(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add follow-up";
      setLocalError(message);
    } finally {
      setAddingFollowUp(false);
    }
  };

  const handleDeleteFollowUp = async (followUpId: string) => {
    if (!confirm("Are you sure you want to delete this follow-up?")) return;
    setLocalError(null);
    setDeletingFollowUpId(followUpId);

    try {
      await deleteFollowUp(applicationId, followUpId);
      setFollowUps(followUps.filter(fu => fu.id !== followUpId));
      if (application) {
        setApplication({
          ...application,
          follow_up_count: Math.max(0, application.follow_up_count - 1),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete follow-up";
      setLocalError(message);
    } finally {
      setDeletingFollowUpId(null);
    }
  };

  // --- Reminder management handlers ---
  const handleDeleteReminder = async (reminderId: string, followUpId: string) => {
    if (!confirm("Delete this reminder?")) return;
    setLocalError(null);
    setReminderSaving(true);
    try {
      await deleteReminder(reminderId);
      setFollowUps(prev => prev.map(fu =>
        fu.id === followUpId ? { ...fu, reminders: fu.reminders.filter(r => r.id !== reminderId) } : fu
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete reminder";
      setLocalError(message);
    } finally {
      setReminderSaving(false);
    }
  };

  const handleStartEditReminder = (reminder: Reminder) => {
    setEditingReminderId(reminder.id);
    setEditReminderData({
      title: reminder.title,
      reminder_date: reminder.reminder_date,
      reminder_type: reminder.reminder_type,
      recurrence_interval: reminder.recurrence_interval || undefined,
      recurrence_count: reminder.recurrence_count ?? undefined,
      recurrence_end_date: reminder.recurrence_end_date ?? undefined,
      email_enabled: reminder.email_enabled,
      email_reminder_date: reminder.email_reminder_date ?? undefined,
    });
    // Initialize timing state — default to "at_event" editing the stored date directly
    const rd = reminder.reminder_date;
    setEditBaseDate(rd ? new Date(rd).toISOString().slice(0, 16) : "");
    setEditTimingMode("at_event");
    setEditBeforeAmount(1);
    setEditBeforeUnit("days");
    setEditCustomDate("");
    // Recurrence end
    if (reminder.recurrence_count && reminder.recurrence_count > 0) {
      setEditRecurrenceEndMode("count");
      setEditRecurrenceCount(reminder.recurrence_count);
    } else if (reminder.recurrence_end_date) {
      setEditRecurrenceEndMode("date");
      setEditRecurrenceEndDate(new Date(reminder.recurrence_end_date).toISOString().split("T")[0]);
    } else {
      setEditRecurrenceEndMode("never");
      setEditRecurrenceCount(5);
      setEditRecurrenceEndDate("");
    }
    // Email timing — default to "at_event" since we don't store the mode
    setEditEmailTimingMode("at_event");
    setEditEmailBeforeAmount(1);
    setEditEmailBeforeUnit("days");
    setEditCustomEmailDate(reminder.email_reminder_date ? new Date(reminder.email_reminder_date).toISOString().slice(0, 16) : "");
  };

  const handleSaveEditReminder = async (followUpId: string) => {
    if (!editingReminderId || !editBaseDate) return;
    setLocalError(null);
    setReminderSaving(true);
    try {
      const computedReminderDate = computeDate(editBaseDate, editTimingMode, editBeforeAmount, editBeforeUnit, editCustomDate);
      const computedEmailDate = editEmailTimingMode === "at_event"
        ? computedReminderDate
        : computeDate(editBaseDate, editEmailTimingMode, editEmailBeforeAmount, editEmailBeforeUnit, editCustomEmailDate);
      const payload: UpdateReminderPayload = {
        title: editReminderData.title,
        reminder_date: computedReminderDate,
        next_reminder_date: computedReminderDate,
        reminder_type: editReminderData.reminder_type,
        ...(editReminderData.reminder_type === "recurring" ? { recurrence_interval: editReminderData.recurrence_interval } : {}),
        ...(editReminderData.reminder_type === "recurring" && editRecurrenceEndMode === "count" ? { recurrence_count: editRecurrenceCount } : { recurrence_count: null }),
        ...(editReminderData.reminder_type === "recurring" && editRecurrenceEndMode === "date" && editRecurrenceEndDate ? { recurrence_end_date: new Date(editRecurrenceEndDate).toISOString() } : { recurrence_end_date: null }),
        email_enabled: editReminderData.email_enabled,
        ...(editReminderData.email_enabled ? { email_reminder_date: computedEmailDate } : { email_reminder_date: null }),
      };
      const updated = await updateReminder(editingReminderId, payload);
      setFollowUps(prev => prev.map(fu =>
        fu.id === followUpId ? { ...fu, reminders: fu.reminders.map(r => r.id === editingReminderId ? updated : r) } : fu
      ));
      setEditingReminderId(null);
      setEditReminderData({});
      if (editReminderData.email_enabled) {
        try { const q = await getEmailQuota(); setEmailQuota(q); } catch { /* ignore */ }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update reminder";
      setLocalError(message);
    } finally {
      setReminderSaving(false);
    }
  };

  const resetNewReminderState = () => {
    setAddingReminderToFollowUpId(null);
    setNewReminderDate("");
    setNewReminderTitle("");
    setNewReminderType("once");
    setNewRecurrenceInterval("weekly");
    setNewEmailEnabled(false);
    setNewTimingMode("at_event");
    setNewBeforeAmount(1);
    setNewBeforeUnit("days");
    setNewCustomDate("");
    setNewRecurrenceEndMode("never");
    setNewRecurrenceCount(5);
    setNewRecurrenceEndDate("");
    setNewEmailTimingMode("at_event");
    setNewEmailBeforeAmount(1);
    setNewEmailBeforeUnit("days");
    setNewCustomEmailDate("");
  };

  const handleAddReminderToFollowUp = async (followUpId: string) => {
    if (!newReminderDate) {
      setLocalError("Please select a reminder date");
      return;
    }
    setLocalError(null);
    setReminderSaving(true);
    try {
      const computedReminderDate = computeDate(newReminderDate, newTimingMode, newBeforeAmount, newBeforeUnit, newCustomDate);
      const computedEmailDate = newEmailTimingMode === "at_event"
        ? computedReminderDate
        : computeDate(newReminderDate, newEmailTimingMode, newEmailBeforeAmount, newEmailBeforeUnit, newCustomEmailDate);
      const payload: CreateReminderPayload = {
        follow_up_id: followUpId,
        reminder_date: computedReminderDate,
        reminder_type: newReminderType,
        ...(newReminderTitle ? { title: newReminderTitle } : {}),
        ...(newReminderType === "recurring" ? { recurrence_interval: newRecurrenceInterval } : {}),
        ...(newReminderType === "recurring" && newRecurrenceEndMode === "count" ? { recurrence_count: newRecurrenceCount } : {}),
        ...(newReminderType === "recurring" && newRecurrenceEndMode === "date" && newRecurrenceEndDate ? { recurrence_end_date: new Date(newRecurrenceEndDate).toISOString() } : {}),
        ...(newEmailEnabled ? { email_enabled: true, email_reminder_date: computedEmailDate } : {}),
      };
      const created = await createReminder(payload);
      setFollowUps(prev => prev.map(fu =>
        fu.id === followUpId ? { ...fu, reminders: [...fu.reminders, created] } : fu
      ));
      resetNewReminderState();
      if (newEmailEnabled) {
        try { const q = await getEmailQuota(); setEmailQuota(q); } catch { /* ignore */ }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create reminder";
      setLocalError(message);
    } finally {
      setReminderSaving(false);
    }
  };

  const statusColors: Record<JobApplicationStatus, string> = {
    saved: "bg-slate-100 text-slate-700",
    applied: "bg-blue-100 text-blue-700",
    phone_screen: "bg-cyan-100 text-cyan-700",
    interview: "bg-amber-100 text-amber-700",
    final_round: "bg-orange-100 text-orange-700",
    offer: "bg-green-100 text-green-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<JobApplicationStatus, string> = {
    saved: "Saved",
    applied: "Applied",
    phone_screen: "Phone Screen",
    interview: "Interview",
    final_round: "Final Round",
    offer: "Offer",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  if (pageLoading && !application) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Application not found
          </div>
          <Link href="/applications" className="mt-4 text-blue-600 hover:underline">
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/applications" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Applications
        </Link>

        {/* Error/Success Messages */}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {localError}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✓ Changes saved successfully!
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{application.job_title}</h1>
            <p className="text-xl text-slate-600 mb-4">{application.company_name}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[application.status]}`}>
              {statusLabels[application.status]}
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <div className="flex flex-col items-center">
              <button
                onClick={() => { setEmailModalMode("apply"); setShowEmailModal(true); }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Apply for this Job
              </button>
              {application.applied_date ? (
                <span className="mt-1 text-xs text-green-700">Applied on {new Date(application.applied_date).toLocaleDateString()}</span>
              ) : (
                <span className="mt-1 text-xs text-slate-500">Not yet applied</span>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            {!isEditing ? (
              <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Details</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {application.job_url && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Job Posting</p>
                      <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        View Job →
                      </a>
                    </div>
                  )}
                  {application.applied_date && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Applied Date</p>
                      <p className="text-slate-900">{new Date(application.applied_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {application.location && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Location</p>
                      <p className="text-slate-900">{application.location}</p>
                    </div>
                  )}
                  {application.job_type && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Job Type</p>
                      <p className="text-slate-900">{application.job_type.replace("_", " ").toUpperCase()}</p>
                    </div>
                  )}
                  {application.salary_range && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Salary Range</p>
                      <p className="text-slate-900">{application.salary_range}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Follow-ups</p>
                    <p className="text-slate-900 font-bold">{application.follow_up_count}</p>
                  </div>
                </div>

                {application.job_description && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Job Description</p>
                    <div className="bg-slate-50 p-4 rounded-lg text-slate-900 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {application.job_description}
                    </div>
                  </div>
                )}

                {application.notes && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Notes</p>
                    <p className="text-slate-900 whitespace-pre-wrap">{application.notes}</p>
                  </div>
                )}

                {application.tags && application.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {application.tags.map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveEdit} className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Application</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Status</label>
                    <select
                      name="status"
                      value={editData.status || application.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editData.location || application.location || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Salary Range</label>
                    <input
                      type="text"
                      name="salary_range"
                      value={editData.salary_range || application.salary_range || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={editData.notes ?? application.notes ?? ""}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Linked Resume</label>
                    <select
                      name="resume_id"
                      value={editData.resume_id ?? "__unchanged__"}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="__unchanged__">— Select resume to change —</option>
                      <option value="">No resume linked</option>
                      {savedResumes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title || r.file_name || "Untitled Resume"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Resume Used */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Resume Used</h2>
              {application.applied_resume_title || application.applied_resume_text ? (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {application.applied_resume_title || "Untitled Resume"}
                    </p>
                    {application.applied_resume_text && (
                      <Link
                        href={`/applications/${application.id}/resume`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Resume →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-slate-500">None</p>
                </div>
              )}
            </div>

            {/* Follow-ups Section */}
            <div ref={followUpSectionRef} className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Follow-ups ({followUps.length})</h2>
                <button
                  onClick={() => setIsAddingFollowUp(!isAddingFollowUp)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  {isAddingFollowUp ? "Cancel" : "+ Add Follow-up"}
                </button>
              </div>

              {isAddingFollowUp && (
                <form onSubmit={handleAddFollowUp} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-300">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Type</label>
                      <select
                        name="follow_up_type"
                        value={followUpData.follow_up_type}
                        onChange={handleFollowUpChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="note">Note</option>
                        <option value="interview_prep">Interview Prep</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Note</label>
                      <textarea
                        name="note"
                        value={followUpData.note}
                        onChange={handleFollowUpChange}
                        placeholder="What happened during this follow-up?"
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Status</label>
                      <select
                        name="status"
                        value={followUpData.status}
                        onChange={handleFollowUpChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Scheduled Date — the event / follow-up date */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">When this follow-up should happen</p>
                    </div>

                    {/* ─── Reminder Section ─── */}
                    <div className="border-t border-slate-200 pt-4">
                      {isPaidPlan ? (
                        <div className="space-y-4">
                          {/* Toggle */}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={reminderEnabled}
                              onChange={(e) => setReminderEnabled(e.target.checked)}
                              disabled={!reminderDate}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold text-slate-900">Set Reminder</span>
                            {!reminderDate && (
                              <span className="text-xs text-slate-400">(set a scheduled date first)</span>
                            )}
                          </label>

                          {reminderEnabled && reminderDate && (
                            <div className="ml-7 space-y-4">

                              {/* ── When to remind (in-app) ── */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">When to remind</label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="reminderTiming" value="at_event" checked={reminderTimingMode === "at_event"} onChange={() => setReminderTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">At event time</span>
                                  </label>

                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="reminderTiming" value="before_event" checked={reminderTimingMode === "before_event"} onChange={() => setReminderTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Before the event</span>
                                  </label>
                                  {reminderTimingMode === "before_event" && (
                                    <div className="flex items-center gap-2 ml-6">
                                      <input
                                        type="number"
                                        min={1}
                                        max={999}
                                        value={reminderBeforeAmount}
                                        onChange={(e) => setReminderBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                      />
                                      <select
                                        value={reminderBeforeUnit}
                                        onChange={(e) => setReminderBeforeUnit(e.target.value as ReminderBeforeUnit)}
                                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                      >
                                        <option value="minutes">minute(s) before</option>
                                        <option value="hours">hour(s) before</option>
                                        <option value="days">day(s) before</option>
                                        <option value="weeks">week(s) before</option>
                                      </select>
                                    </div>
                                  )}

                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="reminderTiming" value="custom" checked={reminderTimingMode === "custom"} onChange={() => setReminderTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                  </label>
                                  {reminderTimingMode === "custom" && (
                                    <div className="ml-6">
                                      <input
                                        type="datetime-local"
                                        value={customReminderDate}
                                        onChange={(e) => setCustomReminderDate(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Computed preview */}
                                {(() => {
                                  let preview = "";
                                  try {
                                    if (reminderTimingMode === "at_event") {
                                      preview = new Date(reminderDate).toLocaleString();
                                    } else if (reminderTimingMode === "before_event") {
                                      const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                      preview = new Date(new Date(reminderDate).getTime() - reminderBeforeAmount * ms[reminderBeforeUnit]).toLocaleString();
                                    } else if (reminderTimingMode === "custom" && customReminderDate) {
                                      preview = new Date(customReminderDate).toLocaleString();
                                    }
                                  } catch { /* invalid date */ }
                                  return preview ? (
                                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      Reminder fires: {preview}
                                    </p>
                                  ) : null;
                                })()}
                              </div>

                              {/* ── Frequency ── */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="reminderType" value="once" checked={reminderType === "once"} onChange={() => setReminderType("once")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Once</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="reminderType" value="recurring" checked={reminderType === "recurring"} onChange={() => setReminderType("recurring")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Recurring</span>
                                  </label>
                                </div>
                              </div>

                              {/* Recurrence Interval */}
                              {reminderType === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Repeat Every</label>
                                  <select
                                    value={recurrenceInterval}
                                    onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="every_2_days">Every 2 Days</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                </div>
                              )}

                              {/* Recurrence End Condition */}
                              {reminderType === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Ends</label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="recurrenceEnd" value="never" checked={recurrenceEndMode === "never"} onChange={() => setRecurrenceEndMode("never")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">Never</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="recurrenceEnd" value="count" checked={recurrenceEndMode === "count"} onChange={() => setRecurrenceEndMode("count")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">After</span>
                                      {recurrenceEndMode === "count" && (
                                        <span className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={recurrenceCount}
                                            onChange={(e) => setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                          />
                                          <span className="text-sm text-slate-600">times</span>
                                        </span>
                                      )}
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="recurrenceEnd" value="date" checked={recurrenceEndMode === "date"} onChange={() => setRecurrenceEndMode("date")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">On date</span>
                                    </label>
                                    {recurrenceEndMode === "date" && (
                                      <input
                                        type="date"
                                        value={recurrenceEndDate}
                                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ml-6"
                                        min={new Date().toISOString().split("T")[0]}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* ── Email Reminder ── */}
                              <div className="border-t border-slate-200 pt-3">
                                {emailQuota && emailQuota.email_reminder_limit > 0 ? (
                                  <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={emailReminderEnabled}
                                        onChange={(e) => {
                                          if (e.target.checked && emailQuota && !emailQuota.can_create_email_reminder) {
                                            setEmailQuotaError(
                                              `You've reached your limit of ${emailQuota.email_reminder_limit} active email reminders.`
                                            );
                                            return;
                                          }
                                          setEmailQuotaError(null);
                                          setEmailReminderEnabled(e.target.checked);
                                        }}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                      />
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-slate-900">Also send email reminder</span>
                                      </div>
                                    </label>
                                    <p className="text-xs text-slate-500 ml-7">
                                      {emailQuota.email_reminders_used}/{emailQuota.email_reminder_limit} email reminders used
                                      {emailQuota.email_reminders_remaining > 0 && (
                                        <span className="text-green-600 ml-1">({emailQuota.email_reminders_remaining} remaining)</span>
                                      )}
                                    </p>
                                    {emailQuotaError && (
                                      <p className="text-xs text-red-600 ml-7 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                        {emailQuotaError}
                                      </p>
                                    )}

                                    {/* Email Timing Options */}
                                    {emailReminderEnabled && (
                                      <div className="ml-7 space-y-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">When to send email</label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name="emailTiming" value="at_event" checked={emailTimingMode === "at_event"} onChange={() => setEmailTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Same as in-app reminder</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name="emailTiming" value="before_event" checked={emailTimingMode === "before_event"} onChange={() => setEmailTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Before the event</span>
                                        </label>
                                        {emailTimingMode === "before_event" && (
                                          <div className="flex items-center gap-2 ml-6">
                                            <input
                                              type="number"
                                              min={1}
                                              max={999}
                                              value={emailBeforeAmount}
                                              onChange={(e) => setEmailBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                              className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            />
                                            <select
                                              value={emailBeforeUnit}
                                              onChange={(e) => setEmailBeforeUnit(e.target.value as ReminderBeforeUnit)}
                                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                              <option value="minutes">minute(s) before</option>
                                              <option value="hours">hour(s) before</option>
                                              <option value="days">day(s) before</option>
                                              <option value="weeks">week(s) before</option>
                                            </select>
                                          </div>
                                        )}

                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name="emailTiming" value="custom" checked={emailTimingMode === "custom"} onChange={() => setEmailTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                        </label>
                                        {emailTimingMode === "custom" && (
                                          <div className="ml-6">
                                            <input
                                              type="datetime-local"
                                              value={customEmailDate}
                                              onChange={(e) => setCustomEmailDate(e.target.value)}
                                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            />
                                          </div>
                                        )}

                                        {/* Email send-time preview */}
                                        {(() => {
                                          let emailPreview = "";
                                          try {
                                            const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                            if (emailTimingMode === "at_event") {
                                              // same as in-app
                                              if (reminderTimingMode === "at_event") emailPreview = new Date(reminderDate).toLocaleString();
                                              else if (reminderTimingMode === "before_event") emailPreview = new Date(new Date(reminderDate).getTime() - reminderBeforeAmount * ms[reminderBeforeUnit]).toLocaleString();
                                              else if (customReminderDate) emailPreview = new Date(customReminderDate).toLocaleString();
                                            } else if (emailTimingMode === "before_event") {
                                              emailPreview = new Date(new Date(reminderDate).getTime() - emailBeforeAmount * ms[emailBeforeUnit]).toLocaleString();
                                            } else if (emailTimingMode === "custom" && customEmailDate) {
                                              emailPreview = new Date(customEmailDate).toLocaleString();
                                            }
                                          } catch { /* invalid date */ }
                                          return emailPreview ? (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                              Email sends: {emailPreview}
                                            </p>
                                          ) : null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email reminders available on <a href="/subscribe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pro &amp; Premium</a>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span>Reminders available on <a href="/subscribe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Pro &amp; Premium</a> plans</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      type="submit"
                      disabled={addingFollowUp}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {addingFollowUp ? "Adding..." : "Add Follow-up"}
                    </button>
                  </div>
                </form>
              )}

              {followUps.length > 0 ? (
                <div className="space-y-3">
                  {followUps.map(followUp => (
                    <div key={followUp.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 capitalize">{followUp.follow_up_type.replace("_", " ")}</p>
                            {followUp.scheduled_date && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full" title={`Scheduled: ${new Date(followUp.scheduled_date).toLocaleString()}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {new Date(followUp.scheduled_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{new Date(followUp.created_at).toLocaleDateString()}</p>
                          <p className="text-slate-900 mt-2">{followUp.note}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            followUp.status === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                          </span>
                          <button
                            onClick={() => handleDeleteFollowUp(followUp.id)}
                            disabled={deletingFollowUpId === followUp.id}
                            className="p-1 text-slate-400 hover:text-red-600 transition"
                            title="Delete follow-up"
                          >
                            {deletingFollowUpId === followUp.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Reminder Section */}
                      {followUp.reminders.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          {followUp.reminders.map((reminder, rIdx) => (
                            <div key={reminder.id} className={rIdx > 0 ? "mt-3 pt-3 border-t border-slate-100" : ""}>
                              {editingReminderId !== reminder.id ? (
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                      </svg>
                                      <span className="text-sm font-medium text-slate-800">{reminder.title}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                        reminder.status === "active" ? "bg-green-100 text-green-700"
                                        : reminder.status === "snoozed" ? "bg-amber-100 text-amber-700"
                                        : reminder.status === "completed" ? "bg-slate-100 text-slate-600"
                                        : "bg-red-100 text-red-600"
                                      }`}>
                                        {reminder.status}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 ml-6">
                                      {reminder.next_reminder_date && (
                                        <span>Next: {new Date(reminder.next_reminder_date).toLocaleString()}</span>
                                      )}
                                      <span className="capitalize">{reminder.reminder_type}{reminder.recurrence_interval ? ` (${reminder.recurrence_interval.replace("_", " ")})` : ""}</span>
                                      {reminder.email_enabled && (
                                        <span className="inline-flex items-center gap-0.5 text-blue-600">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                          Email
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => handleStartEditReminder(reminder)}
                                      disabled={reminderSaving}
                                      className="p-1 text-slate-400 hover:text-blue-600 transition"
                                      title="Edit reminder"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReminder(reminder.id, followUp.id)}
                                      disabled={reminderSaving}
                                      className="p-1 text-slate-400 hover:text-red-600 transition"
                                      title="Delete reminder"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Full Edit Reminder Form (mirrors creation form) ── */
                                <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Edit Reminder
                          </p>

                          {/* Title */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={editReminderData.title || ""}
                              onChange={(e) => setEditReminderData(d => ({ ...d, title: e.target.value }))}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder="Reminder title"
                            />
                          </div>

                          {/* Scheduled / Base Date */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                            <input
                              type="datetime-local"
                              value={editBaseDate}
                              onChange={(e) => setEditBaseDate(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          {editBaseDate && (
                            <div className="ml-1 space-y-4">
                              {/* When to remind (in-app) */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">When to remind</label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`editRTiming_${followUp.id}`} value="at_event" checked={editTimingMode === "at_event"} onChange={() => setEditTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">At event time</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`editRTiming_${followUp.id}`} value="before_event" checked={editTimingMode === "before_event"} onChange={() => setEditTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Before the event</span>
                                  </label>
                                  {editTimingMode === "before_event" && (
                                    <div className="flex items-center gap-2 ml-6">
                                      <input type="number" min={1} max={999} value={editBeforeAmount} onChange={(e) => setEditBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                      <select value={editBeforeUnit} onChange={(e) => setEditBeforeUnit(e.target.value as ReminderBeforeUnit)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                        <option value="minutes">minute(s) before</option>
                                        <option value="hours">hour(s) before</option>
                                        <option value="days">day(s) before</option>
                                        <option value="weeks">week(s) before</option>
                                      </select>
                                    </div>
                                  )}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`editRTiming_${followUp.id}`} value="custom" checked={editTimingMode === "custom"} onChange={() => setEditTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                  </label>
                                  {editTimingMode === "custom" && (
                                    <div className="ml-6">
                                      <input type="datetime-local" value={editCustomDate} onChange={(e) => setEditCustomDate(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                    </div>
                                  )}
                                </div>

                                {/* Computed preview */}
                                {(() => {
                                  const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                  let preview = "";
                                  try {
                                    if (editTimingMode === "at_event") preview = new Date(editBaseDate).toLocaleString();
                                    else if (editTimingMode === "before_event") preview = new Date(new Date(editBaseDate).getTime() - editBeforeAmount * ms[editBeforeUnit]).toLocaleString();
                                    else if (editTimingMode === "custom" && editCustomDate) preview = new Date(editCustomDate).toLocaleString();
                                  } catch { /* invalid date */ }
                                  return preview ? (
                                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      Reminder fires: {preview}
                                    </p>
                                  ) : null;
                                })()}
                              </div>

                              {/* Frequency */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`editRType_${followUp.id}`} value="once" checked={editReminderData.reminder_type === "once"} onChange={() => setEditReminderData(d => ({ ...d, reminder_type: "once" }))} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Once</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`editRType_${followUp.id}`} value="recurring" checked={editReminderData.reminder_type === "recurring"} onChange={() => setEditReminderData(d => ({ ...d, reminder_type: "recurring" }))} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Recurring</span>
                                  </label>
                                </div>
                              </div>

                              {/* Recurrence Interval */}
                              {editReminderData.reminder_type === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Repeat Every</label>
                                  <select
                                    value={editReminderData.recurrence_interval || "weekly"}
                                    onChange={(e) => setEditReminderData(d => ({ ...d, recurrence_interval: e.target.value as RecurrenceInterval }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="every_2_days">Every 2 Days</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                </div>
                              )}

                              {/* Recurrence End Condition */}
                              {editReminderData.reminder_type === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Ends</label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`editREnd_${followUp.id}`} value="never" checked={editRecurrenceEndMode === "never"} onChange={() => setEditRecurrenceEndMode("never")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">Never</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`editREnd_${followUp.id}`} value="count" checked={editRecurrenceEndMode === "count"} onChange={() => setEditRecurrenceEndMode("count")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">After</span>
                                      {editRecurrenceEndMode === "count" && (
                                        <span className="flex items-center gap-1">
                                          <input type="number" min={1} max={100} value={editRecurrenceCount} onChange={(e) => setEditRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                          <span className="text-sm text-slate-600">times</span>
                                        </span>
                                      )}
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`editREnd_${followUp.id}`} value="date" checked={editRecurrenceEndMode === "date"} onChange={() => setEditRecurrenceEndMode("date")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">On date</span>
                                    </label>
                                    {editRecurrenceEndMode === "date" && (
                                      <input type="date" value={editRecurrenceEndDate} onChange={(e) => setEditRecurrenceEndDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ml-6" min={new Date().toISOString().split("T")[0]} />
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Email Reminder */}
                              <div className="border-t border-slate-200 pt-3">
                                {emailQuota && emailQuota.email_reminder_limit > 0 ? (
                                  <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editReminderData.email_enabled || false}
                                        onChange={(e) => {
                                          if (e.target.checked && emailQuota && !emailQuota.can_create_email_reminder) {
                                            setLocalError(`You've reached your limit of ${emailQuota.email_reminder_limit} active email reminders.`);
                                            return;
                                          }
                                          setEditReminderData(d => ({ ...d, email_enabled: e.target.checked }));
                                        }}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                      />
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-slate-900">Also send email reminder</span>
                                      </div>
                                    </label>
                                    <p className="text-xs text-slate-500 ml-7">
                                      {emailQuota.email_reminders_used}/{emailQuota.email_reminder_limit} email reminders used
                                      {emailQuota.email_reminders_remaining > 0 && (
                                        <span className="text-green-600 ml-1">({emailQuota.email_reminders_remaining} remaining)</span>
                                      )}
                                    </p>

                                    {editReminderData.email_enabled && (
                                      <div className="ml-7 space-y-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">When to send email</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`editEmailTiming_${followUp.id}`} value="at_event" checked={editEmailTimingMode === "at_event"} onChange={() => setEditEmailTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Same as in-app reminder</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`editEmailTiming_${followUp.id}`} value="before_event" checked={editEmailTimingMode === "before_event"} onChange={() => setEditEmailTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Before the event</span>
                                        </label>
                                        {editEmailTimingMode === "before_event" && (
                                          <div className="flex items-center gap-2 ml-6">
                                            <input type="number" min={1} max={999} value={editEmailBeforeAmount} onChange={(e) => setEditEmailBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                            <select value={editEmailBeforeUnit} onChange={(e) => setEditEmailBeforeUnit(e.target.value as ReminderBeforeUnit)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                              <option value="minutes">minute(s) before</option>
                                              <option value="hours">hour(s) before</option>
                                              <option value="days">day(s) before</option>
                                              <option value="weeks">week(s) before</option>
                                            </select>
                                          </div>
                                        )}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`editEmailTiming_${followUp.id}`} value="custom" checked={editEmailTimingMode === "custom"} onChange={() => setEditEmailTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                        </label>
                                        {editEmailTimingMode === "custom" && (
                                          <div className="ml-6">
                                            <input type="datetime-local" value={editCustomEmailDate} onChange={(e) => setEditCustomEmailDate(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                          </div>
                                        )}

                                        {/* Email send-time preview */}
                                        {(() => {
                                          const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                          let emailPreview = "";
                                          try {
                                            if (editEmailTimingMode === "at_event") {
                                              if (editTimingMode === "at_event") emailPreview = new Date(editBaseDate).toLocaleString();
                                              else if (editTimingMode === "before_event") emailPreview = new Date(new Date(editBaseDate).getTime() - editBeforeAmount * ms[editBeforeUnit]).toLocaleString();
                                              else if (editCustomDate) emailPreview = new Date(editCustomDate).toLocaleString();
                                            } else if (editEmailTimingMode === "before_event") {
                                              emailPreview = new Date(new Date(editBaseDate).getTime() - editEmailBeforeAmount * ms[editEmailBeforeUnit]).toLocaleString();
                                            } else if (editEmailTimingMode === "custom" && editCustomEmailDate) {
                                              emailPreview = new Date(editCustomEmailDate).toLocaleString();
                                            }
                                          } catch { /* invalid date */ }
                                          return emailPreview ? (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                              Email sends: {emailPreview}
                                            </p>
                                          ) : null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email reminders available on <a href="/subscribe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pro &amp; Premium</a>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Save / Cancel */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleSaveEditReminder(followUp.id)}
                              disabled={reminderSaving || !editBaseDate}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
                            >
                              {reminderSaving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={() => { setEditingReminderId(null); setEditReminderData({}); }}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Reminder Form */}
                      {addingReminderToFollowUpId === followUp.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Add Reminder
                          </p>

                          {/* Title */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title (optional)</label>
                            <input
                              type="text"
                              value={newReminderTitle}
                              onChange={(e) => setNewReminderTitle(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder="Reminder title"
                            />
                          </div>

                          {/* Scheduled / Base Date */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                            <input
                              type="datetime-local"
                              value={newReminderDate}
                              onChange={(e) => setNewReminderDate(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          {newReminderDate && (
                            <div className="ml-1 space-y-4">
                              {/* When to remind (in-app) */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">When to remind</label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`newRTiming_${followUp.id}`} value="at_event" checked={newTimingMode === "at_event"} onChange={() => setNewTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">At event time</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`newRTiming_${followUp.id}`} value="before_event" checked={newTimingMode === "before_event"} onChange={() => setNewTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Before the event</span>
                                  </label>
                                  {newTimingMode === "before_event" && (
                                    <div className="flex items-center gap-2 ml-6">
                                      <input type="number" min={1} max={999} value={newBeforeAmount} onChange={(e) => setNewBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                      <select value={newBeforeUnit} onChange={(e) => setNewBeforeUnit(e.target.value as ReminderBeforeUnit)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                        <option value="minutes">minute(s) before</option>
                                        <option value="hours">hour(s) before</option>
                                        <option value="days">day(s) before</option>
                                        <option value="weeks">week(s) before</option>
                                      </select>
                                    </div>
                                  )}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`newRTiming_${followUp.id}`} value="custom" checked={newTimingMode === "custom"} onChange={() => setNewTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                  </label>
                                  {newTimingMode === "custom" && (
                                    <div className="ml-6">
                                      <input type="datetime-local" value={newCustomDate} onChange={(e) => setNewCustomDate(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                    </div>
                                  )}
                                </div>

                                {/* Computed preview */}
                                {(() => {
                                  const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                  let preview = "";
                                  try {
                                    if (newTimingMode === "at_event") preview = new Date(newReminderDate).toLocaleString();
                                    else if (newTimingMode === "before_event") preview = new Date(new Date(newReminderDate).getTime() - newBeforeAmount * ms[newBeforeUnit]).toLocaleString();
                                    else if (newTimingMode === "custom" && newCustomDate) preview = new Date(newCustomDate).toLocaleString();
                                  } catch { /* invalid date */ }
                                  return preview ? (
                                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      Reminder fires: {preview}
                                    </p>
                                  ) : null;
                                })()}
                              </div>

                              {/* Frequency */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`newRType_${followUp.id}`} value="once" checked={newReminderType === "once"} onChange={() => setNewReminderType("once")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Once</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`newRType_${followUp.id}`} value="recurring" checked={newReminderType === "recurring"} onChange={() => setNewReminderType("recurring")} className="text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700">Recurring</span>
                                  </label>
                                </div>
                              </div>

                              {/* Recurrence Interval */}
                              {newReminderType === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Repeat Every</label>
                                  <select
                                    value={newRecurrenceInterval}
                                    onChange={(e) => setNewRecurrenceInterval(e.target.value as RecurrenceInterval)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="every_2_days">Every 2 Days</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                </div>
                              )}

                              {/* Recurrence End Condition */}
                              {newReminderType === "recurring" && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Ends</label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`newREnd_${followUp.id}`} value="never" checked={newRecurrenceEndMode === "never"} onChange={() => setNewRecurrenceEndMode("never")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">Never</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`newREnd_${followUp.id}`} value="count" checked={newRecurrenceEndMode === "count"} onChange={() => setNewRecurrenceEndMode("count")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">After</span>
                                      {newRecurrenceEndMode === "count" && (
                                        <span className="flex items-center gap-1">
                                          <input type="number" min={1} max={100} value={newRecurrenceCount} onChange={(e) => setNewRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                          <span className="text-sm text-slate-600">times</span>
                                        </span>
                                      )}
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name={`newREnd_${followUp.id}`} value="date" checked={newRecurrenceEndMode === "date"} onChange={() => setNewRecurrenceEndMode("date")} className="text-blue-600 focus:ring-blue-500" />
                                      <span className="text-sm text-slate-700">On date</span>
                                    </label>
                                    {newRecurrenceEndMode === "date" && (
                                      <input type="date" value={newRecurrenceEndDate} onChange={(e) => setNewRecurrenceEndDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ml-6" min={new Date().toISOString().split("T")[0]} />
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Email Reminder */}
                              <div className="border-t border-slate-200 pt-3">
                                {emailQuota && emailQuota.email_reminder_limit > 0 ? (
                                  <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={newEmailEnabled}
                                        onChange={(e) => {
                                          if (e.target.checked && emailQuota && !emailQuota.can_create_email_reminder) {
                                            setLocalError(`You've reached your limit of ${emailQuota.email_reminder_limit} active email reminders.`);
                                            return;
                                          }
                                          setNewEmailEnabled(e.target.checked);
                                        }}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                      />
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-slate-900">Also send email reminder</span>
                                      </div>
                                    </label>
                                    <p className="text-xs text-slate-500 ml-7">
                                      {emailQuota.email_reminders_used}/{emailQuota.email_reminder_limit} email reminders used
                                      {emailQuota.email_reminders_remaining > 0 && (
                                        <span className="text-green-600 ml-1">({emailQuota.email_reminders_remaining} remaining)</span>
                                      )}
                                    </p>

                                    {newEmailEnabled && (
                                      <div className="ml-7 space-y-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">When to send email</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`newEmailTiming_${followUp.id}`} value="at_event" checked={newEmailTimingMode === "at_event"} onChange={() => setNewEmailTimingMode("at_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Same as in-app reminder</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`newEmailTiming_${followUp.id}`} value="before_event" checked={newEmailTimingMode === "before_event"} onChange={() => setNewEmailTimingMode("before_event")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Before the event</span>
                                        </label>
                                        {newEmailTimingMode === "before_event" && (
                                          <div className="flex items-center gap-2 ml-6">
                                            <input type="number" min={1} max={999} value={newEmailBeforeAmount} onChange={(e) => setNewEmailBeforeAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                            <select value={newEmailBeforeUnit} onChange={(e) => setNewEmailBeforeUnit(e.target.value as ReminderBeforeUnit)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                              <option value="minutes">minute(s) before</option>
                                              <option value="hours">hour(s) before</option>
                                              <option value="days">day(s) before</option>
                                              <option value="weeks">week(s) before</option>
                                            </select>
                                          </div>
                                        )}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name={`newEmailTiming_${followUp.id}`} value="custom" checked={newEmailTimingMode === "custom"} onChange={() => setNewEmailTimingMode("custom")} className="text-blue-600 focus:ring-blue-500" />
                                          <span className="text-sm text-slate-700">Custom date &amp; time</span>
                                        </label>
                                        {newEmailTimingMode === "custom" && (
                                          <div className="ml-6">
                                            <input type="datetime-local" value={newCustomEmailDate} onChange={(e) => setNewCustomEmailDate(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                          </div>
                                        )}

                                        {/* Email send-time preview */}
                                        {(() => {
                                          const ms: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
                                          let emailPreview = "";
                                          try {
                                            if (newEmailTimingMode === "at_event") {
                                              if (newTimingMode === "at_event") emailPreview = new Date(newReminderDate).toLocaleString();
                                              else if (newTimingMode === "before_event") emailPreview = new Date(new Date(newReminderDate).getTime() - newBeforeAmount * ms[newBeforeUnit]).toLocaleString();
                                              else if (newCustomDate) emailPreview = new Date(newCustomDate).toLocaleString();
                                            } else if (newEmailTimingMode === "before_event") {
                                              emailPreview = new Date(new Date(newReminderDate).getTime() - newEmailBeforeAmount * ms[newEmailBeforeUnit]).toLocaleString();
                                            } else if (newEmailTimingMode === "custom" && newCustomEmailDate) {
                                              emailPreview = new Date(newCustomEmailDate).toLocaleString();
                                            }
                                          } catch { /* invalid date */ }
                                          return emailPreview ? (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                              Email sends: {emailPreview}
                                            </p>
                                          ) : null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email reminders available on <a href="/subscribe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pro &amp; Premium</a>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add / Cancel */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleAddReminderToFollowUp(followUp.id)}
                              disabled={reminderSaving || !newReminderDate}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition"
                            >
                              {reminderSaving ? "Adding..." : "Add Reminder"}
                            </button>
                            <button
                              onClick={() => resetNewReminderState()}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Add Reminder Button */}
                      {followUp.reminders.length < 5 && isPaidPlan && addingReminderToFollowUpId !== followUp.id && (
                        <div className={followUp.reminders.length > 0 ? "mt-2" : "mt-3 pt-3 border-t border-slate-200"}>
                          <button
                            onClick={() => setAddingReminderToFollowUpId(followUp.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Reminder ({followUp.reminders.length}/5)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">No follow-ups yet. Add one to track your progress.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Application Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="text-lg font-bold text-slate-900">{statusLabels[application.status]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Follow-ups</p>
                  <p className="text-lg font-bold text-slate-900">{application.follow_up_count}</p>
                </div>
                {application.applied_date && (
                  <div>
                    <p className="text-sm text-slate-600">Days Active</p>
                    <p className="text-lg font-bold text-slate-900">
                      {Math.floor((Date.now() - new Date(application.applied_date).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsAddingFollowUp(true);
                    setTimeout(() => followUpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                  }}
                  className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition"
                >
                  Add Follow-up
                </button>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => { setEmailModalMode("apply"); setShowEmailModal(true); }}
                    className="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition"
                  >
                    Apply for this Job
                  </button>
                  {application.applied_date ? (
                    <span className="mt-1 text-xs text-green-700">Applied on {new Date(application.applied_date).toLocaleDateString()}</span>
                  ) : (
                    <span className="mt-1 text-xs text-slate-500">Not yet applied</span>
                  )}
                </div>
                <button
                  onClick={() => { setEmailModalMode("forward"); setShowEmailModal(true); }}
                  className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition"
                >
                  Forward Job to a Friend
                </button>
                {application.applied_resume_text ? (
                  <button
                    onClick={() => {
                      sessionStorage.setItem(
                        "resume_prefill",
                        JSON.stringify({
                          resume_text: application.applied_resume_text,
                          resume_title: application.applied_resume_title || "Untitled Resume",
                          job_title: application.job_title || "",
                          company_name: application.company_name || "",
                          job_description: application.job_description || "",
                        })
                      );
                      router.push("/tailor");
                    }}
                    className="w-full px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition text-center"
                  >
                    Re-tailor for Similar Job
                  </button>
                ) : (
                  <Link
                    href="/tailor"
                    className="block px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition text-center"
                  >
                    Tailor Resume
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <ApplicationEmailModal
          applicationId={applicationId}
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          mode={emailModalMode}
          userName={user?.full_name || ""}
          onSent={(appliedAt) => {
            if (emailModalMode === "apply") {
              setApplication((prev) =>
                prev ? { ...prev, status: "applied" as JobApplicationStatus, applied_date: appliedAt } : prev
              );
            }
          }}
        />
      </div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 py-8 px-4"><p>Loading...</p></div>}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
