import { useState } from "react";
import { Mail, Search, Clock, Info, CalendarDays, ArrowUpDown, Bell, AlertCircle, RefreshCcw } from "lucide-react";
import { EmailLog } from "../types";

interface EmailOutboxProps {
  emails: EmailLog[];
  onTriggerReminders: () => Promise<number>;
}

export default function EmailOutbox({ emails, onTriggerReminders }: EmailOutboxProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanCount, setScanCount] = useState<number | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleForceScan = async () => {
    setScanning(true);
    setScanCount(null);
    try {
      const count = await onTriggerReminders();
      setScanCount(count);
      setTimeout(() => setScanCount(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const filteredEmails = emails.filter((em) => {
    const matchesSearch =
      em.to.toLowerCase().includes(search.toLowerCase()) ||
      em.toName.toLowerCase().includes(search.toLowerCase()) ||
      em.subject.toLowerCase().includes(search.toLowerCase()) ||
      em.body.toLowerCase().includes(search.toLowerCase()) ||
      em.recommendationTitle.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || em.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div id="email-outbox-view" className="space-y-6 animate-fade-in font-sans">
      {/* Toast Alert */}
      {scanCount !== null && (
        <div
          id="outbox-scan-toast"
          className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded flex items-center justify-between shadow-sm animate-fade-in"
        >
          <span>
            <strong>Automatic scan completed:</strong>{" "}
            {scanCount > 0
              ? `Dispatched ${scanCount} new compliance reminders to assignees.`
              : "No pending actions with approaching deadlines required new emails today."}
          </span>
          <span className="text-[9px] font-extrabold bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-sm uppercase font-mono tracking-wider">
            Dispatched
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 border border-slate-200 shadow-xs rounded flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="outbox-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-700 font-medium"
            placeholder="Search outbox log by name, email, report subject..."
          />
        </div>

        <div className="w-full sm:w-48 shadow-xs">
          <select
            id="outbox-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-600 font-semibold"
          >
            <option value="all">All Dispatch Types</option>
            <option value="automatic">Automatic Reminders</option>
            <option value="manual">Manual Push Alerts</option>
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-900 text-slate-300 p-4 border border-slate-800 rounded flex gap-3.5 items-start">
        <Info className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1.5 font-mono">
          <strong className="block text-slate-100 uppercase tracking-widest text-[10px]">Automated Compliance Dispatch Queue</strong>
          <p className="leading-relaxed">
            The RWG automated monitor scans active recommendations daily. If a deadline falls in the next 7 days, a compliance alert email is queued and recorded in the outbox database with delivery telemetry.
          </p>
        </div>
      </div>

      {/* Log list */}
      {filteredEmails.length === 0 ? (
        <div id="no-emails-alert" className="text-center py-16 bg-white border border-slate-200 shadow-xs rounded">
          <Mail className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest font-mono">Outbox is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
            No notification logs match your parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map((email) => {
            const isExpanded = expandedId === email.id;

            return (
              <div
                key={email.id}
                id={`email-card-${email.id}`}
                className={`bg-white border rounded overflow-hidden transition-all duration-100 ${
                  isExpanded ? "border-slate-400 shadow-sm" : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Header Strip */}
                <div
                  onClick={() => toggleExpand(email.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 border ${
                      email.type === "automatic" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-blue-50 border-blue-200 text-blue-600"
                    }`}>
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{email.toName}</span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">&lt;{email.to}&gt;</span>
                      </div>
                      <span className="text-xs text-slate-500 block line-clamp-1 font-mono">{email.subject}</span>
                    </div>
                  </div>

                  {/* Right hand side logs metadata */}
                  <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between border-t border-slate-50 pt-2.5 sm:pt-0 sm:border-0 text-right shrink-0">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[9px] font-bold text-slate-400 block tracking-wider">DISPATCHED</span>
                      <span className="text-[10px] text-slate-600 block">
                        {new Date(email.sentAt).toLocaleDateString()} {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono border ${
                        email.type === "automatic"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {email.type}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-sm bg-blue-600 text-white shadow-sm shadow-blue-900/10">
                        {email.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                    <div className="bg-white p-4 border border-slate-200 rounded font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed shadow-xs">
                      {email.body}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>Linked with Recommendation ID: <strong>{email.recommendationId}</strong> (Report: "{email.recommendationTitle}")</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
