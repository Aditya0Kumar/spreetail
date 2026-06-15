import React, { useState, useEffect } from "react";
import { User as UserIcon, LogIn, Loader2 } from "lucide-react";

const AVATAR_COLORS = {
  Aisha: ["#ece9ff", "#5b45ff"],
  Rohan: ["#e0f2fe", "#0ea5e9"],
  Priya: ["#fce7f3", "#db2777"],
  Meera: ["#ffedd5", "#ea580c"],
  Sam:   ["#d1fae5", "#059669"],
  Dev:   ["#f3e8ff", "#9333ea"],
};

export default function Login({ onLogin, backendUrl }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/auth/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load flatmates");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not connect to the backend server. Make sure it is running on port 5000.");
        setLoading(false);
      });
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="w-10 h-10 animate-spin text-[#5b45ff]" />
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Connecting to Database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f7fb]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-800">Connection Failed</h2>
          <p className="text-sm mb-6 text-slate-500">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f7fb]">
      <div className="max-w-3xl w-full animate-fadeIn">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold bg-indigo-50 text-[#5b45ff]">
            <span className="w-2 h-2 rounded-full bg-[#5b45ff]" />
            Shared Expense Manager
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-800">
            Welcome to Spreetail
          </h1>
          <p className="text-sm max-w-md mx-auto text-slate-500">
            Select your profile to view shared bills, resolve anomalies, and settle balances.
          </p>
        </div>

        {/* User Cards */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <UserIcon className="w-4 h-4 text-[#5b45ff]" />
            Who are you?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {users.map((user) => {
              const colors = AVATAR_COLORS[user.username] || ["#f1f5f9", "#475569"];
              return (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="group relative flex flex-col items-center p-6 rounded-xl bg-[#f4f7fb] border border-slate-100 hover:border-[#5b45ff] hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: colors[0], color: colors[1] }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-slate-800 group-hover:text-[#5b45ff] transition-colors">
                    {user.username}
                  </span>

                  {user.username === "Meera" && (
                    <span className="badge badge-warning mt-2">Moved out Mar 31</span>
                  )}
                  {user.username === "Sam" && (
                    <span className="badge badge-success mt-2">Joined Apr 15</span>
                  )}
                  {user.username === "Dev" && (
                    <span className="badge badge-info mt-2">Goa Trip Guest</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
            PostgreSQL · Prisma ORM · React
          </p>
        </div>
      </div>
    </div>
  );
}
