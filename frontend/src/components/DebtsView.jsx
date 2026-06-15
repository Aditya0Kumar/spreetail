import React, { useState, useEffect } from "react";
import { HandCoins, ArrowRight, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function DebtsView({ backendUrl, groupId, currentUser }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${backendUrl}/api/groups/${groupId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setDebts(data.simplifiedDebts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [backendUrl, groupId]);

  const getAvatarColors = (username) => {
    return {
      Aisha: ["#00d8a515", "#00d8a5"],
      Rohan: ["#0ea5e915", "#0ea5e9"],
      Priya: ["#db277715", "#db2777"],
      Meera: ["#ea580c15", "#ea580c"],
      Sam:   ["#05966915", "#059669"],
      Dev:   ["#9333ea15", "#9333ea"],
    }[username] || ["#27272a", "#a1a1aa"];
  };

  const myDebts = debts.filter(d => d.from === currentUser.username || d.to === currentUser.username);
  const otherDebts = debts.filter(d => d.from !== currentUser.username && d.to !== currentUser.username);

  const renderDebtCard = (debt, idx) => {
    const fromColors = getAvatarColors(debt.from);
    const toColors = getAvatarColors(debt.to);
    
    // Highlight if it involves the current user
    const isMeOwe = debt.from === currentUser.username;
    const isOweMe = debt.to === currentUser.username;

    return (
      <div key={idx} className={`card p-6 flex flex-col justify-between transition-all ${isMeOwe ? "border-red-500/30 bg-red-500/5" : isOweMe ? "border-[#00d8a5]/30 bg-[#00d8a5]/5" : ""}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded border flex items-center justify-center text-lg font-bold shadow-sm" style={{ backgroundColor: fromColors[0], color: fromColors[1], borderColor: fromColors[1] + '40' }}>
                {debt.from[0]}
              </div>
              <span className="text-xs mt-2 font-medium text-white">{debt.from === currentUser.username ? "You" : debt.from}</span>
            </div>
            
            <div className="flex flex-col items-center px-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">owes</span>
              <div className="w-full h-px bg-[#27272a] relative flex items-center justify-center min-w-[60px]">
                <ArrowRight className="w-4 h-4 text-zinc-500 absolute bg-[#18181b] px-0.5" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded border flex items-center justify-center text-lg font-bold shadow-sm" style={{ backgroundColor: toColors[0], color: toColors[1], borderColor: toColors[1] + '40' }}>
                {debt.to[0]}
              </div>
              <span className="text-xs mt-2 font-medium text-white">{debt.to === currentUser.username ? "You" : debt.to}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-[#27272a] pt-4 mt-auto">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Amount</p>
            <p className={`text-2xl font-extrabold ${isMeOwe ? "text-red-400" : isOweMe ? "text-[#00d8a5]" : "text-white"}`}>
              ₹{debt.amount.toLocaleString()}
            </p>
          </div>
          <button className={`btn-primary py-1.5 px-3 text-xs ${isMeOwe ? "bg-[#00d8a5] hover:bg-[#00b388]" : "bg-[#27272a] text-white hover:bg-[#3f3f46]"}`}>
            {isMeOwe ? "Settle Up" : "Remind"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Debt Simplification</h2>
          <p className="text-sm text-zinc-400 mt-1">Settle balances efficiently with pairwise settlements.</p>
        </div>
        <button className="btn-secondary">
          <HandCoins className="w-4 h-4 mr-2" /> Recalculate
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Calculating optimal settlements...</div>
      ) : debts.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#00d8a5]/10 flex items-center justify-center mb-4">
            <HandCoins className="w-8 h-8 text-[#00d8a5]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You're all settled up!</h3>
          <p className="text-zinc-400 max-w-sm mx-auto">There are no outstanding balances between any members of the group.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {myDebts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-[#00d8a5]" /> Your Balances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDebts.map((debt, idx) => renderDebtCard(debt, `my-${idx}`))}
              </div>
            </div>
          )}

          {otherDebts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-t border-[#27272a] pt-6">
                Other Group Balances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                {otherDebts.map((debt, idx) => renderDebtCard(debt, `other-${idx}`))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
