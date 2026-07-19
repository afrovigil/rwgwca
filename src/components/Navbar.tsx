import { useState, useEffect } from "react";
import { Shield, LogOut, LayoutDashboard, ListChecks, Mail, Clock, RefreshCw } from "lucide-react";

interface NavbarProps {
  user: any;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export default function Navbar({
  user,
  currentTab,
  setCurrentTab,
  onLogout,
  isSyncing,
  onTriggerSync,
}: NavbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-rose-950/40 text-rose-300 border-rose-900";
      case "assignee":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-900";
      case "auditor":
        return "bg-amber-950/40 text-amber-300 border-amber-900";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <>
      {/* SIDEBAR FOR DESKTOP SCREEN RESOLUTIONS */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex w-64 bg-slate-900 text-white flex-col border-r border-slate-800 shrink-0 font-sans"
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 select-none">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg text-white font-display shadow-sm hidden">
            R
          </div>
          <div>
            <span className="text-base font-bold tracking-tight block leading-tight text-slate-100">
              RWG Monitor
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block leading-none mt-0.5">
              Compliance Portal
            </span>
          </div>
        </div>

        {/* Navigation Tab Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            id="sidebar-tab-dashboard"
            onClick={() => setCurrentTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            id="sidebar-tab-recommendations"
            onClick={() => setCurrentTab("recommendations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "recommendations"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Recommendations
          </button>

          <button
            id="sidebar-tab-emails"
            onClick={() => setCurrentTab("emails")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "emails"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Outbox
          </button>
        </nav>

        {/* Sync Controls & Clock Module */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/35 space-y-3">
          <div className="flex items-center justify-between">
            <button
              id="sidebar-sync-btn"
              onClick={onTriggerSync}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition font-medium"
              title="Sync compliance data from server"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
              <span className="font-mono text-[10px]">
                {isSyncing ? "SYNCING..." : "LIVE SYNCED"}
              </span>
            </button>

            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <Clock className="h-3 w-3" />
              <span>{formatTime(time)}</span>
            </div>
          </div>
        </div>

        {/* Active User Credentials Badge Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center uppercase shrink-0 text-xs border border-slate-700">
                {user?.name?.slice(0, 2) || "US"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate leading-tight">
                  {user?.name}
                </p>
                <span
                  className={`inline-block mt-1 text-[9px] font-bold font-mono tracking-widest px-2 py-0.5 border uppercase rounded-sm ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-800 shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* HORIZONTAL HEADER BAR FOR MOBILE VIEWPORTS */}
      <header
        id="mobile-header"
        className="flex md:hidden bg-slate-900 text-white border-b border-slate-800 flex-col font-sans"
      >
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-7 h-7 object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove("hidden");
              }}
            />
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-sm text-white hidden">
              R
            </div>
            <span className="text-sm font-bold tracking-tight">RWG Monitor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="mobile-sync-btn"
              onClick={onTriggerSync}
              className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
            </button>

            <button
              id="mobile-logout-btn"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation Strip */}
        <nav className="flex justify-around border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 font-bold uppercase tracking-wider py-1 shrink-0">
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`flex-1 py-2 text-center transition-colors ${
              currentTab === "dashboard" ? "text-white border-b-2 border-blue-500 font-black" : "hover:text-slate-200"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab("recommendations")}
            className={`flex-1 py-2 text-center transition-colors ${
              currentTab === "recommendations" ? "text-white border-b-2 border-blue-500 font-black" : "hover:text-slate-200"
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setCurrentTab("emails")}
            className={`flex-1 py-2 text-center transition-colors ${
              currentTab === "emails" ? "text-white border-b-2 border-blue-500 font-black" : "hover:text-slate-200"
            }`}
          >
            Outbox
          </button>
        </nav>
      </header>
    </>
  );
}
