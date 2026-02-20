"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { CreateApplicationPayload, JobApplicationStatus } from "@/lib/types";

export default function NewApplicationPage() {
  const router = useRouter();
  const { createApplication, isLoading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateApplicationPayload>({
    job_title: "",
    company_name: "",
    job_url: "",
    job_description: "",
    status: "applied",
    notes: "",
    salary_range: "",
    location: "",
    job_type: "full-time",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveSuccess(false);

    // Validation
    if (!formData.job_title.trim()) {
      setFormError("Job title is required");
      return;
    }
    if (!formData.company_name.trim()) {
      setFormError("Company name is required");
      return;
    }

    try {
      const application = await createApplication(formData);
      setSaveSuccess(true);
      
      // Redirect to view the new application after 1 second
      setTimeout(() => {
        router.push(`/applications/${application.id}`);
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create application";
      setFormError(message);
    }
  };

  const statusOptions: JobApplicationStatus[] = ["saved", "applied", "phone_screen", "interview", "final_round", "offer", "accepted", "rejected", "withdrawn"];
  const statusLabels: Record<JobApplicationStatus, string> = {
    saved: "Saved",
    applied: "Applied",
    phone_screen: "Phone Screen",
    interview: "Interview",
    final_round: "Final Round",
    offer: "Offer",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">New Application</h1>
          <p className="text-slate-600">Add a job application to track</p>
        </div>

        {/* Error/Success Messages */}
        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {formError || error}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✓ Application created successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 border border-slate-200">
          {/* Job Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Job Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Company Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Company Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="e.g., Google"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Job URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Job Posting URL</label>
            <input
              type="url"
              name="job_url"
              value={formData.job_url}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Job Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Job Description</label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleInputChange}
              placeholder="Paste the job description here..."
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            />
          </div>

          {/* Job Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., San Francisco, CA or Remote"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Salary Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Salary Range</label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleInputChange}
              placeholder="e.g., $120,000 - $150,000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Tags (max 5)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="e.g., startup, machine-learning"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={(formData.tags?.length || 0) >= 5}
                className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any notes about this application..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {isLoading ? "Creating..." : "Create Application"}
            </button>
            <Link
              href="/applications"
              className="px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Application Tips</h3>
          <ul className="space-y-2 text-blue-900 text-sm">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Save applications as you apply to keep everything organized</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Include the job description for easy reference</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Use tags to categorize by company, industry, or role type</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Add notes about interesting points or follow-up reminders</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
