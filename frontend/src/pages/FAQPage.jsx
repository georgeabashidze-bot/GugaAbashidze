import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import PageShell from '@/components/PageShell';

const FAQS = [
  { q: 'How does the SmartPaw subscription work?', a: 'You register, pick your products and a delivery cadence (weekly, bi-weekly or monthly). We deliver to your door on schedule. You can pause, skip or change products any time.' },
  { q: 'Where do you deliver?', a: 'Across every district in Tbilisi. We’ll expand to other Georgian cities — register to be notified when we launch in yours.' },
  { q: 'How much does it cost?', a: 'Final plan prices are being finalized with our partner brands. Delivery is free with every plan, and there are no minimum-order fees. Register and we’ll share your tailored quote.' },
  { q: 'What is the free SmartPaw Feeder?', a: 'A programmable smart feeder that portions meals automatically. It ships free with eligible plans — keep it as long as your subscription is active.' },
  { q: 'Can I pause or cancel?', a: 'Yes — any time, no questions asked. Pause for a vacation, cancel if you move. No long contracts.' },
  { q: 'What if my pet doesn’t like a product?', a: 'Tell us and we’ll swap it on your next delivery at no extra cost.' },
  { q: 'Are your brands vet-approved?', a: 'Yes. Every brand on our shelf is one a Tbilisi vet would recommend — no diet fads, no gimmicks.' },
  { q: 'How do I update my pet’s profile?', a: 'During launch you can WhatsApp or email any changes; a self-service customer account is on the roadmap.' },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <PageShell
      eyebrow="FAQ"
      title="Questions, answered."
      intro="The most common things Tbilisi pet parents ask us. Don’t see your question? WhatsApp us — we usually reply within the hour."
    >
      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((f, i) => {
          const open = openIdx === i;
          return (
            <div
              key={i}
              data-testid={`faq-item-${i}`}
              className={`card-soft transition-all duration-300 ${open ? 'shadow-[0_18px_44px_rgba(10,77,140,0.10)]' : ''}`}
            >
              <button
                onClick={() => setOpenIdx(open ? -1 : i)}
                aria-expanded={open}
                data-testid={`faq-toggle-${i}`}
                className="w-full flex items-start gap-4 text-left px-6 py-5 md:px-8 md:py-6"
              >
                <span className={`mt-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${open ? 'bg-[#F25C05] text-white' : 'border border-[#0A4D8C33] text-[#0A4D8C]'}`}>
                  {open ? <Minus size={16} /> : <Plus size={16} />}
                </span>
                <span className="flex-1">
                  <span className="block font-display font-bold text-[#05223D] text-lg md:text-xl tracking-tight">
                    {f.q}
                  </span>
                  {open && (
                    <span className="block text-[#465B70] leading-relaxed mt-3">{f.a}</span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
