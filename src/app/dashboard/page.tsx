'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  totalBuyers: number;
  totalDeals: number;
  closedDeals: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeLeads: 0,
    totalBuyers: 0,
    totalDeals: 0,
    closedDeals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [leadsRes, buyersRes, dealsRes] = await Promise.all([
        supabase.from('leads').select('id, status', { count: 'exact' }),
        supabase.from('cash_buyers').select('id', { count: 'exact' }),
        supabase.from('deals').select('id, status, purchase_price', { count: 'exact' }),
      ]);

      const leads = leadsRes.data || [];
      const deals = dealsRes.data || [];
      const closedDeals = deals.filter(d => d.status === 'closed');
      const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.purchase_price || 0), 0);

      setStats({
        totalLeads: leadsRes.count || 0,
        activeLeads: leads.filter(l => ['new', 'contacted', 'follow_up'].includes(l.status)).length,
        totalBuyers: buyersRes.count || 0,
        totalDeals: dealsRes.count || 0,
        closedDeals: closedDeals.length,
        totalRevenue,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">KPI Dashboard</h1>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Leads" value={stats.totalLeads} color="blue" />
          <StatCard title="Active Leads" value={stats.activeLeads} color="green" />
          <StatCard title="Cash Buyers" value={stats.totalBuyers} color="purple" />
          <StatCard title="Total Deals" value={stats.totalDeals} color="orange" />
          <StatCard title="Closed Deals" value={stats.closedDeals} color="green" />
          <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="emerald" />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`rounded-lg border p-6 ${colorMap[color] || colorMap.blue}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
