"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { Resume } from "@/lib/types";

interface ResumeInputError {
  message: string;
}

export default function StarStoriesPage() {
  const { user, isAuthenticated, getResumes, uploadResumeFile } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [storyCount, setStoryCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<string[] | null>(null);

  // Resume input method states
  const [resumeInputMethod, setResumeInputMethod] = useState<"select" | "upload" | "paste">("select");
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [resumeInputError, setResumeInputError] = useState<ResumeInputError | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FILE_TYPES = [".pdf", ".docx", ".txt"];

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

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeInputError(null);

    // Validate file type
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      setResumeInputError({
        message: `Invalid file type. Accepted types: ${ALLOWED_FILE_TYPES.join(", ")}`,
      });
      setUploadFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setResumeInputError({
        message: `File size exceeds 5 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const handleUploadFile = async () => {
    if (!uploadFile) {
      setResumeInputError({ message: "Please select a file" });
      return;
    }

    setUploadingFile(true);
    setResumeInputError(null);

    try {
      const response = await uploadResumeFile(uploadFile);
      setResumeText(response.parsed.experience_text);
      setUploadFile(null);
    } catch (err) {
      setResumeInputError({
        message: err instanceof Error ? err.message : "Failed to upload file",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleResumeSelect = (id: string) => {
    const resume = savedResumes.find((r) => r.id === id);
    if (resume) {
      setSelectedResumeId(id);
      setResumeText(resume.content);
      setResumeInputError(null);
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
              {/* Resume Text - Multiple Input Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Resume *
                </label>

                {/* Resume Method Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setResumeInputMethod("select");
                      setResumeInputError(null);
                      setUploadFile(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      resumeInputMethod === "select"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📚 Select Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeInputMethod("upload");
                      setResumeInputError(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      resumeInputMethod === "upload"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📤 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeInputMethod("paste");
                      setResumeInputError(null);
                      setUploadFile(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      resumeInputMethod === "paste"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    📋 Paste Text
                  </button>
                </div>

                {/* Error Message */}
                {resumeInputError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-sm">{resumeInputError.message}</p>
                  </div>
                )}

                {/* Select Saved Resume Method */}
                {resumeInputMethod === "select" && (
                  <div className="space-y-3">
                    {savedResumes.length > 0 ? (
                      <>
                        <div className="grid gap-3">
                          {savedResumes.map((resume) => (
                            <button
                              key={resume.id}
                              type="button"
                              onClick={() => handleResumeSelect(resume.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedResumeId === resume.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
                              }`}
                            >
                              <h4 className="font-semibold text-gray-900">
                                {resume.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Version {resume.version} • {resume.content.length} characters
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Updated: {new Date(resume.updated_at).toLocaleDateString()}
                              </p>
                            </button>
                          ))}
                        </div>
                        {selectedResumeId && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-blue-800 text-sm">
                              ✓ Selected resume loaded ({resumeText.length} characters)
                            </p>
                          </div>
                        )}
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
                )}

                {/* Upload File Method */}
                {resumeInputMethod === "upload" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 text-sm">
                        ℹ️ Supported formats: PDF, DOCX, TXT • Maximum size: 5 MB
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="resume-file-upload"
                      />
                      <label htmlFor="resume-file-upload" className="cursor-pointer block">
                        <div className="text-4xl mb-3">📄</div>
                        <p className="font-medium text-gray-900">
                          {uploadFile ? uploadFile.name : "Click to select file"}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          or drag and drop your resume
                        </p>
                      </label>
                    </div>

                    {uploadFile && !uploadingFile && (
                      <button
                        type="button"
                        onClick={handleUploadFile}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ✓ Extract & Load Resume
                      </button>
                    )}

                    {uploadingFile && (
                      <div className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-center font-medium">
                        <span className="inline-block animate-spin mr-2">⟳</span>
                        Extracting text...
                      </div>
                    )}

                    {resumeText && resumeInputMethod === "upload" && !uploadFile && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-800 text-sm">
                          ✓ Resume loaded ({resumeText.length} characters)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste Text Method */}
                {resumeInputMethod === "paste" && (
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setResumeInputError(null);
                    }}
                    placeholder="Paste your resume text here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                  />
                )}

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
                  {[3, 5, 7, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Stories
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
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {story}
                  </p>
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
