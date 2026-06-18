import React, { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { useI18n, localized } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function formatDate(iso, lang) {
  if (!iso) return "—";
  try { const d = new Date(iso); return d.toLocaleDateString(lang === "ka" ? "ka-GE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch (_) { return iso; }
}

export default function OrdersPage() {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { document.title = "SmartPaw — Orders"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([api.get("/orders"), api.get("/cabinet/products")]);
      setOrders(o.data); setProducts(p.data);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.product_id, p])), [products]);

  return (
    <div data-testid="orders-page">
      <PageHeader title={t("orders.title")} subtitle={t("orders.subtitle")} testIdPrefix="orders" />

      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed bg-paper" data-testid="orders-empty"><CardContent className="p-8 text-center"><Receipt className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" /><p className="text-sm text-[hsl(var(--muted-foreground))]">{t("orders.no_orders")}</p></CardContent></Card>
      ) : (
        <Card className="border-[hsl(var(--border))] bg-paper" data-testid="orders-table">
          <CardContent className="p-0">
            <ul className="divide-y divide-[hsl(var(--border))]">
              {orders.map((o) => (
                <li key={o.order_id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 sm:grid-cols-[1fr_140px_120px_auto] sm:items-center" data-testid={`orders-row-${o.order_id}`}>
                  <div>
                    <div className="font-medium">{o.invoice_no}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{(o.items || []).length} {t("orders.items")}</div>
                  </div>
                  <div className="hidden text-sm sm:block">{formatDate(o.created_at, lang)}</div>
                  <div className="hidden sm:block">
                    <Badge variant="secondary" className="rounded-full bg-[rgba(169,184,154,0.35)]">{t(`orders.${o.status}`)}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-semibold tabular-nums">{Number(o.total_gel).toFixed(2)} {t("common.currency")}</div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setSelected(o)} data-testid={`orders-view-${o.order_id}`}>{t("orders.view")}</Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-lg" data-testid="order-detail-panel">
                        <SheetHeader><SheetTitle className="font-serif text-2xl">{t("orders.invoice")} {selected?.invoice_no || o.invoice_no}</SheetTitle></SheetHeader>
                        {(() => { const od = selected || o; return (
                          <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[hsl(var(--muted-foreground))]">{t("orders.date")}</span>
                              <span className="font-medium">{formatDate(od.created_at, lang)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[hsl(var(--muted-foreground))]">{t("orders.status")}</span>
                              <Badge variant="secondary" className="rounded-full bg-[rgba(169,184,154,0.35)]">{t(`orders.${od.status}`)}</Badge>
                            </div>
                            {od.delivery_address_snapshot && (
                              <div className="rounded-xl bg-cream p-3 text-sm">
                                <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t("orders.delivery_to")}</div>
                                <div className="mt-1">{od.delivery_address_snapshot.recipient}</div>
                                <div className="text-[hsl(var(--muted-foreground))]">{od.delivery_address_snapshot.street}, {od.delivery_address_snapshot.city}</div>
                              </div>
                            )}
                            <ul className="divide-y divide-[hsl(var(--border))]">
                              {(od.items || []).map((it) => {
                                const p = productById[it.product_id];
                                return (
                                  <li key={it.product_id} className="flex items-center gap-3 py-3">
                                    {p && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-sm font-medium">{p ? localized(p, lang, "name") : it.product_id}</div>
                                      <div className="text-xs text-[hsl(var(--muted-foreground))]">{p?.brand}</div>
                                    </div>
                                    <div className="tabular-nums text-sm">{t("orders.qty_short")}{it.qty}</div>
                                    <div className="tabular-nums text-sm font-medium">{p ? (p.price_gel * it.qty).toFixed(2) : "—"} {t("common.currency")}</div>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="space-y-1 border-t border-[hsl(var(--border))] pt-3 text-sm">
                              <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">{t("orders.subtotal")}</span><span className="tabular-nums">{Number(od.subtotal_gel).toFixed(2)} {t("common.currency")}</span></div>
                              <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">{t("orders.delivery_fee")}</span><span>{od.delivery_fee_gel > 0 ? `${Number(od.delivery_fee_gel).toFixed(2)} ${t("common.currency")}` : t("orders.free")}</span></div>
                              <div className="flex justify-between text-base font-semibold"><span>{t("orders.total")}</span><span className="tabular-nums">{Number(od.total_gel).toFixed(2)} {t("common.currency")}</span></div>
                            </div>
                          </div>
                        ); })()}
                      </SheetContent>
                    </Sheet>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
