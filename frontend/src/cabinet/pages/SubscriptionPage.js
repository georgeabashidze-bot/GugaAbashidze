import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, PauseCircle, PlayCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useI18n, localized } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function SubscriptionEditor({ sub, products, addresses, onChange, onDelete }) {
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState({
    label: sub.label || "", frequency: sub.frequency, delivery_address_id: sub.delivery_address_id || "",
    next_delivery_at: sub.next_delivery_at ? sub.next_delivery_at.slice(0, 10) : "",
    items: [...(sub.items || [])],
    payment_method: sub.payment_method || "bank_transfer",
  });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft({
      label: sub.label || "", frequency: sub.frequency, delivery_address_id: sub.delivery_address_id || "",
      next_delivery_at: sub.next_delivery_at ? sub.next_delivery_at.slice(0, 10) : "",
      items: [...(sub.items || [])],
      payment_method: sub.payment_method || "bank_transfer",
    });
  }, [sub]);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.product_id, p])), [products]);
  const subtotal = useMemo(() => draft.items.reduce((s, it) => s + (productById[it.product_id]?.price_gel || 0) * it.qty, 0), [draft.items, productById]);

  const setQty = (productId, qty) => {
    const q = Math.max(0, Math.min(20, Math.round(qty || 0)));
    setDraft((d) => ({ ...d, items: d.items.map((it) => it.product_id === productId ? { ...it, qty: q } : it).filter((it) => it.qty > 0) }));
  };
  const removeItem = (productId) => setDraft((d) => ({ ...d, items: d.items.filter((it) => it.product_id !== productId) }));

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        frequency: draft.frequency,
        delivery_address_id: draft.delivery_address_id || null,
        items: draft.items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
        label: draft.label || null,
        payment_method: draft.payment_method || "bank_transfer",
      };
      if (draft.next_delivery_at) payload.next_delivery_at = new Date(draft.next_delivery_at + "T09:00:00Z").toISOString();
      const { data } = await api.patch(`/subscriptions/${sub.subscription_id}`, payload);
      onChange(data);
      toast.success(t("subscription.saved_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
    setSaving(false);
  };

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

  const cancelSub = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/subscriptions/${sub.subscription_id}/cancel`);
      onChange(data);
      toast.success(t("subscription.cancelled_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]" data-testid={`subscription-editor-${sub.subscription_id}`}>
      <div className="space-y-5">
        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{draft.label || t("subscription.title")}</CardTitle>
            <Badge variant="secondary" data-testid={`subscription-status-${sub.subscription_id}`} className="rounded-full">{t(`subscription.status.${sub.status}`)}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><label className="text-sm font-medium">{t("subscription.name_label")}</label>
                <Input value={draft.label} onChange={(e)=>setDraft({...draft,label:e.target.value})} placeholder={t("wizard.label_placeholder")} data-testid={`subscription-name-input-${sub.subscription_id}`} className="h-10 rounded-xl" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">{t("subscription.frequency")}</label>
                <Select value={draft.frequency} onValueChange={(v)=>setDraft({...draft,frequency:v})}>
                  <SelectTrigger className="h-10 rounded-xl" data-testid={`subscription-frequency-select-${sub.subscription_id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t("subscription.weekly")}</SelectItem>
                    <SelectItem value="biweekly">{t("subscription.biweekly")}</SelectItem>
                    <SelectItem value="monthly">{t("subscription.monthly")}</SelectItem>
                  </SelectContent>
                </Select></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">{t("subscription.delivery_address")}</label>
                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-2 text-xs text-[hsl(var(--muted-foreground))]">{t("subscription.no_address_warning")} <Link to="/cabinet/addresses" className="font-medium text-[hsl(var(--primary))] hover:underline">{t("addresses.add")}</Link></div>
                ) : (
                  <Select value={draft.delivery_address_id} onValueChange={(v)=>setDraft({...draft,delivery_address_id:v})}>
                    <SelectTrigger className="h-10 rounded-xl" data-testid={`subscription-address-select-${sub.subscription_id}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{addresses.map((a) => <SelectItem key={a.address_id} value={a.address_id}>{a.label} — {a.street}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5"><label className="text-sm font-medium">{t("subscription.next_delivery")}</label>
                <Input type="date" value={draft.next_delivery_at} onChange={(e)=>setDraft({...draft,next_delivery_at:e.target.value})} data-testid={`subscription-date-input-${sub.subscription_id}`} className="h-10 rounded-xl" /></div>
              <div className="space-y-1.5 sm:col-span-2"><label className="text-sm font-medium">{t("payment.title")}</label>
                <Select value={draft.payment_method} onValueChange={(v)=>setDraft({...draft,payment_method:v})}>
                  <SelectTrigger className="h-10 rounded-xl" data-testid={`subscription-payment-select-${sub.subscription_id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer" data-testid={`subscription-payment-bank-${sub.subscription_id}`}>{t("payment.bank_transfer")}</SelectItem>
                    <SelectItem value="cash_on_delivery" data-testid={`subscription-payment-cash-${sub.subscription_id}`}>{t("payment.cash_on_delivery")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("subscription.items")}</CardTitle>
            <Button asChild variant="outline" size="sm" className="rounded-xl" data-testid={`subscription-add-more-button-${sub.subscription_id}`}><Link to="/cabinet/catalogue"><Plus className="mr-2 h-4 w-4" />{t("subscription.add_more")}</Link></Button>
          </CardHeader>
          <CardContent>
            {draft.items.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("subscription.no_items")}</p>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {draft.items.map((it) => {
                  const p = productById[it.product_id];
                  if (!p) return null;
                  return (
                    <li key={it.product_id} className="flex items-center gap-3 py-3" data-testid={`subscription-item-${sub.subscription_id}-${it.product_id}`}>
                      <img src={p.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{localized(p, lang, "name")}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{p.brand} • {p.price_gel.toFixed(2)} {t("common.currency")}</div>
                      </div>
                      <Input type="number" min={0} max={20} value={it.qty} onChange={(e) => setQty(it.product_id, parseInt(e.target.value, 10))} data-testid={`subscription-item-qty-${sub.subscription_id}-${it.product_id}`} className="h-9 w-16 rounded-xl tabular-nums" />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(it.product_id)} className="text-[hsl(var(--destructive))]" data-testid={`subscription-item-remove-${sub.subscription_id}-${it.product_id}`}><Trash2 className="h-4 w-4" /></Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardHeader><CardTitle className="text-base">{t("orders.subtotal")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-[hsl(var(--muted-foreground))]">{t("orders.subtotal")}</span><span className="font-medium tabular-nums">{subtotal.toFixed(2)} {t("common.currency")}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-[hsl(var(--muted-foreground))]">{t("orders.delivery_fee")}</span><span className="font-medium">{t("orders.free")}</span></div>
            <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-base"><span className="font-semibold">{t("orders.total")}</span><span className="font-semibold tabular-nums">{subtotal.toFixed(2)} {t("common.currency")}</span></div>
            <Button onClick={save} disabled={saving} className="mt-2 h-11 w-full rounded-xl" data-testid={`subscription-save-button-${sub.subscription_id}`}>
              {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("subscription.save")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardContent className="space-y-3 p-5">
            {sub.status === "paused" ? (
              <Button onClick={togglePause} disabled={busy} variant="outline" className="h-11 w-full rounded-xl" data-testid={`subscription-resume-button-${sub.subscription_id}`}><PlayCircle className="mr-2 h-4 w-4" />{t("subscription.resume")}</Button>
            ) : sub.status === "active" ? (
              <Button onClick={togglePause} disabled={busy} variant="outline" className="h-11 w-full rounded-xl" data-testid={`subscription-pause-button-${sub.subscription_id}`}><PauseCircle className="mr-2 h-4 w-4" />{t("subscription.pause")}</Button>
            ) : null}
            {sub.status !== "cancelled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-11 w-full rounded-xl border-[hsl(var(--destructive))]/40 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/5" data-testid={`subscription-cancel-button-${sub.subscription_id}`}>{t("subscription.cancel")}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>{t("subscription.cancel_confirm_title")}</AlertDialogTitle><AlertDialogDescription>{t("subscription.cancel_confirm_text")}</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid={`subscription-cancel-back-${sub.subscription_id}`}>{t("subscription.cancel_back")}</AlertDialogCancel>
                    <AlertDialogAction onClick={cancelSub} className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90" data-testid={`subscription-cancel-confirm-${sub.subscription_id}`}>{t("subscription.cancel_confirm_ok")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="h-11 w-full rounded-xl text-[hsl(var(--destructive))]" data-testid={`subscription-delete-button-${sub.subscription_id}`}><X className="mr-2 h-4 w-4" />{t("subscription.delete")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>{t("subscription.delete_confirm_title")}</AlertDialogTitle><AlertDialogDescription>{t("subscription.delete_confirm_text")}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("subscription.cancel_back")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90" data-testid={`subscription-delete-confirm-${sub.subscription_id}`}>{t("subscription.delete")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { t } = useI18n();
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Subscriptions"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, a] = await Promise.all([api.get("/subscriptions"), api.get("/cabinet/products"), api.get("/addresses")]);
      setSubs(s.data); setProducts(p.data); setAddresses(a.data);
      if (s.data.length > 0 && !active) setActive(s.data[0].subscription_id);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visibleSubs = useMemo(() => subs.filter((s) => s.status !== "cancelled" || subs.length === 1), [subs]);
  const activeCount = subs.filter((s) => s.status !== "cancelled").length;

  const addSub = async () => {
    if (adding || activeCount >= 3) return;
    setAdding(true);
    try {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      const { data } = await api.post("/subscriptions", { frequency: "biweekly", items: [], delivery_address_id: defaultAddr?.address_id || null, label: "" });
      setSubs((cur) => [...cur, data]); setActive(data.subscription_id);
      toast.success(t("subscription.saved_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
    setAdding(false);
  };

  const updateSub = (updated) => setSubs((cur) => cur.map((s) => s.subscription_id === updated.subscription_id ? updated : s));
  const deleteSub = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      const next = subs.filter((s) => s.subscription_id !== id);
      setSubs(next); if (next.length > 0) setActive(next[0].subscription_id);
      toast.success(t("subscription.deleted_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid="subscription-page">
      <PageHeader
        title={t("subscription.title")} subtitle={t("subscription.subtitle")} testIdPrefix="subscription"
        action={(
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">{activeCount}/3</Badge>
            <Button onClick={addSub} disabled={adding || activeCount >= 3} className="rounded-xl" data-testid="subscription-add-new-button"><Plus className="mr-2 h-4 w-4" />{t("subscription.add_new")}</Button>
          </div>
        )}
      />
      {activeCount >= 3 && <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))]">{t("subscription.max_reached")}</p>}

      {loading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : visibleSubs.length === 0 ? (
        <Card className="border-dashed bg-paper" data-testid="subscription-empty">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("subscription.no_items")}</p>
            <Button onClick={addSub} className="rounded-xl"><Plus className="mr-2 h-4 w-4" />{t("subscription.add_new")}</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-5 flex flex-wrap bg-paper" data-testid="subscription-tabs">
            {visibleSubs.map((s, idx) => (
              <TabsTrigger key={s.subscription_id} value={s.subscription_id} data-testid={`subscription-tab-${s.subscription_id}`} className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">
                {s.label || `${t("subscription.title")} #${idx + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleSubs.map((s) => (
            <TabsContent key={s.subscription_id} value={s.subscription_id}>
              <SubscriptionEditor
                sub={s}
                products={products}
                addresses={addresses}
                onChange={updateSub}
                onDelete={() => deleteSub(s.subscription_id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
