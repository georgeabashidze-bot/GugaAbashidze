import React from 'react';
import PageShell from '@/components/PageShell';

const LEGAL_ENTITY = 'Cleanpaw International LLC';
const TAX_CODE = '404 757 287';
const TRADE_NAME = 'SmartPaw Food';
const LEGAL_ADDRESS = '0102 Tsereteli Ave. 118, Tbilisi, Georgia';
const CONTACT_EMAIL = 'guga@smartpaw.ge';
const CONTACT_PHONE = '+995 591 96 99 01';
const EFFECTIVE_DATE = 'February 2026';

function LegalShell({ eyebrow, title, intro, children }) {
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro}>
      <div className="prose-like max-w-3xl mx-auto space-y-6 text-[#465B70] leading-relaxed">
        {children}
        <div className="mt-12 pt-6 border-t border-[#0A4D8C]/15 text-xs text-[#465B70]/80 space-y-1" data-testid="legal-entity-block">
          <p><strong>Legal entity:</strong> {LEGAL_ENTITY} (trading as {TRADE_NAME}).</p>
          <p><strong>Tax Identification Code:</strong> {TAX_CODE}.</p>
          <p><strong>Registered address:</strong> {LEGAL_ADDRESS}.</p>
          <p><strong>Contact:</strong> {CONTACT_EMAIL} · {CONTACT_PHONE}.</p>
          <p>Effective date: {EFFECTIVE_DATE}.</p>
        </div>
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
      intro={`How ${TRADE_NAME} collects, stores and uses your personal and pet information.`}
    >
      <p data-testid="privacy-intro">
        This Privacy Policy explains how {LEGAL_ENTITY} (Tax ID {TAX_CODE}), operating under the trade name {TRADE_NAME} (“we”, “us”, “our”), collects, uses and protects personal data of customers and visitors of www.smartpaw.ge. By using our website or subscribing to our service you agree to this Policy.
      </p>

      <H>1. Data controller</H>
      <p>
        The data controller is {LEGAL_ENTITY}, registered in Georgia under Tax Code {TAX_CODE}, with its registered office at {LEGAL_ADDRESS}. You can contact us at {CONTACT_EMAIL} or {CONTACT_PHONE} for any privacy-related matter.
      </p>

      <H>2. Information we collect</H>
      <p>We collect only the information necessary to deliver our service:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Account & contact data:</strong> name, email, phone number, delivery address, language preference.</li>
        <li><strong>Pet profile data:</strong> pet species, breed, age, weight, dietary notes and allergies you choose to share.</li>
        <li><strong>Order data:</strong> products purchased, frequency, delivery window, internal notes.</li>
        <li><strong>Communications:</strong> messages exchanged via email, WhatsApp, phone or the contact form.</li>
        <li><strong>Technical data:</strong> IP address, browser, device type and pages visited, collected through essential cookies and standard server logs.</li>
      </ul>
      <p>We do <strong>not</strong> collect or store payment-card numbers ourselves. Payments are processed by certified payment providers; we only receive a confirmation that a transaction has succeeded or failed.</p>

      <H>3. How we use your data</H>
      <ul className="list-disc pl-6 space-y-1">
        <li>To create and manage your account and subscription.</li>
        <li>To pick, pack and deliver orders to the correct address.</li>
        <li>To send transactional messages (order confirmations, delivery updates, invoices).</li>
        <li>To respond to your enquiries via email, WhatsApp or phone.</li>
        <li>To improve the service, prevent fraud and comply with Georgian law.</li>
        <li>With your explicit consent, to send occasional marketing about new products or offers — you can unsubscribe at any time.</li>
      </ul>

      <H>4. Legal basis</H>
      <p>We process personal data on the basis of (a) performance of the contract you enter into when you subscribe, (b) our legitimate interests in running and securing the service, (c) compliance with our legal obligations, and (d) your consent where required (e.g., marketing communications).</p>

      <H>5. Sharing your data</H>
      <p>We share personal data only with parties strictly necessary to operate the service:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Delivery couriers and logistics partners — limited to name, address and phone.</li>
        <li>Payment processors — to take payment securely.</li>
        <li>IT, hosting and analytics providers acting on our behalf under a data-processing agreement.</li>
        <li>Government bodies when required by Georgian law.</li>
      </ul>
      <p>We never sell your personal data to third parties.</p>

      <H>6. Cookies</H>
      <p>The website uses essential cookies needed for the cart, authentication and language preference. If we introduce analytics or marketing cookies in the future, we will update this Policy and ask for your consent through a cookie banner.</p>

      <H>7. Data retention</H>
      <p>We keep personal data only as long as needed to deliver the service and to meet our legal, accounting and tax obligations under Georgian law. When the data is no longer required we delete or anonymise it.</p>

      <H>8. Your rights</H>
      <p>You have the right to access, correct, update or delete your personal data, to object to or restrict certain processing, to withdraw consent and to receive a copy of your data in a portable format. To exercise any right, email {CONTACT_EMAIL}. We respond within the time limits set by Georgian data-protection law.</p>

      <H>9. Security</H>
      <p>We apply technical and organisational measures to protect personal data — encrypted connections (HTTPS), access controls and routine backups. No system is 100% secure, but we monitor and improve our practices continuously.</p>

      <H>10. Children</H>
      <p>The service is intended for adults (18+). We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact {CONTACT_EMAIL} and we will delete it.</p>

      <H>11. Changes to this Policy</H>
      <p>We may update this Policy from time to time. The latest version is always published on this page with a new effective date. Material changes will be communicated by email to active subscribers.</p>

      <H>12. Contact us</H>
      <p>For any privacy-related question or request, contact {LEGAL_ENTITY} at {CONTACT_EMAIL} or {CONTACT_PHONE}. Postal address: {LEGAL_ADDRESS}.</p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal · Terms"
      title="Terms & Conditions"
      intro={`The terms under which ${TRADE_NAME} provides its subscription pet-delivery service.`}
    >
      <p data-testid="terms-intro">
        These Terms & Conditions (the “Terms”) govern your use of the website www.smartpaw.ge and the subscription delivery service operated by {LEGAL_ENTITY} (Tax ID {TAX_CODE}), trading as {TRADE_NAME} (“we”, “us”). By placing an order or activating a subscription, you confirm that you have read and accepted these Terms.
      </p>

      <H>1. The service</H>
      <p>{TRADE_NAME} is a subscription delivery service for cat and dog supplies — food, hygiene products, vitamins and selected accessories — delivered on a recurring schedule across Tbilisi. Product availability may change; we will offer an equivalent alternative or, if you prefer, a credit on your next delivery.</p>

      <H>2. Eligibility</H>
      <p>You must be at least 18 years old and a legal resident of Georgia (or have a valid Georgian delivery address) to subscribe. By subscribing you confirm that the information you provide about you and your pet is accurate.</p>

      <H>3. Account</H>
      <p>You are responsible for keeping your account credentials confidential and for all activity under your account. Notify us immediately at {CONTACT_EMAIL} if you suspect unauthorised use.</p>

      <H>4. Subscriptions, pricing and payment</H>
      <ul className="list-disc pl-6 space-y-1">
        <li>Subscriptions auto-renew at the cadence you choose until paused or cancelled.</li>
        <li>All prices are in Georgian Lari (GEL) and include applicable VAT.</li>
        <li>Payment is taken via certified payment processors at the start of each delivery cycle.</li>
        <li>We may update prices for future cycles; we will notify you in advance and you can cancel before the next renewal.</li>
      </ul>

      <H>5. Pause, skip and cancellation</H>
      <p>You may pause, skip or cancel a subscription at any time before the next dispatch via WhatsApp ({CONTACT_PHONE}), email ({CONTACT_EMAIL}) or your account. Changes apply to the next delivery cycle; charges already taken for a dispatched order are not refundable except as described in our Refund Policy.</p>

      <H>6. Free SmartPaw Feeder</H>
      <p>Where a plan includes a free SmartPaw Feeder, the feeder is provided on loan for the duration of the active subscription. If the subscription is cancelled within the minimum term communicated at signup, the feeder must be returned in working condition or a buy-out fee (communicated at signup) will apply. Normal wear and tear is accepted; intentional damage is not.</p>

      <H>7. Delivery</H>
      <p>We deliver across every district in Tbilisi. Full delivery terms — windows, missed deliveries, fees — are described in our Delivery Policy and form an integral part of these Terms.</p>

      <H>8. Returns and refunds</H>
      <p>Damaged, incorrect or unsuitable products are handled under our Refund Policy. Where applicable Georgian consumer-protection law grants additional rights, those rights are not affected by these Terms.</p>

      <H>9. Acceptable use</H>
      <p>You agree not to misuse the website (e.g., automated scraping, attempts to breach security, fraudulent orders, abusive contact with staff). We may suspend or terminate accounts that violate these Terms.</p>

      <H>10. Intellectual property</H>
      <p>All content on www.smartpaw.ge — including the {TRADE_NAME} name, logo, photography, copy and design — is owned by {LEGAL_ENTITY} or used under licence. You may not copy, reproduce or use it commercially without our written permission.</p>

      <H>11. Liability</H>
      <p>{TRADE_NAME} curates vet-aligned brands but is not a veterinary service. For medical concerns about your pet, always consult a licensed veterinarian. To the maximum extent permitted by Georgian law, our liability is limited to the value of the affected order. We are not liable for indirect or consequential losses.</p>

      <H>12. Force majeure</H>
      <p>We are not liable for delays or failures caused by events beyond our reasonable control — natural disasters, strikes, supply-chain disruption, public-authority decisions and similar.</p>

      <H>13. Governing law and disputes</H>
      <p>These Terms are governed by the laws of Georgia. Disputes that cannot be resolved amicably shall be submitted to the competent courts of Tbilisi, Georgia.</p>

      <H>14. Changes to the Terms</H>
      <p>We may update these Terms from time to time. The latest version is always published on this page. Material changes affecting active subscriptions will be communicated by email at least 14 days before they take effect.</p>

      <H>15. Contact</H>
      <p>For any question about these Terms, contact {LEGAL_ENTITY} at {CONTACT_EMAIL} or {CONTACT_PHONE}. Postal address: {LEGAL_ADDRESS}.</p>
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
      <H>1. Service area</H>
      <p>We currently deliver across every district of Tbilisi. Deliveries to other Georgian cities are planned — register on www.smartpaw.ge to be notified when your city goes live.</p>

      <H>2. Delivery window</H>
      <p>Subscription orders confirmed before 12:00 (GMT+4) are dispatched the same day where possible; otherwise on the next dispatch day for your district. You will receive a WhatsApp or SMS with the estimated time window.</p>

      <H>3. Receiving your order</H>
      <p>Please make sure someone over 18 is available at the delivery address. If you select contact-less delivery in your account, the courier will leave the order in a safe place agreed with you.</p>

      <H>4. Missed delivery</H>
      <p>If no one is home and we cannot reach you, our courier will contact you to arrange a free re-attempt the next working day. After two missed attempts the order is returned to our warehouse; further attempts may incur a small re-dispatch fee, communicated in advance.</p>

      <H>5. Delivery fees</H>
      <p>Standard delivery is free for every active subscription within Tbilisi. One-off, urgent or out-of-cycle deliveries may carry a small fee which is confirmed before the order is placed. The 15 GEL flat delivery fee applies to the Custom plan as stated in the Plans page.</p>

      <H>6. Damaged or missing items on delivery</H>
      <p>Please inspect the order at delivery and contact us within 48 hours at {CONTACT_EMAIL} or {CONTACT_PHONE} for any damaged or missing item. Replacement is handled under our Refund Policy.</p>

      <H>7. Address changes</H>
      <p>You can update your delivery address at any time via WhatsApp, email or your account, at least 24 hours before the next dispatch.</p>
    </LegalShell>
  );
}

export function RefundPage() {
  return (
    <LegalShell
      eyebrow="Legal · Refund"
      title="Refund & Returns Policy"
      intro="How we handle damaged products, wrong items and food that doesn’t suit your pet."
    >
      <H>1. Damaged or incorrect items</H>
      <p>If an item arrives damaged or you receive the wrong product, contact us within 48 hours at {CONTACT_EMAIL} or {CONTACT_PHONE} with the order number and a short description (a photo helps). We will replace the item at no cost on your next delivery, or sooner where possible.</p>

      <H>2. Product not suitable for your pet</H>
      <p>If your pet does not tolerate a product (taste, allergy, sensitivity), tell us within 14 days of delivery. We will swap the product on your next delivery at no extra cost. Opened bags can be donated to local shelters we partner with — we’ll arrange collection.</p>

      <H>3. Refunds</H>
      <p>Where a replacement is not possible, the value of the affected item will be credited to your next billing cycle. If you prefer a cash refund, it is processed to the original payment method within 14 working days from approval, in line with Georgian consumer-protection law.</p>

      <H>4. SmartPaw Feeder</H>
      <p>The SmartPaw Feeder is provided on loan with eligible plans. In case of a manufacturing defect, we replace it free of charge. Damage caused by misuse or accidents is handled under the buy-out terms communicated at signup.</p>

      <H>5. Cancellations</H>
      <p>You may cancel your subscription at any time before the next dispatch. Orders already dispatched cannot be cancelled but the products can be returned under the conditions above.</p>

      <H>6. How to start a return</H>
      <p>Send a short message to {CONTACT_EMAIL} or WhatsApp {CONTACT_PHONE} with your order number, the item in question and (if possible) a photo. We aim to confirm next steps within one working day.</p>
    </LegalShell>
  );
}
