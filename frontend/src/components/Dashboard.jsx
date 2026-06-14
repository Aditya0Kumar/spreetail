import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import {
  Users, PlusCircle, ArrowDownUp, FileText, Calendar, ChevronRight,
  LogOut, ArrowRight, Trash2, Sun, Moon, RefreshCw, TrendingUp, TrendingDown, Minus
} from "lucide-react";

const AVATAR_COLORS = {
  Aisha: ["#7c3aed", "#a78bfa"], Rohan: ["#2563eb", "#60a5fa"],
  Priya: ["#db2777", "#f472b6"], Meera: ["#ea580c", "#fb923c"],
  Sam: ["#059669", "#34d399"], Dev: ["#0891b2", "#22d3ee"],
};

export default function Dashboard({ currentUser, onLogout, backendUrl, groupId, onTriggerImport }) {
  const { theme, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [selectedAuditUser, setSelectedAuditUser] = useState(null);
  const [pairwiseLedger, setPairwiseLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOriginalCurrency, setShowOriginalCurrency] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmt, setExpenseAmt] = useState("");
  const [expenseCurr, setExpenseCurr] = useState("INR");
  const [expensePayer, setExpensePayer] = useState(currentUser.username);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseSplitType, setExpenseSplitType] = useState("equal");
  const [showSettleForm, setShowSettleForm] = useState(false);
  const [settlePayee, setSettlePayee] = useState("");
  const [settleAmt, setSettleAmt] = useState("");

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, balRes, simpRes] = await Promise.all([
        fetch(`${backendUrl}/api/expenses?groupId=${groupId}`),
        fetch(`${backendUrl}/api/expenses/balances?groupId=${groupId}`),
        fetch(`${backendUrl}/api/expenses/simplified-debts?groupId=${groupId}`),
      ]);
      if (!expRes.ok || !balRes.ok || !simpRes.ok) throw new Error("Failed to load dashboard data");
      setExpenses(await expRes.json());
      setBalances(await balRes.json());
      setSimplifiedDebts(await simpRes.json());
    } catch (err) {
      console.error(err);
      setError("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [groupId, backendUrl]);

  const loadAuditLedger = async (otherUser) => {
    setSelectedAuditUser(otherUser);
    try {
      const res = await fetch(`${backendUrl}/api/expenses/audit-ledger?groupId=${groupId}&userA=${currentUser.username}&userB=${otherUser}`);
      if (!res.ok) throw new Error("Failed to load audit ledger");
      setPairwiseLedger(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmt || isNaN(expenseAmt) || parseFloat(expenseAmt) <= 0) {
      alert("Please enter a valid description and amount."); return;
    }
    const expDateObj = new Date(expenseDate);
    const splitUsers = ["Aisha", "Rohan", "Priya"];
    if (expDateObj <= new Date("2026-03-31T23:59:59Z")) splitUsers.push("Meera");
    if (expDateObj >= new Date("2026-04-15T00:00:00Z")) splitUsers.push("Sam");
    const exchangeRate = expenseCurr === "USD" ? 83.0 : 1.0;
    const totalAmount = parseFloat(expenseAmt);
    const splits = splitUsers.map(username => ({ username, share: 1.0, amount: totalAmount / splitUsers.length }));
    try {
      const res = await fetch(`${backendUrl}/api/expenses`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, description: expenseDesc, amount: totalAmount, currency: expenseCurr, exchangeRate, paidByUsername: expensePayer, date: expenseDate, splitType: expenseSplitType, splits })
      });
      if (!res.ok) throw new Error("Failed to save expense");
      setExpenseDesc(""); setExpenseAmt(""); setExpenseCurr("INR"); setShowExpenseForm(false);
      refreshData();
      if (selectedAuditUser) loadAuditLedger(selectedAuditUser);
    } catch (err) { alert(err.message); }
  };

  const handleRecordSettlement = async (e) => {
    e.preventDefault();
    if (!settlePayee || !settleAmt || isNaN(settleAmt) || parseFloat(settleAmt) <= 0) {
      alert("Please select a recipient and enter a valid amount."); return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/expenses/settlement`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, payerUsername: currentUser.username, payeeUsername: settlePayee, amount: parseFloat(settleAmt), currency: "INR", exchangeRate: 1.0, date: new Date().toISOString() })
      });
      if (!res.ok) throw new Error("Failed to record settlement");
      setSettlePayee(""); setSettleAmt(""); setShowSettleForm(false);
      refreshData();
      if (selectedAuditUser) loadAuditLedger(selectedAuditUser);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
      refreshData();
      if (selectedAuditUser) loadAuditLedger(selectedAuditUser);
    } catch (err) { alert(err.message); }
  };

  const userColors = AVATAR_COLORS[currentUser.username] || ["#6366f1", "#818cf8"];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* HEADER */}
      <header className="surface-elevated p-5 rounded-2xl mb-6 flex justify-between items-center flex-wrap gap-4 relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, ${userColors[0]}, ${userColors[1]}, var(--accent))` }} />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: `linear-gradient(135deg, ${userColors[0]}, ${userColors[1]})` }}>
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Logged in as <strong style={{ color: "var(--accent-text)" }}>{currentUser.username}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={toggleTheme} className="btn-secondary p-2.5" title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={refreshData} className="btn-secondary p-2.5" title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onTriggerImport} className="btn-secondary text-xs">
            <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} /> Import CSV
          </button>
          <button onClick={onLogout} className="btn-secondary text-xs" style={{ color: "var(--danger)" }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium" style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)" }}>
          {error}
        </div>
      )}

      {/* TIMELINE */}
      <div className="surface p-5 rounded-2xl mb-6 animate-fadeIn" style={{ animationDelay: "0.05s" }}>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Calendar className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          Flat Membership Timeline (2026)
        </h4>
        <div className="flex flex-wrap gap-6 items-center">
          {[
            { date: "Feb 1", label: "Aisha, Rohan, Priya & Meera move in", color: "var(--info)" },
            { date: "Mar 31", label: "Meera moves out", color: "var(--warning)" },
            { date: "Apr 15", label: "Sam moves in", color: "var(--accent)" },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="badge" style={{ background: `${event.color}18`, color: event.color }}>{event.date}</span>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{event.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AISHA'S VIEW - Simplified Debts */}
        <div className="surface p-6 rounded-2xl flex flex-col justify-between animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          <div>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
              <Users className="w-4 h-4" style={{ color: "var(--accent)" }} />
              Simplified Debts
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {simplifiedDebts.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--text-tertiary)" }}>All settled up! 🎉</p>
              ) : (
                simplifiedDebts.map((debt, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl text-xs" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{debt.from}</span>
                      <ArrowRight className="w-3 h-3" style={{ color: "var(--text-tertiary)" }} />
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{debt.to}</span>
                    </div>
                    <span className="font-bold font-mono text-sm" style={{ color: "var(--accent-text)" }}>₹{debt.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
            <button onClick={() => setShowExpenseForm(true)} className="btn-primary flex-1 text-xs">
              <PlusCircle className="w-4 h-4" /> Add Expense
            </button>
            <button onClick={() => setShowSettleForm(true)} className="btn-secondary flex-1 text-xs">
              <ArrowDownUp className="w-4 h-4" style={{ color: "var(--accent)" }} /> Settle Up
            </button>
          </div>
        </div>

        {/* ROHAN'S VIEW - Audit Trails */}
        <div className="surface p-6 rounded-2xl lg:col-span-2 animate-fadeIn" style={{ animationDelay: "0.15s" }}>
          <div className="flex justify-between items-center mb-4 pb-3 flex-wrap gap-2" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <ArrowDownUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
              Ledger Audit Trails
            </h3>
            <button onClick={() => setShowOriginalCurrency(!showOriginalCurrency)} className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)", cursor: "pointer", padding: "0.25rem 0.75rem", fontSize: "0.625rem" }}>
              {showOriginalCurrency ? "Show INR Only" : "Show Multi-Currency"}
            </button>
          </div>

          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
            Click any flatmate to see the exact expenses that make up your balance with them.
          </p>

          {/* Balance cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            {Object.values(balances)
              .filter((b) => b.username !== currentUser.username)
              .map((bal) => {
                const isSelected = selectedAuditUser === bal.username;
                const colors = AVATAR_COLORS[bal.username] || ["#6366f1", "#818cf8"];
                const net = bal.net;
                const Icon = net > 0 ? TrendingUp : net < 0 ? TrendingDown : Minus;
                return (
                  <button
                    key={bal.userId}
                    onClick={() => loadAuditLedger(bal.username)}
                    className="flex flex-col p-3.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: isSelected ? "var(--accent-light)" : "var(--bg-tertiary)",
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-primary)"}`,
                      boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <div className="flex justify-between items-center w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
                          {bal.username.substring(0, 1)}
                        </div>
                        <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>{bal.username}</span>
                      </div>
                      <ChevronRight className="w-3 h-3" style={{ color: "var(--text-tertiary)" }} />
                    </div>
                    <span className="font-bold font-mono text-sm" style={{ color: net > 0 ? "var(--accent-text)" : net < 0 ? "var(--danger)" : "var(--text-tertiary)" }}>
                      ₹{Math.abs(net).toLocaleString()}
                    </span>
                    <span className="text-[10px] capitalize flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                      <Icon className="w-2.5 h-2.5" />
                      {net > 0 ? "owes you" : net < 0 ? "you owe" : "settled"}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Pairwise Ledger */}
          {selectedAuditUser && pairwiseLedger ? (
            <div className="p-4 rounded-xl text-xs animate-fadeIn" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
              <h4 className="font-semibold flex items-center justify-between pb-2 mb-3" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
                <span>
                  Ledger: <strong style={{ color: "var(--accent-text)" }}>{currentUser.username}</strong> & <strong style={{ color: "var(--accent-text)" }}>{selectedAuditUser}</strong>
                </span>
                <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                  Net: {pairwiseLedger.netBalance > 0 ? `${selectedAuditUser} owes you` : `You owe ${selectedAuditUser}`} ₹{Math.abs(pairwiseLedger.netBalance).toLocaleString()}
                </span>
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pairwiseLedger.ledger.length === 0 ? (
                  <p className="text-center py-4" style={{ color: "var(--text-tertiary)" }}>No transactions between you two.</p>
                ) : pairwiseLedger.ledger.map((item) => {
                  const isCredit = item.payer === currentUser.username;
                  return (
                    <div key={item.id} className="flex justify-between items-center py-2.5 px-2 rounded-lg transition-colors duration-150" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <div>
                        <span className="text-[10px] block" style={{ color: "var(--text-tertiary)" }}>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{item.description}</span>
                        <span className="text-[10px] block" style={{ color: "var(--text-tertiary)" }}>
                          Paid by: {item.payer} | {isCredit ? `${selectedAuditUser}'s share` : "Your share"}:{" "}
                          {showOriginalCurrency ? `${item.originalAmount} ${item.currency}` : `₹${item.amountInINR}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold font-mono" style={{ color: isCredit ? "var(--accent-text)" : "var(--danger)" }}>
                          {isCredit ? "+" : "-"} ₹{item.amountInINR.toLocaleString()}
                        </span>
                        <span className="text-[9px] block" style={{ color: "var(--text-tertiary)" }}>Bal: ₹{item.runningBalance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center rounded-xl text-xs" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
              Select a flatmate above to audit your balance ledger.
            </div>
          )}
        </div>
      </div>

      {/* EXPENSE LOG TABLE */}
      <div className="surface p-6 rounded-2xl animate-fadeIn" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-sm font-bold mb-4 pb-3" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
          All Logged Expenses ({expenses.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                {["Date", "Description", "Paid By", "Total Cost", "Split Members", ""].map((h, i) => (
                  <th key={i} className={`pb-3 font-semibold text-[10px] uppercase tracking-wider ${i === 5 ? "text-right" : ""}`} style={{ color: "var(--text-tertiary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center" style={{ color: "var(--text-tertiary)" }}>No expenses logged yet. Import your CSV to get started!</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp.id} className="transition-colors duration-150 hover:opacity-80" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="py-3.5 font-mono" style={{ color: "var(--text-secondary)" }}>{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {exp.description}
                    {exp.splitType !== "equal" && <span className="badge badge-info ml-2">{exp.splitType}</span>}
                  </td>
                  <td className="py-3.5" style={{ color: "var(--text-secondary)" }}>{exp.paidBy.username}</td>
                  <td className="py-3.5 font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                    {showOriginalCurrency ? `${exp.amount} ${exp.currency}` : `₹${(exp.amount * exp.exchangeRate).toLocaleString()}`}
                  </td>
                  <td className="py-3.5" style={{ color: "var(--text-secondary)" }}>
                    <span className="truncate block max-w-xs">{exp.splits.map(s => s.user.username).join(", ")}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => handleDeleteExpense(exp.id)} className="btn-danger"><Trash2 className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="surface-elevated max-w-md w-full rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-lg font-bold mb-4 pb-3 flex items-center gap-1.5" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
              <PlusCircle className="w-5 h-5" style={{ color: "var(--accent)" }} /> Add Expense
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Description</label>
                <input type="text" required placeholder="e.g. Wifi bill" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Amount</label>
                  <input type="number" step="any" required placeholder="0.00" value={expenseAmt} onChange={(e) => setExpenseAmt(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Currency</label>
                  <select value={expenseCurr} onChange={(e) => setExpenseCurr(e.target.value)} className="input-field">
                    <option value="INR">INR</option>
                    <option value="USD">USD (1 USD = 83 INR)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Payer</label>
                  <select value={expensePayer} onChange={(e) => setExpensePayer(e.target.value)} className="input-field">
                    {["Aisha","Rohan","Priya","Meera","Sam","Dev"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Date</label>
                  <input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: "var(--info-light)", color: "var(--info)", border: "1px solid var(--info)" }}>
                💡 Splits auto-calculated among active flatmates on the selected date.
              </div>
              <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
                <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-secondary flex-1 text-xs">Cancel</button>
                <button type="submit" className="btn-primary flex-1 text-xs">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLEMENT MODAL */}
      {showSettleForm && (
        <div className="modal-overlay">
          <div className="surface-elevated max-w-md w-full rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-lg font-bold mb-4 pb-3 flex items-center gap-1.5" style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
              <ArrowDownUp className="w-5 h-5" style={{ color: "var(--accent)" }} /> Record Settlement
            </h3>
            <form onSubmit={handleRecordSettlement} className="space-y-4">
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Sender</label>
                <input type="text" disabled value={`${currentUser.username} (You)`} className="input-field" style={{ opacity: 0.6 }} />
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Recipient</label>
                <select required value={settlePayee} onChange={(e) => setSettlePayee(e.target.value)} className="input-field">
                  <option value="">Select recipient...</option>
                  {Object.values(balances).filter(b => b.username !== currentUser.username).map(b => (
                    <option key={b.userId} value={b.username}>{b.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Amount (INR)</label>
                <input type="number" step="any" required placeholder="0.00" value={settleAmt} onChange={(e) => setSettleAmt(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
                <button type="button" onClick={() => setShowSettleForm(false)} className="btn-secondary flex-1 text-xs">Cancel</button>
                <button type="submit" className="btn-primary flex-1 text-xs">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
