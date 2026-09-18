'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { Alert, Spinner } from '../../components/ui';
import { authFetch } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const getPositionBadge = (position) => {
  if (position <= 5)
    return <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">#{position}</span>;
  if (position <= 10)
    return <span className="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">#{position}</span>;
  return <span className="badge bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">#{position}</span>;
};

export default function SEOPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/api/seo/report?companyId=${company.id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate report.');
        setReport(null);
      } else {
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to generate report');
      setError('Failed to generate report. Please try again.');
      setReport(null);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!report) return;
    const csvContent = [
      ['Competitor Domain', 'Your Position', 'Competitor Position', 'Keywords'],
      ...report.rankingKeywords.map((k) => [
        report.competitorDomains[0] || '',
        k.position,
        k.competitorPosition,
        k.keyword
      ])
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="SEO Ranking Report"
      subtitle="Track your keyword positions against competitors."
      actions={
        <>
          <button onClick={generateReport} className="btn btn-primary" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {loading ? 'Generating…' : 'Generate SEO Report'}
          </button>
          {report && (
            <button onClick={handleDownload} className="btn btn-secondary">
              Download CSV
            </button>
          )}
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="stat-card">
              <p className="stat-label">Domain</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">{report.domain}</p>
              <p className="stat-hint">Reporting target</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Generated</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatDateTime(report.generatedAt)}
              </p>
              <p className="stat-hint">Latest snapshot</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Keywords tracked</p>
              <p className="stat-value">{report.rankingKeywords.length}</p>
              <p className="stat-hint">Competitor positions compared</p>
            </div>
          </div>

          <div className="card mt-6 overflow-hidden">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-5">Keyword</th>
                    <th>Your Position</th>
                    <th>Competitor Position</th>
                    <th className="px-5">Competitor Domain</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rankingKeywords.map((kw, i) => (
                    <tr key={i}>
                      <td className="px-5 font-medium text-slate-900">{kw.keyword}</td>
                      <td>{getPositionBadge(kw.position)}</td>
                      <td className="text-slate-500">#{kw.competitorPosition}</td>
                      <td className="px-5 text-slate-500">
                        {report.competitorDomains[i % report.competitorDomains.length]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9 text-slate-300"
            aria-hidden="true"
          >
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-slate-600">No SEO report yet</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Generate a report to see your keyword rankings against competitor domains.
          </p>
          <button onClick={generateReport} className="btn btn-primary btn-sm mt-5" disabled={loading}>
            {loading && <Spinner className="h-3.5 w-3.5 border-slate-200 border-t-transparent" />}
            {loading ? 'Generating…' : 'Generate SEO Report'}
          </button>
        </div>
      )}
    </AppShell>
  );
}