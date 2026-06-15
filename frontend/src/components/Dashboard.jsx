import React, { useState, useEffect } from "react";
import { IndianRupee, Wallet, AlertTriangle, CheckCircle, Plus, UploadCloud, Receipt, ArrowRight } from "lucide-react";

export default function Dashboard({ currentUser, backendUrl, groupId, navigateTo }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [expRes, balRes, simpRes] = await Promise.all([
        fetch(`${backendUrl}/api/expenses?groupId=${groupId}`),
        fetch(`${backendUrl}/api/expenses/balances?groupId=${groupId}`),
        fetch(`${backendUrl}/api/expenses/simplified-debts?groupId=${groupId}`),
      ]);
      setExpenses(await expRes.json());
      setBalances(await balRes.json());
      setSimplifiedDebts(await simpRes.json());
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [groupId, backendUrl]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount * e.exchangeRate), 0);
  const myNetBalance = balances[currentUser.id]?.net || 0;
  
  // Fake donut chart data
  const chartData = [
    { label: "Groceries", val: 28, color: "#00d8a5" },
    { label: "Utilities", val: 20, color: "#3b82f6" },
    { label: "Travel", val: 18, color: "#10b981" },
    { label: "Dining", val: 15, color: "#f59e0b" },
    { label: "Shopping", val: 10, color: "#ef4444" },
    { label: "Others", val: 9, color: "#71717a" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fadeIn relative z-10">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="card p-5 flex items-center gap-4 border-t-2 border-t-[#00d8a5]">
          <div className="w-12 h-12 rounded bg-[#00d8a5]/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-[#00d8a5]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total Expenses</h3>
            <p className="text-2xl font-extrabold mt-1 text-white">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-[10px] text-[#00d8a5] font-medium mt-1">↗ 12.4% vs last month</p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-orange-500/10 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">My Net Balance</h3>
            <p className={`text-2xl font-extrabold mt-1 ${myNetBalance < 0 ? "text-red-400" : myNetBalance > 0 ? "text-[#00d8a5]" : "text-white"}`}>
              {myNetBalance < 0 ? "-" : ""}₹{Math.abs(myNetBalance).toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">Across all members</p>
          </div>
        </div>

        {/* Anomalies Detected */}
        <div className="card p-5 flex items-center gap-4 border-l-2 border-l-amber-500">
          <div className="w-12 h-12 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Anomalies</h3>
            <p className="text-2xl font-extrabold mt-1 text-white">18</p>
            <p className="text-[10px] text-amber-400 font-medium mt-1">Needs review in CSV</p>
          </div>
        </div>

        {/* Settled Payments */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Settled Payments</h3>
            <p className="text-2xl font-extrabold mt-1 text-white">₹43,900</p>
            <p className="text-[10px] text-emerald-400 font-medium mt-1">↗ 15.3% vs last month</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Debt Simplification, Category Chart, Recent, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Debt Simplification */}
        <div className="card p-6 lg:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white tracking-tight">Debt Simplification</h3>
            <button onClick={() => navigateTo("debts")} className="text-xs text-[#00d8a5] font-medium flex items-center gap-1 hover:text-white transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            {simplifiedDebts.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">All settled up! 🎉</p>
            ) : (
              simplifiedDebts.slice(0, 3).map((debt, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded bg-[#09090b] border border-[#27272a]">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center text-xs font-bold text-white">{debt.from[0]}</div>
                      <span className="text-[10px] mt-1 font-medium text-zinc-400">{debt.from}</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-[9px] text-zinc-600 uppercase">owes</span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 my-0.5" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center text-xs font-bold text-white">{debt.to[0]}</div>
                      <span className="text-[10px] mt-1 font-medium text-zinc-400">{debt.to}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#00d8a5]">₹{debt.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses by Category (Chart) */}
        <div className="card p-6 lg:col-span-3 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-white w-full text-left mb-6 tracking-tight">Expenses by Category</h3>
          <div className="relative w-40 h-40 rounded-full mb-6" style={{
            background: `conic-gradient(
              #00d8a5 0% 28%, 
              #3b82f6 28% 48%, 
              #10b981 48% 66%, 
              #f59e0b 66% 81%, 
              #ef4444 81% 91%, 
              #71717a 91% 100%
            )`
          }}>
            {/* Donut hole */}
            <div className="absolute inset-0 m-auto w-24 h-24 bg-[#18181b] rounded-full flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-white">₹{(totalExpenses/1000).toFixed(1)}k</span>
              <span className="text-[10px] text-zinc-500 uppercase">Total</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            {chartData.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                  <span className="text-zinc-400">{c.label}</span>
                </div>
                <span className="font-medium text-white">{c.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses & Quick Actions */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white tracking-tight">Recent Expenses</h3>
              <button onClick={() => navigateTo("expenses")} className="text-xs text-[#00d8a5] font-medium flex items-center gap-1 hover:text-white transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              {expenses.slice(0, 3).map(exp => (
                <div key={exp.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#09090b] border border-[#27272a] flex items-center justify-center group-hover:border-[#00d8a5] transition-colors">
                      <Receipt className="w-5 h-5 text-zinc-400 group-hover:text-[#00d8a5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-200">{exp.description}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(exp.date).toLocaleDateString()} • Paid by {exp.paidBy.username}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-white">
                    ₹{(exp.amount * exp.exchangeRate).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-[#00d8a5]/5 border-[#00d8a5]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d8a5]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="font-bold text-white mb-4 tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => navigateTo("import")} className="flex flex-col items-center justify-center p-4 bg-[#18181b] rounded border border-[#27272a] hover:border-[#00d8a5] hover:bg-[#09090b] transition-all group">
                <UploadCloud className="w-6 h-6 text-[#00d8a5] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-zinc-300">Import CSV</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-[#18181b] rounded border border-[#27272a] hover:border-[#00d8a5] hover:bg-[#09090b] transition-all group">
                <Plus className="w-6 h-6 text-[#00d8a5] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-zinc-300">Add Expense</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
