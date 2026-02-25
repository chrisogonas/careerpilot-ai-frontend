"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { JobApplication } from "@/lib/types";

export default function ResumePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const { isAuthenticated, isLoading: authLoading, getApplication } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadApplication = async () => {
      try {
        setPageLoading(true);
        const data = await getApplication(applicationId);
        setApplication(data.application);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load application";
        setError(message);
      } finally {
        setPageLoading(false);
      }
    };

    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-slate-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error || "Application not found"}
          </div>
          <Link href={`/applications/${applicationId}`} className="text-blue-600 hover:underline">
            ← Back to Application
          </Link>
        </div>
      </div>
    );
  }

  if (!application.applied_resume_text) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4">
            No resume snapshot is available for this application.
          </div>
          <Link href={`/applications/${applicationId}`} className="text-blue-600 hover:underline">
            ← Back to Application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/applications/${applicationId}`} className="text-blue-600 hover:underline text-sm">
            ← Back to Application
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          {/* Title Bar */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {application.applied_resume_title || "Untitled Resume"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Resume snapshot for{" "}
                  <span className="font-semibold text-slate-700">
                    {application.job_title}
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold text-slate-700">
                    {application.company_name}
                  </span>
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Read Only
              </span>
            </div>
          </div>

          {/* Resume Content */}
          <div className="p-6">
            <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-inner whitespace-pre-wrap text-slate-800 text-sm leading-relaxed font-mono max-h-[70vh] overflow-y-auto">
              {application.applied_resume_text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
