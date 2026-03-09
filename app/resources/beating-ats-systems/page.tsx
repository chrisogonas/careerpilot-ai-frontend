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
    heading: "Understanding ATS Systems",
    resources: [
      {
        title: "What Is an Applicant Tracking System (ATS)?",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/what-is-an-applicant-tracking-system",
        source: "Indeed",
        type: "article",
        description:
          "Understand how ATS software parses, ranks, and filters resumes before a human ever sees your application.",
      },
      {
        title: "How Do Applicant Tracking Systems Work?",
        url: "https://www.youtube.com/watch?v=oVh2bkygmno",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "Visual walkthrough of what happens to your resume after you hit 'Apply' and how algorithms decide your fate.",
      },
      {
        title: "Jobscan — ATS Resume Checker",
        url: "https://www.jobscan.co/",
        source: "Jobscan",
        type: "tool",
        description:
          "Free tool that compares your resume against a job description and scores how well it matches ATS requirements.",
      },
    ],
  },
  {
    heading: "Keyword Optimization",
    resources: [
      {
        title: "How to Use Keywords to Strengthen Your Resume",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-keywords",
        source: "Indeed",
        type: "guide",
        description:
          "Learn how to identify, prioritize, and place the right keywords so your resume surfaces in recruiter searches.",
      },
      {
        title: "How to Use Resume Keywords and Phrases",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-keywords-and-phrases",
        source: "Indeed",
        type: "article",
        description:
          "Industry-specific keyword lists that help you tailor your resume to specialized ATS configurations.",
      },
    ],
  },
  {
    heading: "Formatting for ATS",
    resources: [
      {
        title: "ATS-Friendly Resume Formatting Tips",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume",
        source: "Indeed",
        type: "guide",
        description:
          "Practical formatting rules: file types, section headings, fonts, columns, and elements to avoid.",
      },
      {
        title: "How to Make an ATS-Friendly Resume in 2024",
        url: "https://www.youtube.com/watch?v=J-4Fv8nq1iA",
        source: "YouTube – Austin Belcak",
        type: "video",
        description:
          "Step-by-step video guide to reformatting existing resumes so ATS parsers read them correctly.",
      },
      {
        title: "Harvard Resume & Cover Letter Guide",
        url: "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/",
        source: "Harvard Career Services",
        type: "guide",
        description:
          "A clean, ATS-safe template from Harvard's Career Services with formatting best practices.",
      },
    ],
  },
  {
    heading: "Common Mistakes & Myths",
    resources: [
      {
        title: "How to Write an ATS-Friendly Resume",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume",
        source: "Indeed",
        type: "article",
        description:
          "Debunking popular misconceptions about ATS systems so you focus on what actually matters.",
      },
      {
        title: "Resume Mistakes That Get You Rejected",
        url: "https://www.youtube.com/watch?v=dQ7Q8ZdnuN0",
        source: "YouTube – Andrew LaCivita",
        type: "video",
        description:
          "Common resume errors — from invisible tables to fancy graphics — that cause ATS parsers to fail.",
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

export default function BeatingAtsSystemsPage() {
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
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beating ATS Systems
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Understand how Applicant Tracking Systems work and learn strategies
            to get your resume past the filters.
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
