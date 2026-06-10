import React, { useMemo, useState } from 'react';
import { Plus, Minus, Search, MessageCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'plans', label: 'Plans & Pricing' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'products', label: 'Products & Brands' },
  { key: 'feeder', label: 'SmartPaw Feeder' },
  { key: 'account', label: 'Account & Support' },
];

const FAQS = [
  // Plans
  { cat: 'plans', q: 'How does the SmartPaw subscription work?', a: 'You register, pick your products and a delivery cadence (weekly, bi-weekly or monthly). We deliver to your door on schedule. You can pause, skip or change products any time.' },
  { cat: 'plans', q: 'How much does it cost?', a: 'Plans start from 0 GEL/month (Free plan) up to 150 GEL/month for the Free + Feeder bundle, plus a 15 GEL flat fee on the Custom Delivery plan. See the Plans page for the full breakdown.' },
  { cat: 'plans', q: 'Can I pause or cancel?', a: 'Yes — any time, no questions asked. Pause for a vacation, cancel if you move. No long contracts, no exit fees.' },
  { cat: 'plans', q: 'Do you offer a multi-pet discount?', a: 'Yes — we tailor multi-pet pricing on the Custom Delivery plan. WhatsApp us with the number of pets and their profiles and we’ll send a quote.' },
  { cat: 'plans', q: 'Can I gift a SmartPaw plan?', a: 'Yes. We can prepay a 1, 3 or 6-month plan as a gift — message us on WhatsApp with the recipient’s pet profile.' },

  // Delivery
  { cat: 'delivery', q: 'Where do you deliver?', a: 'Across every district in Tbilisi. We’ll expand to other Georgian cities — register to be notified when we launch in yours.' },
  { cat: 'delivery', q: 'Is delivery really free?', a: 'Yes, on every plan, in every district of Tbilisi. There are no minimum-order fees and no fuel surcharges.' },
  { cat: 'delivery', q: 'How will I know when my box is on the way?', a: 'You’ll get a WhatsApp message about an hour before our courier arrives, with their name and ETA. Same courier where possible, to keep things calm for your pet.' },
  { cat: 'delivery', q: 'What if no one is home?', a: 'Pick a 2-hour delivery window when you sign up, or tell us to leave the box at your door — your call.' },
  { cat: 'delivery', q: 'Can I change my delivery date?', a: 'Yes. Skip, delay or rush any individual delivery from WhatsApp up to 24 hours before the scheduled date.' },

  // Products
  { cat: 'products', q: 'Are your brands vet-approved?', a: 'Yes. Every brand on our shelf is one a Tbilisi vet would recommend — no diet fads, no gimmicks. Our Head of Vet Partnerships, Nina, reviews every shelf before it ships.' },
  { cat: 'products', q: 'What if my pet doesn’t like a product?', a: 'Tell us and we’ll swap it on your next delivery at no extra cost. We track what your pet actually eats and refine the box over time.' },
  { cat: 'products', q: 'Do you stock prescription diets?', a: 'Yes — renal, urinary, weight management, sensitivity and hypoallergenic lines from Royal Canin, Hill’s and Purina Pro Plan. Share the vet prescription on WhatsApp and we’ll add it to your plan.' },
  { cat: 'products', q: 'Do you sell only food?', a: 'No. We also stock hygiene basics, vitamins, toys, accessories and tech. The Special Offers page has the full Toys, Innovation & Tech and Services shelves.' },
  { cat: 'products', q: 'Where do your brands come from?', a: 'Most of our food and hygiene lines are sourced through official European distributors (Royal Canin, Hill’s, Acana, Orijen, Beaphar, Virbac). Tech and accessories come from authorised regional partners. Every SKU is sealed, in date, and stored in temperature-controlled warehousing.' },

  // Feeder
  { cat: 'feeder', q: 'What is the free SmartPaw Feeder?', a: 'A programmable smart feeder that portions meals automatically. It ships free with eligible plans (currently the 150 GEL/month bundle) — keep it as long as your subscription is active.' },
  { cat: 'feeder', q: 'Who installs and sets up the Feeder?', a: 'Our courier sets it up on first delivery if you’d like, or you can do it yourself in about 5 minutes — every Feeder ships with a step-by-step card.' },
  { cat: 'feeder', q: 'What happens to the Feeder if I cancel?', a: 'You return it on cancellation. We’ll arrange a free courier pickup on a day that suits you. No fees, no shipping charges.' },
  { cat: 'feeder', q: 'Can I buy a SmartPaw Feeder outright?', a: 'Right now, the Feeder is bundled with the 150 GEL plan only. We may offer an outright purchase option later — message us if you’d like to be on the list.' },

  // Account
  { cat: 'account', q: 'How do I update my pet’s profile?', a: 'During launch you can WhatsApp or email any changes; a self-service customer account is on the roadmap.' },
  { cat: 'account', q: 'Do I need to create an account?', a: 'No login is required to register interest or get a quote. We’ll move to full self-service accounts as we open up cart and checkout later in the year.' },
  { cat: 'account', q: 'How do I get a refund?', a: 'If something arrives damaged or expired, WhatsApp us within 7 days with a photo and we’ll replace it free of charge or refund the affected items.' },
  { cat: 'account', q: 'How quickly do you reply on WhatsApp?', a: 'Median reply time is under 60 minutes during opening hours (Mon–Sat, 09:00–19:00). Outside hours we reply first thing the next morning.' },
];

export default function FAQPage() {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState('0');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (active !== 'all' && f.cat !== active) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [active, query]);

  const onCategory = (k) => {
    setActive(k);
    setOpenKey('0');
  };

  return (
    <>
      <SeoMeta
        title="FAQ — answers in plain language"
        description="Quick answers about SmartPaw Food plans, deliveries, products and the SmartPaw Feeder. Search 23 questions or WhatsApp us in Tbilisi."
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />
    <PageShell
      eyebrow="FAQ"
      title="Questions, answered."
      intro="The most common things Tbilisi pet parents ask us. Don’t see your question? WhatsApp us — we usually reply within the hour."
    >
      {/* Search + categories */}
      <div className="max-w-4xl mx-auto" data-testid="faq-controls">
        <div className="relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#465B70]" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenKey('0'); }}
            placeholder="Search the FAQs…"
            className="form-input !pl-12"
            data-testid="faq-search-input"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" data-testid="faq-category-pills">
          {CATEGORIES.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onCategory(c.key)}
                data-testid={`faq-category-${c.key}-button`}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${isActive ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]' : 'bg-white text-[#0A4D8C] border-[#0A4D8C]/20 hover:border-[#0A4D8C]/40'}`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="mt-10 max-w-3xl mx-auto space-y-3" data-testid="faq-results-list">
        {filtered.length === 0 ? (
          <div
            className="card-soft p-8 text-center"
            data-testid="faq-empty-state"
          >
            <p className="font-display font-bold text-[#05223D] text-xl">
              {`Nothing matches "${query}".`}
            </p>
            <p className="text-[#465B70] mt-2">
              Try a different keyword, switch the category, or just WhatsApp us.
            </p>
            <a
              href="https://wa.me/995591969901"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 inline-flex"
              data-testid="faq-empty-whatsapp-link"
            >
              <MessageCircle size={16} />
              Ask on WhatsApp
            </a>
          </div>
        ) : (
          filtered.map((f, i) => {
            const key = `${f.cat}-${i}`;
            const isOpen = openKey === key || (i === 0 && openKey === '0');
            return (
              <div
                key={key}
                data-testid={`faq-item-${i}`}
                className={`card-soft transition-all duration-300 ${isOpen ? 'shadow-[0_18px_44px_rgba(10,77,140,0.10)]' : ''}`}
              >
                <button
                  onClick={() => setOpenKey(isOpen ? '' : key)}
                  aria-expanded={isOpen}
                  data-testid={`faq-toggle-${i}`}
                  className="w-full flex items-start gap-4 text-left px-6 py-5 md:px-8 md:py-6"
                >
                  <span className={`mt-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#F25C05] text-white' : 'border border-[#0A4D8C33] text-[#0A4D8C]'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                  <span className="flex-1">
                    <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#F25C05] block">
                      {CATEGORIES.find((c) => c.key === f.cat)?.label}
                    </span>
                    <span className="block font-display font-bold text-[#05223D] text-lg md:text-xl tracking-tight mt-1">
                      {f.q}
                    </span>
                    {isOpen && (
                      <span className="block text-[#465B70] leading-relaxed mt-3">{f.a}</span>
                    )}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Result count + WhatsApp shortcut */}
      <div className="mt-10 text-center" data-testid="faq-footer-shortcut">
        <p className="text-sm text-[#465B70]">
          Showing <span className="font-bold text-[#05223D]">{filtered.length}</span> of {FAQS.length} questions.
        </p>
        <a
          href="https://wa.me/995591969901"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4 inline-flex"
          data-testid="faq-footer-whatsapp-link"
        >
          <MessageCircle size={16} />
          Still stuck? WhatsApp us
        </a>
      </div>
    </PageShell>
    </>
  );
}
