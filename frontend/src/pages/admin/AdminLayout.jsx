import React from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Mail,
  Users,
  LogOut,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, tid: 'admin-nav-dashboard' },
  { to: '/admin/products', label: 'Products', icon: Package, tid: 'admin-nav-products' },
  { to: '/admin/special-offers', label: 'Special Offers', icon: Tag, tid: 'admin-nav-offers' },
  { to: '/admin/leads', label: 'Leads', icon: Users, tid: 'admin-nav-leads' },
  { to: '/admin/contact-inquiries', label: 'Contacts', icon: Mail, tid: 'admin-nav-contacts' },
];

export default function AdminLayout() {
  const { user, status, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
      </div>
    );
  }
  if (status === 'guest') return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#FDFBF7] text-[#05223D]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#05223D] text-white flex flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#F25C05] font-bold">SmartPaw</p>
          <h1 className="font-display font-extrabold text-xl tracking-tight mt-1">
            Admin <span className="text-[#F25C05]">Panel</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={item.tid}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#F25C05] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <ExternalLink size={14} />
            View public site
          </a>
          <div className="px-3.5 py-2 text-[11px] text-white/50 truncate">
            {user?.email}
          </div>
          <button
            data-testid="admin-logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-red-500/20 transition"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
