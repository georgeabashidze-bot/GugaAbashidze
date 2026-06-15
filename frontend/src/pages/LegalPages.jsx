import React from 'react';
import PageShell from '@/components/PageShell';
import { useLang } from '@/lib/LangContext';
import {
  LEGAL_ENTITY,
  PRIVACY,
  TERMS,
  DELIVERY,
  REFUND,
  FOOTER_BLOCK,
} from '@/data/legalContent';

// --- Helpers ------------------------------------------------------------

// Pick the value for the active language from a { en, ka } pair (falls back to en).
const pickLocale = (node, lang) => {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (lang === 'ka' && node.ka) return node.ka;
  return node.en ?? '';
};

// Render a string with **bold** markers safely as React nodes.
const renderInline = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

// Render one body item: either a paragraph object {en, ka} or a list wrapper { list: [...] }.
const renderBody = (item, lang, key) => {
  if (item && typeof item === 'object' && Array.isArray(item.list)) {
    return (
      <ul key={key} className="list-disc pl-6 space-y-1">
        {item.list.map((li, i) => (
          <li key={i}>{renderInline(pickLocale(li, lang))}</li>
        ))}
      </ul>
    );
  }
  return <p key={key}>{renderInline(pickLocale(item, lang))}</p>;
};

// --- Reusable document renderer ----------------------------------------

function LegalDocument({ doc, leadTestId }) {
  const { lang } = useLang();
  const fb = FOOTER_BLOCK;

  return (
    <PageShell
      eyebrow={pickLocale(doc.eyebrow, lang)}
      title={pickLocale(doc.title, lang)}
      intro={pickLocale(doc.intro, lang)}
    >
      <div className="prose-like max-w-3xl mx-auto space-y-6 text-[#465B70] leading-relaxed">
        <p data-testid={leadTestId}>
          {doc.lead
            ? renderInline(pickLocale(doc.lead, lang))
            : renderInline(pickLocale(doc.intro, lang))}
        </p>

        {doc.sections.map((section, idx) => (
          <React.Fragment key={idx}>
            <h2 className="font-display font-bold text-[#05223D] text-xl md:text-2xl tracking-tight mt-8 mb-3">
              {pickLocale(section.h, lang)}
            </h2>
            {section.body.map((item, i) => renderBody(item, lang, i))}
          </React.Fragment>
        ))}

        <div
          className="mt-12 pt-6 border-t border-[#0A4D8C]/15 text-xs text-[#465B70]/80 space-y-1"
          data-testid="legal-entity-block"
        >
          <p>
            <strong>{pickLocale(fb.legalEntity, lang)}:</strong>{' '}
            {LEGAL_ENTITY.name} ({pickLocale(fb.tradingAs, lang)} {LEGAL_ENTITY.tradeName}).
          </p>
          <p>
            <strong>{pickLocale(fb.taxCode, lang)}:</strong> {LEGAL_ENTITY.taxCode}.
          </p>
          <p>
            <strong>{pickLocale(fb.registeredAddress, lang)}:</strong>{' '}
            {lang === 'ka' ? LEGAL_ENTITY.addressKa : LEGAL_ENTITY.address}.
          </p>
          <p>
            <strong>{pickLocale(fb.contact, lang)}:</strong> {LEGAL_ENTITY.email} ·{' '}
            {LEGAL_ENTITY.phone}.
          </p>
          <p>
            {pickLocale(fb.effectiveDate, lang)}: {pickLocale(LEGAL_ENTITY.effectiveDate, lang)}.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

// --- Page exports -------------------------------------------------------

export function PrivacyPage() {
  return <LegalDocument doc={PRIVACY} leadTestId="privacy-intro" />;
}

export function TermsPage() {
  return <LegalDocument doc={TERMS} leadTestId="terms-intro" />;
}

export function DeliveryPage() {
  return <LegalDocument doc={DELIVERY} leadTestId="delivery-intro" />;
}

export function RefundPage() {
  return <LegalDocument doc={REFUND} leadTestId="refund-intro" />;
}
