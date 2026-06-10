import React from 'react';
import { Check } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useSignup } from '@/lib/SignupContext';

const PLANS = [
  {
    name: 'Starter',
    tagline: 'For one small pet, getting routine in place.',
    features: ['1 pet profile', 'Monthly delivery', 'Free SmartPaw Feeder*', 'Free door-to-door delivery', 'Pause / cancel anytime'],
  },
  {
    name: 'Routine',
    tagline: 'Our most popular — full shelf, on a schedule.',
    features: ['Up to 2 pet profiles', 'Weekly or bi-weekly delivery', 'Free SmartPaw Feeder', 'Free door-to-door delivery', 'Priority WhatsApp support', 'Free swap if your pet doesn’t like a product'],
    featured: true,
  },
  {
    name: 'Multi-Pet',
    tagline: 'For households with more than two dogs or cats.',
    features: ['Unlimited pet profiles', 'Custom delivery cadence', 'Free SmartPaw Feeders for each pet', 'Free door-to-door delivery', 'Dedicated account contact', 'Early access to special offers'],
  },
];

export default function PlansPage() {
  const { openSignup } = useSignup();
  return (
    <PageShell
      eyebrow="Plans & Pricing"
      title="One subscription, three sizes."
      intro="Plans below are an early outline — final pricing is being finalized with our partner brands. Register now to lock in launch pricing and your free SmartPaw Feeder."
      comingSoon
      comingSoonNote="final prices being confirmed"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
        {PLANS.map((p) => (
          <div
            key={p.name}
            data-testid={`plan-${p.name.toLowerCase()}-card`}
            className={`relative card-soft p-7 md:p-9 flex flex-col ${p.featured ? 'border-2 border-[#F25C05] shadow-[0_18px_44px_rgba(242,92,5,0.15)]' : ''}`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-7 bg-[#F25C05] text-white text-[10px] tracking-[0.22em] uppercase font-bold px-3 py-1.5 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="font-display font-extrabold text-[#05223D] text-3xl tracking-tight">{p.name}</h3>
            <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{p.tagline}</p>
            <div className="mt-6">
              <p className="font-display font-extrabold text-[#0A4D8C] text-4xl">
                ₾<span className="text-[#465B70]/40">—</span>
              </p>
              <p className="text-xs text-[#465B70] mt-1">Launch pricing on the way</p>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[#05223D]">
                  <span className="w-6 h-6 mt-0.5 shrink-0 rounded-full bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={openSignup}
              className={`mt-7 ${p.featured ? 'btn-primary' : 'btn-secondary'} justify-center`}
              data-testid={`plan-${p.name.toLowerCase()}-cta`}
            >
              Register interest
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#465B70]/80 mt-7 text-center">
        * Free SmartPaw Feeder available on eligible plans. Conditions and minimum-term details will be published with launch pricing.
      </p>
    </PageShell>
  );
}
