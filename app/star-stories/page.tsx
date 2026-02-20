"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";

export default function StarStoriesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [storyCount, setStoryCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<string[] | null>(null);

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

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
              {/* Resume */}
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
                  rows={6}
                />
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
