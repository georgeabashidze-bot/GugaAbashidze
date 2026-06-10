import React from 'react';
import PageShell from '@/components/PageShell';

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Smart care. Real impact."
      intro="SmartPaw was built in Tbilisi by pet parents who got tired of late-night shop runs, forgotten food bags and feeders that just don’t fit a real schedule. We pair vet-approved brands with a free SmartPaw Feeder and door-to-door delivery — so the routine actually runs itself."
      image="https://images.pexels.com/photos/8434670/pexels-photo-8434670.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="A SmartPaw delivery box"
      comingSoon
      comingSoonNote="founder story, team and impact metrics in the next update"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
        {[
          { t: 'Vet-aligned', d: 'Every brand on the shelf is one a Tbilisi vet would recommend — no diet fads, no gimmicks.' },
          { t: 'Honest pricing', d: 'No hidden fees, no minimum-order tax. The price you sign up at is the price you keep.' },
          { t: 'Tbilisi roots', d: 'Locally founded, locally delivered. We answer the WhatsApp, we know the districts.' },
        ].map((v) => (
          <div key={v.t} className="card-soft p-7">
            <h3 className="font-display font-bold text-[#05223D] text-xl tracking-tight">{v.t}</h3>
            <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{v.d}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
