// Central route map — single source of truth for slugs, labels and breadcrumb chains.
// Edit a slug here and it propagates everywhere (header, footer, breadcrumbs).

export const ROUTES = {
  home: { path: '/', label: 'Home' },

  catalogue: {
    path: '/catalogue',
    label: 'Catalogue',
    children: {
      food: { path: '/catalogue/food', label: 'Food' },
      hygiene: { path: '/catalogue/hygiene', label: 'Hygiene' },
      vitamins: { path: '/catalogue/vitamins', label: 'Vitamins & Additives' },
    },
  },

  specials: {
    path: '/special-offers',
    label: 'Special Offers',
    children: {
      toys: { path: '/special-offers/toys-accessories', label: 'Toys & Accessories' },
      tech: { path: '/special-offers/innovation-tech', label: 'Innovation & Tech' },
      services: { path: '/special-offers/services', label: 'Services' },
    },
  },

  how: { path: '/how-it-works', label: 'How It Works' },
  plans: { path: '/plans', label: 'Plans & Pricing' },
  about: { path: '/about', label: 'About' },
  blog: { path: '/blog', label: 'Blog' },
  contact: { path: '/contact', label: 'Contact' },
  faq: { path: '/faq', label: 'FAQ' },

  privacy: { path: '/privacy', label: 'Privacy Policy' },
  terms: { path: '/terms', label: 'Terms & Conditions' },
  delivery: { path: '/delivery-policy', label: 'Delivery Policy' },
  refund: { path: '/refund-policy', label: 'Refund Policy' },
};
