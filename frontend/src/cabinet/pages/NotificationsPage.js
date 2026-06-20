import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function Row({ id, label, checked, onChange, testId }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-cream/60 px-4 py-3">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Switch id={id} checked={!!checked} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "SmartPaw — Notifications"; }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/notifications/prefs"); setPrefs(data); }
    catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      const payload = {
        email_enabled: !!next.email_enabled,
        sms_enabled: !!next.sms_enabled,
        whatsapp_enabled: !!next.whatsapp_enabled,
        delivery_reminders: !!next.delivery_reminders,
        low_stock_alerts: !!next.low_stock_alerts,
        marketing: !!next.marketing,
      };
      const { data } = await api.patch("/notifications/prefs", payload);
      setPrefs(data);
      toast.success(t("notifications.saved_toast"));
    } catch (e) { toast.error(formatApiError(e)); await load(); }
  };

  return (
    <div data-testid="notifications-page">
      <PageHeader title={t("notifications.title")} subtitle={t("notifications.subtitle")} testIdPrefix="notifications" />
      {loading || !prefs ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({length:2}).map((_,i)=><Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-[hsl(var(--border))] bg-paper">
            <CardHeader><CardTitle className="text-base">{t("notifications.channels")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row id="email" label={t("notifications.email_enabled")} checked={prefs.email_enabled} onChange={(v)=>update({email_enabled:v})} testId="notifications-email-switch" />
              <Row id="sms" label={t("notifications.sms_enabled")} checked={prefs.sms_enabled} onChange={(v)=>update({sms_enabled:v})} testId="notifications-sms-switch" />
              <Row id="whatsapp" label={t("notifications.whatsapp_enabled")} checked={prefs.whatsapp_enabled} onChange={(v)=>update({whatsapp_enabled:v})} testId="notifications-whatsapp-switch" />
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--border))] bg-paper">
            <CardHeader><CardTitle className="text-base">{t("notifications.types")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row id="reminders" label={t("notifications.delivery_reminders")} checked={prefs.delivery_reminders} onChange={(v)=>update({delivery_reminders:v})} testId="notifications-reminders-switch" />
              <Row id="stock" label={t("notifications.low_stock_alerts")} checked={prefs.low_stock_alerts} onChange={(v)=>update({low_stock_alerts:v})} testId="notifications-stock-switch" />
              <Row id="marketing" label={t("notifications.marketing")} checked={prefs.marketing} onChange={(v)=>update({marketing:v})} testId="notifications-marketing-switch" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
