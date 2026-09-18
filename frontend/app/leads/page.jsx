'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { Alert, Select, Spinner } from '../../components/ui';
import { authFetch } from '../../lib/api';
import { formatDate } from '../../lib/format';

const SOURCES = ['ROIcalc', 'Form', 'Google', 'WhatsApp'];
const STATUSES = ['new', 'contacted', 'proposal', 'closed'];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  proposal: 'Proposal',
  closed: 'Closed'
};

const getScoreBadge = (score) => {
  const classes = {
    hot: 'badge badge-hot',
    warm: 'badge badge-warm',
    cold: 'badge badge-cold'
  };
  return <span className={classes[score] || 'badge badge-neutral'}>{score}</span>;
};

const getSourceBadge = (source) => {
  const classes = {
    ROIcalc: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
    Form: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
    Google: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200',
    WhatsApp: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
  };
  return <span className={`badge ${classes[source] || 'badge badge-neutral'}`}>{source}</span>;
};

const whatsAppMessage = (status) => {
  switch (status) {
    case 'sent':
    case 'delivered':
      return { text: 'Alert sent', tone: 'text-emerald-600' };
    case 'failed':
      return { text: 'Alert failed', tone: 'text-red-600' };
    default:
      return { text: 'Alert service not configured', tone: 'text-slate-400' };
  }
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [company, setCompany] = useState(null);
  const [filter, setFilter] = useState({ status: '', source: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [waMsg, setWaMsg] = useState({});
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', source: 'Form', message: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const comp = localStorage.getItem('company');
    if (!token) {
      router.push('/login');
      return;
    }
    setCompany(JSON.parse(comp));
  }, [router]);

  const fetchLeads = async () => {
    if (!company) return;
    let url = `/api/leads/list?companyId=${company.id}`;
    if (filter.status) url += `&status=${filter.status}`;
    if (filter.source) url += `&source=${filter.source}`;

    setLoading(true);
    setError('');
    try {
      const res = await authFetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load leads.');
        setLeads([]);
        return;
      }
      setLeads(data);
    } catch (err) {
      setError('Failed to load leads. Please try again.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [company, filter]);

  const handleStatusChange = async (leadId, status) => {
    try {
      const res = await authFetch('/api/leads/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to update lead status.');
      }
    } catch (err) {
      setError('Failed to update lead status. Please try again.');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await authFetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLead, companyId: company.id })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setNewLead({ name: '', phone: '', email: '', source: 'Form', message: '' });
        setShowAdd(false);
        fetchLeads();
      } else {
        setCreateError(data.error || 'Failed to create lead. Please try again.');
      }
    } catch (err) {
      setCreateError('Connection error. Please try again.');
    }
    setCreating(false);
  };

  const handleExport = async () => {
    try {
      const res = await authFetch(`/api/audit/export?companyId=${company.id}&year=2026`);
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        window.open(data.fileUrl, '_blank');
      } else {
        setError(data.error || 'Export failed.');
      }
    } catch (err) {
      setError('Export failed. Please try again.');
    }
  };

  const handleWhatsApp = async (lead) => {
    try {
      const resp = await authFetch('/api/whatsapp/lead-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id })
      });
      const data = await resp.json().catch(() => ({}));
      setWaMsg((prev) => ({
        ...prev,
        [lead._id]: resp.ok ? data.whatsappStatus || 'unknown' : data.error || 'failed'
      }));
    } catch (err) {
      setWaMsg((prev) => ({ ...prev, [lead._id]: 'failed' }));
    }
  };

  const visibleLeads = leads.filter((l) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return [l.name, l.phone, l.email, l.source, l.message].some((v) =>
      (v || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppShell
      title="Leads"
      subtitle="Capture, score, and manage inbound enquiries."
      actions={
        <>
          <button onClick={() => setShowAdd((s) => !s)} className="btn btn-primary">
            {showAdd ? 'Close' : 'Add Lead'}
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            Export
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="w-full sm:w-44"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value })}
            className="w-full sm:w-44"
            aria-label="Filter by source"
          >
            <option value="">All Sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="relative w-full lg:w-72">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="input pl-9"
            aria-label="Search leads"
          />
        </div>
      </div>

      {showAdd && (
        <div className="card mt-4 p-5">
          <h2 className="text-base font-semibold text-slate-900">Add a new lead</h2>
          <p className="mt-1 text-sm text-slate-500">
            A WhatsApp alert is sent automatically when a lead is created.
          </p>

          {createError && (
            <div className="mt-4">
              <Alert tone="error">{createError}</Alert>
            </div>
          )}

          <form onSubmit={handleCreateLead} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field">
              <label className="label" htmlFor="lead-name">
                Name
              </label>
              <input
                id="lead-name"
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="input"
                placeholder="Lead name"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="lead-phone">
                Phone
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="input"
                placeholder="Contact number"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="lead-email">
                Email
              </label>
              <input
                id="lead-email"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="input"
                placeholder="name@example.com"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="lead-source">
                Source
              </label>
              <Select
                id="lead-source"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                className="w-full"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="field sm:col-span-2">
              <label className="label" htmlFor="lead-message">
                Message
              </label>
              <textarea
                id="lead-message"
                value={newLead.message}
                onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Enquiry details. Messages longer than 50 characters score the lead as hot."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
                {creating ? 'Creating…' : 'Create Lead'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt-4 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            <div className="skeleton h-8 w-full" />
            <div className="skeleton h-8 w-full" />
            <div className="skeleton h-8 w-full" />
          </div>
        ) : visibleLeads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-slate-300"
              aria-hidden="true"
            >
              <path d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-600">
              {search || filter.status || filter.source
                ? 'No leads match your filters'
                : 'No leads yet'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {search || filter.status || filter.source
                ? 'Try adjusting the search or filters above.'
                : 'New enquiries will appear here once they are captured.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-5">Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => {
                  const wa = waMsg[lead._id];
                  const waInfo = wa ? whatsAppMessage(wa) : null;
                  return (
                    <tr key={lead._id}>
                      <td className="px-5 font-medium text-slate-900">{lead.name}</td>
                      <td className="text-slate-500">{lead.phone}</td>
                      <td className="text-slate-500">{lead.email || '—'}</td>
                      <td>{getSourceBadge(lead.source)}</td>
                      <td>{getScoreBadge(lead.score)}</td>
                      <td>
                        <Select
                          small
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className="w-32"
                          aria-label={`Status for ${lead.name}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Call
                          </a>
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(lead)}
                            disabled={!!wa}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-default"
                          >
                            WhatsApp
                          </button>
                        </div>
                        {waInfo && (
                          <p className={`mt-1 text-xs ${waInfo.tone}`}>{waInfo.text}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}