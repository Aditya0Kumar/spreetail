import React from "react";
import { FileSearch, ShieldAlert, CheckCircle, Download } from "lucide-react";

export default function AuditView() {
  const auditLogs = [
    { row: 2, type: "UNRECOGNIZED_CURRENCY", desc: "Unknown currency '₹' for amount 1500", action: "CONVERTED TO INR", status: "RESOLVED" },
    { row: 7, type: "FUTURE_DATE", desc: "Date 'August 14, 2026' is in the future", action: "REJECTED ROW", status: "REJECTED" },
    { row: 12, type: "DUPLICATE_TRANSACTION", desc: "Identical transaction 'Dinner' found on same date", action: "DE-DUPLICATED", status: "RESOLVED" },
    { row: 18, type: "MISSING_PAYER", desc: "Payer field is empty", action: "ASSIGNED TO DEFAULT (Meera)", status: "RESOLVED" },
    { row: 25, type: "INACTIVE_MEMBER_SPLIT", desc: "Meera charged for expenses after move out date", action: "EXCLUDED MEERA / RE-SPLIT", status: "RESOLVED" },
    { row: 31, type: "EXCHANGE_RATE_MISSING", desc: "USD amount 50 missing exchange rate", action: "APPLIED DEFAULT RATE (83.5)", status: "RESOLVED" },
    { row: 39, type: "INACTIVE_MEMBER_SPLIT_SAM", desc: "Sam charged before join date", action: "APPROVED AS EXCEPTION", status: "RESOLVED" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Audit Ledger</h2>
          <p className="text-sm text-zinc-400 mt-1">Review anomaly resolutions and system actions.</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4 mr-2" /> Export Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 border-t-2 border-[#00d8a5]">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total Processed</h3>
          <p className="text-2xl font-extrabold mt-1 text-white">44 Rows</p>
        </div>
        <div className="card p-5 border-t-2 border-amber-500">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Anomalies Detected</h3>
          <p className="text-2xl font-extrabold mt-1 text-white">19 Issues</p>
        </div>
        <div className="card p-5 border-t-2 border-red-500">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Rows Rejected</h3>
          <p className="text-2xl font-extrabold mt-1 text-white">3 Rows</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Recent Resolutions
          </h3>
          <span className="text-xs text-zinc-500">Showing last 7 actions</span>
        </div>
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#09090b] border-b border-[#27272a]">
            <tr>
              <th className="py-3 px-5 font-semibold text-xs text-zinc-500 w-16">Row</th>
              <th className="py-3 px-5 font-semibold text-xs text-zinc-500">Anomaly Type</th>
              <th className="py-3 px-5 font-semibold text-xs text-zinc-500">Description</th>
              <th className="py-3 px-5 font-semibold text-xs text-zinc-500">Action Taken</th>
              <th className="py-3 px-5 font-semibold text-xs text-zinc-500 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] bg-[#18181b]">
            {auditLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-[#27272a]/50 transition-colors">
                <td className="py-4 px-5 font-medium text-zinc-300">{log.row}</td>
                <td className="py-4 px-5">
                  <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    {log.type}
                  </span>
                </td>
                <td className="py-4 px-5 text-zinc-300">{log.desc}</td>
                <td className="py-4 px-5 font-medium text-white">{log.action}</td>
                <td className="py-4 px-5 text-right">
                  {log.status === "RESOLVED" ? (
                    <span className="inline-flex items-center gap-1 text-[#00d8a5] text-xs font-bold uppercase tracking-wide">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold uppercase tracking-wide">
                      <ShieldAlert className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
