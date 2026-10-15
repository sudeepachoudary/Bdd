import React from 'react';
import {
  Package,
  Truck,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { DashboardStats } from '../types/index';
import { MetricCard } from './MetricCard';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: string) => void;
  onTrackShipment: (id: string) => void;
  aiInsight?: string;
  loadingAi: boolean;
  onRequestAiInsight: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigateTab,
  onTrackShipment,
  aiInsight,
  loadingAi,
  onRequestAiInsight
}) => {
  if (!stats) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#17191c] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#777b86]">Loading DataCo Supply Chain Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Steep Style Reference Editorial Hero Header */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-8 lg:p-10 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f2f2f3] text-[#17191c] text-xs font-medium">
              <Activity className="w-3.5 h-3.5 text-[#17191c]" />
              <span>Real-Time Event Sourcing</span>
            </div>
            <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#17191c] tracking-[-0.025em] font-normal leading-[1.12]">
              DataCo Global Supply Chain <span className="italic font-normal">Command Center</span>
            </h1>
            <p className="text-[#777b86] text-xs sm:text-sm font-normal max-w-2xl leading-relaxed">
              Real-time monitoring across 50,000+ active global orders, embedded shipment event histories, and warehouse stock capacities.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-5 py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all shadow-xs flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Manage Orders</span>
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="px-5 py-2.5 rounded-full border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] font-medium text-xs transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#17191c]" />
              <span>Run Aggregations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle={`Valuation: $${(stats.totalOrderValue / 1000000).toFixed(1)}M`}
          badge="DataCo Active"
          badgeColor="cyan"
          icon={Package}
        />

        <MetricCard
          title="Total Shipments"
          value={stats.totalShipments.toLocaleString()}
          subtitle="Embedded Event Logs"
          badge="Tracked"
          badgeColor="indigo"
          icon={Truck}
        />

        <MetricCard
          title="On-Time Delivery Rate"
          value={`${stats.onTimeRate}%`}
          subtitle={`${stats.onTimeDeliveries.toLocaleString()} On-Time`}
          badge="High Reliability"
          badgeColor="emerald"
          icon={ShieldCheck}
        />

        <MetricCard
          title="Delayed Deliveries"
          value={stats.delayedDeliveries.toLocaleString()}
          subtitle="Carriers Flagged"
          badge="Action Required"
          badgeColor="rose"
          icon={AlertTriangle}
        />
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Fulfillment Warehouses"
          value={stats.totalWarehouses}
          subtitle="Chicago, LA, Hamburg, Shanghai..."
          badge="Operational"
          badgeColor="slate"
          icon={Building2}
        />

        <MetricCard
          title="Global Suppliers"
          value={stats.totalSuppliers}
          subtitle="Apex, GlobalTech, EuroFreight..."
          badge="Active Supply"
          badgeColor="emerald"
          icon={Users}
        />

        <MetricCard
          title="Avg Transit Time"
          value="4.2 Days"
          subtitle="Benchmark: 4.5 Days"
          badge="-0.3 Days Faster"
          badgeColor="emerald"
          icon={Clock}
        />
      </div>

      {/* Editorial Peach Accent Callout: AI Bottleneck Insights */}
      <div className="bg-[#fbe1d1] text-[#5d2a1a] rounded-[24px] p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#5d2a1a]/10 text-[#5d2a1a]">
              <Sparkles className="w-5 h-5 text-[#5d2a1a]" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl text-[#5d2a1a] font-normal">
                Supply Chain Bottleneck Diagnostic <span className="italic">(Gemini AI)</span>
              </h3>
              <p className="text-xs text-[#5d2a1a]/80 mt-0.5">Automated diagnostic report generated from MongoDB aggregate metrics</p>
            </div>
          </div>

          <button
            onClick={onRequestAiInsight}
            disabled={loadingAi}
            className="px-5 py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            {loadingAi ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>
        </div>

        <div className="p-5 rounded-[16px] bg-white/90 text-[#5d2a1a] text-xs leading-relaxed font-sans font-normal border border-[#5d2a1a]/10">
          {aiInsight ? (
            <div className="whitespace-pre-line">{aiInsight}</div>
          ) : (
            <p className="text-[#5d2a1a]/70 italic">Click "Refresh AI Analysis" to perform server-side bottleneck diagnostic.</p>
          )}
        </div>
      </div>

      {/* Main Grid: Recent Event Stream & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Mist Gray Activity Log Container */}
        <div className="lg:col-span-2 bg-[#f2f2f3] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ececec]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-white text-[#17191c]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg text-[#17191c] font-normal">Recent Embedded Event Stream</h3>
                <p className="text-[11px] text-[#777b86]">Live provenance updates from MongoDB shipments.events arrays</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('shipments')}
              className="text-xs font-medium text-[#17191c] hover:underline flex items-center gap-1"
            >
              <span>View All Shipments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {stats.recentEvents.map((evt, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-[16px] border border-[#ececec] shadow-xs flex items-start justify-between gap-3 hover:border-[#17191c]/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-[#f2f2f3]">
                    {evt.event === 'Delivered' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
                    ) : evt.event === 'In Transit' ? (
                      <Truck className="w-3.5 h-3.5 text-[#17191c]" />
                    ) : evt.event === 'Dispatched' ? (
                      <Package className="w-3.5 h-3.5 text-[#17191c]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#b06000]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#17191c]">{evt.event}</span>
                      <button
                        onClick={() => onTrackShipment(evt.shipmentId)}
                        className="text-[11px] font-mono font-medium text-[#17191c] hover:underline bg-[#f2f2f3] px-2 py-0.5 rounded-full"
                      >
                        {evt.shipmentId}
                      </button>
                      <span className="text-[11px] text-[#777b86]">({evt.carrier})</span>
                    </div>
                    <p className="text-xs text-[#777b86] mt-0.5">{evt.location}</p>
                    {evt.notes && <p className="text-[11px] text-[#979799] italic">{evt.notes}</p>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-[#979799] font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Floating White Product Artifacts */}
        <div className="space-y-6">
          {/* System Health Card */}
          <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="font-serif-display text-lg text-[#17191c] font-normal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#137333]" />
              <span>MongoDB Engine Health</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#f2f2f3]">
                <span className="text-[#777b86]">Database Engine</span>
                <span className="font-medium text-[#17191c]">MongoDB Atlas / Mingo</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f2f2f3]">
                <span className="text-[#777b86]">Active Collections</span>
                <span className="font-medium text-[#17191c]">3 Collections</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f2f2f3]">
                <span className="text-[#777b86]">Query Latency</span>
                <span className="font-semibold text-[#137333]">&lt; 12 ms</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#777b86]">Event Sourcing Model</span>
                <span className="font-medium text-[#17191c]">Embedded Array</span>
              </div>
            </div>
          </div>

          {/* Aggregation Shortcuts */}
          <div className="bg-[#f2f2f3] rounded-[24px] p-6 text-[#17191c] space-y-3">
            <h3 className="font-serif-display text-lg font-normal">Explore Aggregations</h3>
            <p className="text-xs text-[#777b86] leading-relaxed">
              View On-Time Rate, Regional Delivery Days, and Top Delayed Shipping Routes.
            </p>

            <button
              onClick={() => onNavigateTab('analytics')}
              className="w-full py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Open Analytics Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

