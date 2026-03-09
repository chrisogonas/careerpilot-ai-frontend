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
    heading: "Fundamentals",
    resources: [
      {
        title: "Resume Writing Guide",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-make-a-resume-with-examples",
        source: "Indeed",
        type: "guide",
        description:
          "A comprehensive walkthrough of resume structure, formatting, and content strategy for all experience levels.",
      },
      {
        title: "How to Write a Professional Resume",
        url: "https://hbr.org/2014/12/how-to-write-a-resume-that-stands-out",
        source: "Harvard Business Review",
        type: "article",
        description:
          "Expert insights on crafting a resume that gets noticed by hiring managers.",
      },
      {
        title: "Resume Format Guide (With Examples and Tips)",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-format-guide-with-examples",
        source: "Indeed",
        type: "guide",
        description:
          "Chronological vs. functional vs. combination — which layout fits your career story best.",
      },
    ],
  },
  {
    heading: "Writing Stronger Bullets",
    resources: [
      {
        title: "How to Quantify Your Resume Bullets",
        url: "https://www.themuse.com/advice/how-to-quantify-your-resume-bullets-when-you-dont-work-with-numbers",
        source: "The Muse",
        type: "article",
        description:
          "Techniques for turning generic duties into achievement-focused bullet points with measurable impact.",
      },
      {
        title: "Austin Belcak – Resume Tips That Got Me Into Google",
        url: "https://www.youtube.com/watch?v=BYUy1yvjHxE",
        source: "YouTube",
        type: "video",
        description:
          "Practical walkthrough of resume bullet writing and formatting that helped land FAANG interviews.",
      },
      {
        title: "185+ Action Verbs to Make Your Resume Stand Out",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/action-verbs-to-make-your-resume-stand-out",
        source: "Indeed",
        type: "article",
        description:
          "Replace weak verbs with powerful action words organized by skill category.",
      },
    ],
  },
  {
    heading: "Design & Formatting",
    resources: [
      {
        title: "Resume Design: Elements, Styles, and How to Choose",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-design",
        source: "Indeed",
        type: "guide",
        description:
          "Visual layout principles, font choices, and white-space strategy that keep resumes clean and scannable.",
      },
      {
        title: "The 4-Second Resume Test",
        url: "https://www.youtube.com/watch?v=Tt08KmFfIYQ",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "Learn what recruiters actually see in the first few seconds and how to design for that scan.",
      },
    ],
  },
  {
    heading: "Industry-Specific Advice",
    resources: [
      {
        title: "Tech Resume Writing Guide",
        url: "https://www.techinterviewhandbook.org/resume/",
        source: "Tech Interview Handbook",
        type: "guide",
        description:
          "Opinionated guide tailored to software engineering resumes — ATS keywords, project sections, and formatting.",
      },
      {
        title: "How to Write a Career Change Resume",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/career-change-resume",
        source: "Indeed",
        type: "article",
        description:
          "Strategies for reframing transferable skills when pivoting to a new industry.",
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

export default function ResumeBestPracticesPage() {
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
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Best Practices
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn how to structure your resume, optimize for ATS systems, and
            highlight your achievements effectively.
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
