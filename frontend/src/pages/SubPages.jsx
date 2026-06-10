import React from 'react';
import SubCategoryPage from '@/components/SubCategoryPage';

export function FoodPage() {
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Food"
      title="Food that fuels routine, not surprises."
      intro="Dry kibble, wet food, treats and prescription diets — sized to your pet, delivered before you run out."
      image="https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Dog eating dry kibble from a bowl"
      subCategory="food"
      willInclude={[
        'Dry kibble — adult, puppy, senior, breed-specific',
        'Wet food in pouches, cans and trays',
        'Single-protein and hypoallergenic lines',
        'Prescription diets (renal, urinary, weight, sensitivity)',
        'Treats for training, dental and reward use',
        'Bulk-friendly portions sized to your pet’s daily intake',
      ]}
      brands={[
        'Royal Canin', 'Hill’s Science Plan', 'Purina Pro Plan',
        'Acana', 'Orijen', 'Brit Care', 'Happy Dog', 'Happy Cat', 'Mera', 'Belcando',
      ]}
    />
  );
}

export function HygienePage() {
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Hygiene"
      title="Clean coat, clean home, quietly handled."
      intro="The hygiene basics most owners only remember when they’ve already run out — restocked on a schedule that matches your pet’s routine."
      image="https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Puppy being bathed"
      subCategory="hygiene"
      willInclude={[
        'Shampoos and conditioners for every coat type',
        'Dental sticks, toothpaste and oral rinses',
        'Ear and eye cleaning solutions',
        'Paw wipes and grooming wipes',
        'Cat litter (clumping, silica, tofu, natural)',
        'Odour neutralisers and home cleaning sprays',
      ]}
      brands={[
        'Beaphar', 'TropiClean', 'Espree', 'Virbac', 'Bayer', 'Pet Head', 'Catsan', 'Ever Clean',
      ]}
    />
  );
}

export function VitaminsPage() {
  return (
    <SubCategoryPage
      eyebrow="Catalogue · Vitamins & Additives"
      title="Daily care, not after-care."
      intro="Joint support, skin and coat, digestive health, immunity and senior formulas — the supplements vets actually recommend."
      image="https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1400"
      imageAlt="Pet supplements and vitamins"
      subCategory="vitamins"
      willInclude={[
        'Joint care: glucosamine, chondroitin, omega-3',
        'Skin and coat: salmon oil, biotin, vitamin E',
        'Digestive: probiotics, prebiotics, fibre boosters',
        'Immune support: antioxidants, multivitamins',
        'Senior formulas and life-stage boosters',
        'Calming and anti-stress aids (travel, fireworks, vet visits)',
      ]}
      brands={[
        'Vetoquinol', 'VetriScience', 'Nutramax', 'Beaphar', 'Canina', 'Animal Health', 'Trixie',
      ]}
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
