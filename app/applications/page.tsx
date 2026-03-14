"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { JobApplication, JobApplicationStatus } from "@/lib/types";
import Pagination from "@/app/components/Pagination";
import EmptyState from "@/app/components/EmptyState";
import ApplicationPipeline from "@/app/components/ApplicationPipeline";
import { apiClient } from "@/lib/utils/api";
import { Briefcase } from "lucide-react";

type ViewMode = "cards" | "table" | "pipeline";
type AppSortField = "job_title" | "company_name" | "status" | "applied_date" | "location" | "created_at";
type SortDir = "asc" | "desc";

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, getApplications, deleteApplication, isLoading, error } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<JobApplicationStatus | "all">("all");
  const hasFetched = useRef(false);

  // View & filter state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<AppSortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

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

  // Filtered + sorted applications
  const filteredApplications = useMemo(() => {
    let list = filterStatus === "all"
      ? applications
      : applications.filter(a => a.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.job_title.toLowerCase().includes(q) ||
        a.company_name.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      let aVal: string = "";
      let bVal: string = "";
      switch (sortField) {
        case "job_title": aVal = a.job_title.toLowerCase(); bVal = b.job_title.toLowerCase(); break;
        case "company_name": aVal = a.company_name.toLowerCase(); bVal = b.company_name.toLowerCase(); break;
        case "status": aVal = a.status; bVal = b.status; break;
        case "applied_date": aVal = a.applied_date || ""; bVal = b.applied_date || ""; break;
        case "location": aVal = (a.location || "").toLowerCase(); bVal = (b.location || "").toLowerCase(); break;
        case "created_at": aVal = a.created_at; bVal = b.created_at; break;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [applications, filterStatus, searchQuery, sortField, sortDir]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleStatusChange = async (id: string, newStatus: JobApplicationStatus) => {
    try {
      await apiClient.updateApplication(id, { status: newStatus });
      setApplications(prev =>
        prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setLocalError(message);
    }
  };

  const toggleSort = (field: AppSortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: AppSortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
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
        <div className="flex justify-between items-center mb-6">
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

        {/* Toolbar: Search + Status Filter + View Toggle */}
        {applications.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <input
              type="text"
              placeholder="Search title, company, location…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />

            {/* Status Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as JobApplicationStatus | "all")}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Statuses ({applications.length})</option>
              {(Object.keys(statusLabels) as JobApplicationStatus[]).map(s => {
                const count = applications.filter(a => a.status === s).length;
                return count > 0 ? (
                  <option key={s} value={s}>{statusLabels[s]} ({count})</option>
                ) : null;
              })}
            </select>

            {/* View Toggle */}
            <div className="flex border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === "pipeline"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Pipeline
              </button>
            </div>
          </div>
        )}

        {/* Applications Content */}
        {filteredApplications.length > 0 ? (
          <>
            {/* === Pipeline View === */}
            {viewMode === "pipeline" && (
              <ApplicationPipeline
                applications={filteredApplications}
                onStatusChange={handleStatusChange}
              />
            )}

            {/* === Card View === */}
            {viewMode === "cards" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedApplications.map(app => (
                  <div
                    key={app.id}
                    className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition border border-slate-200"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{app.job_title}</h3>
                      <p className="text-slate-600 font-medium">{app.company_name}</p>
                    </div>

                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status]}`}>
                        {statusLabels[app.status]}
                      </span>
                    </div>

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
            )}

            {/* === Table View === */}
            {viewMode === "table" && (
              <div className="bg-white rounded-lg shadow border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 cursor-pointer select-none" onClick={() => toggleSort("job_title")}>
                        Job Title <SortIcon field="job_title" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 cursor-pointer select-none" onClick={() => toggleSort("company_name")}>
                        Company <SortIcon field="company_name" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                        Status <SortIcon field="status" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 cursor-pointer select-none" onClick={() => toggleSort("location")}>
                        Location <SortIcon field="location" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 cursor-pointer select-none" onClick={() => toggleSort("applied_date")}>
                        Applied <SortIcon field="applied_date" />
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-700">Follow-ups</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedApplications.map(app => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => router.push(`/applications/${app.id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{app.job_title}</td>
                        <td className="px-4 py-3 text-slate-700">{app.company_name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                            {statusLabels[app.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{app.location || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{app.applied_date ? new Date(app.applied_date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{app.follow_up_count || 0}</td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/applications/${app.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className={`font-medium ${
                                deleteConfirm === app.id
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-slate-500 hover:text-red-600"
                              }`}
                            >
                              {deleteConfirm === app.id ? "Confirm" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredApplications.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </>
        ) : (
          applications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No Applications Yet"
              subtitle="Start tracking your job applications to stay organized"
              actionLabel="Create First Application"
              actionHref="/applications/new"
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No applications match your current filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
                className="mt-3 text-blue-600 hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )
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
