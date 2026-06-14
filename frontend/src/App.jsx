import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ImportWizard from "./components/ImportWizard";
import ChatAssistant from "./components/ChatAssistant";

const BACKEND_URL = "http://localhost:5000";
const GROUP_ID = 1;

export default function App() {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    setShowImportWizard(false);
  };
  const handleImportComplete = () => setShowImportWizard(false);

  if (!currentUser) {
    return <Login onLogin={handleLogin} backendUrl={BACKEND_URL} />;
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Ambient background glows (dark mode only) */}
      {theme === "dark" && (
        <>
          <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)" }} />
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30" style={{ background: "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)" }} />
        </>
      )}

      <div className="relative z-10">
        {showImportWizard ? (
          <ImportWizard
            backendUrl={BACKEND_URL}
            groupId={GROUP_ID}
            currentUser={currentUser}
            onImportComplete={handleImportComplete}
          />
        ) : (
          <Dashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            backendUrl={BACKEND_URL}
            groupId={GROUP_ID}
            onTriggerImport={() => setShowImportWizard(true)}
          />
        )}
      </div>

      <ChatAssistant backendUrl={BACKEND_URL} groupId={GROUP_ID} />
    </div>
  );
}
