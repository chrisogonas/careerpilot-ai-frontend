"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { Resume } from "@/lib/types";

/** Convert markdown bold (**text**) to <strong> elements */
function renderMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function StarStoriesPage() {
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [storyCount, setStoryCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<string[] | null>(null);

  // Resume selection states
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [showResumeText, setShowResumeText] = useState(false);

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

      const response = await apiClient.generateStarStories({
        user_id: user.id,
        resume_text: resumeText,
        job_description: jobDescription,
        count: storyCount,
      });

      setStories(response.star_stories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate STAR stories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setStoryCount(5);
    setStories(null);
    setError("");
    setSelectedResumeId("");
    setShowResumeText(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Generate STAR Stories</h1>
          <p className="text-gray-600 mt-2">
            Perfect your behavioral interview responses with AI-generated STAR stories
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!stories ? (
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

              {/* Story Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Stories
                </label>
                <select
                  value={storyCount}
                  onChange={(e) => setStoryCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Story" : "Stories"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Generating Stories..." : "Generate STAR Stories"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your STAR Stories ({stories.length})
            </h2>

            <div className="space-y-6">
              {stories.map((story, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Story {index + 1}
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(story);
                        alert("Story copied to clipboard!");
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {story.split("\n").map((line, i) => (
                      <p key={i} className={line.trim() === "" ? "h-3" : ""}>
                        {renderMarkdown(line)}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(stories.join("\n\n---\n\n"));
                  alert("All stories copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Copy All Stories
              </button>
              <button
                onClick={handleReset}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Generate New Stories
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
