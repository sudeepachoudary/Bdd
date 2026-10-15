export type DeliveryStatus = 'Delivered' | 'On-Time' | 'Late' | 'In Transit' | 'Processing' | 'Cancelled';

export type ShipmentStatus = 'Packed' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Delayed' | 'Exception';

export interface ShipmentEvent {
  event: 'Packed' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Customs Cleared' | 'Out for Delivery';
  location: string;
  timestamp: string;
  notes?: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  quantity: number;
  orderDate: string; // ISO String
  expectedDeliveryDate: string; // ISO String
  actualDeliveryDate: string | null; // ISO String
  deliveryStatus: DeliveryStatus;
  country: string;
  city: string;
  orderValue: number;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  carrier: string;
  route: string;
  originWarehouse: string;
  destination: string;
  shipmentStatus: ShipmentStatus;
  events: ShipmentEvent[];
}

export interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  country: string;
  city: string;
  capacity: number;
  availableStock: number;
  supplierCount: number;
  manager: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalShipments: number;
  totalWarehouses: number;
  totalSuppliers: number;
  delayedDeliveries: number;
  onTimeDeliveries: number;
  totalOrderValue: number;
  onTimeRate: number;
  recentEvents: Array<ShipmentEvent & { shipmentId: string; orderId: string; carrier: string }>;
}

export interface OrderFilterParams {
  search?: string;
  status?: string;
  country?: string;
  supplierId?: string;
  warehouseId?: string;
  page?: number;
  limit?: number;
}

export interface Aggregation1OnTimeRate {
  totalOrders: number;
  onTimeOrders: number;
  lateOrders: number;
  onTimePercentage: number;
  latePercentage: number;
}

export interface Aggregation2RegionDelivery {
  country: string;
  avgDeliveryDays: number;
  totalOrders: number;
}

export interface Aggregation3DelayedRoutes {
  route: string;
  carrier: string;
  delayedShipmentsCount: number;
  avgDelayDays: number;
}

export interface Aggregation4WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  capacity: number;
  availableStock: number;
  utilizationPercentage: number;
  city: string;
  country: string;
}

export interface Aggregation5SupplierPerf {
  supplierId: string;
  supplierName: string;
  ordersSupplied: number;
  lateDeliveries: number;
  avgDeliveryDays: number;
  performanceScore: number; // 0-100%
}

export interface AnalyticsResults {
  onTimeRate: Aggregation1OnTimeRate;
  deliveryDaysByRegion: Aggregation2RegionDelivery[];
  topDelayedRoutes: Aggregation3DelayedRoutes[];
  warehouseStock: Aggregation4WarehouseStock[];
  supplierPerformance: Aggregation5SupplierPerf[];
  monthlyOrderTrends: Array<{ month: string; totalOrders: number; totalValue: number }>;
  regionalDemand: Array<{ country: string; orderVolume: number; totalValue: number }>;
}
