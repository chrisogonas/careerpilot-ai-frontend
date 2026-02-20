"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function NewResumePage() {
  const router = useRouter();
  const { user, isLoading, createResume } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [method, setMethod] = useState<"blank" | "paste" | "upload">("blank");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a resume title");
      return;
    }

    if (!content.trim()) {
      alert("Please enter resume content");
      return;
    }

    try {
      setIsCreating(true);
      const newResume = await createResume({
        title,
        content,
        file_name: uploadFile?.name || `${title.replace(/\s+/g, "-")}.txt`,
        is_default: false,
      });
      // Redirect to the new resume
      router.push(`/resumes/${newResume.id}/edit`);
    } catch (err) {
      console.error("Failed to create resume:", err);
      alert("Failed to create resume");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const templates = [
    {
      id: "chronological",
      name: "Chronological",
      description: "Traditional format listing experience by date",
      example: `[YOUR NAME]
[YOUR EMAIL] | [YOUR PHONE]

PROFESSIONAL SUMMARY
[2-3 sentence summary of your career]

EXPERIENCE
[Job Title] | [Company Name] | [Dates]
- Achievement metric
- Key responsibility and accomplishment
- Another highlight

[Previous Job Title] | [Company Name] | [Dates]
- Achievement metric
- Key responsibility and accomplishment

EDUCATION
[Degree] | [University] | [Year]

SKILLS
- Technical Skills: [List relevant skills]
- Languages: [List languages]
`,
    },
    {
      id: "functional",
      name: "Functional",
      description: "Focus on skills and accomplishments rather than chronology",
      example: `[YOUR NAME]
[YOUR EMAIL] | [YOUR PHONE]

PROFESSIONAL SUMMARY
[2-3 sentence summary of your career]

CORE COMPETENCIES
- Skill Category 1: Related skills
- Skill Category 2: Related skills
- Skill Category 3: Related skills

PROFESSIONAL ACHIEVEMENTS
[Achievement Title]
Led project that resulted in [specific metric]

[Another Achievement]
Improved process that resulted in [specific metric]

WORK HISTORY
[Job Title] | [Company Name] | [Dates]
[Job Title] | [Company Name] | [Dates]

EDUCATION
[Degree] | [University] | [Year]
`,
    },
    {
      id: "combination",
      name: "Combination",
      description: "Blend of skills and chronological experience",
      example: `[YOUR NAME]
[YOUR EMAIL] | [YOUR PHONE]

PROFESSIONAL SUMMARY
[2-3 sentence summary of your career]

KEY SKILLS
[Skill 1] • [Skill 2] • [Skill 3] • [Skill 4]

PROFESSIONAL EXPERIENCE
[Job Title] | [Company Name] | [Dates]
- Key achievement with metric
- Responsibility and accomplishment
- Another highlight

[Job Title] | [Company Name] | [Dates]
- Achievement metric
- Key responsibility and accomplishment

EDUCATION
[Degree] | [University] | [Year]

CERTIFICATIONS
- [Certification Name] | [Year]
`,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/resumes" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Resumes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Create New Resume</h1>
          <p className="text-gray-600 mt-2">Choose how you'd like to get started</p>
        </div>

        {/* Method Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => setMethod("blank")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              method === "blank"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900">Start Blank</h3>
            <p className="text-sm text-gray-600">Create from scratch with a template</p>
          </button>

          <button
            onClick={() => setMethod("paste")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              method === "paste"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">Paste Content</h3>
            <p className="text-sm text-gray-600">Paste your existing resume text</p>
          </button>

          <button
            onClick={() => setMethod("upload")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              method === "upload"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-semibold text-gray-900">Upload File</h3>
            <p className="text-sm text-gray-600">Upload from .txt, .doc, or similar</p>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Resume Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer Resume"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how we'll label your resume in your library
            </p>
          </div>

          {/* Method Specific Content */}
          {method === "blank" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Choose a Template
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setContent(template.example)}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "upload" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Select File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium text-gray-900">
                    {uploadFile ? uploadFile.name : "Click to select file"}
                  </p>
                  <p className="text-sm text-gray-600">
                    or drag and drop (TXT, PDF, DOC, DOCX)
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Content Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Resume Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                method === "paste"
                  ? "Paste your resume content here..."
                  : "Your resume content will appear here..."
              }
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} characters • Plain text format recommended
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Preview</p>
            <div className="bg-white p-4 rounded border border-gray-200 max-h-48 overflow-y-auto">
              <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {content ? (
                  content
                ) : (
                  <span className="text-gray-400">Your resume preview will appear here...</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              disabled={isCreating || !title.trim() || !content.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "✓ Create Resume"}
            </button>
            <Link
              href="/resumes"
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h3>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Keep formatting simple and clean for ATS compatibility</li>
            <li>✓ Use standard section headings (EXPERIENCE, EDUCATION, SKILLS)</li>
            <li>✓ Include measurable achievements and results</li>
            <li>✓ Use keywords from the job description you're applying for</li>
            <li>✓ Keep each role description to 3-4 bullet points maximum</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
