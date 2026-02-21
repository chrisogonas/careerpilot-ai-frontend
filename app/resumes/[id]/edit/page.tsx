"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Resume } from "@/lib/types";

function ResumeEditorContent({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const { user, isLoading, getResume, updateResume } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading2, setIsLoading2] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchResume = async () => {
      try {
        setIsLoading2(true);
        const fetchedResume = await getResume(resumeId);
        setResume(fetchedResume);
        setTitle(fetchedResume?.title || "");
        setContent(fetchedResume?.content || "");
      } catch (err) {
        console.error("Failed to fetch resume:", err);
        router.push("/resumes");
      } finally {
        setIsLoading2(false);
      }
    };

    fetchResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, resumeId]);

  // Auto-save: only triggers 5 minutes after the last edit
  useEffect(() => {
    if (!autoSaveEnabled || !resume) return;

    const timer = setTimeout(async () => {
      try {
        await updateResume(resumeId, { title, content });
        setLastSavedTime(new Date());
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes of inactivity

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, autoSaveEnabled, resume, resumeId]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and content");
      return;
    }

    try {
      setIsSaving(true);
      await updateResume(resumeId, { title, content });
      setLastSavedTime(new Date());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save resume:", err);
      alert("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading || isLoading2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Resume not found</p>
          <Link href="/resumes" className="text-blue-600 hover:underline">
            ← Back to Resumes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Link href="/resumes" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Resume</h1>
            </div>
            <div className="flex items-center gap-4">
              {lastSavedTime && (
                <p className="text-sm text-gray-600">
                  Saved at {formatTime(lastSavedTime)}
                </p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-600 font-medium">✓ Saved</p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "💾 Save"}
              </button>
            </div>
          </div>

          {/* Auto-save Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-700">Auto-save enabled</span>
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Resume Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer - TechCorp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the name of your resume file, not the job title
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Resume Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">Need help?</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use clear headings (EXPERIENCE, EDUCATION, SKILLS)</li>
                <li>• Include metrics and accomplishments</li>
                <li>• Keep formatting simple and readable</li>
                <li>• Use keywords from job descriptions</li>
              </ul>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Preview
            </label>
            <div className="bg-white border border-gray-300 rounded-lg p-6 h-96 overflow-y-auto shadow-sm">
              {title && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>
              )}
              <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {content ? (
                  content
                ) : (
                  <span className="text-gray-400">Resume preview will appear here...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resume Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Resume Information</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-700 font-medium">Status</p>
              <p className="text-gray-900 capitalize">{resume.status}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Version</p>
              <p className="text-gray-900">v{resume.version}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Times Tailored</p>
              <p className="text-gray-900">{resume.tailor_count}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Created</p>
              <p className="text-gray-900">
                {new Date(resume.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResumeId(p.id));
  }, [params]);

  if (!resumeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResumeEditorContent resumeId={resumeId} />
    </Suspense>
  );
}
