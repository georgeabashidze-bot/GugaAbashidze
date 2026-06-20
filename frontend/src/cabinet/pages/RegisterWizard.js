import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Phone, MapPin, PawPrint, Repeat, Plus, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { useI18n, localized } from "@/cabinet/i18n";
import { useAuth } from "@/cabinet/context/AuthContext";
import { api, formatApiError } from "@/cabinet/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import BrandMark from "@/cabinet/components/layout/BrandMark";
import LanguageToggle from "@/cabinet/components/layout/LanguageToggle";
import PhotoCapture from "@/cabinet/components/PhotoCapture";
import FileUpload from "@/cabinet/components/FileUpload";

const HERO_IMG = "https://images.pexels.com/photos/30769356/pexels-photo-30769356.jpeg?auto=compress&cs=tinysrgb&w=1600";
const TOTAL_STEPS = 4;

function Stepper({ step }) {
  return (
    <div className="mb-5 flex items-center gap-2" data-testid="wizard-stepper">
      {[1, 2, 3, 4].map((n, idx) => (
        <React.Fragment key={n}>
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${n < step ? "bg-[hsl(var(--sage))] text-[hsl(var(--foreground))]" : n === step ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
            {n < step ? <Check className="h-3.5 w-3.5" /> : n}
          </div>
          {idx < 3 && <div className={`h-px flex-1 ${n < step ? "bg-[hsl(var(--sage))]" : "bg-[hsl(var(--border))]"}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function RegisterWizard() {
  const { t, lang } = useI18n();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  // Step 1
  const [account, setAccount] = useState({ name: "", email: "", password: "", password2: "" });
  // Step 2
  const [contact, setContact] = useState({ phone: "", recipient: "", city: "Tbilisi", district: "", street: "", building: "", apartment: "", notes: "" });
  // Step 3
  const [pet, setPet] = useState({ name: "", species: "dog", breed: "", birth_date: "", approx_age: "", weight_kg: "", photo_url: "", birth_certificate_url: "", dietary_notes: "" });
  // Step 4
  const [subs, setSubs] = useState([
    { label: "", frequency: "biweekly", first_delivery_at: "", items: [], search: "", payment_method: "bank_transfer" },
  ]);

  useEffect(() => { document.title = "SmartPaw — Register"; }, []);

  useEffect(() => {
    api.get("/cabinet/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.product_id, p])), [products]);

  const onGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL
    const redirectUrl = window.location.origin + "/cabinet/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!account.name.trim()) return setError(t("wizard.err_name_required"));
      if (!account.email.trim()) return setError(t("wizard.err_email_required"));
      if ((account.password || "").length < 6) return setError(t("wizard.err_password_short"));
      if (account.password !== account.password2) return setError(t("wizard.err_password_mismatch"));
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const goBack = () => { setError(""); if (step > 1) setStep(step - 1); };

  const updateSub = (idx, patch) => setSubs((cur) => cur.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const addSubLine = () => {
    if (subs.length >= 3) return;
    setSubs((cur) => [...cur, { label: "", frequency: "biweekly", first_delivery_at: "", items: [], search: "", payment_method: "bank_transfer" }]);
  };
  const removeSubLine = (idx) => setSubs((cur) => cur.filter((_, i) => i !== idx));
  const toggleSubItem = (idx, productId) => {
    setSubs((cur) => cur.map((s, i) => {
      if (i !== idx) return s;
      const existing = s.items.find((it) => it.product_id === productId);
      if (existing) {
        return { ...s, items: s.items.filter((it) => it.product_id !== productId) };
      }
      return { ...s, items: [...s.items, { product_id: productId, qty: 1 }] };
    }));
  };
  const setSubItemQty = (idx, productId, qty) => {
    const q = Math.max(1, Math.min(20, Math.round(qty || 1)));
    setSubs((cur) => cur.map((s, i) => i === idx ? { ...s, items: s.items.map((it) => it.product_id === productId ? { ...it, qty: q } : it) } : s));
  };

  const submit = async () => {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    const payload = {
      name: account.name.trim(),
      email: account.email.trim(),
      password: account.password,
      phone: contact.phone.trim() || null,
    };
    if (contact.street.trim() || contact.city.trim()) {
      payload.address = {
        label: "Home",
        recipient: contact.recipient.trim() || account.name.trim(),
        phone: contact.phone.trim() || "",
        city: contact.city.trim() || "Tbilisi",
        district: contact.district.trim() || null,
        street: contact.street.trim(),
        building: contact.building.trim() || null,
        apartment: contact.apartment.trim() || null,
        notes: contact.notes.trim() || null,
      };
    }
    if (pet.name.trim()) {
      payload.pet = {
        name: pet.name.trim(), species: pet.species,
        breed: pet.breed.trim() || null,
        birth_date: pet.birth_date || null,
        approx_age: pet.approx_age?.trim() || null,
        weight_kg: pet.weight_kg ? Number(pet.weight_kg) : null,
        photo_url: pet.photo_url || null,
        birth_certificate_url: pet.birth_certificate_url || null,
        dietary_notes: pet.dietary_notes.trim() || null,
      };
    }
    const validSubs = subs.filter((s) => s.items.length > 0);
    if (validSubs.length > 0) {
      payload.subscriptions = validSubs.map((s) => ({
        label: s.label.trim() || null,
        frequency: s.frequency,
        first_delivery_at: s.first_delivery_at || null,
        items: s.items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
        payment_method: s.payment_method || "bank_transfer",
      }));
    }
    try {
      const { data } = await api.post("/auth/register", payload);
      setUser(data);
      navigate("/cabinet/dashboard", { replace: true });
    } catch (e) {
      setError(formatApiError(e));
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="register-wizard">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[5fr_7fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img src={HERO_IMG} alt="Pet routine" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,33,26,0.6)] via-[rgba(43,33,26,0.18)] to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <BrandMark />
            <h2 className="font-serif text-3xl font-semibold leading-tight drop-shadow-md">{t("auth.register_subtitle")}</h2>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.32 } }} className="w-full max-w-2xl">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <BrandMark />
              <LanguageToggle testId="register-language-toggle-mobile" />
            </div>
            <div className="mb-4 hidden items-center justify-end lg:flex">
              <LanguageToggle testId="register-language-toggle" />
            </div>

            <Card className="border-[hsl(var(--border))] bg-paper shadow-[0_14px_34px_rgba(43,33,26,0.10)]">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-2xl">{t(`wizard.step${step}_title`)}</CardTitle>
                  <Badge variant="secondary" className="rounded-full" data-testid="wizard-step-badge">{t("wizard.step", { n: step, total: TOTAL_STEPS })}</Badge>
                </div>
                <CardDescription>{t(`wizard.step${step}_subtitle`)}</CardDescription>
                <Stepper step={step} />
              </CardHeader>
              <CardContent className="space-y-5">
                {/* STEP 1: Account */}
                {step === 1 && (
                  <div className="space-y-4" data-testid="wizard-step-1">
                    <Button type="button" variant="outline" onClick={onGoogle} data-testid="register-google-button" className="h-11 w-full rounded-xl border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.4-4.5 3.4-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.6 0 2.6.7 3.2 1.2l2.2-2.1C16 5.6 14.2 5 12 5 7.6 5 4 8.6 4 13s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5-.1-.9-.1-1.2H12z"/></svg>
                      {t("auth.continue_with_google")}
                    </Button>
                    <div className="relative"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-3 text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t("auth.or_continue_with")}</span></div>
                    <div className="space-y-1.5"><Label>{t("auth.name")}</Label>
                      <div className="relative"><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <Input value={account.name} onChange={(e)=>setAccount({...account,name:e.target.value})} data-testid="register-name-input" className="h-11 rounded-xl pl-10" required /></div>
                    </div>
                    <div className="space-y-1.5"><Label>{t("auth.email")}</Label>
                      <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <Input type="email" value={account.email} onChange={(e)=>setAccount({...account,email:e.target.value})} data-testid="register-email-input" className="h-11 rounded-xl pl-10" required /></div>
                    </div>
                    <div className="space-y-1.5"><Label>{t("auth.password")}</Label>
                      <div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <Input type="password" value={account.password} onChange={(e)=>setAccount({...account,password:e.target.value})} data-testid="register-password-input" className="h-11 rounded-xl pl-10" required minLength={6} /></div>
                    </div>
                    <div className="space-y-1.5"><Label>{t("auth.password_repeat")}</Label>
                      <div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <Input type="password" value={account.password2} onChange={(e)=>setAccount({...account,password2:e.target.value})} data-testid="register-password2-input" className="h-11 rounded-xl pl-10" required minLength={6} /></div>
                      {account.password2 && account.password && account.password !== account.password2 && (
                        <p className="text-xs text-[hsl(var(--destructive))]" data-testid="register-password-mismatch">{t("wizard.err_password_mismatch")}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Contact + address */}
                {step === 2 && (
                  <div className="space-y-4" data-testid="wizard-step-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2"><Label>{t("addresses.phone")} <span className="text-xs text-[hsl(var(--muted-foreground))]">({t("common.optional")})</span></Label>
                        <div className="relative"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                          <Input value={contact.phone} onChange={(e)=>setContact({...contact,phone:e.target.value})} placeholder="+995..." data-testid="wizard-phone-input" className="h-11 rounded-xl pl-10" /></div>
                      </div>
                      <div className="space-y-1.5 col-span-2"><Label>{t("addresses.recipient")} <span className="text-xs text-[hsl(var(--muted-foreground))]">({t("common.optional")})</span></Label>
                        <Input value={contact.recipient} onChange={(e)=>setContact({...contact,recipient:e.target.value})} data-testid="wizard-recipient-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("addresses.city")}</Label>
                        <Input value={contact.city} onChange={(e)=>setContact({...contact,city:e.target.value})} data-testid="wizard-city-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("addresses.district")}</Label>
                        <Input value={contact.district} onChange={(e)=>setContact({...contact,district:e.target.value})} data-testid="wizard-district-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5 col-span-2"><Label>{t("addresses.street")}</Label>
                        <Input value={contact.street} onChange={(e)=>setContact({...contact,street:e.target.value})} data-testid="wizard-street-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("addresses.building")}</Label>
                        <Input value={contact.building} onChange={(e)=>setContact({...contact,building:e.target.value})} data-testid="wizard-building-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("addresses.apartment")}</Label>
                        <Input value={contact.apartment} onChange={(e)=>setContact({...contact,apartment:e.target.value})} data-testid="wizard-apartment-input" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5 col-span-2"><Label>{t("addresses.notes")}</Label>
                        <Textarea rows={2} value={contact.notes} onChange={(e)=>setContact({...contact,notes:e.target.value})} data-testid="wizard-notes-input" /></div>
                    </div>
                  </div>
                )}

                {/* STEP 3: First pet */}
                {step === 3 && (
                  <div className="space-y-4" data-testid="wizard-step-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{t("wizard.pet_optional")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>{t("pets.name")}</Label>
                        <Input value={pet.name} onChange={(e)=>setPet({...pet,name:e.target.value})} data-testid="wizard-pet-name" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("pets.species")}</Label>
                        <Select value={pet.species} onValueChange={(v)=>setPet({...pet,species:v})}>
                          <SelectTrigger className="h-11 rounded-xl" data-testid="wizard-pet-species"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="dog">{t("pets.dog")}</SelectItem><SelectItem value="cat">{t("pets.cat")}</SelectItem></SelectContent>
                        </Select></div>
                      <div className="space-y-1.5"><Label>{t("pets.breed")}</Label>
                        <Input value={pet.breed} onChange={(e)=>setPet({...pet,breed:e.target.value})} data-testid="wizard-pet-breed" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("pets.weight_kg")}</Label>
                        <Input type="number" step="0.1" min="0" value={pet.weight_kg} onChange={(e)=>setPet({...pet,weight_kg:e.target.value})} data-testid="wizard-pet-weight" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("pets.birth_date")}</Label>
                        <Input type="date" value={pet.birth_date} onChange={(e)=>setPet({...pet,birth_date:e.target.value})} data-testid="wizard-pet-birth" className="h-11 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>{t("pets.approx_age")}</Label>
                        <Input value={pet.approx_age} onChange={(e)=>setPet({...pet,approx_age:e.target.value})} placeholder="2y 3m" data-testid="wizard-pet-approx-age" className="h-11 rounded-xl" /></div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("pets.photo")}</Label>
                      <PhotoCapture value={pet.photo_url} onChange={(v)=>setPet({...pet,photo_url:v})} testIdPrefix="wizard-pet-photo" aspect="4-3" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("pets.birth_certificate")}</Label>
                      <FileUpload value={pet.birth_certificate_url} onChange={(v)=>setPet({...pet,birth_certificate_url:v})} testIdPrefix="wizard-pet-cert" />
                    </div>
                  </div>
                )}

                {/* STEP 4: Subscriptions */}
                {step === 4 && (
                  <div className="space-y-5" data-testid="wizard-step-4">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{t("wizard.sub_optional")}</p>
                    {subs.map((sub, idx) => (
                      <Card key={idx} className="border-[hsl(var(--border))] bg-cream" data-testid={`wizard-sub-${idx}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-base">{t("wizard.subscription_n", { n: idx + 1 })}</CardTitle>
                          {subs.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubLine(idx)} className="text-[hsl(var(--destructive))]" data-testid={`wizard-sub-remove-${idx}`}><X className="h-4 w-4" /></Button>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 col-span-2"><Label>{t("subscription.name_label")}</Label>
                              <Input value={sub.label} onChange={(e)=>updateSub(idx,{label:e.target.value})} placeholder={t("wizard.label_placeholder")} data-testid={`wizard-sub-label-${idx}`} className="h-10 rounded-xl" /></div>
                            <div className="space-y-1.5"><Label>{t("subscription.frequency")}</Label>
                              <Select value={sub.frequency} onValueChange={(v)=>updateSub(idx,{frequency:v})}>
                                <SelectTrigger className="h-10 rounded-xl" data-testid={`wizard-sub-frequency-${idx}`}><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="weekly">{t("subscription.weekly")}</SelectItem><SelectItem value="biweekly">{t("subscription.biweekly")}</SelectItem><SelectItem value="monthly">{t("subscription.monthly")}</SelectItem></SelectContent>
                              </Select></div>
                            <div className="space-y-1.5"><Label>{t("wizard.first_delivery")}</Label>
                              <Input type="date" value={sub.first_delivery_at} onChange={(e)=>updateSub(idx,{first_delivery_at:e.target.value})} data-testid={`wizard-sub-date-${idx}`} className="h-10 rounded-xl" /></div>
                            <div className="space-y-1.5 col-span-2"><Label>{t("payment.title")}</Label>
                              <Select value={sub.payment_method} onValueChange={(v)=>updateSub(idx,{payment_method:v})}>
                                <SelectTrigger className="h-10 rounded-xl" data-testid={`wizard-sub-payment-${idx}`}><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bank_transfer">{t("payment.bank_transfer")}</SelectItem>
                                  <SelectItem value="cash_on_delivery">{t("payment.cash_on_delivery")}</SelectItem>
                                </SelectContent>
                              </Select></div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <Label>{t("wizard.pick_products")}</Label>
                              <span className="text-xs text-[hsl(var(--muted-foreground))]">{sub.items.length} {t("orders.items").toLowerCase()}</span>
                            </div>
                            <div className="relative mt-2">
                              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                              <Input
                                value={sub.search || ""}
                                onChange={(e) => updateSub(idx, { search: e.target.value })}
                                placeholder={t("catalogue.search_placeholder")}
                                data-testid={`wizard-sub-search-${idx}`}
                                className="h-9 rounded-xl pl-9 text-sm"
                              />
                            </div>
                            {products.length === 0 ? (
                              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{t("common.loading")}</p>
                            ) : (() => {
                              const q = (sub.search || "").trim().toLowerCase();
                              const list = q ? products.filter((p) => `${p.name_en} ${p.name_ka} ${p.brand}`.toLowerCase().includes(q)) : products;
                              if (list.length === 0) {
                                return <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]" data-testid={`wizard-sub-no-results-${idx}`}>{t("catalogue.no_results")}</p>;
                              }
                              return (
                              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {list.map((p) => {
                                  const inItems = sub.items.find((it) => it.product_id === p.product_id);
                                  return (
                                    <div key={p.product_id} className={`flex items-center gap-2 rounded-xl border p-2 ${inItems ? "border-[hsl(var(--primary))] bg-white" : "border-[hsl(var(--border))] bg-white/60"}`}>
                                      <img src={p.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                                      <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-medium">{localized(p, lang, "name")}</div>
                                        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{p.price_gel.toFixed(2)} {t("common.currency")}</div>
                                      </div>
                                      {inItems ? (
                                        <div className="flex items-center gap-1">
                                          <Input type="number" min="1" max="20" value={inItems.qty} onChange={(e)=>setSubItemQty(idx,p.product_id,parseInt(e.target.value,10))} className="h-7 w-12 rounded-md text-xs" data-testid={`wizard-sub-${idx}-qty-${p.product_id}`} />
                                          <Button type="button" size="icon" variant="ghost" onClick={() => toggleSubItem(idx, p.product_id)} className="h-7 w-7 text-[hsl(var(--destructive))]"><X className="h-3.5 w-3.5" /></Button>
                                        </div>
                                      ) : (
                                        <Button type="button" size="sm" variant="outline" onClick={() => toggleSubItem(idx, p.product_id)} className="h-7 rounded-lg px-2 text-xs" data-testid={`wizard-sub-${idx}-add-${p.product_id}`}><Plus className="h-3.5 w-3.5" /></Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {subs.length < 3 && (
                      <Button type="button" variant="outline" onClick={addSubLine} className="w-full rounded-xl" data-testid="wizard-add-subscription"><Plus className="mr-2 h-4 w-4" />{t("wizard.add_subscription")}</Button>
                    )}
                  </div>
                )}

                {error && <div className="rounded-xl border border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5 px-3 py-2 text-sm text-[hsl(var(--destructive))]" data-testid="wizard-error">{error}</div>}

                <div className="flex items-center justify-between gap-2 border-t border-[hsl(var(--border))] pt-4">
                  <Button type="button" variant="ghost" onClick={goBack} disabled={step === 1} className="rounded-xl" data-testid="wizard-back-button">
                    <ArrowLeft className="mr-2 h-4 w-4" />{t("wizard.back")}
                  </Button>
                  <div className="flex items-center gap-2">
                    {step < TOTAL_STEPS ? (
                      <Button type="button" onClick={goNext} className="rounded-xl" data-testid="wizard-next-button">
                        {t("wizard.next")} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="button" onClick={submit} disabled={submitting} className="rounded-xl" data-testid="wizard-finish-button">
                        {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("wizard.finish")}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">{t("auth.have_account")} <Link to="/cabinet/login" className="font-medium text-[hsl(var(--primary))] hover:underline" data-testid="register-go-login">{t("auth.sign_in_now")}</Link></p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
