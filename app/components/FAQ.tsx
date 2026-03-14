"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQItemComponent({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-gray-900 text-left">{question}</h3>
        <span className={`text-2xl text-blue-600 transition transform ${isOpen ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection({
  title = "Frequently Asked Questions",
  items,
  className = "",
}: {
  title?: string;
  items: FAQItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <FAQItemComponent key={idx} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}
