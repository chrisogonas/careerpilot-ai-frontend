"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse, Resume, CoverLetterResponse, StarStoryResponse } from "@/lib/types";

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

  // Cover letter toggle
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  // STAR stories toggle
  const [generateStarStories, setGenerateStarStories] = useState(false);
  const [starStoryCount, setStarStoryCount] = useState(3);
  const [starStoriesResult, setStarStoriesResult] = useState<string[] | null>(null);
  const [starStoriesLoading, setStarStoriesLoading] = useState(false);

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

      // Generate cover letter if toggled on
      if (generateCoverLetter) {
        setCoverLetterLoading(true);
        try {
          const clResponse = await apiClient.generateCoverLetter({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            company_name: companyName || "the company",
            role_title: targetRole,
          });
          setCoverLetterResult(clResponse.cover_letter);
        } catch (clErr) {
          console.error("Cover letter generation failed:", clErr);
          setCoverLetterResult("Failed to generate cover letter. You can try again from the Cover Letter page.");
        } finally {
          setCoverLetterLoading(false);
        }
      }

      // Generate STAR stories if toggled on
      if (generateStarStories) {
        setStarStoriesLoading(true);
        try {
          const starResponse = await apiClient.generateStarStories({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            count: starStoryCount,
          });
          setStarStoriesResult(starResponse.star_stories);
        } catch (starErr) {
          console.error("STAR stories generation failed:", starErr);
          setStarStoriesResult(["Failed to generate STAR stories. You can try again from the STAR Stories page."]);
        } finally {
          setStarStoriesLoading(false);
        }
      }
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
    setCoverLetterResult(null);
    setCoverLetterLoading(false);
    setStarStoriesResult(null);
    setStarStoriesLoading(false);
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
                        <select
                          value={selectedResumeId}
                          onChange={(e) => handleResumeSelect(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Select a resume --</option>
                          {savedResumes.map((resume) => (
                            <option key={resume.id} value={resume.id}>
                              {resume.title} (v{resume.version} • {resume.content.length} chars)
                            </option>
                          ))}
                        </select>
                        {selectedResumeId && (
                          <>
                            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-slate-50">
                                  {savedResumes.find((r) => r.id === selectedResumeId)?.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                  Version {savedResumes.find((r) => r.id === selectedResumeId)?.version} • {resumeText.length} characters
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-500">
                                  Updated: {selectedResumeId && new Date(savedResumes.find((r) => r.id === selectedResumeId)?.updated_at || "").toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                              <p className="text-blue-800 dark:text-blue-200 text-sm">
                                ✓ Selected resume loaded ({resumeText.length} characters)
                              </p>
                            </div>
                          </>
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

              {/* Cover Letter Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateCoverLetter}
                    onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                    className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-slate-50">
                      Also generate a Cover Letter
                    </span>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      A tailored cover letter will be created alongside your resume (costs 2 additional credits)
                    </p>
                  </div>
                </label>

                {generateCoverLetter && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Company Name (optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* STAR Stories Toggle */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateStarStories}
                    onChange={(e) => setGenerateStarStories(e.target.checked)}
                    className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-slate-50">
                      Also generate STAR Interview Stories
                    </span>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Get interview-ready STAR stories (Situation, Task, Action, Result) tailored to this job (costs 1 additional credit)
                    </p>
                  </div>
                </label>

                {generateStarStories && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Number of Stories
                    </label>
                    <select
                      value={starStoryCount}
                      onChange={(e) => setStarStoryCount(Number(e.target.value))}
                      aria-label="Number of STAR stories"
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "story" : "stories"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !resumeText.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {loading
                  ? (() => {
                      const extras = [
                        generateCoverLetter && "Cover Letter",
                        generateStarStories && "STAR Stories",
                      ].filter(Boolean);
                      return extras.length
                        ? `Tailoring Resume & Generating ${extras.join(" & ")}...`
                        : "Tailoring Resume...";
                    })()
                  : (() => {
                      const extras = [
                        generateCoverLetter && "Cover Letter",
                        generateStarStories && "STAR Stories",
                      ].filter(Boolean);
                      return extras.length
                        ? `Tailor Resume & Generate ${extras.join(" & ")}`
                        : "Tailor Resume";
                    })()}
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
                      Copy Resume
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      Tailor Another Resume
                    </button>
                  </div>

                  {/* Cover Letter Result */}
                  {coverLetterLoading && (
                    <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
                        <p className="text-purple-800 dark:text-purple-200 font-medium">Generating cover letter...</p>
                      </div>
                    </div>
                  )}

                  {coverLetterResult && !coverLetterLoading && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                        <span className="text-purple-600">✉️</span> Generated Cover Letter
                      </h3>
                      <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {coverLetterResult}
                        </p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coverLetterResult);
                            alert("Cover letter copied to clipboard!");
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition"
                        >
                          Copy Cover Letter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STAR Stories Result */}
                  {starStoriesLoading && (
                    <div className="mt-8 p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
                        <p className="text-green-800 dark:text-green-200 font-medium">Generating STAR interview stories...</p>
                      </div>
                    </div>
                  )}

                  {starStoriesResult && !starStoriesLoading && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                        <span className="text-green-600">⭐</span> STAR Interview Stories
                      </h3>
                      <div className="space-y-4">
                        {starStoriesResult.map((story, idx) => (
                          <div
                            key={idx}
                            className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800"
                          >
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                              Story {idx + 1}
                            </p>
                            <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {story}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            const allStories = starStoriesResult
                              .map((s, i) => `--- Story ${i + 1} ---\n${s}`)
                              .join("\n\n");
                            navigator.clipboard.writeText(allStories);
                            alert("STAR stories copied to clipboard!");
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-2 rounded-lg font-medium transition"
                        >
                          Copy All STAR Stories
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
