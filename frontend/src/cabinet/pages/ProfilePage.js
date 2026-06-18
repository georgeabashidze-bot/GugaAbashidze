import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/cabinet/i18n";
import { useAuth } from "@/cabinet/context/AuthContext";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function formatDate(iso, lang) {
  if (!iso) return "—";
  try { const d = new Date(iso); return d.toLocaleDateString(lang === "ka" ? "ka-GE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch (_) { return iso; }
}

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Profile"; }, []);

  useEffect(() => {
    setName(user?.name || ""); setPhone(user?.phone || "");
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", { name: name.trim(), phone: phone.trim() });
      setUser(data);
      toast.success(t("profile.saved_toast"));
    } catch (err) { toast.error(formatApiError(err)); }
    setSaving(false);
  };

  const initials = (user?.name || user?.email || "U").slice(0,2).toUpperCase();

  return (
    <div data-testid="profile-page">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} testIdPrefix="profile" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardHeader><CardTitle className="text-base">{t("profile.title")}</CardTitle></CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
              <div className="space-y-1.5"><Label>{t("profile.name")}</Label><Input value={name} onChange={(e)=>setName(e.target.value)} required data-testid="profile-name-input" className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label>{t("profile.email")}</Label><Input value={user?.email || ""} disabled className="h-11 rounded-xl bg-[hsl(var(--muted))]/40" data-testid="profile-email-input" /></div>
              <div className="space-y-1.5"><Label>{t("profile.phone")}</Label><Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+995..." data-testid="profile-phone-input" className="h-11 rounded-xl" /></div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl" data-testid="profile-save-button">{saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("profile.save")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--border))] bg-paper">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-20 w-20">
              {user?.picture && <AvatarImage src={user.picture} alt={user.name} />}
              <AvatarFallback className="bg-[hsl(var(--secondary))] text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</div>
            </div>
            <Badge variant="secondary" className="rounded-full" data-testid="profile-provider-badge">{t("profile.sign_in_method")}: {user?.provider || "email"}</Badge>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{t("profile.member_since")} {formatDate(user?.created_at, lang)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
