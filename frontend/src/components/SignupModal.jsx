import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLang } from '@/lib/LangContext';
import { TID } from '@/constants/testIds';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  pet_type: 'dog',
  pet_name: '',
  pet_breed: '',
  pet_age: '',
  notes: '',
};

export default function SignupModal({ open, onClose }) {
  const { t } = useLang();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!open) {
      // small delay before resetting so success view stays
      const id = setTimeout(() => {
        setForm(emptyForm);
        setStatus('idle');
        setErrMsg('');
      }, 250);
      return () => clearTimeout(id);
    }
    // lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrMsg('');
    try {
      await axios.post(`${API}/leads`, form);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      const detail = err?.response?.data?.detail;
      setErrMsg(typeof detail === 'string' ? detail : t.signup.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-[#05223D]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        data-testid={TID.signup.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
        className="relative w-full md:max-w-2xl bg-[#FDFBF7] md:rounded-3xl rounded-t-3xl shadow-2xl border border-[#0A4D8C1A] max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur z-10 px-7 md:px-10 pt-7 md:pt-9 pb-5 border-b border-[#0A4D8C0F] flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">SmartPaw Food</p>
            <h2 id="signup-title" className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-[-0.02em] mt-1">
              {t.signup.title}
            </h2>
          </div>
          <button
            data-testid={TID.signup.close}
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 shrink-0 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white hover:border-[#0A4D8C] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="px-7 md:px-10 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F25C05]/15 flex items-center justify-center mx-auto">
              <Check size={28} className="text-[#F25C05]" strokeWidth={3} />
            </div>
            <h3 className="font-display font-bold text-[#05223D] text-2xl mt-5">
              {t.signup.success}
            </h3>
            <p data-testid={TID.signup.success} className="text-[#465B70] mt-2 max-w-md mx-auto">
              {t.signup.sub}
            </p>
            <button
              onClick={onClose}
              className="btn-secondary mt-8"
              data-testid="signup-done-button"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-7 md:px-10 py-7 md:py-9 space-y-5">
            <p className="text-[#465B70]">{t.signup.sub}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t.signup.name} required>
                <input
                  data-testid={TID.signup.name}
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="sp-input"
                  placeholder="Nino"
                />
              </Field>
              <Field label={t.signup.email} required>
                <input
                  data-testid={TID.signup.email}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="sp-input"
                  placeholder="you@email.com"
                />
              </Field>
              <Field label={t.signup.phone} required>
                <input
                  data-testid={TID.signup.phone}
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="sp-input"
                  placeholder="+995 5XX XX XX XX"
                />
              </Field>
              <Field label={t.signup.petType} required>
                <select
                  data-testid={TID.signup.petType}
                  required
                  value={form.pet_type}
                  onChange={(e) => update('pet_type', e.target.value)}
                  className="sp-input pr-10"
                >
                  <option value="dog">{t.signup.petTypeOpts.dog}</option>
                  <option value="cat">{t.signup.petTypeOpts.cat}</option>
                  <option value="both">{t.signup.petTypeOpts.both}</option>
                </select>
              </Field>
              <Field label={t.signup.petName}>
                <input
                  data-testid={TID.signup.petName}
                  type="text"
                  value={form.pet_name}
                  onChange={(e) => update('pet_name', e.target.value)}
                  className="sp-input"
                  placeholder="Bibo"
                />
              </Field>
              <Field label={t.signup.petBreed}>
                <input
                  data-testid={TID.signup.petBreed}
                  type="text"
                  value={form.pet_breed}
                  onChange={(e) => update('pet_breed', e.target.value)}
                  className="sp-input"
                  placeholder="Cocker Spaniel"
                />
              </Field>
              <Field label={t.signup.petAge}>
                <input
                  data-testid={TID.signup.petAge}
                  type="text"
                  value={form.pet_age}
                  onChange={(e) => update('pet_age', e.target.value)}
                  className="sp-input"
                  placeholder="3 years"
                />
              </Field>
            </div>

            <Field label={t.signup.notes}>
              <textarea
                data-testid={TID.signup.notes}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="sp-input min-h-[110px] resize-y"
                placeholder="Allergies, preferred brands, delivery notes…"
              />
            </Field>

            {status === 'error' && (
              <div
                data-testid={TID.signup.error}
                className="flex items-start gap-2 bg-[#F25C05]/10 border border-[#F25C05]/30 text-[#05223D] rounded-2xl p-4 text-sm"
              >
                <AlertCircle size={18} className="text-[#F25C05] mt-0.5 shrink-0" />
                <span>{errMsg || t.signup.error}</span>
              </div>
            )}

            <button
              type="submit"
              data-testid={TID.signup.submit}
              disabled={status === 'sending'}
              className="btn-primary w-full justify-center text-base"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.signup.sending}
                </>
              ) : (
                t.signup.submit
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .sp-input {
          background: #FFFFFF;
          border: 1px solid rgba(10, 77, 140, 0.20);
          border-radius: 0.875rem;
          padding: 0.85rem 1rem;
          width: 100%;
          color: #05223D;
          transition: all 0.2s ease;
          outline: none;
        }
        .sp-input::placeholder { color: rgba(70, 91, 112, 0.55); }
        .sp-input:focus {
          border-color: #F25C05;
          box-shadow: 0 0 0 4px rgba(242, 92, 5, 0.12);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#465B70] mb-2 inline-block">
        {label}{required && <span className="text-[#F25C05] ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
