import React, { useState, useEffect } from "react";
import { User as UserIcon, LogIn, Loader2, Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeContext";

const AVATAR_COLORS = {
  Aisha: ["#7c3aed", "#a78bfa"],
  Rohan: ["#2563eb", "#60a5fa"],
  Priya: ["#db2777", "#f472b6"],
  Meera: ["#ea580c", "#fb923c"],
  Sam:   ["#059669", "#34d399"],
  Dev:   ["#0891b2", "#22d3ee"],
};

export default function Login({ onLogin, backendUrl }) {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);

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
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--accent)" }} />
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--accent)" }} />
        </div>
        <p className="mt-6 text-sm font-medium animate-pulse" style={{ color: "var(--text-secondary)" }}>
          Connecting to Database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
        <div className="surface-elevated p-8 rounded-2xl max-w-md w-full text-center animate-fadeIn" style={{ borderColor: "var(--danger)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--danger-light)" }}>
            <LogIn className="w-7 h-7" style={{ color: "var(--danger)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--danger)" }}>Connection Failed</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{ background: "var(--bg-primary)" }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Decorative gradient orbs */}
      {theme === "dark" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)" }} />
        </>
      )}

      <div className="max-w-2xl w-full relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            Shared Expense Manager
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            <span className="text-gradient">Spreetail</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>Expenses</span>
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Select your profile to view shared bills, resolve anomalies, and settle balances.
          </p>
        </div>

        {/* User Cards */}
        <div className="surface-elevated p-8 rounded-3xl">
          <h2 className="text-base font-semibold mb-6 flex items-center gap-2 pb-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <UserIcon className="w-4.5 h-4.5" style={{ color: "var(--accent)" }} />
            <span style={{ color: "var(--text-primary)" }}>Who are you?</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {users.map((user) => {
              const colors = AVATAR_COLORS[user.username] || ["#6366f1", "#818cf8"];
              const isHovered = hoveredUser === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  onMouseEnter={() => setHoveredUser(user.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className="group relative flex flex-col items-center p-5 rounded-2xl transition-all duration-200"
                  style={{
                    background: isHovered ? "var(--accent-light)" : "var(--bg-tertiary)",
                    border: `1px solid ${isHovered ? "var(--accent)" : "var(--border-primary)"}`,
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: isHovered ? "var(--shadow-md)" : "none",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base text-white mb-3 transition-transform duration-200 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: `0 4px 14px ${colors[0]}33` }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm transition-colors duration-200" style={{ color: isHovered ? "var(--accent-text)" : "var(--text-primary)" }}>
                    {user.username}
                  </span>

                  {user.username === "Meera" && (
                    <span className="badge badge-warning mt-1.5">Moved out Mar 31</span>
                  )}
                  {user.username === "Sam" && (
                    <span className="badge badge-success mt-1.5">Joined Apr 15</span>
                  )}
                  {user.username === "Dev" && (
                    <span className="badge badge-info mt-1.5">Goa Trip Guest</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: "var(--text-tertiary)" }}>
            PostgreSQL (Supabase) · Prisma ORM · React + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
