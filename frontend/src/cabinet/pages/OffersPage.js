import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { useI18n, localized } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const COLOR_BG = {
  terracotta: "bg-[rgba(200,106,74,0.10)] border-[rgba(200,106,74,0.32)]",
  sage: "bg-[rgba(141,165,124,0.16)] border-[rgba(141,165,124,0.42)]",
  cocoa: "bg-[rgba(74,53,40,0.08)] border-[rgba(74,53,40,0.24)]",
  sand: "bg-[rgba(232,220,200,0.7)] border-[hsl(var(--border))]",
};
const COLOR_BADGE = {
  terracotta: "bg-[hsl(var(--terracotta))] text-white",
  sage: "bg-[hsl(var(--sage))] text-[hsl(var(--foreground))]",
  cocoa: "bg-[hsl(var(--cocoa))] text-white",
  sand: "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]",
};

export default function OffersPage() {
  const { t, lang } = useI18n();
  const [offers, setOffers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chooseOpen, setChooseOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [pickedSubId, setPickedSubId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Offers"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([api.get("/cabinet/offers"), api.get("/subscriptions")]);
      setOffers(o.data); setSubs(s.data);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const eligibleSubs = useMemo(() => subs.filter((s) => s.status !== "cancelled"), [subs]);

  const startAdd = (offer) => {
    if (eligibleSubs.length === 0) {
      toast.error(t("subscription.no_address_warning"));
      return;
    }
    setActiveOffer(offer);
    setPickedSubId(eligibleSubs[0].subscription_id);
    setChooseOpen(true);
  };

  const applyOffer = async () => {
    if (!activeOffer || !pickedSubId || busy) return;
    setBusy(true);
    try {
      await api.post(`/subscriptions/${pickedSubId}/add-offer/${activeOffer.offer_id}`);
      toast.success(t("offers.applied_toast"));
      setChooseOpen(false);
      setActiveOffer(null);
      await load();
    } catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };

  return (
    <div data-testid="offers-page">
      <PageHeader title={t("offers.title")} subtitle={t("offers.subtitle")} testIdPrefix="offers" />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
      ) : offers.length === 0 ? (
        <Card className="border-dashed bg-paper" data-testid="offers-empty">
          <CardContent className="p-8 text-center"><Sparkles className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" /><p className="text-sm text-[hsl(var(--muted-foreground))]">{t("offers.no_offers")}</p></CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {offers.map((o) => (
            <motion.div key={o.offer_id} whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
              <Card className={`overflow-hidden border ${COLOR_BG[o.color] || COLOR_BG.sand}`} data-testid={`offer-card-${o.offer_id}`}>
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img src={o.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <Badge className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-semibold ${COLOR_BADGE[o.color] || COLOR_BADGE.sand}`} data-testid={`offer-badge-${o.offer_id}`}>{o.badge}</Badge>
                  <Badge className="absolute right-3 top-3 rounded-full bg-white/90 text-[hsl(var(--foreground))]"><Tag className="mr-1 h-3 w-3" />{localized(o, lang, "savings_label")}</Badge>
                </div>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <h3 className="font-serif text-xl font-semibold leading-tight">{localized(o, lang, "title")}</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{localized(o, lang, "description")}</p>
                  </div>
                  {o.items?.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t("offers.includes")}</div>
                      <ul className="flex flex-wrap gap-2">
                        {o.items.map((it) => (
                          <li key={it.product_id} className="flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-1 text-xs">
                            <img src={it.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                            <span className="truncate max-w-[160px]">{localized(it, lang, "name")}</span>
                            <span className="text-[hsl(var(--muted-foreground))]">x{it.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button onClick={() => startAdd(o)} disabled={eligibleSubs.length === 0} className="h-11 w-full rounded-xl" data-testid={`offer-add-button-${o.offer_id}`}>
                    <Plus className="mr-2 h-4 w-4" />{t("offers.add_to_box")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={chooseOpen} onOpenChange={setChooseOpen}>
        <DialogContent data-testid="offers-choose-dialog">
          <DialogHeader>
            <DialogTitle>{t("offers.add_to_subscription")}</DialogTitle>
            <DialogDescription>{activeOffer ? localized(activeOffer, lang, "title") : ""}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={pickedSubId} onValueChange={setPickedSubId} className="space-y-2">
            {eligibleSubs.map((s) => (
              <label key={s.subscription_id} htmlFor={`sub-${s.subscription_id}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-cream px-3 py-3 hover:bg-[hsl(var(--muted))]">
                <RadioGroupItem id={`sub-${s.subscription_id}`} value={s.subscription_id} data-testid={`offers-sub-option-${s.subscription_id}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{s.label || `Subscription`}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{t(`subscription.${s.frequency}`)} • {s.items?.length || 0} {t("orders.items").toLowerCase()}</div>
                </div>
                <Badge variant="secondary" className="rounded-full">{t(`subscription.status.${s.status}`)}</Badge>
              </label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChooseOpen(false)} className="rounded-xl" data-testid="offers-choose-cancel">{t("common.close")}</Button>
            <Button onClick={applyOffer} disabled={busy || !pickedSubId} className="rounded-xl" data-testid="offers-choose-confirm">{t("catalogue.add_button")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
