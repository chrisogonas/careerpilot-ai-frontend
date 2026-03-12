"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export default function StarStoryBuilderFeature() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Home
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="text-5xl">⭐</span>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              STAR Story Builder
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Turn your work experiences into polished behavioral interview answers using the
              STAR method (Situation, Task, Action, Result). The AI helps you structure compelling
              stories that demonstrate your skills with concrete, measurable outcomes.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          {isAuthenticated ? (
            <Link href="/star-stories" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Build a STAR Story →
            </Link>
          ) : (
            <Link href="/auth/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Free — Try It Now →
            </Link>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Describe Your Experience" description="Tell the AI about a professional experience — a project you led, a problem you solved, or a goal you achieved." />
            <StepCard number="2" title="AI Structures It" description="The AI breaks your experience into the STAR framework: Situation, Task, Action, and Result — with quantified outcomes." />
            <StepCard number="3" title="Use In Interviews" description="Save your STAR stories and reference them during behavioral interviews. Practice delivering them with Mock Interviews." />
          </div>
        </div>
      </div>

      {/* What is STAR? */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">The STAR Method Explained</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-700 text-lg mb-2">S — Situation</h4>
              <p className="text-gray-600 text-sm">Set the scene. Describe the context and background of the situation you faced.</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-indigo-500">
              <h4 className="font-bold text-indigo-700 text-lg mb-2">T — Task</h4>
              <p className="text-gray-600 text-sm">Explain your specific responsibility or the challenge you needed to address.</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-purple-500">
              <h4 className="font-bold text-purple-700 text-lg mb-2">A — Action</h4>
              <p className="text-gray-600 text-sm">Detail the specific steps you took. Focus on what you did, not the team.</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-emerald-500">
              <h4 className="font-bold text-emerald-700 text-lg mb-2">R — Result</h4>
              <p className="text-gray-600 text-sm">Share the outcome with measurable results — numbers, percentages, or impact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit title="Structured Storytelling" description="The AI ensures every story follows the proven STAR format that interviewers expect and look for." />
            <Benefit title="Quantified Results" description="The AI helps you quantify outcomes — even if you didn't think of numbers initially, it prompts you to add metrics." />
            <Benefit title="Story Library" description="Build a library of STAR stories covering different competencies: leadership, teamwork, problem-solving, communication." />
            <Benefit title="Interview-Ready" description="Stories are written in a natural, conversational delivery style — ready to use in behavioral interviews as-is." />
            <Benefit title="Pairs With Mock Interviews" description="Use your STAR stories during AI mock interview practice sessions to refine your delivery and timing." />
            <Benefit title="Available on All Plans" description="STAR story generation is available on every plan including Free, so you can start building your story library right away." />
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Pricing</h3>
          <p className="text-gray-600 text-lg">
            STAR story generation costs <strong>3 credits</strong> per story.
            Available on <strong>all plans</strong> including Free.
          </p>
          {!isAuthenticated && (
            <Link href="/auth/register" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Get Started Free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-3">{number}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Benefit({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <span className="text-blue-600 mt-0.5">✓</span>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
