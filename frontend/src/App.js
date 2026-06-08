import React, { useState } from 'react';
import '@/App.css';
import { LangProvider } from '@/lib/LangContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PartnersMarquee from '@/components/PartnersMarquee';
import WhySmartPaw from '@/components/WhySmartPaw';
import HowItWorks from '@/components/HowItWorks';
import { RegularProducts, SpecialOffers } from '@/components/ProductSections';
import TunedToPet from '@/components/TunedToPet';
import Blog from '@/components/Blog';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import SignupModal from '@/components/SignupModal';

function App() {
  const [signupOpen, setSignupOpen] = useState(false);

  const openSignup = () => setSignupOpen(true);
  const closeSignup = () => setSignupOpen(false);
  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LangProvider>
      <div className="App relative overflow-x-clip">
        <Header onOpenSignup={openSignup} />
        <main>
          <Hero onOpenSignup={openSignup} onBrowse={scrollToCatalogue} />
          <PartnersMarquee />
          <WhySmartPaw onOpenSignup={openSignup} />
          <HowItWorks onOpenSignup={openSignup} />
          <RegularProducts onOpenSignup={openSignup} />
          <SpecialOffers onOpenSignup={openSignup} />
          <TunedToPet onOpenSignup={openSignup} />
          <Blog />
          <Testimonials />
        </main>
        <Footer onOpenSignup={openSignup} />
        <WhatsAppFab />
        <SignupModal open={signupOpen} onClose={closeSignup} />
      </div>
    </LangProvider>
  );
}

export default App;
