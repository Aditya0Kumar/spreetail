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
    { label: "Groceries", val: 28, color: "#5b45ff" },
    { label: "Utilities", val: 20, color: "#3b82f6" },
    { label: "Travel", val: 18, color: "#10b981" },
    { label: "Dining", val: 15, color: "#f59e0b" },
    { label: "Shopping", val: 10, color: "#ef4444" },
    { label: "Others", val: 9, color: "#94a3b8" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fadeIn">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-[#5b45ff]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Expenses</h3>
            <p className="text-2xl font-extrabold mt-1 text-slate-800">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-[10px] text-green-600 font-medium mt-1">↗ 12.4% vs last month</p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">My Net Balance</h3>
            <p className={`text-2xl font-extrabold mt-1 ${myNetBalance < 0 ? "text-red-500" : myNetBalance > 0 ? "text-green-600" : "text-slate-800"}`}>
              {myNetBalance < 0 ? "-" : ""}₹{Math.abs(myNetBalance).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Across all members</p>
          </div>
        </div>

        {/* Anomalies Detected */}
        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-amber-400">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Anomalies</h3>
            <p className="text-2xl font-extrabold mt-1 text-slate-800">18</p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Needs review in CSV</p>
          </div>
        </div>

        {/* Settled Payments */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Settled Payments</h3>
            <p className="text-2xl font-extrabold mt-1 text-slate-800">₹43,900</p>
            <p className="text-[10px] text-green-600 font-medium mt-1">↗ 15.3% vs last month</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Debt Simplification, Category Chart, Recent, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Debt Simplification */}
        <div className="card p-6 lg:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Debt Simplification</h3>
            <button onClick={() => navigateTo("debts")} className="text-xs text-[#5b45ff] font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            {simplifiedDebts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">All settled up! 🎉</p>
            ) : (
              simplifiedDebts.slice(0, 3).map((debt, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{debt.from[0]}</div>
                      <span className="text-[10px] mt-1 font-medium">{debt.from}</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-[9px] text-slate-400 uppercase">owes</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 my-0.5" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">{debt.to[0]}</div>
                      <span className="text-[10px] mt-1 font-medium">{debt.to}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#5b45ff]">₹{debt.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses by Category (Chart) */}
        <div className="card p-6 lg:col-span-3 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-slate-800 w-full text-left mb-6">Expenses by Category</h3>
          <div className="relative w-40 h-40 rounded-full mb-6" style={{
            background: `conic-gradient(
              #5b45ff 0% 28%, 
              #3b82f6 28% 48%, 
              #10b981 48% 66%, 
              #f59e0b 66% 81%, 
              #ef4444 81% 91%, 
              #94a3b8 91% 100%
            )`
          }}>
            {/* Donut hole */}
            <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-slate-800">₹{(totalExpenses/1000).toFixed(1)}k</span>
              <span className="text-[10px] text-slate-400 uppercase">Total</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            {chartData.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                  <span className="text-slate-600">{c.label}</span>
                </div>
                <span className="font-medium text-slate-800">{c.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses & Quick Actions */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Recent Expenses</h3>
              <button onClick={() => navigateTo("expenses")} className="text-xs text-[#5b45ff] font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              {expenses.slice(0, 3).map(exp => (
                <div key={exp.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <Receipt className="w-5 h-5 text-slate-500 group-hover:text-[#5b45ff]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{exp.description}</p>
                      <p className="text-[10px] text-slate-500">{new Date(exp.date).toLocaleDateString()} • Paid by {exp.paidBy.username}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-800">
                    ₹{(exp.amount * exp.exchangeRate).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-[#f0eeff] to-white border-indigo-100">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigateTo("import")} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-indigo-50 shadow-sm hover:border-indigo-200 hover:shadow transition-all group">
                <UploadCloud className="w-6 h-6 text-[#5b45ff] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-700">Import CSV</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-indigo-50 shadow-sm hover:border-indigo-200 hover:shadow transition-all group">
                <Plus className="w-6 h-6 text-[#5b45ff] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-700">Add Expense</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
