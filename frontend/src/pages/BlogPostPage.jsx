import React, { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Twitter, Facebook, Linkedin, Link2, Check, MessageCircle, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import SeoMeta, { articleJsonLd, breadcrumbJsonLd } from '@/components/SeoMeta';
import { useSignup } from '@/lib/SignupContext';
import { api } from '@/lib/api';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { openSignup } = useSignup();

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => api.getBlogPost(slug),
    retry: false,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.listBlogPosts(),
  });

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  }, [allPosts, post]);

  const pageUrl =
    typeof window !== 'undefined' ? window.location.href : `https://smartpaw.ge/blog/${slug}`;

  if (isError && error?.message?.includes('404')) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <SeoMeta
        title={post?.seo_title || post?.title || 'Loading…'}
        absoluteTitle={!!post?.seo_title}
        description={post?.seo_description || post?.excerpt}
        image={post?.cover_image}
        type="article"
        jsonLd={
          post
            ? [
                articleJsonLd({
                  title: post.title,
                  description: post.seo_description || post.excerpt,
                  image: post.cover_image,
                  url: pageUrl,
                  authorName: post.author_name,
                  publishedAt: post.published_at,
                }),
                breadcrumbJsonLd([
                  { name: 'Home', path: '/' },
                  { name: 'Blog', path: '/blog' },
                  { name: post.title, path: `/blog/${post.slug}` },
                ]),
              ]
            : null
        }
      />

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-10 md:pb-14 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#F25C05]/10 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] rounded-full bg-[#0A4D8C]/10 blur-3xl pointer-events-none" aria-hidden />

        <div className="max-w-4xl mx-auto px-5 md:px-10">
          <Breadcrumbs />

          {isLoading && (
            <div data-testid="blog-post-loading" className="mt-8 space-y-4">
              <div className="h-4 w-32 bg-[#F5F2EB] rounded animate-pulse" />
              <div className="h-10 bg-[#F5F2EB] rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-[#F5F2EB] rounded animate-pulse" />
              <div className="h-[400px] mt-8 bg-[#F5F2EB] rounded-[2rem] animate-pulse" />
            </div>
          )}

          {isError && !isLoading && (
            <div
              className="card-soft p-8 mt-8 text-[#9b1c1c]"
              data-testid="blog-post-error"
            >
              <p className="font-bold">Couldn’t load this article.</p>
              <p className="text-sm mt-2 text-[#465B70]">{error?.message || 'Please try again.'}</p>
              <Link to="/blog" className="btn-secondary mt-5 inline-flex">
                <ArrowLeft size={16} />
                Back to blog
              </Link>
            </div>
          )}

          {post && (
            <div className="mt-6" data-testid="blog-post-hero">
              {post.tag && (
                <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                  {post.tag}
                </p>
              )}
              <h1
                className="font-display font-extrabold text-[#05223D] text-[34px] sm:text-5xl lg:text-[58px] tracking-[-0.025em] leading-[1.05] mt-3"
                data-testid="blog-post-title"
              >
                {post.title}
              </h1>
              <p className="mt-5 text-[#465B70] text-lg leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-[#465B70]" data-testid="blog-post-meta">
                <div className="flex items-center gap-3">
                  {post.author_avatar && (
                    <img
                      src={post.author_avatar}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                  )}
                  <div>
                    <p className="font-bold text-[#05223D]">{post.author_name}</p>
                    {post.author_role && (
                      <p className="text-xs text-[#465B70]">{post.author_role}</p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.published_at)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.read_minutes} min read
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {post && (
        <>
          {/* Cover image */}
          <section className="pb-10 md:pb-14">
            <div className="max-w-5xl mx-auto px-5 md:px-10">
              <div className="aspect-[16/9] rounded-[2rem] overflow-hidden card-soft">
                <img
                  src={post.cover_image}
                  alt={post.cover_alt || post.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  data-testid="blog-post-cover"
                />
              </div>
            </div>
          </section>

          {/* Markdown body + share rail */}
          <section className="pb-20 md:pb-28">
            <div className="max-w-4xl mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <aside className="lg:col-span-2 order-2 lg:order-1">
                <div className="lg:sticky lg:top-28">
                  <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#465B70]">Share</p>
                  <ShareRail title={post.title} url={pageUrl} />
                </div>
              </aside>

              <article
                className="lg:col-span-10 order-1 lg:order-2 prose-smartpaw"
                data-testid="blog-post-body"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>

                {post.tags?.length > 0 && (
                  <div
                    className="mt-12 pt-8 border-t border-[#0A4D8C]/10 flex flex-wrap items-center gap-2"
                    data-testid="blog-post-tags"
                  >
                    <span className="text-xs tracking-[0.22em] uppercase font-bold text-[#465B70] mr-1">
                      Tags
                    </span>
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5F2EB] text-[#0A4D8C]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="pb-20 md:pb-24" data-testid="blog-post-related">
              <div className="max-w-5xl mx-auto px-5 md:px-10">
                <h2 className="font-display font-bold text-[#05223D] text-3xl md:text-4xl tracking-tight">
                  Keep reading.
                </h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/blog/${p.slug}`}
                      data-testid={`blog-related-${p.slug}`}
                      className="card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 group flex"
                    >
                      <div className="w-2/5 relative">
                        <img
                          src={p.cover_image}
                          alt={p.cover_alt || p.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="w-3/5 p-5 md:p-6">
                        {p.tag && (
                          <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#F25C05]">
                            {p.tag}
                          </p>
                        )}
                        <h3 className="font-display font-bold text-[#05223D] text-lg leading-snug mt-2 group-hover:text-[#0A4D8C] transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-[#465B70] mt-2 flex items-center gap-1.5">
                          <Clock size={12} />
                          {p.read_minutes} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="pb-24">
            <div className="max-w-5xl mx-auto px-5 md:px-10">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#0A4D8C] px-7 py-12 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
                <div className="absolute inset-0 grain pointer-events-none" aria-hidden />
                <div className="relative">
                  <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">SmartPaw Food</p>
                  <h2 className="font-display font-bold text-white text-3xl md:text-4xl tracking-[-0.02em] leading-tight mt-2 max-w-lg">
                    Ready to skip the next pet-shop run?
                  </h2>
                </div>
                <div className="relative flex flex-wrap items-center gap-3">
                  <button
                    onClick={openSignup}
                    className="btn-primary"
                    data-testid="blog-post-cta-button"
                  >
                    Start your plan
                    <ArrowRight size={18} />
                  </button>
                  <a
                    href="https://wa.me/995591969901"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-[#0A4D8C]"
                    data-testid="blog-post-whatsapp-link"
                  >
                    <MessageCircle size={16} />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function ShareRail({ title, url }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // noop
    }
  };

  const buttons = [
    {
      key: 'twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      label: 'Share on X',
    },
    {
      key: 'facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Share on Facebook',
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Share on LinkedIn',
    },
  ];

  return (
    <div className="flex lg:flex-col gap-2 mt-3" data-testid="blog-post-share-rail">
      {buttons.map(({ key, icon: Icon, href, label }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-testid={`blog-share-${key}-button`}
          className="w-10 h-10 rounded-full border border-[#0A4D8C]/20 text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition-all flex items-center justify-center"
        >
          <Icon size={16} />
        </a>
      ))}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy link"
        data-testid="blog-share-copy-button"
        className="w-10 h-10 rounded-full border border-[#0A4D8C]/20 text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition-all flex items-center justify-center"
      >
        {copied ? <Check size={16} className="text-[#F25C05]" /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
