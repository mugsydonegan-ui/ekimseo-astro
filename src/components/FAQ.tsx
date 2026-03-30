import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#1a3a2a]/15">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-6 text-left text-[#1a1a18] hover:text-[#1a3a2a] transition-colors group"
            aria-expanded={openIndex === i}
          >
            <span className="text-base md:text-lg font-semibold pr-6 tracking-tight">{item.question}</span>
            <span
              className={`shrink-0 w-8 h-8 border border-[#1a3a2a]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#c9973a] group-hover:text-[#c9973a] ${openIndex === i ? 'bg-[#1a3a2a] border-[#1a3a2a] text-[#f5f0e8] rotate-45' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-6' : 'max-h-0'}`}
          >
            <p className="text-[#3d3d38] leading-relaxed max-w-[65ch]">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
