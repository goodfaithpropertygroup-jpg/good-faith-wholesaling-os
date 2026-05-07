'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BuyersPage() {
    const [buyers, setBuyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
        supabase.from('cash_buyers').select('*').order('buyer_rank_score', { ascending: false })
          .then(({ data }) => { setBuyers(data || []); setLoading(false); });
  }, []);

  return (
        <div className="min-h-screen bg-gray-50">
              <nav className="bg-white border-b px-6 h-14 flex items-center gap-6">
                      <span className="font-bold">Good Faith OS</span>span>
                {['/dashboard','/leads','/buyers','/deals','/campaigns'].map(h => (
                    <Link key={h} href={h} className="text-sm text-gray-600 hover:text-gray-900">{h.slice(1)}</Link>Link>
                  ))}
              </nav>nav>
              <div className="max-w-7xl mx-auto px-4 py-6">
                      <h1 className="text-2xl font-bold mb-4">Cash Buyers Hub</h1>h1>
                {loading ? <p>Loading...</p>p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {buyers.map(b => (
                        <div key={b.id} className="bg-white rounded-lg shadow p-4">
                                        <div className="flex justify-between items-start mb-2">
                                                          <h3 className="font-bold">{b.buyer_name}</h3>h3>
                                                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Score: {b.buyer_rank_score || 0}</span>span>
                                        </div>div>
                                        <p className="text-sm text-gray-500">{b.email}</p>p>
                                        <p className="text-sm text-gray-500">{b.phone}</p>p>
                                        <p className="text-sm mt-2">Areas: {b.preferred_areas}</p>p>
                                        <p className="text-sm">Max: ${b.max_purchase_price?.toLocaleString()}</p>p>
                                        <p className="text-xs text-gray-400 mt-2">Response rate: {b.response_rate || 0}% | Deals: {b.deals_closed || 0}</p>p>
                        </div>div>
                      ))}
                        </div>div>
                      )}
              </div>div>
        </div>div>
      );
}</div>
