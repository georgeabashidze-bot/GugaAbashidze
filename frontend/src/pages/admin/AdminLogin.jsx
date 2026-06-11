import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuthContext';

export default function AdminLogin() {
  const { login, status } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authed') return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message?.replace(/^\d+:\s*/, '') || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A4D8C] grain text-white flex items-center justify-center px-5">
      <form
        onSubmit={submit}
        data-testid="admin-login-form"
        className="w-full max-w-md bg-white text-[#05223D] rounded-3xl p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#F25C05]/15 text-[#F25C05] flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">SmartPaw Food</p>
            <h1 className="font-display font-extrabold text-2xl tracking-tight">Admin sign-in</h1>
          </div>
        </div>

        <p className="text-sm text-[#465B70] mb-6">
          Enter your admin credentials to manage products, special offers, plans, blog and leads.
        </p>

        <label className="block">
          <span className="text-xs font-bold tracking-wider uppercase text-[#465B70]">Email</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#0A4D8C26] px-3 py-2.5 focus-within:border-[#0A4D8C] focus-within:ring-2 focus-within:ring-[#F25C05]/20 transition">
            <Mail size={16} className="text-[#465B70]" />
            <input
              data-testid="admin-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
              placeholder="admin@smartpawfood.com"
            />
          </div>
        </label>

        <label className="block mt-4">
          <span className="text-xs font-bold tracking-wider uppercase text-[#465B70]">Password</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#0A4D8C26] px-3 py-2.5 focus-within:border-[#0A4D8C] focus-within:ring-2 focus-within:ring-[#F25C05]/20 transition">
            <Lock size={16} className="text-[#465B70]" />
            <input
              data-testid="admin-login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
              placeholder="••••••••"
            />
          </div>
        </label>

        {error && (
          <div
            data-testid="admin-login-error"
            className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-800 px-3 py-2.5 text-sm"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          data-testid="admin-login-submit"
          type="submit"
          disabled={busy}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white font-bold text-sm py-3.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-5 text-[11px] text-[#465B70] text-center">
          Forgot password? Reset from your server config — single-admin panel.
        </p>
      </form>
    </div>
  );
}
