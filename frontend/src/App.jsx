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
    <div className="flex h-screen w-full bg-[#f4f7fb] overflow-hidden text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-[#5b45ff] text-white flex items-center justify-center text-lg">S</div>
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
                    isActive ? "bg-[#5b45ff] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Nav */}
          <nav className="px-4 pb-4 space-y-1 border-t border-slate-100 pt-4 mt-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors duration-150">
                  <Icon className="w-4.5 h-4.5 text-slate-400" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Members Footer */}
        <div className="p-5 border-t border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Members (6)</span>
            <button className="text-[10px] text-[#5b45ff] font-medium hover:underline">View all</button>
          </div>
          <div className="flex -space-x-2">
            {["Aisha", "Rohan", "Priya", "Meera", "Sam", "Dev"].map((u, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shadow-sm" title={u}>
                {u[0]}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {navItems.find(i => i.id === activeView)?.label || "Dashboard"}
            {activeView === "dashboard" && " 👋"}
          </h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-slate-200" onClick={() => setCurrentUser(null)} title="Click to logout">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">{currentUser.username}</span>
                <span className="text-[10px] text-green-600 font-medium">Active</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
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
