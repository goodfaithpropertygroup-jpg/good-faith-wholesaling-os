'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Home, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface Deal {
  id: string;
  property_address: string;
  status: string;
  purchase_price: number | null;
  arv: number | null;
  assigned_buyer: string | null;
  close_date: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ['new', 'analyzing', 'under_contract', 'assigned', 'closed', 'dead'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  analyzing: 'bg-yellow-100 text-yellow-700',
  under_contract: 'bg-purple-100 text-purple-700',
  assigned: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-100 text-green-700',
  dead: 'bg-gray-100 text-gray-600',
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [blasting, setBlasting] = useState<string | null>(null);
  const [blastResult, setBlastResult] = useState<{ deal_id: string; message: string; success: boolean } | null>(null);
  const [form, setForm] = useState({
    property_address: '',
    status: 'new',
    purchase_price: '',
    arv: '',
    assigned_buyer: '',
    close_date: '',
    notes: '',
  });

  useEffect(() => { fetchDeals(); }, [statusFilter]);

  async function fetchDeals() {
    let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data } = await query;
    if (data) setDeals(data);
    setLoading(false);
  }

  async function addDeal() {
    if (!form.property_address.trim()) return;
    const { error } = await supabase.from('deals').insert([{
      ...form,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      arv: form.arv ? Number(form.arv) : null,
    }]);
    if (!error) {
      setShowModal(false);
      setForm({ property_address: '', status: 'new', purchase_price: '', arv: '', assigned_buyer: '', close_date: '', notes: '' });
      fetchDeals();
    }
  }

  async function blastBuyers(dealId: string) {
    setBlasting(dealId);
    setBlastResult(null);
    try {
      const res = await fetch('/api/automations/buyer-blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
        body: JSON.stringify({ deal_id: dealId }),
      });
      const data = await res.json();
      setBlastResult({ deal_id: dealId, message: data.message || `Sent to ${data.sent} buyers`, success: res.ok });
      if (res.ok) fetchDeals();
    } catch {
      setBlastResult({ deal_id: dealId, message: 'Failed to send blast', success: false });
    } finally {
      setBlasting(null);
    }
  }

  const equity = (d: Deal) => d.arv && d.purchase_price ? d.arv - d.purchase_price : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Track your wholesale deals from lead to close</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          + Add Deal
        </button>
      </div>

      {/* Blast Result Notification */}
      {blastResult && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${blastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {blastResult.success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p className={`text-sm font-medium ${blastResult.success ? 'text-green-700' : 'text-red-700'}`}>{blastResult.message}</p>
          <button onClick={() => setBlastResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Deals Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading deals...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No deals yet.</p>
          <p className="text-gray-400 text-sm mt-1">Add your first deal to start tracking your pipeline.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Deal
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Property', 'Status', 'Purchase $', 'ARV', 'Equity', 'Buyer', 'Close Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deals.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.property_address || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600'}`}>
                        {d.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.purchase_price ? `$${Number(d.purchase_price).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.arv ? `$${Number(d.arv).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">
                      {equity(d) !== null ? (
                        <span className="text-green-600 font-medium">`$${equity(d)!.toLocaleString()}`</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.assigned_buyer || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.close_date ? new Date(d.close_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      {d.status !== 'closed' && d.status !== 'dead' && (
                        <button
                          onClick={() => blastBuyers(d.id)}
                          disabled={blasting === d.id}
                          className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                          title="Blast this deal to all active buyers"
                        >
                          <Send className="w-3 h-3" />
                          {blasting === d.id ? 'Sending...' : 'Blast Buyers'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Deal</h2>
              <p className="text-sm text-gray-500 mt-1">Enter the property and deal details below</p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Address *</label>
                <input
                  value={form.property_address}
                  onChange={e => setForm({...form, property_address: e.target.value})}
                  placeholder="123 Main St, City, State"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Close Date</label>
                  <input
                    type="date"
                    value={form.close_date}
                    onChange={e => setForm({...form, close_date: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    value={form.purchase_price}
                    onChange={e => setForm({...form, purchase_price: e.target.value})}
                    placeholder="150000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ARV ($)</label>
                  <input
                    type="number"
                    value={form.arv}
                    onChange={e => setForm({...form, arv: e.target.value})}
                    placeholder="220000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Buyer</label>
                <input
                  value={form.assigned_buyer}
                  onChange={e => setForm({...form, assigned_buyer: e.target.value})}
                  placeholder="Buyer name or email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Deal notes, conditions, etc."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addDeal}
                disabled={!form.property_address.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
