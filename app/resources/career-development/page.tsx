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
    heading: "Setting Career Goals",
    resources: [
      {
        title: "How to Set Professional Development Goals",
        url: "https://www.indeed.com/career-advice/career-development/how-to-set-professional-development-goals",
        source: "Indeed",
        type: "guide",
        description:
          "A structured approach to defining short- and long-term career goals with measurable milestones.",
      },
      {
        title: "How to Create a Personal Development Plan",
        url: "https://www.indeed.com/career-advice/career-development/personal-development-plan",
        source: "Indeed",
        type: "article",
        description:
          "A practical framework for turning vague ambitions into a concrete, actionable career roadmap.",
      },
      {
        title: "How to Create a 5-Year Career Plan",
        url: "https://www.youtube.com/watch?v=n7wH2XdOWpM",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "Step-by-step video guide for mapping your career trajectory with realistic, achievable checkpoints.",
      },
    ],
  },
  {
    heading: "Skill Development & Upskilling",
    resources: [
      {
        title: "How to Identify and Address Skills Gaps",
        url: "https://www.indeed.com/career-advice/career-development/skill-gap-analysis",
        source: "Indeed",
        type: "article",
        description:
          "Self-assessment techniques for spotting what's missing and choosing the right learning path.",
      },
      {
        title: "Free Online Courses — Coursera",
        url: "https://www.coursera.org/",
        source: "Coursera",
        type: "tool",
        description:
          "Thousands of free and paid courses from top universities covering technical, business, and creative fields.",
      },
      {
        title: "LinkedIn Learning Free Courses",
        url: "https://www.linkedin.com/learning/",
        source: "LinkedIn Learning",
        type: "tool",
        description:
          "Professional development library with courses on leadership, software, design, and business skills.",
      },
    ],
  },
  {
    heading: "Networking & Personal Branding",
    resources: [
      {
        title: "How to Network Effectively — Even If You Hate It",
        url: "https://hbr.org/2016/05/learn-to-love-networking",
        source: "Harvard Business Review",
        type: "article",
        description:
          "Research-backed strategies for building genuine professional relationships without feeling inauthentic.",
      },
      {
        title: "How to Optimize Your LinkedIn Profile",
        url: "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-update-linkedin-profile",
        source: "Indeed",
        type: "guide",
        description:
          "Section-by-section tips for crafting a LinkedIn profile that attracts recruiters and showcases your brand.",
      },
      {
        title: "How to Build a Personal Brand in 2024",
        url: "https://www.youtube.com/watch?v=p0ddTiqkiYA",
        source: "YouTube – Ali Abdaal",
        type: "video",
        description:
          "Practical advice on defining your niche, creating content, and positioning yourself as a thought leader.",
      },
    ],
  },
  {
    heading: "Career Transitions & Pivots",
    resources: [
      {
        title: "How to Successfully Change Careers",
        url: "https://www.indeed.com/career-advice/finding-a-job/how-to-change-careers",
        source: "Indeed",
        type: "guide",
        description:
          "A comprehensive guide covering self-assessment, transferable skills, and bridging experience gaps.",
      },
      {
        title: "How to Switch Careers — What I Wish I Knew",
        url: "https://www.youtube.com/watch?v=4e6KSaCxcHs",
        source: "YouTube – Austin Belcak",
        type: "video",
        description:
          "Honest retrospective on career pivoting with practical steps for making the transition smoother.",
      },
    ],
  },
  {
    heading: "Salary Negotiation & Growth",
    resources: [
      {
        title: "How to Negotiate Your Salary",
        url: "https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary",
        source: "Indeed",
        type: "guide",
        description:
          "Scripts, timing tips, and research strategies to confidently negotiate a better compensation package.",
      },
      {
        title: "15 Rules for Negotiating a Job Offer",
        url: "https://hbr.org/2014/04/15-rules-for-negotiating-a-job-offer",
        source: "Harvard Business Review",
        type: "article",
        description:
          "Classic HBR piece on the psychology and tactics behind successful salary and benefits negotiation.",
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

export default function CareerDevelopmentPage() {
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
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Career Development
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Advance your career with tips on skill development, networking, and
            career transitions.
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
