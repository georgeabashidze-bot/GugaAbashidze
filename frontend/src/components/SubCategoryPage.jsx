import React from 'react';
import PageShell from '@/components/PageShell';
import CatalogueShelf from '@/components/CatalogueShelf';

// Sub-category page used for /catalogue/* and /special-offers/*.
// Renders breadcrumbs + a live product grid only.
export default function SubCategoryPage({
  subCategory,
  category = 'catalogue',
}) {
  return (
    <PageShell>
      <div className="mt-4">
        <CatalogueShelf subCategory={subCategory} category={category} />
      </div>
    </PageShell>
  );
}
