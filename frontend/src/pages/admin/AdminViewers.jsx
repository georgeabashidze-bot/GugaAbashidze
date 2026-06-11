import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

function toCsv(rows, columns) {
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(',')).join('\n');
  return `${header}\n${body}`;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminLeads() {
  return (
    <SimpleList
      title="Leads"
      eyebrow="Sign-ups"
      testId="admin-leads-page"
      fetcher={() => adminApi.listLeads()}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'pet_type', label: 'Pet' },
        { key: 'pet_name', label: 'Pet name' },
        { key: 'pet_breed', label: 'Breed' },
        { key: 'created_at', label: 'Created' },
      ]}
      csvName="smartpaw-leads.csv"
    />
  );
}

export function AdminContacts() {
  return (
    <SimpleList
      title="Contact Inquiries"
      eyebrow="Inbox"
      testId="admin-contacts-page"
      fetcher={() => adminApi.listContacts()}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Subject' },
        { key: 'message', label: 'Message' },
        { key: 'department', label: 'Dept' },
        { key: 'created_at', label: 'Created' },
      ]}
      csvName="smartpaw-contacts.csv"
    />
  );
}

function SimpleList({ title, eyebrow, fetcher, columns, csvName, testId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetcher();
        if (alive) setItems(data);
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((row) =>
      columns.some((c) => String(row[c.key] || '').toLowerCase().includes(t)),
    );
  }, [items, q, columns]);

  return (
    <div data-testid={testId}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase font-bold text-[#F25C05]">{eyebrow}</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">{title}</h1>
          <p className="text-[#465B70] mt-1">
            {items ? `${filtered.length} / ${items.length}` : 'Loading…'} record
            {items?.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => downloadCsv(csvName, toCsv(filtered, columns))}
          disabled={!items || filtered.length === 0}
          data-testid="export-csv-button"
          className="inline-flex items-center gap-2 rounded-full bg-[#0A4D8C] hover:bg-[#053B70] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 transition"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
        className="mb-5 w-full max-w-md rounded-full border border-[#0A4D8C26] bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#0A4D8C]"
      />

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {items === null ? (
        <div className="py-14 flex items-center justify-center text-[#465B70]">
          <Loader2 className="w-6 h-6 animate-spin text-[#F25C05]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="font-bold text-[#05223D]">No records.</p>
        </div>
      ) : (
        <div className="card-soft p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F2EB] text-[#465B70] uppercase text-[10px] tracking-wider">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="text-left px-4 py-3 font-bold whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id || i} className="border-t border-[#0A4D8C0F] hover:bg-[#FDFBF7]">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-top max-w-xs">
                        <div className="text-[#05223D] line-clamp-3 break-words">
                          {c.key === 'created_at' && row[c.key]
                            ? new Date(row[c.key]).toLocaleString()
                            : row[c.key] || '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
