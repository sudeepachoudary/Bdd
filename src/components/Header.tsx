import React from 'react';
import { Search, Database, Bell, RefreshCw } from 'lucide-react';

interface HeaderProps {
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  recordCount: number;
  onResetSeed: () => void;
  isReseeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  globalSearch,
  setGlobalSearch,
  onSearchSubmit,
  recordCount,
  onResetSeed,
  isReseeding
}) => {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#ececec] px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Global Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative w-80 lg:w-96">
        <Search className="w-4 h-4 text-[#a3a6af] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Search Order ID, Shipment ID, Customer..."
          className="w-full pl-9 pr-4 py-2 bg-[#f2f2f3] border border-transparent rounded-full text-xs text-[#17191c] placeholder-[#a3a6af] focus:outline-none focus:bg-white focus:border-[#17191c] transition-all"
        />
      </form>

      {/* Top Bar Status Badges & Controls */}
      <div className="flex items-center gap-3">
        {/* Record Badge - Blush Peach Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-[#5d2a1a]" />
          <span>{recordCount.toLocaleString()}+ B2B Orders</span>
        </div>

        {/* Re-seed Button */}
        <button
          onClick={onResetSeed}
          disabled={isReseeding}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#17191c] hover:bg-[#17191c] hover:text-white text-[#17191c] text-xs font-medium transition-all disabled:opacity-50"
          title="Reload 50,000 DataCo Records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isReseeding ? 'Seeding...' : 'Reload Dataset'}</span>
        </button>

        {/* Notification Icon */}
        <button className="p-2 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5d2a1a]" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#ececec]">
          <div className="w-8 h-8 rounded-full bg-[#17191c] text-white font-medium text-xs flex items-center justify-center">
            SC
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-[#17191c]">Logistics Director</p>
            <p className="text-[10px] text-[#777b86]">Enterprise Portal</p>
          </div>
        </div>
      </div>
    </header>
  );
};

