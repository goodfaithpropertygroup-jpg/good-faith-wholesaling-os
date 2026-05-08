'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
    leads_count: number;
    sent_count: number;
    response_count: number;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'sms', status: 'draft', start_date: '', end_date: '' });

  const supabase = createClient();

  useEffect(() => {
        fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
        const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (data) setCampaigns(data);
        setLoading(false);
  }

  async function addCampaign() {
        const { error } = await supabase.from('campaigns').insert([{
                ...form,
                leads_count: 0,
                sent_count: 0,
                response_count: 0,
        }]);
        if (!error) {
                setShowModal(false);
                setForm({ name: '', type: 'sms', status: 'draft', start_date: '', end_date: '' });
                fetchCampaigns();
        }
  }

  const statusColor: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
  };

  const typeLabel: Record<string, string> = {
        sms: 'SMS',
        email: 'Email',
        direct_mail: 'Direct Mail',
        cold_call: 'Cold Call',
        mixed: 'Mixed',
  };

  return (
        <div className="min-h-screen bg-gray-50 p-6">
              <div className="max-w-7xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                                <div>
                                            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                                            <p className="text-sm text-gray-500 mt-1">Track your outreach campaigns and response rates</p>
                                </div>
                                <button
                                              onClick={() => setShowModal(true)}
                                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                                            >
                                            + New Campaign
                                </button>
                      </div>
              
                {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
          { label: 'Total Campaigns', value: campaigns.length },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length },
          { label: 'Total Leads Reached', value: campaigns.reduce((a, c) => a + (c.sent_count || 0), 0) },
          { label: 'Total Responses', value: campaigns.reduce((a, c) => a + (c.response_count || 0), 0) },
                    ].map(stat => (
                                  <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                                <p className="text-xs text-gray-500">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                  </div>
                                ))}
                      </div>
              
                {/* Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                      <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                    ) : campaigns.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No campaigns yet. Create your first campaign!</div>
                    ) : (
                      <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                      {['Name', 'Type', 'Status', 'Leads', 'Sent', 'Responses', 'Rate', 'Start Date', 'End Date'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                          ))}
                                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {campaigns.map(c => (
                                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                                                              <td className="px-4 py-3 text-gray-600">{typeLabel[c.type] || c.type}</td>
                                                              <td className="px-4 py-3">
                                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                                                                      {c.status}
                                                                                      </span>
                                                              </td>
                                                              <td className="px-4 py-3 text-gray-600">{c.leads_count || 0}</td>
                                                              <td className="px-4 py-3 text-gray-600">{c.sent_count || 0}</td>
                                                              <td className="px-4 py-3 text-gray-600">{c.response_count || 0}</td>
                                                              <td className="px-4 py-3 text-gray-600">
                                                                {c.sent_count > 0 ? `${((c.response_count / c.sent_count) * 100).toFixed(1)}%` : '-'}
                                                              </td>
                                                              <td className="px-4 py-3 text-gray-600">{c.start_date ? new Date(c.start_date).toLocaleDateString() : '-'}</td>
                                                              <td className="px-4 py-3 text-gray-600">{c.end_date ? new Date(c.end_date).toLocaleDateString() : '-'}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                      </table>
                                )}
                      </div>
              </div>
        
          {/* Add Campaign Modal */}
          {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                                        <h2 className="text-lg font-semibold mb-4">New Campaign</h2>
                                        <div className="space-y-3">
                                                      <input
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Campaign Name"
                                                                        value={form.name}
                                                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                                      />
                                                      <select
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        value={form.type}
                                                                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                                                      >
                                                                      <option value="sms">SMS</option>
                                                                      <option value="email">Email</option>
                                                                      <option value="direct_mail">Direct Mail</option>
                                                                      <option value="cold_call">Cold Call</option>
                                                                      <option value="mixed">Mixed</option>
                                                      </select>
                                                      <select
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        value={form.status}
                                                                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                                                      >
                                                                      <option value="draft">Draft</option>
                                                                      <option value="active">Active</option>
                                                                      <option value="paused">Paused</option>
                                                                      <option value="completed">Completed</option>
                                                      </select>
                                                      <input
                                                                        type="date"
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Start Date"
                                                                        value={form.start_date}
                                                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                                                      />
                                                      <input
                                                                        type="date"
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="End Date"
                                                                        value={form.end_date}
                                                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                                                      />
                                        </div>
                                        <div className="flex gap-3 mt-5">
                                                      <button
                                                                        onClick={() => setShowModal(false)}
                                                                        className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                                                                      >
                                                                      Cancel
                                                      </button>
                                                      <button
                                                                        onClick={addCampaign}
                                                                        disabled={!form.name}
                                                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                                                                      >
                                                                      Create Campaign
                                                      </button>
                                        </div>
                            </div>
                  </div>
              )}
        </div>
      );
}</div>
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
    leads_count: number;
    sent_count: number;
    response_count: number;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'sms', status: 'draft', start_date: '', end_date: '' });

  const supabase = createClient();

  useEffect(() => {
        fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
        const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (data) setCampaigns(data);
        setLoading(false);
  }

  async function addCampaign() {
        const { error } = await supabase.from('campaigns').insert([{
                ...form,
                leads_count: 0,
                sent_count: 0,
                response_count: 0,
        }]);
        if (!error) {
                setShowModal(false);
                setForm({ name: '', type: 'sms', status: 'draft', start_date: '', end_date: '' });
                fetchCampaigns();
        }
  }

  const statusColor: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
  };

  const typeLabel: Record<string, string> = {
        sms: 'SMS',
        email: 'Email',
        direct_mail: 'Direct Mail',
        cold_call: 'Cold Call',
        mixed: 'Mixed',
  };

  return (
        <div className="min-h-screen bg-gray-50 p-6">
              <div className="max-w-7xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                                <div>
                                            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>h1>
                                            <p className="text-sm text-gray-500 mt-1">Track your outreach campaigns and response rates</p>p>
                                </div>div>
                                <button
                                              onClick={() => setShowModal(true)}
                                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                                            >
                                            + New Campaign
                                </button>button>
                      </div>div>
              
                {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
          { label: 'Total Campaigns', value: campaigns.length },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length },
          { label: 'Total Leads Reached', value: campaigns.reduce((a, c) => a + (c.sent_count || 0), 0) },
          { label: 'Total Responses', value: campaigns.reduce((a, c) => a + (c.response_count || 0), 0) },
                    ].map(stat => (
                                  <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                                <p className="text-xs text-gray-500">{stat.label}</p>p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>p>
                                  </div>div>
                                ))}
                      </div>div>
              
                {/* Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                      <div className="p-8 text-center text-gray-500">Loading campaigns...</div>div>
                    ) : campaigns.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No campaigns yet. Create your first campaign!</div>div>
                    ) : (
                      <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                      {['Name', 'Type', 'Status', 'Leads', 'Sent', 'Responses', 'Rate', 'Start Date', 'End Date'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>th>
                                          ))}
                                                    </tr>tr>
                                    </thead>thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {campaigns.map(c => (
                                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>td>
                                                              <td className="px-4 py-3 text-gray-600">{typeLabel[c.type] || c.type}</td>td>
                                                              <td className="px-4 py-3">
                                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-700'}`}>
                                                                                      {c.status}
                                                                                      </span>span>
                                                              </td>td>
                                                              <td className="px-4 py-3 text-gray-600">{c.leads_count || 0}</td>td>
                                                              <td className="px-4 py-3 text-gray-600">{c.sent_count || 0}</td>td>
                                                              <td className="px-4 py-3 text-gray-600">{c.response_count || 0}</td>td>
                                                              <td className="px-4 py-3 text-gray-600">
                                                                {c.sent_count > 0 ? `${((c.response_count / c.sent_count) * 100).toFixed(1)}%` : '-'}
                                                              </td>td>
                                                              <td className="px-4 py-3 text-gray-600">{c.start_date ? new Date(c.start_date).toLocaleDateString() : '-'}</td>td>
                                                              <td className="px-4 py-3 text-gray-600">{c.end_date ? new Date(c.end_date).toLocaleDateString() : '-'}</td>td>
                                          </tr>tr>
                                        ))}
                                    </tbody>tbody>
                      </table>table>
                                )}
                      </div>div>
              </div>div>
        
          {/* Add Campaign Modal */}
          {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                                        <h2 className="text-lg font-semibold mb-4">New Campaign</h2>h2>
                                        <div className="space-y-3">
                                                      <input
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Campaign Name"
                                                                        value={form.name}
                                                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                                      />
                                                      <select
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        value={form.type}
                                                                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                                                      >
                                                                      <option value="sms">SMS</option>option>
                                                                      <option value="email">Email</option>option>
                                                                      <option value="direct_mail">Direct Mail</option>option>
                                                                      <option value="cold_call">Cold Call</option>option>
                                                                      <option value="mixed">Mixed</option>option>
                                                      </select>select>
                                                      <select
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        value={form.status}
                                                                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                                                      >
                                                                      <option value="draft">Draft</option>option>
                                                                      <option value="active">Active</option>option>
                                                                      <option value="paused">Paused</option>option>
                                                                      <option value="completed">Completed</option>option>
                                                      </select>select>
                                                      <input
                                                                        type="date"
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Start Date"
                                                                        value={form.start_date}
                                                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                                                      />
                                                      <input
                                                                        type="date"
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="End Date"
                                                                        value={form.end_date}
                                                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                                                      />
                                        </div>div>
                                        <div className="flex gap-3 mt-5">
                                                      <button
                                                                        onClick={() => setShowModal(false)}
                                                                        className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                                                                      >
                                                                      Cancel
                                                      </button>button>
                                                      <button
                                                                        onClick={addCampaign}
                                                                        disabled={!form.name}
                                                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                                                                      >
                                                                      Create Campaign
                                                      </button>button>
                                        </div>div>
                            </div>div>
                  </div>div>
              )}
        </div>div>
      );
}</div>
