import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, ArrowUpRight, Sparkles } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';

// Plans as confirmed by the founder (Feb 2026)
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    priceSuffix: 'GEL / month',
    priceNote: 'No minimum spend',
    tagline: 'Stock from our catalogue on your schedule — delivery and reminders, free.',
    features: [
      'Free Tbilisi delivery',
      'Auto reminders before you run out',
      'Personalised feeding plan',
      'WhatsApp ops concierge',
      'Pause / skip any time',
      'Access to all Special Offers',
    ],
    ctaLabel: 'Start free',
  },
  {
    id: 'feeder',
    name: 'Free + Feeder',
    price: '0',
    priceSuffix: 'GEL / month',
    priceNote: 'min. 150 GEL monthly spend on partner products',
    tagline: 'Same free plan — plus our Wi-Fi SmartPaw Feeder on loan, set up and synced.',
    features: [
      'Everything in Free',
      'SmartPaw Wi-Fi Feeder included',
      'Feeder setup, sync & support',
      'Priority delivery slots',
      'Auto-portioning to your plan',
      'Missed-meal alerts',
    ],
    ctaLabel: 'Claim the feeder',
    featured: true,
    badge: 'Most popular',
  },
  {
    id: 'custom',
    name: 'Custom Pick',
    price: '15',
    priceSuffix: 'GEL / month',
    priceNote: 'For products outside our catalogue',
    tagline: 'Already loyal to a brand we don’t stock? We’ll source it and run the same routine.',
    features: [
      'Free Tbilisi delivery',
      'Any product, any brand — sourced for you',
      'Auto reminders & stock tracking',
      'WhatsApp ops concierge',
      'Pause / skip any time',
      'Access to all Special Offers',
    ],
    ctaLabel: 'Pick your brand',
  },
];

// Comparison matrix. Values per plan-id: true | false | string label.
const FEATURE_ROWS = [
  { label: 'Free Tbilisi delivery', free: true, feeder: true, custom: true },
  { label: 'Auto reminders & stock tracking', free: true, feeder: true, custom: true },
  { label: 'Personalised feeding plan', free: true, feeder: true, custom: false },
  { label: 'WhatsApp ops concierge', free: true, feeder: true, custom: true },
  { label: 'Pause / skip any time', free: true, feeder: true, custom: true },
  { label: 'SmartPaw Wi-Fi Feeder', free: false, feeder: 'Included', custom: 'Add-on' },
  { label: 'Priority delivery slots', free: false, feeder: true, custom: false },
  { label: 'Products outside the catalogue', free: false, feeder: false, custom: true },
  { label: 'Minimum monthly spend', free: 'None', feeder: '150 GEL', custom: '15 GEL fee' },
  { label: 'Access to Special Offers', free: true, feeder: true, custom: true },
];

// Every-plan add-ons (powered by Special Offers · Services shelf).
const SHARED_SERVICES = [
  { label: 'Mobile grooming', note: 'At your door · 60–90 min', route: '/special-offers/services' },
  { label: 'Vet home check-up', note: 'Vaccinations & wellness · 30–45 min', route: '/special-offers/services' },
  { label: 'Dog-walking package', note: '5 / 10 / 20-walk bundles', route: '/special-offers/services' },
  { label: 'Puppy training', note: '6-session program', route: '/special-offers/services' },
  { label: 'Pet sitting', note: 'Weekend cover at home', route: '/special-offers/services' },
  { label: 'Microchip & ID', note: 'ISO chip + registry', route: '/special-offers/services' },
];

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex w-7 h-7 rounded-full bg-[#F25C05]/15 text-[#F25C05] items-center justify-center">
        <Check size={14} strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex w-7 h-7 rounded-full bg-[#0A4D8C0A] text-[#0A4D8C]/40 items-center justify-center">
        <Minus size={14} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="text-sm font-bold text-[#05223D]">{value}</span>
  );
}

export default function PlansPage() {
  const { openSignup } = useSignup();
  return (
    <>
      <SeoMeta
        title="Plans & Pricing — three honest tiers in GEL"
        description="Three plans for Tbilisi pet parents. Free with delivery, 150 GEL/month with a free SmartPaw Feeder, or 15 GEL custom delivery. No minimums, no contracts."
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Plans', path: '/plans' },
        ])}
      />
    <PageShell
      eyebrow="Plans & Pricing"
      title="Pick your routine. Pay only what makes sense."
      intro="Three simple ways to put your pet's shelf on autopilot — two of them entirely free. Every plan gets WhatsApp concierge, scheduled delivery and access to our Special Offers."
      image="https://images.pexels.com/photos/4587959/pexels-photo-4587959.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Owner with a dog at home"
    >
      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7" data-testid="plans-grid">
        {PLANS.map((p) => (
          <div
            key={p.id}
            data-testid={`plan-${p.id}-card`}
            className={`relative card-soft p-7 md:p-9 flex flex-col bg-white ${
              p.featured
                ? 'border-2 border-[#F25C05] shadow-[0_24px_60px_rgba(242,92,5,0.18)] md:-translate-y-2'
                : ''
            }`}
          >
            {p.featured && (
              <span
                data-testid={`plan-${p.id}-badge`}
                className="absolute -top-3 left-7 bg-[#F25C05] text-white text-[10px] tracking-[0.22em] uppercase font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
              >
                <Sparkles size={11} /> {p.badge}
              </span>
            )}
            <h3 className="font-display font-extrabold text-3xl tracking-tight text-[#05223D]">
              {p.name}
            </h3>
            <p className="text-sm mt-2 leading-relaxed text-[#465B70]">{p.tagline}</p>

            <div className={`mt-6 rounded-2xl p-5 ${p.featured ? 'bg-[#F25C05]/8 border border-[#F25C05]/20' : 'bg-[#F5F2EB]'}`}>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-display font-extrabold text-5xl tracking-[-0.03em] ${p.featured ? 'text-[#F25C05]' : 'text-[#0A4D8C]'}`}>
                  {p.price}
                </span>
                <span className="text-sm font-bold text-[#465B70]">
                  {p.priceSuffix}
                </span>
              </div>
              <p
                data-testid={`plan-${p.id}-price-note`}
                className="text-xs mt-1 text-[#465B70]/85"
              >
                {p.priceNote}
              </p>
            </div>

            <ul className="mt-7 space-y-3 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="w-6 h-6 mt-0.5 shrink-0 rounded-full bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-[#05223D]">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={openSignup}
              className={`mt-7 ${p.featured ? 'btn-primary' : 'btn-secondary'} justify-center w-full`}
              data-testid={`plan-${p.id}-cta`}
            >
              {p.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <section className="mt-20 md:mt-28" data-testid="plans-comparison-table">
        <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Compare</p>
            <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2">
              Side by side.
            </h2>
          </div>
        </div>

        <div className="card-soft p-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-[#0A4D8C14]">
                  <th className="p-5 md:p-6 text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">Feature</th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`p-5 md:p-6 text-center align-bottom ${p.featured ? 'bg-[#05223D]/[0.03]' : ''}`}
                    >
                      <p className={`font-display font-extrabold text-lg ${p.featured ? 'text-[#F25C05]' : 'text-[#05223D]'}`}>
                        {p.name}
                      </p>
                      <p className="text-[11px] text-[#465B70] mt-1 font-bold">
                        {p.price === '0' ? 'Free' : `${p.price} GEL/mo`}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    data-testid={`compare-row-${i}`}
                    className={i % 2 === 0 ? 'bg-[#F5F2EB]/60' : ''}
                  >
                    <td className="p-4 md:p-5 text-[#05223D] font-medium">{row.label}</td>
                    <td className="p-4 md:p-5 text-center"><Cell value={row.free} /></td>
                    <td className="p-4 md:p-5 text-center bg-[#05223D]/[0.03]"><Cell value={row.feeder} /></td>
                    <td className="p-4 md:p-5 text-center"><Cell value={row.custom} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Shared add-ons */}
      <section className="mt-20 md:mt-28" data-testid="plans-shared-services">
        <div className="flex items-end justify-between gap-4 mb-7 md:mb-9 flex-wrap">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Available to every plan</p>
            <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-2xl">
              Wash, check-ups and other care — bookable from any plan.
            </h2>
          </div>
          <Link
            to="/special-offers/services"
            data-testid="plans-services-link"
            className="inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors group"
          >
            See all services
            <span className="w-9 h-9 rounded-full border-2 border-[#0A4D8C] flex items-center justify-center group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {SHARED_SERVICES.map((s) => (
            <Link
              key={s.label}
              to={s.route}
              data-testid={`plans-service-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group card-soft p-5 md:p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all"
            >
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F25C05]/12 text-[#F25C05] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-[#05223D] text-lg leading-tight">{s.label}</p>
                <p className="text-sm text-[#465B70] mt-1.5 leading-relaxed">{s.note}</p>
              </div>
              <span className="w-8 h-8 shrink-0 rounded-full border border-[#0A4D8C26] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Help footnote */}
      <p className="text-xs text-[#465B70]/80 mt-12 text-center">
        Final terms (minimum monthly spend, feeder return policy and service pricing) are confirmed on signup. Need a custom set-up? Message us on WhatsApp.
      </p>
    </PageShell>
    </>
  );
}
