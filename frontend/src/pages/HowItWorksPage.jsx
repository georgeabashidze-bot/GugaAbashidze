import React, { useState } from 'react';
import { ClipboardList, PackageSearch, CalendarClock, Truck, RefreshCw, HeartHandshake, Plus, Minus, ArrowRight } from 'lucide-react';
import PageShell from '@/components/PageShell';
import HowItWorks from '@/components/HowItWorks';
import WhySmartPaw from '@/components/WhySmartPaw';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';
import { useLang } from '@/lib/LangContext';
import { WHATSAPP_URL as buildWhatsAppUrl } from '@/lib/siteConfig';

const WHATSAPP_HREF = buildWhatsAppUrl();

const TIMELINE = [
  {
    n: '01',
    icon: ClipboardList,
    title: { en: 'Tell us about your pet', ka: 'მოგვიყევი შენი ცხოველის შესახებ' },
    body: {
      en: 'A 2-minute form: species, breed, age, weight, sensitivities and the routine you keep today. We use it to size portions and pre-pick a shelf that fits.',
      ka: '2-წუთიანი ფორმა: სახეობა, ჯიში, ასაკი, წონა, მგრძნობელობა და დღევანდელი რეჟიმი. ამის მიხედვით ვითვლით პორციებს და ვარჩევთ შესაბამის პროდუქტებს.',
    },
    bullets: {
      en: ['Pet profile + photo (optional)', 'Dietary notes & allergies', 'Your district in Tbilisi'],
      ka: ['ცხოველის პროფილი + ფოტო (არასავალდებულო)', 'დიეტური მინიშნებები და ალერგიები', 'შენი უბანი თბილისში'],
    },
  },
  {
    n: '02',
    icon: PackageSearch,
    title: { en: 'We curate the shelf', ka: 'ჩვენ ვაკომპლექტებთ კოლოფს' },
    body: {
      en: 'Our team matches your profile with vet-aligned brands. You see exactly what is going in the box — swap anything, lock anything in.',
      ka: 'ჩვენი გუნდი შენი პროფილის მიხედვით ვეტერინართან შეთანხმებულ ბრენდებს არჩევს. ხედავ ზუსტად რა შედის შენს კოლოფში — შეგიძლია ნებისმიერი პროდუქტი შეცვალო ან დააფიქსირო.',
    },
    bullets: {
      en: ['Vet-recommended brand match', 'Food + hygiene + treats bundle', 'You approve before first ship'],
      ka: ['ვეტერინარის რეკომენდებული ბრენდები', 'საკვები + ჰიგიენა + წახემსები', 'ამოწმებ პირველ მიწოდებამდე'],
    },
  },
  {
    n: '03',
    icon: CalendarClock,
    title: { en: 'Choose your cadence', ka: 'აარჩიე მიწოდების სიხშირე' },
    body: {
      en: 'Weekly, bi-weekly or monthly. Pick a delivery window that fits your week — we lock it in and keep it predictable.',
      ka: 'ყოველკვირეული, ორ კვირაში ერთხელ ან ყოველთვიური. აარჩიე მიწოდების დრო, რომელიც შენს გრაფიკს ერგება — ვაფიქსირებთ და ვინარჩუნებთ წინასწარგანჭვრეტადს.',
    },
    bullets: {
      en: ['Weekly · bi-weekly · monthly', 'Pick a 2-hour delivery window', 'Pause or skip any time'],
      ka: ['ყოველკვირეული · 2-კვირიანი · ყოველთვიური', 'აარჩიე 2-საათიანი მიწოდების ფანჯარა', 'შეაჩერე ან გამოტოვე ნებისმიერ დროს'],
    },
  },
  {
    n: '04',
    icon: Truck,
    title: { en: 'We deliver — door to door', ka: 'ჩვენ ვაგზავნით — კარდაკარ' },
    body: {
      en: 'Same courier where possible, so your dog stops barking at the doorbell. Contact-free, signed receipts, and a heads-up an hour before arrival.',
      ka: 'შეძლებისდაგვარად ერთი და იგივე კურიერი, რომ შენი ძაღლი აღარ ყეფდეს ზარის ხმაზე. უკონტაქტო, ხელმოწერით ქვითარი და გაფრთხილება ჩამოსვლამდე 1 საათით ადრე.',
    },
    bullets: {
      en: ['Free delivery on every plan', 'WhatsApp on-the-way alert', 'Leave-at-door if you prefer'],
      ka: ['უფასო მიწოდება ყველა გეგმაში', 'WhatsApp-ით გაფრთხილება გზაში', 'კარის წინ დატოვება სურვილისამებრ'],
    },
  },
  {
    n: '05',
    icon: RefreshCw,
    title: { en: 'Adjust anytime', ka: 'შეცვალე ნებისმიერ დროს' },
    body: {
      en: 'Pet on a new diet? Travelling? Just say the word. Skip a delivery, swap a brand, change the cadence — no fees, no friction.',
      ka: 'ცხოველი ახალ დიეტაზე? მგზავრობ? უბრალოდ შეგვატყობინე. გამოტოვე მიწოდება, შეცვალე ბრენდი, შეცვალე სიხშირე — საფასურის ან დაბრკოლების გარეშე.',
    },
    bullets: {
      en: ['Brand swap, no charge', 'Skip / pause from WhatsApp', 'Profile updates anytime'],
      ka: ['ბრენდის შეცვლა უფასოდ', 'გამოტოვება / შეჩერება WhatsApp-იდან', 'პროფილის განახლება ნებისმიერ დროს'],
    },
  },
  {
    n: '06',
    icon: HeartHandshake,
    title: { en: 'A team that picks up', ka: 'გუნდი, რომელიც გპასუხობს' },
    body: {
      en: 'A real human on the other end. We answer WhatsApp during opening hours and remember your pet by name on the second message.',
      ka: 'მეორე მხარეს რეალური ადამიანი. ვპასუხობთ WhatsApp-ში სამუშაო საათებში და მეორე შეტყობინებაზე უკვე გვახსოვს შენი ცხოველის სახელი.',
    },
    bullets: {
      en: ['WhatsApp, not chatbots', 'Local Tbilisi team', '1-hour median reply time'],
      ka: ['WhatsApp, არა ჩატბოტი', 'ადგილობრივი თბილისური გუნდი', '1 საათში პასუხის საშუალო დრო'],
    },
  },
];

const INLINE_FAQS = [
  {
    q: { en: 'How long does signup take?', ka: 'რამდენი დრო სჭირდება რეგისტრაციას?' },
    a: {
      en: 'About two minutes. You tell us about your pet, pick a cadence, and we send a tailored quote on WhatsApp — usually within the hour.',
      ka: 'დაახლოებით ორი წუთი. გვიყვებ შენი ცხოველის შესახებ, ირჩევ სიხშირეს და გიგზავნით ინდივიდუალურ შეთავაზებას WhatsApp-ში — ჩვეულებრივ ერთ საათში.',
    },
  },
  {
    q: { en: 'Do I have to commit to a contract?', ka: 'ვალდებული ვარ ხელშეკრულებაზე?' },
    a: {
      en: 'No. Every plan is month-to-month. Pause, skip or cancel any time — no questions and no exit fees.',
      ka: 'არა. ყველა გეგმა თვიური ფორმატითაა. შეგიძლია შეაჩერო, გამოტოვო ან გააუქმო ნებისმიერ დროს — შეკითხვების და გადასახადის გარეშე.',
    },
  },
  {
    q: { en: 'What happens if my pet doesn’t like a product?', ka: 'რა მოხდება, თუ ჩემს ცხოველს პროდუქტი არ მოეწონება?' },
    a: {
      en: 'Tell us on WhatsApp and we’ll swap it on your next delivery at no extra cost. We track what your pet actually eats and refine over time.',
      ka: 'შეგვატყობინე WhatsApp-ში და შემდეგ მიწოდებაში დამატებითი საფასურის გარეშე შევცვლით. ვადევნებთ თვალყურს რას მიირთმევს რეალურად შენი ცხოველი და თანდათან ვაუმჯობესებთ.',
    },
  },
  {
    q: { en: 'Is delivery really free?', ka: 'მიწოდება ნამდვილად უფასოა?' },
    a: {
      en: 'Yes, on every plan, in every district of Tbilisi. There are no minimum-order fees and no fuel surcharges.',
      ka: 'დიახ, ყველა გეგმაში, თბილისის ყველა უბანში. არ არსებობს მინიმალური შეკვეთის საფასური ან საწვავის დანამატი.',
    },
  },
  {
    q: { en: 'Can I get a SmartPaw Feeder without the box?', ka: 'შეიძლება ავიღო SmartPaw Feeder კოლოფის გარეშე?' },
    a: {
      en: 'The Feeder is part of the 150 GEL/month plan — see the Plans page for the breakdown. It ships free once the plan is active.',
      ka: 'Feeder შედის 150₾/თვის გეგმაში — დეტალები იხილე გეგმების გვერდზე. გეგმის გააქტიურების შემდეგ უფასოდ მოგეწოდება.',
    },
  },
];

const COPY = {
  metaTitle: { en: 'How it works — sign up, sit back', ka: 'როგორ მუშაობს — დარეგისტრირდი და მოისვენე' },
  metaDescription: {
    en: 'The exact six-step workflow we run for every SmartPaw subscription in Tbilisi — from pet profile to door-to-door delivery.',
    ka: 'ექვს-საფეხურიანი პროცესი, რომელსაც ვმართავთ SmartPaw-ის ყველა გამოწერისთვის თბილისში — ცხოველის პროფილიდან კარდაკარ მიწოდებამდე.',
  },
  breadcrumb: { en: 'How it works', ka: 'როგორ მუშაობს' },
  eyebrow: { en: 'How It Works', ka: 'როგორ მუშაობს' },
  title: { en: 'Sign up, sit back.', ka: 'დარეგისტრირდი და მოისვენე.' },
  intro: {
    en: 'A subscription that keeps your pet’s shelf stocked. Pick the brands once, set your cadence — we deliver on schedule. Pause or cancel any time.',
    ka: 'გამოწერა, რომელიც შენი ცხოველის თარო სავსედ ინახავს. ერთხელ აარჩიე ბრენდები, დააფიქსირე სიხშირე — ჩვენ მოგაწვდით გრაფიკის მიხედვით. შეგიძლია შეაჩერო ან გააუქმო ნებისმიერ დროს.',
  },
  imageAlt: { en: 'Happy dog with owner', ka: 'ბედნიერი ძაღლი მფლობელთან ერთად' },
  stepByStep: { en: 'Step by step', ka: 'ნაბიჯ-ნაბიჯ' },
  timelineTitle: {
    en: 'What happens from signup to second delivery.',
    ka: 'რა ხდება რეგისტრაციიდან მეორე მიწოდებამდე.',
  },
  timelineLead: {
    en: 'We built SmartPaw around what Tbilisi pet parents actually told us: too many shop runs, too many ‘out of stock’ messages, too many feeders that fight the routine instead of supporting it. Here is the workflow we run for every customer — predictable, honest and human.',
    ka: 'SmartPaw ავაშენეთ თბილისელი ცხოველის მფლობელების სათქმელის გათვალისწინებით: ბევრი მაღაზიური ვიზიტი, ბევრი „დაცარიელებული თარო“-ს შეტყობინება, ბევრი ისეთი მოწყობილობა, რომელიც ეწინააღმდეგება და არა ეხმარება რეჟიმს. აქ ნახე ჩვენი პროცესი — წინასწარგანჭვრეტადი, გულახდილი და ადამიანური.',
  },
  startPlan: { en: 'Start your plan', ka: 'დაიწყე გეგმა' },
  askWhatsApp: { en: 'Ask on WhatsApp', ka: 'შეგვეკითხე WhatsApp-ში' },
  quickAnswers: { en: 'Quick answers', ka: 'სწრაფი პასუხები' },
  beforeSignup: { en: 'Before you sign up.', ka: 'სანამ დარეგისტრირდები.' },
};

export default function HowItWorksPage() {
  const { openSignup } = useSignup();
  const { lang } = useLang();
  const tx = (obj) => obj[lang] || obj.en;

  return (
    <>
      <SeoMeta
        title={tx(COPY.metaTitle)}
        description={tx(COPY.metaDescription)}
        jsonLd={breadcrumbJsonLd([
          { name: lang === 'ka' ? 'მთავარი' : 'Home', path: '/' },
          { name: tx(COPY.breadcrumb), path: '/how-it-works' },
        ])}
      />
      <PageShell
        eyebrow={tx(COPY.eyebrow)}
        title={tx(COPY.title)}
        intro={tx(COPY.intro)}
        image="https://images.pexels.com/photos/35620584/pexels-photo-35620584.jpeg?auto=compress&cs=tinysrgb&w=1400"
        imageAlt={tx(COPY.imageAlt)}
      />

      <HowItWorks onOpenSignup={openSignup} />

      {/* Detailed step-by-step timeline */}
      <section className="py-20 md:py-28 bg-[#FDFBF7]" data-testid="how-timeline-section">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12 md:mb-16">
            <div className="lg:col-span-5">
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{tx(COPY.stepByStep)}</p>
              <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
                {tx(COPY.timelineTitle)}
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-[#465B70] text-lg leading-relaxed">
                {tx(COPY.timelineLead)}
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
                          {tx(s.title)}
                        </h3>
                      </div>
                      <p className="text-[#465B70] mt-3 leading-relaxed max-w-3xl">{tx(s.body)}</p>
                      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {tx(s.bullets).map((b) => (
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
              {tx(COPY.startPlan)}
              <ArrowRight size={18} />
            </button>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              data-testid="how-timeline-whatsapp-link"
            >
              {tx(COPY.askWhatsApp)}
            </a>
          </div>
        </div>
      </section>

      <WhySmartPaw onOpenSignup={openSignup} />

      {/* Inline FAQ */}
      <section className="py-20 md:py-28" data-testid="how-inline-faq-section">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{tx(COPY.quickAnswers)}</p>
            <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
              {tx(COPY.beforeSignup)}
            </h2>
          </div>
          <div className="mt-10 md:mt-14 space-y-3">
            {INLINE_FAQS.map((f, i) => (
              <InlineFAQ key={i} idx={i} q={tx(f.q)} a={tx(f.a)} />
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
