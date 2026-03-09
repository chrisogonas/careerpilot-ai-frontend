"use client";

import { useState } from "react";
import { apiClient } from "@/lib/utils/api";

interface CoverLetterSectionProps {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  userName: string;
  isFreePlan: boolean;
  creditsRemaining: number;
  onCoverLetterChange: (text: string) => void;
  coverLetterText: string;
  onCreditsUsed: () => void;
  userId: string;
}

const COVER_LETTER_COST = 2;

type Tone = "professional" | "conversational" | "concise";

export default function CoverLetterSection({
  resumeText,
  jobDescription,
  jobTitle,
  companyName,
  userName,
  isFreePlan,
  creditsRemaining,
  onCoverLetterChange,
  coverLetterText,
  onCreditsUsed,
  userId,
}: CoverLetterSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = !isFreePlan && creditsRemaining >= COVER_LETTER_COST && !!resumeText.trim() && !!jobDescription.trim();

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      const response = await apiClient.generateCoverLetter({
        user_id: userId,
        resume_text: resumeText,
        job_description: jobDescription,
        company_name: companyName || "the company",
        role_title: jobTitle,
        tone,
      });
      onCoverLetterChange(response.cover_letter);
      onCreditsUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="border border-indigo-200 rounded-lg overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="font-semibold text-indigo-900 text-sm">Cover Letter</span>
          {coverLetterText && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ready</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-indigo-600 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 py-4 space-y-3 bg-white">
          {/* Credit Info / Gate */}
          {isFreePlan ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Upgrade required.</strong> AI cover letter generation is available on Pro and Premium plans.
              <a href="/pricing" className="ml-1 underline font-medium">View plans</a>
            </div>
          ) : creditsRemaining < COVER_LETTER_COST ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Insufficient credits.</strong> You need {COVER_LETTER_COST} credits to generate a cover letter.
              You have {creditsRemaining}.
              <a href="/pricing" className="ml-1 underline font-medium">Buy credits</a>
            </div>
          ) : null}

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">{error}</div>
          )}

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Writing Tone</label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { value: "professional" as Tone, label: "Professional", icon: "👔" },
                { value: "conversational" as Tone, label: "Conversational", icon: "💬" },
                { value: "concise" as Tone, label: "Concise", icon: "📝" },
              ]).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`p-2 rounded-lg border text-xs font-medium transition ${
                    tone === t.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="block text-sm mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate with AI
                <span className="text-xs opacity-80">({COVER_LETTER_COST} credits)</span>
              </>
            )}
          </button>

          {/* Missing info hints */}
          {!resumeText.trim() && (
            <p className="text-xs text-gray-500 italic">Select a resume above to enable AI generation.</p>
          )}
          {resumeText.trim() && !jobDescription.trim() && (
            <p className="text-xs text-gray-500 italic">Job description not available for this application.</p>
          )}

          {/* Cover Letter Textarea */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cover Letter Text
              <span className="text-gray-400 font-normal ml-1">(edit freely or generate with AI)</span>
            </label>
            <textarea
              value={coverLetterText}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              placeholder={`Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${companyName}...\n\nBest regards,\n${userName.split(" ")[0] || userName}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm font-mono"
              rows={10}
            />
            <p className="text-xs text-gray-400 mt-1">{coverLetterText.length} characters</p>
          </div>
        </div>
      )}
    </div>
  );
}
