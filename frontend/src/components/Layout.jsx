import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import SignupModal from '@/components/SignupModal';
import { useSignup } from '@/lib/SignupContext';

export default function Layout() {
  const { open, openSignup, closeSignup } = useSignup();
  const { pathname, hash } = useLocation();

  // Scroll to top on route change (or to hash if present)
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div className="App relative overflow-x-clip">
      <Header onOpenSignup={openSignup} />
      <main>
        <Outlet context={{ openSignup }} />
      </main>
      <Footer onOpenSignup={openSignup} />
      <WhatsAppFab />
      <SignupModal open={open} onClose={closeSignup} />
    </div>
  );
}
