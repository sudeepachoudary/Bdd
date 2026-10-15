import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Database, Layers, TrendingUp } from 'lucide-react';
import { DashboardStats, AnalyticsResults } from '../types/index';
import { generateSupplyChainPDFReport } from '../utils/pdfGenerator';

interface PDFReportViewProps {
  stats: DashboardStats | null;
  analytics: AnalyticsResults | null;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PDFReportView: React.FC<PDFReportViewProps> = ({ stats, analytics, onShowToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    if (!stats || !analytics) {
      onShowToast('Data is loading, please wait a moment...', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      generateSupplyChainPDFReport(stats, analytics);
      onShowToast('PDF Analytics Report downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      onShowToast(`Failed to generate PDF: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Download Action Banner */}
      <div className="bg-[#fbe1d1] p-8 rounded-[24px] text-[#5d2a1a] border border-[#f7d2bd] shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-[#5d2a1a] text-xs font-medium border border-[#f7d2bd]">
            <FileText className="w-3.5 h-3.5" />
            <span>Comprehensive PDF Report Generator</span>
          </div>
          <h2 className="font-serif-display text-2xl font-normal text-[#17191c]">Supply Chain & Logistics Tracker Report</h2>
          <p className="text-[#5d2a1a]/80 text-xs max-w-xl leading-relaxed font-normal">
            Generate an official downloadable PDF report complete with project architecture diagrams, MongoDB collection schemas, embedded event sourcing explanations, aggregation outputs, bottleneck diagnostics, and future enhancement roadmaps.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating || !stats || !analytics}
          className="px-6 py-3.5 rounded-full bg-[#17191c] hover:bg-[#2b2d31] text-white font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-white" />
          <span>{isGenerating ? 'Compiling PDF...' : 'Download PDF Report'}</span>
        </button>
      </div>

      {/* Report Structure Preview Cards */}
      <div className="bg-white rounded-[24px] border border-[#ececec] p-6 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] space-y-6">
        <h3 className="font-serif-display text-lg font-normal text-[#17191c] border-b border-[#ececec] pb-3">
          Document Structure Included in the PDF Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#17191c] font-semibold">
              <CheckCircle className="w-4 h-4 text-[#17191c]" />
              <span>1. Executive Introduction & Architecture</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              Full system overview detailing Node.js, Express, MongoDB, and vector architecture block diagrams.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#17191c] font-semibold">
              <Database className="w-4 h-4 text-[#17191c]" />
              <span>2. MongoDB Schema & Event Sourcing</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              Formal MongoDB schema specs for <code className="font-mono font-semibold text-[#17191c]">orders</code>, <code className="font-mono font-semibold text-[#17191c]">shipments</code>, and <code className="font-mono font-semibold text-[#17191c]">warehouses</code> collections.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#17191c] font-semibold">
              <TrendingUp className="w-4 h-4 text-[#17191c]" />
              <span>3. DataCo Dataset Summary Metrics</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              Statistical summary of 50,000+ records, on-time delivery percentages, valuation, and delay tallies.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#17191c] font-semibold">
              <Layers className="w-4 h-4 text-[#17191c]" />
              <span>4. 5 Aggregation Query Tables</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              Formatted tables of regional transit days, top delayed shipping routes, warehouse stock utilization, and supplier scores.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#5d2a1a] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#5d2a1a]" />
              <span>5. Bottleneck Diagnostics</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              In-depth cause analysis for ocean port congestion, customs clearance backlogs, and carrier performance risks.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#f2f2f3] border border-[#ececec] space-y-2">
            <div className="flex items-center gap-2 text-[#17191c] font-semibold">
              <CheckCircle className="w-4 h-4 text-[#17191c]" />
              <span>6. Recommended Enhancements</span>
            </div>
            <p className="text-[#777b86] leading-relaxed">
              Future development roadmap covering IoT telemetry sensors and ML delay prediction models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

