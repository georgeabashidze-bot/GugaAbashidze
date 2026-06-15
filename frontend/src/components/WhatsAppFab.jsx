import React from 'react';
import { TID } from '@/constants/testIds';
import { WHATSAPP_URL } from '@/lib/siteConfig';

const HREF = WHATSAPP_URL(
  "Hi SmartPaw — I'd like to learn more about your pet delivery plans."
);

export default function WhatsAppFab() {
  return (
    <a
      data-testid={TID.whatsappFab}
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SmartPaw on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366]/60 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white shadow-[0_10px_36px_rgba(37,211,102,0.45)] hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(37,211,102,0.55)] transition-all duration-300">
        <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" aria-hidden>
          <path d="M19.11 17.43c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.15-.42-2.19-1.35-.81-.72-1.36-1.6-1.52-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01a1 1 0 0 0-.73.34c-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.91 2.92 4.62 4.09.65.28 1.15.45 1.55.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.18.16-1.29-.07-.11-.25-.18-.52-.31zM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.88.49 3.71 1.43 5.32L5.33 26.67l5.48-1.43a10.6 10.6 0 0 0 5.21 1.36h.01c5.88 0 10.66-4.78 10.66-10.67 0-2.85-1.11-5.53-3.12-7.55a10.6 10.6 0 0 0-7.55-3.05zm0 19.5h-.01a8.84 8.84 0 0 1-4.5-1.23l-.32-.19-3.25.85.87-3.17-.21-.33a8.83 8.83 0 0 1-1.36-4.72c0-4.89 3.98-8.86 8.87-8.86a8.81 8.81 0 0 1 6.27 2.6 8.81 8.81 0 0 1 2.6 6.27c0 4.89-3.98 8.87-8.87 8.87z"/>
        </svg>
      </span>
    </a>
  );
}
