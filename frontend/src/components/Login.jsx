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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00d8a5]" />
        <p className="mt-4 text-sm font-medium text-zinc-500 animate-pulse">
          Connecting to Database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#09090b]">
        <div className="bg-[#18181b] p-8 rounded-2xl shadow-sm border border-[#27272a] max-w-md w-full text-center animate-fadeIn">
          <div className="w-16 h-16 rounded bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Connection Failed</h2>
          <p className="text-sm mb-6 text-zinc-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#09090b]">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(0,216,165,0.05),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-3xl w-full animate-fadeIn relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold bg-[#00d8a5]/10 text-[#00d8a5] border border-[#00d8a5]/20">
            <span className="w-2 h-2 rounded-full bg-[#00d8a5]" />
            Partner Login Portal
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ecommerce is complex.<br/>We handle the heavy lifting.
          </h1>
          <p className="text-base max-w-xl mx-auto text-zinc-400">
            Select your profile to manage shared inventory, resolve anomalies, and access the partner dashboard.
          </p>
        </div>

        {/* User Cards */}
        <div className="bg-[#18181b] p-8 rounded border border-[#27272a] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d8a5]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-[#27272a]">
            <UserIcon className="w-4 h-4 text-[#00d8a5]" />
            Select Partner Profile
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
            {users.map((user) => {
              // Custom colors for dark mode avatars
              const colors = {
                Aisha: ["#00d8a515", "#00d8a5"],
                Rohan: ["#0ea5e915", "#0ea5e9"],
                Priya: ["#db277715", "#db2777"],
                Meera: ["#ea580c15", "#ea580c"],
                Sam:   ["#05966915", "#059669"],
                Dev:   ["#9333ea15", "#9333ea"],
              }[user.username] || ["#27272a", "#a1a1aa"];

              return (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="group relative flex flex-col items-center p-6 rounded bg-[#09090b] border border-[#27272a] hover:border-[#00d8a5] hover:bg-[#09090b]/80 transition-all duration-200"
                >
                  <div
                    className="w-16 h-16 rounded border border-[#27272a] flex items-center justify-center font-bold text-lg mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: colors[0], color: colors[1], borderColor: colors[1] + '40' }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-zinc-300 group-hover:text-[#00d8a5] transition-colors">
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
        <div className="text-center mt-12">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">
            Powered by Spreetail Internal Tools
          </p>
        </div>
      </div>
    </div>
  );
}
