import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle, Building2, Users, MapPin } from 'lucide-react';
import { AnalyticsResults } from '../types/index';

// Register Chart.js modules
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsViewProps {
  analytics: AnalyticsResults | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#17191c] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#777b86]">Executing MongoDB Aggregation Pipelines...</p>
        </div>
      </div>
    );
  }

  const { onTimeRate, deliveryDaysByRegion, topDelayedRoutes, warehouseStock, supplierPerformance, monthlyOrderTrends, regionalDemand } = analytics;

  // 1. Pie Chart Data: On-Time vs Late Deliveries
  const pieChartData = {
    labels: ['On-Time Orders', 'Late Orders'],
    datasets: [
      {
        data: [onTimeRate.onTimeOrders, onTimeRate.lateOrders],
        backgroundColor: ['#17191c', '#fbe1d1'],
        borderColor: ['#17191c', '#f7d2bd'],
        borderWidth: 1
      }
    ]
  };

  // 2. Bar Chart Data: Average Delivery Days by Region
  const regionBarData = {
    labels: deliveryDaysByRegion.map(r => r.country),
    datasets: [
      {
        label: 'Avg Delivery Days',
        data: deliveryDaysByRegion.map(r => r.avgDeliveryDays),
        backgroundColor: '#17191c',
        borderRadius: 8
      }
    ]
  };

  // 3. Bar Chart Data: Warehouse Stock Levels (Capacity vs Available Stock)
  const warehouseBarData = {
    labels: warehouseStock.map(w => w.warehouseName.split('(')[0]),
    datasets: [
      {
        label: 'Available Stock',
        data: warehouseStock.map(w => w.availableStock),
        backgroundColor: '#17191c',
        borderRadius: 6
      },
      {
        label: 'Capacity Limit',
        data: warehouseStock.map(w => w.capacity),
        backgroundColor: '#f2f2f3',
        borderRadius: 6
      }
    ]
  };

  // 4. Line Chart Data: Monthly Order Trends
  const lineChartData = {
    labels: monthlyOrderTrends.map(m => m.month),
    datasets: [
      {
        label: 'Monthly Orders',
        data: monthlyOrderTrends.map(m => m.totalOrders),
        borderColor: '#17191c',
        backgroundColor: 'rgba(23, 25, 28, 0.05)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // 5. Regional Demand Chart Data: Country Order Volume
  const regionalDemandData = {
    labels: regionalDemand.map(d => d.country),
    datasets: [
      {
        label: 'Order Volume',
        data: regionalDemand.map(d => d.orderVolume),
        backgroundColor: '#5d2a1a',
        borderRadius: 6
      }
    ]
  };

  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#777b86',
          font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#777b86' },
        grid: { color: '#ececec' }
      },
      y: {
        ticks: { color: '#777b86' },
        grid: { color: '#ececec' }
      }
    }
  };

  const pieOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#777b86',
          font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Analytics Banner */}
      <div className="bg-white p-6 rounded-[24px] text-[#17191c] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)]">
        <h2 className="font-serif-display text-2xl text-[#17191c] font-normal flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-[#17191c]" />
          <span>MongoDB Aggregation Pipelines & Visual Analytics</span>
        </h2>
        <p className="text-[#777b86] text-xs mt-1 font-normal">
          Direct outputs from 5 optimized MongoDB aggregation queries over 50,000+ DataCo Global Supply Chain documents.
        </p>
      </div>

      {/* AGGREGATION 1: On-Time Delivery Rate & Pie Chart */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#ececec] pb-3">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full border border-[#ececec]">
              MongoDB Pipeline #1
            </span>
            <h3 className="font-serif-display text-xl text-[#17191c] font-normal mt-1">Calculate On-Time Delivery Rate</h3>
          </div>
          <div className="text-right">
            <span className="font-serif-display text-3xl text-[#17191c] font-normal">{onTimeRate.onTimePercentage}%</span>
            <p className="text-[10px] text-[#777b86]">On-Time Accuracy Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Metrics summary */}
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-[#f2f2f3] rounded-[16px] border border-[#ececec]">
              <span className="text-[#777b86]">Total Analyzed Orders:</span>
              <p className="text-lg font-semibold text-[#17191c] mt-0.5">{onTimeRate.totalOrders.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#e6f4ea] rounded-[16px] text-[#137333]">
              <span className="font-medium">On-Time Orders:</span>
              <p className="text-lg font-semibold mt-0.5">{onTimeRate.onTimeOrders.toLocaleString()} ({onTimeRate.onTimePercentage}%)</p>
            </div>
            <div className="p-4 bg-[#fce8e6] rounded-[16px] text-[#c5221f]">
              <span className="font-medium">Late Deliveries:</span>
              <p className="text-lg font-semibold mt-0.5">{onTimeRate.lateOrders.toLocaleString()} ({onTimeRate.latePercentage}%)</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="md:col-span-2 h-64 relative">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* AGGREGATION 2: Average Delivery Days by Region (Bar Chart) */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="border-b border-[#ececec] pb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full border border-[#ececec]">
            MongoDB Pipeline #2
          </span>
          <h3 className="font-serif-display text-xl text-[#17191c] font-normal mt-1">Average Delivery Days by Region (Group by Country)</h3>
        </div>

        <div className="h-72">
          <Bar data={regionBarData} options={chartOptions} />
        </div>
      </div>

      {/* AGGREGATION 3: Top Delayed Routes Table */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="border-b border-[#ececec] pb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full">
            MongoDB Pipeline #3
          </span>
          <h3 className="font-serif-display text-xl text-[#17191c] font-normal mt-1">Top 10 Delayed Shipping Routes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f2f3] text-[#979799] font-medium uppercase border-b border-[#ececec]">
              <tr>
                <th className="px-5 py-3.5">Route Path</th>
                <th className="px-5 py-3.5">Carrier Name</th>
                <th className="px-5 py-3.5">Delayed Shipments</th>
                <th className="px-5 py-3.5">Avg Delay Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec] text-[#17191c]">
              {topDelayedRoutes.map((route, idx) => (
                <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#17191c]">{route.route}</td>
                  <td className="px-5 py-3.5 font-normal text-[#777b86]">{route.carrier}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#c5221f]">{route.delayedShipmentsCount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#5d2a1a]">+{route.avgDelayDays} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AGGREGATION 4: Warehouse Stock Levels (Bar Chart) */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="border-b border-[#ececec] pb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#17191c] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full border border-[#ececec]">
            MongoDB Pipeline #4
          </span>
          <h3 className="font-serif-display text-xl text-[#17191c] font-normal mt-1">Warehouse Stock Levels vs Capacity</h3>
        </div>

        <div className="h-72">
          <Bar data={warehouseBarData} options={chartOptions} />
        </div>
      </div>

      {/* AGGREGATION 5: Supplier Performance Score Table */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
        <div className="border-b border-[#ececec] pb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full">
            MongoDB Pipeline #5
          </span>
          <h3 className="font-serif-display text-xl text-[#17191c] font-normal mt-1">Supplier Performance & Reliability Analysis</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f2f3] text-[#979799] font-medium uppercase border-b border-[#ececec]">
              <tr>
                <th className="px-5 py-3.5">Supplier Name</th>
                <th className="px-5 py-3.5">Orders Supplied</th>
                <th className="px-5 py-3.5">Late Deliveries</th>
                <th className="px-5 py-3.5">Avg Delivery Days</th>
                <th className="px-5 py-3.5">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec] text-[#17191c]">
              {supplierPerformance.map((sup, idx) => (
                <tr key={idx} className="hover:bg-[#fafafb] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#17191c]">{sup.supplierName}</td>
                  <td className="px-5 py-3.5 font-mono">{sup.ordersSupplied.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-mono text-[#c5221f]">{sup.lateDeliveries.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-mono">{sup.avgDeliveryDays} Days</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-3 py-0.5 rounded-full font-medium ${
                      sup.performanceScore >= 90
                        ? 'bg-[#e6f4ea] text-[#137333]'
                        : 'bg-[#fbe1d1] text-[#5d2a1a]'
                    }`}>
                      {sup.performanceScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADDITIONAL CHARTS: Monthly Trends & Regional Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="font-serif-display text-lg text-[#17191c] font-normal">Monthly Order Volume Trend (Line Chart)</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="font-serif-display text-lg text-[#17191c] font-normal">Regional Order Demand by Country</h3>
          <div className="h-64">
            <Bar data={regionalDemandData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

