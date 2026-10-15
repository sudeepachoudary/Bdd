import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Building2,
  Truck
} from 'lucide-react';
import { Order, DeliveryStatus } from '../types/index';

interface OrdersViewProps {
  orders: Order[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  countryFilter: string;
  setCountryFilter: (c: string) => void;
  onCreateOrder: (orderData: Omit<Order, 'orderId'>) => void;
  onUpdateOrder: (orderId: string, orderData: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
  onTrackOrderShipment: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  totalRecords,
  totalPages,
  currentPage,
  onPageChange,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  countryFilter,
  setCountryFilter,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
  onTrackOrderShipment
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: 'CUST-5501',
    productName: 'Nike Dri-FIT Running Shirt',
    productId: 'PROD-101',
    supplierName: 'Apex Logistics & Textile Co.',
    supplierId: 'SUP-001',
    warehouseId: 'WH-US-01',
    quantity: 2,
    orderValue: 90,
    country: 'United States',
    city: 'Chicago',
    deliveryStatus: 'On-Time' as DeliveryStatus,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  });

  const handleOpenCreate = () => {
    setFormData({
      customerName: '',
      customerId: `CUST-${Math.floor(5000 + Math.random() * 3000)}`,
      productName: 'Nike Dri-FIT Running Shirt',
      productId: 'PROD-101',
      supplierName: 'Apex Logistics & Textile Co.',
      supplierId: 'SUP-001',
      warehouseId: 'WH-US-01',
      quantity: 2,
      orderValue: 90,
      country: 'United States',
      city: 'Chicago',
      deliveryStatus: 'On-Time',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    });
    setEditingOrder(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customerName,
      customerId: order.customerId,
      productName: order.productName,
      productId: order.productId,
      supplierName: order.supplierName,
      supplierId: order.supplierId,
      warehouseId: order.warehouseId,
      quantity: order.quantity,
      orderValue: order.orderValue,
      country: order.country,
      city: order.city,
      deliveryStatus: order.deliveryStatus,
      orderDate: order.orderDate ? order.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsCreateOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      onUpdateOrder(editingOrder.orderId, {
        customerName: formData.customerName,
        productName: formData.productName,
        supplierName: formData.supplierName,
        quantity: Number(formData.quantity),
        orderValue: Number(formData.orderValue),
        country: formData.country,
        city: formData.city,
        deliveryStatus: formData.deliveryStatus,
        expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString()
      });
    } else {
      onCreateOrder({
        customerId: formData.customerId,
        customerName: formData.customerName,
        productId: formData.productId,
        productName: formData.productName,
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        warehouseId: formData.warehouseId,
        quantity: Number(formData.quantity),
        orderValue: Number(formData.orderValue),
        orderDate: new Date(formData.orderDate).toISOString(),
        expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString(),
        actualDeliveryDate: formData.deliveryStatus === 'Delivered' ? new Date().toISOString() : null,
        deliveryStatus: formData.deliveryStatus,
        country: formData.country,
        city: formData.city
      });
    }
    setIsCreateOpen(false);
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'On-Time':
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f4ea] text-[#137333]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#fce8e6] text-[#c5221f]">
            <AlertTriangle className="w-3 h-3" />
            <span>Late</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#fbe1d1] text-[#5d2a1a]">
            <Truck className="w-3 h-3" />
            <span>In Transit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#f2f2f3] text-[#777b86]">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <div>
          <h2 className="font-serif-display text-2xl text-[#17191c] font-normal flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#17191c]" />
            <span>Order Management Collection</span>
          </h2>
          <p className="text-xs text-[#777b86] mt-1 font-normal">
            Displaying {totalRecords.toLocaleString()} total orders across global regions and warehouses
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#f2f2f3] p-4 rounded-[20px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-[#a3a6af] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Customer, Supplier, City..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#ececec] rounded-full text-xs text-[#17191c] placeholder-[#a3a6af] focus:outline-none focus:border-[#17191c] transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full border border-[#ececec] text-xs">
            <Filter className="w-3.5 h-3.5 text-[#777b86]" />
            <span className="text-[#777b86] font-normal">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-[#17191c] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="On-Time">On-Time</option>
              <option value="Late">Late</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full border border-[#ececec] text-xs">
            <span className="text-[#777b86] font-normal">Country:</span>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="bg-transparent font-medium text-[#17191c] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Countries</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Japan">Japan</option>
              <option value="Brazil">Brazil</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#777b86] font-normal">
          Showing <span className="font-semibold text-[#17191c]">{orders.length}</span> per page
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-[24px] border border-[#ececec] overflow-hidden shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f2f3] border-b border-[#ececec] text-[#979799] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Value</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec] text-[#17191c]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#979799] italic">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.orderId} className="hover:bg-[#fafafb] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#17191c]">{order.orderId}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#17191c]">{order.customerName}</p>
                      <p className="text-[10px] text-[#979799]">{order.customerId}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px] truncate">
                      <p className="font-medium text-[#17191c] truncate">{order.productName}</p>
                      <p className="text-[10px] text-[#979799]">Qty: {order.quantity}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[160px] truncate">
                      <p className="font-normal text-[#777b86] truncate">{order.supplierName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#17191c]">{order.city}</p>
                      <p className="text-[10px] text-[#979799]">{order.country}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#17191c]">${order.orderValue}</td>
                    <td className="px-5 py-3.5">{getStatusBadge(order.deliveryStatus)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onTrackOrderShipment(order.orderId)}
                          className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors"
                          title="Track Embedded Shipment Event Sourcing"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors"
                          title="Edit Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingOrderId(order.orderId)}
                          className="p-1.5 text-[#777b86] hover:text-[#c5221f] hover:bg-[#fce8e6] rounded-full transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#f2f2f3] border-t border-[#ececec] flex items-center justify-between text-xs">
          <span className="text-[#777b86]">
            Page <span className="font-semibold text-[#17191c]">{currentPage}</span> of{' '}
            <span className="font-semibold text-[#17191c]">{totalPages || 1}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-full border border-[#ececec] bg-white text-[#17191c] hover:bg-[#fafafb] disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1 rounded-full bg-[#17191c] text-white font-medium">{currentPage}</span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-full border border-[#ececec] bg-white text-[#17191c] hover:bg-[#fafafb] disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-[#17191c]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-2xl border border-[#ececec] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ececec] pb-3">
              <h3 className="font-serif-display text-xl text-[#17191c] font-normal">
                {editingOrder ? `Edit Order (${editingOrder.orderId})` : 'Create New Supply Order'}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs text-[#17191c]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Order Value ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.orderValue}
                    onChange={e => setFormData({ ...formData, orderValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Delivery Status</label>
                  <select
                    value={formData.deliveryStatus}
                    onChange={e => setFormData({ ...formData, deliveryStatus: e.target.value as DeliveryStatus })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent text-[#17191c] rounded-[16px] focus:bg-white focus:border-[#17191c] font-medium"
                  >
                    <option value="On-Time">On-Time</option>
                    <option value="Late">Late</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Destination Country</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formData.supplierName}
                    onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#777b86] mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expectedDeliveryDate}
                    onChange={e => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] text-[#17191c] focus:bg-white focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#ececec] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#ececec] hover:bg-[#f2f2f3] text-[#17191c] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium"
                >
                  {editingOrder ? 'Save Changes' : 'Create Order & Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrderId && (
        <div className="fixed inset-0 z-50 bg-[#17191c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#ececec] space-y-4">
            <div className="flex items-center gap-3 text-[#c5221f]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif-display text-xl text-[#17191c] font-normal">Confirm Delete Order</h3>
            </div>
            <p className="text-xs text-[#777b86] leading-relaxed">
              Are you sure you want to delete order <span className="font-semibold text-[#17191c]">{deletingOrderId}</span>? This will also remove its corresponding embedded shipment log from MongoDB.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2 rounded-full border border-[#ececec] text-[#17191c] text-xs font-medium hover:bg-[#f2f2f3]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteOrder(deletingOrderId);
                  setDeletingOrderId(null);
                }}
                className="px-4 py-2 rounded-full bg-[#c5221f] hover:bg-[#a51d1a] text-white text-xs font-medium"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details View Drawer Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-[#17191c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#ececec] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#ececec] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#17191c]" />
                <h3 className="font-serif-display text-xl text-[#17191c] font-normal">Order Document Details</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#f2f2f3] p-4 rounded-[16px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#777b86]">Order ID:</span>
                  <p className="font-mono font-semibold text-[#17191c]">{viewingOrder.orderId}</p>
                </div>
                <div>
                  <span className="text-[#777b86]">Delivery Status:</span>
                  <div className="mt-0.5">{getStatusBadge(viewingOrder.deliveryStatus)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#777b86]">Customer Name:</span>
                  <p className="font-semibold text-[#17191c]">{viewingOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-[#777b86]">Product Name:</span>
                  <p className="font-semibold text-[#17191c]">{viewingOrder.productName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#777b86]">Supplier:</span>
                  <p className="font-medium text-[#17191c]">{viewingOrder.supplierName}</p>
                </div>
                <div>
                  <span className="text-[#777b86]">Warehouse ID:</span>
                  <p className="font-medium text-[#17191c]">{viewingOrder.warehouseId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#777b86]">Destination:</span>
                  <p className="font-medium text-[#17191c]">{viewingOrder.city}, {viewingOrder.country}</p>
                </div>
                <div>
                  <span className="text-[#777b86]">Order Value:</span>
                  <p className="font-semibold text-[#17191c]">${viewingOrder.orderValue} (Qty: {viewingOrder.quantity})</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ececec]">
                <div>
                  <span className="text-[#777b86]">Order Date:</span>
                  <p className="font-mono text-[#17191c]">{new Date(viewingOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[#777b86]">Expected Delivery:</span>
                  <p className="font-mono text-[#17191c]">{new Date(viewingOrder.expectedDeliveryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onTrackOrderShipment(viewingOrder.orderId);
                  setViewingOrder(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Track Embedded Shipment Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

