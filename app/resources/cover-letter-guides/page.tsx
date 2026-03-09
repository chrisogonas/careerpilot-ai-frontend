"use client";

import Link from "next/link";

interface Resource {
  title: string;
  url: string;
  source: string;
  type: "article" | "video" | "guide" | "tool";
  description: string;
}

const sections: { heading: string; resources: Resource[] }[] = [
  {
    heading: "Cover Letter Basics",
    resources: [
      {
        title: "How to Write a Cover Letter (With Examples)",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-write-a-cover-letter",
        source: "Indeed",
        type: "guide",
        description:
          "End-to-end walkthrough of cover letter structure, tone, and content with annotated examples.",
      },
      {
        title: "The Importance of a Cover Letter (Plus Writing Tips)",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/cover-letter-importance",
        source: "Indeed",
        type: "article",
        description:
          "Data-backed advice on when cover letters matter most and how to make yours stand out.",
      },
      {
        title: "Write an Amazing Cover Letter — 3 Golden Rules",
        url: "https://www.youtube.com/watch?v=NUhDP30IRKk",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "Concise video breaking down the three principles that separate forgettable letters from great ones.",
      },
    ],
  },
  {
    heading: "Crafting Strong Openings",
    resources: [
      {
        title: "How to Start a Cover Letter: 4 Attention-Grabbing Openers",
        url: "https://www.themuse.com/advice/how-to-start-a-cover-letter-opening-lines-examples",
        source: "The Muse",
        type: "article",
        description:
          "Skip 'I am writing to apply…' — learn four opening formulas that hook the reader immediately.",
      },
      {
        title: "Cover Letter Mistakes to Avoid",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/cover-letter-mistakes",
        source: "Indeed",
        type: "article",
        description:
          "Common pitfalls — from generic salutations to rewriting your resume — and how to fix them.",
      },
    ],
  },
  {
    heading: "Tailoring to the Role",
    resources: [
      {
        title: "How to Tailor Your Cover Letter to Any Job Description",
        url: "https://www.themuse.com/advice/how-to-write-a-cover-letter-31-tips-you-need-to-know",
        source: "The Muse",
        type: "guide",
        description:
          "31 actionable tips for matching your cover letter's language and stories directly to the posting.",
      },
      {
        title: "How to Write a Cover Letter for a Job You Really Want",
        url: "https://www.youtube.com/watch?v=6FNH0QL6Wdc",
        source: "YouTube – Andrew LaCivita",
        type: "video",
        description:
          "Framework for weaving company research and genuine enthusiasm into a persuasive letter.",
      },
    ],
  },
  {
    heading: "Templates & Tools",
    resources: [
      {
        title: "Free Cover Letter Templates for Every Job Seeker",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/free-cover-letter",
        source: "Indeed",
        type: "guide",
        description:
          "Downloadable templates organized by experience level and career situation, easy to customize.",
      },
      {
        title: "Cover Letter Builder — Step-by-Step",
        url: "https://www.indeed.com/create-resume",
        source: "Indeed",
        type: "tool",
        description:
          "Free guided builder that walks you through each section and outputs a polished, formatted letter.",
      },
    ],
  },
];

const typeBadge: Record<Resource["type"], { label: string; color: string }> = {
  article: { label: "Article", color: "bg-blue-100 text-blue-700" },
  video: { label: "Video", color: "bg-red-100 text-red-700" },
  guide: { label: "Guide", color: "bg-emerald-100 text-emerald-700" },
  tool: { label: "Tool", color: "bg-amber-100 text-amber-700" },
};

export default function CoverLetterGuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Link
            href="/#resources"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-6"
          >
            ← Back to Resources
          </Link>
          <div className="text-5xl mb-4">✍️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cover Letter Guides
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Write compelling cover letters that grab attention and complement
            your resume perfectly.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.resources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg hover:border-blue-600 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge[r.type].color}`}
                        >
                          {typeBadge[r.type].label}
                        </span>
                        <span className="text-xs text-gray-500">{r.source}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {r.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{r.description}</p>
                    </div>
                    <span className="shrink-0 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition mt-1">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> All external links are provided for educational
          purposes. The content at those URLs is owned by the respective publishers.
          CareerPilot is not affiliated with and does not claim ownership of any
          third-party content. Links may change or become unavailable over time.
        </div>
      </div>
    </div>
  );
}
