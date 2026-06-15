import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ImportWizard from "./components/ImportWizard";
import ChatAssistant from "./components/ChatAssistant";
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
              const Icon = item.icon;
              return (
                <button key={item.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#18181b] hover:text-white transition-colors duration-150">
                  <Icon className="w-4.5 h-4.5 text-zinc-500" />
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
            <button className="text-[10px] text-[#00d8a5] font-medium hover:underline">View all</button>
          </div>
          <div className="flex -space-x-2">
            {["Aisha", "Rohan", "Priya", "Meera", "Sam", "Dev"].map((u, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#09090b] bg-[#18181b] flex items-center justify-center text-[10px] font-bold text-zinc-300 shadow-sm" title={u}>
                {u[0]}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#09090b]">
        
        {/* Topbar */}
        <header className="h-16 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between px-8 shrink-0 z-10">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {navItems.find(i => i.id === activeView)?.label || "Dashboard"}
            {activeView === "dashboard" && " 👋"}
          </h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#00d8a5] rounded-full border-2 border-[#09090b]"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-[#27272a]" onClick={() => setCurrentUser(null)} title="Click to logout">
              <div className="w-8 h-8 rounded border border-[#27272a] bg-[#18181b] flex items-center justify-center text-white text-xs font-bold">
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
          {activeView === "dashboard" && (
            <Dashboard 
              currentUser={currentUser} 
              backendUrl={BACKEND_URL} 
              groupId={GROUP_ID} 
              navigateTo={(view) => setActiveView(view)} 
            />
          )}
          {activeView === "import" && (
            <ImportWizard 
              backendUrl={BACKEND_URL} 
              groupId={GROUP_ID} 
              currentUser={currentUser} 
              onImportComplete={() => setActiveView("dashboard")} 
            />
          )}
          {(activeView === "debts" || activeView === "audit" || activeView === "expenses" || activeView === "ai") && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <FileSearch className="w-8 h-8 text-[#5b45ff]" />
              </div>
              <h2 className="text-xl font-bold mb-2">View coming soon!</h2>
              <p className="text-sm text-slate-500 mb-6">
                This page is accessible from the main Dashboard widgets for this prototype iteration.
              </p>
              <button onClick={() => setActiveView("dashboard")} className="btn-primary">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Assistant Drawer */}
      <ChatAssistant backendUrl={BACKEND_URL} groupId={GROUP_ID} />
    </div>
  );
}
