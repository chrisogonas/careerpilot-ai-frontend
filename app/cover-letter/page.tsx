"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { Resume } from "@/lib/types";

export default function CoverLetterPage() {
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [tone, setTone] = useState<"professional" | "conversational" | "concise">("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Resume selection states
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [showResumeText, setShowResumeText] = useState(false);

  // Job URL extraction
  const [jobUrl, setJobUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // Fetch saved resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const resumes = await getResumes();
        setSavedResumes(resumes);
        if (resumes.length > 0) {
          setSelectedResumeId(resumes[0].id);
          setResumeText(resumes[0].content);
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      }
    };

    if (isAuthenticated) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeText(false);
    const selectedResume = savedResumes.find((r) => r.id === resumeId);
    if (selectedResume) {
      setResumeText(selectedResume.content);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user) throw new Error("User not found");

      const response = await apiClient.generateCoverLetter({
        user_id: user.id,
        resume_text: resumeText,
        job_description: jobDescription,
        company_name: companyName,
        role_title: roleTitle,
        tone: tone,
      });

      setResult(response.cover_letter);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate cover letter. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setCompanyName("");
    setRoleTitle("");
    setTone("professional");
    setJobUrl("");
    setResult(null);
    setError("");
    setSelectedResumeId("");
    setShowResumeText(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Generate Cover Letter</h1>
          <p className="text-gray-600 mt-2">
            Create personalized cover letters tailored to each position
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
              {/* Resume - Select from Saved Resumes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Resume *
                </label>

                <div className="space-y-3">
                  {savedResumes.length > 0 ? (
                    <>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => handleResumeSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select a resume --</option>
                        {savedResumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.title} (v{resume.version} • {resume.content.length} chars)
                          </option>
                        ))}
                      </select>
                      {selectedResumeId && (() => {
                        const selectedResume = savedResumes.find((r) => r.id === selectedResumeId);
                        return selectedResume ? (
                          <>
                            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {selectedResume.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Version {selectedResume.version} • {resumeText.length} characters
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Updated: {new Date(selectedResume.updated_at || "").toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowResumeText(!showResumeText)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-4"
                                >
                                  {showResumeText ? "Hide Text" : "View Text"}
                                </button>
                              </div>
                            </div>
                            {showResumeText && (
                              <textarea
                                value={resumeText}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none cursor-default"
                                rows={8}
                              />
                            )}
                          </>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-gray-600">
                        No saved resumes found.{" "}
                        <a href="/resumes/new" className="text-blue-600 hover:underline">
                          Upload a resume
                        </a>{" "}
                        first.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  {resumeText.length} characters loaded
                </p>
              </div>

              {/* Company Name + Role Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Job URL Auto-Extract */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste a job posting URL
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
                        if (result.title) setRoleTitle(result.title);
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

              {/* Job Description */}
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
                  rows={6}
                />
              </div>

              {/* Writing Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Writing Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "professional", label: "Professional", icon: "👔" },
                    { value: "conversational", label: "Conversational", icon: "💬" },
                    { value: "concise", label: "Concise", icon: "📝" },
                  ] as const).map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition ${
                        tone === t.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <span className="block text-lg mb-1">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Generating Cover Letter..." : "Generate Cover Letter"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Cover Letter
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert("Cover letter copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleReset}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Generate Another Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
