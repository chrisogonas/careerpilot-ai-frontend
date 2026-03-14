"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import type { ResumeTemplate } from "@/lib/types";
import { FileText, Lock, Crown, ArrowRight } from "lucide-react";

const ACCENT_BG: Record<string, string> = {
  classic: "bg-gray-800",
  modern: "bg-blue-600",
  minimal: "bg-gray-400",
  technical: "bg-emerald-600",
  executive: "bg-yellow-600",
  creative: "bg-purple-600",
};

/* ── Shared fake-resume data for previews ── */
const PREVIEW_SECTIONS = [
  {
    heading: "Experience",
    items: [
      { bold: "Senior Product Manager", sub: "TechCorp Inc. — 2022–Present" },
      { bold: "Product Manager", sub: "StartupXYZ — 2019–2022" },
    ],
  },
  {
    heading: "Education",
    items: [{ bold: "MBA, Business Strategy", sub: "Stanford University — 2019" }],
  },
  {
    heading: "Skills",
    pills: ["Product Strategy", "Agile", "SQL", "Figma", "A/B Testing", "Leadership"],
  },
];

function ClassicPreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-5 py-4 font-serif text-gray-900" style={{ fontSize: 6 }}>
      <p className="text-center font-bold" style={{ fontSize: 10 }}>Alex Johnson</p>
      <p className="text-center text-gray-500 mt-0.5" style={{ fontSize: 5 }}>alex@email.com &nbsp;|&nbsp; San Francisco, CA &nbsp;|&nbsp; (555) 123-4567</p>
      {PREVIEW_SECTIONS.map((s) => (
        <div key={s.heading} className="mt-2">
          <p className="font-bold" style={{ fontSize: 7 }}>{s.heading}</p>
          <div className="h-px w-full bg-black mt-0.5 mb-1" />
          {s.items?.map((it, i) => (
            <div key={i} className="mb-1">
              <p><span className="font-bold">{it.bold}</span></p>
              <p className="text-gray-500" style={{ fontSize: 5 }}>{it.sub}</p>
              <p className="text-gray-600 pl-1.5">• Led cross-functional teams of 8+ members</p>
            </div>
          ))}
          {s.pills && (
            <p className="text-gray-700">{s.pills.join(" · ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ModernPreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-5 py-4 font-sans text-gray-900" style={{ fontSize: 6 }}>
      <p className="font-bold" style={{ fontSize: 11, color: accent }}>Alex Johnson</p>
      <p className="text-gray-500 mt-0.5" style={{ fontSize: 5 }}>alex@email.com &nbsp;|&nbsp; San Francisco, CA &nbsp;|&nbsp; (555) 123-4567</p>
      {PREVIEW_SECTIONS.map((s) => (
        <div key={s.heading} className="mt-2.5 flex gap-1.5">
          <div className="w-1 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: accent, minHeight: 12 }} />
          <div className="flex-1">
            <p className="font-bold tracking-wide uppercase" style={{ fontSize: 7, color: accent }}>{s.heading}</p>
            {s.items?.map((it, i) => (
              <div key={i} className="mb-1 mt-0.5">
                <p><span className="font-bold">{it.bold}</span></p>
                <p className="text-gray-500" style={{ fontSize: 5 }}>{it.sub}</p>
                <p className="text-gray-600 pl-1.5">• Led cross-functional teams of 8+ members</p>
              </div>
            ))}
            {s.pills && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {s.pills.map((p) => (
                  <span key={p} className="text-white rounded-sm px-1" style={{ fontSize: 4.5, backgroundColor: accent }}>{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MinimalPreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-7 py-5 font-sans text-gray-800" style={{ fontSize: 5.5 }}>
      <p className="font-light tracking-wide" style={{ fontSize: 10 }}>Alex Johnson</p>
      <p className="text-gray-400 mt-0.5" style={{ fontSize: 4.5 }}>alex@email.com &nbsp;·&nbsp; San Francisco, CA &nbsp;·&nbsp; (555) 123-4567</p>
      {PREVIEW_SECTIONS.map((s) => (
        <div key={s.heading} className="mt-3">
          <p className="uppercase tracking-widest text-gray-400 font-medium" style={{ fontSize: 5.5 }}>{s.heading}</p>
          <div className="h-px w-full bg-gray-200 mt-0.5 mb-1" />
          {s.items?.map((it, i) => (
            <div key={i} className="mb-1">
              <p><span className="font-semibold">{it.bold}</span></p>
              <p className="text-gray-400" style={{ fontSize: 4.5 }}>{it.sub}</p>
              <p className="text-gray-500 pl-1.5">– Led cross-functional teams of 8+ members</p>
            </div>
          ))}
          {s.pills && (
            <p className="text-gray-500">{s.pills.join(" · ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function TechnicalPreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-5 py-4 font-sans text-gray-900" style={{ fontSize: 6 }}>
      <p className="font-bold" style={{ fontSize: 10 }}>Alex Johnson</p>
      <p className="text-gray-500 mt-0.5" style={{ fontSize: 5 }}>alex@email.com &nbsp;|&nbsp; San Francisco, CA &nbsp;|&nbsp; (555) 123-4567</p>
      {PREVIEW_SECTIONS.map((s) => (
        <div key={s.heading} className="mt-2">
          <div className="bg-gray-100 rounded-sm px-1.5 py-0.5 -mx-1">
            <p className="font-bold" style={{ fontSize: 7, color: accent }}>{s.heading}</p>
          </div>
          <div className="mt-1">
            {s.items?.map((it, i) => (
              <div key={i} className="mb-1">
                <p><span className="font-bold">{it.bold}</span></p>
                <p className="text-gray-500" style={{ fontSize: 5 }}>{it.sub}</p>
                <p className="text-gray-600 pl-1.5">• Led cross-functional teams of 8+ members</p>
              </div>
            ))}
            {s.pills && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {s.pills.map((p) => (
                  <span key={p} className="rounded-sm px-1 py-px border" style={{ fontSize: 4.5, color: accent, borderColor: accent }}>{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExecutivePreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col px-6 py-5 font-serif text-gray-900" style={{ fontSize: 6 }}>
      <p className="text-center font-bold" style={{ fontSize: 11, color: accent }}>Alex Johnson</p>
      <p className="text-center text-gray-500 mt-0.5" style={{ fontSize: 5 }}>alex@email.com &nbsp;|&nbsp; San Francisco, CA &nbsp;|&nbsp; (555) 123-4567</p>
      {PREVIEW_SECTIONS.map((s) => (
        <div key={s.heading} className="mt-3">
          <p className="font-bold" style={{ fontSize: 7.5, color: accent }}>{s.heading}</p>
          <div className="mt-0.5 mb-1.5">
            <div className="h-px w-full" style={{ backgroundColor: accent }} />
            <div className="h-px w-full mt-px" style={{ backgroundColor: accent, opacity: 0.4 }} />
          </div>
          {s.items?.map((it, i) => (
            <div key={i} className="mb-1.5">
              <p><span className="font-bold">{it.bold}</span></p>
              <p className="text-gray-500" style={{ fontSize: 5 }}>{it.sub}</p>
              <p className="text-gray-600 pl-1.5">• Led cross-functional teams of 8+ members</p>
            </div>
          ))}
          {s.pills && (
            <p className="text-gray-700">{s.pills.join("  ·  ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CreativePreview({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex font-sans text-gray-700" style={{ fontSize: 6 }}>
      {/* Sidebar strip */}
      <div className="w-3 shrink-0" style={{ backgroundColor: accent }} />
      <div className="flex-1 flex flex-col px-4 py-4">
        <p className="font-bold" style={{ fontSize: 11, color: accent }}>Alex Johnson</p>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: 5 }}>alex@email.com &nbsp;|&nbsp; San Francisco, CA &nbsp;|&nbsp; (555) 123-4567</p>
        {PREVIEW_SECTIONS.map((s) => (
          <div key={s.heading} className="mt-2.5">
            <p className="font-bold" style={{ fontSize: 7.5, color: accent }}>{s.heading}</p>
            {s.items?.map((it, i) => (
              <div key={i} className="mb-1 mt-0.5">
                <p><span className="font-bold text-gray-800">{it.bold}</span></p>
                <p className="text-gray-400" style={{ fontSize: 5 }}>{it.sub}</p>
                <p className="pl-1.5">• Led cross-functional teams of 8+ members</p>
              </div>
            ))}
            {s.pills && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {s.pills.map((p) => (
                  <span key={p} className="text-white rounded-sm px-1" style={{ fontSize: 4.5, backgroundColor: accent }}>{p}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEW_RENDERERS: Record<string, React.FC<{ accent: string }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  minimal: MinimalPreview,
  technical: TechnicalPreview,
  executive: ExecutivePreview,
  creative: CreativePreview,
};

function TemplatePreview({ template }: { template: ResumeTemplate }) {
  const accentHex = `rgb(${template.accent_color.join(",")})`;
  const Renderer = PREVIEW_RENDERERS[template.id] || ClassicPreview;

  return (
    <div className="w-full aspect-[8.5/11] bg-white rounded-lg border border-gray-200 relative overflow-hidden shadow-sm">
      <Renderer accent={accentHex} />
    </div>
  );
}

export default function TemplateGalleryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    apiClient
      .getResumeTemplates()
      .then((res) => setTemplates(res.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-100 rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <div className="aspect-[8.5/11] bg-gray-100 rounded-lg mb-3" />
                <div className="h-4 w-2/3 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-full bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Resume Templates</h1>
        </div>
        <p className="text-gray-600">
          Choose from professionally designed templates for your PDF export.
          Free plan includes Classic. Upgrade to Pro or Premium for more options.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => {
          const isLocked = !t.available;
          const badgeBg = ACCENT_BG[t.id] || "bg-gray-600";

          return (
            <div
              key={t.id}
              className={`relative rounded-xl border-2 p-4 transition-all ${
                isLocked
                  ? "border-gray-200 opacity-70"
                  : "border-gray-200 hover:border-indigo-300 hover:shadow-lg"
              }`}
            >
              <TemplatePreview template={t} />

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {t.preview_tag}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t.description}</p>

                {isLocked ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <Lock className="w-4 h-4" />
                      Requires {t.plan_required === "premium" ? "Premium" : "Pro"} plan
                    </span>
                    <button
                      onClick={() => router.push("/subscribe")}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push("/tailor")}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Use this template
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
