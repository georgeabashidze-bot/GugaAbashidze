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
import SeoMeta, { organizationJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';
import { ROUTES } from '@/constants/routes';

export default function Home() {
  const { openSignup } = useSignup();
  const navigate = useNavigate();
  const goCatalogue = () => navigate(ROUTES.catalogue.path);
  const goSpecials = () => navigate(ROUTES.specials.path);

  return (
    <>
      <SeoMeta
        title="Smart pet food, delivered."
        description="SmartPaw Food — a Tbilisi subscription that keeps your dog or cat’s shelf stocked. Vet-aligned brands, free SmartPaw Feeder, free door-to-door delivery."
        jsonLd={organizationJsonLd()}
      />
      <Hero onOpenSignup={openSignup} onBrowse={goCatalogue} onSpecials={goSpecials} />
      <PartnersMarquee />
      <HowItWorks onOpenSignup={openSignup} />
      <RegularProducts onOpenSignup={openSignup} />
      <SpecialOffers onOpenSignup={openSignup} />
      <TunedToPet onOpenSignup={openSignup} />
      <WhySmartPaw onOpenSignup={openSignup} />
      <Blog />
      <Testimonials />
    </>
  );
}
