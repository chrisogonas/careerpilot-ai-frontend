"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse, Resume } from "@/lib/types";

interface ResumeInputError {
  message: string;
}

export default function TailorResumePage() {
  const { user, isAuthenticated, getResumes, uploadResumeFile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"input" | "result">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<"professional" | "conversational" | "concise">("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);

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
  }, [isAuthenticated, getResumes]);

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

    try {
      setUploadingFile(true);
      setResumeInputError(null);

      const uploadResponse = await uploadResumeFile(uploadFile);
      const extractedText = uploadResponse.parsed.experience_text;
      setResumeText(extractedText);
      setUploadFile(null);
    } catch (err) {
      console.error("Failed to upload file:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file";
      setResumeInputError({ message: errorMessage });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const selectedResume = savedResumes.find((r) => r.id === resumeId);
    if (selectedResume) {
      setResumeText(selectedResume.content);
      setResumeInputError(null);
    }
  };

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resumeText.trim()) {
      setError("Please enter or select a resume");
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error("User not found");

      const response = await apiClient.tailorResume({
        user_id: user.id,
        resume_text: resumeText,
        job_description: jobDescription,
        options: {
          target_role: targetRole,
          tone,
        },
      });

      setResult(response);
      setStep("result");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to tailor resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setJobDescription("");
    setResumeText("");
    setTargetRole("");
    setTone("professional");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-50">Tailor Your Resume</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Optimize your resume to match specific job descriptions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {step === "input" ? (
          <form onSubmit={handleTailor} className="bg-white dark:bg-slate-800 rounded-lg shadow p-8">
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-50 mb-2">
                  Job Description *
                </label>
                <textarea
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                />
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                  The more detailed, the better the tailoring
                </p>
              </div>

              {/* Resume Text - Multiple Input Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-50 mb-4">
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
                        ? "bg-blue-500 dark:bg-blue-700 text-white"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"
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
                        ? "bg-blue-500 dark:bg-blue-700 text-white"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"
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
                        ? "bg-blue-500 dark:bg-blue-700 text-white"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    📋 Paste Text
                  </button>
                </div>

                {/* Error Message */}
                {resumeInputError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-red-700 dark:text-red-200 text-sm">{resumeInputError.message}</p>
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
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                  : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500"
                              }`}
                            >
                              <h4 className="font-semibold text-gray-900 dark:text-slate-50">
                                {resume.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                Version {resume.version} • {resume.content.length} characters
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                Updated: {new Date(resume.updated_at).toLocaleDateString()}
                              </p>
                            </button>
                          ))}
                        </div>
                        {selectedResumeId && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                              ✓ Selected resume loaded ({resumeText.length} characters)
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded">
                        <p className="text-gray-600 dark:text-slate-400">
                          No saved resumes found.{" "}
                          <a href="/resumes/new" className="text-blue-600 dark:text-blue-400 hover:underline">
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
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        ℹ️ Supported formats: PDF, DOCX, TXT • Maximum size: 5 MB
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="resume-file-upload"
                      />
                      <label htmlFor="resume-file-upload" className="cursor-pointer block">
                        <div className="text-4xl mb-3">📄</div>
                        <p className="font-medium text-gray-900 dark:text-slate-50">
                          {uploadFile ? uploadFile.name : "Click to select file"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                          or drag and drop your resume
                        </p>
                      </label>
                    </div>

                    {uploadFile && !uploadingFile && (
                      <button
                        type="button"
                        onClick={handleUploadFile}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        ✓ Extract & Load Resume
                      </button>
                    )}

                    {uploadingFile && (
                      <div className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-center font-medium">
                        <span className="inline-block animate-spin mr-2">⟳</span>
                        Extracting text...
                      </div>
                    )}

                    {resumeText && resumeInputMethod === "upload" && !uploadFile && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-green-800 dark:text-green-200 text-sm">
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                  />
                )}

                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">
                  {resumeText.length} characters loaded
                </p>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-50 mb-2">
                  Target Role *
                </label>
                <input
                  required
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Data Scientist"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-50 mb-2">
                  Writing Tone
                </label>
                <div className="space-y-2">
                  {(["professional", "conversational", "concise"] as const).map(
                    (t) => (
                      <label key={t} className="flex items-center">
                        <input
                          type="radio"
                          name="tone"
                          value={t}
                          checked={tone === t}
                          onChange={(e) =>
                            setTone(e.target.value as typeof tone)
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-gray-700 dark:text-slate-300 capitalize">
                          {t}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !resumeText.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {loading ? "Tailoring Resume..." : "Tailor Resume"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-4">
                Tailored Resume
              </h2>
              {result && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
                      Extracted Requirements
                    </h3>
                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                      {result.extracted_requirements}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">
                      Your Tailored Resume
                    </h3>
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                      <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                        {result.tailored_resume}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.tailored_resume);
                        alert("Resume copied to clipboard!");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      Tailor Another Resume
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
