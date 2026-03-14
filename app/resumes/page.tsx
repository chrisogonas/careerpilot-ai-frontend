"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Resume } from "@/lib/types";
import Pagination from "@/app/components/Pagination";
import { ResumesSkeleton } from "@/app/components/Skeleton";
import EmptyState from "@/app/components/EmptyState";
import { FileText } from "lucide-react";

type ViewMode = "cards" | "table";
type SortField = "title" | "status" | "version" | "tailor_count" | "created_at" | "last_used_at";
type SortDir = "asc" | "desc";

export default function ResumesPage() {
  const router = useRouter();
  const { user, isLoading, getResumes, deleteResume, setDefaultResume } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // View & filter state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Resume["status"]>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchResumes = async () => {
      try {
        setIsLoading2(true);
        const fetchedResumes = await getResumes();
        setResumes(fetchedResumes);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      setDeletingId(id);
      await deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete resume:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      await setDefaultResume(id);
      setResumes(resumes.map(r => ({ ...r, is_default: r.id === id })));
    } catch (err) {
      console.error("Failed to set default resume:", err);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filtered + sorted resumes
  const filteredResumes = useMemo(() => {
    let list = resumes;
    if (filterStatus !== "all") {
      list = list.filter(r => r.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.file_name && r.file_name.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      switch (sortField) {
        case "title": aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
        case "status": aVal = a.status; bVal = b.status; break;
        case "version": aVal = a.version; bVal = b.version; break;
        case "tailor_count": aVal = a.tailor_count; bVal = b.tailor_count; break;
        case "created_at": aVal = a.created_at; bVal = b.created_at; break;
        case "last_used_at": aVal = a.last_used_at || ""; bVal = b.last_used_at || ""; break;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [resumes, filterStatus, searchQuery, sortField, sortDir]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filteredResumes.length / pageSize);
  const paginatedResumes = filteredResumes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (isLoading || isLoading2) {
    return <ResumesSkeleton />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Resumes</h1>
              <p className="text-gray-600">Manage and organize your resume collection</p>
            </div>
            <Link
              href="/resumes/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span>➕</span> New Resume
            </Link>
          </div>

          {/* Toolbar: search, filter, view toggle */}
          {resumes.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <div className="ml-auto flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Card view"
                >
                  ▦ Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Table view"
                >
                  ☰ Table
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {resumes.length > 0 ? (
          filteredResumes.length > 0 ? (
            <>
            {viewMode === "cards" ? (
              /* ───── Cards View ───── */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{resume.title}</h3>
                    {resume.is_default && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{resume.file_name}</p>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Status</p>
                      <p className="text-sm font-medium capitalize text-gray-900">{resume.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Version</p>
                      <p className="text-sm font-medium text-gray-900">v{resume.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Tailored</p>
                      <p className="text-sm font-medium text-gray-900">{resume.tailor_count} times</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(resume.created_at)}</p>
                    </div>
                  </div>

                  {resume.last_used_at && (
                    <div className="mb-4 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700">
                        Last used: {formatDate(resume.last_used_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-2">
                  <Link
                    href={`/resumes/${resume.id}/edit`}
                    className="w-full block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  >
                    ✏️ Edit
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {!resume.is_default && (
                      <button
                        onClick={() => handleSetDefault(resume.id)}
                        disabled={settingDefaultId === resume.id}
                        className="py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium transition-colors disabled:opacity-50 text-sm"
                      >
                        {settingDefaultId === resume.id ? "Setting..." : "Set Default"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors disabled:opacity-50 text-sm"
                    >
                      {deletingId === resume.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            ) : (
              /* ───── Table View ───── */
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort("title")}>
                        Title <SortIcon field="title" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                        Status <SortIcon field="status" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none text-center" onClick={() => toggleSort("version")}>
                        Ver <SortIcon field="version" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none text-center" onClick={() => toggleSort("tailor_count")}>
                        Tailored <SortIcon field="tailor_count" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                        Created <SortIcon field="created_at" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort("last_used_at")}>
                        Last Used <SortIcon field="last_used_at" />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedResumes.map((resume) => (
                      <tr
                        key={resume.id}
                        className="hover:bg-blue-50 transition cursor-pointer"
                        onClick={() => router.push(`/resumes/${resume.id}/edit`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{resume.title}</span>
                            {resume.is_default && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{resume.file_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            resume.status === "active" ? "bg-green-100 text-green-700" :
                            resume.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {resume.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">v{resume.version}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{resume.tailor_count}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(resume.created_at)}</td>
                        <td className="px-4 py-3 text-gray-600">{resume.last_used_at ? formatDate(resume.last_used_at) : "—"}</td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/resumes/${resume.id}/edit`}
                              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                            >
                              Edit
                            </Link>
                            {!resume.is_default && (
                              <button
                                onClick={() => handleSetDefault(resume.id)}
                                disabled={settingDefaultId === resume.id}
                                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition disabled:opacity-50"
                              >
                                {settingDefaultId === resume.id ? "..." : "Default"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(resume.id)}
                              disabled={deletingId === resume.id}
                              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition disabled:opacity-50"
                            >
                              {deletingId === resume.id ? "..." : "Delete"}
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
              totalItems={filteredResumes.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </>
          ) : (
            /* No results for current filter */
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No resumes match your search or filter.</p>
              <button onClick={() => { setSearchQuery(""); setFilterStatus("all"); }} className="mt-3 text-blue-600 hover:underline text-sm">
                Clear filters
              </button>
            </div>
          )
        ) : (
          <EmptyState
            icon={FileText}
            title="No Resumes Yet"
            subtitle="Create your first resume to get started"
            actionLabel="Create Resume"
            actionHref="/resumes/new"
          />
        )}

        {/* Tips Section */}
        {resumes.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Resume Tips</h3>
            <ul className="text-blue-800 space-y-2">
              <li>✓ Keep your default resume updated with recent achievements</li>
              <li>✓ Create tailored versions for different job types</li>
              <li>✓ Use the Edit feature to customize for specific applications</li>
              <li>✓ Archive old versions to keep your library organized</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
