import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Loader2, Edit2, Trash2, Search, Newspaper, ExternalLink } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const load = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listBlogPosts(query ? { q: query } : {});
      setPosts(data);
    } catch (e) {
      if (e.unauthorized) {
        navigate('/admin/login');
        return;
      }
      setError(e.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await adminApi.deleteBlogPost(post.id || post.slug);
      setPosts((list) => list.filter((p) => (p.id || p.slug) !== (post.id || post.slug)));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const sorted = useMemo(
    () => [...posts].sort((a, b) => (b.published_at || '').localeCompare(a.published_at || '')),
    [posts],
  );

  return (
    <div data-testid="admin-blog-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">Blog</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            Articles
          </h1>
          <p className="text-[#465B70] mt-1 max-w-xl">
            Write and publish posts that appear on the public /blog page. Markdown is supported in the
            content fields.
          </p>
        </div>
        <Link
          to="/admin/blog-posts/new"
          data-testid="new-blog-post-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#F25C05] hover:bg-[#d44a00] text-white text-sm font-bold px-5 py-2.5 transition"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#465B70]" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, slug, tag…"
          data-testid="blog-search-input"
          className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#0A4D8C26] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#F25C05]/30"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#465B70] py-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#F25C05]" /> Loading posts…
        </div>
      ) : error ? (
        <div data-testid="admin-blog-error" className="card-soft p-6 text-red-700">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <Newspaper className="w-8 h-8 text-[#F25C05] mx-auto" />
          <p className="font-display font-bold text-[#05223D] text-xl mt-3">No posts</p>
          <p className="text-sm text-[#465B70] mt-2">Write your first article.</p>
        </div>
      ) : (
        <div className="card-soft p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F2EB] text-[#465B70] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Tag</th>
                <th className="text-left px-4 py-3">Author</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.id || p.slug}
                  className="border-t border-[#0A4D8C0F] hover:bg-[#F5F2EB]/40"
                  data-testid={`blog-row-${p.slug}`}
                >
                  <td className="px-4 py-3 max-w-[420px]">
                    <div className="flex items-start gap-3">
                      {p.cover_image && (
                        <img
                          src={p.cover_image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-bold text-[#05223D] line-clamp-1">{p.title}</div>
                        {p.title_ka && (
                          <div className="text-xs text-[#465B70] line-clamp-1">KA: {p.title_ka}</div>
                        )}
                        <div className="text-[11px] text-[#465B70]/80">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#465B70]">{p.tag || '—'}</td>
                  <td className="px-4 py-3 text-[#465B70]">{p.author_name}</td>
                  <td className="px-4 py-3 text-xs text-[#465B70]">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                        p.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end items-center gap-2">
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-[#F5F2EB] text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <Link
                        to={`/admin/blog-posts/${p.id || p.slug}`}
                        data-testid={`edit-blog-${p.slug}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-[#0A4D8C0F] text-[#0A4D8C] hover:bg-[#0A4D8C] hover:text-white transition"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => onDelete(p)}
                        data-testid={`delete-blog-${p.slug}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
