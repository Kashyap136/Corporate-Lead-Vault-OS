'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState('');

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
    fetch(`/api/leads/stats?companyId=${company.id}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [company]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/audit/export?companyId=${company.id}&year=2026`);
      const data = await res.json();
      setExportUrl(data.fileUrl);
    } catch (err) {
      console.error('Export failed');
    }
    setExporting(false);
  };

  const totalLeads = stats ? stats.new + stats.contacted + stats.closed : 0;
  const validLeads = stats ? stats.contacted + stats.closed : 0;
  const scorePercent = totalLeads > 0 ? ((validLeads / totalLeads) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Audit</h1>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
          <a href="/leads" className="text-blue-600 hover:underline text-sm">Leads</a>
          <a href="/roi-calc" className="text-blue-600 hover:underline text-sm">ROI Calc</a>
          <a href="/seo" className="text-blue-600 hover:underline text-sm">SEO</a>
          <button
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="text-red-600 hover:underline text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">ISO Audit Export</h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Audit Status</p>
              <p className="text-xl font-bold text-blue-600">audit ready</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold text-green-600">{scorePercent}%</p>
              <p className="text-xs text-gray-400">{validLeads}/{totalLeads} * 100</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">DPDP Compliance</p>
              <p className="text-xl font-bold text-green-600">100%</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
          >
            {exporting ? 'Exporting...' : 'Export for ISO Auditor Excel'}
          </button>

          {exportUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2">Export generated successfully!</p>
              <a
                href={exportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Download audit-2026.xlsx
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
