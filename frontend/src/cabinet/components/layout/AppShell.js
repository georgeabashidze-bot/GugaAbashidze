import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Repeat, ShoppingBag, Sparkles, Cat, MapPin, Receipt, UserCircle2, BellRing, LogOut, Shield, ArrowLeft, Home } from "lucide-react";
import { useI18n } from "@/cabinet/i18n";
import { useAuth } from "@/cabinet/context/AuthContext";
import BrandMark from "./BrandMark";
import LanguageToggle from "./LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function NavItem({ to, icon: Icon, label, testId }) {
  return (
    <NavLink
      to={to}
      end
      data-testid={testId}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ` +
        (isActive
          ? "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-medium border-l-2 border-[hsl(var(--terracotta))] pl-[10px]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function MobileTab({ to, icon: Icon, label, testId }) {
  return (
    <NavLink
      to={to}
      end
      data-testid={testId}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] ` +
        (isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]")
      }
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  const { t, lang } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const backLabel = lang === "ka" ? "მთავარ გვერდზე დაბრუნება" : "Back to main site";

  const onLogout = async () => {
    await logout();
    navigate("/cabinet/login", { replace: true });
  };

  const initials = (user?.name || user?.email || "U").trim().slice(0, 2).toUpperCase();

  return (
    <div className="app-shell min-h-screen" data-testid="app-shell">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:inline">| {t("brand.tagline")}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              data-testid="cabinet-back-to-main-link"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-paper px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))] hover:border-[hsl(var(--terracotta))] hover:text-[hsl(var(--terracotta))] transition-colors"
              title={backLabel}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{backLabel}</span>
            </Link>
            <LanguageToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-full px-2 pr-3 hover:bg-[hsl(var(--muted))]" data-testid="account-menu">
                  <Avatar className="h-8 w-8">
                    {user?.picture && <AvatarImage src={user.picture} alt={user?.name || ""} />}
                    <AvatarFallback className="bg-[hsl(var(--secondary))] text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline max-w-[140px] truncate">{user?.name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")} data-testid="account-menu-back-to-main" className="md:hidden">
                  <Home className="mr-2 h-4 w-4" /> {backLabel}
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/cabinet/admin")} data-testid="account-menu-admin">
                    <Shield className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" /> Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/cabinet/profile")} data-testid="account-menu-profile">
                  <UserCircle2 className="mr-2 h-4 w-4" /> {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/cabinet/notifications")} data-testid="account-menu-notifications">
                  <BellRing className="mr-2 h-4 w-4" /> {t("nav.notifications")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="account-menu-logout" className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]">
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block" data-testid="app-sidebar">
          <nav className="sticky top-20 flex flex-col gap-1">
            <NavItem to="/cabinet/dashboard" icon={LayoutDashboard} label={t("nav.dashboard")} testId="sidebar-dashboard" />
            <NavItem to="/cabinet/subscriptions" icon={Repeat} label={t("nav.subscriptions")} testId="sidebar-subscription" />
            <NavItem to="/cabinet/catalogue" icon={ShoppingBag} label={t("nav.catalogue")} testId="sidebar-catalogue" />
            <NavItem to="/cabinet/offers" icon={Sparkles} label={t("nav.offers")} testId="sidebar-offers" />
            <NavItem to="/cabinet/pets" icon={Cat} label={t("nav.pets")} testId="sidebar-pets" />
            <NavItem to="/cabinet/orders" icon={Receipt} label={t("nav.orders")} testId="sidebar-orders" />
            <div className="my-2 h-px bg-[hsl(var(--border))]" />
            <NavItem to="/cabinet/addresses" icon={MapPin} label={t("nav.addresses")} testId="sidebar-addresses" />
            <NavItem to="/cabinet/profile" icon={UserCircle2} label={t("nav.profile")} testId="sidebar-profile" />
            <NavItem to="/cabinet/notifications" icon={BellRing} label={t("nav.notifications")} testId="sidebar-notifications" />
            <div className="my-2 h-px bg-[hsl(var(--border))]" />
            <Link
              to="/"
              data-testid="sidebar-back-to-main"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--terracotta))] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="truncate">{backLabel}</span>
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[hsl(var(--border))] bg-cream/95 backdrop-blur lg:hidden"
        data-testid="bottom-tab-bar"
      >
        <MobileTab to="/cabinet/dashboard" icon={LayoutDashboard} label={t("nav.dashboard")} testId="bottom-tab-dashboard" />
        <MobileTab to="/cabinet/subscriptions" icon={Repeat} label={t("nav.subscriptions")} testId="bottom-tab-subscription" />
        <MobileTab to="/cabinet/catalogue" icon={ShoppingBag} label={t("nav.catalogue")} testId="bottom-tab-catalogue" />
        <MobileTab to="/cabinet/offers" icon={Sparkles} label={t("nav.offers")} testId="bottom-tab-offers" />
        <MobileTab to="/cabinet/orders" icon={Receipt} label={t("nav.orders")} testId="bottom-tab-orders" />
      </nav>
    </div>
  );
}
