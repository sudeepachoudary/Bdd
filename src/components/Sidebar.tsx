import React from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  Building2,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Boxes
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recordCount: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  collapsed,
  setCollapsed
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Management', icon: Package, badge: `${(recordCount / 1000).toFixed(0)}k+` },
    { id: 'shipments', label: 'Shipment Tracking', icon: Truck },
    { id: 'warehouses', label: 'Warehouses', icon: Building2 },
    { id: 'analytics', label: 'MongoDB Aggregations', icon: BarChart3 },
    { id: 'pdf-report', label: 'PDF Report Generator', icon: FileText }
  ];

  return (
    <aside
      className={`bg-[#f2f2f3] border-r border-[#ececec] text-[#17191c] transition-all duration-300 flex flex-col z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#ececec] flex items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[#17191c] flex items-center justify-center text-white shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-serif-display text-base tracking-tight text-[#17191c] truncate italic">Supply Chain</h1>
              <p className="text-[10px] text-[#777b86] font-medium tracking-wider uppercase">Logistics Tracker</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Dataset Info Badge - Blush Peach Editorial Highlight */}
      {!collapsed && (
        <div className="mx-3 my-3 p-3.5 rounded-[20px] bg-[#fbe1d1] text-[#5d2a1a] text-xs shadow-xs border-0">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#5d2a1a]" />
            <span>DataCo Global Dataset</span>
          </div>
          <p className="text-[11px] leading-tight text-[#5d2a1a]/90">
            <span className="font-bold">{recordCount.toLocaleString()}</span> active orders & embedded event streams loaded.
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full font-medium text-xs transition-all ${
                isActive
                  ? 'bg-[#17191c] text-white shadow-xs'
                  : 'text-[#777b86] hover:text-[#17191c] hover:bg-white/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#777b86]'}`} />
              {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e2e2e5] text-[#777b86]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-[#ececec] text-[11px] text-[#979799]">
          <p className="font-semibold text-[#777b86]">MongoDB Stack</p>
          <p>Mingo Aggregation Engine v7</p>
        </div>
      )}
    </aside>
  );
};

