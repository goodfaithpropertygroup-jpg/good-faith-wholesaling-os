'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('deals').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setDeals(data || []); setLoading(false); });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Pipeline</h1>
      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              {['Property','Status','Purchase $','ARV','Buyer','Close Date'].map(h=>(
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {deals.length === 0 ? (<tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No deals yet.</td></tr>) :
                deals.map(d=>(
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.property_address}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{d.status}</span></td>
                    <td className="px-4 py-3">{d.purchase_price ? `$${d.purchase_price.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">{d.arv ? `$${d.arv.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">{d.assigned_buyer || '-'}</td>
                    <td className="px-4 py-3">{d.close_date || '-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
