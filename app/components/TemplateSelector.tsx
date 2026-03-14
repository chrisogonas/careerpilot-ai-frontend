"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Lock, Crown, X } from "lucide-react";
import { apiClient } from "@/lib/utils/api";
import type { ResumeTemplate } from "@/lib/types";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  selectedTemplate: string;
}

const ACCENT_STYLES: Record<string, string> = {
  classic: "border-gray-800",
  modern: "border-blue-600",
  minimal: "border-gray-400",
  technical: "border-emerald-600",
  executive: "border-yellow-600",
  creative: "border-purple-600",
};

const ACCENT_BG: Record<string, string> = {
  classic: "bg-gray-800",
  modern: "bg-blue-600",
  minimal: "bg-gray-400",
  technical: "bg-emerald-600",
  executive: "bg-yellow-600",
  creative: "bg-purple-600",
};

/* ── Per-template mini previews matching actual PDF layouts ── */

function ClassicMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-3 py-2.5 font-serif text-gray-900" style={{ fontSize: 4.5 }}>
      <p className="text-center font-bold" style={{ fontSize: 7.5 }}>Alex Johnson</p>
      <p className="text-center text-gray-400" style={{ fontSize: 3.5 }}>alex@email.com | San Francisco, CA</p>
      <div className="mt-1.5">
        <p className="font-bold" style={{ fontSize: 5 }}>Experience</p>
        <div className="h-px w-full bg-black mt-px mb-0.5" />
        <p><span className="font-bold">Senior PM</span> — TechCorp</p>
        <p className="text-gray-500 pl-1">• Led cross-functional teams</p>
      </div>
      <div className="mt-1.5">
        <p className="font-bold" style={{ fontSize: 5 }}>Education</p>
        <div className="h-px w-full bg-black mt-px mb-0.5" />
        <p><span className="font-bold">MBA</span> — Stanford</p>
      </div>
      <div className="mt-1.5">
        <p className="font-bold" style={{ fontSize: 5 }}>Skills</p>
        <div className="h-px w-full bg-black mt-px mb-0.5" />
        <p className="text-gray-600">Strategy · Agile · SQL · Figma</p>
      </div>
    </div>
  );
}

function ModernMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-3 py-2.5 font-sans text-gray-900" style={{ fontSize: 4.5 }}>
      <p className="font-bold" style={{ fontSize: 8, color: accent }}>Alex Johnson</p>
      <p className="text-gray-400" style={{ fontSize: 3.5 }}>alex@email.com | San Francisco, CA</p>
      {["Experience", "Education", "Skills"].map((h) => (
        <div key={h} className="mt-1.5 flex gap-1">
          <div className="w-0.5 rounded-full shrink-0 mt-px" style={{ backgroundColor: accent, minHeight: 8 }} />
          <div className="flex-1">
            <p className="font-bold tracking-wide uppercase" style={{ fontSize: 5, color: accent }}>{h}</p>
            {h === "Experience" && (
              <>
                <p><span className="font-bold">Senior PM</span> — TechCorp</p>
                <p className="text-gray-500 pl-1">• Led cross-functional teams</p>
              </>
            )}
            {h === "Education" && <p><span className="font-bold">MBA</span> — Stanford</p>}
            {h === "Skills" && (
              <div className="flex flex-wrap gap-px mt-0.5">
                {["Strategy", "Agile", "SQL"].map((s) => (
                  <span key={s} className="text-white rounded-sm px-0.5" style={{ fontSize: 3.5, backgroundColor: accent }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MinimalMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-4 py-3 font-sans text-gray-800" style={{ fontSize: 4 }}>
      <p className="font-light tracking-wide" style={{ fontSize: 8 }}>Alex Johnson</p>
      <p className="text-gray-300" style={{ fontSize: 3 }}>alex@email.com · San Francisco, CA</p>
      {["Experience", "Education", "Skills"].map((h) => (
        <div key={h} className="mt-2">
          <p className="uppercase tracking-widest text-gray-400 font-medium" style={{ fontSize: 4 }}>{h}</p>
          <div className="h-px w-full bg-gray-200 mt-px mb-0.5" />
          {h === "Experience" && (
            <>
              <p><span className="font-semibold">Senior PM</span> — TechCorp</p>
              <p className="text-gray-400 pl-1">– Led cross-functional teams</p>
            </>
          )}
          {h === "Education" && <p><span className="font-semibold">MBA</span> — Stanford</p>}
          {h === "Skills" && <p className="text-gray-500">Strategy · Agile · SQL · Figma</p>}
        </div>
      ))}
    </div>
  );
}

function TechnicalMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-3 py-2.5 font-sans text-gray-900" style={{ fontSize: 4.5 }}>
      <p className="font-bold" style={{ fontSize: 7.5 }}>Alex Johnson</p>
      <p className="text-gray-400" style={{ fontSize: 3.5 }}>alex@email.com | San Francisco, CA</p>
      {["Experience", "Education", "Skills"].map((h) => (
        <div key={h} className="mt-1.5">
          <div className="bg-gray-100 rounded-sm px-1 py-px -mx-0.5">
            <p className="font-bold" style={{ fontSize: 5, color: accent }}>{h}</p>
          </div>
          <div className="mt-0.5">
            {h === "Experience" && (
              <>
                <p><span className="font-bold">Senior PM</span> — TechCorp</p>
                <p className="text-gray-500 pl-1">• Led cross-functional teams</p>
              </>
            )}
            {h === "Education" && <p><span className="font-bold">MBA</span> — Stanford</p>}
            {h === "Skills" && (
              <div className="flex flex-wrap gap-px mt-0.5">
                {["Strategy", "Agile", "SQL"].map((s) => (
                  <span key={s} className="rounded-sm px-0.5 py-px border" style={{ fontSize: 3.5, color: accent, borderColor: accent }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExecutiveMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-4 py-3 font-serif text-gray-900" style={{ fontSize: 4.5 }}>
      <p className="text-center font-bold" style={{ fontSize: 8, color: accent }}>Alex Johnson</p>
      <p className="text-center text-gray-400" style={{ fontSize: 3.5 }}>alex@email.com | San Francisco, CA</p>
      {["Experience", "Education", "Skills"].map((h) => (
        <div key={h} className="mt-2">
          <p className="font-bold" style={{ fontSize: 5.5, color: accent }}>{h}</p>
          <div className="mt-px mb-1">
            <div className="h-px w-full" style={{ backgroundColor: accent }} />
            <div className="h-px w-full mt-px" style={{ backgroundColor: accent, opacity: 0.35 }} />
          </div>
          {h === "Experience" && (
            <>
              <p><span className="font-bold">Senior PM</span> — TechCorp</p>
              <p className="text-gray-500 pl-1">• Led cross-functional teams</p>
            </>
          )}
          {h === "Education" && <p><span className="font-bold">MBA</span> — Stanford</p>}
          {h === "Skills" && <p className="text-gray-600">Strategy · Agile · SQL · Figma</p>}
        </div>
      ))}
    </div>
  );
}

function CreativeMini({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex font-sans text-gray-600" style={{ fontSize: 4.5 }}>
      <div className="w-2 shrink-0" style={{ backgroundColor: accent }} />
      <div className="flex-1 flex flex-col px-2.5 py-2.5">
        <p className="font-bold" style={{ fontSize: 8, color: accent }}>Alex Johnson</p>
        <p className="text-gray-300" style={{ fontSize: 3.5 }}>alex@email.com | San Francisco</p>
        {["Experience", "Education", "Skills"].map((h) => (
          <div key={h} className="mt-1.5">
            <p className="font-bold" style={{ fontSize: 5.5, color: accent }}>{h}</p>
            {h === "Experience" && (
              <>
                <p><span className="font-bold text-gray-700">Senior PM</span> — TechCorp</p>
                <p className="pl-1">• Led cross-functional teams</p>
              </>
            )}
            {h === "Education" && <p><span className="font-bold text-gray-700">MBA</span> — Stanford</p>}
            {h === "Skills" && (
              <div className="flex flex-wrap gap-px mt-0.5">
                {["Strategy", "Agile", "SQL"].map((s) => (
                  <span key={s} className="text-white rounded-sm px-0.5" style={{ fontSize: 3.5, backgroundColor: accent }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const MINI_RENDERERS: Record<string, React.FC<{ accent: string }>> = {
  classic: ClassicMini,
  modern: ModernMini,
  minimal: MinimalMini,
  technical: TechnicalMini,
  executive: ExecutiveMini,
  creative: CreativeMini,
};

function TemplateMiniPreview({ template }: { template: ResumeTemplate }) {
  const accentHex = `rgb(${template.accent_color.join(",")})`;
  const Renderer = MINI_RENDERERS[template.id] || ClassicMini;

  return (
    <div className="w-full aspect-[8.5/11] bg-white rounded border border-gray-200 relative overflow-hidden text-left">
      <Renderer accent={accentHex} />
    </div>
  );
}

export default function TemplateSelector({
  open,
  onClose,
  onSelect,
  selectedTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient
      .getResumeTemplates()
      .then((res) => setTemplates(res.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto mx-4"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Choose a Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[8.5/11] bg-gray-100 rounded-lg mb-2" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {templates.map((t) => {
                const isSelected = t.id === selectedTemplate;
                const isLocked = !t.available;
                const borderClass = ACCENT_STYLES[t.id] || "border-gray-300";
                const badgeBg = ACCENT_BG[t.id] || "bg-gray-600";

                return (
                  <button
                    key={t.id}
                    disabled={isLocked}
                    onClick={() => {
                      onSelect(t.id);
                      onClose();
                    }}
                    className={`group relative text-left rounded-xl border-2 p-3 transition-all
                      ${isSelected ? `${borderClass} ring-2 ring-offset-1 ring-indigo-300 shadow-md` : "border-gray-200 hover:border-gray-300"}
                      ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
                    `}
                  >
                    <TemplateMiniPreview template={t} />

                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.preview_tag}</p>
                      </div>
                      {isLocked && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          {t.plan_required === "premium" ? "Premium" : "Pro"}
                        </span>
                      )}
                      {isSelected && !isLocked && (
                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${badgeBg}`}>
                          Selected
                        </span>
                      )}
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-amber-200">
                          <Crown className="w-4 h-4" />
                          Upgrade to {t.plan_required === "premium" ? "Premium" : "Pro"}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">
            Free plan includes Classic. Pro unlocks Modern, Minimal &amp; Technical. Premium unlocks all templates.
          </p>
        </div>
      </div>
    </div>
  );
}
