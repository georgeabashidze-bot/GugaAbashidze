import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useSignup } from '@/lib/SignupContext';

export default function ContactPage() {
  const { openSignup } = useSignup();
  return (
    <PageShell
      eyebrow="Contact"
      title="Let’s talk pet routines."
      intro="WhatsApp is the fastest way to reach us. For partnership, wholesale or press, drop us an email."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <div className="card-soft p-7 md:p-9 space-y-6">
          <ContactRow icon={<MapPin size={18} />} label="Address" value="Tbilisi, Georgia" />
          <ContactRow icon={<Phone size={18} />} label="Phone / WhatsApp" value="+995 591 96 99 01" />
          <ContactRow icon={<Mail size={18} />} label="Email" value="hello@smartpaw.ge" />
          <ContactRow icon={<Clock size={18} />} label="Hours" value="Mon–Sat · 09:00–19:00" comingSoon />
        </div>

        <div className="card-soft p-7 md:p-9 bg-[#0A4D8C] text-white relative overflow-hidden">
          <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
          <div className="relative">
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Fastest reply</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mt-3">
              Send us a WhatsApp.
            </h2>
            <p className="text-white/80 leading-relaxed mt-3">
              We usually reply within an hour during opening times. Tell us your pet, your district and your routine — we’ll do the rest.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/995591969901"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                data-testid="contact-whatsapp-button"
              >
                <MessageCircle size={16} />
                Open WhatsApp
              </a>
              <button
                onClick={openSignup}
                className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-[#0A4D8C]"
                data-testid="contact-start-plan-button"
              >
                Start your plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContactRow({ icon, label, value, comingSoon }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-11 h-11 shrink-0 rounded-full bg-[#F5F2EB] text-[#0A4D8C] flex items-center justify-center">
        {icon}
      </span>
      <div>
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">{label}</p>
        <p className="font-bold text-[#05223D] text-lg mt-1">
          {value}
          {comingSoon && <span className="ml-2 text-xs text-[#F25C05] font-medium">(to confirm)</span>}
        </p>
      </div>
    </div>
  );
}
