"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Resume } from "@/lib/types";

export default function ResumesPage() {
  const router = useRouter();
  const { user, isLoading, getResumes, deleteResume, setDefaultResume } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchResumes = async () => {
      try {
        setIsLoading2(true);
        const fetchedResumes = await getResumes();
        setResumes(fetchedResumes);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      setDeletingId(id);
      await deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete resume:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      await setDefaultResume(id);
      setResumes(resumes.map(r => ({ ...r, is_default: r.id === id })));
    } catch (err) {
      console.error("Failed to set default resume:", err);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || isLoading2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Resumes</h1>
              <p className="text-gray-600">Manage and organize your resume collection</p>
            </div>
            <Link
              href="/resumes/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span>➕</span> New Resume
            </Link>
          </div>
        </div>

        {/* Resumes Grid */}
        {resumes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{resume.title}</h3>
                    {resume.is_default && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{resume.file_name}</p>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Status</p>
                      <p className="text-sm font-medium capitalize text-gray-900">{resume.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Version</p>
                      <p className="text-sm font-medium text-gray-900">v{resume.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Tailored</p>
                      <p className="text-sm font-medium text-gray-900">{resume.tailor_count} times</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(resume.created_at)}</p>
                    </div>
                  </div>

                  {resume.last_used_at && (
                    <div className="mb-4 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-700">
                        Last used: {formatDate(resume.last_used_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-2">
                  <Link
                    href={`/resumes/${resume.id}/edit`}
                    className="w-full block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  >
                    ✏️ Edit
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {!resume.is_default && (
                      <button
                        onClick={() => handleSetDefault(resume.id)}
                        disabled={settingDefaultId === resume.id}
                        className="py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium transition-colors disabled:opacity-50 text-sm"
                      >
                        {settingDefaultId === resume.id ? "Setting..." : "Set Default"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors disabled:opacity-50 text-sm"
                    >
                      {deletingId === resume.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Resumes Yet</h2>
            <p className="text-gray-600 mb-6">Create your first resume to get started</p>
            <Link
              href="/resumes/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              ➕ Create Resume
            </Link>
          </div>
        )}

        {/* Tips Section */}
        {resumes.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Resume Tips</h3>
            <ul className="text-blue-800 space-y-2">
              <li>✓ Keep your default resume updated with recent achievements</li>
              <li>✓ Create tailored versions for different job types</li>
              <li>✓ Use the Edit feature to customize for specific applications</li>
              <li>✓ Archive old versions to keep your library organized</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
