import { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  CheckSquare,
  Mail,
  Calendar,
  Send,
  Bell,
  ArrowRight,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Recommendation, EmailLog } from "../types";

interface DashboardProps {
  recommendations: Recommendation[];
  emails: EmailLog[];
  onTriggerReminders: () => Promise<number>;
  onTriggerIndividualReminder: (recId: string) => Promise<boolean>;
  userRole: string;
}

export default function Dashboard({
  recommendations,
  emails,
  onTriggerReminders,
  onTriggerIndividualReminder,
  userRole,
}: DashboardProps) {
  const [triggering, setTriggering] = useState(false);
  const [alertResult, setAlertResult] = useState<{ count: number; triggered: boolean } | null>(null);
  const [sendingIndividualId, setSendingIndividualId] = useState<string | null>(null);

  // calculations
  const totalRecommendations = recommendations.length;
  let totalMilestones = 0;
  let achievedMilestones = 0;

  recommendations.forEach((rec) => {
    totalMilestones += rec.milestones.length;
    achievedMilestones += rec.milestones.filter((m) => m.achieved).length;
  });

  const overallImplementationRate =
    totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingDeadlines = [...recommendations]
    .filter((rec) => {
      const recTotal = rec.milestones.length;
      const recAchieved = rec.milestones.filter((m) => m.achieved).length;
      const isCompleted = recTotal > 0 && recTotal === recAchieved;
      return !isCompleted;
    })
    .map((rec) => {
      const diffTime = new Date(rec.deadline).getTime() - new Date(todayStr).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...rec, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  const overdueCount = upcomingDeadlines.filter((rec) => rec.diffDays < 0).length;
  const urgentCount = upcomingDeadlines.filter((rec) => rec.diffDays >= 0 && rec.diffDays <= 7).length;
  const highPriorityCount = recommendations.filter((r) => r.priority === "high").length;

  // Category breakdown
  const categoryStats: { [key: string]: { total: number; achieved: number; count: number } } = {};
  recommendations.forEach((rec) => {
    const cat = rec.category || "General";
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, achieved: 0, count: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].total += rec.milestones.length;
    categoryStats[cat].achieved += rec.milestones.filter((m) => m.achieved).length;
  });

  const categories = Object.keys(categoryStats).map((cat) => {
    const stat = categoryStats[cat];
    const progress = stat.total > 0 ? Math.round((stat.achieved / stat.total) * 100) : 0;
    return {
      name: cat,
      progress,
      count: stat.count,
      totalMilestones: stat.total,
      achievedMilestones: stat.achieved,
    };
  });

  // Assignee performance
  const assigneeStats: { [key: string]: { name: string; email: string; total: number; achieved: number; recCount: number } } = {};
  recommendations.forEach((rec) => {
    const email = rec.assigneeEmail || "unassigned@rwg.com";
    if (!assigneeStats[email]) {
      assigneeStats[email] = {
        name: rec.assigneeName || "Unknown",
        email: email,
        total: 0,
        achieved: 0,
        recCount: 0,
      };
    }
    assigneeStats[email].recCount += 1;
    assigneeStats[email].total += rec.milestones.length;
    assigneeStats[email].achieved += rec.milestones.filter((m) => m.achieved).length;
  });

  const assignees = Object.values(assigneeStats).map((astat) => {
    const progress = astat.total > 0 ? Math.round((astat.achieved / astat.total) * 100) : 0;
    return {
      ...astat,
      progress,
    };
  }).sort((a, b) => b.progress - a.progress);

  const handleTriggerAllReminders = async () => {
    setTriggering(true);
    setAlertResult(null);
    try {
      const count = await onTriggerReminders();
      setAlertResult({ count, triggered: true });
      setTimeout(() => setAlertResult(null), 8000);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  const handleSendIndividualAlert = async (recId: string) => {
    setSendingIndividualId(recId);
    try {
      await onTriggerIndividualReminder(recId);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingIndividualId(null);
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner Alert Bar */}
      {alertResult && (
        <div
          id="email-trigger-success-alert"
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center justify-between gap-3 shadow-sm animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <span className="font-bold block text-xs uppercase tracking-wider font-mono">Scan Complete</span>
              <span className="text-xs text-emerald-700">
                {alertResult.count > 0
                  ? `Sent ${alertResult.count} automated email reminders to assignees.`
                  : "Scanning finished. No upcoming deadlines required new email alerts today."}
              </span>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase font-mono">
            Outbox Dispatched
          </span>
        </div>
      )}

      {/* Grid of 4 Geometric Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs rounded flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Mean Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{overallImplementationRate}%</p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              {achievedMilestones} / {totalMilestones} Milestones
            </span>
          </div>
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="28" cy="28" r="23" className="stroke-slate-100 fill-none" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r="23"
                className="stroke-blue-600 fill-none transition-all duration-1000"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 23}`}
                strokeDashoffset={`${2 * Math.PI * 23 * (1 - overallImplementationRate / 100)}`}
                strokeLinecap="square"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-blue-600 font-mono">
              {overallImplementationRate}%
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs rounded flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Total Recommendations</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalRecommendations}</p>
            <span className="text-[10px] text-blue-600 font-bold font-mono uppercase tracking-wider block mt-1">
              {highPriorityCount} Urgent High
            </span>
          </div>
          <div className="h-10 w-10 rounded bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs rounded flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Pending Actions</p>
            <p className={`text-3xl font-bold mt-1 ${urgentCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {urgentCount}
            </p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              Impending (7 Days)
            </span>
          </div>
          <div className={`h-10 w-10 rounded border flex items-center justify-center ${
            urgentCount > 0 ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-slate-50 border-slate-200 text-slate-400"
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs rounded flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Overdue Items</p>
            <p className={`text-3xl font-bold mt-1 ${overdueCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {overdueCount}
            </p>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              Missed Deadlines
            </span>
          </div>
          <div className={`h-10 w-10 rounded border flex items-center justify-center ${
            overdueCount > 0 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-400"
          }`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Category & Team Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Category Progress */}
          <div className="bg-white p-6 border border-slate-200 shadow-xs rounded">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest font-mono">
                Category Compliance Matrix
              </h3>
            </div>

            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-mono">No compliance data recorded.</p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-none block"></span>
                        {cat.name}
                        <span className="text-[10px] text-slate-400 italic font-normal">({cat.count} items)</span>
                      </span>
                      <span className="text-blue-600 font-mono font-bold">{cat.progress}%</span>
                    </div>

                    {/* Hard-edge flat progress track */}
                    <div className="w-full bg-slate-100 h-2 border border-slate-200/40 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${cat.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{cat.achievedMilestones} of {cat.totalMilestones} Milestones Achieved</span>
                      <span>{100 - cat.progress}% Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Team List */}
          <div className="bg-white p-6 border border-slate-200 shadow-xs rounded">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Users className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest font-mono">
                Assignee Performance Audits
              </h3>
            </div>

            {assignees.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-mono">No active assignees recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Assignee</th>
                      <th className="py-2.5 px-3 text-center">Items</th>
                      <th className="py-2.5 px-3 text-center">Milestones</th>
                      <th className="py-2.5 px-3">Compliance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignees.map((astat) => (
                      <tr key={astat.email} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">{astat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{astat.email}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {astat.recCount}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                          {astat.achieved}/{astat.total}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 h-2 border border-slate-200/40 overflow-hidden">
                              <div
                                className={`h-full ${
                                  astat.progress >= 75
                                    ? "bg-emerald-500"
                                    : astat.progress >= 40
                                    ? "bg-amber-500"
                                    : "bg-blue-600"
                                  }`}
                                style={{ width: `${astat.progress}%` }}
                              ></div>
                            </div>
                            <span className="font-bold font-mono text-slate-800 text-[11px]">{astat.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Deadlines */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 shadow-xs rounded flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <Calendar className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest font-mono">
                  Pending Actions Queue
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-mono">
                Urgent actions grouped by closeness to deadline. Ticking off their milestones will remove them from this alert queue.
              </p>

              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded my-4">
                  <span className="text-xl block mb-1">🎉</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase font-mono tracking-wider">
                    All Items 100% Implemented
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 5).map((rec) => {
                    const isOverdue = rec.diffDays < 0;
                    const isUrgent = rec.diffDays >= 0 && rec.diffDays <= 7;

                    return (
                      <div
                        key={rec.id}
                        className={`p-3 border transition-colors rounded ${
                          isOverdue
                            ? "bg-rose-50/40 border-rose-200"
                            : isUrgent
                            ? "bg-amber-50/40 border-amber-200"
                            : "bg-slate-50/40 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm font-mono tracking-wider ${
                              isOverdue
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : isUrgent
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isOverdue
                              ? `Overdue by ${Math.abs(rec.diffDays)}d`
                              : isUrgent
                              ? `Due in ${rec.diffDays}d`
                              : `In ${rec.diffDays}d`}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                            {rec.priority} PRIORITY
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-xs line-clamp-1 mb-1 font-sans">
                          {rec.title}
                        </h4>

                        <div className="flex justify-between items-center mt-2.5 border-t border-slate-100/60 pt-2 text-[10px]">
                          <div>
                            <span className="text-slate-400 block font-mono text-[9px] uppercase">Assignee</span>
                            <span className="font-bold text-slate-600">{rec.assigneeName.split(" ")[0]}</span>
                          </div>
                          <div className="text-right mr-2">
                            <span className="text-slate-400 block font-mono text-[9px] uppercase">Progress</span>
                            <span className="font-bold text-slate-700 font-mono text-[11px]">{rec.status}%</span>
                          </div>

                          <button
                            id={`btn-remind-single-${rec.id}`}
                            onClick={() => handleSendIndividualAlert(rec.id)}
                            disabled={sendingIndividualId === rec.id}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded border border-blue-200 transition-colors disabled:opacity-50"
                            title="Send individual email alert"
                          >
                            {sendingIndividualId === rec.id ? (
                              <svg className="animate-spin h-3 w-3 text-blue-700" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {upcomingDeadlines.length > 5 && (
              <div className="pt-3 border-t border-slate-150 text-center mt-4">
                <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                  + {upcomingDeadlines.length - 5} other deadlines pending
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
