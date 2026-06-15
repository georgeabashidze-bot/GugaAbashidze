import React from 'react';
import { useLang } from '@/lib/LangContext';
import ProductSection from './ProductSection';

const REGULAR_IMGS = {
  food: 'https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1200',
  hygiene: 'https://images.pexels.com/photos/1436139/pexels-photo-1436139.jpeg?auto=compress&cs=tinysrgb&w=1200',
  vitamins: 'https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const REGULAR_ROUTES = {
  food: '/catalogue/food',
  hygiene: '/catalogue/hygiene',
  vitamins: '/catalogue/vitamins',
};

const SPECIAL_IMGS = {
  toys: 'https://images.pexels.com/photos/4445456/pexels-photo-4445456.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tech: 'https://images.pexels.com/photos/27435433/pexels-photo-27435433.jpeg?auto=compress&cs=tinysrgb&w=1200',
  services: 'https://images.pexels.com/photos/6816858/pexels-photo-6816858.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const SPECIAL_ROUTES = {
  toys: '/special-offers/toys-accessories',
  tech: '/special-offers/innovation-tech',
  services: '/special-offers/services',
};

export function RegularProducts() {
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
      routes={REGULAR_ROUTES}
      testIdPrefix="regular-products"
    />
  );
}

export function SpecialOffers() {
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
      routes={SPECIAL_ROUTES}
      testIdPrefix="special-offers"
      surface="alt"
    />
  );
}
