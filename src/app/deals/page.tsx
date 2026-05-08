'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DealsPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
        supabase.from('deals').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { setDeals(data || []); setLoading(false); });
  }, []);

  return (
        <div className="min-h-screen bg-gray-50">
              <nav className="bg-white border-b px-6 h-14 flex items-center gap-6">
                      <span className="font-bold">Good Faith OS</span>
                {['/dashboard','/leads','/buyers','/deals','/campaigns'].map(h => (
                    <Link key={h} href={h} className="text-sm text-gray-600 hover:text-gray-900">{h.slice(1)}</Link>
                  ))}
              </nav>
              <div className="max-w-7xl mx-auto px-4 py-6">
                      <h1 className="text-2xl font-bold mb-4">Deal Pipeline</h1>
                {loading ? <p>Loading...</p> : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                                    <table className="min-w-full text-sm">
                                                  <thead><tr className="bg-gray-50 border-b">
                                                    {['Property','Status','Purchase $','ARV','Buyer','Close Date'].map(h=>(
                            <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                          ))}
                                                  </tr></thead>
                                                  <tbody className="divide-y divide-gray-100">
                                                    {deals.map(d=>(
                            <tr key={d.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{d.property_address}</td>
                                                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{d.status}</span></td>
                                                <td className="px-4 py-3">${d.purchase_price?.toLocaleString()}</td>
                                                <td className="px-4 py-3">${d.arv?.toLocaleString()}</td>
                                                <td className="px-4 py-3">{d.assigned_buyer}</td>
                                                <td className="px-4 py-3">{d.close_date}</td>
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
