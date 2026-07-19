import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  PlusCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  CalendarDays,
  Target
} from "lucide-react";
import { Recommendation, User as UserType } from "../types";

interface RecommendationListProps {
  recommendations: Recommendation[];
  users: UserType[];
  currentUser: any;
  onAddMilestone: (recId: string, title: string) => Promise<void>;
  onToggleMilestone: (recId: string, msId: string, achieved: boolean) => Promise<void>;
  onDeleteMilestone: (recId: string, msId: string) => Promise<void>;
  onEditRecommendation: (rec: Recommendation) => void;
  onDeleteRecommendation: (recId: string) => Promise<void>;
  onOpenCreateModal: () => void;
}

export default function RecommendationList({
  recommendations,
  users,
  currentUser,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
  onEditRecommendation,
  onDeleteRecommendation,
  onOpenCreateModal,
}: RecommendationListProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<{ [key: string]: string }>({});
  const [addingMsLoadingId, setAddingMsLoadingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const categories = Array.from(new Set(recommendations.map((r) => r.category))).filter(Boolean);
  const assigneesList = Array.from(new Set(recommendations.map((r) => r.assigneeEmail)))
    .map((email) => recommendations.find((r) => r.assigneeEmail === email))
    .filter(Boolean);

  const filteredRecs = recommendations.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(search.toLowerCase()) ||
      rec.description.toLowerCase().includes(search.toLowerCase()) ||
      rec.source.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === "all" || rec.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || rec.category === categoryFilter;
    const matchesAssignee = assigneeFilter === "all" || rec.assigneeEmail === assigneeFilter;

    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee;
  });

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const handleMilestoneTextChange = (recId: string, val: string) => {
    setNewMilestoneTitles({
      ...newMilestoneTitles,
      [recId]: val,
    });
  };

  const handleAddMilestoneSubmit = async (e: React.FormEvent, recId: string) => {
    e.preventDefault();
    const title = newMilestoneTitles[recId] || "";
    if (title.trim() === "") return;

    setAddingMsLoadingId(recId);
    try {
      await onAddMilestone(recId, title);
      setNewMilestoneTitles({
        ...newMilestoneTitles,
        [recId]: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMsLoadingId(null);
    }
  };

  const isAuthorizedToEditMilestones = (rec: Recommendation) => {
    if (currentUser?.role === "admin") return true;
    if (currentUser?.role === "assignee" && rec.assigneeId === currentUser?.id) return true;
    return false;
  };

  return (
    <div id="recommendations-view" className="space-y-6 animate-fade-in font-sans">
      {/* Filters Area */}
      <div className="bg-white p-5 border border-slate-200 shadow-xs rounded space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-2 shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-700 font-medium"
              placeholder="Search by title, description, reports..."
            />
          </div>

          {/* Category selection */}
          <div className="shadow-xs">
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-600 font-semibold"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority selection */}
          <div className="shadow-xs">
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-600 font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Assignee badges row */}
        <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest">Assignee filters:</span>
          <button
            id="btn-filter-assignee-all"
            onClick={() => setAssigneeFilter("all")}
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
              assigneeFilter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            All Team
          </button>
          {assigneesList.map((astat) => {
            if (!astat) return null;
            return (
              <button
                key={astat.id}
                id={`btn-filter-assignee-${astat.id}`}
                onClick={() => setAssigneeFilter(astat.assigneeEmail)}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                  assigneeFilter === astat.assigneeEmail
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {astat.assigneeName.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main recommendation list */}
      {filteredRecs.length === 0 ? (
        <div id="no-recs-alert" className="text-center py-16 bg-white border border-slate-200 shadow-xs rounded">
          <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest font-mono">No Actions Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
            Adjust search terms, filters, or create a new recommendation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const isExpanded = expandedId === rec.id;
            const totalMilestones = rec.milestones.length;
            const achievedMilestones = rec.milestones.filter((m) => m.achieved).length;
            const progressPercent = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;
            const isOverdue = new Date(rec.deadline).getTime() < Date.now() && progressPercent < 100;

            return (
              <div
                key={rec.id}
                id={`rec-card-${rec.id}`}
                className={`bg-white border transition-all duration-150 rounded overflow-hidden ${
                  isExpanded
                    ? "border-slate-300 shadow-sm ring-1 ring-slate-100"
                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Header Strip */}
                <div
                  onClick={() => toggleExpand(rec.id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-sm font-mono tracking-wider">
                        {rec.category}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-sm font-mono tracking-wider ${getPriorityBadgeColor(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                      {isOverdue && (
                        <span className="text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-sm font-mono tracking-wider animate-pulse border border-rose-200">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm sm:text-base hover:text-blue-600 transition-colors">
                      {rec.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                        {rec.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        Deadline: <span className={isOverdue ? "text-rose-600 font-bold" : ""}>{rec.deadline}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Assignee: <span className="font-bold text-slate-600">{rec.assigneeName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Implementation progress block */}
                  <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t border-slate-100 pt-3.5 md:pt-0 md:border-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] font-bold text-slate-400 block font-mono tracking-wider">PROGRESS</span>
                      <span className={`font-black font-mono text-base ${progressPercent === 100 ? "text-green-600" : "text-blue-600"}`}>
                        {progressPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {achievedMilestones} / {totalMilestones} steps
                      </span>
                    </div>

                    {/* Progress tracker bar */}
                    <div className="w-16 bg-slate-100 h-2 border border-slate-200/40 rounded-none overflow-hidden hidden sm:block">
                      <div
                        className={`h-full ${progressPercent === 100 ? "bg-green-600" : "bg-blue-600"}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                    <button
                      id={`btn-toggle-expand-${rec.id}`}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50"
                    >
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/55 p-5 sm:p-6 space-y-6">
                    {/* Description Details */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Scope Details</h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-5xl bg-white p-3.5 border border-slate-200 rounded font-mono">
                        {rec.description}
                      </p>
                    </div>

                    {/* Milestones checklist */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          Compliance Milestone Items ({achievedMilestones} / {totalMilestones})
                        </h4>
                        {!isAuthorizedToEditMilestones(rec) && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm font-mono">
                            Read-Only Assignee View
                          </span>
                        )}
                      </div>

                      {totalMilestones === 0 ? (
                        <div className="text-center py-6 bg-white border border-slate-200 rounded">
                          <HelpCircle className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs text-slate-400 font-mono">No milestone actions have been created.</p>
                          {isAuthorizedToEditMilestones(rec) && (
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                              Add a milestone below to begin tracking compliance!
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {rec.milestones.map((ms) => {
                            const isAuthorized = isAuthorizedToEditMilestones(rec);

                            return (
                              <div
                                key={ms.id}
                                className={`flex items-center justify-between p-3 border bg-white rounded transition-colors ${
                                  ms.achieved ? "border-emerald-200 bg-emerald-50/5" : "border-slate-200"
                                }`}
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0 mr-4">
                                  <input
                                    id={`check-ms-${ms.id}`}
                                    type="checkbox"
                                    disabled={!isAuthorized}
                                    checked={ms.achieved}
                                    onChange={(e) => onToggleMilestone(rec.id, ms.id, e.target.checked)}
                                    className="h-4.5 w-4.5 mt-0.5 text-blue-600 border-slate-300 focus:ring-blue-500 disabled:opacity-50"
                                  />
                                  <div className="min-w-0">
                                    <span
                                      className={`text-xs font-semibold block leading-tight ${
                                        ms.achieved ? "line-through text-slate-400 font-normal" : "text-slate-700"
                                      }`}
                                    >
                                      {ms.title}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-x-3 text-[9px] text-slate-400 mt-1 font-mono">
                                      <span>Creator: {ms.createdBy}</span>
                                      {ms.achievedAt && (
                                        <span className="text-emerald-600 font-bold uppercase tracking-wider">
                                          ✔ Achieved: {new Date(ms.achievedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isAuthorized && (
                                  <button
                                    id={`btn-del-ms-${ms.id}`}
                                    onClick={() => onDeleteMilestone(rec.id, ms.id)}
                                    className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                                    title="Remove Milestone"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Milestone Input Form */}
                      {isAuthorizedToEditMilestones(rec) && (
                        <form
                          onSubmit={(e) => handleAddMilestoneSubmit(e, rec.id)}
                          className="mt-3.5 flex items-center gap-2"
                        >
                          <input
                            id={`input-add-ms-${rec.id}`}
                            type="text"
                            required
                            disabled={addingMsLoadingId === rec.id}
                            value={newMilestoneTitles[rec.id] || ""}
                            onChange={(e) => handleMilestoneTextChange(rec.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            placeholder="Add compliance milestone (e.g. Draft validation matrix)..."
                          />
                          <button
                            id={`btn-add-ms-submit-${rec.id}`}
                            type="submit"
                            disabled={addingMsLoadingId === rec.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors min-w-[90px] cursor-pointer"
                          >
                            {addingMsLoadingId === rec.id ? (
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <>
                                <PlusCircle className="h-3.5 w-3.5" />
                                Add
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Admin Actions Strip */}
                    {currentUser?.role === "admin" && (
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                          id={`btn-edit-rec-${rec.id}`}
                          onClick={() => onEditRecommendation(rec)}
                          className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit Item
                        </button>
                        <button
                          id={`btn-delete-rec-${rec.id}`}
                          onClick={() => {
                            if (window.confirm("Delete this recommendation and all milestones? This cannot be undone.")) {
                              onDeleteRecommendation(rec.id);
                            }
                          }}
                          className="flex items-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
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
