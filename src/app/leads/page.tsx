'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Lead {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      status: string;
      source: string;
      notes: string;
      asking_price: number | null;
      created_at: string;
}

export default function LeadsPage() {
      const [leads, setLeads] = useState<Lead[]>([]);
      const [loading, setLoading] = useState(true);
      const [showModal, setShowModal] = useState(false);
      const [statusFilter, setStatusFilter] = useState('all');
      const [form, setForm] = useState({
              first_name: '', last_name: '', email: '', phone: '',
              address: '', city: '', state: '', zip: '',
              status: 'new', source: 'cold_call', notes: '', asking_price: ''
      });

  const supabase = createClient();

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  async function fetchLeads() {
          let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
          if (statusFilter !== 'all') query = query.eq('status', statusFilter);
          const { data } = await query;
          if (data) setLeads(data);
          setLoading(false);
  }

  async function addLead() {
          const { error } = await supabase.from('leads').insert([{
                    ...form,
                    asking_price: form.asking_price ? parseFloat(form.asking_price) : null,
          }]);
          if (!error) {
                    setShowModal(false);
                    setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', status: 'new', source: 'cold_call', notes: '', asking_price: '' });
                    fetchLeads();
          }
  }

  const statusColors: Record<string, string> = {
          new: 'bg-blue-100 text-blue-700',
          contacted: 'bg-yellow-100 text-yellow-700',
          follow_up: 'bg-orange-100 text-orange-700',
          under_contract: 'bg-purple-100 text-purple-700',
          closed: 'bg-green-100 text-green-700',
          dead: 'bg-red-100 text-red-700',
  };

  const statuses = ['all', 'new', 'contacted', 'follow_up', 'under_contract', 'closed', 'dead'];

  return (
          <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                                  <div>
                                              <h1 className="text-2xl font-bold text-gray-900">Lead CRM</h1>
                                              <p className="text-sm text-gray-500 mt-1">Track and manage all your leads</p>
                                  </div>
                                  <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                              + Add Lead
                                  </button>
                        </div>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {statuses.map(s => (
                          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                              {s === 'all' ? 'All' : s.replace('_', ' ')}
                          </button>
                        ))}
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {loading ? (
                          <div className="p-8 text-center text-gray-500">Loading leads...</div>
                        ) : leads.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">No leads found. Add your first lead!</div>
                        ) : (
                          <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                                        <tr>
                                                            {['Name', 'Contact', 'Address', 'Status', 'Source', 'Asking Price', 'Date'].map(h => (
                                                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {leads.map(lead => (
                                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 font-medium text-gray-900">{lead.first_name} {lead.last_name}</td>
                                                                    <td className="px-4 py-3 text-gray-600">
                                                                                          <div>{lead.email}</div>
                                                                                          <div className="text-xs text-gray-400">{lead.phone}</div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-600">
                                                                                          <div>{lead.address}</div>
                                                                                          <div className="text-xs text-gray-400">{lead.city}, {lead.state} {lead.zip}</div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-100 text-gray-700'}`}>
                                                                                              {lead.status}
                                                                                              </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-600 capitalize">{lead.source?.replace('_', ' ')}</td>
                                                                    <td className="px-4 py-3 text-gray-600">{lead.asking_price ? `$${lead.asking_price.toLocaleString()}` : '-'}</td>
                                                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                                                </tr>
                                              ))}
                                        </tbody>
                          </table>
                                  )}
                        </div>
                </div>
              {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-screen overflow-y-auto">
                                            <h2 className="text-lg font-semibold mb-4">Add New Lead</h2>
                                            <div className="space-y-3">
                                                          <div className="grid grid-cols-2 gap-3">
                                                                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                                                                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                                                          </div>
                                                          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                                          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                                          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Property Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                                                          <div className="grid grid-cols-3 gap-3">
                                                                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                                                                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                                                                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Zip" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
                                                          </div>
                                                          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Asking Price" type="number" value={form.asking_price} onChange={e => setForm(f => ({ ...f, asking_price: e.target.value }))} />
                                                          <div className="grid grid-cols-2 gap-3">
                                                                          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                                                                            <option value="new">New</option>
                                                                                            <option value="contacted">Contacted</option>
                                                                                            <option value="follow_up">Follow Up</option>
                                                                                            <option value="under_contract">Under Contract</option>
                                                                                            <option value="closed">Closed</option>
                                                                                            <option value="dead">Dead</option>
                                                                          </select>
                                                                          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                                                                                            <option value="cold_call">Cold Call</option>
                                                                                            <option value="sms">SMS</option>
                                                                                            <option value="direct_mail">Direct Mail</option>
                                                                                            <option value="referral">Referral</option>
                                                                                            <option value="website">Website</option>
                                                                          </select>
                                                          </div>
                                                          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                                            </div>
                                            <div className="flex gap-3 mt-5">
                                                          <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                                          <button onClick={addLead} disabled={!form.first_name || !form.address} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Add Lead</button>
                                            </div>
                                </div>
                      </div>
                )}
          </div>
        );
}
