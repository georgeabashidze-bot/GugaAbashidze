import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// Build crumbs from current path using ROUTES tree.
function buildCrumbs(pathname) {
  if (pathname === '/' || pathname === '') return [];

  const all = [];
  const walk = (node) => {
    if (node.path && node.path !== '/') all.push({ path: node.path, label: node.label });
    if (node.children) Object.values(node.children).forEach(walk);
  };
  Object.values(ROUTES).forEach(walk);

  // Match longest prefix chain
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [];
  let cur = '';
  for (const seg of segments) {
    cur += '/' + seg;
    const match = all.find((r) => r.path === cur);
    if (match) crumbs.push(match);
    else crumbs.push({ path: cur, label: seg.replace(/-/g, ' ') });
  }
  return crumbs;
}

export default function Breadcrumbs({ trailing }) {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0 && !trailing) return null;

  return (
    <nav
      data-testid="breadcrumbs"
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-sm text-[#465B70]"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 hover:text-[#F25C05] transition-colors"
        data-testid="breadcrumb-home-link"
      >
        <HomeIcon size={14} />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1 && !trailing;
        return (
          <React.Fragment key={c.path}>
            <ChevronRight size={14} className="text-[#465B70]/50" aria-hidden />
            {last ? (
              <span className="font-semibold text-[#05223D] capitalize" aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link
                to={c.path}
                className="hover:text-[#F25C05] capitalize transition-colors"
              >
                {c.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
      {trailing && (
        <>
          <ChevronRight size={14} className="text-[#465B70]/50" aria-hidden />
          <span className="font-semibold text-[#05223D]" aria-current="page">
            {trailing}
          </span>
        </>
      )}
    </nav>
  );
}
