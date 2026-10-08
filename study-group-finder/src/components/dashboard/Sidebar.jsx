import { createPageUrl } from "@/utils/index.js";
import { LayoutDashboard, BookOpen, Users, Video, User, MessageCircle, Sparkles, Compass } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard", tag: "Overview" },
  { label: "Courses", icon: BookOpen, page: "Courses", tag: "Browse" },
  { label: "Study Groups", icon: Users, page: "Groups", tag: "Active" },
  { label: "Study Sessions", icon: Video, page: "Sessions", tag: "Meet" },
  { label: "My Profile", icon: User, page: "Profile", tag: "Account" },
];

export default function Sidebar({ currentPage, user }) {
  return (
    <aside className="w-64 shrink-0 min-h-[calc(100vh-4.5rem)] bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shadow-2xs">
      <div>
        {/* Navigation Section Title */}
        <div className="px-3 pt-2 pb-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-500" />
            Navigation
          </p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map(({ label, icon: Icon, page }) => {
            const active = currentPage === page;
            return (
              <a
                key={page}
                href={createPageUrl(page)}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{label}</span>
                </div>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Group Chat Shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="px-3 pb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Collaboration
          </p>
          <a
            href="/chat"
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentPage === "Chat"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                : "bg-orange-50/70 hover:bg-orange-100 text-orange-700 border border-orange-200/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="leading-tight font-bold">Group Chat</p>
                <p className="text-[10px] opacity-80">Real-time room</p>
              </div>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </a>
        </div>
      </div>

      {/* Pro Study Tip Card */}
      <div className="mt-6 p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-amber-300">Study Streak</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Join study rooms and share files to boost learning retention by 60%!
        </p>
      </div>
    </aside>
  );
}