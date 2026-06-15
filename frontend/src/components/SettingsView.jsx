import React from "react";
import { User, Bell, Shield, Key } from "lucide-react";

export default function SettingsView({ currentUser }) {
  return (
    <div className="max-w-[1000px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-400 mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Settings Nav */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#18181b] border border-[#27272a] text-[#00d8a5]">
            <User className="w-4.5 h-4.5" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#18181b] hover:text-white transition-colors">
            <Bell className="w-4.5 h-4.5" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#18181b] hover:text-white transition-colors">
            <Shield className="w-4.5 h-4.5" /> Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-[#18181b] hover:text-white transition-colors">
            <Key className="w-4.5 h-4.5" /> Security
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-white mb-6 pb-4 border-b border-[#27272a]">Profile Information</h3>
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded bg-[#00d8a5]/10 border border-[#00d8a5]/20 flex items-center justify-center text-2xl font-bold text-[#00d8a5]">
                {currentUser?.username?.[0] || "U"}
              </div>
              <div className="flex-1">
                <button className="btn-secondary text-xs mb-2">Change Avatar</button>
                <p className="text-xs text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs block mb-2 font-semibold text-zinc-400">Username</label>
                <input type="text" defaultValue={currentUser?.username} className="input-field bg-[#09090b]" />
              </div>
              <div>
                <label className="text-xs block mb-2 font-semibold text-zinc-400">Email Address</label>
                <input type="email" defaultValue={`${currentUser?.username?.toLowerCase() || 'user'}@spreetail.demo`} className="input-field bg-[#09090b]" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-white mb-6 pb-4 border-b border-[#27272a]">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Dark Mode</h4>
                  <p className="text-xs text-zinc-500">Use the dark theme for the application interface.</p>
                </div>
                <div className="w-10 h-5 bg-[#00d8a5] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-[#09090b] rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Email Notifications</h4>
                  <p className="text-xs text-zinc-500">Receive emails when a new expense is added.</p>
                </div>
                <div className="w-10 h-5 bg-[#00d8a5] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-[#09090b] rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button className="btn-secondary">Cancel</button>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
