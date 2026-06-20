import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SeoMeta from "@/components/SeoMeta";
import { useLang } from "@/lib/LangContext";

const COPY = {
  metaTitle: { en: "Request a product", ka: "მოითხოვე პროდუქტი" },
  metaDescription: {
    en: "Tell us what product you need and we'll source it for your next delivery.",
    ka: "გვითხარი რა გჭირდება და ჩვენ მოგიძებნით შემდეგი მიწოდებისთვის.",
  },
  eyebrow: { en: "Catalogue · Request", ka: "კატალოგი · მოთხოვნა" },
  title: {
    en: "Can't find it? We'll source it.",
    ka: "ვერ პოულობ? ჩვენ მოგიძებნით." ,
  },
  intro: {
    en: "Tell us the brand, product name and size — we'll get back to you on WhatsApp / email with a price and a delivery date, usually within one working day.",
    ka: "გვითხარი ბრენდი, პროდუქტის სახელი და ზომა — დაგიკავშირდებით WhatsApp-ით ან მეილით ფასის და მიწოდების თარიღით, ჩვეულებრივ ერთი სამუშაო დღის განმავლობაში.",
  },
  fields: {
    name: { en: "Your name", ka: "შენი სახელი" },
    email: { en: "Email", ka: "ელ-ფოსტა" },
    phone: { en: "Phone (optional, for WhatsApp)", ka: "ტელეფონი (არასავალდებულო, WhatsApp-ისთვის)" },
    productName: { en: "Product name", ka: "პროდუქტის სახელი" },
    brand: { en: "Brand (optional)", ka: "ბრენდი (არასავალდებულო)" },
    size: { en: "Size or weight (optional)", ka: "ზომა ან წონა (არასავალდებულო)" },
    quantity: { en: "Quantity per delivery", ka: "რაოდენობა მიწოდებაში" },
    notes: { en: "Notes (optional)", ka: "შენიშვნა (არასავალდებულო)" },
  },
  placeholders: {
    productName: { en: "e.g. Royal Canin Maxi Adult", ka: "მაგ. Royal Canin Maxi Adult" },
    brand: { en: "e.g. Royal Canin", ka: "მაგ. Royal Canin" },
    size: { en: "e.g. 15kg", ka: "მაგ. 15კგ" },
    notes: {
      en: "Anything else we should know — flavour, packaging, etc.",
      ka: "სხვა დეტალები — გემო, შეფუთვა და ა.შ.",
    },
  },
  submit: { en: "Send request", ka: "გაგზავნე მოთხოვნა" },
  sending: { en: "Sending…", ka: "გაგზავნა…" },
  thanksTitle: { en: "Request received", ka: "მოთხოვნა მიღებულია" },
  thanksBody: {
    en: "Thanks! Our team is now reviewing your request. We'll be in touch on WhatsApp / email within one working day with a price and a delivery date.",
    ka: "მადლობა! ჩვენი გუნდი იხილავს თქვენს მოთხოვნას. დაგიკავშირდებით WhatsApp-ით ან მეილით ერთი სამუშაო დღის განმავლობაში ფასით და მიწოდების თარიღით.",
  },
  another: { en: "Send another request", ka: "გაგზავნე ახალი მოთხოვნა" },
  back: { en: "Back to catalogue", ka: "კატალოგში დაბრუნება" },
  loginHint: {
    en: "Tip: sign in first so you can see your past requests in your cabinet.",
    ka: "რჩევა: ჯერ შედი ანგარიშზე — შემდეგ შენს კაბინეტში დაინახავ ყველა მოთხოვნას.",
  },
  loginLink: { en: "Sign in", ka: "შესვლა" },
  errorGeneric: { en: "Something went wrong. Please try again.", ka: "რაღაც შეცდა. სცადე ხელახლა." },
};

function getInitialUser() {
  // If the customer is signed in, we can read their info from auth cookie via /api/auth/me.
  // This page works without auth too — they'll fill in name/email by hand.
  return { name: "", email: "", phone: "" };
}

export default function RequestProductPage() {
  const { lang } = useLang();
  const tx = (obj) => (obj && (obj[lang] || obj.en)) || "";
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // null | { name, email, phone, ... }
  const [form, setForm] = useState({
    ...getInitialUser(),
    product_name: "",
    brand: "",
    size: "",
    quantity: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from current session
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        if (!r.ok) return;
        const u = await r.json();
        if (alive && u && u.email) {
          setUser(u);
          setForm((f) => ({
            ...f,
            name: f.name || u.name || "",
            email: f.email || u.email || "",
            phone: f.phone || u.phone || "",
          }));
        }
      } catch (_) {/* anonymous is fine */}
    })();
    return () => { alive = false; };
  }, []);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/product-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity) || 1,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || tx(COPY.errorGeneric));
      }
      setSubmitted(true);
    } catch (e2) {
      setError(e2.message || tx(COPY.errorGeneric));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm((f) => ({ ...f, product_name: "", brand: "", size: "", quantity: 1, notes: "" }));
  };

  return (
    <>
      <SeoMeta title={tx(COPY.metaTitle)} description={tx(COPY.metaDescription)} />

      <section className="pt-28 md:pt-32 pb-2">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Breadcrumbs />
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="max-w-2xl mx-auto px-5 md:px-10">
          {!submitted ? (
            <>
              <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                {tx(COPY.eyebrow)}
              </p>
              <h1 className="font-display font-extrabold text-[#05223D] text-[34px] sm:text-5xl tracking-[-0.025em] leading-[1.05] mt-3">
                {tx(COPY.title)}
              </h1>
              <p className="mt-4 text-[#465B70] text-lg leading-relaxed">{tx(COPY.intro)}</p>

              {!user && (
                <p className="mt-4 text-sm text-[#465B70]">
                  {tx(COPY.loginHint)}{" "}
                  <Link to="/cabinet/login" className="font-bold text-[#0A4D8C] hover:text-[#F25C05]">
                    {tx(COPY.loginLink)} →
                  </Link>
                </p>
              )}

              {error && (
                <div
                  className="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
                  data-testid="request-form-error"
                >
                  {error}
                </div>
              )}

              <form className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={submit} data-testid="request-form">
                <Field label={tx(COPY.fields.name)} required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    data-testid="request-name-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.email)} required>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    data-testid="request-email-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.phone)} colSpan={2}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    data-testid="request-phone-input"
                    className="input"
                  />
                </Field>

                <Field label={tx(COPY.fields.productName)} required colSpan={2}>
                  <input
                    type="text"
                    required
                    value={form.product_name}
                    onChange={(e) => update({ product_name: e.target.value })}
                    placeholder={tx(COPY.placeholders.productName)}
                    data-testid="request-product-name-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.brand)}>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => update({ brand: e.target.value })}
                    placeholder={tx(COPY.placeholders.brand)}
                    data-testid="request-brand-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.size)}>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => update({ size: e.target.value })}
                    placeholder={tx(COPY.placeholders.size)}
                    data-testid="request-size-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.quantity)} required>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={form.quantity}
                    onChange={(e) => update({ quantity: e.target.value })}
                    data-testid="request-quantity-input"
                    className="input"
                  />
                </Field>
                <Field label={tx(COPY.fields.notes)} colSpan={2}>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder={tx(COPY.placeholders.notes)}
                    data-testid="request-notes-input"
                    className="input min-h-[100px]"
                  />
                </Field>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="request-submit-button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] disabled:opacity-50 text-white text-sm font-bold px-6 py-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {submitting ? tx(COPY.sending) : tx(COPY.submit)}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] text-[#0A4D8C] hover:bg-[#0A4D8C0A] text-sm font-bold px-5 py-3"
                  >
                    <ArrowLeft size={16} /> {tx(COPY.back)}
                  </button>
                </div>
              </form>

              <style>{`
                .input {
                  width: 100%;
                  background: #fff;
                  border: 1px solid rgba(10,77,140,0.10);
                  border-radius: 12px;
                  padding: 0.7rem 0.9rem;
                  font-size: 0.95rem;
                  color: #05223D;
                  transition: border-color 0.15s;
                }
                .input:focus { outline: none; border-color: #F25C05; }
              `}</style>
            </>
          ) : (
            <div className="text-center py-10" data-testid="request-success">
              <div className="inline-flex w-16 h-16 rounded-full bg-[#F25C05] text-white items-center justify-center mb-5">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h1 className="font-display font-extrabold text-[#05223D] text-3xl sm:text-4xl">
                {tx(COPY.thanksTitle)}
              </h1>
              <p className="mt-4 text-[#465B70] text-lg leading-relaxed max-w-xl mx-auto">
                {tx(COPY.thanksBody)}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={reset}
                  data-testid="request-send-another-button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-3"
                >
                  {tx(COPY.another)}
                </button>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-2 rounded-full border border-[#0A4D8C26] text-[#0A4D8C] hover:bg-[#0A4D8C0A] text-sm font-bold px-5 py-3"
                >
                  <ArrowLeft size={16} /> {tx(COPY.back)}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, required, colSpan = 1, children }) {
  return (
    <div className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-bold text-[#465B70] tracking-[0.18em] uppercase mb-2">
        {label}{required && <span className="text-[#F25C05]"> *</span>}
      </label>
      {children}
    </div>
  );
}
