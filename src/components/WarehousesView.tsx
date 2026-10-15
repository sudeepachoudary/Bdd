import React, { useState } from 'react';
import { Building2, Edit2, Users, Layers, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Warehouse } from '../types/index';

interface WarehousesViewProps {
  warehouses: Warehouse[];
  onUpdateStock: (warehouseId: string, newAvailableStock: number) => void;
}

export const WarehousesView: React.FC<WarehousesViewProps> = ({ warehouses, onUpdateStock }) => {
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setNewStock(wh.availableStock);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      onUpdateStock(editingWarehouse.warehouseId, Number(newStock));
      setEditingWarehouse(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl text-[#17191c] font-normal flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#17191c]" />
            <span>Fulfillment Warehouses & Stock Capacity</span>
          </h2>
          <p className="text-xs text-[#777b86] mt-1 font-normal">
            Real-time stock utilization, storage capacity limits, and assigned regional managers.
          </p>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map(wh => {
          const utilPct = Number(((wh.availableStock / wh.capacity) * 100).toFixed(1));
          const isHighUtil = utilPct >= 80;

          return (
            <div
              key={wh.warehouseId}
              className="bg-white rounded-[24px] border border-[#ececec] p-5 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] hover:border-[#d8d8da] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full border border-[#ececec]">
                    {wh.warehouseId}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(wh)}
                    className="p-1.5 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors"
                    title="Update Stock"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-serif-display text-base font-normal text-[#17191c] leading-snug">{wh.warehouseName}</h3>
                <p className="text-xs text-[#777b86] font-normal">{wh.city}, {wh.country}</p>
              </div>

              {/* Progress Bar & Capacity Utilization */}
              <div className="space-y-1.5 pt-3 border-t border-[#ececec]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#777b86] font-normal">Capacity Utilization</span>
                  <span className={`font-semibold ${
                    isHighUtil ? 'text-[#c5221f]' : 'text-[#17191c]'
                  }`}>
                    {utilPct}%
                  </span>
                </div>

                <div className="w-full h-2 bg-[#f2f2f3] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighUtil ? 'bg-[#c5221f]' : 'bg-[#17191c]'
                    }`}
                    style={{ width: `${Math.min(100, utilPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#777b86] font-mono pt-1">
                  <span>Stock: {wh.availableStock.toLocaleString()}</span>
                  <span>Cap: {wh.capacity.toLocaleString()}</span>
                </div>
              </div>

              {/* Manager & Supplier Info */}
              <div className="pt-2 border-t border-[#ececec] text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[#777b86]">
                  <span>Manager:</span>
                  <span className="font-medium text-[#17191c]">{wh.manager}</span>
                </div>
                <div className="flex items-center justify-between text-[#777b86]">
                  <span>Suppliers Connected:</span>
                  <span className="font-semibold text-[#17191c]">{wh.supplierCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stock Table */}
      <div className="bg-white rounded-[24px] border border-[#ececec] overflow-hidden shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-[#ececec] bg-[#f2f2f3]">
          <h3 className="font-serif-display text-base font-normal text-[#17191c]">Warehouse Capacity Master Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f2f3] border-b border-[#ececec] text-[#979799] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Warehouse ID</th>
                <th className="px-5 py-3.5">Facility Name</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Capacity</th>
                <th className="px-5 py-3.5">Available Stock</th>
                <th className="px-5 py-3.5">Utilization</th>
                <th className="px-5 py-3.5">Manager</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec] text-[#17191c]">
              {warehouses.map(wh => {
                const utilPct = Number(((wh.availableStock / wh.capacity) * 100).toFixed(1));
                return (
                  <tr key={wh.warehouseId} className="hover:bg-[#fafafb] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#17191c]">{wh.warehouseId}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#17191c]">{wh.warehouseName}</td>
                    <td className="px-5 py-3.5 font-normal text-[#777b86]">{wh.city}, {wh.country}</td>
                    <td className="px-5 py-3.5 font-mono">{wh.capacity.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#17191c]">{wh.availableStock.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#17191c]">{utilPct}%</td>
                    <td className="px-5 py-3.5 font-normal text-[#777b86]">{wh.manager}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(wh)}
                        className="px-3.5 py-1.5 rounded-full bg-[#f2f2f3] hover:bg-[#e2e2e4] text-[#17191c] font-medium text-xs transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingWarehouse && (
        <div className="fixed inset-0 z-50 bg-[#17191c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-[#ececec] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#ececec] pb-3">
              <h3 className="font-serif-display text-xl text-[#17191c] font-normal">Update Stock Level</h3>
              <button
                onClick={() => setEditingWarehouse(null)}
                className="p-1 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="font-semibold text-[#17191c] text-sm">{editingWarehouse.warehouseName}</p>
              <p className="text-[#777b86] mt-0.5">Facility Capacity Limit: {editingWarehouse.capacity.toLocaleString()}</p>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block font-medium text-[#777b86] mb-1">Available Inventory Units</label>
                <input
                  type="number"
                  min="0"
                  max={editingWarehouse.capacity}
                  value={newStock}
                  onChange={e => setNewStock(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f2f2f3] border border-transparent rounded-[16px] focus:bg-white focus:border-[#17191c] font-semibold text-[#17191c]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ececec]">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="px-4 py-2 rounded-full border border-[#ececec] text-[#17191c] font-medium hover:bg-[#f2f2f3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium"
                >
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

