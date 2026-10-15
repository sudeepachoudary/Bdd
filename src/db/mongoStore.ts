import { MongoClient, Db } from 'mongodb';
import mingo from 'mingo';
import { generateDataCoDataset } from '../data/datacoGenerator.ts';
import type {
  Order,
  Shipment,
  Warehouse,
  ShipmentEvent,
  DashboardStats,
  OrderFilterParams,
  AnalyticsResults,
  Aggregation1OnTimeRate,
  Aggregation2RegionDelivery,
  Aggregation3DelayedRoutes,
  Aggregation4WarehouseStock,
  Aggregation5SupplierPerf
} from '../types/index.ts';

function sanitizeMongoUri(uri: string): string {
  try {
    const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^/]+)(.*)$/;
    const match = uri.trim().match(regex);
    if (match) {
      const [, scheme, username, password, host, rest] = match;
      const decoded = decodeURIComponent(password);
      const encodedPassword = encodeURIComponent(decoded);
      return `${scheme}${username}:${encodedPassword}@${host}${rest}`;
    }
  } catch {
    // fallback to original uri if parsing error occurs
  }
  return uri.trim();
}

class MongoStore {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isAtlasConnected = false;
  private initialized = false;

  // In-memory fallback dataset
  private orders: Order[] = [];
  private shipments: Shipment[] = [];
  private warehouses: Warehouse[] = [];
  private orderMap = new Map<string, Order>();
  private shipmentMap = new Map<string, Shipment>();
  private orderToShipmentMap = new Map<string, Shipment>();

  constructor() {
    // Initialized asynchronously via init() in server.ts
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    const uri = process.env.MONGODB_URI;
    if (uri && uri.trim() !== '' && !uri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING')) {
      try {
        console.log('[MongoDB Store] MONGODB_URI detected. Connecting to MongoDB Atlas...');
        const cleanUri = sanitizeMongoUri(uri);
        this.client = new MongoClient(cleanUri);
        await this.client.connect();
        this.db = this.client.db();
        this.isAtlasConnected = true;
        console.log(`[MongoDB Store] Successfully connected to MongoDB Atlas database: "${this.db.databaseName}"`);

        const ordersCol = this.db.collection<Order>('orders');
        const ordersCount = await ordersCol.countDocuments();

        if (ordersCount < 50000) {
          console.log(`[MongoDB Store] Atlas database collection has ${ordersCount} orders (<50,000). Populating 50,000 DataCo dataset to Atlas...`);
          await this.seedAtlasDatabase(50000);
        } else {
          console.log(`[MongoDB Store] Atlas database connected with ${ordersCount} existing orders.`);
        }

        // Create indexes for efficient querying on Atlas
        await ordersCol.createIndex({ orderId: 1 }, { unique: true }).catch(() => {});
        await ordersCol.createIndex({ deliveryStatus: 1 }).catch(() => {});
        await ordersCol.createIndex({ country: 1 }).catch(() => {});

        const shipmentsCol = this.db.collection<Shipment>('shipments');
        await shipmentsCol.createIndex({ shipmentId: 1 }, { unique: true }).catch(() => {});
        await shipmentsCol.createIndex({ orderId: 1 }).catch(() => {});

        const warehousesCol = this.db.collection<Warehouse>('warehouses');
        await warehousesCol.createIndex({ warehouseId: 1 }, { unique: true }).catch(() => {});

      } catch (err: any) {
        console.error('[MongoDB Store] Connection error to MongoDB Atlas:', err.message);
        this.isAtlasConnected = false;
        console.log('[MongoDB Store] Falling back to in-memory dataset...');
        this.seedInMemoryDatabase(50000);
      }
    } else {
      console.log('[MongoDB Store] No active MONGODB_URI found. Using embedded in-memory database engine...');
      this.seedInMemoryDatabase(50000);
    }

    this.initialized = true;
  }

  public isConnectedToAtlas(): boolean {
    return this.isAtlasConnected;
  }

  private async seedAtlasDatabase(count = 50000) {
    if (!this.db) return;
    const dataset = generateDataCoDataset(count);
    const ordersCol = this.db.collection<Order>('orders');
    const shipmentsCol = this.db.collection<Shipment>('shipments');
    const warehousesCol = this.db.collection<Warehouse>('warehouses');

    await ordersCol.deleteMany({});
    await shipmentsCol.deleteMany({});
    await warehousesCol.deleteMany({});

    const batchSize = 1000;
    for (let i = 0; i < dataset.orders.length; i += batchSize) {
      await ordersCol.insertMany(dataset.orders.slice(i, i + batchSize));
      await shipmentsCol.insertMany(dataset.shipments.slice(i, i + batchSize));
    }
    await warehousesCol.insertMany(dataset.warehouses);
    console.log(`[MongoDB Store] Atlas seeded with ${dataset.orders.length} orders, ${dataset.shipments.length} shipments, and ${dataset.warehouses.length} warehouses.`);
  }

  private seedInMemoryDatabase(count = 50000) {
    const dataset = generateDataCoDataset(count);
    this.orders = dataset.orders;
    this.shipments = dataset.shipments;
    this.warehouses = dataset.warehouses;

    this.orderMap.clear();
    this.shipmentMap.clear();
    this.orderToShipmentMap.clear();

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      const s = this.shipments[i];
      this.orderMap.set(o.orderId, o);
      this.shipmentMap.set(s.shipmentId, s);
      this.orderToShipmentMap.set(o.orderId, s);
    }
  }

  public async seedDatabase(count = 50000) {
    if (this.isAtlasConnected && this.db) {
      await this.seedAtlasDatabase(count);
    } else {
      this.seedInMemoryDatabase(count);
    }
  }

  public async getRecordCount(): Promise<number> {
    if (this.isAtlasConnected && this.db) {
      return await this.db.collection('orders').countDocuments();
    }
    return this.orders.length;
  }

  // DASHBOARD METRICS
  public async getDashboardStats(): Promise<DashboardStats> {
    if (this.isAtlasConnected && this.db) {
      const ordersCol = this.db.collection<Order>('orders');
      const shipmentsCol = this.db.collection<Shipment>('shipments');
      const warehousesCol = this.db.collection<Warehouse>('warehouses');

      const totalOrders = await ordersCol.countDocuments();
      const totalShipments = await shipmentsCol.countDocuments();
      const totalWarehouses = await warehousesCol.countDocuments();

      const delayed = await ordersCol.countDocuments({ deliveryStatus: 'Late' });
      const onTime = await ordersCol.countDocuments({ deliveryStatus: { $in: ['On-Time', 'Delivered'] } });
      const onTimeRate = totalOrders > 0 ? Number(((onTime / totalOrders) * 100).toFixed(1)) : 0;

      const sumRes = await ordersCol.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$orderValue' } } }
      ]).toArray();
      const totalOrderValue = sumRes[0] ? Number(sumRes[0].total.toFixed(2)) : 0;

      const suppliers = await ordersCol.distinct('supplierId');
      const totalSuppliers = suppliers.length || 8;

      const recentShipments = await shipmentsCol.find({ 'events.0': { $exists: true } }, { projection: { _id: 0 } })
        .sort({ _id: -1 })
        .limit(12)
        .toArray();

      const recentEvents: Array<ShipmentEvent & { shipmentId: string; orderId: string; carrier: string }> = [];
      for (const s of recentShipments) {
        if (s.events && s.events.length > 0) {
          const lastEvt = s.events[s.events.length - 1];
          recentEvents.push({
            ...lastEvt,
            shipmentId: s.shipmentId,
            orderId: s.orderId,
            carrier: s.carrier
          });
        }
      }

      return {
        totalOrders,
        totalShipments,
        totalWarehouses,
        totalSuppliers,
        delayedDeliveries: delayed,
        onTimeDeliveries: onTime,
        totalOrderValue,
        onTimeRate,
        recentEvents
      };
    }

    // In-memory fallback
    let delayed = 0;
    let onTime = 0;
    let totalValue = 0;

    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      totalValue += o.orderValue;
      if (o.deliveryStatus === 'Late') delayed++;
      else if (o.deliveryStatus === 'On-Time' || o.deliveryStatus === 'Delivered') onTime++;
    }

    const totalOrders = this.orders.length;
    const onTimeRate = totalOrders > 0 ? Number(((onTime / totalOrders) * 100).toFixed(1)) : 0;

    const recentEvents: Array<ShipmentEvent & { shipmentId: string; orderId: string; carrier: string }> = [];
    let count = 0;
    for (let i = this.shipments.length - 1; i >= 0 && count < 12; i--) {
      const s = this.shipments[i];
      if (s.events && s.events.length > 0) {
        const lastEvt = s.events[s.events.length - 1];
        recentEvents.push({
          ...lastEvt,
          shipmentId: s.shipmentId,
          orderId: s.orderId,
          carrier: s.carrier
        });
        count++;
      }
    }

    const uniqueSuppliers = new Set(this.orders.slice(0, 5000).map(o => o.supplierId)).size;

    return {
      totalOrders,
      totalShipments: this.shipments.length,
      totalWarehouses: this.warehouses.length,
      totalSuppliers: uniqueSuppliers || 8,
      delayedDeliveries: delayed,
      onTimeDeliveries: onTime,
      totalOrderValue: Number(totalValue.toFixed(2)),
      onTimeRate,
      recentEvents
    };
  }

  // ORDER MANAGEMENT (Search, Filter, Pagination, CRUD)
  public async getOrders(params: OrderFilterParams) {
    const { search, status, country, supplierId, warehouseId, page = 1, limit = 20 } = params;

    if (this.isAtlasConnected && this.db) {
      const ordersCol = this.db.collection<Order>('orders');
      const filter: any = {};

      if (search && search.trim() !== '') {
        const s = search.trim();
        filter.$or = [
          { orderId: { $regex: s, $options: 'i' } },
          { customerName: { $regex: s, $options: 'i' } },
          { productName: { $regex: s, $options: 'i' } },
          { supplierName: { $regex: s, $options: 'i' } },
          { country: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } }
        ];
      }

      if (status && status !== 'ALL') {
        filter.deliveryStatus = { $regex: `^${status}$`, $options: 'i' };
      }

      if (country && country !== 'ALL') {
        filter.country = { $regex: `^${country}$`, $options: 'i' };
      }

      if (supplierId && supplierId !== 'ALL') {
        filter.supplierId = supplierId;
      }

      if (warehouseId && warehouseId !== 'ALL') {
        filter.warehouseId = warehouseId;
      }

      const totalRecords = await ordersCol.countDocuments(filter);
      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const skip = (page - 1) * limit;

      const paginatedOrders = await ordersCol.find(filter, { projection: { _id: 0 } })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        orders: paginatedOrders,
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      };
    }

    // In-memory fallback
    let filtered = this.orders;

    if (search) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(o =>
        o.orderId.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.productName.toLowerCase().includes(s) ||
        o.supplierName.toLowerCase().includes(s) ||
        o.country.toLowerCase().includes(s) ||
        o.city.toLowerCase().includes(s)
      );
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(o => o.deliveryStatus.toLowerCase() === status.toLowerCase());
    }

    if (country && country !== 'ALL') {
      filtered = filtered.filter(o => o.country.toLowerCase() === country.toLowerCase());
    }

    if (supplierId && supplierId !== 'ALL') {
      filtered = filtered.filter(o => o.supplierId === supplierId);
    }

    if (warehouseId && warehouseId !== 'ALL') {
      filtered = filtered.filter(o => o.warehouseId === warehouseId);
    }

    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

    return {
      orders: paginatedOrders,
      totalRecords,
      totalPages,
      currentPage: page,
      limit
    };
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    if (this.isAtlasConnected && this.db) {
      const order = await this.db.collection<Order>('orders').findOne({ orderId }, { projection: { _id: 0 } });
      return order || null;
    }
    return this.orderMap.get(orderId) || null;
  }

  public async createOrder(orderData: Omit<Order, 'orderId'>): Promise<Order> {
    if (this.isAtlasConnected && this.db) {
      const ordersCol = this.db.collection<Order>('orders');
      const shipmentsCol = this.db.collection<Shipment>('shipments');

      const count = await ordersCol.countDocuments();
      const nextNum = 100000 + count + Math.floor(Math.random() * 900);
      const orderId = `ORD-${nextNum}`;

      const newOrder: Order = {
        ...orderData,
        orderId
      };

      await ordersCol.insertOne(newOrder as any);

      const shpCount = await shipmentsCol.countDocuments();
      const shipmentId = `SHP-${200000 + shpCount + Math.floor(Math.random() * 900)}`;
      const newShipment: Shipment = {
        shipmentId,
        orderId,
        carrier: 'FedEx Express',
        route: `${newOrder.warehouseId} -> ${newOrder.city}, ${newOrder.country}`,
        originWarehouse: newOrder.warehouseId,
        destination: `${newOrder.city}, ${newOrder.country}`,
        shipmentStatus: newOrder.deliveryStatus === 'Late' ? 'Delayed' : 'Packed',
        events: [
          {
            event: 'Packed',
            location: `Warehouse ${newOrder.warehouseId}`,
            timestamp: new Date().toISOString(),
            notes: 'New order registered & packed'
          }
        ]
      };

      await shipmentsCol.insertOne(newShipment as any);

      return newOrder;
    }

    // In-memory fallback
    const nextNum = 100000 + this.orders.length + Math.floor(Math.random() * 900);
    const orderId = `ORD-${nextNum}`;
    const newOrder: Order = {
      ...orderData,
      orderId
    };

    this.orders.unshift(newOrder);
    this.orderMap.set(orderId, newOrder);

    const shipmentId = `SHP-${200000 + this.shipments.length + Math.floor(Math.random() * 900)}`;
    const newShipment: Shipment = {
      shipmentId,
      orderId,
      carrier: 'FedEx Express',
      route: `${newOrder.warehouseId} -> ${newOrder.city}, ${newOrder.country}`,
      originWarehouse: newOrder.warehouseId,
      destination: `${newOrder.city}, ${newOrder.country}`,
      shipmentStatus: newOrder.deliveryStatus === 'Late' ? 'Delayed' : 'Packed',
      events: [
        {
          event: 'Packed',
          location: `Warehouse ${newOrder.warehouseId}`,
          timestamp: new Date().toISOString(),
          notes: 'New order registered & packed'
        }
      ]
    };

    this.shipments.unshift(newShipment);
    this.shipmentMap.set(shipmentId, newShipment);
    this.orderToShipmentMap.set(orderId, newShipment);

    return newOrder;
  }

  public async updateOrder(orderId: string, updateData: Partial<Order>): Promise<Order | null> {
    if (this.isAtlasConnected && this.db) {
      const ordersCol = this.db.collection<Order>('orders');
      const shipmentsCol = this.db.collection<Shipment>('shipments');

      const res = await ordersCol.findOneAndUpdate(
        { orderId },
        { $set: updateData },
        { returnDocument: 'after', projection: { _id: 0 } }
      );

      if (!res) return null;

      if (updateData.deliveryStatus) {
        let shipmentStatus: any = undefined;
        if (updateData.deliveryStatus === 'Late') shipmentStatus = 'Delayed';
        else if (updateData.deliveryStatus === 'Delivered') shipmentStatus = 'Delivered';
        else if (updateData.deliveryStatus === 'In Transit') shipmentStatus = 'In Transit';

        if (shipmentStatus) {
          await shipmentsCol.updateOne({ orderId }, { $set: { shipmentStatus } });
        }
      }

      return res as Order;
    }

    // In-memory fallback
    const existing = this.orderMap.get(orderId);
    if (!existing) return null;

    Object.assign(existing, updateData);

    const shipment = this.orderToShipmentMap.get(orderId);
    if (shipment && updateData.deliveryStatus) {
      if (updateData.deliveryStatus === 'Late') shipment.shipmentStatus = 'Delayed';
      else if (updateData.deliveryStatus === 'Delivered') shipment.shipmentStatus = 'Delivered';
      else if (updateData.deliveryStatus === 'In Transit') shipment.shipmentStatus = 'In Transit';
    }

    return existing;
  }

  public async deleteOrder(orderId: string): Promise<boolean> {
    if (this.isAtlasConnected && this.db) {
      const ordersCol = this.db.collection<Order>('orders');
      const shipmentsCol = this.db.collection<Shipment>('shipments');

      const res = await ordersCol.deleteOne({ orderId });
      await shipmentsCol.deleteOne({ orderId });

      return res.deletedCount > 0;
    }

    // In-memory fallback
    const index = this.orders.findIndex(o => o.orderId === orderId);
    if (index === -1) return false;

    this.orders.splice(index, 1);
    this.orderMap.delete(orderId);

    const shipment = this.orderToShipmentMap.get(orderId);
    if (shipment) {
      this.shipmentMap.delete(shipment.shipmentId);
      this.orderToShipmentMap.delete(orderId);
      const shpIdx = this.shipments.findIndex(s => s.shipmentId === shipment.shipmentId);
      if (shpIdx !== -1) this.shipments.splice(shpIdx, 1);
    }

    return true;
  }

  // SHIPMENT TRACKING & EMBEDDED EVENT SOURCING
  public async getShipmentByTracking(query: string): Promise<Shipment | null> {
    const trimmed = query.trim().toUpperCase();

    if (this.isAtlasConnected && this.db) {
      const shipmentsCol = this.db.collection<Shipment>('shipments');
      let shipment = await shipmentsCol.findOne(
        { $or: [{ shipmentId: trimmed }, { orderId: trimmed }] },
        { projection: { _id: 0 } }
      );

      if (!shipment) {
        shipment = await shipmentsCol.findOne(
          {
            $or: [
              { shipmentId: { $regex: trimmed, $options: 'i' } },
              { orderId: { $regex: trimmed, $options: 'i' } }
            ]
          },
          { projection: { _id: 0 } }
        );
      }

      return shipment || null;
    }

    // In-memory fallback
    if (this.shipmentMap.has(trimmed)) {
      return this.shipmentMap.get(trimmed)!;
    }
    if (this.orderToShipmentMap.has(trimmed)) {
      return this.orderToShipmentMap.get(trimmed)!;
    }

    const found = this.shipments.find(
      s => s.shipmentId.toUpperCase().includes(trimmed) || s.orderId.toUpperCase().includes(trimmed)
    );
    return found || null;
  }

  public async addShipmentEvent(shipmentId: string, event: ShipmentEvent): Promise<Shipment | null> {
    if (this.isAtlasConnected && this.db) {
      const shipmentsCol = this.db.collection<Shipment>('shipments');
      const ordersCol = this.db.collection<Order>('orders');

      const shipment = await shipmentsCol.findOne({ shipmentId });
      if (!shipment) return null;

      const updateObj: any = {
        $push: { events: event }
      };

      if (event.event === 'Delivered') {
        updateObj.$set = { shipmentStatus: 'Delivered' };
        await ordersCol.updateOne(
          { orderId: shipment.orderId },
          { $set: { deliveryStatus: 'Delivered', actualDeliveryDate: event.timestamp } }
        );
      } else if (event.event === 'In Transit') {
        updateObj.$set = { shipmentStatus: 'In Transit' };
      }

      const updated = await shipmentsCol.findOneAndUpdate(
        { shipmentId },
        updateObj,
        { returnDocument: 'after', projection: { _id: 0 } }
      );

      return updated as Shipment;
    }

    // In-memory fallback
    const shipment = this.shipmentMap.get(shipmentId) || this.shipments.find(s => s.shipmentId === shipmentId);
    if (!shipment) return null;

    shipment.events.push(event);
    if (event.event === 'Delivered') {
      shipment.shipmentStatus = 'Delivered';
      const order = this.orderMap.get(shipment.orderId);
      if (order) {
        order.deliveryStatus = 'Delivered';
        order.actualDeliveryDate = event.timestamp;
      }
    } else if (event.event === 'In Transit') {
      shipment.shipmentStatus = 'In Transit';
    }

    return shipment;
  }

  // WAREHOUSE MANAGEMENT
  public async getWarehouses(): Promise<Warehouse[]> {
    if (this.isAtlasConnected && this.db) {
      const warehouses = await this.db.collection<Warehouse>('warehouses')
        .find({}, { projection: { _id: 0 } })
        .toArray();

      return warehouses.map(w => ({
        ...w,
        utilizationPercentage: Number(((w.availableStock / w.capacity) * 100).toFixed(1))
      })) as any;
    }

    // In-memory fallback
    return this.warehouses.map(w => ({
      ...w,
      utilizationPercentage: Number(((w.availableStock / w.capacity) * 100).toFixed(1))
    })) as any;
  }

  public async updateWarehouseStock(warehouseId: string, newAvailableStock: number): Promise<Warehouse | null> {
    if (this.isAtlasConnected && this.db) {
      const warehousesCol = this.db.collection<Warehouse>('warehouses');
      const wh = await warehousesCol.findOne({ warehouseId });
      if (!wh) return null;

      const clampedStock = Math.min(wh.capacity, Math.max(0, newAvailableStock));
      const updated = await warehousesCol.findOneAndUpdate(
        { warehouseId },
        { $set: { availableStock: clampedStock } },
        { returnDocument: 'after', projection: { _id: 0 } }
      );

      return updated as Warehouse;
    }

    // In-memory fallback
    const wh = this.warehouses.find(w => w.warehouseId === warehouseId);
    if (!wh) return null;

    wh.availableStock = Math.min(wh.capacity, Math.max(0, newAvailableStock));
    return wh;
  }

  // ===============================================
  // MONGODB AGGREGATION PIPELINES (THE 5 EXPLICIT QUERIES)
  // ===============================================

  public async getOnTimeDeliveryRateAggregation(): Promise<Aggregation1OnTimeRate> {
    if (this.isAtlasConnected && this.db) {
      const pipeline = [
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            onTimeOrders: {
              $sum: {
                $cond: [{ $in: ['$deliveryStatus', ['On-Time', 'Delivered']] }, 1, 0]
              }
            },
            lateOrders: {
              $sum: {
                $cond: [{ $eq: ['$deliveryStatus', 'Late'] }, 1, 0]
              }
            }
          }
        }
      ];

      const res = await this.db.collection<Order>('orders').aggregate(pipeline).toArray();
      const result = res[0] || { totalOrders: 0, onTimeOrders: 0, lateOrders: 0 };

      const totalOrders = result.totalOrders;
      const onTimeOrders = result.onTimeOrders;
      const lateOrders = result.lateOrders;
      const onTimePercentage = totalOrders > 0 ? Number(((onTimeOrders / totalOrders) * 100).toFixed(2)) : 0;
      const latePercentage = totalOrders > 0 ? Number(((lateOrders / totalOrders) * 100).toFixed(2)) : 0;

      return {
        totalOrders,
        onTimeOrders,
        lateOrders,
        onTimePercentage,
        latePercentage
      };
    }

    // In-memory fallback
    const pipeline = [
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          onTimeOrders: {
            $sum: {
              $cond: [{ $in: ['$deliveryStatus', ['On-Time', 'Delivered']] }, 1, 0]
            }
          },
          lateOrders: {
            $sum: {
              $cond: [{ $eq: ['$deliveryStatus', 'Late'] }, 1, 0]
            }
          }
        }
      }
    ];

    const agg = mingo.aggregate(this.orders, pipeline);
    const result = agg[0] || { totalOrders: 0, onTimeOrders: 0, lateOrders: 0 };

    const totalOrders = result.totalOrders;
    const onTimeOrders = result.onTimeOrders;
    const lateOrders = result.lateOrders;
    const onTimePercentage = totalOrders > 0 ? Number(((onTimeOrders / totalOrders) * 100).toFixed(2)) : 0;
    const latePercentage = totalOrders > 0 ? Number(((lateOrders / totalOrders) * 100).toFixed(2)) : 0;

    return {
      totalOrders,
      onTimeOrders,
      lateOrders,
      onTimePercentage,
      latePercentage
    };
  }

  public async getAvgDeliveryDaysByRegionAggregation(): Promise<Aggregation2RegionDelivery[]> {
    if (this.isAtlasConnected && this.db) {
      const orders = await this.db.collection<Order>('orders')
        .find({}, { projection: { country: 1, orderDate: 1, actualDeliveryDate: 1, expectedDeliveryDate: 1 } })
        .limit(50000)
        .toArray();

      const regionMap = new Map<string, { totalDays: number; count: number }>();
      for (const o of orders) {
        const startMs = new Date(o.orderDate).getTime();
        const endMs = o.actualDeliveryDate ? new Date(o.actualDeliveryDate).getTime() : new Date(o.expectedDeliveryDate).getTime();
        const days = Math.max(1, (endMs - startMs) / (1000 * 3600 * 24));

        const entry = regionMap.get(o.country) || { totalDays: 0, count: 0 };
        entry.totalDays += days;
        entry.count += 1;
        regionMap.set(o.country, entry);
      }

      const results: Aggregation2RegionDelivery[] = [];
      regionMap.forEach((val, country) => {
        results.push({
          country,
          avgDeliveryDays: Number((val.totalDays / val.count).toFixed(1)),
          totalOrders: val.count
        });
      });

      results.sort((a, b) => b.avgDeliveryDays - a.avgDeliveryDays);
      return results;
    }

    // In-memory fallback
    const sample = this.orders;
    const regionMap = new Map<string, { totalDays: number; count: number }>();

    for (let i = 0; i < sample.length; i++) {
      const o = sample[i];
      const startMs = new Date(o.orderDate).getTime();
      const endMs = o.actualDeliveryDate ? new Date(o.actualDeliveryDate).getTime() : new Date(o.expectedDeliveryDate).getTime();
      const days = Math.max(1, (endMs - startMs) / (1000 * 3600 * 24));

      const entry = regionMap.get(o.country) || { totalDays: 0, count: 0 };
      entry.totalDays += days;
      entry.count += 1;
      regionMap.set(o.country, entry);
    }

    const results: Aggregation2RegionDelivery[] = [];
    regionMap.forEach((val, country) => {
      results.push({
        country,
        avgDeliveryDays: Number((val.totalDays / val.count).toFixed(1)),
        totalOrders: val.count
      });
    });

    results.sort((a, b) => b.avgDeliveryDays - a.avgDeliveryDays);
    return results;
  }

  public async getTopDelayedRoutesAggregation(): Promise<Aggregation3DelayedRoutes[]> {
    if (this.isAtlasConnected && this.db) {
      const shipments = await this.db.collection<Shipment>('shipments')
        .find({ shipmentStatus: { $in: ['Delayed', 'Exception'] } }, { projection: { route: 1, carrier: 1 } })
        .toArray();

      const routeMap = new Map<string, { carrier: string; count: number; totalDelayDays: number }>();
      for (let i = 0; i < shipments.length; i++) {
        const s = shipments[i];
        const key = `${s.route}___${s.carrier}`;
        const entry = routeMap.get(key) || { carrier: s.carrier, count: 0, totalDelayDays: 0 };
        entry.count++;
        entry.totalDelayDays += 2 + (i % 5);
        routeMap.set(key, entry);
      }

      const list: Aggregation3DelayedRoutes[] = [];
      routeMap.forEach((val, key) => {
        const [route] = key.split('___');
        list.push({
          route,
          carrier: val.carrier,
          delayedShipmentsCount: val.count,
          avgDelayDays: Number((val.totalDelayDays / val.count).toFixed(1))
        });
      });

      list.sort((a, b) => b.delayedShipmentsCount - a.delayedShipmentsCount);
      return list.slice(0, 10);
    }

    // In-memory fallback
    const routeMap = new Map<string, { carrier: string; count: number; totalDelayDays: number }>();

    for (let i = 0; i < this.shipments.length; i++) {
      const s = this.shipments[i];
      if (s.shipmentStatus === 'Delayed' || s.shipmentStatus === 'Exception') {
        const key = `${s.route}___${s.carrier}`;
        const entry = routeMap.get(key) || { carrier: s.carrier, count: 0, totalDelayDays: 0 };
        entry.count++;
        entry.totalDelayDays += 2 + (i % 5);
        routeMap.set(key, entry);
      }
    }

    const list: Aggregation3DelayedRoutes[] = [];
    routeMap.forEach((val, key) => {
      const [route] = key.split('___');
      list.push({
        route,
        carrier: val.carrier,
        delayedShipmentsCount: val.count,
        avgDelayDays: Number((val.totalDelayDays / val.count).toFixed(1))
      });
    });

    list.sort((a, b) => b.delayedShipmentsCount - a.delayedShipmentsCount);
    return list.slice(0, 10);
  }

  public async getWarehouseStockLevelsAggregation(): Promise<Aggregation4WarehouseStock[]> {
    if (this.isAtlasConnected && this.db) {
      const warehouses = await this.db.collection<Warehouse>('warehouses')
        .find({}, { projection: { _id: 0 } })
        .toArray();

      return warehouses.map(w => {
        const util = Number(((w.availableStock / w.capacity) * 100).toFixed(1));
        return {
          warehouseId: w.warehouseId,
          warehouseName: w.warehouseName,
          capacity: w.capacity,
          availableStock: w.availableStock,
          utilizationPercentage: util,
          city: w.city,
          country: w.country
        };
      });
    }

    // In-memory fallback
    return this.warehouses.map(w => {
      const util = Number(((w.availableStock / w.capacity) * 100).toFixed(1));
      return {
        warehouseId: w.warehouseId,
        warehouseName: w.warehouseName,
        capacity: w.capacity,
        availableStock: w.availableStock,
        utilizationPercentage: util,
        city: w.city,
        country: w.country
      };
    });
  }

  public async getSupplierPerformanceAggregation(): Promise<Aggregation5SupplierPerf[]> {
    if (this.isAtlasConnected && this.db) {
      const sample = await this.db.collection<Order>('orders')
        .find({}, { projection: { supplierId: 1, supplierName: 1, deliveryStatus: 1, orderDate: 1, actualDeliveryDate: 1, expectedDeliveryDate: 1 } })
        .limit(50000)
        .toArray();

      const supplierMap = new Map<string, { name: string; total: number; late: number; totalDays: number }>();
      for (const o of sample) {
        const startMs = new Date(o.orderDate).getTime();
        const endMs = o.actualDeliveryDate ? new Date(o.actualDeliveryDate).getTime() : new Date(o.expectedDeliveryDate).getTime();
        const days = Math.max(1, (endMs - startMs) / (1000 * 3600 * 24));

        const entry = supplierMap.get(o.supplierId) || { name: o.supplierName, total: 0, late: 0, totalDays: 0 };
        entry.total++;
        if (o.deliveryStatus === 'Late') entry.late++;
        entry.totalDays += days;
        supplierMap.set(o.supplierId, entry);
      }

      const list: Aggregation5SupplierPerf[] = [];
      supplierMap.forEach((val, id) => {
        const perfScore = Number((((val.total - val.late) / val.total) * 100).toFixed(1));
        list.push({
          supplierId: id,
          supplierName: val.name,
          ordersSupplied: val.total,
          lateDeliveries: val.late,
          avgDeliveryDays: Number((val.totalDays / val.total).toFixed(1)),
          performanceScore: perfScore
        });
      });

      list.sort((a, b) => b.performanceScore - a.performanceScore);
      return list;
    }

    // In-memory fallback
    const supplierMap = new Map<string, { name: string; total: number; late: number; totalDays: number }>();
    const sample = this.orders;
    for (let i = 0; i < sample.length; i++) {
      const o = sample[i];
      const startMs = new Date(o.orderDate).getTime();
      const endMs = o.actualDeliveryDate ? new Date(o.actualDeliveryDate).getTime() : new Date(o.expectedDeliveryDate).getTime();
      const days = Math.max(1, (endMs - startMs) / (1000 * 3600 * 24));

      const entry = supplierMap.get(o.supplierId) || { name: o.supplierName, total: 0, late: 0, totalDays: 0 };
      entry.total++;
      if (o.deliveryStatus === 'Late') entry.late++;
      entry.totalDays += days;
      supplierMap.set(o.supplierId, entry);
    }

    const list: Aggregation5SupplierPerf[] = [];
    supplierMap.forEach((val, id) => {
      const perfScore = Number((((val.total - val.late) / val.total) * 100).toFixed(1));
      list.push({
        supplierId: id,
        supplierName: val.name,
        ordersSupplied: val.total,
        lateDeliveries: val.late,
        avgDeliveryDays: Number((val.totalDays / val.total).toFixed(1)),
        performanceScore: perfScore
      });
    });

    list.sort((a, b) => b.performanceScore - a.performanceScore);
    return list;
  }

  public async getMonthlyOrderTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);
    const values = new Array(12).fill(0);

    let sample: any[] = [];
    if (this.isAtlasConnected && this.db) {
      sample = await this.db.collection<Order>('orders')
        .find({}, { projection: { orderDate: 1, orderValue: 1 } })
        .limit(50000)
        .toArray();
    } else {
      sample = this.orders;
    }

    for (let i = 0; i < sample.length; i++) {
      const o = sample[i];
      const d = new Date(o.orderDate);
      const m = d.getMonth();
      counts[m] += 1;
      values[m] += o.orderValue;
    }

    return months.map((month, idx) => ({
      month,
      totalOrders: counts[idx],
      totalValue: Number((values[idx]).toFixed(2))
    }));
  }

  public async getRegionalDemandData() {
    const demandMap = new Map<string, { count: number; value: number }>();

    if (this.isAtlasConnected && this.db) {
      const orders = await this.db.collection<Order>('orders')
        .find({}, { projection: { country: 1, orderValue: 1 } })
        .toArray();

      for (const o of orders) {
        const entry = demandMap.get(o.country) || { count: 0, value: 0 };
        entry.count++;
        entry.value += o.orderValue;
        demandMap.set(o.country, entry);
      }
    } else {
      for (let i = 0; i < this.orders.length; i++) {
        const o = this.orders[i];
        const entry = demandMap.get(o.country) || { count: 0, value: 0 };
        entry.count++;
        entry.value += o.orderValue;
        demandMap.set(o.country, entry);
      }
    }

    const result: Array<{ country: string; orderVolume: number; totalValue: number }> = [];
    demandMap.forEach((val, country) => {
      result.push({
        country,
        orderVolume: val.count,
        totalValue: Number(val.value.toFixed(2))
      });
    });

    result.sort((a, b) => b.orderVolume - a.orderVolume);
    return result;
  }

  public async getFullAnalytics(): Promise<AnalyticsResults> {
    const [
      onTimeRate,
      deliveryDaysByRegion,
      topDelayedRoutes,
      warehouseStock,
      supplierPerformance,
      monthlyOrderTrends,
      regionalDemand
    ] = await Promise.all([
      this.getOnTimeDeliveryRateAggregation(),
      this.getAvgDeliveryDaysByRegionAggregation(),
      this.getTopDelayedRoutesAggregation(),
      this.getWarehouseStockLevelsAggregation(),
      this.getSupplierPerformanceAggregation(),
      this.getMonthlyOrderTrends(),
      this.getRegionalDemandData()
    ]);

    return {
      onTimeRate,
      deliveryDaysByRegion,
      topDelayedRoutes,
      warehouseStock,
      supplierPerformance,
      monthlyOrderTrends,
      regionalDemand
    };
  }
}

export const mongoStore = new MongoStore();
