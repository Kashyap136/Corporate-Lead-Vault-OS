'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SEOPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await fetch(`/api/seo/report?companyId=${company.id}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report');
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const csvContent = [
      ['Competitor Domain', 'Your Position', 'Competitor Position', 'Keywords'],
      ...report.rankingKeywords.map(k => [
        report.competitorDomains[0] || '',
        k.position,
        k.competitorPosition,
        k.keyword
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-report.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">SEO Report</h1>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
          <a href="/leads" className="text-blue-600 hover:underline text-sm">Leads</a>
          <a href="/roi-calc" className="text-blue-600 hover:underline text-sm">ROI Calc</a>
          <a href="/audit" className="text-blue-600 hover:underline text-sm">Audit</a>
          <button
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="text-red-600 hover:underline text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Google Ranking Mock Data</h2>
          <div className="flex gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Generating...' : 'Generate SEO Report'}
            </button>
            {report && (
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Download
              </button>
            )}
          </div>
        </div>

        {report && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">Domain: <span className="font-medium">{report.domain}</span></p>
              <p className="text-sm text-gray-600">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Competitor Domain</th>
                  <th className="text-left py-3 px-4">Your Position</th>
                  <th className="text-left py-3 px-4">Competitor Position</th>
                  <th className="text-left py-3 px-4">Keywords</th>
                </tr>
              </thead>
              <tbody>
                {report.rankingKeywords.map((kw, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{report.competitorDomains[i % report.competitorDomains.length]}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${kw.position <= 5 ? 'text-green-600' : kw.position <= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        #{kw.position}
                      </span>
                    </td>
                    <td className="py-3 px-4">#{kw.competitorPosition}</td>
                    <td className="py-3 px-4">{kw.keyword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
