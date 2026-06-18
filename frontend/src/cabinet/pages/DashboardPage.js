import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, PauseCircle, PlayCircle, MapPin, Receipt, Plus, ArrowRight, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";
import { useI18n, localized } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import { useAuth } from "@/cabinet/context/AuthContext";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function useCountdown(targetIso) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  if (!targetIso) return null;
  const target = new Date(targetIso);
  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= days * 86400000;
  const hours = Math.floor(diff / (1000 * 60 * 60)); diff -= hours * 3600000;
  const minutes = Math.floor(diff / (1000 * 60));
  return { days, hours, minutes };
}

function formatDate(iso, lang) {
  if (!iso) return "—";
  try { const d = new Date(iso); return d.toLocaleDateString(lang === "ka" ? "ka-GE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch (_) { return iso; }
}

function formatPrice(value, t) { if (value == null) return "—"; return `${Number(value).toFixed(2)} ${t("common.currency")}`; }

function SubscriptionCard({ sub, productById, onChange, lang, t, idx }) {
  const countdown = useCountdown(sub.status === "active" ? sub.next_delivery_at : null);
  const subtotal = useMemo(() => (sub.items || []).reduce((s, it) => s + (productById[it.product_id]?.price_gel || 0) * it.qty, 0), [sub.items, productById]);
  const [busy, setBusy] = useState(false);
  const togglePause = async () => {
    if (busy) return; setBusy(true);
    try {
      const endpoint = sub.status === "paused" ? `/subscriptions/${sub.subscription_id}/resume` : `/subscriptions/${sub.subscription_id}/pause`;
      const { data } = await api.post(endpoint);
      onChange(data);
      toast.success(sub.status === "paused" ? t("subscription.resumed_toast") : t("subscription.paused_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };
  if (sub.status === "cancelled") return null;
  return (
    <div className="dashboard-gradient rounded-2xl border border-[hsl(var(--border))] bg-paper p-5 sm:p-6" data-testid={`dashboard-sub-card-${sub.subscription_id}`}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--terracotta))]" />
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{sub.label || `${t("subscription.title")} #${idx + 1}`}</span>
            {sub.status === "paused" && <Badge variant="secondary" className="ml-1 rounded-full">{t("dashboard.paused_label")}</Badge>}
            <Badge variant="secondary" className="rounded-full bg-[hsl(var(--secondary))] text-xs">{t(`subscription.${sub.frequency}`)}</Badge>
          </div>
          <h3 className="font-serif text-2xl font-semibold sm:text-3xl" data-testid={`dashboard-sub-date-${sub.subscription_id}`}>{formatDate(sub.next_delivery_at, lang)}</h3>
          {countdown && (
            <div className="mt-3 flex items-end gap-2 tabular-nums" data-testid={`dashboard-sub-countdown-${sub.subscription_id}`}>
              <div><div className="text-2xl font-semibold sm:text-3xl">{countdown.days}</div><div className="text-[10px] text-[hsl(var(--muted-foreground))]">{t("dashboard.countdown_days")}</div></div>
              <div className="pb-1 text-xl text-[hsl(var(--muted-foreground))]">:</div>
              <div><div className="text-2xl font-semibold sm:text-3xl">{String(countdown.hours).padStart(2, "0")}</div><div className="text-[10px] text-[hsl(var(--muted-foreground))]">{t("dashboard.countdown_hours")}</div></div>
              <div className="pb-1 text-xl text-[hsl(var(--muted-foreground))]">:</div>
              <div><div className="text-2xl font-semibold sm:text-3xl">{String(countdown.minutes).padStart(2, "0")}</div><div className="text-[10px] text-[hsl(var(--muted-foreground))]">{t("dashboard.countdown_minutes")}</div></div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl" data-testid={`dashboard-sub-edit-${sub.subscription_id}`}><Link to="/cabinet/subscriptions">{t("dashboard.edit_upcoming")}</Link></Button>
            <Button onClick={togglePause} disabled={busy} size="sm" variant="outline" className="rounded-xl" data-testid={`dashboard-sub-pause-${sub.subscription_id}`}>
              {sub.status === "paused" ? (<><PlayCircle className="mr-2 h-4 w-4" /> {t("dashboard.resume")}</>) : (<><PauseCircle className="mr-2 h-4 w-4" /> {t("dashboard.pause")}</>)}
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-cream p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t("dashboard.in_box")}</div>
          {(sub.items || []).length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("subscription.no_items")}</p>
          ) : (
            <ul className="space-y-2">
              {(sub.items || []).slice(0, 4).map((it) => {
                const p = productById[it.product_id];
                if (!p) return null;
                return (
                  <li key={it.product_id} className="flex items-center gap-2">
                    <img src={p.image_url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1"><div className="truncate text-xs font-medium">{localized(p, lang, "name")}</div></div>
                    <div className="tabular-nums text-xs text-[hsl(var(--muted-foreground))]">x{it.qty}</div>
                  </li>
                );
              })}
              {(sub.items || []).length > 4 && <li className="text-xs text-[hsl(var(--muted-foreground))]">+ {(sub.items || []).length - 4}</li>}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2 text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">{t("orders.subtotal")}</span>
            <span className="font-semibold tabular-nums">{formatPrice(subtotal, t)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [pets, setPets] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => { document.title = "SmartPaw — Dashboard"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, prods, pp, addrs, ords, ofs] = await Promise.all([
        api.get("/subscriptions"), api.get("/cabinet/products"), api.get("/pets"),
        api.get("/addresses"), api.get("/orders"), api.get("/cabinet/offers"),
      ]);
      setSubs(s.data); setProducts(prods.data); setPets(pp.data);
      setAddresses(addrs.data); setOrders(ords.data); setOffers(ofs.data);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.product_id, p])), [products]);
  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
  const activeSubs = useMemo(() => subs.filter((s) => s.status !== "cancelled").sort((a, b) => new Date(a.next_delivery_at || 0) - new Date(b.next_delivery_at || 0)), [subs]);

  const updateSub = (u) => setSubs((cur) => cur.map((s) => s.subscription_id === u.subscription_id ? u : s));

  return (
    <div data-testid="dashboard-page">
      <PageHeader title={`${t("dashboard.title")}, ${(user?.name || "").split(" ")[0] || ""}`} subtitle={t("dashboard.subtitle")} testIdPrefix="dashboard" />

      {/* Offers strip */}
      {offers.length > 0 && (
        <div className="mb-6" data-testid="dashboard-offers-strip">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Sparkles className="h-4 w-4 text-[hsl(var(--terracotta))]" />{t("dashboard.offers_strip_title")}</h2>
            <Button asChild variant="ghost" size="sm" className="text-[hsl(var(--primary))]" data-testid="dashboard-offers-see-all"><Link to="/cabinet/offers">{t("dashboard.offers_view_all")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {offers.slice(0, 4).map((o) => (
              <Link key={o.offer_id} to="/cabinet/offers" data-testid={`dashboard-offer-${o.offer_id}`} className="relative min-w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-paper transition-shadow hover:shadow-md">
                <div className="relative h-28 w-full overflow-hidden">
                  <img src={o.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <Badge className="absolute left-2 top-2 rounded-full bg-[hsl(var(--terracotta))] text-white">{o.badge}</Badge>
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-semibold">{localized(o, lang, "title")}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]"><Tag className="h-3 w-3" />{localized(o, lang, "savings_label")}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">{t("dashboard.your_subscriptions")}</h2>
        <Button asChild variant="ghost" size="sm" className="text-[hsl(var(--primary))]" data-testid="dashboard-subs-see-all"><Link to="/cabinet/subscriptions">{t("dashboard.see_all")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
      </div>
      {loading ? (
        <div className="space-y-4"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-44 rounded-2xl" /></div>
      ) : activeSubs.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-[hsl(var(--border))] bg-paper p-6 text-center" data-testid="dashboard-no-subs">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.no_subscription")}</p>
          <Button asChild className="mt-3 rounded-xl"><Link to="/cabinet/subscriptions">{t("dashboard.start_now")}</Link></Button>
        </div>
      ) : (
        <div className="mb-6 space-y-4" data-testid="dashboard-subs-list">
          {activeSubs.map((s, idx) => (
            <SubscriptionCard key={s.subscription_id} sub={s} productById={productById} onChange={updateSub} lang={lang} t={t} idx={idx} />
          ))}
        </div>
      )}

      {/* Quick cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <Card className="border-[hsl(var(--border))] bg-paper" data-testid="dashboard-pets-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="text-base">{t("dashboard.quick_pets")}</CardTitle>
            <Button asChild size="sm" variant="ghost" className="text-[hsl(var(--primary))]" data-testid="dashboard-pets-see-all"><Link to="/cabinet/pets">{t("dashboard.see_all")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <div className="flex flex-col items-start gap-2"><p className="text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.no_pets")}</p><Button asChild size="sm" className="rounded-xl"><Link to="/cabinet/pets"><Plus className="mr-2 h-4 w-4" />{t("dashboard.add_pet")}</Link></Button></div>
            ) : (
              <div className="space-y-3">{pets.slice(0, 3).map((p) => (
                <div key={p.pet_id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">{p.photo_url && <AvatarImage src={p.photo_url} alt={p.name} />}<AvatarFallback className="bg-[hsl(var(--secondary))] text-xs">{p.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{p.name}</div><div className="truncate text-xs text-[hsl(var(--muted-foreground))]">{t(`pets.${p.species}`)} • {p.breed || "—"}</div></div>
                </div>))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[hsl(var(--border))] bg-paper" data-testid="dashboard-address-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="text-base">{t("dashboard.quick_address")}</CardTitle>
            <Button asChild size="sm" variant="ghost" className="text-[hsl(var(--primary))]"><Link to="/cabinet/addresses">{t("dashboard.see_all")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent>
            {!defaultAddress ? (
              <div className="flex flex-col items-start gap-2"><p className="text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.no_addresses")}</p><Button asChild size="sm" className="rounded-xl"><Link to="/cabinet/addresses"><Plus className="mr-2 h-4 w-4" />{t("dashboard.add_address")}</Link></Button></div>
            ) : (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-[hsl(var(--terracotta))]" />
                <div className="min-w-0 text-sm">
                  <div className="font-medium">{defaultAddress.label} — {defaultAddress.recipient}</div>
                  <div className="text-[hsl(var(--muted-foreground))]">{defaultAddress.city}{defaultAddress.district ? `, ${defaultAddress.district}` : ""}</div>
                  <div className="text-[hsl(var(--muted-foreground))]">{defaultAddress.street}{defaultAddress.building ? `, ${defaultAddress.building}` : ""}{defaultAddress.apartment ? ` • ${defaultAddress.apartment}` : ""}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[hsl(var(--border))] bg-paper" data-testid="dashboard-orders-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="text-base">{t("dashboard.recent_orders")}</CardTitle>
            <Button asChild size="sm" variant="ghost" className="text-[hsl(var(--primary))]"><Link to="/cabinet/orders">{t("dashboard.see_all")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("dashboard.no_orders")}</p> : (
              <ul className="space-y-3">{orders.slice(0, 3).map((o) => (
                <li key={o.order_id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Receipt className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{o.invoice_no}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(o.created_at, lang)}</div></div>
                  <div className="tabular-nums text-sm font-medium">{formatPrice(o.total_gel, t)}</div>
                </li>))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
