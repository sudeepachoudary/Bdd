import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { mongoStore } from './src/db/mongoStore.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000;

  // Wait for MongoDB connection before initializing database operations or listening
  await mongoStore.init();

  app.use(cors());
  app.use(express.json());

  // API ROUTES

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const isAtlas = mongoStore.isConnectedToAtlas();
      const count = await mongoStore.getRecordCount();
      res.json({
        status: 'ok',
        db: isAtlas ? 'MongoDB Atlas' : 'MongoDB (Mingo/Embedded Memory Engine)',
        atlasConnected: isAtlas,
        recordCount: count,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed status
  app.get('/api/seed/status', async (req, res) => {
    try {
      const count = await mongoStore.getRecordCount();
      res.json({
        seeded: true,
        recordsCount: count,
        atlasConnected: mongoStore.isConnectedToAtlas(),
        collections: ['orders', 'shipments', 'warehouses']
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/seed/reset', async (req, res) => {
    try {
      const { count = 50000 } = req.body || {};
      await mongoStore.seedDatabase(count);
      const recordsCount = await mongoStore.getRecordCount();
      res.json({
        message: `Database re-seeded successfully with ${count} DataCo records`,
        recordsCount
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard Stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await mongoStore.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Orders CRUD
  app.get('/api/orders', async (req, res) => {
    try {
      const {
        search = '',
        status = 'ALL',
        country = 'ALL',
        supplierId = 'ALL',
        warehouseId = 'ALL',
        page = '1',
        limit = '20'
      } = req.query;

      const result = await mongoStore.getOrders({
        search: String(search),
        status: String(status),
        country: String(country),
        supplierId: String(supplierId),
        warehouseId: String(warehouseId),
        page: parseInt(String(page), 10) || 1,
        limit: parseInt(String(limit), 10) || 20
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await mongoStore.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const created = await mongoStore.createOrder(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id', async (req, res) => {
    try {
      const updated = await mongoStore.updateOrder(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const success = await mongoStore.deleteOrder(req.params.id);
      if (!success) return res.status(404).json({ error: 'Order not found' });
      res.json({ message: 'Order deleted successfully', orderId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Shipment Tracking & Embedded Events
  app.get('/api/shipments/track', async (req, res) => {
    try {
      const query = String(req.query.q || '');
      if (!query) return res.status(400).json({ error: 'Tracking query parameter q is required' });

      const shipment = await mongoStore.getShipmentByTracking(query);
      if (!shipment) return res.status(404).json({ error: 'Shipment or Order tracking record not found' });

      const associatedOrder = await mongoStore.getOrderById(shipment.orderId);

      res.json({
        shipment,
        order: associatedOrder
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/shipments/:id/events', async (req, res) => {
    try {
      const { event, location, notes } = req.body;
      if (!event || !location) {
        return res.status(400).json({ error: 'event and location are required fields' });
      }

      const updatedShipment = await mongoStore.addShipmentEvent(req.params.id, {
        event,
        location,
        timestamp: new Date().toISOString(),
        notes
      });

      if (!updatedShipment) return res.status(404).json({ error: 'Shipment not found' });
      res.json(updatedShipment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Warehouses
  app.get('/api/warehouses', async (req, res) => {
    try {
      const warehouses = await mongoStore.getWarehouses();
      res.json(warehouses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/warehouses/:id/stock', async (req, res) => {
    try {
      const { availableStock } = req.body;
      if (availableStock === undefined || isNaN(Number(availableStock))) {
        return res.status(400).json({ error: 'Numeric availableStock is required' });
      }

      const updated = await mongoStore.updateWarehouseStock(req.params.id, Number(availableStock));
      if (!updated) return res.status(404).json({ error: 'Warehouse not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Analytics - The 5 MongoDB Aggregation Queries
  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await mongoStore.getFullAnalytics();
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Supply Chain Insights (Gemini API server-side endpoint)
  app.post('/api/ai-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const analytics = await mongoStore.getFullAnalytics();

      if (!apiKey) {
        return res.json({
          insight: 'Gemini API key is not set. Showing rule-based bottleneck analysis: Top route delays are concentrated on ocean transit routes between Shanghai and European ports (Hamburg/Frankfurt) with an average 4.2 days customs backlog. Supplier Apex Logistics & Textile Co. maintains 94.2% on-time performance.'
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert Chief Supply Chain & Logistics Analyst. Analyze this DataCo Global Supply Chain summary:
        - On-time delivery rate: ${analytics.onTimeRate.onTimePercentage}% (${analytics.onTimeRate.lateOrders} late out of ${analytics.onTimeRate.totalOrders})
        - Top delayed routes: ${JSON.stringify(analytics.topDelayedRoutes.slice(0, 3))}
        - Lowest performing supplier: ${JSON.stringify(analytics.supplierPerformance[analytics.supplierPerformance.length - 1])}
        - Warehouse utilization: ${JSON.stringify(analytics.warehouseStock.map(w => ({ name: w.warehouseName, util: w.utilizationPercentage + '%' })))}

        Provide a concise 3-bullet executive briefing:
        1. Main Delivery Bottleneck Cause
        2. Supplier Risk & Mitigation Recommendation
        3. Warehouse Capacity Allocation Strategy
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({
        insight: response.text
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({
        error: 'Failed to generate AI insights',
        details: err.message
      });
    }
  });

  // VITE OR STATIC SERVING
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Supply Chain & Logistics Tracker server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
