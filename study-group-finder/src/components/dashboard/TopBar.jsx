import { LogOut, BookOpen, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils/index.js";

export default function TopBar({ user, extraContent }) {
  const handleLogout = () => {
    localStorage.removeItem("studyconnect_user");
    localStorage.removeItem("studyconnect_token");
    window.location.href = createPageUrl("Auth");
  };

  const displayName = user?.full_name || user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shadow-xs transition-all">
      {/* Brand Logo & Name */}
      <a href={createPageUrl("Dashboard")} className="flex items-center gap-3.5 group">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 group-hover:shadow-orange-500/30 transition-all duration-300">
          <BookOpen className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              Study<span className="text-orange-500">Connect</span>
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 tracking-wide">
              <Sparkles className="w-2.5 h-2.5" /> HUB
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 tracking-wide">Learn • Collaborate • Excel</p>
        </div>
      </a>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-4">
        {extraContent}

        {/* User Card Pill */}
        <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-full transition-all">
          <div className="relative">
            {user?.profile_image_url ? (
              <img 
                src={user.profile_image_url} 
                alt={displayName} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {initial}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="hidden sm:block text-left pr-2">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {displayName.split(" ")[0]}
            </p>
            <p className="text-[10px] font-semibold text-orange-600 tracking-wider uppercase">
              {user?.role || "Student"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out of account"
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg shadow-2xs transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}