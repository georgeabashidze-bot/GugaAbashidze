// Bilingual legal content (EN/KA) for SmartPaw Food.
// Each page = { eyebrow, title, intro, sections: [ { h, body: [string|{ list: [...] }|...] } ] }

export const LEGAL_ENTITY = {
  name: 'Cleanpaw International LLC',
  tradeName: 'SmartPaw Food',
  taxCode: '404 757 287',
  address: '0102 Tsereteli Ave. 118, Tbilisi, Georgia',
  addressKa: '0102, წერეთლის გამზ. 118, თბილისი, საქართველო',
  email: 'guga@smartpaw.ge',
  phone: '+995 591 96 99 01',
  effectiveDate: { en: 'February 2026', ka: 'თებერვალი, 2026' },
};

const E = LEGAL_ENTITY;

// Helper: simple inline interpolation (no JSX needed for the data layer).
const list = (items) => ({ list: items });

export const PRIVACY = {
  eyebrow: { en: 'Legal · Privacy', ka: 'სამართლებრივი · კონფიდენციალურობა' },
  title: { en: 'Privacy Policy', ka: 'კონფიდენციალურობის პოლიტიკა' },
  intro: {
    en: `How ${E.tradeName} collects, stores and uses your personal and pet information.`,
    ka: `როგორ აგროვებს, ინახავს და იყენებს ${E.tradeName} თქვენი და თქვენი შინაური ცხოველის პერსონალურ ინფორმაციას.`,
  },
  lead: {
    en: `This Privacy Policy explains how ${E.name} (Tax ID ${E.taxCode}), operating under the trade name ${E.tradeName} (“we”, “us”, “our”), collects, uses and protects personal data of customers and visitors of www.smartpaw.ge. By using our website or subscribing to our service you agree to this Policy.`,
    ka: `წინამდებარე კონფიდენციალურობის პოლიტიკა განმარტავს, თუ როგორ აგროვებს, იყენებს და იცავს კომპანია ${E.name} (საგადასახადო კოდი ${E.taxCode}), რომელიც სავაჭრო სახელით ${E.tradeName} ფუნქციონირებს („ჩვენ“, „ჩვენი“), www.smartpaw.ge საიტის მომხმარებლების და ვიზიტორების პერსონალურ მონაცემებს. ვებსაიტით სარგებლობით ან ჩვენი მომსახურების გამოწერით თქვენ ეთანხმებით ამ პოლიტიკას.`,
  },
  sections: [
    {
      h: { en: '1. Data controller', ka: '1. მონაცემთა დამმუშავებელი' },
      body: [
        {
          en: `The data controller is ${E.name}, registered in Georgia under Tax Code ${E.taxCode}, with its registered office at ${E.address}. You can contact us at ${E.email} or ${E.phone} for any privacy-related matter.`,
          ka: `მონაცემთა დამმუშავებელია ${E.name}, რეგისტრირებული საქართველოში საგადასახადო კოდით ${E.taxCode}, იურიდიული მისამართით: ${E.addressKa}. ნებისმიერ კონფიდენციალურობასთან დაკავშირებულ საკითხზე დაგვიკავშირდით: ${E.email} ან ${E.phone}.`,
        },
      ],
    },
    {
      h: { en: '2. Information we collect', ka: '2. რა ინფორმაციას ვაგროვებთ' },
      body: [
        {
          en: 'We collect only the information necessary to deliver our service:',
          ka: 'ვაგროვებთ მხოლოდ მომსახურების მისაწოდებლად საჭირო ინფორმაციას:',
        },
        list([
          {
            en: '**Account & contact data:** name, email, phone number, delivery address, language preference.',
            ka: '**ანგარიში და საკონტაქტო მონაცემები:** სახელი, ელფოსტა, ტელეფონის ნომერი, მიწოდების მისამართი, ენის არჩევანი.',
          },
          {
            en: '**Pet profile data:** pet species, breed, age, weight, dietary notes and allergies you choose to share.',
            ka: '**შინაური ცხოველის პროფილი:** სახეობა, ჯიში, ასაკი, წონა, კვების შენიშვნები და ალერგიები, რომელთა გაზიარებაც გსურთ.',
          },
          {
            en: '**Order data:** products purchased, frequency, delivery window, internal notes.',
            ka: '**შეკვეთის მონაცემები:** შეძენილი პროდუქცია, სიხშირე, მიწოდების სარკმელი, შიდა შენიშვნები.',
          },
          {
            en: '**Communications:** messages exchanged via email, WhatsApp, phone or the contact form.',
            ka: '**კომუნიკაცია:** მიმოწერა ელფოსტით, WhatsApp-ით, ტელეფონით ან საკონტაქტო ფორმით.',
          },
          {
            en: '**Technical data:** IP address, browser, device type and pages visited, collected through essential cookies and standard server logs.',
            ka: '**ტექნიკური მონაცემები:** IP მისამართი, ბრაუზერი, მოწყობილობის ტიპი და ნანახი გვერდები — შეგროვებული აუცილებელი ქუქი-ფაილებითა და სტანდარტული სერვერის ლოგებით.',
          },
        ]),
        {
          en: 'We do **not** collect or store payment-card numbers ourselves. Payments are processed by certified payment providers; we only receive a confirmation that a transaction has succeeded or failed.',
          ka: 'ჩვენ **არ** ვაგროვებთ და არ ვინახავთ ბარათის ნომრებს. გადახდები მუშავდება სერტიფიცირებული გადახდის პროვაიდერების მიერ — ჩვენ მხოლოდ წარმატებული ან წარუმატებელი ტრანზაქციის დადასტურებას ვიღებთ.',
        },
      ],
    },
    {
      h: { en: '3. How we use your data', ka: '3. როგორ ვიყენებთ თქვენს მონაცემებს' },
      body: [
        list([
          {
            en: 'To create and manage your account and subscription.',
            ka: 'თქვენი ანგარიშის და გამოწერის შესაქმნელად და მართვისთვის.',
          },
          {
            en: 'To pick, pack and deliver orders to the correct address.',
            ka: 'შეკვეთის სწორი მისამართით აღების, შეფუთვისა და მიწოდებისთვის.',
          },
          {
            en: 'To send transactional messages (order confirmations, delivery updates, invoices).',
            ka: 'ტრანზაქციული შეტყობინებების გასაგზავნად (შეკვეთის დადასტურება, მიწოდების სტატუსი, ინვოისები).',
          },
          {
            en: 'To respond to your enquiries via email, WhatsApp or phone.',
            ka: 'თქვენი მოთხოვნების საპასუხოდ — ელფოსტით, WhatsApp-ით ან ტელეფონით.',
          },
          {
            en: 'To improve the service, prevent fraud and comply with Georgian law.',
            ka: 'მომსახურების გაუმჯობესების, თაღლითობის პრევენციისა და საქართველოს კანონმდებლობასთან შესაბამისობისთვის.',
          },
          {
            en: 'With your explicit consent, to send occasional marketing about new products or offers — you can unsubscribe at any time.',
            ka: 'თქვენი მკაფიო თანხმობით — ახალი პროდუქციის ან შეთავაზებების შესახებ მარკეტინგული შეტყობინებების გასაგზავნად. გამოწერის გაუქმება ნებისმიერ დროს შესაძლებელია.',
          },
        ]),
      ],
    },
    {
      h: { en: '4. Legal basis', ka: '4. სამართლებრივი საფუძველი' },
      body: [
        {
          en: 'We process personal data on the basis of (a) performance of the contract you enter into when you subscribe, (b) our legitimate interests in running and securing the service, (c) compliance with our legal obligations, and (d) your consent where required (e.g., marketing communications).',
          ka: 'პერსონალურ მონაცემებს ვამუშავებთ შემდეგი საფუძვლებით: (ა) გამოწერისას დადებული ხელშეკრულების შესრულება, (ბ) ჩვენი ლეგიტიმური ინტერესი — სერვისის გამართულად მუშაობა და უსაფრთხოება, (გ) საკანონმდებლო ვალდებულებების შესრულება და (დ) თქვენი თანხმობა, როდესაც ეს საჭიროა (მაგ., მარკეტინგული შეტყობინებები).',
        },
      ],
    },
    {
      h: { en: '5. Sharing your data', ka: '5. თქვენი მონაცემების გაზიარება' },
      body: [
        {
          en: 'We share personal data only with parties strictly necessary to operate the service:',
          ka: 'პერსონალურ მონაცემებს ვუზიარებთ მხოლოდ მათ, ვინც აუცილებელია სერვისის ფუნქციონირებისთვის:',
        },
        list([
          {
            en: 'Delivery couriers and logistics partners — limited to name, address and phone.',
            ka: 'საკურიერო და ლოგისტიკის პარტნიორები — მხოლოდ სახელი, მისამართი და ტელეფონი.',
          },
          {
            en: 'Payment processors — to take payment securely.',
            ka: 'გადახდის პროვაიდერები — გადახდის უსაფრთხო დასამუშავებლად.',
          },
          {
            en: 'IT, hosting and analytics providers acting on our behalf under a data-processing agreement.',
            ka: 'IT, ჰოსტინგისა და ანალიტიკის პროვაიდერები — ჩვენი სახელით, მონაცემთა დამუშავების ხელშეკრულების ფარგლებში.',
          },
          {
            en: 'Government bodies when required by Georgian law.',
            ka: 'სახელმწიფო ორგანოები — საქართველოს კანონმდებლობით განსაზღვრულ შემთხვევებში.',
          },
        ]),
        {
          en: 'We never sell your personal data to third parties.',
          ka: 'ჩვენ არასოდეს ვყიდით თქვენს პერსონალურ მონაცემებს მესამე პირებზე.',
        },
      ],
    },
    {
      h: { en: '6. Cookies', ka: '6. ქუქი-ფაილები' },
      body: [
        {
          en: 'The website uses essential cookies needed for the cart, authentication and language preference. If we introduce analytics or marketing cookies in the future, we will update this Policy and ask for your consent through a cookie banner.',
          ka: 'საიტი იყენებს აუცილებელ ქუქი-ფაილებს კალათისთვის, ავტორიზაციისთვის და ენის არჩევანის შესანახად. ანალიტიკური ან მარკეტინგული ქუქი-ფაილების დანერგვის შემთხვევაში, ჩვენ განვაახლებთ ამ პოლიტიკას და ვითხოვთ თქვენს თანხმობას ქუქი-ბანერის მეშვეობით.',
        },
      ],
    },
    {
      h: { en: '7. Data retention', ka: '7. მონაცემთა შენახვის ვადა' },
      body: [
        {
          en: 'We keep personal data only as long as needed to deliver the service and to meet our legal, accounting and tax obligations under Georgian law. When the data is no longer required we delete or anonymise it.',
          ka: 'პერსონალურ მონაცემებს ვინახავთ მხოლოდ იმდენ ხანს, რამდენიც საჭიროა მომსახურების მისაწოდებლად და საქართველოს კანონმდებლობით განსაზღვრული საბუღალტრო და საგადასახადო ვალდებულებების შესასრულებლად. ვადის გასვლის შემდეგ მონაცემები იშლება ან ანონიმიზდება.',
        },
      ],
    },
    {
      h: { en: '8. Your rights', ka: '8. თქვენი უფლებები' },
      body: [
        {
          en: `You have the right to access, correct, update or delete your personal data, to object to or restrict certain processing, to withdraw consent and to receive a copy of your data in a portable format. To exercise any right, email ${E.email}. We respond within the time limits set by Georgian data-protection law.`,
          ka: `თქვენ გაქვთ უფლება: მოითხოვოთ წვდომა, შესწორება, განახლება ან წაშლა თქვენი პერსონალური მონაცემებისა; გააპროტესტოთ ან შეზღუდოთ კონკრეტული დამუშავება; გააუქმოთ თანხმობა; მიიღოთ თქვენი მონაცემები გადატანად ფორმატში. უფლების გამოსაყენებლად დაგვიკავშირდით: ${E.email}. ვპასუხობთ საქართველოს მონაცემთა დაცვის კანონმდებლობით განსაზღვრულ ვადებში.`,
        },
      ],
    },
    {
      h: { en: '9. Security', ka: '9. უსაფრთხოება' },
      body: [
        {
          en: 'We apply technical and organisational measures to protect personal data — encrypted connections (HTTPS), access controls and routine backups. No system is 100% secure, but we monitor and improve our practices continuously.',
          ka: 'ჩვენ ვიყენებთ ტექნიკურ და ორგანიზაციულ ზომებს პერსონალური მონაცემების დასაცავად — დაშიფრულ კავშირებს (HTTPS), წვდომის კონტროლს და რეგულარულ სარეზერვო ასლებს. სრულიად უსაფრთხო სისტემა არ არსებობს, თუმცა ჩვენი პრაქტიკა მუდმივად მონიტორინგდება და ვითარდება.',
        },
      ],
    },
    {
      h: { en: '10. Children', ka: '10. ბავშვები' },
      body: [
        {
          en: `The service is intended for adults (18+). We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact ${E.email} and we will delete it.`,
          ka: `მომსახურება განკუთვნილია 18 წელს მიღწეული პირებისთვის. ჩვენ მიზანმიმართულად არ ვაგროვებთ ბავშვების პერსონალურ მონაცემებს. თუ ფიქრობთ, რომ ბავშვმა მოგვაწოდა მონაცემები, დაგვიკავშირდით ${E.email}-ზე და ჩვენ წავშლით მათ.`,
        },
      ],
    },
    {
      h: { en: '11. Changes to this Policy', ka: '11. პოლიტიკის ცვლილებები' },
      body: [
        {
          en: 'We may update this Policy from time to time. The latest version is always published on this page with a new effective date. Material changes will be communicated by email to active subscribers.',
          ka: 'ჩვენ შესაძლოა პერიოდულად განვაახლოთ ეს პოლიტიკა. უახლესი ვერსია ყოველთვის გამოქვეყნდება ამ გვერდზე ახალი ძალაში შესვლის თარიღით. არსებითი ცვლილებების შესახებ აქტიურ მომხმარებლებს ვაცნობებთ ელფოსტით.',
        },
      ],
    },
    {
      h: { en: '12. Contact us', ka: '12. დაგვიკავშირდით' },
      body: [
        {
          en: `For any privacy-related question or request, contact ${E.name} at ${E.email} or ${E.phone}. Postal address: ${E.address}.`,
          ka: `კონფიდენციალურობასთან დაკავშირებული ნებისმიერი კითხვისთვის დაგვიკავშირდით: ${E.name} — ${E.email} ან ${E.phone}. საფოსტო მისამართი: ${E.addressKa}.`,
        },
      ],
    },
  ],
};

export const TERMS = {
  eyebrow: { en: 'Legal · Terms', ka: 'სამართლებრივი · წესები' },
  title: { en: 'Terms & Conditions', ka: 'წესები და პირობები' },
  intro: {
    en: `The terms under which ${E.tradeName} provides its subscription pet-delivery service.`,
    ka: `პირობები, რომელთა ფარგლებში ${E.tradeName} გთავაზობთ შინაური ცხოველების მიწოდების სააბონენტო მომსახურებას.`,
  },
  lead: {
    en: `These Terms & Conditions (the “Terms”) govern your use of the website www.smartpaw.ge and the subscription delivery service operated by ${E.name} (Tax ID ${E.taxCode}), trading as ${E.tradeName} (“we”, “us”). By placing an order or activating a subscription, you confirm that you have read and accepted these Terms.`,
    ka: `წინამდებარე წესები და პირობები („წესები“) არეგულირებს www.smartpaw.ge ვებსაიტითა და სააბონენტო მიწოდების მომსახურებით სარგებლობას, რომელსაც ახორციელებს ${E.name} (საგადასახადო კოდი ${E.taxCode}), სავაჭრო სახელით ${E.tradeName} („ჩვენ“). შეკვეთის განთავსებით ან გამოწერის გააქტიურებით თქვენ ადასტურებთ, რომ წაიკითხეთ და დაეთანხმეთ ამ წესებს.`,
  },
  sections: [
    {
      h: { en: '1. The service', ka: '1. მომსახურება' },
      body: [
        {
          en: `${E.tradeName} is a subscription delivery service for cat and dog supplies — food, hygiene products, vitamins and selected accessories — delivered on a recurring schedule across Tbilisi. Product availability may change; we will offer an equivalent alternative or, if you prefer, a credit on your next delivery.`,
          ka: `${E.tradeName} არის სააბონენტო მიწოდების სერვისი ძაღლებისა და კატებისთვის — საკვები, ჰიგიენის პროდუქცია, ვიტამინები და შერჩეული აქსესუარები — მიიწოდება განმეორებითი გრაფიკით თბილისის მასშტაბით. პროდუქციის ხელმისაწვდომობა შეიძლება შეიცვალოს; ჩვენ შემოგთავაზებთ ეკვივალენტურ ალტერნატივას ან, თქვენი არჩევით, კრედიტს მომდევნო მიწოდებაზე.`,
        },
      ],
    },
    {
      h: { en: '2. Eligibility', ka: '2. სარგებლობის უფლება' },
      body: [
        {
          en: 'You must be at least 18 years old and a legal resident of Georgia (or have a valid Georgian delivery address) to subscribe. By subscribing you confirm that the information you provide about you and your pet is accurate.',
          ka: 'გამოწერისთვის უნდა იყოთ მინიმუმ 18 წლის და საქართველოს რეზიდენტი (ან გქონდეთ მოქმედი ქართული მისამართი). გამოწერით თქვენ ადასტურებთ, რომ თქვენი და თქვენი შინაური ცხოველის შესახებ მოწოდებული ინფორმაცია სწორია.',
        },
      ],
    },
    {
      h: { en: '3. Account', ka: '3. ანგარიში' },
      body: [
        {
          en: `You are responsible for keeping your account credentials confidential and for all activity under your account. Notify us immediately at ${E.email} if you suspect unauthorised use.`,
          ka: `თქვენ ხართ პასუხისმგებელი თქვენი ანგარიშის მონაცემების კონფიდენციალურობაზე და ანგარიშის ფარგლებში ნებისმიერ აქტივობაზე. არასანქცირებული გამოყენების ეჭვის შემთხვევაში, დაუყოვნებლივ მოგვწერეთ: ${E.email}.`,
        },
      ],
    },
    {
      h: { en: '4. Subscriptions, pricing and payment', ka: '4. გამოწერა, ფასი და გადახდა' },
      body: [
        list([
          {
            en: 'Subscriptions auto-renew at the cadence you choose until paused or cancelled.',
            ka: 'გამოწერა ავტომატურად ხდება განახლება არჩეული რიტმით, სანამ თქვენ არ შეაჩერებთ ან გააუქმებთ.',
          },
          {
            en: 'All prices are in Georgian Lari (GEL) and include applicable VAT.',
            ka: 'ყველა ფასი მითითებულია ლარში (GEL) და მოიცავს დღგ-ს.',
          },
          {
            en: 'Payment is taken via certified payment processors at the start of each delivery cycle.',
            ka: 'გადახდა ხდება სერტიფიცირებული გადახდის სისტემებით ყოველი მიწოდების ციკლის დასაწყისში.',
          },
          {
            en: 'We may update prices for future cycles; we will notify you in advance and you can cancel before the next renewal.',
            ka: 'ჩვენ შეგვიძლია განვაახლოთ ფასი მომავალი ციკლებისთვის; გაცნობებთ წინასწარ და თქვენ შეგიძლიათ გააუქმოთ შემდეგ განახლებამდე.',
          },
        ]),
      ],
    },
    {
      h: { en: '5. Pause, skip and cancellation', ka: '5. შეჩერება, გამოტოვება და გაუქმება' },
      body: [
        {
          en: `You may pause, skip or cancel a subscription at any time before the next dispatch via WhatsApp (${E.phone}), email (${E.email}) or your account. Changes apply to the next delivery cycle; charges already taken for a dispatched order are not refundable except as described in our Refund Policy.`,
          ka: `გამოწერის შეჩერება, გამოტოვება ან გაუქმება შესაძლებელია ნებისმიერ დროს მომდევნო გაგზავნამდე WhatsApp-ით (${E.phone}), ელფოსტით (${E.email}) ან ანგარიშის მეშვეობით. ცვლილებები ვრცელდება მომდევნო ციკლზე; უკვე გაგზავნილი შეკვეთის თანხა არ ბრუნდება, გარდა დაბრუნების პოლიტიკით გათვალისწინებული შემთხვევებისა.`,
        },
      ],
    },
    {
      h: { en: '6. Free SmartPaw Feeder', ka: '6. უფასო SmartPaw საკვებურა' },
      body: [
        {
          en: 'Where a plan includes a free SmartPaw Feeder, the feeder is provided on loan for the duration of the active subscription. If the subscription is cancelled within the minimum term communicated at signup, the feeder must be returned in working condition or a buy-out fee (communicated at signup) will apply. Normal wear and tear is accepted; intentional damage is not.',
          ka: 'როცა გეგმა მოიცავს უფასო SmartPaw საკვებურას, ის გადმოგეცემათ აქტიური გამოწერის პერიოდით სარგებლობაში. თუ გამოწერა გაუქმდება გამოწერისას მითითებულ მინიმალურ ვადაში, საკვებურა უნდა დაბრუნდეს მუშა მდგომარეობაში, წინააღმდეგ შემთხვევაში გადახდევინდება გამოსყიდვის თანხა (მითითებული გამოწერისას). ბუნებრივი ცვეთა მისაღებია; მიზანმიმართული დაზიანება — არა.',
        },
      ],
    },
    {
      h: { en: '7. Delivery', ka: '7. მიწოდება' },
      body: [
        {
          en: 'We deliver across every district in Tbilisi. Full delivery terms — windows, missed deliveries, fees — are described in our Delivery Policy and form an integral part of these Terms.',
          ka: 'მიწოდება ხორციელდება თბილისის ყველა უბანში. სრული პირობები — სარკმლები, გამოტოვებული მიწოდება, საფასური — აღწერილია მიწოდების პოლიტიკაში, რომელიც ამ წესების განუყოფელი ნაწილია.',
        },
      ],
    },
    {
      h: { en: '8. Returns and refunds', ka: '8. დაბრუნება და ანაზღაურება' },
      body: [
        {
          en: 'Damaged, incorrect or unsuitable products are handled under our Refund Policy. Where applicable Georgian consumer-protection law grants additional rights, those rights are not affected by these Terms.',
          ka: 'დაზიანებული, არასწორი ან შეუსაბამო პროდუქცია მუშავდება დაბრუნების პოლიტიკის შესაბამისად. საქართველოს მომხმარებელთა უფლებების დაცვის კანონით მინიჭებული დამატებითი უფლებები არ იზღუდება ამ წესებით.',
        },
      ],
    },
    {
      h: { en: '9. Acceptable use', ka: '9. დასაშვები გამოყენება' },
      body: [
        {
          en: 'You agree not to misuse the website (e.g., automated scraping, attempts to breach security, fraudulent orders, abusive contact with staff). We may suspend or terminate accounts that violate these Terms.',
          ka: 'თქვენ თანახმა ხართ, რომ არ ისარგებლოთ საიტით არასათანადოდ (მაგ., ავტომატური სკრეიპინგი, უსაფრთხოების დარღვევის მცდელობა, თაღლითური შეკვეთები, თანამშრომლების შეურაცხყოფა). ჩვენ შეგვიძლია შევაჩეროთ ან გავაუქმოთ წესების დამრღვევი ანგარიშები.',
        },
      ],
    },
    {
      h: { en: '10. Intellectual property', ka: '10. ინტელექტუალური საკუთრება' },
      body: [
        {
          en: `All content on www.smartpaw.ge — including the ${E.tradeName} name, logo, photography, copy and design — is owned by ${E.name} or used under licence. You may not copy, reproduce or use it commercially without our written permission.`,
          ka: `www.smartpaw.ge-ის მთელი კონტენტი — მათ შორის სახელი ${E.tradeName}, ლოგო, ფოტოები, ტექსტი და დიზაინი — ${E.name}-ის საკუთრებაა ან გამოიყენება ლიცენზიით. დაუშვებელია მათი დაკოპირება, რეპროდუცირება ან კომერციული გამოყენება ჩვენი წერილობითი ნებართვის გარეშე.`,
        },
      ],
    },
    {
      h: { en: '11. Liability', ka: '11. პასუხისმგებლობა' },
      body: [
        {
          en: `${E.tradeName} curates vet-aligned brands but is not a veterinary service. For medical concerns about your pet, always consult a licensed veterinarian. To the maximum extent permitted by Georgian law, our liability is limited to the value of the affected order. We are not liable for indirect or consequential losses.`,
          ka: `${E.tradeName} ირჩევს ვეტერინარულად შესაბამის ბრენდებს, თუმცა არ არის ვეტერინარული მომსახურება. ცხოველის სამედიცინო საკითხებზე ყოველთვის მიმართეთ ლიცენზირებულ ვეტერინარს. საქართველოს კანონმდებლობით ნებადართულ მაქსიმალურ ფარგლებში ჩვენი პასუხისმგებლობა შემოიფარგლება შესაბამისი შეკვეთის ღირებულებით. ჩვენ არ ვართ პასუხისმგებელი არაპირდაპირ ან თანმდევ ზარალზე.`,
        },
      ],
    },
    {
      h: { en: '12. Force majeure', ka: '12. ფორს-მაჟორი' },
      body: [
        {
          en: 'We are not liable for delays or failures caused by events beyond our reasonable control — natural disasters, strikes, supply-chain disruption, public-authority decisions and similar.',
          ka: 'ჩვენ არ ვართ პასუხისმგებელი ჩვენი გონივრული კონტროლის მიღმა მყოფი მოვლენებით გამოწვეულ შეფერხებებზე ან ჩავარდნებზე — სტიქიური უბედურებები, გაფიცვები, მიწოდების ჯაჭვის შეფერხება, სახელისუფლებო გადაწყვეტილებები და ანალოგიური.',
        },
      ],
    },
    {
      h: { en: '13. Governing law and disputes', ka: '13. მოქმედი კანონი და დავები' },
      body: [
        {
          en: 'These Terms are governed by the laws of Georgia. Disputes that cannot be resolved amicably shall be submitted to the competent courts of Tbilisi, Georgia.',
          ka: 'წინამდებარე წესები რეგულირდება საქართველოს კანონმდებლობით. დავები, რომელთა მოგვარებაც მოლაპარაკებით ვერ ხერხდება, განიხილება თბილისის შესაბამისი სასამართლოს მიერ.',
        },
      ],
    },
    {
      h: { en: '14. Changes to the Terms', ka: '14. წესების ცვლილებები' },
      body: [
        {
          en: 'We may update these Terms from time to time. The latest version is always published on this page. Material changes affecting active subscriptions will be communicated by email at least 14 days before they take effect.',
          ka: 'ჩვენ შესაძლოა პერიოდულად განვაახლოთ ეს წესები. უახლესი ვერსია ყოველთვის გამოქვეყნდება ამ გვერდზე. აქტიური გამოწერისთვის არსებითი ცვლილებების შესახებ გაცნობებთ ელფოსტით ცვლილების ძალაში შესვლამდე მინიმუმ 14 დღით ადრე.',
        },
      ],
    },
    {
      h: { en: '15. Contact', ka: '15. კონტაქტი' },
      body: [
        {
          en: `For any question about these Terms, contact ${E.name} at ${E.email} or ${E.phone}. Postal address: ${E.address}.`,
          ka: `წესებთან დაკავშირებული ნებისმიერი კითხვისთვის დაგვიკავშირდით: ${E.name} — ${E.email} ან ${E.phone}. საფოსტო მისამართი: ${E.addressKa}.`,
        },
      ],
    },
  ],
};

export const DELIVERY = {
  eyebrow: { en: 'Legal · Delivery', ka: 'სამართლებრივი · მიწოდება' },
  title: { en: 'Delivery Policy', ka: 'მიწოდების პოლიტიკა' },
  intro: {
    en: 'Where we deliver, when, and what happens if you’re not home.',
    ka: 'სად, როდის ვაწვდით და რა ხდება, თუ სახლში არ ხართ.',
  },
  sections: [
    {
      h: { en: '1. Service area', ka: '1. მომსახურების არეალი' },
      body: [
        {
          en: 'We currently deliver across every district of Tbilisi. Deliveries to other Georgian cities are planned — register on www.smartpaw.ge to be notified when your city goes live.',
          ka: 'ამჟამად მიწოდება ხორციელდება თბილისის ყველა უბანში. დაგეგმილია მიწოდება საქართველოს სხვა ქალაქებშიც — დარეგისტრირდით www.smartpaw.ge-ზე და გაცნობებთ, როცა თქვენი ქალაქი ჩაირთვება.',
        },
      ],
    },
    {
      h: { en: '2. Delivery window', ka: '2. მიწოდების სარკმელი' },
      body: [
        {
          en: 'Subscription orders confirmed before 12:00 (GMT+4) are dispatched the same day where possible; otherwise on the next dispatch day for your district. You will receive a WhatsApp or SMS with the estimated time window.',
          ka: '12:00 საათამდე (GMT+4) დადასტურებული გამოწერა იგზავნება იმავე დღეს, თუ შესაძლებელია; წინააღმდეგ შემთხვევაში — თქვენი უბნისთვის გათვალისწინებულ მომდევნო გაგზავნის დღეს. მიწოდების სავარაუდო სარკმელი მოგივათ WhatsApp-ით ან SMS-ით.',
        },
      ],
    },
    {
      h: { en: '3. Receiving your order', ka: '3. შეკვეთის მიღება' },
      body: [
        {
          en: 'Please make sure someone over 18 is available at the delivery address. If you select contact-less delivery in your account, the courier will leave the order in a safe place agreed with you.',
          ka: 'გთხოვთ, უზრუნველყოთ, რომ მიწოდების მისამართზე იყოს 18 წელს მიღწეული პირი. თუ ანგარიშში არჩეული გაქვთ უკონტაქტო მიწოდება, კურიერი დატოვებს შეკვეთას თქვენთან შეთანხმებულ უსაფრთხო ადგილას.',
        },
      ],
    },
    {
      h: { en: '4. Missed delivery', ka: '4. გამოტოვებული მიწოდება' },
      body: [
        {
          en: 'If no one is home and we cannot reach you, our courier will contact you to arrange a free re-attempt the next working day. After two missed attempts the order is returned to our warehouse; further attempts may incur a small re-dispatch fee, communicated in advance.',
          ka: 'თუ სახლში არავინაა და ვერ დაგიკავშირდით, კურიერი დაგიკავშირდებათ შემდეგ სამუშაო დღეს უფასო განმეორებითი მცდელობის შესათანხმებლად. ორი წარუმატებელი მცდელობის შემდეგ შეკვეთა ბრუნდება საწყობში; შემდგომი მცდელობები შესაძლოა შეიცავდეს მცირე გადასახადს, რომელიც წინასწარ შეთანხმდება.',
        },
      ],
    },
    {
      h: { en: '5. Delivery fees', ka: '5. მიწოდების საფასური' },
      body: [
        {
          en: 'Standard delivery is free for every active subscription within Tbilisi. One-off, urgent or out-of-cycle deliveries may carry a small fee which is confirmed before the order is placed. The 15 GEL flat delivery fee applies to the Custom plan as stated in the Plans page.',
          ka: 'სტანდარტული მიწოდება უფასოა ყველა აქტიური გამოწერისთვის თბილისში. ერთჯერადი, სასწრაფო ან ციკლის გარეთ მიწოდებები შესაძლოა შეიცავდეს მცირე საფასურს, რომელიც დადასტურდება შეკვეთის განთავსებამდე. 15 ლარის ფიქსირებული მიწოდების საფასური ვრცელდება ინდივიდუალურ („Custom“) გეგმაზე, როგორც ეს მითითებულია გეგმების გვერდზე.',
        },
      ],
    },
    {
      h: { en: '6. Damaged or missing items on delivery', ka: '6. დაზიანებული ან გამოტოვებული ნივთები' },
      body: [
        {
          en: `Please inspect the order at delivery and contact us within 48 hours at ${E.email} or ${E.phone} for any damaged or missing item. Replacement is handled under our Refund Policy.`,
          ka: `გთხოვთ, შეამოწმოთ შეკვეთა მიწოდებისას და დაგვიკავშირდით 48 საათის განმავლობაში ${E.email}-ზე ან ${E.phone}-ზე, თუ რომელიმე ნივთი დაზიანდა ან აკლია. ჩანაცვლება ხდება დაბრუნების პოლიტიკის შესაბამისად.`,
        },
      ],
    },
    {
      h: { en: '7. Address changes', ka: '7. მისამართის ცვლილება' },
      body: [
        {
          en: 'You can update your delivery address at any time via WhatsApp, email or your account, at least 24 hours before the next dispatch.',
          ka: 'მიწოდების მისამართის განახლება შესაძლებელია ნებისმიერ დროს WhatsApp-ით, ელფოსტით ან ანგარიშის მეშვეობით — მომდევნო გაგზავნამდე მინიმუმ 24 საათით ადრე.',
        },
      ],
    },
  ],
};

export const REFUND = {
  eyebrow: { en: 'Legal · Refund', ka: 'სამართლებრივი · დაბრუნება' },
  title: { en: 'Refund & Returns Policy', ka: 'დაბრუნებისა და ანაზღაურების პოლიტიკა' },
  intro: {
    en: 'How we handle damaged products, wrong items and food that doesn’t suit your pet.',
    ka: 'როგორ ვმუშაობთ დაზიანებულ, არასწორ ან თქვენი შინაური ცხოველისთვის შეუსაბამო პროდუქციაზე.',
  },
  sections: [
    {
      h: { en: '1. Damaged or incorrect items', ka: '1. დაზიანებული ან არასწორი ნივთები' },
      body: [
        {
          en: `If an item arrives damaged or you receive the wrong product, contact us within 48 hours at ${E.email} or ${E.phone} with the order number and a short description (a photo helps). We will replace the item at no cost on your next delivery, or sooner where possible.`,
          ka: `თუ ნივთი მოვიდა დაზიანებული ან მიიღეთ არასწორი პროდუქცია, დაგვიკავშირდით 48 საათში ${E.email}-ზე ან ${E.phone}-ზე — შეკვეთის ნომრით და მოკლე აღწერით (ფოტო დაგვეხმარება). ჩვენ ჩავანაცვლებთ ნივთს უფასოდ მომდევნო მიწოდებაზე ან, შესაძლებლობის შემთხვევაში, უფრო ადრე.`,
        },
      ],
    },
    {
      h: { en: '2. Product not suitable for your pet', ka: '2. პროდუქცია, რომელიც არ მოერგო თქვენს შინაურს' },
      body: [
        {
          en: 'If your pet does not tolerate a product (taste, allergy, sensitivity), tell us within 14 days of delivery. We will swap the product on your next delivery at no extra cost. Opened bags can be donated to local shelters we partner with — we’ll arrange collection.',
          ka: 'თუ თქვენი შინაური ცხოველი არ ერგება პროდუქტს (გემო, ალერგია, მგრძნობელობა), გვაცნობეთ მიწოდებიდან 14 დღის განმავლობაში. ჩვენ ჩავანაცვლებთ პროდუქტს მომდევნო მიწოდებაზე უფასოდ. გახსნილი პაკეტები შესაძლოა გადაეცეს თავშესაფრებს, რომლებთანაც ვთანამშრომლობთ — გადაცემას ჩვენ მოვაგვარებთ.',
        },
      ],
    },
    {
      h: { en: '3. Refunds', ka: '3. ანაზღაურება' },
      body: [
        {
          en: 'Where a replacement is not possible, the value of the affected item will be credited to your next billing cycle. If you prefer a cash refund, it is processed to the original payment method within 14 working days from approval, in line with Georgian consumer-protection law.',
          ka: 'თუ ჩანაცვლება შეუძლებელია, ნივთის ღირებულება დაგერიცხებათ კრედიტად მომდევნო ბილინგ ციკლზე. თუ ანაზღაურება გსურთ ფულადი სახით, ის ბრუნდება ორიგინალურ გადახდის მეთოდზე დადასტურებიდან 14 სამუშაო დღის განმავლობაში — საქართველოს მომხმარებელთა უფლებების დაცვის კანონის შესაბამისად.',
        },
      ],
    },
    {
      h: { en: '4. SmartPaw Feeder', ka: '4. SmartPaw საკვებურა' },
      body: [
        {
          en: 'The SmartPaw Feeder is provided on loan with eligible plans. In case of a manufacturing defect, we replace it free of charge. Damage caused by misuse or accidents is handled under the buy-out terms communicated at signup.',
          ka: 'SmartPaw საკვებურა გადმოგეცემათ შესაბამის გეგმებთან ერთად სარგებლობაში. ქარხნული დეფექტის შემთხვევაში, ჩვენ უფასოდ ვცვლით. არასწორი გამოყენებით ან შემთხვევით გამოწვეული დაზიანება მუშავდება გამოწერისას შეთანხმებული გამოსყიდვის პირობებით.',
        },
      ],
    },
    {
      h: { en: '5. Cancellations', ka: '5. გაუქმება' },
      body: [
        {
          en: 'You may cancel your subscription at any time before the next dispatch. Orders already dispatched cannot be cancelled but the products can be returned under the conditions above.',
          ka: 'გამოწერის გაუქმება შესაძლებელია ნებისმიერ დროს მომდევნო გაგზავნამდე. უკვე გაგზავნილი შეკვეთა ვერ უქმდება, თუმცა პროდუქცია შესაძლოა დაბრუნდეს ზემოაღნიშნული პირობებით.',
        },
      ],
    },
    {
      h: { en: '6. How to start a return', ka: '6. როგორ დაიწყოთ დაბრუნება' },
      body: [
        {
          en: `Send a short message to ${E.email} or WhatsApp ${E.phone} with your order number, the item in question and (if possible) a photo. We aim to confirm next steps within one working day.`,
          ka: `მოგვწერეთ მოკლე შეტყობინება ${E.email}-ზე ან WhatsApp-ით ${E.phone}-ზე — შეკვეთის ნომრით, შესაბამისი ნივთით და (თუ შესაძლებელია) ფოტოთი. შემდეგ ნაბიჯებს ვადასტურებთ ერთი სამუშაო დღის განმავლობაში.`,
        },
      ],
    },
  ],
};

// Footer block strings (legal entity disclosure, repeated on every page)
export const FOOTER_BLOCK = {
  legalEntity: { en: 'Legal entity', ka: 'იურიდიული პირი' },
  taxCode: { en: 'Tax Identification Code', ka: 'საგადასახადო კოდი' },
  registeredAddress: { en: 'Registered address', ka: 'რეგისტრირებული მისამართი' },
  contact: { en: 'Contact', ka: 'კონტაქტი' },
  effectiveDate: { en: 'Effective date', ka: 'ძალაში შესვლის თარიღი' },
  tradingAs: { en: 'trading as', ka: 'სავაჭრო სახელით' },
};
