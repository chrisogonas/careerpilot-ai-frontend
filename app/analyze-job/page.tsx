"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { JobAnalysisResponse } from "@/lib/types";

export default function AnalyzeJobPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.analyzeJob({
        job_description: jobDescription,
        user_id: user?.id,
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setResult(null);
    setError("");
    setJobUrl("");
    setUrlLoading(false);
    setCompanyName("");
    setTargetRole("");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analyze Job Description</h1>
          <p className="text-gray-600 mt-2">
            Extract key requirements and skills from any job posting
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleAnalyze} className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
              {/* Job URL Auto-Extract */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Posting URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!jobUrl.trim()) return;
                      try {
                        setUrlLoading(true);
                        const result = await apiClient.extractJobFromURL(jobUrl.trim());
                        setJobDescription(result.job_description);
                        if (result.company) setCompanyName(result.company);
                        if (result.title) setTargetRole(result.title);
                      } catch (err: any) {
                        alert(err.message || "Failed to extract job description");
                      } finally {
                        setUrlLoading(false);
                      }
                    }}
                    disabled={urlLoading || !jobUrl.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition disabled:opacity-60 text-sm whitespace-nowrap"
                  >
                    {urlLoading ? "Extracting..." : "Extract JD"}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Supports LinkedIn, Indeed, Glassdoor, and most job boards
                </p>
              </div>

              {/* Company Name & Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={12}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Include the full job posting with description, responsibilities, and requirements
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing..." : "Analyze Job"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Extracted Requirements
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.extracted_requirements}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.extracted_requirements);
                  alert("Requirements copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Copy Requirements
              </button>
              <button
                onClick={handleReset}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
