// English dictionary — single source of truth for all UI copy.
// Blog article *bodies* live in /app/backend/blog_posts/*.md and stay English.

const en = {
  // ---- Header / navigation ----
  nav: {
    home: 'Home',
    catalogue: 'Catalogue',
    specials: 'Special Offers',
    plans: 'Plans',
    how: 'How it works',
    blog: 'Blog',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    cta: 'Start your plan',
  },

  // ---- Common labels reused across pages ----
  common: {
    startPlan: 'Start your plan',
    talkToUs: 'Talk to us',
    openWhatsApp: 'Open WhatsApp',
    askWhatsApp: 'Ask on WhatsApp',
    chatWhatsApp: 'Chat on WhatsApp',
    stillStuck: 'Still stuck? WhatsApp us',
    read: 'Read',
    readMore: 'Read more',
    readMin: (m) => `${m} min read`,
    loading: 'Loading…',
    tryAgain: 'Please try again.',
    backToBlog: 'Back to blog',
    sending: 'Sending…',
    yes: 'Yes',
    no: 'No',
    included: 'Included',
    notIncluded: 'Not included',
    new: 'New',
  },

  // ---- Hero ----
  hero: {
    eyebrow: 'Routine Feeding Simplified',
    titleA: 'Fed up with pet shop visits, early wake-ups and other feeding related problems?',
    titleB: 'Forget it — SmartPaw will take care.',
    sub: 'Register — choose your products — choose delivery dates, and we’ll do the rest. You’ll never forget, never run out of your pet’s products, and you won’t pay anything extra for regular deliveries. Plus, you’ll have our feeder, which will feed your pet even when you are not at home.',
    ctaPrimary: 'Start your plan',
    ctaSecondary: 'Browse catalogue',
    ctaSpecials: 'Special Offers',
    stat1: 'Free SmartPaw Feeder',
    stat2: 'Free Scheduled Delivery',
    stat3: 'No product shortages',
    feederBadge: 'Get a free SmartPaw Feeder with 150 GEL+ monthly spend',
  },

  // ---- Home product sections ----
  products: {
    regular: {
      eyebrow: 'Regular Products',
      title: 'Everyday essentials, on a schedule.',
      body: 'The shelf your pet needs week after week — curated, vet-approved and restocked automatically.',
      items: [
        { key: 'food', title: 'Food', desc: 'Dry kibble, wet food and treats from trusted brands.' },
        { key: 'hygiene', title: 'Hygiene', desc: 'Shampoos, litter, wipes and grooming basics.' },
        { key: 'vitamins', title: 'Vitamins & Additives', desc: 'Supplements, probiotics and dietary boosters.' },
      ],
    },
    specials: {
      eyebrow: 'Special Offers',
      title: 'Extras worth tail-wagging for.',
      body: 'Rotating bundles, smart gadgets and add-on services to level up your pet’s routine.',
      items: [
        { key: 'toys', title: 'Toys & Accessories', desc: 'Collars, leashes, beds, toys and seasonal picks.' },
        { key: 'tech', title: 'Innovation & Tech', desc: 'Smart feeders, paw-cams and connected devices.' },
        { key: 'services', title: 'Services', desc: 'Grooming, vet check-ups and home visits.' },
      ],
    },
  },

  // ---- Feature tiles (home) ----
  features: {
    f1: {
      kicker: 'Vet-approved brands',
      title: 'A shelf curated by people who actually know pets.',
      body: 'Premium dog food, cat food, treats, supplements. Keep what works, swap what doesn’t — we restock automatically every cycle.',
      cta: 'Browse catalogue',
    },
    f2: {
      kicker: 'Door to door',
      title: 'We schedule the drop. You skip the run.',
      body: 'Door-to-door across every Tbilisi district, included with every plan — no minimum-order tax, no surprise fees. Same-day for orders placed before noon.',
      cta: 'Talk to us',
    },
    f3: {
      kicker: 'Tuned to your pet',
      title: 'Built around your dog or cat — not a generic plan.',
      body: 'Tell us your pet’s breed, age and eating habits once. We tune bag size, swap rate and hygiene cadence so the next box arrives ready, not approximate.',
      cta: 'Read the blog',
    },
    f4: {
      kicker: 'Dogs + cats both',
      title: 'Every life stage, every dietary need.',
      body: 'Senior-formula kibble, puppy starter packs, sensitive-stomach lines, hypoallergenic options — dogs and cats. The plan grows when your pet does.',
      cta: 'Open shop',
    },
  },

  // ---- Why SmartPaw ----
  why: {
    eyebrow: 'Why SmartPaw',
    title: 'Importance of Routine Feeding',
    body: 'Leading veterinary bodies agree: feeding on a schedule is a core part of preventive care. The American Animal Hospital Association (AAHA) recommends that frequency, timing and portion of feeding be assessed at every visit, because consistent meals make it easier to control calorie intake, maintain healthy body condition, and spot appetite changes — often the earliest sign that something is wrong.',
    bodyCite: 'Source: AAHA Nutrition & Weight Management Guidelines (2021).',
    badges: ['Free Regular Delivery', 'Free Food Dispenser', 'Regular Reminders', 'Stock Management'],
  },

  // ---- How it works — home preview (4 cards) ----
  how: {
    eyebrow: 'How it works',
    title: 'Sign up, sit back.',
    body: 'A subscription that keeps your pet’s shelf stocked. Pick the brands once, set your cadence — we deliver on schedule. Pause or cancel any time.',
    steps: [
      { n: '01', t: 'Sign up', d: 'Tell us about you and your pet in 60 seconds.' },
      { n: '02', t: 'Pick products', d: 'Choose from a vet-approved catalogue of trusted brands.' },
      { n: '03', t: 'Set frequency', d: 'Weekly, bi-weekly or monthly — change it any time.' },
      { n: '04', t: 'We deliver', d: 'Door-to-door across Tbilisi, on a schedule that fits you.' },
    ],
  },

  // ---- How it works — full page ----
  howPage: {
    timelineEyebrow: 'Step by step',
    timelineTitle: 'What happens from signup to second delivery.',
    timelineIntro:
      'We built SmartPaw around what Tbilisi pet parents actually told us: too many shop runs, too many ‘out of stock’ messages, too many feeders that fight the routine instead of supporting it. Here is the workflow we run for every customer — predictable, honest and human.',
    timeline: [
      {
        title: 'Tell us about your pet',
        body: 'A 2-minute form: species, breed, age, weight, sensitivities and the routine you keep today. We use it to size portions and pre-pick a shelf that fits.',
        bullets: ['Pet profile + photo (optional)', 'Dietary notes & allergies', 'Your district in Tbilisi'],
      },
      {
        title: 'We curate the shelf',
        body: 'Our team matches your profile with vet-aligned brands. You see exactly what is going in the box — swap anything, lock anything in.',
        bullets: ['Vet-recommended brand match', 'Food + hygiene + treats bundle', 'You approve before first ship'],
      },
      {
        title: 'Choose your cadence',
        body: 'Weekly, bi-weekly or monthly. Pick a delivery window that fits your week — we lock it in and keep it predictable.',
        bullets: ['Weekly · bi-weekly · monthly', 'Pick a 2-hour delivery window', 'Pause or skip any time'],
      },
      {
        title: 'We deliver — door to door',
        body: 'Same courier where possible, so your dog stops barking at the doorbell. Contact-free, signed receipts, and a heads-up an hour before arrival.',
        bullets: ['Free delivery on every plan', 'WhatsApp on-the-way alert', 'Leave-at-door if you prefer'],
      },
      {
        title: 'Adjust anytime',
        body: 'Pet on a new diet? Travelling? Just say the word. Skip a delivery, swap a brand, change the cadence — no fees, no friction.',
        bullets: ['Brand swap, no charge', 'Skip / pause from WhatsApp', 'Profile updates anytime'],
      },
      {
        title: 'A team that picks up',
        body: 'A real human on the other end. We answer WhatsApp during opening hours and remember your pet by name on the second message.',
        bullets: ['WhatsApp, not chatbots', 'Local Tbilisi team', '1-hour median reply time'],
      },
    ],
    faqEyebrow: 'Quick answers',
    faqTitle: 'Before you sign up.',
    faqs: [
      { q: 'How long does signup take?', a: 'About two minutes. You tell us about your pet, pick a cadence, and we send a tailored quote on WhatsApp — usually within the hour.' },
      { q: 'Do I have to commit to a contract?', a: 'No. Every plan is month-to-month. Pause, skip or cancel any time — no questions and no exit fees.' },
      { q: 'What happens if my pet doesn’t like a product?', a: 'Tell us on WhatsApp and we’ll swap it on your next delivery at no extra cost. We track what your pet actually eats and refine over time.' },
      { q: 'Is delivery really free?', a: 'Yes, on every plan, in every district of Tbilisi. There are no minimum-order fees and no fuel surcharges.' },
      { q: 'Can I get a SmartPaw Feeder without the box?', a: 'The Feeder is part of the 150 GEL/month plan — see the Plans page for the breakdown. It ships free once the plan is active.' },
    ],
  },

  // ---- Plans page ----
  plans: {
    eyebrow: 'Plans & Pricing',
    title: 'Three plans. Pick the routine that fits.',
    intro:
      'Tailored boxes for Tbilisi pet parents. Start free with delivery only, unlock the SmartPaw Feeder for free with a 150 GEL/month plan, or design a custom shelf for a flat 15 GEL delivery fee.',
    badgePopular: 'Most popular',
    pricePer: '/ month',
    flatFee: 'flat fee per delivery',
    pickThis: 'Pick this plan',
    pickFeeder: 'Pick Feeder plan',
    customPlan: 'Build my custom plan',
    inclEyebrow: 'What’s included',
    everythingIn: 'Everything in:',
    tiers: [
      {
        key: 'free',
        eyebrow: 'Starter',
        name: 'SmartPaw Free',
        price: '0 GEL',
        priceNote: 'You only pay for products.',
        tagline: 'A no-commitment way to try us out.',
        features: [
          'Free door-to-door delivery in Tbilisi',
          'Reminders for refills and renewals',
          'No minimum order, no contracts',
          'Pause, skip or cancel any time',
        ],
        cta: 'Start free',
      },
      {
        key: 'feeder',
        eyebrow: 'Best value',
        name: 'Free + SmartPaw Feeder',
        price: '150 GEL',
        priceNote: 'Minimum monthly spend.',
        tagline: 'Routine on autopilot — feeder included.',
        features: [
          'Everything in SmartPaw Free',
          'Free SmartPaw smart feeder (worth ~300 GEL)',
          'Auto-portioned meals, even when you’re out',
          'Priority WhatsApp support',
        ],
        cta: 'Get the feeder',
      },
      {
        key: 'custom',
        eyebrow: 'Pay-per-drop',
        name: 'Custom Delivery',
        price: '15 GEL',
        priceNote: 'Flat fee per delivery — no subscription.',
        tagline: 'Need a one-off or off-cycle shipment?',
        features: [
          'No monthly minimum',
          'Order exactly what you need, when you need it',
          'Same-day if you order before noon',
          'Switch to a plan any time',
        ],
        cta: 'Build custom order',
      },
    ],
    compareEyebrow: 'Side by side',
    compareTitle: 'Compare the three plans.',
    compareFeatureCol: 'Feature',
    compareRows: [
      { feature: 'Free delivery in Tbilisi', values: [true, true, '15 GEL flat'] },
      { feature: 'Monthly minimum', values: ['None', '150 GEL', 'None'] },
      { feature: 'Free SmartPaw Feeder', values: [false, true, false] },
      { feature: 'Refill reminders', values: [true, true, true] },
      { feature: 'Brand swap on request', values: [true, true, true] },
      { feature: 'Priority WhatsApp support', values: [false, true, false] },
      { feature: 'Pause, skip or cancel anytime', values: [true, true, '—'] },
      { feature: 'Best for', values: ['Trying us out', 'Long-term care', 'One-off orders'] },
    ],
    servicesEyebrow: 'Shared on every plan',
    servicesTitle: 'Add-on services, on every tier.',
    servicesBody:
      'These are available to anyone on any plan. We schedule them around your delivery cadence and bill per visit — no subscription, no markup.',
    servicesCta: 'See all services',
    services: [
      { title: 'Grooming', body: 'Bath, brush and nail trim with a vetted local groomer — at your door or in our partner studio.' },
      { title: 'Vet check-ups', body: 'Annual and seasonal vet visits with our partner clinics, with vaccination reminders built in.' },
      { title: 'Home visits', body: 'Pet sitter check-ins while you’re travelling. Twice-daily feed, walk and a photo update.' },
    ],
    footnote:
      'Final terms (minimum monthly spend, feeder return policy and service pricing) are confirmed on signup. Need a custom set-up? Message us on WhatsApp.',
  },

  // ---- About page ----
  about: {
    eyebrow: 'About',
    title: 'Smart care. Real impact.',
    intro:
      'SmartPaw was built in Tbilisi by pet parents who got tired of late-night shop runs, forgotten food bags and feeders that just don’t fit a real schedule. We pair vet-approved brands with a free SmartPaw Feeder and door-to-door delivery — so the routine actually runs itself.',
    founderEyebrow: 'Founder story',
    founderTitle: 'Built for Tbilisi pet parents, by one of them.',
    founderParas: [
      'SmartPaw started, like most things you actually need, with a problem nobody was solving cleanly. Our founder, Tornike, has two dogs — Buba and Ruka — and a habit of remembering the kibble bag is empty around 10pm on a Tuesday. Every. Single. Time.',
      'He tried the local pet shops, the imported brands and the bigger chains. The brands were fine. The routine was the problem. Late-night dashes, forgotten orders, ‘out of stock’ messages two weeks in a row, feeders sold by people who had never owned a pet.',
      'So we built the thing we wanted ourselves. **A subscription where vet-approved food just shows up.** A SmartPaw Feeder that portions meals automatically and ships free with eligible plans. Delivery that is genuinely free, every district in Tbilisi. And a team you can WhatsApp like you’d WhatsApp a friend.',
    ],
    founderQuote: '"If your pet has a routine, your shopping shouldn’t need one."',
    metrics: [
      { value: '1,200+', label: 'Pets fed monthly' },
      { value: '36', label: 'Curated SKUs on shelf' },
      { value: '< 60 min', label: 'WhatsApp median reply' },
      { value: '0 GEL', label: 'Delivery fee, every plan' },
    ],
    valuesEyebrow: 'What we stand for',
    valuesTitle: 'Four things we don’t compromise on.',
    values: [
      { title: 'Vet-aligned', body: 'Every brand on the shelf is one a Tbilisi vet would recommend — no diet fads, no gimmicks, no ‘grain-free because it sounds clean’.' },
      { title: 'Honest pricing', body: 'No hidden fees, no minimum-order tax, no fuel surcharge. The price you sign up at is the price you keep.' },
      { title: 'Tbilisi roots', body: 'Locally founded, locally delivered. We answer the WhatsApp, we know the districts, and we know your dog by name on the second message.' },
      { title: 'Quietly modern', body: 'A free SmartPaw Feeder, a self-managed schedule and a team that actually picks up. Modern enough to feel effortless, calm enough to stay invisible.' },
    ],
    teamEyebrow: 'The team',
    teamTitle: 'Small team. Big on follow-through.',
    teamIntro:
      'Four people pick the shelf, run the routes and answer your WhatsApp. No call-centres, no scripted replies — just a Tbilisi crew that lives with pets too.',
    team: [
      { name: 'Tornike K.', role: 'Founder & Routine Designer', bio: 'Spent ten years in product, two dogs in. Started SmartPaw after one too many 10pm runs for kibble.' },
      { name: 'Nina G.', role: 'Head of Vet Partnerships', bio: 'Veterinary nurse turned brand-curator. Vets every shelf before it ships and runs our nutrition help-desk.' },
      { name: 'Luka B.', role: 'Operations & Delivery', bio: 'Maps every Tbilisi district by mood. If you have ever lived in Saburtalo, you understand the value.' },
      { name: 'Mariam T.', role: 'Customer Care · WhatsApp Lead', bio: 'The voice on the other end of your WhatsApp. Remembers pets by name, knows when to send a Tuesday reminder.' },
    ],
    midCtaEyebrow: 'Routine starts here',
    midCtaTitle: 'Want a quote that fits your pet, your district and your week?',
  },

  // ---- Contact page ----
  contact: {
    eyebrow: 'Contact',
    title: 'Let’s talk pet routines.',
    intro:
      'WhatsApp is the fastest way to reach us. For partnership, wholesale or press, drop us an email — or send the form below.',
    address: 'Address',
    addressValue: '0102 Tsereteli Ave. 118, Tbilisi, Georgia',
    phone: 'Phone / WhatsApp',
    email: 'Email',
    hours: 'Hours',
    hoursValue: 'Mon–Sat · 09:00–19:00',
    hoursToConfirm: '(to confirm)',
    sendEyebrow: 'Send a message',
    sendTitle: 'For everything that isn’t a quick WhatsApp.',
    sendBody:
      'Partnerships, wholesale enquiries, press, careers or anything else. Pick the right team below and we’ll reply by email within one working day.',
    departments: [
      { key: 'general', title: 'Customer support', body: 'Plan questions, deliveries, brand swaps, refunds.' },
      { key: 'partnerships', title: 'Brand partnerships', body: 'Get your brand on the SmartPaw shelf or run a co-promo.' },
      { key: 'press', title: 'Press & media', body: 'Interviews, founder quotes, product imagery.' },
      { key: 'careers', title: 'Careers', body: 'Open roles in delivery, customer care and ops.' },
    ],
    form: {
      name: 'Your name',
      namePh: 'Ana Ramishvili',
      email: 'Email',
      emailPh: 'you@example.com',
      subject: 'Subject',
      subjectPh: 'What is this about?',
      message: 'Message',
      messagePh: 'Tell us what you need — the more context, the faster we reply.',
      submit: 'Send message',
      errorRequired: 'Please fill in every field before sending.',
      errorGeneric: 'Could not send your message — please try WhatsApp.',
      success:
        'Got it — we’ll reply by email within one working day. For anything urgent, please WhatsApp us.',
      routedTo: 'Routed to',
    },
  },

  // ---- FAQ page ----
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions, answered.',
    intro:
      'The most common things Tbilisi pet parents ask us. Don’t see your question? WhatsApp us — we usually reply within the hour.',
    searchPh: 'Search the FAQs…',
    categories: [
      { key: 'all', label: 'All' },
      { key: 'plans', label: 'Plans & Pricing' },
      { key: 'delivery', label: 'Delivery' },
      { key: 'products', label: 'Products & Brands' },
      { key: 'feeder', label: 'SmartPaw Feeder' },
      { key: 'account', label: 'Account & Support' },
    ],
    items: [
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
    ],
    emptyTitle: (q) => `Nothing matches "${q}".`,
    emptyBody: 'Try a different keyword, switch the category, or just WhatsApp us.',
    showingCount: (n, total) => ({ leading: 'Showing ', count: n, of: ' of ', total, trailing: ' questions.' }),
  },

  // ---- Blog (list + post UI; article bodies remain English) ----
  blogPage: {
    eyebrow: 'From the journal',
    title: 'Real care, real reading.',
    intro:
      'Short, practical reads on pet nutrition, routines and small things that make a big difference. Written for Tbilisi pet parents, reviewed by working vets.',
    allArticles: 'All articles',
    tag: (t) => `#${t}`,
    cardRead: 'Read',
    loadError: 'Couldn’t load the journal.',
    emptyTitlePre: 'Nothing tagged ',
    emptyTitlePost: ' yet.',
    emptyBody: 'Pick another tag — more articles are on the way.',
  },
  blogPost: {
    share: 'Share',
    tags: 'Tags',
    relatedTitle: 'Keep reading.',
    ctaEyebrow: 'SmartPaw Food',
    ctaTitle: 'Ready to skip the next pet-shop run?',
    loadError: 'Couldn’t load this article.',
    minRead: (m) => `${m} min read`,
  },

  // ---- Categories grid ----
  categories: {
    eyebrow: 'What we deliver',
    title: 'One subscription, every shelf.',
    items: [
      { title: 'Pet Food', desc: 'Dry kibble, wet food, treats.' },
      { title: 'Pet Accessories', desc: 'Collars, leashes, beds, toys.' },
      { title: 'Health & Hygiene', desc: 'Supplements, litter, shampoos.' },
      { title: 'SmartPaw Innovation', desc: 'Smart dispenser, paw-cam and more.' },
    ],
  },

  // ---- Home blog preview ----
  blog: {
    eyebrow: 'From the journal',
    title: 'Real care, real reading.',
    readAll: 'Read the blog',
    items: [
      { tag: 'Smart devices', t: 'Why regular feeding is essential — and how smart devices help', d: 'Routine isn’t optional for healthy pets. A look at how programmable feeders take the guesswork out of mealtimes.', read: '6 min read' },
      { tag: 'Nutrition', t: 'Switching foods without the fuss', d: 'A vet-approved nine-day plan for moving onto a new diet without upsetting your pet’s stomach.', read: '5 min read' },
      { tag: 'Tbilisi life', t: 'Indoor-cat checklist for Tbilisi apartments', d: 'Vertical territory, slow feeders and small daily rituals for cats who never leave the flat.', read: '7 min read' },
    ],
  },

  // ---- Testimonials ----
  testimonials: {
    eyebrow: 'Loved in Tbilisi',
    title: 'Quiet wins, on repeat.',
    items: [
      { q: 'Box turns up before we run out. Dispenser handles Bibo’s portions while I’m at work — one less thing on my list.', name: 'Nino K.', meta: 'Bibo · Cocker Spaniel' },
      { q: 'Marlow eats at six whether I’m home or not. Setup took ten minutes.', name: 'Levan M.', meta: 'Marlow · British Shorthair' },
      { q: 'Switched brands halfway through — vet flagged a sensitivity, SmartPaw swapped it next delivery. No fuss.', name: 'Tamar G.', meta: 'Lola · Border Collie' },
    ],
  },

  partners: 'Smartpaw Partner Brands',

  // ---- Signup modal ----
  signup: {
    title: 'Start your plan',
    sub: 'Tell us a little about you and your pet. We’ll be in touch within one business day to set up your delivery.',
    name: 'Your name',
    email: 'Email',
    phone: 'Phone',
    petType: 'Pet type',
    petTypeOpts: { dog: 'Dog', cat: 'Cat', both: 'Both' },
    petName: 'Pet name (optional)',
    petBreed: 'Breed (optional)',
    petAge: 'Age (optional)',
    notes: 'Anything we should know? (optional)',
    submit: 'Send my details',
    sending: 'Sending…',
    success: 'Thanks! We’ll reach out within one business day.',
    error: 'Something went wrong. Please try again or message us on WhatsApp.',
  },

  // ---- Footer ----
  footer: {
    tagline: 'Smart care. Real impact.',
    sections: {
      company: 'Company',
      explore: 'Explore',
      contact: 'Contact',
    },
    company: ['About', 'Blog', 'Careers'],
    explore: ['Catalogue', 'How it works', 'Plans'],
    address: '0102 Tsereteli Ave. 118, Tbilisi, Georgia',
    rights: 'All rights reserved.',
  },

  // ---- Per-page SEO ----
  seo: {
    home: {
      title: 'Smart pet food, delivered.',
      description:
        'SmartPaw Food — a Tbilisi subscription that keeps your dog or cat’s shelf stocked. Vet-aligned brands, free SmartPaw Feeder, free door-to-door delivery.',
    },
    plans: {
      title: 'Plans & Pricing — three honest tiers in GEL',
      description:
        'Three plans for Tbilisi pet parents. Free with delivery, 150 GEL/month with a free SmartPaw Feeder, or 15 GEL custom delivery. No minimums, no contracts.',
    },
    how: {
      title: 'How it works — sign up, sit back',
      description:
        'The exact six-step workflow we run for every SmartPaw subscription in Tbilisi — from pet profile to door-to-door delivery.',
    },
    about: {
      title: 'About — Tbilisi-built, vet-aligned',
      description:
        'SmartPaw Food is a Tbilisi-based subscription delivery service for dogs and cats. Meet the team, the values and the impact behind the box.',
    },
    contact: {
      title: 'Contact — talk to a real human',
      description:
        'Get in touch with SmartPaw Food in Tbilisi. WhatsApp +995 591 96 99 01, guga@smartpaw.ge, or pick a department and send a message.',
    },
    faq: {
      title: 'FAQ — answers in plain language',
      description:
        'Quick answers about SmartPaw Food plans, deliveries, products and the SmartPaw Feeder. Search 23 questions or WhatsApp us in Tbilisi.',
    },
    blog: {
      title: 'From the journal',
      description:
        'Short, practical reads on pet nutrition, routines and Tbilisi pet life — written for owners, reviewed by working vets.',
    },
  },
};

export default en;
