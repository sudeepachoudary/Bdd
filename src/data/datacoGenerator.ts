import type { Order, Shipment, Warehouse, ShipmentEvent, DeliveryStatus, ShipmentStatus } from '../types/index.ts';

// DataCo Global Supply Chain Master Lists
const COUNTRIES = [
  { name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Seattle', 'Dallas'] },
  { name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Frankfurt', 'Stuttgart', 'Cologne'] },
  { name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'] },
  { name: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'] },
  { name: 'China', cities: ['Shanghai', 'Shenzhen', 'Beijing', 'Guangzhou', 'Ningbo'] },
  { name: 'India', cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad'] },
  { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Fukuoka'] },
  { name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },
  { name: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla'] }
];

const PRODUCTS = [
  { id: 'PROD-101', name: 'Nike Dri-FIT Running Shirt', price: 45 },
  { id: 'PROD-102', name: 'Adidas Ultraboost Sneakers', price: 180 },
  { id: 'PROD-103', name: 'Under Armour Gym Backpack', price: 65 },
  { id: 'PROD-104', name: 'TaylorMade Golf Driver', price: 499 },
  { id: 'PROD-105', name: 'Garmin Forerunner GPS Watch', price: 299 },
  { id: 'PROD-106', name: 'Wilson Pro Tennis Racket', price: 210 },
  { id: 'PROD-107', name: 'Spalding Official Basketball', price: 55 },
  { id: 'PROD-108', name: 'Oakley Radar Sunglasses', price: 175 },
  { id: 'PROD-109', name: 'Bauer Ice Hockey Skates', price: 340 },
  { id: 'PROD-110', name: 'Shimano Mountain Bike Helmet', price: 120 },
  { id: 'PROD-111', name: 'Peloton Indoor Exercise Bike', price: 1445 },
  { id: 'PROD-112', name: 'Bowflex SelectTech Dumbbells', price: 429 },
  { id: 'PROD-113', name: 'Yeti Rambler Insulated Tumbler', price: 38 },
  { id: 'PROD-114', name: 'North Face Hiking Parka', price: 280 },
  { id: 'PROD-115', name: 'Patagonia Outdoor Backpack', price: 149 }
];

const SUPPLIERS = [
  { id: 'SUP-001', name: 'Apex Logistics & Textile Co.' },
  { id: 'SUP-002', name: 'Global Tech & Sports Gear' },
  { id: 'SUP-003', name: 'Pacific Rim Freight Ltd.' },
  { id: 'SUP-004', name: 'Nordic Supply Chain Partners' },
  { id: 'SUP-005', name: 'EuroFreight Distribution' },
  { id: 'SUP-006', name: 'Atlas International Trading' },
  { id: 'SUP-007', name: 'Evergreen Industrial Goods' },
  { id: 'SUP-008', name: 'TransAtlantic Cargo Corp' }
];

const CARRIERS = [
  'FedEx Express',
  'DHL Global Forwarding',
  'Maersk Logistics',
  'UPS Worldwide Freight',
  'DB Schenker',
  'Kuehne + Nagel',
  'C.H. Robinson'
];

const WAREHOUSES_DEF: Warehouse[] = [
  { warehouseId: 'WH-US-01', warehouseName: 'North America Hub (Chicago)', country: 'United States', city: 'Chicago', capacity: 75000, availableStock: 52400, supplierCount: 12, manager: 'Sarah Jenkins' },
  { warehouseId: 'WH-US-02', warehouseName: 'West Coast Gateway (Los Angeles)', country: 'United States', city: 'Los Angeles', capacity: 90000, availableStock: 78100, supplierCount: 15, manager: 'David Miller' },
  { warehouseId: 'WH-EU-01', warehouseName: 'Central European Port (Hamburg)', country: 'Germany', city: 'Hamburg', capacity: 65000, availableStock: 39000, supplierCount: 10, manager: 'Hans Weber' },
  { warehouseId: 'WH-EU-02', warehouseName: 'Western Europe Hub (Paris)', country: 'France', city: 'Paris', capacity: 55000, availableStock: 46200, supplierCount: 8, manager: 'Claire Dubois' },
  { warehouseId: 'WH-AP-01', warehouseName: 'East Asia Logistics Terminal (Shanghai)', country: 'China', city: 'Shanghai', capacity: 120000, availableStock: 108500, supplierCount: 22, manager: 'Wei Zhang' },
  { warehouseId: 'WH-AP-02', warehouseName: 'South Asia Depot (Mumbai)', country: 'India', city: 'Mumbai', capacity: 60000, availableStock: 28400, supplierCount: 9, manager: 'Rajesh Kumar' },
  { warehouseId: 'WH-LA-01', warehouseName: 'Latin America Distribution (São Paulo)', country: 'Brazil', city: 'São Paulo', capacity: 50000, availableStock: 31200, supplierCount: 7, manager: 'Carlos Silva' },
  { warehouseId: 'WH-OC-01', warehouseName: 'Oceania Hub (Sydney)', country: 'Australia', city: 'Sydney', capacity: 40000, availableStock: 33800, supplierCount: 6, manager: 'Emma Watson' }
];

// Fixed list of limited active B2B & Enterprise Dummy Users/Customers
const DUMMY_USERS = [
  { id: 'CUST-1001', name: 'Apex Retail Distribution (Sarah Jenkins)' },
  { id: 'CUST-1002', name: 'Titan Sports Gear Ltd. (David Miller)' },
  { id: 'CUST-1003', name: 'Vanguard Global Logistics (Marcus Sterling)' },
  { id: 'CUST-1004', name: 'OmniCorp Freight Services (Elena Rostova)' },
  { id: 'CUST-1005', name: 'Pinnacle Outfitters (Aria Chen)' },
  { id: 'CUST-1006', name: 'Nordic Supply Partners (Hans Weber)' },
  { id: 'CUST-1007', name: 'Atlantic Commerce Hub (Claire Dubois)' },
  { id: 'CUST-1008', name: 'Pacific Rim Trade Corp (Wei Zhang)' },
  { id: 'CUST-1009', name: 'EuroMarket Direct (Carlos Silva)' },
  { id: 'CUST-1010', name: 'Summit Athletics & Goods (Emma Watson)' },
  { id: 'CUST-1011', name: 'CrossDock Enterprises (Rajesh Kumar)' },
  { id: 'CUST-1012', name: 'Beacon Freight Network (John Smith)' },
  { id: 'CUST-1013', name: 'Horizon Supply Chain (Olivia Brown)' },
  { id: 'CUST-1014', name: 'Meridian Global Trading (Lucas Garcia)' },
  { id: 'CUST-1015', name: 'Zenith Logistics Group (Sophia Taylor)' }
];

/**
 * Generates realistic supply chain records modeled after DataCo Global Supply Chain Dataset
 * Capped to a set of limited dummy user B2B accounts.
 */
export function generateDataCoDataset(recordCount = 50000): { orders: Order[]; shipments: Shipment[]; warehouses: Warehouse[] } {
  const orders: Order[] = new Array(recordCount);
  const shipments: Shipment[] = new Array(recordCount);

  const now = new Date('2026-08-01T00:00:00.000Z').getTime();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < recordCount; i++) {
    const orderNum = 100000 + i;
    const orderId = `ORD-${orderNum}`;
    
    // Select from limited dummy users
    const user = DUMMY_USERS[i % DUMMY_USERS.length];
    const customerId = user.id;
    const customerName = user.name;

    const prod = PRODUCTS[i % PRODUCTS.length];
    const supplier = SUPPLIERS[i % SUPPLIERS.length];
    const warehouse = WAREHOUSES_DEF[i % WAREHOUSES_DEF.length];
    const countryObj = COUNTRIES[i % COUNTRIES.length];
    const city = countryObj.cities[i % countryObj.cities.length];
    const country = countryObj.name;

    const quantity = (i % 8) + 1;
    const orderValue = Number((prod.price * quantity).toFixed(2));

    // Date generation spreading over the past 12 months
    const randomOffsetMs = (i / recordCount) * oneYearMs + ((i * 13) % (86400 * 1000 * 30));
    const orderDateObj = new Date(now - oneYearMs + (randomOffsetMs % oneYearMs));
    const orderDate = orderDateObj.toISOString();

    // Standard transit window: 3 to 7 days
    const expectedTransitDays = 3 + (i % 5);
    const expectedDeliveryDateObj = new Date(orderDateObj.getTime() + expectedTransitDays * 86400 * 1000);
    const expectedDeliveryDate = expectedDeliveryDateObj.toISOString();

    // Simulate delay probability (~28% delayed, typical of DataCo dataset)
    const isLate = (i * 3 + (i % 17)) % 100 < 28;
    const isCancelled = !isLate && (i % 97 === 0);
    const isInTransit = !isCancelled && (i > recordCount - 1500); // Most recent orders are in transit

    let deliveryStatus: DeliveryStatus;
    let actualDeliveryDate: string | null = null;
    let actualTransitDays = expectedTransitDays;

    if (isCancelled) {
      deliveryStatus = 'Cancelled';
      actualDeliveryDate = null;
    } else if (isInTransit) {
      deliveryStatus = 'In Transit';
      actualDeliveryDate = null;
    } else if (isLate) {
      deliveryStatus = 'Late';
      const extraDelayDays = 2 + (i % 6);
      actualTransitDays = expectedTransitDays + extraDelayDays;
      actualDeliveryDate = new Date(orderDateObj.getTime() + actualTransitDays * 86400 * 1000).toISOString();
    } else {
      deliveryStatus = 'On-Time';
      actualDeliveryDate = expectedDeliveryDate;
    }

    const order: Order = {
      orderId,
      customerId,
      customerName,
      productId: prod.id,
      productName: prod.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: warehouse.warehouseId,
      quantity,
      orderDate,
      expectedDeliveryDate,
      actualDeliveryDate,
      deliveryStatus,
      country,
      city,
      orderValue
    };

    orders[i] = order;

    // Shipment details with embedded event array
    const carrier = CARRIERS[i % CARRIERS.length];
    const route = `${warehouse.city} (${warehouse.country}) -> ${city} (${country})`;
    const shipmentId = `SHP-${200000 + i}`;

    let shipmentStatus: ShipmentStatus = 'Delivered';
    if (deliveryStatus === 'Cancelled') shipmentStatus = 'Exception';
    else if (deliveryStatus === 'In Transit') shipmentStatus = 'In Transit';
    else if (deliveryStatus === 'Late') shipmentStatus = 'Delayed';
    else shipmentStatus = 'Delivered';

    // Embedded event logs
    const events: ShipmentEvent[] = [
      {
        event: 'Packed',
        location: `${warehouse.warehouseName}, ${warehouse.city}`,
        timestamp: new Date(orderDateObj.getTime() + 4 * 3600 * 1000).toISOString(),
        notes: 'Order packaged & Quality Inspector checked'
      },
      {
        event: 'Dispatched',
        location: `${warehouse.city} Freight Hub`,
        timestamp: new Date(orderDateObj.getTime() + 18 * 3600 * 1000).toISOString(),
        notes: `Handed over to carrier: ${carrier}`
      }
    ];

    if (shipmentStatus !== 'Exception') {
      events.push({
        event: 'In Transit',
        location: `Midway Checkpoint (${country})`,
        timestamp: new Date(orderDateObj.getTime() + (actualTransitDays * 0.5) * 86400 * 1000).toISOString(),
        notes: shipmentStatus === 'Delayed' ? 'Customs/Port clearance delay flagged' : 'In transit on schedule'
      });

      if (actualDeliveryDate) {
        events.push({
          event: 'Delivered',
          location: `${city}, ${country}`,
          timestamp: actualDeliveryDate,
          notes: 'Proof of delivery signed by customer'
        });
      }
    }

    const shipment: Shipment = {
      shipmentId,
      orderId,
      carrier,
      route,
      originWarehouse: warehouse.warehouseName,
      destination: `${city}, ${country}`,
      shipmentStatus,
      events
    };

    shipments[i] = shipment;
  }

  return {
    orders,
    shipments,
    warehouses: WAREHOUSES_DEF
  };
}
