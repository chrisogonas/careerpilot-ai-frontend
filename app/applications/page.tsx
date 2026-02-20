"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { JobApplication, JobApplicationStatus } from "@/lib/types";

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, getApplications, deleteApplication, isLoading, error } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<JobApplicationStatus | "all">("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const loadApplications = async () => {
      try {
        setLocalError(null);
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load applications";
        setLocalError(message);
      }
    };

    loadApplications();
  }, [isAuthenticated, router, getApplications]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLocalError(null);
      await deleteApplication(id);
      setApplications(applications.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete application";
      setLocalError(message);
    }
  };

  const filteredApplications = filterStatus === "all" 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

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

  if (isLoading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Applications</h1>
            <p className="text-slate-600">Track and manage your job applications</p>
          </div>
          <Link
            href="/applications/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            + New Application
          </Link>
        </div>

        {/* Error Messages */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {localError || error}
          </div>
        )}

        {/* Filter Tabs */}
        {applications.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filterStatus === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All ({applications.length})
            </button>
            {["applied", "interview", "offer", "rejected"].map(status => {
              const count = applications.filter(a => a.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as JobApplicationStatus)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    filterStatus === status 
                      ? "bg-blue-600 text-white" 
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {statusLabels[status as JobApplicationStatus]} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition border border-slate-200"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{app.job_title}</h3>
                  <p className="text-slate-600 font-medium">{app.company_name}</p>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  {app.job_url && (
                    <p>
                      <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Job Posting →
                      </a>
                    </p>
                  )}
                  {app.applied_date && (
                    <p>Applied: {new Date(app.applied_date).toLocaleDateString()}</p>
                  )}
                  {app.location && <p>Location: {app.location}</p>}
                  {app.job_type && <p>Type: {app.job_type.replace("_", " ").toUpperCase()}</p>}
                  {app.follow_up_count > 0 && (
                    <p className="font-medium text-slate-900">Follow-ups: {app.follow_up_count}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/applications/${app.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      deleteConfirm === app.id
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                    }`}
                  >
                    {deleteConfirm === app.id ? "Confirm" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
            <div className="text-slate-900 mb-2">
              <p className="text-xl font-bold mb-2">No Applications Found</p>
              {applications.length > 0 && filterStatus !== "all" && (
                <p className="text-slate-600 mb-4">No applications with status "{statusLabels[filterStatus as JobApplicationStatus]}"</p>
              )}
            </div>
            <p className="text-slate-600 mb-6">
              {applications.length === 0 
                ? "Start tracking your job applications" 
                : "Change your filter to see other applications"}
            </p>
            {applications.length === 0 && (
              <Link
                href="/applications/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Create First Application
              </Link>
            )}
          </div>
        )}

        {/* Tips Section */}
        {applications.length === 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Job Application Tips</h3>
            <ul className="space-y-3 text-blue-900">
              <li className="flex gap-3">
                <span className="font-bold">📋</span>
                <span>Track all applications in one place for easy reference</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">📅</span>
                <span>Set follow-up dates to stay organized</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">📝</span>
                <span>Add notes about each position and company</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">✅</span>
                <span>Update status as you progress through the interview process</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
