import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, AlertCircle, Building2, Newspaper, Briefcase, HeartHandshake } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { api } from '@/lib/api';
import { useSignup } from '@/lib/SignupContext';
import { useLang } from '@/lib/LangContext';
import { WHATSAPP_URL as buildWhatsAppUrl } from '@/lib/siteConfig';

// Static contact facts (not translatable)
const PHONE_VALUE = '+995 591 96 99 01';
const EMAIL_VALUE = 'guga@smartpaw.ge';
const WHATSAPP_URL = buildWhatsAppUrl();

const DEPARTMENT_META = [
  { key: 'general', icon: HeartHandshake, email: EMAIL_VALUE },
  { key: 'partnerships', icon: Building2, email: EMAIL_VALUE },
  { key: 'press', icon: Newspaper, email: EMAIL_VALUE },
  { key: 'careers', icon: Briefcase, email: EMAIL_VALUE },
];

export default function ContactPage() {
  const { openSignup } = useSignup();
  const { t } = useLang();
  const c = t.contact || {};
  const cf = c.form || {};
  const departments = Array.isArray(c.departments) ? c.departments : [];
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    department: 'general',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError(cf.errorRequired || 'Please fill in every field before sending.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createContactInquiry(form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '', department: 'general' });
    } catch (err) {
      setError(err.message || cf.errorGeneric || 'Could not send your message — please try WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappLabel = t?.common?.talkToUs || 'Chat on WhatsApp';
  const startPlanLabel = t?.common?.startPlan || 'Start your plan';
  const sendingLabel = cf.sending || `${cf.submit || 'Send message'}…`;

  return (
    <>
      <SeoMeta
        title={`${c.eyebrow || 'Contact'} · SmartPaw Food`}
        description={c.intro || ''}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: c.eyebrow || 'Contact', path: '/contact' },
        ])}
      />
    <PageShell
      eyebrow={c.eyebrow}
      title={c.title}
      intro={c.intro}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7" data-testid="contact-top-grid">
        {/* Contact details */}
        <div className="lg:col-span-5 card-soft p-7 md:p-9 space-y-6" data-testid="contact-details-card">
          <ContactRow icon={<MapPin size={18} />} label={c.address} value={c.addressValue} />
          <ContactRow icon={<Phone size={18} />} label={c.phone} value={PHONE_VALUE} />
          <ContactRow icon={<Mail size={18} />} label={c.email} value={EMAIL_VALUE} />
          <ContactRow icon={<Clock size={18} />} label={c.hours} value={c.hoursValue} comingSoon comingSoonText={c.hoursToConfirm} />

          <div className="pt-4 border-t border-[#0A4D8C]/10 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="contact-whatsapp-button"
            >
              <MessageCircle size={16} />
              {whatsappLabel}
            </a>
            <button
              onClick={openSignup}
              className="btn-secondary"
              data-testid="contact-start-plan-button"
            >
              {startPlanLabel}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-7 card-soft p-0 overflow-hidden" data-testid="contact-map-card">
          <div className="aspect-[5/4] sm:aspect-[16/10] w-full">
            <iframe
              title={c.addressValue || 'SmartPaw Food location'}
              src="https://www.google.com/maps?q=0102%20Tsereteli%20Ave%20118%2C%20Tbilisi%2C%20Georgia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              data-testid="contact-map-iframe"
            />
          </div>
        </div>
      </div>

      {/* Inquiry form */}
      <section className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-7" data-testid="contact-inquiry-section">
        <div className="lg:col-span-5">
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{c.sendEyebrow}</p>
          <h2 className="font-display font-bold text-[#05223D] text-4xl sm:text-5xl tracking-[-0.02em] leading-[1.02] mt-3">
            {c.sendTitle}
          </h2>
          <p className="text-[#465B70] text-lg leading-relaxed mt-5">
            {c.sendBody}
          </p>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEPARTMENT_META.map((d, idx) => {
              const Icon = d.icon;
              const active = form.department === d.key;
              const dept = departments[idx] || departments.find((dx) => dx && dx.key === d.key) || {};
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, department: d.key }))}
                  data-testid={`contact-department-${d.key}-button`}
                  className={`text-left rounded-2xl p-4 border transition-all ${active ? 'border-[#F25C05] bg-[#F25C05]/5 shadow-[0_10px_24px_rgba(242,92,5,0.10)]' : 'border-[#0A4D8C]/10 hover:border-[#0A4D8C]/25'}`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-[#F25C05] text-white' : 'bg-[#F5F2EB] text-[#0A4D8C]'}`}>
                    <Icon size={16} />
                  </span>
                  <p className="font-display font-bold text-[#05223D] mt-3">{dept.title}</p>
                  <p className="text-xs text-[#465B70] mt-1 leading-relaxed">{dept.body}</p>
                  <p className="text-xs text-[#0A4D8C] font-bold mt-2">{d.email}</p>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="lg:col-span-7 card-soft p-7 md:p-10 space-y-5"
          data-testid="contact-inquiry-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={cf.name} id="contact-name">
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={update('name')}
                required
                data-testid="contact-name-input"
                className="form-input"
                placeholder={cf.namePh}
              />
            </Field>
            <Field label={cf.email} id="contact-email">
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                data-testid="contact-email-input"
                className="form-input"
                placeholder={cf.emailPh}
              />
            </Field>
          </div>
          <Field label={cf.subject} id="contact-subject">
            <input
              id="contact-subject"
              type="text"
              value={form.subject}
              onChange={update('subject')}
              required
              data-testid="contact-subject-input"
              className="form-input"
              placeholder={cf.subjectPh}
            />
          </Field>
          <Field label={cf.message} id="contact-message">
            <textarea
              id="contact-message"
              rows={5}
              value={form.message}
              onChange={update('message')}
              required
              data-testid="contact-message-input"
              className="form-input resize-none"
              placeholder={cf.messagePh}
            />
          </Field>

          {error && (
            <div
              className="flex items-start gap-2 text-sm text-[#9b1c1c] bg-[#9b1c1c]/8 border border-[#9b1c1c]/20 rounded-xl px-4 py-3"
              data-testid="contact-form-error"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div
              className="flex items-start gap-2 text-sm text-[#05663d] bg-[#05663d]/8 border border-[#05663d]/20 rounded-xl px-4 py-3"
              data-testid="contact-form-success"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{cf.success}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="contact-submit-button"
            >
              <Send size={16} />
              {submitting ? sendingLabel : (cf.submit || 'Send message')}
            </button>
            <p className="text-xs text-[#465B70]">
              {cf.routedTo} <span className="font-bold text-[#0A4D8C]">{DEPARTMENT_META.find((d) => d.key === form.department)?.email}</span>
            </p>
          </div>
        </form>
      </section>
    </PageShell>
    </>
  );
}

function ContactRow({ icon, label, value, comingSoon, comingSoonText }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-11 h-11 shrink-0 rounded-full bg-[#F5F2EB] text-[#0A4D8C] flex items-center justify-center">
        {icon}
      </span>
      <div>
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">{label}</p>
        <p className="font-bold text-[#05223D] text-lg mt-1">
          {value}
          {comingSoon && <span className="ml-2 text-xs text-[#F25C05] font-medium">{comingSoonText}</span>}
        </p>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">{label}</span>
      <span className="block mt-2">{children}</span>
    </label>
  );
}
