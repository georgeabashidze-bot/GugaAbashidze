// Centralised runtime configuration sourced from env vars.
// Adding values here keeps phone numbers, analytics IDs and the canonical
// site URL out of the component code.

export const WHATSAPP_NUMBER =
  process.env.REACT_APP_WHATSAPP_NUMBER || '995591969901';

export const WHATSAPP_URL = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

export const SITE_URL =
  (process.env.REACT_APP_SITE_URL || 'https://smartpaw.ge').replace(
    /\/$/,
    ''
  );

export const GA4_ID = process.env.REACT_APP_GA4_ID || '';
