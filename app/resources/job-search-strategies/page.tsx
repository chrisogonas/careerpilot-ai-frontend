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
    heading: "Getting Started",
    resources: [
      {
        title: "The Ultimate Job Search Guide",
        url: "https://www.indeed.com/career-advice/finding-a-job/job-search-guide",
        source: "Indeed",
        type: "guide",
        description:
          "End-to-end walkthrough covering self-assessment, research, applications, and follow-ups.",
      },
      {
        title: "How to Job Search Effectively",
        url: "https://www.indeed.com/career-advice/finding-a-job/effective-job-search-strategies",
        source: "Indeed",
        type: "article",
        description:
          "Research-backed advice on staying productive and motivated throughout a long job search.",
      },
      {
        title: "Job Search Strategy That Works",
        url: "https://www.youtube.com/watch?v=UWMwI5T0uaw",
        source: "YouTube – Andrew LaCivita",
        type: "video",
        description:
          "A recruiter's step-by-step framework for organizing your search and tracking opportunities.",
      },
    ],
  },
  {
    heading: "Networking & Hidden Job Market",
    resources: [
      {
        title: "How to Network for a Job",
        url: "https://www.indeed.com/career-advice/finding-a-job/how-to-network-for-a-job",
        source: "Indeed",
        type: "guide",
        description:
          "Practical scripts and templates for reaching out to contacts, alumni, and industry connections.",
      },
      {
        title: "LinkedIn Profile Optimization for Job Seekers",
        url: "https://www.linkedin.com/pulse/how-optimize-your-linkedin-profile-job-search-recruiter-perspective/",
        source: "LinkedIn Pulse",
        type: "article",
        description:
          "Tips from recruiters on headline, summary, and skills sections that attract inbound messages.",
      },
      {
        title: "Networking on LinkedIn – Cold Outreach That Works",
        url: "https://www.youtube.com/watch?v=jFEPM3bDPiM",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "How to write connection requests and follow-up messages that actually get responses.",
      },
    ],
  },
  {
    heading: "Customizing Your Applications",
    resources: [
      {
        title: "How to Tailor Your Resume for Each Job",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/tailoring-resume-to-job-description",
        source: "Indeed",
        type: "article",
        description:
          "Step-by-step process for aligning your resume keywords and bullets to each posting.",
      },
      {
        title: "Should You Apply for Jobs You're Not 100% Qualified For?",
        url: "https://www.indeed.com/career-advice/finding-a-job/should-you-apply-for-a-job-if-you-dont-meet-all-requirements",
        source: "Indeed",
        type: "article",
        description:
          "Research on when it is (and isn't) worth stretching to apply — and how to frame your pitch.",
      },
    ],
  },
  {
    heading: "Tracking & Staying Organized",
    resources: [
      {
        title: "How to Organize Your Job Search",
        url: "https://www.indeed.com/career-advice/finding-a-job/how-to-organize-job-search",
        source: "Indeed",
        type: "guide",
        description:
          "Systems for tracking applications, deadlines, and follow-ups so nothing falls through the cracks.",
      },
      {
        title: "How to Follow Up After Applying",
        url: "https://www.themuse.com/advice/how-to-follow-up-on-a-job-application-an-email-template",
        source: "The Muse",
        type: "article",
        description:
          "Timing, tone, and templates for professional follow-up emails that keep you top-of-mind.",
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

export default function JobSearchStrategiesPage() {
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
          <div className="text-5xl mb-4">💼</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Job Search Strategies
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover proven techniques to find the right jobs, customize
            applications, and stand out to recruiters.
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
