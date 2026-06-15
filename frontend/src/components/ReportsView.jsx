import React from "react";
import { FileText, Download, TrendingUp, Filter } from "lucide-react";

export default function ReportsView() {
  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-zinc-400 mt-1">Export your data and view insights.</p>
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4 mr-2" /> Filter Range
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 flex items-center justify-between hover:border-[#00d8a5] transition-colors group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Import Action Log (PDF)</h3>
              <p className="text-xs text-zinc-400">Generated from your latest CSV ingestion.</p>
            </div>
          </div>
          <a href="/report.pdf" download className="btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Download className="w-4 h-4" />
          </a>
        </div>

        <div className="card p-6 flex items-center justify-between hover:border-[#00d8a5] transition-colors group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-[#00d8a5]/10 border border-[#00d8a5]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#00d8a5]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Expenses Export (CSV)</h3>
              <p className="text-xs text-zinc-400">Download the full raw dataset.</p>
            </div>
          </div>
          <a href="/report.csv" download className="btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded bg-[#27272a] flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Coming Soon</h3>
        <p className="text-zinc-400 max-w-md">We are working on bringing you deep insights, spending trends, and predictive budgeting tools in the next update.</p>
      </div>
    </div>
  );
}
