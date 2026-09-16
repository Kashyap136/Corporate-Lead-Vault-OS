'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [company, setCompany] = useState(null);
  const [filter, setFilter] = useState({ status: '', source: '' });
  const [showAdd, setShowAdd] = useState(false);
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

    try {
      const res = await fetch(url);
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [company, filter]);

  const handleStatusChange = async (leadId, status) => {
    try {
      await fetch('/api/leads/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      });
      fetchLeads();
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLead, companyId: company.id })
      });

      if (res.ok) {
        setNewLead({ name: '', phone: '', email: '', source: 'Form', message: '' });
        setShowAdd(false);
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/audit/export?companyId=${company.id}&year=2026`);
      const data = await res.json();
      window.open(data.fileUrl, '_blank');
    } catch (err) {
      console.error('Failed to export');
    }
  };

  const getScoreBadge = (score) => {
    const colors = {
      hot: 'bg-red-100 text-red-800',
      warm: 'bg-yellow-100 text-yellow-800',
      cold: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`${colors[score] || colors.cold} px-2 py-1 rounded text-xs font-medium`}>
        {score}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    const colors = {
      ROIcalc: 'bg-purple-100 text-purple-800',
      Form: 'bg-blue-100 text-blue-800',
      Google: 'bg-red-100 text-red-800',
      WhatsApp: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`${colors[source] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs font-medium`}>
        {source}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Leads</h1>
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="proposal">Proposal</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filter.source}
              onChange={(e) => setFilter({ ...filter, source: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Sources</option>
              <option value="ROIcalc">ROIcalc</option>
              <option value="Form">Form</option>
              <option value="Google">Google</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              {showAdd ? 'Cancel' : '+ Add Lead'}
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              Export
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">New Lead</h3>
            <form onSubmit={handleCreateLead} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <select
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="Form">Form</option>
                <option value="ROIcalc">ROIcalc</option>
                <option value="Google">Google</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              <textarea
                placeholder="Message"
                value={newLead.message}
                onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm col-span-2"
                rows={3}
              />
              <div className="col-span-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Source</th>
                <th className="text-left py-3 px-4">Score</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Call</th>
                <th className="text-left py-3 px-4">WhatsApp</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{lead.name}</td>
                  <td className="py-3 px-4">{lead.phone}</td>
                  <td className="py-3 px-4">{lead.email}</td>
                  <td className="py-3 px-4">{getSourceBadge(lead.source)}</td>
                  <td className="py-3 px-4">{getScoreBadge(lead.score)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="proposal">proposal</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Call
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={async () => {
                        const resp = await fetch('/api/whatsapp/lead-alert', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ leadId: lead._id })
                        });
                        const data = await resp.json();
                        alert(`WhatsApp status: ${data.whatsappStatus || 'unknown'}`);
                      }}
                      className="text-green-600 hover:underline text-xs"
                    >
                      WhatsApp
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
