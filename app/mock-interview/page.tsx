"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/utils/api";
import { Resume, InterviewAccessResponse, InterviewRespondResponse, InterviewFeedback, InterviewSessionSummary, InterviewSessionOut } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────────────────────

type PageView = "setup" | "interview" | "feedback" | "history" | "review";

interface ChatMessage {
  role: "interviewer" | "candidate";
  content: string;
  questionType?: string | null;
  score?: number | null;
  feedback?: string | null;
}

// ─── Helper: Score colour ───────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 8) return "bg-green-100 border-green-300";
  if (score >= 6) return "bg-yellow-100 border-yellow-300";
  return "bg-red-100 border-red-300";
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MockInterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Loading…</div></div>}>
      <MockInterviewContent />
    </Suspense>
  );
}

function MockInterviewContent() {
  const { user, isAuthenticated, isLoading: authLoading, getResumes } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── State: Page view
  const [view, setView] = useState<PageView>("setup");

  // ── State: Access
  const [access, setAccess] = useState<InterviewAccessResponse | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);

  // ── State: Setup form
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [interviewMode, setInterviewMode] = useState<"text" | "audio">("text");
  const [showResumeText, setShowResumeText] = useState(false);
  const [extractingUrl, setExtractingUrl] = useState(false);

  // ── State: Interview session
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalPlanned, setTotalPlanned] = useState(7);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [starting, setStarting] = useState(false);

  // ── State: Feedback
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  // ── State: History
  const [history, setHistory] = useState<InterviewSessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── State: Review session
  const [reviewSession, setReviewSession] = useState<InterviewSessionOut | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // ── State: Audio (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ── State: Global
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // ── Fetch access + resumes on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const init = async () => {
      try {
        const [accessData, resumes] = await Promise.all([
          apiClient.getInterviewAccess(),
          getResumes(),
        ]);
        setAccess(accessData);
        setSavedResumes(resumes);
        if (resumes.length > 0) {
          setSelectedResumeId(resumes[0].id);
          setResumeText(resumes[0].content);
        }
      } catch (err) {
        console.error("Init failed:", err);
      } finally {
        setAccessLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Pre-fill from query params (from job search)
  useEffect(() => {
    if (!searchParams) return;
    const desc = searchParams.get('jobDescription');
    const role = searchParams.get('targetRole');
    const company = searchParams.get('companyName');
    const url = searchParams.get('jobUrl');
    if (desc) setJobDescription(desc);
    if (role) setTargetRole(role);
    if (company) setCompanyName(company);
    if (url) setJobUrl(url);
  }, [searchParams]);

  // ── Ref to always track latest currentAnswer for speech recognition ────
  const currentAnswerRef = useRef(currentAnswer);
  useEffect(() => { currentAnswerRef.current = currentAnswer; }, [currentAnswer]);

  // ── Speech helpers ────────────────────────────────────────────────────────

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalTranscript = currentAnswerRef.current;
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setCurrentAnswer(finalTranscript + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── URL extractor ────────────────────────────────────────────────────────

  const handleExtractUrl = async () => {
    if (!jobUrl.trim()) return;
    setExtractingUrl(true);
    setError("");
    try {
      const data = await apiClient.extractJobFromURL(jobUrl.trim());
      if (data.job_description) setJobDescription(data.job_description);
      if (data.title) setTargetRole(data.title);
      if (data.company) setCompanyName(data.company);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract job from URL");
    } finally {
      setExtractingUrl(false);
    }
  };

  // ── Resume select handler ────────────────────────────────────────────────

  const handleResumeSelect = (id: string) => {
    setSelectedResumeId(id);
    setShowResumeText(false);
    const r = savedResumes.find((r) => r.id === id);
    if (r) setResumeText(r.content);
  };

  // ── Start interview ──────────────────────────────────────────────────────

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStarting(true);
    try {
      const response = await apiClient.startInterview({
        resume_text: resumeText,
        job_description: jobDescription,
        target_role: targetRole,
        company_name: companyName,
        job_url: jobUrl,
        interview_mode: interviewMode,
      });
      setSessionId(response.session_id);
      setQuestionNumber(response.question_number);
      setTotalPlanned(response.total_planned);
      setMessages([{
        role: "interviewer",
        content: response.first_question,
        questionType: response.question_type,
      }]);
      setIsComplete(false);
      setFeedback(null);
      setView("interview");

      if (interviewMode === "audio") speak(response.first_question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  // ── Submit answer ────────────────────────────────────────────────────────

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || submitting) return;
    setError("");
    setSubmitting(true);

    // Add candidate message to chat
    const candidateMsg: ChatMessage = { role: "candidate", content: currentAnswer.trim() };
    setMessages((prev) => [...prev, candidateMsg]);
    const answer = currentAnswer.trim();
    setCurrentAnswer("");

    try {
      const resp: InterviewRespondResponse = await apiClient.respondToInterview(sessionId, answer);

      // Add AI evaluation feedback as context
      const interviewerMsg: ChatMessage = {
        role: "interviewer",
        content: resp.next_question || "",
        questionType: resp.next_question_type,
        score: resp.answer_score,
        feedback: resp.answer_feedback,
      };

      if (resp.is_complete) {
        setIsComplete(true);
        // Fetch complete session to get feedback
        try {
          const session = await apiClient.getInterviewSession(sessionId);
          if (session.feedback) setFeedback(session.feedback);
        } catch {
          // feedback might not be ready yet
        }
        // If no next question but we have feedback, show feedback only
        if (!resp.next_question) {
          setMessages((prev) => [...prev, {
            role: "interviewer",
            content: "",
            score: resp.answer_score,
            feedback: resp.answer_feedback,
          }]);
        } else {
          setMessages((prev) => [...prev, interviewerMsg]);
        }
      } else {
        setMessages((prev) => [...prev, interviewerMsg]);
        setQuestionNumber(resp.question_number);
        if (interviewMode === "audio" && resp.next_question) speak(resp.next_question);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  // ── End interview early ──────────────────────────────────────────────────

  const handleEndInterview = async () => {
    if (ending) return;
    setEnding(true);
    setError("");
    try {
      const resp = await apiClient.endInterview(sessionId);
      setFeedback(resp.feedback);
      setIsComplete(true);
      setView("feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end interview");
    } finally {
      setEnding(false);
    }
  };

  // ── Load history ─────────────────────────────────────────────────────────

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const sessions = await apiClient.getInterviewSessions();
      setHistory(sessions);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── View session detail ──────────────────────────────────────────────────

  const viewSessionDetail = async (id: string) => {
    setReviewLoading(true);
    try {
      const sess = await apiClient.getInterviewSession(id);
      setReviewSession(sess);
      setView("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Delete session ───────────────────────────────────────────────────────

  const deleteSession = async (id: string) => {
    if (!confirm("Delete this interview session?")) return;
    try {
      await apiClient.deleteInterviewSession(id);
      setHistory((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    }
  };

  // ── Loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  // ── No access state
  if (access && !access.has_access) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Interview Practice</h1>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Required</h2>
            <p className="text-gray-600 mb-6">{access.reason}</p>
            <a
              href="/subscribe"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Upgrade Your Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: FEEDBACK VIEW
  // ===========================================================================

  const renderFeedback = (fb: InterviewFeedback, showBackButton = true) => (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete</h2>
        <div className={`text-6xl font-bold ${scoreColor(fb.overall_score)}`}>
          {fb.overall_score.toFixed(1)}<span className="text-2xl text-gray-400">/10</span>
        </div>
        <p className="text-gray-600 mt-2">{fb.summary}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500 mb-1">STAR Adherence</p>
          <p className="font-semibold text-gray-800">{fb.star_adherence}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Communication</p>
          <p className="font-semibold text-gray-800">{fb.communication_quality}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500 mb-1">Confidence</p>
          <p className="font-semibold text-gray-800">{fb.confidence_impression}</p>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 p-5 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>✅</span> Strengths
          </h3>
          <ul className="space-y-2">
            {fb.strengths.map((s, i) => (
              <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                <span className="mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <span>📈</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {fb.improvements.map((imp, i) => (
              <li key={i} className="text-amber-700 text-sm flex items-start gap-2">
                <span className="mt-0.5">•</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Per-question breakdown */}
      {fb.per_question && fb.per_question.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Question-by-Question Breakdown</h3>
          <div className="space-y-4">
            {fb.per_question.map((pq, i) => (
              <div key={i} className={`p-4 rounded-lg border ${scoreBg(pq.score)}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900 flex-1">Q{i + 1}: {pq.question}</p>
                  <span className={`ml-2 font-bold ${scoreColor(pq.score)}`}>{pq.score}/10</span>
                </div>
                <p className="text-sm text-gray-600 italic mb-1">Your answer: {pq.answer_summary}</p>
                <p className="text-sm text-gray-700">{pq.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus areas */}
      {fb.recommended_focus_areas && fb.recommended_focus_areas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">🎯 Recommended Focus Areas</h3>
          <ul className="space-y-2">
            {fb.recommended_focus_areas.map((area, i) => (
              <li key={i} className="text-blue-700 text-sm flex items-start gap-2">
                <span className="mt-0.5">{i + 1}.</span> {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showBackButton && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setView("setup"); setFeedback(null); setMessages([]); setSessionId(""); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start New Interview
          </button>
          <button
            onClick={() => { loadHistory(); setView("history"); }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            View History
          </button>
        </div>
      )}
    </div>
  );

  // ===========================================================================
  // RENDER: REVIEW PAST SESSION
  // ===========================================================================

  if (view === "review") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView("history")}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            ← Back to History
          </button>
          {reviewLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
            </div>
          ) : reviewSession ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {reviewSession.target_role || "Mock Interview"}{" "}
                  {reviewSession.company_name ? `at ${reviewSession.company_name}` : ""}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(reviewSession.started_at).toLocaleDateString()} •{" "}
                  {reviewSession.interview_mode === "audio" ? "🎤 Audio" : "💬 Text"} •{" "}
                  {reviewSession.total_questions} question{reviewSession.total_questions !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Transcript */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Interview Transcript</h3>
                <div className="space-y-3">
                  {reviewSession.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        m.role === "interviewer"
                          ? "bg-blue-50 border-l-4 border-blue-400"
                          : "bg-gray-50 border-l-4 border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {m.role === "interviewer" ? "🤖 Interviewer" : "👤 You"}
                        {m.question_type ? ` • ${m.question_type}` : ""}
                        {m.score ? ` • Score: ${m.score}` : ""}
                      </p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{m.content}</p>
                      {m.feedback && (
                        <p className="text-xs text-gray-500 mt-1 italic">Feedback: {m.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {reviewSession.feedback && renderFeedback(reviewSession.feedback, false)}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: HISTORY VIEW
  // ===========================================================================

  if (view === "history") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Interview History</h1>
              <p className="text-gray-600 mt-1">Review your past mock interviews and track progress</p>
            </div>
            <button
              onClick={() => setView("setup")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              New Interview
            </button>
          </div>

          {historyLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No interviews yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((s) => (
                <div key={s.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {s.target_role || "Mock Interview"}
                      {s.company_name ? ` — ${s.company_name}` : ""}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(s.started_at).toLocaleDateString()} •{" "}
                      {s.interview_mode === "audio" ? "🎤 Audio" : "💬 Text"} •{" "}
                      {s.total_questions} Q  •{" "}
                      <span className={s.status === "completed" ? "text-green-600" : "text-amber-600"}>
                        {s.status}
                      </span>
                      {s.overall_score && ` • Score: ${s.overall_score}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewSessionDetail(s.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: FEEDBACK VIEW (standalone)
  // ===========================================================================

  if (view === "feedback" && feedback) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Interview Feedback</h1>
            <p className="text-gray-600 mt-1">
              {targetRole && `${targetRole}`}{companyName && ` at ${companyName}`}
            </p>
          </div>
          {renderFeedback(feedback)}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: INTERVIEW VIEW (active session)
  // ===========================================================================

  if (view === "interview") {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 bg-slate-50 flex flex-col">
        {/* Header bar — at top */}
        <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-gray-900 text-lg">
              Mock Interview {targetRole && `— ${targetRole}`}
            </h1>
            <p className="text-gray-500 text-xs">
              Question {questionNumber} of {totalPlanned} •{" "}
              {interviewMode === "audio" ? "🎤 Audio Mode" : "💬 Text Mode"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(questionNumber / totalPlanned) * 100}%` }}
              />
            </div>
            <button
              onClick={handleEndInterview}
              disabled={ending}
              className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
            >
              {ending ? "Ending..." : "End Interview"}
            </button>
          </div>
        </div>

        {/* Chat area — scrollable middle section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i}>
                {/* Show per-answer feedback before the next question */}
                {m.role === "interviewer" && m.feedback && (
                  <div className="mb-2 p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-600 font-semibold">Feedback</span>
                      {m.score != null && (
                        <span className={`font-bold ${scoreColor(m.score)}`}>{m.score}/10</span>
                      )}
                    </div>
                    <p className="text-purple-800 text-sm">{m.feedback}</p>
                  </div>
                )}

                {/* Message bubble */}
                {m.content && (
                  <div className={`flex ${m.role === "candidate" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        m.role === "interviewer"
                          ? "bg-white shadow border border-gray-100 text-gray-800"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {m.role === "interviewer" && m.questionType && (
                        <span className="text-xs font-medium text-blue-500 uppercase tracking-wide block mb-2">
                          {m.questionType}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {submitting && (
              <div className="flex justify-start">
                <div className="bg-white shadow border border-gray-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            {isComplete && feedback && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setView("feedback")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  View Full Feedback →
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area — at bottom */}
        {!isComplete && (
          <div className="bg-white border-t shadow-md px-4 py-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                {interviewMode === "audio" && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-full transition ${
                      isListening
                        ? "bg-red-100 text-red-600 animate-pulse"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={isListening ? "Stop listening" : "Start speaking"}
                  >
                    {isListening ? "⏹️" : "🎤"}
                  </button>
                )}
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                  placeholder={
                    interviewMode === "audio"
                      ? "Your speech will appear here, or type your answer..."
                      : "Type your answer... (Enter to send, Shift+Enter for new line)"
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  disabled={submitting}
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "..." : "Send"}
                </button>
              </div>
              {isSpeaking && (
                <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                  <span className="animate-pulse">🔊</span> AI is speaking...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // RENDER: SETUP VIEW (default)
  // ===========================================================================

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Mock Interview Practice</h1>
            <p className="text-gray-600 mt-2">
              Practice with an AI interviewer and get instant, detailed feedback
            </p>
          </div>
          <button
            onClick={() => { loadHistory(); setView("history"); }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View History →
          </button>
        </div>

        {/* Trial banner */}
        {access?.is_trial && access.trial_days_remaining != null && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>🎉</span>
            <span>
              <strong>Trial Access</strong> — You have {access.trial_days_remaining} day{access.trial_days_remaining !== 1 ? "s" : ""} remaining
              with full text + audio interview access.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            {/* Resume selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Resume *
              </label>
              {savedResumes.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleResumeSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a resume --</option>
                    {savedResumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} (v{r.version} • {r.content.length} chars)
                      </option>
                    ))}
                  </select>
                  {selectedResumeId && (() => {
                    const selected = savedResumes.find((r) => r.id === selectedResumeId);
                    return selected ? (
                      <>
                        <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-900">{selected.title}</h4>
                              <p className="text-sm text-gray-600">
                                Version {selected.version} • {resumeText.length} characters
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowResumeText(!showResumeText)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {showResumeText ? "Hide" : "View"}
                            </button>
                          </div>
                        </div>
                        {showResumeText && (
                          <textarea
                            value={resumeText}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-default"
                            rows={6}
                          />
                        )}
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-gray-600">
                    No saved resumes.{" "}
                    <a href="/resumes/new" className="text-blue-600 hover:underline">Upload one</a> first.
                  </p>
                </div>
              )}
            </div>

            {/* Job URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job URL <span className="text-gray-400">(optional — auto-fills fields below)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://example.com/jobs/123"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleExtractUrl}
                  disabled={extractingUrl || !jobUrl.trim()}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {extractingUrl ? "Extracting..." : "Extract"}
                </button>
              </div>
            </div>

            {/* Target Role + Company (side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
              />
            </div>

            {/* Interview Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Interview Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewMode("text")}
                  disabled={!access?.modes_available.includes("text")}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    interviewMode === "text"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!access?.modes_available.includes("text") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">💬</span>
                    <span className="font-semibold text-gray-900">Text Chat</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-9">Type your answers in a chat interface</p>
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewMode("audio")}
                  disabled={!access?.modes_available.includes("audio")}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    interviewMode === "audio"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!access?.modes_available.includes("audio") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">🎤</span>
                    <span className="font-semibold text-gray-900">Audio</span>
                    {!access?.modes_available.includes("audio") && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 ml-9">
                    Speak your answers — AI reads questions aloud
                  </p>
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 text-sm mb-2">How it works</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>The AI interviewer asks ~7 questions (behavioral, situational, technical)</li>
                <li>You answer each question — receive instant micro-feedback</li>
                <li>Follow-up questions may be asked based on your answers</li>
                <li>At the end, get a comprehensive scorecard with detailed improvement tips</li>
              </ol>
              <p className="text-xs text-gray-400 mt-2">Cost: 5 credits per session</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={starting || !resumeText || !jobDescription.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {starting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  Starting Interview...
                </span>
              ) : (
                "Start Mock Interview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
