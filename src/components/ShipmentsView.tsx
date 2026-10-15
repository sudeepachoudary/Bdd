import React, { useState } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  MapPin,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  PackageCheck,
  X
} from 'lucide-react';
import { Shipment, Order, ShipmentEvent } from '../types/index';

interface ShipmentsViewProps {
  trackingResult: { shipment: Shipment; order: Order | null } | null;
  onTrackSearch: (query: string) => void;
  onAddEvent: (shipmentId: string, event: Omit<ShipmentEvent, 'timestamp'>) => void;
  initialQuery?: string;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  trackingResult,
  onTrackSearch,
  onAddEvent,
  initialQuery = ''
}) => {
  const [inputQuery, setInputQuery] = useState(initialQuery || 'SHP-200005');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Form State for Adding Event
  const [newEvent, setNewEvent] = useState<{
    event: ShipmentEvent['event'];
    location: string;
    notes: string;
  }>({
    event: 'In Transit',
    location: 'Midway Logistics Center',
    notes: 'In transit checkpoint update'
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onTrackSearch(inputQuery.trim());
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingResult) {
      onAddEvent(trackingResult.shipment.shipmentId, newEvent);
      setIsAddEventOpen(false);
    }
  };

  const shipment = trackingResult?.shipment;
  const order = trackingResult?.order;

  return (
    <div className="space-y-6">
      {/* Tracking Search Banner */}
      <div className="bg-white p-6 rounded-[24px] text-[#17191c] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f2f3] text-[#17191c] text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Embedded Event Sourcing Timeline</span>
          </div>
          <h2 className="font-serif-display text-2xl text-[#17191c] font-normal">Track Shipment & Embedded Event Log</h2>
          <p className="text-[#777b86] text-xs font-normal">
            Enter a Shipment ID (e.g., <code className="text-[#17191c] font-semibold font-mono">SHP-200005</code>) or Order ID (e.g., <code className="text-[#17191c] font-semibold font-mono">ORD-100005</code>) to inspect live MongoDB embedded event streams.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#a3a6af] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder="Enter Shipment ID or Order ID..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#f2f2f3] border border-transparent rounded-full text-xs text-[#17191c] placeholder-[#a3a6af] focus:bg-white focus:border-[#17191c] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all shrink-0 shadow-xs"
            >
              Track Shipment
            </button>
          </form>
        </div>
      </div>

      {/* Shipment Result Details */}
      {!shipment ? (
        <div className="bg-white rounded-[24px] border border-[#ececec] p-12 text-center space-y-3 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#f2f2f3] text-[#777b86] flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-lg text-[#17191c] font-normal">No Shipment Tracking Result Selected</h3>
          <p className="text-xs text-[#777b86] max-w-sm mx-auto font-normal">
            Use the search box above or select an order from the Order Management tab to inspect event timeline logs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 cols): Event Timeline Stepper */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ececec]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-lg text-[#17191c]">{shipment.shipmentId}</h3>
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-medium ${
                    shipment.shipmentStatus === 'Delivered'
                      ? 'bg-[#e6f4ea] text-[#137333]'
                      : shipment.shipmentStatus === 'Delayed'
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : 'bg-[#fbe1d1] text-[#5d2a1a]'
                  }`}>
                    {shipment.shipmentStatus}
                  </span>
                </div>
                <p className="text-xs text-[#777b86] mt-1 font-normal">Carrier: <span className="font-medium text-[#17191c]">{shipment.carrier}</span></p>
              </div>

              <button
                onClick={() => setIsAddEventOpen(true)}
                className="px-4 py-2 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Append Embedded Event</span>
              </button>
            </div>

            {/* Route & Destination Summary */}
            <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#777b86] font-normal">Origin Hub:</span>
                <p className="font-semibold text-[#17191c]">{shipment.originWarehouse}</p>
              </div>
              <div className="hidden sm:block text-[#979799]">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[#777b86] font-normal">Final Destination:</span>
                <p className="font-semibold text-[#17191c]">{shipment.destination}</p>
              </div>
            </div>

            {/* Event Timeline Stepper */}
            <div>
              <h4 className="text-xs font-semibold text-[#17191c] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#17191c]" />
                <span>Embedded Event Log Stream (shipments.events)</span>
              </h4>

              <div className="relative pl-6 border-l-2 border-[#ececec] space-y-6">
                {shipment.events.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      evt.event === 'Delivered'
                        ? 'border-[#137333]'
                        : 'border-[#17191c]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        evt.event === 'Delivered' ? 'bg-[#137333]' : 'bg-[#17191c]'
                      }`} />
                    </div>

                    <div className="bg-[#f2f2f3] p-4 rounded-[16px] border border-[#ececec] hover:border-[#d8d8da] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#17191c]">{evt.event}</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-[#ececec] text-[#777b86] font-medium">
                            <MapPin className="w-3 h-3 inline mr-1 text-[#979799]" />
                            {evt.location}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#777b86]">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {evt.notes && (
                        <p className="text-xs text-[#777b86] mt-2 italic bg-white p-2.5 rounded-[12px] border border-[#ececec]">
                          "{evt.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Document Details & Delivery Analysis */}
          <div className="space-y-6">
            {/* Order Card */}
            <div className="bg-white rounded-[24px] border border-[#ececec] p-5 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-xs font-semibold text-[#979799] uppercase tracking-wider border-b border-[#ececec] pb-2">
                Associated Order Document
              </h3>

              {order ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#777b86]">Order ID:</span>
                    <p className="font-mono font-semibold text-[#17191c]">{order.orderId}</p>
                  </div>
                  <div>
                    <span className="text-[#777b86]">Customer:</span>
                    <p className="font-semibold text-[#17191c]">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[#777b86]">Product:</span>
                    <p className="font-medium text-[#17191c]">{order.productName} (x{order.quantity})</p>
                  </div>
                  <div>
                    <span className="text-[#777b86]">Order Value:</span>
                    <p className="font-semibold text-[#17191c]">${order.orderValue}</p>
                  </div>
                  <div>
                    <span className="text-[#777b86]">Supplier:</span>
                    <p className="font-normal text-[#777b86]">{order.supplierName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#979799] italic">No associated order details loaded.</p>
              )}
            </div>

            {/* Late Delivery Detection Card */}
            <div className={`p-5 rounded-[24px] border space-y-3 ${
              shipment.shipmentStatus === 'Delayed'
                ? 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
                : 'bg-[#fbe1d1] border-[#f7d2bd] text-[#5d2a1a]'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs">
                {shipment.shipmentStatus === 'Delayed' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#c5221f]" />
                    <span>Late Delivery Flagged</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#5d2a1a]" />
                    <span>On-Time Delivery Target</span>
                  </>
                )}
              </div>

              <p className="text-xs leading-relaxed opacity-90 font-normal">
                {shipment.shipmentStatus === 'Delayed'
                  ? 'Carrier transit queue detected on this route. Delayed notification recorded in shipment event stream.'
                  : 'Shipment is progressing according to schedule with no major port or customs delays detected.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-[#17191c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#ececec] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ececec] pb-3">
              <h3 className="font-serif-display text-xl text-[#17191c] font-normal">Append Event to Document</h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 rounded-full text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-[#17191c]">
              <div>
                <label className="block font-medium text-[#777b86] mb-1">Event Type</label>
                <select
                  value={newEvent.event}
                  onChange={e => setNewEvent({ ...newEvent, event: e.target.value as any })}
                  className="w-full p-2.5 bg-[#f2f2f3] border border-transparent text-[#17191c] rounded-[16px] focus:bg-white focus:border-[#17191c] font-medium"
                >
                  <option value="Packed">Packed</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Customs Cleared">Customs Cleared</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#777b86] mb-1">Current Checkpoint Location</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="e.g. Frankfurt Cargo Hub, Germany"
                  className="w-full p-2.5 bg-[#f2f2f3] border border-transparent text-[#17191c] rounded-[16px] focus:bg-white focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#777b86] mb-1">Event Notes</label>
                <textarea
                  value={newEvent.notes}
                  onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional logistics notes..."
                  className="w-full p-2.5 bg-[#f2f2f3] border border-transparent text-[#17191c] rounded-[16px] focus:bg-white focus:border-[#17191c]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ececec]">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#ececec] hover:bg-[#f2f2f3] text-[#17191c] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium"
                >
                  Append Event to Embedded Array
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

