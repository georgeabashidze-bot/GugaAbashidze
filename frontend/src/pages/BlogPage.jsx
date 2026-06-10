import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/PageShell';

const POSTS = [
  {
    slug: 'why-routine-feeding-matters',
    tag: 'Smart devices',
    title: 'Why regular feeding is essential — and how smart devices help',
    excerpt: 'Routine isn’t optional for healthy pets. A look at how programmable feeders take the guesswork out of mealtimes.',
    image: 'https://images.pexels.com/photos/8498561/pexels-photo-8498561.jpeg?auto=compress&cs=tinysrgb&w=1200',
    read: '6 min read',
  },
  {
    slug: 'switching-foods-without-fuss',
    tag: 'Nutrition',
    title: 'Switching foods without the fuss',
    excerpt: 'A vet-approved nine-day plan for moving onto a new diet without upsetting your pet’s stomach.',
    image: 'https://images.pexels.com/photos/32137302/pexels-photo-32137302.jpeg?auto=compress&cs=tinysrgb&w=1200',
    read: '5 min read',
  },
  {
    slug: 'indoor-cat-checklist',
    tag: 'Tbilisi life',
    title: 'Indoor-cat checklist for Tbilisi apartments',
    excerpt: 'Vertical territory, slow feeders and small daily rituals for cats who never leave the flat.',
    image: 'https://images.pexels.com/photos/12441164/pexels-photo-12441164.jpeg?auto=compress&cs=tinysrgb&w=1200',
    read: '7 min read',
  },
];

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="From the journal"
      title="Real care, real reading."
      intro="Short, practical reads on pet nutrition, routines and small things that make a big difference. Written for Tbilisi pet parents, reviewed by working vets."
      comingSoon
      comingSoonNote="launch articles being written"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
        {POSTS.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            data-testid={`blog-post-card-${p.slug}`}
            className="card-soft p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(10,77,140,0.10)] transition-all duration-300 group flex flex-col"
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#0A4D8C] text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1.5">
                {p.tag}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-display font-bold text-[#05223D] text-xl leading-snug tracking-tight">{p.title}</h3>
              <p className="text-sm text-[#465B70] mt-3 leading-relaxed">{p.excerpt}</p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{p.read}</p>
                <span className="w-9 h-9 rounded-full border border-[#0A4D8C33] flex items-center justify-center text-[#0A4D8C] group-hover:bg-[#F25C05] group-hover:border-[#F25C05] group-hover:text-white transition-all">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
