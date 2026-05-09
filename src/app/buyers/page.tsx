'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Buyer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  rank_score: number;
  proof_of_funds: boolean;
  max_purchase_price: number;
  preferred_areas: string;
  deals_closed: number;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    max_purchase_price: '', preferred_areas: '',
    status: 'active', proof_of_funds: false
  });

  useEffect(() => { fetchBuyers(); }, []);

  async function fetchBuyers() {
    const { data } = await supabase.from('cash_buyers').select('*').order('rank_score', { ascending: false });
    if (data) setBuyers(data);
    setLoading(false);
  }

  async function addBuyer() {
    const { error } = await supabase.from('cash_buyers').insert([{
      ...form,
      max_purchase_price: form.max_purchase_price ? parseFloat(form.max_purchase_price) : null,
      rank_score: 50,
      deals_closed: 0,
    }]);
    if (!error) {
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', max_purchase_price: '', preferred_areas: '', status: 'active', proof_of_funds: false });
      fetchBuyers();
    }
  }

  const rankColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Buyers Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your buyer list and track scores</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Add Buyer
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading buyers...</div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No buyers yet. Add your first cash buyer!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyers.map((buyer) => (
            <div key={buyer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{buyer.first_name} {buyer.last_name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${rankColor(buyer.rank_score || 0)}`}>
                    Score: {buyer.rank_score || 0}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${buyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {buyer.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {buyer.email && <p>{buyer.email}</p>}
                {buyer.phone && <p>{buyer.phone}</p>}
                {buyer.preferred_areas && <p className="text-xs text-gray-500">Areas: {buyer.preferred_areas}</p>}
                {buyer.max_purchase_price && <p className="text-xs text-gray-500">Max: ${buyer.max_purchase_price.toLocaleString()}</p>}
                <p className="text-xs text-gray-400 mt-2">Deals closed: {buyer.deals_closed || 0}{buyer.proof_of_funds ? ' | POF verified' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Add Cash Buyer</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Max Purchase Price" type="number" value={form.max_purchase_price} onChange={e => setForm(f => ({ ...f, max_purchase_price: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Preferred Areas" value={form.preferred_areas} onChange={e => setForm(f => ({ ...f, preferred_areas: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.proof_of_funds} onChange={e => setForm(f => ({ ...f, proof_of_funds: e.target.checked }))} />
                Proof of Funds Verified
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={addBuyer} disabled={!form.first_name || !form.email} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Add Buyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
