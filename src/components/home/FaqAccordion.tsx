'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion() {
  const faqs: FaqItem[] = [
    {
      question: "Is Contribo free to use?",
      answer: "Yes, Contribo is 100% free and open-source. We aim to support contributors globally in finding, preparing for, and tracking mentorship programs."
    },
    {
      question: "How does the AI Matcher work?",
      answer: "Our AI Matcher analyzes your technical skills, difficulty preferences, and topics of interest, comparing them with thousands of projects in our database to recommend the most suitable opportunities."
    },
    {
      question: "Are stipends guaranteed?",
      answer: "Stipends are paid directly by the organizing foundations (Google, CNCF, etc.) to accepted contributors who successfully complete their project milestones. Contribo tracks and lists these ranges for informational purposes."
    },
    {
      question: "Can I track multiple programs at once?",
      answer: "Yes! Your personal dashboard is unified across all programs. You can save projects, log proposal drafts, and track deadlines for GSoC, ESoC, LFX, and Outreachy simultaneously."
    },
    {
      question: "Can I participate if I am not a student?",
      answer: "Yes! Many programs like Outreachy, LFX Mentorship, and Hacktoberfest do not require student status. They are open to anyone who meets their specific eligibility criteria."
    },
    {
      question: "How do I start contributing to a project?",
      answer: "Start by reading the project's contributing guide (usually CONTRIBUTING.md). Look for issues labeled 'good first issue' or 'help wanted' to make your first pull request."
    },
    {
      question: "Does ESoC require European residency?",
      answer: "European Summer of Code (ESoC) focuses on the European open-source and applied AI ecosystem, but registration and contribution guidelines may vary by organization. Check the ESoC guide for details."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className="border border-hairline rounded-2xl bg-surface overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-5 text-left font-heading font-bold text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
            >
              <span className="text-base sm:text-lg">{faq.question}</span>
              <ChevronDown 
                size={20} 
                className={`text-muted dark:text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent dark:text-accent' : ''}`} 
              />
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[500px] border-t border-hairline/40' : 'max-h-0'
              }`}
            >
              <div className="p-5 text-primary/80 dark:text-white/90 text-base leading-relaxed bg-base/30 dark:bg-black/20">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
