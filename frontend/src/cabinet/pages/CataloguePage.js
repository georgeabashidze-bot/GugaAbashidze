import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n, localized } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CATEGORIES = ["all", "food", "hygiene", "vitamins"];

export default function CataloguePage() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerProduct, setPickerProduct] = useState(null);
  const [pickedSubId, setPickedSubId] = useState("");

  useEffect(() => { document.title = "SmartPaw — Catalogue"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, s] = await Promise.all([api.get("/cabinet/products"), api.get("/subscriptions")]);
      setProducts(prods.data);
      setSubs(s.data);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const activeSubs = useMemo(() => subs.filter((s) => s.status !== "cancelled"), [subs]);

  const inSubMap = useMemo(() => {
    const map = {};
    activeSubs.forEach((sub) => {
      (sub.items || []).forEach((it) => { map[it.product_id] = (map[it.product_id] || 0) + it.qty; });
    });
    return map;
  }, [activeSubs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const blob = `${p.name_en} ${p.name_ka} ${p.brand}`.toLowerCase();
      return blob.includes(q);
    });
  }, [products, category, search]);

  const startAdd = (product) => {
    if (activeSubs.length === 0) {
      toast.error(t("subscription.no_address_warning"));
      return;
    }
    if (activeSubs.length === 1) {
      addProductTo(product, activeSubs[0].subscription_id);
      return;
    }
    setPickerProduct(product);
    setPickedSubId(activeSubs[0].subscription_id);
    setPickerOpen(true);
  };

  const addProductTo = async (product, subscriptionId) => {
    if (busyId) return;
    setBusyId(product.product_id);
    try {
      const sub = subs.find((s) => s.subscription_id === subscriptionId);
      const existing = (sub?.items || []);
      const found = existing.find((it) => it.product_id === product.product_id);
      const nextItems = found
        ? existing.map((it) => it.product_id === product.product_id ? { ...it, qty: it.qty + 1 } : it)
        : [...existing, { product_id: product.product_id, qty: 1 }];
      const { data } = await api.patch(`/subscriptions/${subscriptionId}`, { items: nextItems });
      setSubs((cur) => cur.map((s) => s.subscription_id === subscriptionId ? data : s));
      toast.success(t("catalogue.added_toast"));
    } catch (e) { toast.error(formatApiError(e)); }
    setBusyId(null);
    setPickerOpen(false);
    setPickerProduct(null);
  };

  return (
    <div data-testid="catalogue-page">
      <PageHeader title={t("catalogue.title")} subtitle={t("catalogue.subtitle")} testIdPrefix="catalogue" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={category} onValueChange={setCategory} className="w-full sm:w-auto">
          <TabsList className="flex w-full bg-paper sm:w-auto" data-testid="catalogue-tabs">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} data-testid={`catalogue-tab-${c}`} className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">{t(`catalogue.${c}`)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("catalogue.search_placeholder")} data-testid="catalogue-search-input" className="h-11 rounded-xl pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-paper p-8 text-center text-sm text-[hsl(var(--muted-foreground))]" data-testid="catalogue-empty">{t("catalogue.no_results")}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const inBox = inSubMap[p.product_id];
            return (
              <motion.div key={p.product_id} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                <Card className="overflow-hidden border-[hsl(var(--border))] bg-paper" data-testid={`catalogue-card-${p.product_id}`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[hsl(var(--secondary))]">
                    <img src={p.image_url} alt={localized(p, lang, "name")} className="h-full w-full object-cover" loading="lazy" />
                    {inBox && <Badge className="absolute right-3 top-3 rounded-full bg-[rgba(169,184,154,0.95)] text-[hsl(var(--foreground))]" data-testid={`catalogue-inbox-${p.product_id}`}><Check className="mr-1 h-3 w-3" /> {t("catalogue.in_subscription")} × {inBox}</Badge>}
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div><div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{p.brand}</div>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{localized(p, lang, "name")}</h3></div>
                    <p className="line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">{localized(p, lang, "description")}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums">{p.price_gel.toFixed(2)} {t("common.currency")}</span>
                      <Badge variant="secondary" className="rounded-full text-[10px]">{t(`catalogue.suitable.${p.suitable_for}`)}</Badge>
                    </div>
                    <Button onClick={() => startAdd(p)} disabled={busyId === p.product_id || activeSubs.length === 0} className="h-10 w-full rounded-xl" data-testid={`catalogue-add-to-upcoming-button-${p.product_id}`}>
                      <Plus className="mr-2 h-4 w-4" /> {t("catalogue.add_to_upcoming")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent data-testid="catalogue-picker-dialog">
          <DialogHeader>
            <DialogTitle>{t("catalogue.choose_subscription")}</DialogTitle>
            <DialogDescription>{pickerProduct ? localized(pickerProduct, lang, "name") : ""}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={pickedSubId} onValueChange={setPickedSubId} className="space-y-2">
            {activeSubs.map((s, idx) => (
              <label key={s.subscription_id} htmlFor={`pick-sub-${s.subscription_id}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-cream px-3 py-3 hover:bg-[hsl(var(--muted))]">
                <RadioGroupItem id={`pick-sub-${s.subscription_id}`} value={s.subscription_id} data-testid={`catalogue-picker-option-${s.subscription_id}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{s.label || `${t("subscription.title")} #${idx + 1}`}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{t(`subscription.${s.frequency}`)} • {(s.items || []).length} {t("orders.items").toLowerCase()}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)} className="rounded-xl">{t("common.close")}</Button>
            <Button onClick={() => pickerProduct && addProductTo(pickerProduct, pickedSubId)} className="rounded-xl" data-testid="catalogue-picker-confirm">{t("catalogue.add_button")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
