import React from 'react';
import { useLang } from '@/lib/LangContext';
import ProductSection from './ProductSection';

const REGULAR_IMGS = {
  food: 'https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1200',
  hygiene: 'https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1200',
  vitamins: 'https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const SPECIAL_IMGS = {
  toys: 'https://images.pexels.com/photos/4445456/pexels-photo-4445456.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tech: 'https://images.pexels.com/photos/27435433/pexels-photo-27435433.jpeg?auto=compress&cs=tinysrgb&w=1200',
  services: 'https://images.pexels.com/photos/6816858/pexels-photo-6816858.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

export function RegularProducts({ onOpenSignup }) {
  const { t } = useLang();
  const p = t.products.regular;
  return (
    <ProductSection
      id="catalogue"
      eyebrow={p.eyebrow}
      title={p.title}
      body={p.body}
      items={p.items}
      images={REGULAR_IMGS}
      onOpenSignup={onOpenSignup}
      testIdPrefix="regular-products"
    />
  );
}

export function SpecialOffers({ onOpenSignup }) {
  const { t } = useLang();
  const p = t.products.specials;
  return (
    <ProductSection
      id="special-offers"
      eyebrow={p.eyebrow}
      title={p.title}
      body={p.body}
      items={p.items}
      images={SPECIAL_IMGS}
      onOpenSignup={onOpenSignup}
      testIdPrefix="special-offers"
      surface="alt"
    />
  );
}
