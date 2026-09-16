'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ROICalcPage() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ factoryArea: '', powerBill: '', manpower: '', currentCost: '' });
  const [result, setResult] = useState(null);
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

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/roi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company?.id,
          factoryArea: parseFloat(form.factoryArea),
          powerBill: parseFloat(form.powerBill),
          manpower: parseFloat(form.manpower),
          currentCost: parseFloat(form.currentCost)
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Calculation failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ROI Calculator</h1>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
          <a href="/leads" className="text-blue-600 hover:underline text-sm">Leads</a>
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

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Internal ROI Calculator</h2>

          <form onSubmit={handleCalculate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factory Area (sq ft)</label>
                <input
                  type="number"
                  value={form.factoryArea}
                  onChange={(e) => setForm({ ...form, factoryArea: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Power Bill (monthly)</label>
                <input
                  type="number"
                  value={form.powerBill}
                  onChange={(e) => setForm({ ...form, powerBill: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 150000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manpower</label>
                <input
                  type="number"
                  value={form.manpower}
                  onChange={(e) => setForm({ ...form, manpower: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Cost</label>
                <input
                  type="number"
                  value={form.currentCost}
                  onChange={(e) => setForm({ ...form, currentCost: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 500000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Savings</p>
                  <p className="text-2xl font-bold text-green-600">₹{result.savings?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ROI %</p>
                  <p className="text-2xl font-bold text-green-600">{result.roiPercent?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
