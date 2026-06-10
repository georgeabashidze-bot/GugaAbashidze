import React from 'react';
import { PawPrint, ShieldCheck, Sparkles, Heart, MapPin, ArrowRight } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Vet-aligned',
    body: 'Every brand on the shelf is one a Tbilisi vet would recommend — no diet fads, no gimmicks, no ‘grain-free because it sounds clean’.',
  },
  {
    icon: Heart,
    title: 'Honest pricing',
    body: 'No hidden fees, no minimum-order tax, no fuel surcharge. The price you sign up at is the price you keep.',
  },
  {
    icon: MapPin,
    title: 'Tbilisi roots',
    body: 'Locally founded, locally delivered. We answer the WhatsApp, we know the districts, and we know your dog by name on the second message.',
  },
  {
    icon: Sparkles,
    title: 'Quietly modern',
    body: 'A free SmartPaw Feeder, a self-managed schedule and a team that actually picks up. Modern enough to feel effortless, calm enough to stay invisible.',
  },
];

const TEAM = [
  {
    name: 'Tornike K.',
    role: 'Founder & Routine Designer',
    bio: 'Spent ten years in product, two dogs in. Started SmartPaw after one too many 10pm runs for kibble.',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Nina G.',
    role: 'Head of Vet Partnerships',
    bio: 'Veterinary nurse turned brand-curator. Vets every shelf before it ships and runs our nutrition help-desk.',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Luka B.',
    role: 'Operations & Delivery',
    bio: 'Maps every Tbilisi district by mood. If you have ever lived in Saburtalo, you understand the value.',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Mariam T.',
    role: 'Customer Care · WhatsApp Lead',
    bio: 'The voice on the other end of your WhatsApp. Remembers pets by name, knows when to send a Tuesday reminder.',
    image: 'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];

const METRICS = [
  { value: '1,200+', label: 'Pets fed monthly' },
  { value: '36', label: 'Curated SKUs on shelf' },
  { value: '< 60 min', label: 'WhatsApp median reply' },
  { value: '0 GEL', label: 'Delivery fee, every plan' },
];

export default function AboutPage() {
  const { openSignup } = useSignup();
  return (
    <>
      <SeoMeta
        title="About — Tbilisi-built, vet-aligned"
        description="SmartPaw Food is a Tbilisi-based subscription delivery service for dogs and cats. Meet the team, the values and the impact behind the box."
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
    <PageShell
      eyebrow="About"
      title="Smart care. Real impact."
      intro="SmartPaw was built in Tbilisi by pet parents who got tired of late-night shop runs, forgotten food bags and feeders that just don’t fit a real schedule. We pair vet-approved brands with a free SmartPaw Feeder and door-to-door delivery — so the routine actually runs itself."
      image="https://images.pexels.com/photos/8434670/pexels-photo-8434670.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="A SmartPaw delivery box"
    >
      {/* Founder story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start" data-testid="about-founder-section">
        <div className="lg:col-span-5">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Founder story</p>
          <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
            Built for Tbilisi pet parents, by one of them.
          </h2>
        </div>
        <div className="lg:col-span-7 space-y-5 text-[#465B70] text-lg leading-relaxed">
          <p>
            SmartPaw started, like most things you actually need, with a problem nobody was solving cleanly. Our founder, Tornike, has two dogs — Buba and Ruka — and a habit of remembering the kibble bag is empty around 10pm on a Tuesday. Every. Single. Time.
          </p>
          <p>
            He tried the local pet shops, the imported brands and the bigger chains. The brands were fine. The routine was the problem. Late-night dashes, forgotten orders, ‘out of stock’ messages two weeks in a row, feeders sold by people who had never owned a pet.
          </p>
          <p>
            So we built the thing we wanted ourselves. <span className="font-bold text-[#05223D]">A subscription where vet-approved food just shows up</span>. A SmartPaw Feeder that portions meals automatically and ships free with eligible plans. Delivery that is genuinely free, every district in Tbilisi. And a team you can WhatsApp like you’d WhatsApp a friend.
          </p>
          <p className="italic text-[#465B70]/85">
            {`"If your pet has a routine, your shopping shouldn’t need one."`}
          </p>
        </div>
      </section>

      {/* Impact metrics */}
      <section className="mt-20 md:mt-28" data-testid="about-metrics-section">
        <div className="rounded-[2rem] bg-[#0A4D8C] text-white px-6 py-10 md:px-12 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
          <div className="absolute -top-32 -right-24 w-[360px] h-[360px] rounded-full bg-[#F25C05]/25 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {METRICS.map((m) => (
              <div key={m.label} data-testid={`about-metric-${m.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
                <p className="font-display font-extrabold text-4xl md:text-5xl tracking-[-0.02em] text-[#F25C05]">
                  {m.value}
                </p>
                <p className="text-white/80 text-sm mt-2 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mt-20 md:mt-28" data-testid="about-values-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10 md:mb-14">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">What we stand for</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
              Four things we don’t compromise on.
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="card-soft p-7 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.08)] transition-all duration-300"
                data-testid={`about-value-${v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                <span className="w-11 h-11 rounded-2xl bg-[#F25C05]/10 text-[#F25C05] flex items-center justify-center">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="font-display font-bold text-[#05223D] text-xl tracking-tight mt-4">
                  {v.title}
                </h3>
                <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section className="mt-20 md:mt-28" data-testid="about-team-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10 md:mb-14">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">The team</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
              Small team. Big on follow-through.
            </h2>
            <p className="text-[#465B70] text-lg leading-relaxed mt-5 max-w-2xl">
              Four people pick the shelf, run the routes and answer your WhatsApp. No call-centres, no scripted replies — just a Tbilisi crew that lives with pets too.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {TEAM.map((m) => (
            <div
              key={m.name}
              className="card-soft overflow-hidden"
              data-testid={`about-team-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
            >
              <div className="aspect-[5/6] overflow-hidden">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 md:p-6">
                <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{m.role}</p>
                <h3 className="font-display font-bold text-[#05223D] text-xl tracking-tight mt-1.5">
                  {m.name}
                </h3>
                <p className="text-sm text-[#465B70] mt-2 leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline mid-page CTA */}
      <section className="mt-20 md:mt-24" data-testid="about-mid-cta-section">
        <div className="card-soft p-7 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Routine starts here</p>
            <h3 className="font-display font-bold text-[#05223D] text-2xl md:text-3xl tracking-tight mt-2">
              Want a quote that fits your pet, your district and your week?
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={openSignup} className="btn-primary" data-testid="about-start-plan-button">
              Start your plan
              <ArrowRight size={18} />
            </button>
            <a
              href="/contact"
              className="btn-secondary"
              data-testid="about-contact-link"
            >
              <PawPrint size={16} />
              Talk to us
            </a>
          </div>
        </div>
      </section>
    </PageShell>
    </>
  );
}
