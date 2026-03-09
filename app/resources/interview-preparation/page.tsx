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
    heading: "Interview Fundamentals",
    resources: [
      {
        title: "How to Prepare for a Job Interview",
        url: "https://www.indeed.com/career-advice/interviewing/how-to-prepare-for-an-interview",
        source: "Indeed",
        type: "guide",
        description:
          "A complete checklist covering research, practice, wardrobe, logistics, and mindset before the big day.",
      },
      {
        title: "How to Win Any Job Interview",
        url: "https://www.youtube.com/watch?v=ysGMIX0gqtg",
        source: "YouTube – Jeff Su",
        type: "video",
        description:
          "Practical video walkthrough of the entire interview preparation process from a former Google PM.",
      },
      {
        title: "The Complete Guide to Job Interview Questions",
        url: "https://www.themuse.com/advice/interview-questions-and-answers",
        source: "The Muse",
        type: "guide",
        description:
          "Common interview questions organized by category with sample answers and frameworks.",
      },
    ],
  },
  {
    heading: "The STAR Method",
    resources: [
      {
        title: "How to Use the STAR Method to Answer Interview Questions",
        url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique",
        source: "Indeed",
        type: "article",
        description:
          "Situation, Task, Action, Result — learn the framwork with concrete examples across different roles.",
      },
      {
        title: "STAR Method Interview Questions and Answers",
        url: "https://www.youtube.com/watch?v=S8Ppk5pPOwo",
        source: "YouTube – CareerVidz",
        type: "video",
        description:
          "Step-by-step video tutorial with multiple example responses using the STAR technique.",
      },
    ],
  },
  {
    heading: "Behavioral & Situational Questions",
    resources: [
      {
        title: "How to Prepare for a Behavioral Interview",
        url: "https://www.indeed.com/career-advice/interviewing/how-to-prepare-for-a-behavioral-interview",
        source: "Indeed",
        type: "guide",
        description:
          "The most frequently asked behavioral questions with tips on how to structure compelling stories.",
      },
      {
        title: "Tell Me About Yourself — How to Answer",
        url: "https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself",
        source: "Indeed",
        type: "article",
        description:
          "A framework for the most common opening question that sets the tone for the entire interview.",
      },
      {
        title: "How to Answer 'What's Your Biggest Weakness?'",
        url: "https://www.indeed.com/career-advice/interviewing/list-of-example-weaknesses-for-interviewing",
        source: "Indeed",
        type: "article",
        description:
          "Turn the dreaded weakness question into a positive with authentic, growth-oriented responses.",
      },
    ],
  },
  {
    heading: "Technical & Case Interviews",
    resources: [
      {
        title: "Tech Interview Handbook",
        url: "https://www.techinterviewhandbook.org/",
        source: "Tech Interview Handbook",
        type: "tool",
        description:
          "Free, open-source guide covering algorithms, system design, and behavioral interviews for software engineers.",
      },
      {
        title: "Cracking the Coding Interview — Key Concepts",
        url: "https://www.youtube.com/watch?v=GKgAVjJxh9w",
        source: "YouTube – freeCodeCamp",
        type: "video",
        description:
          "Overview of essential data structures and algorithm patterns commonly tested in technical interviews.",
      },
    ],
  },
  {
    heading: "Post-Interview Follow-Up",
    resources: [
      {
        title: "How to Write a Thank-You Email After an Interview",
        url: "https://www.indeed.com/career-advice/interviewing/how-to-write-a-thank-you-email-after-interview",
        source: "Indeed",
        type: "guide",
        description:
          "Templates and tips for sending a professional follow-up that reinforces your candidacy.",
      },
      {
        title: "What to Do After the Interview",
        url: "https://www.indeed.com/career-advice/interviewing/what-to-do-after-an-interview",
        source: "Indeed",
        type: "article",
        description:
          "A timeline for follow-ups, when to check in, and how to handle silence gracefully.",
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

export default function InterviewPreparationPage() {
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
          <div className="text-5xl mb-4">🎤</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interview Preparation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Master the STAR method, prepare behavioral stories, and boost your
            confidence before the big day.
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
