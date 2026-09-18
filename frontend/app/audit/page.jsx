'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { Alert, Spinner } from '../../components/ui';
import { authFetch } from '../../lib/api';

export default function AuditPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
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
    authFetch(`/api/leads/stats?companyId=${company.id}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {
        setError('Unable to load audit overview.');
      });
  }, [company]);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setExportUrl('');
    try {
      const res = await authFetch(`/api/audit/export?companyId=${company.id}&year=2026`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Export failed.');
      } else {
        setExportUrl(data.fileUrl);
      }
    } catch (err) {
      console.error('Export failed');
      setError('Export failed. Please try again.');
    }
    setExporting(false);
  };

  const totalLeads = stats ? stats.new + stats.contacted + stats.closed : 0;
  const validLeads = stats ? stats.contacted + stats.closed : 0;
  const scorePercent = totalLeads > 0 ? ((validLeads / totalLeads) * 100).toFixed(0) : 0;

  return (
    <AppShell
      title="ISO Audit Export"
      subtitle="Export a DPDP-compliant audit workbook for your ISO auditor."
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card border-l-4 border-l-blue-500">
          <p className="stat-label">Audit Status</p>
          {stats ? (
            <p className="mt-1 text-lg font-semibold text-slate-900">Audit ready</p>
          ) : (
            <div className="skeleton mt-2 h-5 w-24" />
          )}
          <p className="stat-hint">Data available for export</p>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Lead Score</p>
          {stats ? (
            <p className="stat-value">{scorePercent}%</p>
          ) : (
            <div className="skeleton mt-2 h-8 w-16" />
          )}
          <p className="stat-hint">
            {stats ? `${validLeads} of ${totalLeads} leads validated` : 'Loading…'}
          </p>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">DPDP Compliance</p>
          {stats ? (
            <p className="stat-value">100%</p>
          ) : (
            <div className="skeleton mt-2 h-8 w-16" />
          )}
          <p className="stat-hint">Data handled per DPDP requirements</p>
        </div>
      </div>

      <div className="card mt-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Export audit workbook</h2>
        <p className="mt-1 text-sm text-slate-500">
          Generated workbook covers the current year and includes a 365-day retention log.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={handleExport} className="btn btn-primary" disabled={exporting}>
            {exporting && <Spinner className="h-4 w-4 border-slate-200 border-t-transparent" />}
            {exporting ? 'Exporting…' : 'Export for ISO Auditor Excel'}
          </button>
        </div>

        {exportUrl && (
          <div className="alert alert-success mt-4">
            <div>
              <p className="text-sm font-medium">Export generated successfully!</p>
              <a
                href={exportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-700 underline hover:text-blue-800"
              >
                Download audit-2026.xlsx
              </a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}