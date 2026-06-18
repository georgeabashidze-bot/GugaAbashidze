import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useI18n } from "@/cabinet/i18n";
import { useAuth } from "@/cabinet/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BrandMark from "@/cabinet/components/layout/BrandMark";
import LanguageToggle from "@/cabinet/components/layout/LanguageToggle";

const HERO_IMG = "https://images.pexels.com/photos/30769356/pexels-photo-30769356.jpeg?auto=compress&cs=tinysrgb&w=1600";

export default function RegisterPage() {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { document.title = "SmartPaw — Register"; }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    const r = await register({ name: name.trim(), email: email.trim(), password });
    setSubmitting(false);
    if (r.ok) navigate("/cabinet/dashboard", { replace: true });
    else setError(r.error);
  };

  const onGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/cabinet/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="register-page">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <img src={HERO_IMG} alt="Pet routine" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,33,26,0.55)] via-[rgba(43,33,26,0.18)] to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <BrandMark />
            <h2 className="font-serif text-3xl font-semibold leading-tight drop-shadow-md">
              {t("auth.register_subtitle")}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.32 } }}
            className="w-full max-w-md"
          >
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <BrandMark />
              <LanguageToggle testId="register-language-toggle-mobile" />
            </div>
            <div className="mb-6 hidden items-center justify-end lg:flex">
              <LanguageToggle testId="register-language-toggle" />
            </div>
            <Card className="border-[hsl(var(--border))] bg-paper shadow-[0_14px_34px_rgba(43,33,26,0.10)]">
              <CardHeader className="space-y-1">
                <CardTitle className="font-serif text-2xl">{t("auth.create_account")}</CardTitle>
                <CardDescription>{t("auth.register_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogle}
                  data-testid="register-google-button"
                  className="h-11 w-full rounded-xl border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.4-4.5 3.4-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.6 0 2.6.7 3.2 1.2l2.2-2.1C16 5.6 14.2 5 12 5 7.6 5 4 8.6 4 13s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5-.1-.9-.1-1.2H12z"/>
                  </svg>
                  {t("auth.continue_with_google")}
                </Button>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-3 text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {t("auth.or_continue_with")}
                  </span>
                </div>
                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t("auth.name")}</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} data-testid="register-name-input" className="h-11 rounded-xl pl-10" required minLength={1} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="register-email-input" className="h-11 rounded-xl pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="register-password-input" className="h-11 rounded-xl pl-10" minLength={6} required />
                    </div>
                  </div>
                  {error && <div className="rounded-xl border border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5 px-3 py-2 text-sm text-[hsl(var(--destructive))]" data-testid="register-error">{error}</div>}
                  <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl" data-testid="register-submit-button">
                    {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.submitting")}</>) : t("auth.sign_up")}
                  </Button>
                </form>
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                  {t("auth.have_account")} {" "}
                  <Link to="/cabinet/login" data-testid="register-go-login" className="font-medium text-[hsl(var(--primary))] hover:underline">{t("auth.sign_in_now")}</Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
