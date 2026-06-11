import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Users, Mail, ArrowUpRight, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

function StatCard({ to, icon: Icon, label, value, accent = 'orange' }) {
  const colors = {
    orange: 'from-[#F25C05] to-[#FF8A3D]',
    blue: 'from-[#0A4D8C] to-[#1E78C8]',
  };
  return (
    <Link
      to={to}
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="group relative overflow-hidden card-soft p-6 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all"
    >
      <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-br ${colors[accent]} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase font-bold text-[#465B70]">{label}</p>
          <p className="font-display font-extrabold text-4xl mt-2 tracking-tight">
            {value === null ? <Loader2 className="w-7 h-7 animate-spin text-[#F25C05]" /> : value}
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#F25C05]/10 text-[#F25C05] flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-[#0A4D8C] font-bold text-sm group-hover:text-[#F25C05] transition">
        Manage <ArrowUpRight size={14} />
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ products: null, offers: null, leads: null, contacts: null });
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, o, l, c] = await Promise.all([
          adminApi.listProducts(),
          adminApi.listOffers(),
          adminApi.listLeads(),
          adminApi.listContacts(),
        ]);
        if (!alive) return;
        setCounts({ products: p.length, offers: o.length, leads: l.length, contacts: c.length });
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Dashboard</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          Welcome back.
        </h1>
        <p className="text-[#465B70] mt-2 max-w-xl">
          A quick pulse of your storefront — products on the shelf, live offers, and recent customer activity.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard to="/admin/products" icon={Package} label="Products" value={counts.products} accent="orange" />
        <StatCard to="/admin/special-offers" icon={Tag} label="Special Offers" value={counts.offers} accent="blue" />
        <StatCard to="/admin/leads" icon={Users} label="Leads" value={counts.leads} accent="orange" />
        <StatCard to="/admin/contact-inquiries" icon={Mail} label="Contacts" value={counts.contacts} accent="blue" />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/admin/products/new"
          className="card-soft p-6 hover:-translate-y-1 transition-all"
          data-testid="quick-new-product"
        >
          <Package size={22} className="text-[#F25C05]" />
          <h3 className="font-display font-bold text-xl mt-3">Add a new product</h3>
          <p className="text-sm text-[#465B70] mt-1">Catalogue or Specials — bilingual fields, image upload, instant publish.</p>
        </Link>
        <Link
          to="/admin/special-offers/new"
          className="card-soft p-6 hover:-translate-y-1 transition-all"
          data-testid="quick-new-offer"
        >
          <Tag size={22} className="text-[#0A4D8C]" />
          <h3 className="font-display font-bold text-xl mt-3">Create a special offer</h3>
          <p className="text-sm text-[#465B70] mt-1">Set discount, dates, sub-category and link to a product.</p>
        </Link>
      </div>
    </div>
  );
}
