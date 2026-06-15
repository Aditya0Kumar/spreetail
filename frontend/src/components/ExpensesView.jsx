import React, { useState, useEffect } from "react";
import { Receipt, Search, Filter, ArrowRight } from "lucide-react";

export default function ExpensesView({ backendUrl, groupId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reusing the dashboard endpoint to get expenses for prototype
    fetch(`${backendUrl}/api/groups/${groupId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setExpenses(data.recentExpenses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [backendUrl, groupId]);

  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">All Expenses</h2>
          <p className="text-sm text-zinc-400 mt-1">View and filter all group expenses.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search expenses..." className="input-field pl-9 w-64 bg-[#18181b] border-[#27272a]" />
          </div>
          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#09090b] border-b border-[#27272a]">
            <tr>
              <th className="py-4 px-6 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Description</th>
              <th className="py-4 px-6 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Paid By</th>
              <th className="py-4 px-6 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="py-4 px-6 font-semibold text-xs text-zinc-500 uppercase tracking-wider text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] bg-[#18181b]">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-zinc-500">Loading expenses...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-zinc-500">No expenses found.</td></tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#27272a]/50 transition-colors">
                  <td className="py-4 px-6 text-zinc-400 whitespace-nowrap">{new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-6 font-medium text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#09090b] border border-[#27272a] flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-zinc-500" />
                      </div>
                      {exp.description}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{exp.paidBy?.username || "Unknown"}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-[#27272a] text-zinc-300 text-[10px] uppercase font-bold tracking-wider rounded border border-[#3f3f46]">
                      {exp.category || "General"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-[#00d8a5]">
                    ₹{(exp.amount * exp.exchangeRate).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
