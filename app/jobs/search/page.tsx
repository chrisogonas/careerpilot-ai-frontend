"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/utils/api";
import {
  JobSearchResultItem,
  JobSearchResponse,
  SavedJobSearch,
} from "@/lib/types";

// ── Filter constants ────────────────────────────────────────────────────────
const DATE_OPTIONS = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "3days", label: "Past 3 days" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

// ── Main Page ───────────────────────────────────────────────────────────────
export default function JobSearchPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Search form state
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [datePosted, setDatePosted] = useState("all");
  const [employmentType, setEmploymentType] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Results & UI state
  const [results, setResults] = useState<JobSearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [cached, setCached] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedJobSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const hasFetchedSaved = useRef(false);

  // saving-in-flight tracker
  const [savingAppIds, setSavingAppIds] = useState<Set<string>>(new Set());

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // ── Load saved searches once ────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || hasFetchedSaved.current) return;
    hasFetchedSaved.current = true;
    loadSavedSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadSavedSearches = async () => {
    try {
      const resp = await apiClient.getSavedSearches();
      setSavedSearches(resp.searches);
    } catch {
      // silent – non-critical
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (e?: React.FormEvent, overridePage?: number) => {
      e?.preventDefault();
      if (!query.trim()) return;
      setError(null);
      setSuccessMsg(null);
      setIsSearching(true);
      setExpandedId(null);

      try {
        const resp: JobSearchResponse = await apiClient.searchJobs({
          query: query.trim(),
          location: location.trim() || undefined,
          page: overridePage ?? page,
          date_posted: datePosted !== "all" ? datePosted : undefined,
          employment_type: employmentType || undefined,
          remote_only: remoteOnly,
        });
        setResults(resp.results);
        setTotalResults(resp.total_results);
        setCreditsRemaining(resp.credits_remaining);
        setCached(resp.cached);
        if (resp.results.length === 0) {
          setError("No results found. Try broadening your search.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Search failed. Please try again.";
        setError(message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [query, location, page, datePosted, employmentType, remoteOnly],
  );

  // ── Pagination ──────────────────────────────────────────────────────────
  const goToPage = (newPage: number) => {
    setPage(newPage);
    handleSearch(undefined, newPage);
  };

  // ── Save search ─────────────────────────────────────────────────────────
  const handleSaveSearch = async () => {
    try {
      await apiClient.saveJobSearch({
        query,
        location: location || undefined,
        date_posted: datePosted !== "all" ? datePosted : undefined,
        employment_type: employmentType || undefined,
        remote_only: remoteOnly,
        results_count: results.length,
      });
      setSuccessMsg("Search saved!");
      loadSavedSearches();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save search.");
    }
  };

  // ── Rerun a saved search ───────────────────────────────────────────────
  const rerunSaved = async (s: SavedJobSearch) => {
    setQuery(s.query);
    setLocation(s.location || "");
    setDatePosted(s.date_posted || "all");
    setEmploymentType(s.employment_type || "");
    setRemoteOnly(s.remote_only);
    setPage(1);
    setShowSaved(false);
    setError(null);
    setSuccessMsg(null);
    setIsSearching(true);
    setExpandedId(null);

    try {
      const resp: JobSearchResponse = await apiClient.searchJobs({
        query: s.query.trim(),
        location: s.location?.trim() || undefined,
        page: 1,
        date_posted: s.date_posted && s.date_posted !== "all" ? s.date_posted : undefined,
        employment_type: s.employment_type || undefined,
        remote_only: s.remote_only,
      });
      setResults(resp.results);
      setTotalResults(resp.total_results);
      setCreditsRemaining(resp.credits_remaining);
      setCached(resp.cached);
      if (resp.results.length === 0) {
        setError("No results found. Try broadening your search.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Search failed. Please try again.";
      setError(message);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ── Delete saved search ────────────────────────────────────────────────
  const handleDeleteSaved = async (id: string) => {
    try {
      await apiClient.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silent
    }
  };

  // ── Save result as application ─────────────────────────────────────────
  const handleSaveAsApp = async (job: JobSearchResultItem) => {
    setSavingAppIds((prev) => new Set(prev).add(job.job_id));
    try {
      const resp = await apiClient.saveJobAsApplication({
        job_id: job.job_id,
        title: job.title,
        company: job.company,
        location: job.location,
        apply_link: job.apply_link,
        description: job.description,
        salary_min: job.salary_min ?? undefined,
        salary_max: job.salary_max ?? undefined,
        employment_type: job.employment_type ?? undefined,
        source: job.source ?? undefined,
      });
      setSuccessMsg(resp.message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save to applications.");
    } finally {
      setSavingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(job.job_id);
        return next;
      });
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────
  const formatSalary = (job: JobSearchResultItem) => {
    if (!job.salary_min && !job.salary_max) return null;
    const parts: string[] = [];
    if (job.salary_min) parts.push(`$${job.salary_min.toLocaleString()}`);
    if (job.salary_max) parts.push(`$${job.salary_max.toLocaleString()}`);
    const range = parts.join(" – ");
    const period = job.salary_period ? `/${job.salary_period}` : "";
    return `${range}${period}`;
  };

  const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔍 Job Board Search
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search across Indeed, LinkedIn, Glassdoor &amp; more — powered by JSearch
          </p>
        </div>
        <div className="flex items-center gap-3">
          {creditsRemaining !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Credits: <b className="text-emerald-600">{creditsRemaining}</b>
            </span>
          )}
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {showSaved ? "Hide Saved" : `Saved (${savedSearches.length})`}
          </button>
        </div>
      </div>

      {/* ── Saved searches drawer ─────────────────────────────────── */}
      {showSaved && savedSearches.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            Saved Searches
          </h3>
          <div className="space-y-2">
            {savedSearches.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2"
              >
                <button
                  onClick={() => rerunSaved(s)}
                  className="text-left flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span className="font-medium">{s.name}</span>
                  {s.results_count !== null && s.results_count !== undefined && (
                    <span className="text-gray-400 ml-2">({s.results_count} results)</span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteSaved(s.id)}
                  className="ml-2 text-red-400 hover:text-red-600 text-xs"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Search form ───────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          setPage(1);
          handleSearch(e, 1);
        }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 space-y-4"
      >
        {/* Row 1: query + location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Job title, keywords, or company
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Python developer"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, NY or Remote"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 2: filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={datePosted}
            onChange={(e) => setDatePosted(e.target.value)}
            aria-label="Date posted filter"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            aria-label="Employment type filter"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Remote only
          </label>

          <div className="flex-1" />

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
          >
            {isSearching ? "Searching…" : "Search Jobs"}
          </button>
        </div>
      </form>

      {/* ── Status messages ───────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      {/* ── Results toolbar ───────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <b>{results.length}</b> of ~{totalResults} results
            {cached && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(cached)</span>
            )}
          </p>
          <button
            onClick={handleSaveSearch}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Save this search to run again later"
          >
            💾 Save Search
          </button>
        </div>
      )}

      {/* ── Results grid ──────────────────────────────────────────── */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Searching job boards…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((job) => {
            const isExpanded = expandedId === job.job_id;
            const salary = formatSalary(job);
            const isSaving = savingAppIds.has(job.job_id);

            return (
              <div
                key={job.job_id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition hover:shadow-md"
              >
                {/* Card header */}
                <div className="p-4 sm:p-5 flex gap-4">
                  {/* Logo */}
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
                      {job.company.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {job.company}
                          {job.company_url && (
                            <a
                              href={job.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-500 hover:underline"
                            >
                              ↗
                            </a>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {timeAgo(job.date_posted)}
                      </span>
                    </div>

                    {/* Tags row */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        📍 {job.location}
                      </span>
                      {job.employment_type && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                          {job.employment_type}
                        </span>
                      )}
                      {job.is_remote && (
                        <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          🏠 Remote
                        </span>
                      )}
                      {salary && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                          💰 {salary}
                        </span>
                      )}
                      {job.source && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                          via {job.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand / collapse description */}
                <div className="px-4 sm:px-5 pb-3">
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : job.job_id)
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isExpanded ? "Hide description ▲" : "Show description ▼"}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto whitespace-pre-wrap border-t border-gray-100 dark:border-gray-700 pt-3">
                      {job.description}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                  {job.apply_link && (
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      Apply ↗
                    </a>
                  )}
                  <button
                    onClick={() => handleSaveAsApp(job)}
                    disabled={isSaving}
                    className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "📋 Save to Applications"}
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (job.description) params.set("jobDescription", job.description.slice(0, 4000));
                      if (job.title) params.set("jobTitle", job.title);
                      if (job.company) params.set("companyName", job.company);
                      if (job.apply_link) params.set("jobUrl", job.apply_link);
                      window.open(`/tailor?${params.toString()}`, "_blank");
                    }}
                    className="px-4 py-1.5 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
                  >
                    ✂️ Tailor Resume for this Job
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (job.description) params.set("jobDescription", job.description.slice(0, 4000));
                      if (job.title) params.set("targetRole", job.title);
                      if (job.company) params.set("companyName", job.company);
                      if (job.apply_link) params.set("jobUrl", job.apply_link);
                      window.open(`/mock-interview?${params.toString()}`, "_blank");
                    }}
                    className="px-4 py-1.5 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                  >
                    🎤 Do Mock Interview for this Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!isSearching && results.length === 0 && !error && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔎</div>
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Search for jobs across major job boards
          </p>
          <p className="text-sm mt-1">
            Enter a job title or keywords above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
