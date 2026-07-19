import React, { useState, useEffect } from "react";
import { X, Save, ShieldAlert } from "lucide-react";
import { Recommendation, User } from "../types";

interface RecommendationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  recommendationToEdit?: Recommendation | null;
  users: User[];
}

export default function RecommendationForm({
  isOpen,
  onClose,
  onSave,
  recommendationToEdit,
  users,
}: RecommendationFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("Operations");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load editing values if provided
  useEffect(() => {
    if (recommendationToEdit) {
      setTitle(recommendationToEdit.title);
      setDescription(recommendationToEdit.description);
      setSource(recommendationToEdit.source);
      setCategory(recommendationToEdit.category);
      setPriority(recommendationToEdit.priority);
      setDeadline(recommendationToEdit.deadline);
      setAssigneeId(recommendationToEdit.assigneeId);
    } else {
      // Reset to defaults
      setTitle("");
      setDescription("");
      setSource("");
      setCategory("Operations");
      setPriority("medium");
      setDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // 14 days out default
      setAssigneeId("");
    }
    setError("");
  }, [recommendationToEdit, isOpen]);

  // Set initial assignee if users are loaded
  useEffect(() => {
    if (!recommendationToEdit && users.length > 0 && !assigneeId) {
      const firstAssignee = users.find((u) => u.role === "assignee") || users[0];
      if (firstAssignee) {
        setAssigneeId(firstAssignee.id);
      }
    }
  }, [users, recommendationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !source.trim() || !deadline || !assigneeId) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        source: source.trim(),
        category,
        priority,
        deadline,
        assigneeId,
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Operations", "Finance", "IT Security", "Governance", "HR & Legal", "Quality Assurance"];

  return (
    <div id="recommendation-form-modal" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded max-w-lg w-full shadow-lg border border-slate-300 flex flex-col max-h-[90vh] font-sans">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-mono">
              {recommendationToEdit ? "Edit Recommendation Entry" : "New Recommendation Entry"}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
              Specify organizational audit scope boundaries
            </p>
          </div>
          <button
            id="btn-close-form"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="form-error-alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0 inline mr-1.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Recommendation Title *</label>
            <input
              id="form-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="e.g. Implement multi-factor authentication across client APIs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Action Plan Scope *</label>
            <textarea
              id="form-description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="Detail specific milestones, steps, or compliance actions..."
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audit Source */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Audit Source *</label>
              <input
                id="form-source"
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. EY External Audit 2026"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Category *</label>
              <select
                id="form-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Priority level *</label>
              <div className="grid grid-cols-3 gap-1">
                {(["low", "medium", "high"] as const).map((prio) => (
                  <button
                    key={prio}
                    id={`form-prio-${prio}`}
                    type="button"
                    onClick={() => setPriority(prio)}
                    className={`py-1.5 text-[10px] font-bold border rounded uppercase tracking-wider transition-colors cursor-pointer ${
                      priority === prio
                        ? prio === "high"
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : prio === "medium"
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Deadline Date *</label>
              <input
                id="form-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Assignee Responsibility *</label>
            <select
              id="form-assignee"
              required
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="" disabled>Select Assignee User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-slate-400 font-mono">
              Only the selected assignee can author milestones and check off items.
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
            <button
              id="btn-form-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-form-submit"
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Recommendation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
