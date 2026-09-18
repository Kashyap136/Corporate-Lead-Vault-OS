'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { Alert } from '../../components/ui';
import { authFetch } from '../../lib/api';
import { formatDate } from '../../lib/format';

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

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [hotLeads, setHotLeads] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const comp = localStorage.getItem('company');
    if (!token) {
      router.push('/login');
      return;
    }
    setCompany(JSON.parse(comp));
  }, [router]);

  useEffect(() => {
    if (!company) return;

    const fetchData = async () => {
      try {
        const statsRes = await authFetch(`/api/leads/stats?companyId=${company.id}`);
        if (!statsRes.ok) throw new Error('stats');
        setStats(await statsRes.json());

        const leadsRes = await authFetch(`/api/leads/list?companyId=${company.id}&source=`);
        if (!leadsRes.ok) throw new Error('leads');
        const leadsData = await leadsRes.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const hot = leadsData.filter(
          (l) => l.score === 'hot' && new Date(l.createdAt) >= thirtyDaysAgo
        );
        setHotLeads(hot);
      } catch (err) {
        setError('Unable to load dashboard data. Please try again.');
        setHotLeads([]);
      }
    };

    fetchData();
  }, [company]);

  const totalLeads = stats ? stats.new + stats.contacted + stats.closed : 0;
  const closedPercent = totalLeads > 0 ? ((stats.closed / totalLeads) * 100).toFixed(1) : 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of your leads and pipeline."
    >
      {error && (
        <div className="mb-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat-card border-l-4 border-l-blue-500">
          <p className="stat-label">Total Leads</p>
          {stats ? (
            <p className="stat-value">{totalLeads}</p>
          ) : (
            <div className="skeleton mt-2 h-8 w-16" />
          )}
          <p className="stat-hint">All leads captured across every source</p>
        </div>

        <div className="stat-card border-l-4 border-l-red-500">
          <p className="stat-label">Hot Leads</p>
          {stats ? (
            <p className="stat-value">{stats.hot}</p>
          ) : (
            <div className="skeleton mt-2 h-8 w-16" />
          )}
          <p className="stat-hint">Leads with a priority message</p>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Closed %</p>
          {stats ? (
            <p className="stat-value">{closedPercent}%</p>
          ) : (
            <div className="skeleton mt-2 h-8 w-16" />
          )}
          <p className="stat-hint">
            {stats ? `${stats.closed} closed of ${totalLeads}` : 'Loading…'}
          </p>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Hot leads</h2>
          <span className="badge badge-neutral">Last 30 days</span>
        </div>

        {hotLeads === null ? (
          <div className="space-y-3 p-5">
            <div className="skeleton h-8 w-full" />
            <div className="skeleton h-8 w-full" />
            <div className="skeleton h-8 w-full" />
          </div>
        ) : hotLeads.length === 0 ? (
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
            <p className="mt-3 text-sm font-medium text-slate-600">No hot leads</p>
            <p className="mt-1 text-sm text-slate-400">
              Leads with a priority message will appear here when they come in.
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
                  <th className="px-5">Date</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="px-5 font-medium text-slate-900">{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td className="text-slate-500">{lead.email || '—'}</td>
                    <td>{getSourceBadge(lead.source)}</td>
                    <td>{getScoreBadge(lead.score)}</td>
                    <td className="px-5 text-slate-500">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}