"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse } from "@/lib/types";

export default function TailorResumePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"input" | "result">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState<"professional" | "conversational" | "concise">("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Tailor Your Resume</h1>
          <p className="text-gray-600 mt-2">
            Optimize your resume to match specific job descriptions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {step === "input" ? (
          <form onSubmit={handleTailor} className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
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
                  rows={8}
                />
                <p className="text-gray-500 text-sm mt-1">
                  The more detailed, the better the tailoring
                </p>
              </div>

              {/* Resume Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Resume *
                </label>
                <textarea
                  required
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                />
                <p className="text-gray-500 text-sm mt-1">
                  Current resume that will be optimized
                </p>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role *
                </label>
                <input
                  required
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Data Scientist"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <span className="ml-2 text-gray-700 capitalize">
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
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Tailoring Resume..." : "Tailor Resume"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tailored Resume
              </h2>
              {result && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Extracted Requirements
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {result.extracted_requirements}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Tailored Resume
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
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
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
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
