'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserCheck, Briefcase, TrendingUp, DollarSign, Target, Activity, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  totalBuyers: number;
  totalDeals: number;
  closedDeals: number;
  totalRevenue: number;
  activeCampaigns: number;
  recentLeads: any[];
  recentDeals: any[];
  leadsByStatus: { status: string; count: number }[];
  dealsByStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3B82F6',
  contacted: '#8B5CF6',
  follow_up: '#F59E0B',
  under_contract: '#10B981',
  closed: '#059669',
  dead: '#6B7280',
  active: '#10B981',
  paused: '#F59E0B',
  draft: '#6B7280',
  completed: '#3B82F6',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeLeads: 0,
    totalBuyers: 0,
    totalDeals: 0,
    closedDeals: 0,
    totalRevenue: 0,
    activeCampaigns: 0,
    recentLeads: [],
    recentDeals: [],
    leadsByStatus: [],
    dealsByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [leadsRes, buyersRes, dealsRes, campaignsRes, recentLeadsRes, recentDealsRes] = await Promise.all([
        supabase.from('leads').select('id, status', { count: 'exact' }),
        supabase.from('cash_buyers').select('id', { count: 'exact' }),
        supabase.from('deals').select('id, status, purchase_price', { count: 'exact' }),
        supabase.from('campaigns').select('id, status', { count: 'exact' }),
        supabase.from('leads').select('id, first_name, last_name, address, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('deals').select('id, property_address, status, purchase_price, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const leads = leadsRes.data || [];
      const deals = dealsRes.data || [];
      const campaigns = campaignsRes.data || [];
      const closedDeals = deals.filter(d => d.status === 'closed');
      const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.purchase_price || 0), 0);

      // Group leads by status
      const leadStatusMap: Record<string, number> = {};
      leads.forEach(l => { leadStatusMap[l.status] = (leadStatusMap[l.status] || 0) + 1; });
      const leadsByStatus = Object.entries(leadStatusMap).map(([status, count]) => ({ status, count }));

      // Group deals by status
      const dealStatusMap: Record<string, number> = {};
      deals.forEach(d => { dealStatusMap[d.status] = (dealStatusMap[d.status] || 0) + 1; });
      const dealsByStatus = Object.entries(dealStatusMap).map(([status, count]) => ({ status, count }));

      setStats({
        totalLeads: leadsRes.count || 0,
        activeLeads: leads.filter(l => ['new', 'contacted', 'follow_up'].includes(l.status)).length,
        totalBuyers: buyersRes.count || 0,
        totalDeals: dealsRes.count || 0,
        closedDeals: closedDeals.length,
        totalRevenue,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        recentLeads: recentLeadsRes.data || [],
        recentDeals: recentDealsRes.data || [],
        leadsByStatus,
        dealsByStatus,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const kpiCards = [
    { title: 'Total Leads', value: stats.totalLeads, sub: `${stats.activeLeads} active`, icon: Users, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { title: 'Cash Buyers', value: stats.totalBuyers, sub: 'in database', icon: UserCheck, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    { title: 'Total Deals', value: stats.totalDeals, sub: `${stats.closedDeals} closed`, icon: Briefcase, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    { title: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'from closed deals', icon: DollarSign, color: 'green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    { title: 'Active Campaigns', value: stats.activeCampaigns, sub: 'running now', icon: Target, color: 'pink', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    { title: 'Close Rate', value: stats.totalDeals > 0 ? `${Math.round((stats.closedDeals / stats.totalDeals) * 100)}%` : '0%', sub: 'deals to closed', icon: TrendingUp, color: 'teal', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <Activity className="animate-pulse w-5 h-5" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Good Faith Property Group — Wholesaling OS</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
          <Activity className="w-3 h-3" />
          <span>Live data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className={`bg-white rounded-xl border ${card.border} p-4 flex items-start gap-4`}>
            <div className={`${card.bg} ${card.text} p-2.5 rounded-lg`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Status</h3>
          {stats.leadsByStatus.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No lead data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.leadsByStatus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Deals by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Deals by Status</h3>
          {stats.dealsByStatus.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No deal data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.dealsByStatus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Leads</h3>
            <a href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No leads yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.first_name} {lead.last_name}</p>
                    <p className="text-xs text-gray-400">{lead.address || 'No address'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    lead.status === 'contacted' ? 'bg-purple-100 text-purple-700' :
                    lead.status === 'closed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{lead.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Deals</h3>
            <a href="/deals" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          {stats.recentDeals.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No deals yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentDeals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deal.property_address || 'No address'}</p>
                    <p className="text-xs text-gray-400">{deal.purchase_price ? `$${Number(deal.purchase_price).toLocaleString()}` : 'Price TBD'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    deal.status === 'closed' ? 'bg-green-100 text-green-700' :
                    deal.status === 'under_contract' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{deal.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}'use client';
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
