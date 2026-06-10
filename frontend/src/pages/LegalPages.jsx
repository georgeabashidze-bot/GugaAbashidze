import React from 'react';
import PageShell from '@/components/PageShell';

function LegalShell({ eyebrow, title, intro, children }) {
  return (
    <PageShell
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      comingSoon
      comingSoonNote="this policy is a draft and will be finalized with legal review before launch"
    >
      <div className="prose-like max-w-3xl mx-auto space-y-6 text-[#465B70] leading-relaxed">
        {children}
      </div>
    </PageShell>
  );
}

function H({ children }) {
  return (
    <h2 className="font-display font-bold text-[#05223D] text-xl md:text-2xl tracking-tight mt-8 mb-3">
      {children}
    </h2>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      intro="How SmartPaw collects, stores and uses your personal and pet information."
    >
      <p>This Privacy Policy describes how SmartPaw Food (“SmartPaw”, “we”) handles the information you provide when registering for a subscription, contacting us or using our website. By using SmartPaw you consent to the practices described in this draft.</p>
      <H>1. Information we collect</H>
      <p>We collect the name, email, phone number and pet details you submit through our registration form, plus delivery address once you confirm a plan. We do not collect payment-card information directly — payments are handled by certified processors (final provider to be confirmed).</p>
      <H>2. How we use it</H>
      <p>To deliver your subscription, contact you about your account, route your deliveries, send service notifications and (with your opt-in) occasional product updates. We do not sell your data to third parties.</p>
      <H>3. Cookies</H>
      <p>The website uses essential cookies only. If analytics are added later, this policy will be updated and a consent banner will be shown.</p>
      <H>4. Your rights</H>
      <p>You can request access, correction or deletion of your data at any time by emailing hello@smartpaw.ge.</p>
      <H>5. Contact</H>
      <p>Privacy questions: hello@smartpaw.ge · WhatsApp +995 591 96 99 01.</p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal · Terms"
      title="Terms & Conditions"
      intro="The terms under which SmartPaw provides its subscription pet-delivery service."
    >
      <p>These Terms & Conditions govern your use of SmartPaw’s subscription service. By registering you agree to the terms below.</p>
      <H>1. The service</H>
      <p>SmartPaw delivers pet food, hygiene products, vitamins and selected accessories on a recurring schedule chosen by you. Brands and product availability may change; equivalent alternatives will be offered.</p>
      <H>2. Subscription, pause and cancellation</H>
      <p>Subscriptions auto-renew at the chosen cadence. You may pause, skip or cancel at any time before the next dispatch via WhatsApp, email or your account once available.</p>
      <H>3. Pricing</H>
      <p>Final pricing will be confirmed before any payment is taken. Launch pricing will be locked in for early subscribers.</p>
      <H>4. Free SmartPaw Feeder</H>
      <p>The free SmartPaw Feeder is provided on loan with eligible plans. If you cancel within the minimum term (to be confirmed), the feeder must be returned or a buy-out fee applies.</p>
      <H>5. Liability</H>
      <p>SmartPaw curates vet-approved brands but is not a veterinary service. For health concerns about your pet, always consult a licensed vet.</p>
    </LegalShell>
  );
}

export function DeliveryPage() {
  return (
    <LegalShell
      eyebrow="Legal · Delivery"
      title="Delivery Policy"
      intro="Where we deliver, when, and what happens if you’re not home."
    >
      <H>Service area</H>
      <p>We currently deliver across every district in Tbilisi. Outside Tbilisi is planned — register to be notified.</p>
      <H>Delivery window</H>
      <p>Orders placed before 12:00 are delivered the same day where possible; otherwise on the next dispatch day in your district. You will receive a WhatsApp or SMS with the time window.</p>
      <H>Missed delivery</H>
      <p>If no one is home, our courier will contact you to arrange a free re-attempt the next day.</p>
      <H>Fees</H>
      <p>Standard delivery is free with every active subscription. One-off urgent or out-of-cycle deliveries may carry a small fee, confirmed in advance.</p>
    </LegalShell>
  );
}

export function RefundPage() {
  return (
    <LegalShell
      eyebrow="Legal · Refund"
      title="Refund & Returns Policy"
      intro="How we handle damaged products, wrong items and unsuitable food."
    >
      <H>Damaged or incorrect items</H>
      <p>If an item arrives damaged or you receive the wrong product, contact us within 48 hours and we will replace it at no cost on your next delivery (or sooner where possible).</p>
      <H>Product not suitable for your pet</H>
      <p>If your pet does not tolerate a product (taste, allergy, sensitivity), tell us and we will swap it on your next delivery at no extra cost.</p>
      <H>Refunds</H>
      <p>Where a replacement is not possible, the value of the affected item will be credited to your next billing cycle. Cash refunds are processed within 14 working days where required.</p>
    </LegalShell>
  );
}
