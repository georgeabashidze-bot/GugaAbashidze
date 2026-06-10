import React from 'react';
import PageShell from '@/components/PageShell';
import HowItWorks from '@/components/HowItWorks';
import WhySmartPaw from '@/components/WhySmartPaw';
import { useSignup } from '@/lib/SignupContext';

export default function HowItWorksPage() {
  const { openSignup } = useSignup();
  return (
    <>
      <PageShell
        eyebrow="How It Works"
        title="Sign up, sit back."
        intro="A subscription that keeps your pet’s shelf stocked. Pick the brands once, set your cadence — we deliver on schedule. Pause or cancel any time."
        image="https://images.pexels.com/photos/35620584/pexels-photo-35620584.jpeg?auto=compress&cs=tinysrgb&w=1400"
        imageAlt="Happy dog with owner"
      />
      <HowItWorks onOpenSignup={openSignup} />
      <WhySmartPaw onOpenSignup={openSignup} />
    </>
  );
}
