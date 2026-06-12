import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import { useSignup } from '@/lib/SignupContext';

// Reusable hero strip + content shell for inner pages.
// Provides: breadcrumbs, eyebrow, title, intro, optional image, child content block, CTA strip.
export default function PageShell({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  comingSoon = false,
  comingSoonNote,
  children,
}) {
  const { openSignup } = useSignup();
  const hasHero = Boolean(title || eyebrow || intro || image || comingSoon);

  return (
    <>
      {/* Hero strip (or breadcrumbs-only header when minimal) */}
      {hasHero ? (
        <section className="relative pt-32 md:pt-40 pb-14 md:pb-20 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#F25C05]/10 blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] rounded-full bg-[#0A4D8C]/10 blur-3xl pointer-events-none" aria-hidden />

          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <Breadcrumbs />
            <div className={`mt-6 grid grid-cols-1 ${image ? 'lg:grid-cols-12 gap-10 lg:gap-16' : ''} items-end`}>
              <div className={image ? 'lg:col-span-7' : ''}>
                {eyebrow && (
                  <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="font-display font-extrabold text-[#05223D] text-[34px] sm:text-5xl lg:text-[58px] tracking-[-0.025em] leading-[1.05] mt-3">
                    {title}
                  </h1>
                )}
                {intro && (
                  <p className="mt-5 text-[#465B70] text-lg leading-relaxed max-w-2xl">{intro}</p>
                )}
                {comingSoon && (
                  <div className="mt-6 inline-flex items-center gap-2 bg-[#F25C05]/10 border border-[#F25C05]/30 rounded-full px-4 py-2 text-sm font-bold text-[#F25C05]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F25C05] animate-pulse" />
                    Coming soon{comingSoonNote ? ` — ${comingSoonNote}` : ''}
                  </div>
                )}
              </div>
              {image && (
                <div className="lg:col-span-5">
                  <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden card-soft">
                    <img
                      src={image}
                      alt={imageAlt || title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-28 md:pt-32 pb-2">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <Breadcrumbs />
          </div>
        </section>
      )}

      {/* Page content */}
      {children && (
        <section className="pb-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-5 md:px-10">{children}</div>
        </section>
      )}

      {/* Bottom CTA strip */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0A4D8C] px-7 py-12 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
            <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
            <div className="relative">
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">SmartPaw Food</p>
              <h2 className="font-display font-bold text-white text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-lg">
                Ready to skip the next pet-shop run?
              </h2>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              <button
                onClick={openSignup}
                className="btn-primary"
                data-testid="page-shell-start-button"
              >
                Start your plan
                <ArrowRight size={18} />
              </button>
              <a
                href="https://wa.me/995591969901"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-[#0A4D8C]"
                data-testid="page-shell-whatsapp-link"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
