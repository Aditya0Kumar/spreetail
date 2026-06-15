import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ImportWizard from "./components/ImportWizard";
import ChatAssistant from "./components/ChatAssistant";
import ExpensesView from "./components/ExpensesView";
import DebtsView from "./components/DebtsView";
import AuditView from "./components/AuditView";
import MembersView from "./components/MembersView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import { LayoutDashboard, UploadCloud, Receipt, HandCoins, FileSearch, Users, Bot, FileText, Settings, Bell, ChevronDown } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API || "http://localhost:5000";
const GROUP_ID = 1;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} backendUrl={BACKEND_URL} />;
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "import", label: "Import Expenses", icon: UploadCloud },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "debts", label: "Debts", icon: HandCoins },
    { id: "audit", label: "Audit Ledger", icon: FileSearch },
    { id: "ai", label: "AI Assistant", icon: Bot },
  ];

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

  const secondaryNavItems = [
    { id: "members", label: "Members", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden text-zinc-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#09090b] border-r border-[#27272a] flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
            <div className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded bg-[#00d8a5] text-[#09090b] flex items-center justify-center text-lg shadow-[0_0_15px_rgba(0,216,165,0.3)]">S</div>
              Spreetail
            </div>
          </div>

          {/* Primary Nav */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive ? "bg-[#18181b] border border-[#27272a] text-[#00d8a5]" : "text-zinc-400 hover:bg-[#18181b] hover:text-white"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#00d8a5]" : "text-zinc-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Nav */}
          <nav className="px-4 pb-4 space-y-1 border-t border-[#27272a] pt-4 mt-2">
            {secondaryNavItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive ? "bg-[#18181b] border border-[#27272a] text-[#00d8a5]" : "text-zinc-400 hover:bg-[#18181b] hover:text-white"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#00d8a5]" : "text-zinc-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Members Footer */}
        <div className="p-5 border-t border-[#27272a]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Members (6)</span>
            <button className="text-[10px] text-[#00d8a5] font-medium hover:underline" onClick={() => setActiveView("members")}>View all</button>
          </div>
          <div className="flex -space-x-2">
            {["Aisha", "Rohan", "Priya", "Meera", "Sam", "Dev"].map((u, i) => {
              const colors = getAvatarColors(u);
              return (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold shadow-sm" title={u} style={{ backgroundColor: colors[0], color: colors[1], borderColor: '#09090b' }}>
                  {u[0]}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#09090b]">
        
        {/* Topbar */}
        <header className="h-16 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between px-8 shrink-0 z-10">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {[...navItems, ...secondaryNavItems].find(i => i.id === activeView)?.label || "Dashboard"}
            {activeView === "dashboard" && " 👋"}
          </h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-zinc-400 hover:text-white transition-colors" onClick={() => setActiveView("settings")} title="Notifications (Settings)">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#00d8a5] rounded-full border-2 border-[#09090b]"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-[#27272a]" onClick={() => setCurrentUser(null)} title="Click to logout">
              <div className="w-8 h-8 rounded border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: getAvatarColors(currentUser.username)[0], color: getAvatarColors(currentUser.username)[1], borderColor: getAvatarColors(currentUser.username)[1] + '40' }}>
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-white">{currentUser.username}</span>
                <span className="text-[10px] text-[#00d8a5] font-medium tracking-wide uppercase">Partner</span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-500 ml-1" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,216,165,0.03),transparent_50%)] pointer-events-none" />
          
          {activeView === "dashboard" && <Dashboard currentUser={currentUser} backendUrl={BACKEND_URL} groupId={GROUP_ID} navigateTo={setActiveView} />}
          {activeView === "import" && <ImportWizard backendUrl={BACKEND_URL} groupId={GROUP_ID} currentUser={currentUser} onImportComplete={() => setActiveView("dashboard")} />}
          {activeView === "expenses" && <ExpensesView backendUrl={BACKEND_URL} groupId={GROUP_ID} />}
          {activeView === "debts" && <DebtsView backendUrl={BACKEND_URL} groupId={GROUP_ID} currentUser={currentUser} />}
          {activeView === "audit" && <AuditView />}
          {activeView === "members" && <MembersView />}
          {activeView === "reports" && <ReportsView />}
          {activeView === "settings" && <SettingsView currentUser={currentUser} />}
          
          {activeView === "ai" && (
            <div className="card p-12 text-center max-w-xl mx-auto mt-12 border-t-2 border-[#00d8a5] relative z-10">
              <div className="w-16 h-16 rounded bg-[#00d8a5]/10 border border-[#00d8a5]/20 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-[#00d8a5]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Spreetail AI Assistant</h2>
              <p className="text-sm text-zinc-400 mb-8 max-w-sm mx-auto">
                Your intelligent agent for ledger analysis is always available globally. Click the floating green button in the bottom right corner of your screen to start chatting.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Assistant Drawer */}
      <ChatAssistant backendUrl={BACKEND_URL} groupId={GROUP_ID} />
    </div>
  );
}
