"use client";

import { useState } from "react";
import { apiClient } from "@/lib/utils/api";
import { TailorResponse, ATSScore } from "@/lib/types";

interface ResumeTailorSectionProps {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  isFreePlan: boolean;
  creditsRemaining: number;
  onCreditsUsed: () => void;
  onTailoredResumeReady: (text: string) => void;
  userId: string;
}

const TAILOR_COST = 5;

export default function ResumeTailorSection({
  resumeText,
  jobDescription,
  jobTitle,
  companyName,
  isFreePlan,
  creditsRemaining,
  onCreditsUsed,
  onTailoredResumeReady,
  userId,
}: ResumeTailorSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [tone, setTone] = useState<"professional" | "conversational" | "concise">("professional");
  const [variationStyle, setVariationStyle] = useState<"balanced" | "skills-focused" | "experience-focused" | "concise">("balanced");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamStatus, setStreamStatus] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState("");

  // Section editing
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionInstructions, setSectionInstructions] = useState("");
  const [sectionEditLoading, setSectionEditLoading] = useState(false);

  // Save
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ATS expanded
  const [atsExpanded, setAtsExpanded] = useState(false);

  const canTailor = !isFreePlan && creditsRemaining >= TAILOR_COST && !!resumeText.trim() && !!jobDescription.trim();

  const getCleanResume = (text: string) => {
    const markers = [
      text.search(/\*{0,2}CUSTOMIZATION EXPLANATION\*{0,2}/),
      text.search(/\*{0,2}GAP ANALYSIS\*{0,2}/),
    ].filter((m) => m !== -1);
    const earliest = markers.length ? Math.min(...markers) : -1;
    return earliest !== -1 ? text.substring(0, earliest).trimEnd() : text;
  };

  const handleTailor = async () => {
    setError("");
    setIsStreaming(true);
    setStreamingText("");
    setStreamStatus("Initializing...");
    setResult(null);
    setSaveSuccess(false);
    setSaveError("");

    try {
      let finalResult: TailorResponse | null = null;

      await apiClient.tailorResumeStream(
        {
          user_id: userId,
          resume_text: resumeText,
          job_description: jobDescription,
          options: {
            target_role: jobTitle,
            tone,
            company_name: companyName || undefined,
            variation_style: variationStyle,
          },
        },
        (event) => {
          switch (event.type) {
            case "status":
              setStreamStatus(event.message || "");
              break;
            case "token":
              setStreamingText((prev) => prev + (event.content || ""));
              break;
            case "replace":
              setStreamingText(event.content || "");
              break;
            case "done":
              finalResult = {
                tailored_resume: event.tailored_resume || "",
                extracted_requirements: event.extracted_requirements || "",
                usage_id: "",
                job_id: "",
                ats_score: undefined,
                gap_analysis: event.gap_analysis || "",
              };
              setResult(finalResult);
              setIsStreaming(false);
              setStreamStatus("");
              onTailoredResumeReady(getCleanResume(event.tailored_resume || ""));
              break;
            case "ats_score":
              if (finalResult) {
                finalResult = {
                  ...finalResult,
                  ats_score: event.ats_score as ATSScore | undefined,
                  job_id: event.job_id || "",
                };
                setResult({ ...finalResult });
              }
              break;
            case "error":
              setError(event.message || "Streaming failed");
              setIsStreaming(false);
              break;
          }
        }
      );
      onCreditsUsed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to tailor resume");
      setIsStreaming(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaveLoading(true);
    setSaveError("");
    try {
      await apiClient.saveTailoredResume({
        tailored_text: getCleanResume(result.tailored_resume),
        job_title: jobTitle,
      });
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSectionEdit = async () => {
    if (!result || !editingSection) return;
    setSectionEditLoading(true);
    try {
      const resp = await apiClient.editResumeSection({
        full_resume: result.tailored_resume,
        section_name: editingSection,
        instructions: sectionInstructions,
        job_description: jobDescription,
      });
      const updated = { ...result, tailored_resume: resp.updated_resume };
      setResult(updated);
      onTailoredResumeReady(getCleanResume(resp.updated_resume));
      setEditingSection(null);
      setSectionInstructions("");
    } catch (err: any) {
      setError(err?.message || "Section edit failed");
    } finally {
      setSectionEditLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  // Extract sections for regeneration buttons
  const getSections = (): string[] => {
    if (!result) return [];
    const cleanText = getCleanResume(result.tailored_resume);
    const matches = [...cleanText.matchAll(/\*\*([A-Z][A-Z\s&\/\-]+)\*\*/g)].map((m) => m[1].trim());
    return [...new Set(matches)];
  };

  return (
    <div className="border border-emerald-200 rounded-lg overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <span className="font-semibold text-emerald-900 text-sm">Resume Tailoring</span>
          {result && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Tailored</span>
          )}
          {result?.ats_score && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              result.ats_score.score >= 80 ? "bg-green-100 text-green-700" :
              result.ats_score.score >= 60 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              ATS: {result.ats_score.score}%
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-emerald-600 transition-transform ${expanded ? "rotate-180" : ""}`}
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
              <strong>Upgrade required.</strong> Resume tailoring is available on Pro and Premium plans.
              <a href="/pricing" className="ml-1 underline font-medium">View plans</a>
            </div>
          ) : creditsRemaining < TAILOR_COST && !result ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Insufficient credits.</strong> You need {TAILOR_COST} credits to tailor a resume.
              You have {creditsRemaining}.
              <a href="/pricing" className="ml-1 underline font-medium">Buy credits</a>
            </div>
          ) : null}

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">{error}</div>
          )}

          {/* Pre-tailor: Options */}
          {!result && !isStreaming && (
            <>
              {/* Tone & Focus — side by side dropdowns */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="professional">👔 Professional</option>
                    <option value="conversational">💬 Conversational</option>
                    <option value="concise">📝 Concise</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Focus</label>
                  <select
                    value={variationStyle}
                    onChange={(e) => setVariationStyle(e.target.value as typeof variationStyle)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="balanced">⚖️ Balanced</option>
                    <option value="skills-focused">🛠️ Skills</option>
                    <option value="experience-focused">💼 Experience</option>
                    <option value="concise">✂️ Concise</option>
                  </select>
                </div>
              </div>

              {/* Tailor Button */}
              <button
                type="button"
                onClick={handleTailor}
                disabled={!canTailor}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Tailor Resume for this Job
                <span className="text-xs opacity-80">({TAILOR_COST} credits)</span>
              </button>

              {!resumeText.trim() && (
                <p className="text-xs text-gray-500 italic">Select a resume above to enable tailoring.</p>
              )}
              {resumeText.trim() && !jobDescription.trim() && (
                <p className="text-xs text-gray-500 italic">Job description not available for this application.</p>
              )}
            </>
          )}

          {/* Streaming Progress */}
          {isStreaming && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
                {streamStatus || "Tailoring..."}
              </div>
              {streamingText && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {streamingText.substring(0, 500)}{streamingText.length > 500 ? "..." : ""}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && !isStreaming && (
            <div className="space-y-3">
              {/* ATS Score */}
              {result.ats_score && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAtsExpanded(!atsExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📊</span>
                      <span className="text-xs font-semibold text-gray-900">ATS Compatibility Score</span>
                      <span className={`text-sm font-bold ${
                        result.ats_score.score >= 80 ? "text-green-600" :
                        result.ats_score.score >= 60 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {result.ats_score.score}%
                      </span>
                    </div>
                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${atsExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {atsExpanded && (
                    <div className="px-3 py-2 space-y-2 text-xs">
                      {/* Score Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            result.ats_score.score >= 80 ? "bg-green-500" :
                            result.ats_score.score >= 60 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${result.ats_score.score}%` }}
                        />
                      </div>
                      {result.ats_score.matched.length > 0 && (
                        <div>
                          <p className="font-medium text-green-700 mb-1">✓ Matched Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.ats_score.matched.map((kw, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.ats_score.missing.length > 0 && (
                        <div>
                          <p className="font-medium text-red-700 mb-1">✗ Missing Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.ats_score.missing.map((kw, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.ats_score.suggestions && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Suggestions:</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{result.ats_score.suggestions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tailored Resume Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Tailored Resume</label>
                  <span className="text-[10px] text-gray-400">{getCleanResume(result.tailored_resume).length} chars</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {renderFormattedText(getCleanResume(result.tailored_resume))}
                </div>
              </div>

              {/* Section Regeneration */}
              {getSections().length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">Regenerate a section:</p>
                  <div className="flex flex-wrap gap-1">
                    {getSections().map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setEditingSection(editingSection === s ? null : s); setSectionInstructions(""); }}
                        className={editingSection === s
                          ? "px-2 py-0.5 text-[10px] rounded-full font-medium bg-emerald-600 text-white"
                          : "px-2 py-0.5 text-[10px] rounded-full font-medium bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {editingSection && (
                    <div className="mt-2 space-y-1.5">
                      <textarea
                        value={sectionInstructions}
                        onChange={(e) => setSectionInstructions(e.target.value)}
                        placeholder={`Instructions for "${editingSection}"...`}
                        className="w-full p-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={handleSectionEdit}
                        disabled={sectionEditLoading || !sectionInstructions.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {sectionEditLoading ? "Regenerating..." : "Regenerate Section"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions: Save + Re-tailor */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading || saveSuccess}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : saveSuccess ? "✓ Saved" : "💾 Save Tailored Resume"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setStreamingText("");
                    setSaveSuccess(false);
                    setSaveError("");
                    setEditingSection(null);
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
                >
                  Re-tailor
                </button>
              </div>
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
              {saveSuccess && <p className="text-xs text-green-600">Resume saved to your library!</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
