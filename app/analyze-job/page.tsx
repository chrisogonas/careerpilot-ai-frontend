"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { JobAnalysisResponse } from "@/lib/types";

export default function AnalyzeJobPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
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
