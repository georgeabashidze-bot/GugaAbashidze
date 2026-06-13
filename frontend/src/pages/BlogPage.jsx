import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Calendar, Clock, AlertCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import SeoMeta, { breadcrumbJsonLd } from '@/components/SeoMeta';
import { api } from '@/lib/api';
import { useLang } from '@/lib/LangContext';

const COPY = {
  seoTitle: { en: 'From the journal', ka: 'ჟურნალიდან' },
  seoDescription: {
    en: 'Short, practical reads on pet nutrition, routines and Tbilisi pet life — written for owners, reviewed by working vets.',
    ka: 'მოკლე, პრაქტიკული სტატიები კვებაზე, რუტინაზე და თბილისის ცხოვრებაზე — დაწერილია მფლობელებისთვის, შემოწმებულია ვეტერინარების მიერ.',
  },
  title: { en: 'Real care, real reading.', ka: 'რეალური ზრუნვა, რეალური საკითხავი.' },
  intro: {
    en: 'Short, practical reads on pet nutrition, routines and small things that make a big difference. Written for Tbilisi pet parents, reviewed by working vets.',
    ka: 'მოკლე, პრაქტიკული სტატიები კვებაზე, რუტინაზე და პატარა საქმეებზე, რომლებიც დიდ ცვლილებებს იწვევენ. დაწერილია თბილისელი მფლობელებისთვის, შემოწმებულია ვეტერინარების მიერ.',
  },
  all: { en: 'All articles', ka: 'ყველა სტატია' },
  loadError: { en: 'Couldn’t load the journal.', ka: 'ჟურნალის ჩატვირთვა ვერ მოხერხდა.' },
  tryAgain: { en: 'Please try again in a moment.', ka: 'სცადეთ ცოტა ხანში.' },
  emptyTitle: { en: 'Nothing tagged', ka: 'ჯერ არ არსებობს თეგით' },
  emptyYet: { en: 'yet.', ka: '.' },
  emptySub: { en: 'Pick another tag — more articles are on the way.', ka: 'აირჩიე სხვა თეგი — მეტი სტატია მალე გვექნება.' },
  read: { en: 'Read', ka: 'წაიკითხე' },
  minRead: { en: 'min read', ka: 'წთ კითხვა' },
};

function formatDate(iso, lang) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('all');
  const { lang, pick } = useLang();
  const L = (obj) => obj?.[lang] ?? obj?.en ?? '';
  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.listBlogPosts(),
  });

  const tags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ['all', ...Array.from(set).sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeTag === 'all') return posts;
    return posts.filter((p) => p.tags?.includes(activeTag));
  }, [posts, activeTag]);

  return (
    <>
      <SeoMeta
        title={L(COPY.seoTitle)}
        description={L(COPY.seoDescription)}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: L(COPY.seoTitle), path: '/blog' },
        ])}
      />
      <PageShell
        eyebrow={L(COPY.seoTitle)}
        title={L(COPY.title)}
        intro={L(COPY.intro)}
      >
        {tags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8" data-testid="blog-tag-filter">
            {tags.map((t) => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  data-testid={`blog-tag-${t}-button`}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    active
                      ? 'bg-[#0A4D8C] text-white border-[#0A4D8C]'
                      : 'bg-white text-[#0A4D8C] border-[#0A4D8C]/20 hover:border-[#0A4D8C]/40'
                  }`}
                >
                  {t === 'all' ? L(COPY.all) : `#${t}`}
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7" data-testid="blog-loading-state">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-soft p-0 overflow-hidden">
                <div className="aspect-[5/4] bg-[#F5F2EB] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-[#F5F2EB] rounded animate-pulse w-1/3" />
                  <div className="h-6 bg-[#F5F2EB] rounded animate-pulse" />
                  <div className="h-4 bg-[#F5F2EB] rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div
            className="card-soft p-7 flex items-start gap-3 text-[#9b1c1c]"
            data-testid="blog-error-state"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">{L(COPY.loadError)}</p>
              <p className="text-sm mt-1 text-[#465B70]">{error?.message || L(COPY.tryAgain)}</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="card-soft p-8 text-center" data-testid="blog-empty-state">
            <p className="font-display font-bold text-[#05223D] text-xl">
              {L(COPY.emptyTitle)} <span className="text-[#F25C05]">#{activeTag}</span> {L(COPY.emptyYet)}
            </p>
            <p className="text-[#465B70] mt-2">{L(COPY.emptySub)}</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7"
            data-testid="blog-posts-grid"
          >
            {filtered.map((p) => {
              const title = pick(p, 'title');
              const excerpt = pick(p, 'excerpt');
              return (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  data-testid={`blog-post-card-${p.slug}`}
                  className="card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 group flex flex-col"
                >
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <img
                      src={p.cover_image}
                      alt={p.cover_alt || title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {p.tag && (
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0A4D8C] text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1.5">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-[#465B70]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(p.published_at, lang)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} />
                        {p.read_minutes} {L(COPY.minRead)}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-[#05223D] text-xl leading-snug tracking-tight mt-3">
                      {title}
                    </h3>
                    <p className="text-sm text-[#465B70] mt-3 leading-relaxed flex-1">{excerpt}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{L(COPY.read)}</p>
                      <span className="w-9 h-9 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
}
