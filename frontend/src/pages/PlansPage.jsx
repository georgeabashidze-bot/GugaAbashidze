import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Minus, ArrowUpRight, Sparkles } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';
import { useLang } from '@/lib/LangContext';
import { api } from '@/lib/api';

// Comparison matrix. Values per plan-slug: true | false | { en, ka } label.
const FEATURE_ROWS = [
  {
    label: { en: 'Free Tbilisi delivery', ka: 'უფასო მიწოდება თბილისში' },
    free: true, feeder: true, custom: true,
  },
  {
    label: { en: 'Auto reminders & stock tracking', ka: 'ავტომატური შეხსენებები და მარაგის თვალყური' },
    free: true, feeder: true, custom: true,
  },
  {
    label: { en: 'Personalised feeding plan', ka: 'ინდივიდუალური კვების გეგმა' },
    free: true, feeder: true, custom: false,
  },
  {
    label: { en: 'WhatsApp ops concierge', ka: 'WhatsApp კონსიერჟი' },
    free: true, feeder: true, custom: true,
  },
  {
    label: { en: 'Pause / skip any time', ka: 'შეჩერება / გამოტოვება ნებისმიერ დროს' },
    free: true, feeder: true, custom: true,
  },
  {
    label: { en: 'SmartPaw Wi-Fi Feeder', ka: 'SmartPaw Wi-Fi ფიდერი' },
    free: false,
    feeder: { en: 'Included', ka: 'ჩართული' },
    custom: { en: 'Add-on', ka: 'დამატებითი' },
  },
  {
    label: { en: 'Priority delivery slots', ka: 'პრიორიტეტული მიწოდების სლოტები' },
    free: false, feeder: true, custom: false,
  },
  {
    label: { en: 'Products outside the catalogue', ka: 'კატალოგის გარეთ მყოფი პროდუქტები' },
    free: false, feeder: false, custom: true,
  },
  {
    label: { en: 'Minimum monthly spend', ka: 'მინიმუმი თვეში' },
    free: { en: 'None', ka: 'არ არის' },
    feeder: { en: '150 GEL', ka: '150 ლარი' },
    custom: { en: '15 GEL fee', ka: '15 ლარი საფასური' },
  },
  {
    label: { en: 'Access to Special Offers', ka: 'წვდომა სპეც. შეთავაზებებზე' },
    free: true, feeder: true, custom: true,
  },
];

// Every-plan add-ons (powered by Special Offers · Services shelf).
const SHARED_SERVICES = [
  {
    label: { en: 'Mobile grooming', ka: 'მობილური გრუმინგი' },
    note: { en: 'At your door · 60–90 min', ka: 'შენთან · 60–90 წთ' },
    route: '/special-offers/services',
  },
  {
    label: { en: 'Vet home check-up', ka: 'ვეტერინარის ვიზიტი სახლში' },
    note: { en: 'Vaccinations & wellness · 30–45 min', ka: 'ვაქცინაცია და ჯანმრთელობა · 30–45 წთ' },
    route: '/special-offers/services',
  },
  {
    label: { en: 'Dog-walking package', ka: 'ძაღლის გასეირნების პაკეტი' },
    note: { en: '5 / 10 / 20-walk bundles', ka: '5 / 10 / 20 გასეირნების კომპლექტი' },
    route: '/special-offers/services',
  },
  {
    label: { en: 'Puppy training', ka: 'ლეკვის წვრთნა' },
    note: { en: '6-session program', ka: '6 სესიის პროგრამა' },
    route: '/special-offers/services',
  },
  {
    label: { en: 'Pet sitting', ka: 'პეტ სიტინგი' },
    note: { en: 'Weekend cover at home', ka: 'შაბათ-კვირას სახლში' },
    route: '/special-offers/services',
  },
  {
    label: { en: 'Microchip & ID', ka: 'მიკროჩიპი და ID' },
    note: { en: 'ISO chip + registry', ka: 'ISO ჩიპი + რეგისტრი' },
    route: '/special-offers/services',
  },
];

// Static section copy. Picked through pickL.
const COPY = {
  seoTitle: {
    en: 'Plans & Pricing — three honest tiers in GEL',
    ka: 'პაკეტები — სამი გასაგები ვარიანტი ლარში',
  },
  seoDescription: {
    en: 'Three plans for Tbilisi pet parents. Free with delivery, 150 GEL/month with a free SmartPaw Feeder, or 15 GEL custom delivery. No minimums, no contracts.',
    ka: 'სამი გეგმა თბილისელი მფლობელებისთვის. უფასო მიწოდებით, 150 ლარით უფასო ფიდერით, ან 15 ლარით ინდივიდუალური ბრენდისთვის.',
  },
  eyebrow: { en: 'Plans & Pricing', ka: 'პაკეტები და ფასები' },
  title: {
    en: 'Pick your routine. Pay only what makes sense.',
    ka: 'აირჩიე შენი რუტინა. გადაიხადე მხოლოდ ის, რაც აზრიანია.',
  },
  intro: {
    en: "Three simple ways to put your pet's shelf on autopilot — two of them entirely free. Every plan gets WhatsApp concierge, scheduled delivery and access to our Special Offers.",
    ka: 'სამი მარტივი გზა, რომ შენი ცხოველის თარო ავტომატურ რეჟიმში მოაქციო — ორი მათგანი სრულიად უფასოა. ყველა გეგმა მოიცავს WhatsApp კონსიერჟს, დაგეგმილ მიწოდებას და სპეც. შეთავაზებებზე წვდომას.',
  },
  imageAlt: { en: 'Owner with a dog at home', ka: 'მფლობელი ძაღლთან ერთად სახლში' },
  loading: { en: 'Loading plans…', ka: 'პაკეტები იტვირთება…' },
  errorLoad: { en: 'Plans are unavailable right now. Please try again shortly.', ka: 'პაკეტები ამჟამად მიუწვდომელია. სცადეთ მოგვიანებით.' },
  free: { en: 'Free', ka: 'უფასო' },
  compareEyebrow: { en: 'Compare', ka: 'შედარება' },
  compareTitle: { en: 'Side by side.', ka: 'გვერდიგვერდ.' },
  featureCol: { en: 'Feature', ka: 'მახასიათებელი' },
  perMonthShort: { en: 'GEL/mo', ka: 'ლარი/თვე' },
  servicesEyebrow: { en: 'Available to every plan', ka: 'ხელმისაწვდომი ყველა გეგმისთვის' },
  servicesTitle: {
    en: 'Wash, check-ups and other care — bookable from any plan.',
    ka: 'ბანაობა, შემოწმებები და სხვა მომსახურება — დაჯავშნე ნებისმიერი გეგმიდან.',
  },
  servicesLink: { en: 'See all services', ka: 'ყველა მომსახურება' },
  footnote: {
    en: 'Final terms (minimum monthly spend, feeder return policy and service pricing) are confirmed on signup. Need a custom set-up? Message us on WhatsApp.',
    ka: 'საბოლოო პირობები (მინიმუმი, ფიდერის დაბრუნება და მომსახურების ფასი) დასტურდება რეგისტრაციისას. გჭირდება ინდივიდუალური მოწყობა? მოგვწერე WhatsApp-ზე.',
  },
};

function Cell({ value, lang }) {
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
    <span className="text-sm font-bold text-[#05223D]">{value?.[lang] ?? value?.en ?? ''}</span>
  );
}

export default function PlansPage() {
  const { openSignup } = useSignup();
  const { lang, pick } = useLang();
  const L = (obj) => obj?.[lang] ?? obj?.en ?? '';

  const { data: plans = [], isLoading, isError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.listPlans(),
  });

  // Map plans by slug for the comparison columns. Fall back to slugs in declared order.
  const planBySlug = React.useMemo(() => {
    const out = {};
    plans.forEach((p) => { out[p.slug] = p; });
    return out;
  }, [plans]);

  // Stable column order for the comparison table.
  const COMPARE_SLUGS = ['free', 'feeder', 'custom'];
  const compareColumns = COMPARE_SLUGS.map((slug) => planBySlug[slug]).filter(Boolean);

  return (
    <>
      <SeoMeta
        title={L(COPY.seoTitle)}
        description={L(COPY.seoDescription)}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: L({ en: 'Plans', ka: 'პაკეტები' }), path: '/plans' },
        ])}
      />
      <PageShell
        eyebrow={L(COPY.eyebrow)}
        title={L(COPY.title)}
        intro={L(COPY.intro)}
        image="https://images.pexels.com/photos/4587959/pexels-photo-4587959.jpeg?auto=compress&cs=tinysrgb&w=1400"
        imageAlt={L(COPY.imageAlt)}
      >
        {/* Loading / error states */}
        {isLoading && (
          <div className="text-center py-16 text-[#465B70]" data-testid="plans-loading">
            {L(COPY.loading)}
          </div>
        )}
        {isError && !isLoading && (
          <div className="card-soft p-8 text-[#9b1c1c]" data-testid="plans-error">
            {L(COPY.errorLoad)}
          </div>
        )}

        {/* Plan cards */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7" data-testid="plans-grid">
            {plans.map((p) => {
              const featured = !!p.featured;
              const name = pick(p, 'name');
              const tagline = pick(p, 'tagline');
              const priceSuffix = pick(p, 'price_suffix');
              const priceNote = pick(p, 'price_note');
              const badge = pick(p, 'badge');
              const ctaLabel = pick(p, 'cta_label');
              return (
                <div
                  key={p.id || p.slug}
                  data-testid={`plan-${p.slug}-card`}
                  className={`relative card-soft p-7 md:p-9 flex flex-col bg-white ${
                    featured
                      ? 'border-2 border-[#F25C05] shadow-[0_24px_60px_rgba(242,92,5,0.18)] md:-translate-y-2'
                      : ''
                  }`}
                >
                  {featured && badge && (
                    <span
                      data-testid={`plan-${p.slug}-badge`}
                      className="absolute -top-3 left-7 bg-[#F25C05] text-white text-[10px] tracking-[0.22em] uppercase font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={11} /> {badge}
                    </span>
                  )}
                  <h3
                    data-testid={`plan-${p.slug}-name`}
                    className="font-display font-extrabold text-3xl tracking-tight text-[#05223D]"
                  >
                    {name}
                  </h3>
                  <p className="text-sm mt-2 leading-relaxed text-[#465B70]">{tagline}</p>

                  <div className={`mt-6 rounded-2xl p-5 ${featured ? 'bg-[#F25C05]/8 border border-[#F25C05]/20' : 'bg-[#F5F2EB]'}`}>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-display font-extrabold text-5xl tracking-[-0.03em] ${featured ? 'text-[#F25C05]' : 'text-[#0A4D8C]'}`}>
                        {p.price}
                      </span>
                      <span className="text-sm font-bold text-[#465B70]">
                        {priceSuffix}
                      </span>
                    </div>
                    <p
                      data-testid={`plan-${p.slug}-price-note`}
                      className="text-xs mt-1 text-[#465B70]/85"
                    >
                      {priceNote}
                    </p>
                  </div>

                  <ul className="mt-7 space-y-3 flex-1" data-testid={`plan-${p.slug}-features`}>
                    {(p.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-6 h-6 mt-0.5 shrink-0 rounded-full bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-relaxed text-[#05223D]">
                          {(lang === 'ka' ? (f.ka || f.en) : f.en) ?? ''}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={openSignup}
                    className={`mt-7 ${featured ? 'btn-primary' : 'btn-secondary'} justify-center w-full`}
                    data-testid={`plan-${p.slug}-cta`}
                  >
                    {ctaLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison table */}
        {!isLoading && !isError && compareColumns.length === 3 && (
          <section className="mt-20 md:mt-28" data-testid="plans-comparison-table">
            <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
              <div>
                <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{L(COPY.compareEyebrow)}</p>
                <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2">
                  {L(COPY.compareTitle)}
                </h2>
              </div>
            </div>

            <div className="card-soft p-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-[#0A4D8C14]">
                      <th className="p-5 md:p-6 text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">
                        {L(COPY.featureCol)}
                      </th>
                      {compareColumns.map((p) => (
                        <th
                          key={p.slug}
                          className={`p-5 md:p-6 text-center align-bottom ${p.featured ? 'bg-[#05223D]/[0.03]' : ''}`}
                        >
                          <p className={`font-display font-extrabold text-lg ${p.featured ? 'text-[#F25C05]' : 'text-[#05223D]'}`}>
                            {pick(p, 'name')}
                          </p>
                          <p className="text-[11px] text-[#465B70] mt-1 font-bold">
                            {p.price === '0' ? L(COPY.free) : `${p.price} ${L(COPY.perMonthShort)}`}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_ROWS.map((row, i) => (
                      <tr
                        key={row.label.en}
                        data-testid={`compare-row-${i}`}
                        className={i % 2 === 0 ? 'bg-[#F5F2EB]/60' : ''}
                      >
                        <td className="p-4 md:p-5 text-[#05223D] font-medium">{L(row.label)}</td>
                        <td className="p-4 md:p-5 text-center"><Cell value={row.free} lang={lang} /></td>
                        <td className="p-4 md:p-5 text-center bg-[#05223D]/[0.03]"><Cell value={row.feeder} lang={lang} /></td>
                        <td className="p-4 md:p-5 text-center"><Cell value={row.custom} lang={lang} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Shared add-ons */}
        <section className="mt-20 md:mt-28" data-testid="plans-shared-services">
          <div className="flex items-end justify-between gap-4 mb-7 md:mb-9 flex-wrap">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{L(COPY.servicesEyebrow)}</p>
              <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-2xl">
                {L(COPY.servicesTitle)}
              </h2>
            </div>
            <Link
              to="/special-offers/services"
              data-testid="plans-services-link"
              className="inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors group"
            >
              {L(COPY.servicesLink)}
              <span className="w-9 h-9 rounded-full border-2 border-[#0A4D8C] flex items-center justify-center group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {SHARED_SERVICES.map((s) => (
              <Link
                key={s.label.en}
                to={s.route}
                data-testid={`plans-service-${s.label.en.toLowerCase().replace(/\s+/g, '-')}`}
                className="group card-soft p-5 md:p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all"
              >
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F25C05]/12 text-[#F25C05] flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-[#05223D] text-lg leading-tight">{L(s.label)}</p>
                  <p className="text-sm text-[#465B70] mt-1.5 leading-relaxed">{L(s.note)}</p>
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
          {L(COPY.footnote)}
        </p>
      </PageShell>
    </>
  );
}
