import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '@/components/Hero';
import PartnersMarquee from '@/components/PartnersMarquee';
import WhySmartPaw from '@/components/WhySmartPaw';
import HowItWorks from '@/components/HowItWorks';
import { RegularProducts, SpecialOffers } from '@/components/ProductSections';
import TunedToPet from '@/components/TunedToPet';
import Blog from '@/components/Blog';
import Testimonials from '@/components/Testimonials';
import { useSignup } from '@/lib/SignupContext';
import { ROUTES } from '@/constants/routes';

export default function Home() {
  const { openSignup } = useSignup();
  const navigate = useNavigate();
  const goCatalogue = () => navigate(ROUTES.catalogue.path);
  const goSpecials = () => navigate(ROUTES.specials.path);

  return (
    <>
      <Hero onOpenSignup={openSignup} onBrowse={goCatalogue} onSpecials={goSpecials} />
      <PartnersMarquee />
      <WhySmartPaw onOpenSignup={openSignup} />
      <HowItWorks onOpenSignup={openSignup} />
      <RegularProducts onOpenSignup={openSignup} />
      <SpecialOffers onOpenSignup={openSignup} />
      <TunedToPet onOpenSignup={openSignup} />
      <Blog />
      <Testimonials />
    </>
  );
}
