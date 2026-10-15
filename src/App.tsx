import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { ShipmentsView } from './components/ShipmentsView';
import { WarehousesView } from './components/WarehousesView';
import { AnalyticsView } from './components/AnalyticsView';
import { PDFReportView } from './components/PDFReportView';
import { Toast } from './components/Toast';

import {
  Order,
  Shipment,
  Warehouse,
  DashboardStats,
  AnalyticsResults,
  ShipmentEvent
} from './types/index';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResults | null>(null);
  const [trackingResult, setTrackingResult] = useState<{ shipment: Shipment; order: Order | null } | null>(null);

  // Pagination & Filtering States
  const [orderPage, setOrderPage] = useState(1);
  const [totalOrderRecords, setTotalOrderRecords] = useState(0);
  const [totalOrderPages, setTotalOrderPages] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderCountryFilter, setOrderCountryFilter] = useState('ALL');

  // AI & System States
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // API Call Helpers
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(orderPage),
        limit: '20',
        search: orderSearch,
        status: orderStatusFilter,
        country: orderCountryFilter
      });

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalOrderRecords(data.totalRecords);
        setTotalOrderPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  }, [orderPage, orderSearch, orderStatusFilter, orderCountryFilter]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await fetch('/api/warehouses');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
      }
    } catch (err) {
      console.error('Failed to fetch warehouses', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  }, []);

  const trackShipment = useCallback(async (query: string) => {
    try {
      const res = await fetch(`/api/shipments/track?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingResult(data);
      } else {
        showToast(`Tracking record not found for query: "${query}"`, 'error');
      }
    } catch (err) {
      console.error('Failed to track shipment', err);
      showToast('Shipment tracking lookup failed', 'error');
    }
  }, [showToast]);

  const handleRequestAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai-insights', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.insight);
        showToast('AI Supply Chain Bottleneck Analysis updated!', 'success');
      }
    } catch (err) {
      console.error('Failed to fetch AI insights', err);
      showToast('Failed to generate AI insights', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleResetSeed = async () => {
    setIsReseeding(true);
    try {
      const res = await fetch('/api/seed/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50000 })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message, 'success');
        fetchStats();
        fetchOrders();
        fetchWarehouses();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to reseed database', err);
      showToast('Failed to reseed dataset', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchWarehouses();
    fetchAnalytics();
    trackShipment('SHP-200005');
  }, [fetchStats, fetchOrders, fetchWarehouses, fetchAnalytics, trackShipment]);

  // Handle Global Search Submit
  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;

    const query = globalSearch.trim();
    if (query.toUpperCase().startsWith('SHP-') || query.toUpperCase().startsWith('ORD-')) {
      trackShipment(query);
      setActiveTab('shipments');
    } else {
      setOrderSearch(query);
      setActiveTab('orders');
    }
  };

  // Order CRUD Handlers
  const handleCreateOrder = async (orderData: Omit<Order, 'orderId'>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const newOrder = await res.json();
        showToast(`Order ${newOrder.orderId} and shipment created!`, 'success');
        fetchOrders();
        fetchStats();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to create order', err);
      showToast('Error creating order', 'error');
    }
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        showToast(`Order ${orderId} updated successfully`, 'success');
        fetchOrders();
        fetchStats();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to update order', err);
      showToast('Error updating order', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Order ${orderId} deleted from MongoDB`, 'info');
        fetchOrders();
        fetchStats();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to delete order', err);
      showToast('Error deleting order', 'error');
    }
  };

  // Shipment Add Event Handler
  const handleAddShipmentEvent = async (shipmentId: string, eventData: Omit<ShipmentEvent, 'timestamp'>) => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        const updatedShipment = await res.json();
        setTrackingResult(prev => prev ? { ...prev, shipment: updatedShipment } : null);
        showToast(`New event appended to ${shipmentId} embedded array!`, 'success');
        fetchStats();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to add shipment event', err);
      showToast('Error adding event to shipment', 'error');
    }
  };

  // Warehouse Update Handler
  const handleUpdateWarehouseStock = async (warehouseId: string, availableStock: number) => {
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStock })
      });
      if (res.ok) {
        showToast(`Warehouse ${warehouseId} stock updated to ${availableStock}`, 'success');
        fetchWarehouses();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to update warehouse stock', err);
      showToast('Error updating warehouse stock', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f3] flex text-[#17191c] font-sans antialiased selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={stats?.totalOrders || 50000}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onSearchSubmit={handleGlobalSearchSubmit}
          recordCount={stats?.totalOrders || 50000}
          onResetSeed={handleResetSeed}
          isReseeding={isReseeding}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#f2f2f3]">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigateTab={setActiveTab}
              onTrackShipment={id => {
                trackShipment(id);
                setActiveTab('shipments');
              }}
              aiInsight={aiInsight}
              loadingAi={loadingAi}
              onRequestAiInsight={handleRequestAiInsight}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              totalRecords={totalOrderRecords}
              totalPages={totalOrderPages}
              currentPage={orderPage}
              onPageChange={setOrderPage}
              searchQuery={orderSearch}
              setSearchQuery={setOrderSearch}
              statusFilter={orderStatusFilter}
              setStatusFilter={setOrderStatusFilter}
              countryFilter={orderCountryFilter}
              setCountryFilter={setOrderCountryFilter}
              onCreateOrder={handleCreateOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
              onTrackOrderShipment={orderId => {
                trackShipment(orderId);
                setActiveTab('shipments');
              }}
            />
          )}

          {activeTab === 'shipments' && (
            <ShipmentsView
              trackingResult={trackingResult}
              onTrackSearch={trackShipment}
              onAddEvent={handleAddShipmentEvent}
            />
          )}

          {activeTab === 'warehouses' && (
            <WarehousesView
              warehouses={warehouses}
              onUpdateStock={handleUpdateWarehouseStock}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === 'pdf-report' && (
            <PDFReportView
              stats={stats}
              analytics={analytics}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
