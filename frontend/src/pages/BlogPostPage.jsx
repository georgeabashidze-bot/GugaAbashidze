import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageShell from '@/components/PageShell';

export default function BlogPostPage() {
  const { slug } = useParams();
  const title = slug
    ? slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
    : 'Article';

  return (
    <PageShell
      eyebrow="Blog"
      title={title}
      intro="This article is being written. In the meantime, register for your delivery plan — we’ll send a launch-day email when our first three articles drop."
      comingSoon
      comingSoonNote="full article coming soon"
    >
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-[#0A4D8C] font-bold hover:text-[#F25C05] transition-colors"
        data-testid="blog-post-back-link"
      >
        <ArrowLeft size={16} />
        Back to blog
      </Link>
    </PageShell>
  );
}
