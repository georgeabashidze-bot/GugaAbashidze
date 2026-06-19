import React from 'react';
import SubCategoryPage from '@/components/SubCategoryPage';
import PartnerCategoryPage from '@/components/PartnerCategoryPage';
import { PARTNER_BRANDS } from '@/data/partnerBrands';

// ──────────────────────────────────────────────────────────────────────
// Food / Hygiene / Vitamins:
//   While the SmartPaw product catalogue is being populated, these three
//   pages show a curated partner-brand grid (links open in a new tab) instead
//   of an empty product list. When real products are ready, flip
//   PARTNER_BRANDS.<category>.useBrandGrid to false and the page falls back
//   to <SubCategoryPage>.
// ──────────────────────────────────────────────────────────────────────

const FOOD_HERO = {
  eyebrow: { en: 'Catalogue · Food', ka: 'კატალოგი · საკვები' },
  title: {
    en: 'Food that fuels routine, not surprises.',
    ka: 'საკვები, რომელიც რეჟიმს კვებავს — და არა ნერვებს.',
  },
  intro: {
    en: 'Dry kibble, wet food, treats and prescription diets — sized to your pet, delivered before you run out.',
    ka: 'მშრალი საკვები, სველი საკვები, წახემსები და სამედიცინო რაციონები — შენი ცხოველის ზომაზე, მიწოდება შენი მარაგის გათავებამდე.',
  },
  image: 'https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1400',
  imageAlt: { en: 'Dog eating dry kibble from a bowl', ka: 'ძაღლი ჭამს მშრალ საკვებს თასიდან' },
};

const HYGIENE_HERO = {
  eyebrow: { en: 'Catalogue · Hygiene', ka: 'კატალოგი · ჰიგიენა' },
  title: {
    en: 'Clean coat, clean home, quietly handled.',
    ka: 'სუფთა ბეწვი, სუფთა სახლი — შეუმჩნევლად.',
  },
  intro: {
    en: 'The hygiene basics most owners only remember when they’ve already run out — restocked on a schedule that matches your pet’s routine.',
    ka: 'ჰიგიენის საშუალებები, რომელთა გათავება ჩვეულებრივ ბოლო წუთს გვახსოვს — ჩვენ რეგულარულად ვაგზავნით შენი ცხოველის რეჟიმის გათვალისწინებით.',
  },
  image: 'https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1400',
  imageAlt: { en: 'Puppy being bathed', ka: 'ლეკვი ბანაობს' },
};

const VITAMINS_HERO = {
  eyebrow: { en: 'Catalogue · Vitamins & Additives', ka: 'კატალოგი · ვიტამინები და დანამატები' },
  title: {
    en: 'Daily care, not after-care.',
    ka: 'ყოველდღიური ზრუნვა — და არა ფაქტის შემდგომი.',
  },
  intro: {
    en: 'Joint support, skin and coat, digestive health, immunity and senior formulas — the supplements vets actually recommend.',
    ka: 'სახსრების მხარდაჭერა, კანი და ბეწვი, საჭმლის მონელება, იმუნიტეტი და ხანდაზმული ცხოველის ფორმულები — ვეტერინარების მიერ რეკომენდებული დანამატები.',
  },
  image: 'https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1400',
  imageAlt: { en: 'Pet supplements and vitamins', ka: 'ცხოველის ვიტამინები და დანამატები' },
};

export function FoodPage() {
  const cfg = PARTNER_BRANDS.food;
  if (cfg?.useBrandGrid) {
    return <PartnerCategoryPage config={cfg} category="food" hero={FOOD_HERO} />;
  }
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Food"
      title="Food that fuels routine, not surprises."
      intro="Dry kibble, wet food, treats and prescription diets — sized to your pet, delivered before you run out."
      image="https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Dog eating dry kibble from a bowl"
      subCategory="food"
    />
  );
}

export function HygienePage() {
  const cfg = PARTNER_BRANDS.hygiene;
  if (cfg?.useBrandGrid) {
    return <PartnerCategoryPage config={cfg} category="hygiene" hero={HYGIENE_HERO} />;
  }
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Hygiene"
      title="Clean coat, clean home, quietly handled."
      intro="The hygiene basics most owners only remember when they’ve already run out — restocked on a schedule that matches your pet’s routine."
      image="https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Puppy being bathed"
      subCategory="hygiene"
    />
  );
}

export function VitaminsPage() {
  const cfg = PARTNER_BRANDS.vitamins;
  if (cfg?.useBrandGrid) {
    return <PartnerCategoryPage config={cfg} category="vitamins" hero={VITAMINS_HERO} />;
  }
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Vitamins & Additives"
      title="Daily care, not after-care."
      intro="Joint support, skin and coat, digestive health, immunity and senior formulas — the supplements vets actually recommend."
      image="https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Pet supplements and vitamins"
      subCategory="vitamins"
    />
  );
}

export function ToysPage() {
  return (
    <SubCategoryPage
      eyebrow="Special Offers · Toys & Accessories"
      title="Picked once, used every day."
      intro="Collars, leashes, beds, plush, ropes, balls and seasonal bundles — handpicked for durability, not Instagram looks alone."
      image="https://images.pexels.com/photos/4445456/pexels-photo-4445456.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Dog with a toy"
      category="specials"
      subCategory="toys-accessories"
      willInclude={[
        'Collars, harnesses and leashes (everyday + walk gear)',
        'Beds and crate mats sized to your pet',
        'Interactive and enrichment toys',
        'Chew toys for power chewers vs. light chewers',
        'Travel: carriers, seat-belts, water bottles',
        'Seasonal bundles (winter, holiday, summer cooling)',
      ]}
      brands={[
        'Kong', 'Trixie', 'Ferplast', 'PetSafe', 'Outward Hound', 'Hunter',
      ]}
    />
  );
}

export function InnovationTechPage() {
  return (
    <SubCategoryPage
      eyebrow="Special Offers · Innovation & Tech"
      title="The gadgets that quietly do the work."
      intro="Smart feeders, paw-cams, GPS trackers and connected devices — vetted, set up and integrated with your SmartPaw plan."
      image="https://images.pexels.com/photos/27435433/pexels-photo-27435433.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Smart pet feeder"
      category="specials"
      subCategory="innovation-tech"
      willInclude={[
        'SmartPaw Feeder — free with eligible plans',
        'Smart water fountains with filtration',
        'Indoor paw-cams with treat dispense',
        'GPS trackers and activity monitors',
        'Auto-litter boxes and smart litter sensors',
        'Setup help, replacement parts and warranty support',
      ]}
      brands={[
        'SmartPaw', 'PetSafe', 'Petkit', 'Sure Petcare', 'Petlibro', 'Furbo',
      ]}
    />
  );
}

export function ServicesPage() {
  return (
    <SubCategoryPage
      eyebrow="Special Offers · Services"
      title="Care that goes beyond the box."
      intro="Grooming, vet check-ups and home visits — coordinated through one trusted partner network, all bookable from your account."
      image="https://images.pexels.com/photos/6816858/pexels-photo-6816858.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Pet grooming"
      category="specials"
      subCategory="services"
      willInclude={[
        'Mobile grooming at your door',
        'Vet check-ups and vaccination reminders',
        'Home visits for senior or anxious pets',
        'Pet-sitting and dog-walking partner network',
        'Training packages (puppy, behavioural, leash)',
        'Microchipping and ID-tag service',
      ]}
      brands={[
        'Partner vets', 'Independent groomers', 'Certified trainers',
      ]}
    />
  );
}
