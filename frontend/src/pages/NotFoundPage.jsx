import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';
import PageShell from '@/components/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell
      eyebrow="404"
      title="This page chased a squirrel."
      intro="The link you followed doesn’t exist — or has moved. Head back home or jump to the catalogue."
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className="btn-primary" data-testid="404-home-link">
          <HomeIcon size={16} />
          Back to home
        </Link>
        <Link to="/catalogue" className="btn-secondary" data-testid="404-catalogue-link">
          <ArrowLeft size={16} />
          Browse catalogue
        </Link>
      </div>
    </PageShell>
  );
}
