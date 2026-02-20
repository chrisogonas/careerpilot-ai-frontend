"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { JobApplication, FollowUp, UpdateApplicationPayload, AddFollowUpPayload, JobApplicationStatus } from "@/lib/types";

function ApplicationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const { user, isAuthenticated, getApplication, updateApplication, addFollowUp, isLoading, error } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editData, setEditData] = useState<UpdateApplicationPayload>({});
  const [followUpData, setFollowUpData] = useState<AddFollowUpPayload>({
    follow_up_type: "email",
    note: "",
    status: "pending",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const loadApplication = async () => {
      try {
        setLocalError(null);
        const data = await getApplication(applicationId);
        setApplication(data);
        // Mock follow-ups (backend would return these)
        setFollowUps([]);
        setEditData({});
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load application";
        setLocalError(message);
      }
    };

    loadApplication();
  }, [isAuthenticated, router, applicationId, getApplication]);

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

    try {
      const updated = await updateApplication(applicationId, editData);
      setApplication(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes";
      setLocalError(message);
    }
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFollowUpData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!followUpData.note.trim()) {
      setLocalError("Follow-up note is required");
      return;
    }

    try {
      const newFollowUp = await addFollowUp(applicationId, followUpData);
      setFollowUps([newFollowUp, ...followUps]);
      setFollowUpData({
        follow_up_type: "email",
        note: "",
        status: "pending",
      });
      setIsAddingFollowUp(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add follow-up";
      setLocalError(message);
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

  if (isLoading && !application) {
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
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {localError || error}
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
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {isEditing ? "Cancel Edit" : "Edit"}
          </button>
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
                      value={editData.notes || application.notes || ""}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
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

            {/* Follow-ups Section */}
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
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
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {isLoading ? "Adding..." : "Add Follow-up"}
                    </button>
                  </div>
                </form>
              )}

              {followUps.length > 0 ? (
                <div className="space-y-3">
                  {followUps.map(followUp => (
                    <div key={followUp.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">{followUp.follow_up_type.replace("_", " ")}</p>
                          <p className="text-sm text-slate-600 mt-1">{new Date(followUp.created_at).toLocaleDateString()}</p>
                          <p className="text-slate-900 mt-2">{followUp.note}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          followUp.status === "completed" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                        </span>
                      </div>
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
                  onClick={() => setIsAddingFollowUp(true)}
                  className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition"
                >
                  Add Follow-up
                </button>
                <Link
                  href={`/tailor?job_id=${applicationId}`}
                  className="block px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition text-center"
                >
                  Tailor Resume
                </Link>
              </div>
            </div>
          </div>
        </div>
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
