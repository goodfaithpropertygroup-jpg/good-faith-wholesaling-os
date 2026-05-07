'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ seller_name: '', property_address: '', city: '', state: 'TX', asking_price: '', mao: '', seller_phone: '', seller_email: '', status: 'new', notes: '' });

  useEffect(() => { fetchLeads(); }, [filter]);

  async function fetchLeads() {
        setLoading(true);
        let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (filter !== 'all') q = q.eq('status', filter);
        const { data } = await q;
        setLeads(data || []);
        setLoading(false);
  }

  async function saveLead() {
        await supabase.from('leads').insert([{ ...form, asking_price: Number(form.asking_price), mao: Number(form.mao) }]);
        setShowForm(false);
        setForm({ seller_name: '', property_address: '', city: '', state: 'TX', asking_price: '', mao: '', seller_phone: '', seller_email: '', status: 'new', notes: '' });
        fetchLeads();
  }

  const statuses = ['new','contacted','follow_up','under_contract','closed','dead'];

  return (
        <div className="min-h-screen bg-gray-50">
              <nav className="bg-white border-b px-6 h-14 flex items-center gap-6">
                      <span className="font-bold">Good Faith OS</span>span>
                {['/dashboard','/leads','/buyers','/deals','/campaigns'].map(h => (
                    <Link key={h} href={h} className="text-sm text-gray-600 hover:text-gray-900">{h.slice(1)}</Link>Link>
                  ))}
              </nav>nav>
              <div className="max-w-7xl mx-auto px-4 py-6">
                      <div className="flex justify-between mb-4">
                                <h1 className="text-2xl font-bold">Leads CRM</h1>h1>
                                <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Lead</button>button>
                      </div>div>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {['all',...statuses].map(s => (
                      <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs ${filter===s?'bg-blue-600 text-white':'bg-white border'}`}>{s}</button>button>
                    ))}
                      </div>div>
                {loading ? <p>Loading...</p>p> : (
                        <table className="w-full bg-white rounded-lg shadow text-sm">
                                    <thead><tr className="border-b bg-gray-50">
                                      {['Seller','Address','Status','Asking','MAO','Phone'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>th>)}
                                    </tr>tr></thead>thead>
                                    <tbody>{leads.map(l=>(
                        <tr key={l.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{l.seller_name}</td>td>
                                        <td className="px-4 py-3">{l.property_address}, {l.city}, {l.state}</td>td>
                                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{l.status}</span>span></td>td>
                                        <td className="px-4 py-3">${l.asking_price?.toLocaleString()}</td>td>
                                        <td className="px-4 py-3">${l.mao?.toLocaleString()}</td>td>
                                        <td className="px-4 py-3">{l.seller_phone}</td>td>
                        </tr>tr>
                      ))}</tbody>tbody>
                        </table>table>
                      )}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
                                              <h2 className="font-bold text-lg mb-4">Add Lead</h2>h2>
                                              <div className="space-y-3">
                                                {[['seller_name','Seller Name'],['property_address','Address'],['city','City'],['state','State'],['asking_price','Asking Price'],['mao','MAO'],['seller_phone','Phone'],['seller_email','Email'],['notes','Notes']].map(([k,l])=>(
                                        <div key={k}><label className="text-xs text-gray-500">{l}</label>label>
                                                            <input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full border rounded px-2 py-1 text-sm mt-0.5"/>
                                        </div>div>
                                      ))}
                                                              <div><label className="text-xs text-gray-500">Status</label>label>
                                                                                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border rounded px-2 py-1 text-sm mt-0.5">
                                                                                  {statuses.map(s=><option key={s}>{s}</option>option>)}
                                                                                </select>select>
                                                              </div>div>
                                              </div>div>
                                              <div className="flex gap-2 mt-4">
                                                              <button onClick={saveLead} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save</button>button>
                                                              <button onClick={()=>setShowForm(false)} className="border px-4 py-2 rounded text-sm">Cancel</button>button>
                                              </div>div>
                                </div>div>
                    </div>div>
                      )}
              </div>div>
        </div>div>
      );
}</div>
