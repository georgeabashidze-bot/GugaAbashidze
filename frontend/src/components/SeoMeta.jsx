import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'SmartPaw Food';
const DEFAULT_DESCRIPTION =
  'SmartPaw Food — a Tbilisi subscription that keeps your dog or cat’s shelf stocked. Vet-aligned brands, free SmartPaw Feeder, door-to-door delivery.';
const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/8434670/pexels-photo-8434670.jpeg?auto=compress&cs=tinysrgb&w=1600';

function siteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://smartpaw.ge';
}

/**
 * Drop-in SEO + Open Graph + Twitter card + JSON-LD helmet.
 *
 * Props:
 *  - title          page title (auto-suffixed with site name unless absoluteTitle=true)
 *  - description    meta description
 *  - image          absolute URL for OG/Twitter card
 *  - type           open-graph type ('website' | 'article')
 *  - jsonLd         object or array of objects rendered as <script type="application/ld+json">
 *  - noIndex        opt-out of indexing
 *  - absoluteTitle  if true, don't append the site name
 */
export default function SeoMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
  noIndex = false,
  absoluteTitle = false,
}) {
  const { pathname } = useLocation();
  const fullTitle = !title
    ? SITE_NAME
    : absoluteTitle
      ? title
      : `${title} · ${SITE_NAME}`;
  const url = `${siteOrigin()}${pathname}`;

  const jsonLdArr = jsonLd == null ? [] : Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdArr.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}

// ----- JSON-LD helpers -----

export function organizationJsonLd() {
  const origin = siteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: origin,
    logo: `${origin}/favicon.ico`,
    sameAs: [],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+995-591-96-99-01',
        email: 'hello@smartpaw.ge',
        areaServed: 'GE',
        availableLanguage: ['en', 'ka'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tbilisi',
      addressCountry: 'GE',
    },
  };
}

export function articleJsonLd({
  title,
  description,
  image,
  url,
  authorName,
  publishedAt,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image ? [image] : undefined,
    author: { '@type': 'Person', name: authorName || 'SmartPaw Team' },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${siteOrigin()}/favicon.ico` },
    },
    datePublished: publishedAt,
    dateModified: publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function breadcrumbJsonLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteOrigin()}${item.path}`,
    })),
  };
}
