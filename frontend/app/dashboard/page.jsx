'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [hotLeads, setHotLeads] = useState([]);
  const [company, setCompany] = useState(null);

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
        const statsRes = await fetch(`/api/leads/stats?companyId=${company.id}`);
        const statsData = await statsRes.json();
        setStats(statsData);

        const leadsRes = await fetch(`/api/leads/list?companyId=${company.id}&source=`);
        const leadsData = await leadsRes.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const hot = leadsData.filter(l =>
          l.score === 'hot' && new Date(l.createdAt) >= thirtyDaysAgo
        );
        setHotLeads(hot);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      }
    };

    fetchData();
  }, [company]);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalLeads = stats.new + stats.contacted + stats.closed;
  const closedPercent = totalLeads > 0 ? ((stats.closed / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Lead Vault Dashboard</h1>
        <div className="flex gap-4 items-center">
          <a href="/leads" className="text-blue-600 hover:underline text-sm">Leads</a>
          <a href="/roi-calc" className="text-blue-600 hover:underline text-sm">ROI Calc</a>
          <a href="/seo" className="text-blue-600 hover:underline text-sm">SEO</a>
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
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-blue-600">{totalLeads}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Hot Leads</p>
            <p className="text-3xl font-bold text-red-600">{stats.hot}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Closed %</p>
            <p className="text-3xl font-bold text-green-600">{closedPercent}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Hot Leads — Last 30 Days</h2>
          {hotLeads.length === 0 ? (
            <p className="text-gray-500">No hot leads in the last 30 days.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Source</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((lead) => (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{lead.name}</td>
                    <td className="py-2">{lead.phone}</td>
                    <td className="py-2">{lead.email}</td>
                    <td className="py-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{lead.source}</span>
                    </td>
                    <td className="py-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
