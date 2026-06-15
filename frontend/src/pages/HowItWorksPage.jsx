import React, { useState } from 'react';
import { ClipboardList, PackageSearch, CalendarClock, Truck, RefreshCw, HeartHandshake, Plus, Minus, ArrowRight } from 'lucide-react';
import PageShell from '@/components/PageShell';
import HowItWorks from '@/components/HowItWorks';
import WhySmartPaw from '@/components/WhySmartPaw';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';
import { WHATSAPP_URL as buildWhatsAppUrl } from '@/lib/siteConfig';

const WHATSAPP_HREF = buildWhatsAppUrl();

const TIMELINE = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Tell us about your pet',
    body: 'A 2-minute form: species, breed, age, weight, sensitivities and the routine you keep today. We use it to size portions and pre-pick a shelf that fits.',
    bullets: ['Pet profile + photo (optional)', 'Dietary notes & allergies', 'Your district in Tbilisi'],
  },
  {
    n: '02',
    icon: PackageSearch,
    title: 'We curate the shelf',
    body: 'Our team matches your profile with vet-aligned brands. You see exactly what is going in the box — swap anything, lock anything in.',
    bullets: ['Vet-recommended brand match', 'Food + hygiene + treats bundle', 'You approve before first ship'],
  },
  {
    n: '03',
    icon: CalendarClock,
    title: 'Choose your cadence',
    body: 'Weekly, bi-weekly or monthly. Pick a delivery window that fits your week — we lock it in and keep it predictable.',
    bullets: ['Weekly · bi-weekly · monthly', 'Pick a 2-hour delivery window', 'Pause or skip any time'],
  },
  {
    n: '04',
    icon: Truck,
    title: 'We deliver — door to door',
    body: 'Same courier where possible, so your dog stops barking at the doorbell. Contact-free, signed receipts, and a heads-up an hour before arrival.',
    bullets: ['Free delivery on every plan', 'WhatsApp on-the-way alert', 'Leave-at-door if you prefer'],
  },
  {
    n: '05',
    icon: RefreshCw,
    title: 'Adjust anytime',
    body: 'Pet on a new diet? Travelling? Just say the word. Skip a delivery, swap a brand, change the cadence — no fees, no friction.',
    bullets: ['Brand swap, no charge', 'Skip / pause from WhatsApp', 'Profile updates anytime'],
  },
  {
    n: '06',
    icon: HeartHandshake,
    title: 'A team that picks up',
    body: 'A real human on the other end. We answer WhatsApp during opening hours and remember your pet by name on the second message.',
    bullets: ['WhatsApp, not chatbots', 'Local Tbilisi team', '1-hour median reply time'],
  },
];

const INLINE_FAQS = [
  { q: 'How long does signup take?', a: 'About two minutes. You tell us about your pet, pick a cadence, and we send a tailored quote on WhatsApp — usually within the hour.' },
  { q: 'Do I have to commit to a contract?', a: 'No. Every plan is month-to-month. Pause, skip or cancel any time — no questions and no exit fees.' },
  { q: 'What happens if my pet doesn’t like a product?', a: 'Tell us on WhatsApp and we’ll swap it on your next delivery at no extra cost. We track what your pet actually eats and refine over time.' },
  { q: 'Is delivery really free?', a: 'Yes, on every plan, in every district of Tbilisi. There are no minimum-order fees and no fuel surcharges.' },
  { q: 'Can I get a SmartPaw Feeder without the box?', a: 'The Feeder is part of the 150 GEL/month plan — see the Plans page for the breakdown. It ships free once the plan is active.' },
];

export default function HowItWorksPage() {
  const { openSignup } = useSignup();
  return (
    <>
      <SeoMeta
        title="How it works — sign up, sit back"
        description="The exact six-step workflow we run for every SmartPaw subscription in Tbilisi — from pet profile to door-to-door delivery."
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'How it works', path: '/how-it-works' },
        ])}
      />
      <PageShell
        eyebrow="How It Works"
        title="Sign up, sit back."
        intro="A subscription that keeps your pet’s shelf stocked. Pick the brands once, set your cadence — we deliver on schedule. Pause or cancel any time."
        image="https://images.pexels.com/photos/35620584/pexels-photo-35620584.jpeg?auto=compress&cs=tinysrgb&w=1400"
        imageAlt="Happy dog with owner"
      />

      <HowItWorks onOpenSignup={openSignup} />

      {/* Detailed step-by-step timeline */}
      <section className="py-20 md:py-28 bg-[#FDFBF7]" data-testid="how-timeline-section">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12 md:mb-16">
            <div className="lg:col-span-5">
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Step by step</p>
              <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
                What happens from signup to second delivery.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-[#465B70] text-lg leading-relaxed">
                We built SmartPaw around what Tbilisi pet parents actually told us: too many shop runs, too many ‘out of stock’ messages, too many feeders that fight the routine instead of supporting it. Here is the workflow we run for every customer — predictable, honest and human.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Vertical guideline */}
            <span
              className="hidden md:block absolute left-9 top-4 bottom-4 w-px bg-[#0A4D8C]/15"
              aria-hidden
            />
            <ol className="space-y-5 md:space-y-7">
              {TIMELINE.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.n}
                    className="relative grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-start"
                    data-testid={`how-timeline-step-${i + 1}`}
                  >
                    <div className="md:col-span-2 flex md:justify-start items-center gap-4">
                      <span className="relative z-[1] w-[72px] h-[72px] rounded-2xl bg-[#0A4D8C] text-white flex items-center justify-center shadow-[0_18px_38px_rgba(10,77,140,0.25)]">
                        <Icon size={28} strokeWidth={1.75} />
                      </span>
                      <span className="md:hidden font-display font-extrabold text-3xl text-[#F25C05]">{s.n}</span>
                    </div>
                    <div className="md:col-span-10 card-soft p-7 md:p-9">
                      <div className="flex items-baseline gap-4">
                        <span className="hidden md:block font-display font-extrabold text-5xl text-[#F25C05] leading-none">
                          {s.n}
                        </span>
                        <h3 className="font-display font-bold text-[#05223D] text-2xl md:text-[28px] tracking-tight">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-[#465B70] mt-3 leading-relaxed max-w-3xl">{s.body}</p>
                      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {s.bullets.map((b) => (
                          <li
                            key={b}
                            className="text-sm font-bold text-[#05223D] bg-[#F5F2EB] rounded-xl px-4 py-3 leading-snug"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-12 md:mt-16 flex flex-wrap items-center gap-3">
            <button
              onClick={openSignup}
              className="btn-primary"
              data-testid="how-timeline-cta-button"
            >
              Start your plan
              <ArrowRight size={18} />
            </button>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              data-testid="how-timeline-whatsapp-link"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <WhySmartPaw onOpenSignup={openSignup} />

      {/* Inline FAQ */}
      <section className="py-20 md:py-28" data-testid="how-inline-faq-section">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Quick answers</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
              Before you sign up.
            </h2>
          </div>
          <div className="mt-10 md:mt-14 space-y-3">
            {INLINE_FAQS.map((f, i) => (
              <InlineFAQ key={i} idx={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function InlineFAQ({ idx, q, a }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div
      data-testid={`how-faq-item-${idx}`}
      className={`card-soft transition-all duration-300 ${open ? 'shadow-[0_18px_44px_rgba(10,77,140,0.10)]' : ''}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid={`how-faq-toggle-${idx}`}
        className="w-full flex items-start gap-4 text-left px-6 py-5 md:px-8 md:py-6"
      >
        <span className={`mt-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${open ? 'bg-[#F25C05] text-white' : 'border border-[#0A4D8C33] text-[#0A4D8C]'}`}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
        <span className="flex-1">
          <span className="block font-display font-bold text-[#05223D] text-lg md:text-xl tracking-tight">
            {q}
          </span>
          {open && (
            <span className="block text-[#465B70] leading-relaxed mt-3">{a}</span>
          )}
        </span>
      </button>
    </div>
  );
}
