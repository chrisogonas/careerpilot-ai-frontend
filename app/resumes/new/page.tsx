"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

interface UploadError {
  message: string;
  detail?: string;
}

export default function NewResumePage() {
  const router = useRouter();
  const { user, isLoading, createResume, uploadResume, uploadResumeFile } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FILE_TYPES = [".pdf", ".docx", ".txt"];

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setExtractedText(null);

    // Validate file type
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      setUploadError({
        message: `Invalid file type. Accepted types: ${ALLOWED_FILE_TYPES.join(", ")}`,
      });
      setUploadFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError({
        message: `File size exceeds 5 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const handleUploadFile = async () => {
    if (!uploadFile) {
      setUploadError({ message: "Please select a file" });
      return;
    }

    if (!title.trim()) {
      setUploadError({ message: "Please enter a resume title" });
      return;
    }

    try {
      setIsCreating(true);
      setUploadError(null);

      // Upload file to backend
      const uploadResponse = await uploadResumeFile(uploadFile);

      // Extract text from response
      const extractedContent = uploadResponse.parsed.experience_text;
      setExtractedText(extractedContent);
      setContent(extractedContent);

      // Now create the resume using the extracted text
      const newResume = await createResume({
        title,
        content: extractedContent,
        file_name: uploadResponse.filename,
        is_default: false,
      });

      router.push(`/resumes/${newResume.id}/edit`);
    } catch (err) {
      console.error("Failed to upload resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume file";
      setUploadError({ message: errorMessage });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePasteText = async () => {
    if (!title.trim()) {
      setUploadError({ message: "Please enter a resume title" });
      return;
    }

    if (!content.trim()) {
      setUploadError({ message: "Please paste resume content" });
      return;
    }

    try {
      setIsCreating(true);
      setUploadError(null);

      // Upload pasted text
      const uploadResponse = await uploadResume({
        filename: `${title.replace(/\s+/g, "-")}.txt`,
        content,
      });

      // Create resume from uploaded content
      const newResume = await createResume({
        title,
        content: uploadResponse.parsed.experience_text || content,
        file_name: uploadResponse.filename,
        is_default: false,
      });

      router.push(`/resumes/${newResume.id}/edit`);
    } catch (err) {
      console.error("Failed to upload resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume";
      setUploadError({ message: errorMessage });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/resumes" className="text-blue-600 hover:underline mb-4 inline-block dark:text-blue-400">
            ← Back to Resumes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-50">Upload Resume</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Add your resume by uploading a file or pasting text</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          {/* Title Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 dark:text-slate-50 mb-2">
              Resume Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer Resume"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              This is how we'll label your resume in your library
            </p>
          </div>

          {/* Upload Method Toggle */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4">
              How would you like to add your resume? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setUploadMethod("text");
                  setUploadError(null);
                  setUploadFile(null);
                  setExtractedText(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  uploadMethod === "text"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200"
                    : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 hover:border-gray-400 dark:hover:border-slate-500"
                }`}
              >
                📋 Paste Text
              </button>
              <button
                onClick={() => {
                  setUploadMethod("file");
                  setUploadError(null);
                  setContent("");
                  setExtractedText(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  uploadMethod === "file"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200"
                    : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 hover:border-gray-400 dark:hover:border-slate-500"
                }`}
              >
                📤 Upload File
              </button>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium">{uploadError.message}</p>
              {uploadError.detail && (
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{uploadError.detail}</p>
              )}
            </div>
          )}

          {/* Paste Text Method */}
          {uploadMethod === "text" && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4">
                Paste Your Resume <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setUploadError(null);
                }}
                placeholder="Paste your complete resume text here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {content.length} characters • Plain text format recommended
              </p>
            </div>
          )}

          {/* File Upload Method */}
          {uploadMethod === "file" && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4">
                Select File <span className="text-red-500">*</span>
              </label>
              
              {/* File Size Note */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  ℹ️ Supported formats: PDF, DOCX, TXT • Maximum size: 5 MB
                </p>
              </div>

              {/* File Input with Drag & Drop */}
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="font-medium text-gray-900 dark:text-slate-50">
                    {uploadFile ? uploadFile.name : "Click to select file"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    or drag and drop your resume
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Preview (if text is available) */}
          {content && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-50 mb-3">Preview</p>
              <div className="bg-white dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-600 max-h-48 overflow-y-auto">
                <div className="text-sm text-gray-800 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {content}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={uploadMethod === "text" ? handlePasteText : handleUploadFile}
              disabled={
                isCreating ||
                !title.trim() ||
                (uploadMethod === "text" && !content.trim()) ||
                (uploadMethod === "file" && !uploadFile)
              }
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  {uploadMethod === "file" ? "Uploading..." : "Creating..."}
                </span>
              ) : (
                <span>✓ {uploadMethod === "file" ? "Upload & Create Resume" : "Create Resume"}</span>
              )}
            </button>
            <Link
              href="/resumes"
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-50 rounded-lg font-semibold transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 Tips for Best Results</h3>
          <ul className="text-blue-800 dark:text-blue-300 space-y-2">
            <li>✓ Keep formatting simple and clean for ATS compatibility</li>
            <li>✓ Use standard section headings (EXPERIENCE, EDUCATION, SKILLS)</li>
            <li>✓ Include measurable achievements and results</li>
            <li>✓ Use keywords from the job description you're applying for</li>
            <li>✓ Keep each role description to 3-4 bullet points maximum</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
