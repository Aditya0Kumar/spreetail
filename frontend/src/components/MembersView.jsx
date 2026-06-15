import React from "react";
import { Users, Mail, Phone, Calendar } from "lucide-react";

export default function MembersView() {
  const members = [
    { name: "Aisha", role: "Partner", status: "Active", joinDate: "Jan 1, 2026", email: "aisha@spreetail.demo", color: ["#00d8a515", "#00d8a5"] },
    { name: "Rohan", role: "Partner", status: "Active", joinDate: "Jan 1, 2026", email: "rohan@spreetail.demo", color: ["#0ea5e915", "#0ea5e9"] },
    { name: "Priya", role: "Partner", status: "Active", joinDate: "Jan 1, 2026", email: "priya@spreetail.demo", color: ["#db277715", "#db2777"] },
    { name: "Meera", role: "Former", status: "Moved Out", joinDate: "Jan 1, 2026", endDate: "Mar 31, 2026", email: "meera@spreetail.demo", color: ["#ea580c15", "#ea580c"] },
    { name: "Sam", role: "Partner", status: "Active", joinDate: "Apr 15, 2026", email: "sam@spreetail.demo", color: ["#05966915", "#059669"] },
    { name: "Dev", role: "Guest", status: "Guest", joinDate: "May 20, 2026", email: "dev@spreetail.demo", color: ["#9333ea15", "#9333ea"] },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-4 animate-fadeIn relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Members</h2>
          <p className="text-sm text-zinc-400 mt-1">Manage group members, roles, and statuses.</p>
        </div>
        <button className="btn-primary">
          <Users className="w-4 h-4 mr-2" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, idx) => (
          <div key={idx} className="card p-6 relative overflow-hidden group hover:border-[#00d8a5] transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" style={{ backgroundColor: member.color[0] }} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div 
                className="w-16 h-16 rounded border flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: member.color[0], color: member.color[1], borderColor: member.color[1] + '40' }}
              >
                {member.name[0]}
              </div>
              <span className={`badge ${member.status === 'Active' ? 'badge-success' : member.status === 'Moved Out' ? 'badge-warning' : 'badge-info'}`}>
                {member.status}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-4">{member.role}</p>

              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-500" /> {member.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" /> Joined {member.joinDate}
                </div>
                {member.endDate && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <Calendar className="w-4 h-4" /> Left {member.endDate}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#27272a] flex justify-end gap-2 relative z-10">
              <button className="btn-secondary py-1 px-3 text-xs">Edit</button>
              <button className="btn-secondary py-1 px-3 text-xs text-red-400 hover:text-red-300 hover:border-red-400/50">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
