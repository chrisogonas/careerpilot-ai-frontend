"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  TodoItem,
  TodoCategory,
  TodoPriority,
  TodoStatus,
  CreateTodoPayload,
  CreateTodoReminderPayload,
  SnoozeDuration,
  ReminderType,
  RecurrenceInterval,
} from "@/lib/types";

// ============================================================================
// Constants & helpers
// ============================================================================

const CATEGORIES: { value: TodoCategory; label: string; icon: string; color: string }[] = [
  { value: "career", label: "Career", icon: "💼", color: "bg-blue-100 text-blue-800" },
  { value: "learning", label: "Learning", icon: "📚", color: "bg-purple-100 text-purple-800" },
  { value: "networking", label: "Networking", icon: "🤝", color: "bg-green-100 text-green-800" },
  { value: "personal", label: "Personal", icon: "🏠", color: "bg-amber-100 text-amber-800" },
  { value: "other", label: "Other", icon: "📌", color: "bg-gray-100 text-gray-700" },
];

const PRIORITIES: { value: TodoPriority; label: string; color: string; dot: string }[] = [
  { value: "low", label: "Low", color: "text-gray-500", dot: "bg-gray-400" },
  { value: "medium", label: "Medium", color: "text-blue-600", dot: "bg-blue-500" },
  { value: "high", label: "High", color: "text-amber-600", dot: "bg-amber-500" },
  { value: "urgent", label: "Urgent", color: "text-red-600", dot: "bg-red-500" },
];

const STATUSES: { value: TodoStatus; label: string; icon: string }[] = [
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "in_progress", label: "In Progress", icon: "🔄" },
  { value: "completed", label: "Completed", icon: "✅" },
  { value: "cancelled", label: "Cancelled", icon: "❌" },
];

const RECURRENCE_OPTIONS: { value: RecurrenceInterval; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "every_2_days", label: "Every 2 days" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];

const SNOOZE_OPTIONS: { value: SnoozeDuration; label: string }[] = [
  { value: "5m", label: "5 min" },
  { value: "10m", label: "10 min" },
  { value: "15m", label: "15 min" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
];

function getCategoryMeta(cat: TodoCategory) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
}
function getPriorityMeta(pri: TodoPriority) {
  return PRIORITIES.find((p) => p.value === pri) || PRIORITIES[1];
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

// ============================================================================
// Main page
// ============================================================================

export default function TodosPage() {
  const router = useRouter();
  const {
    user, isAuthenticated, isLoading,
    getTodos, createTodo, updateTodo, deleteTodo,
    addSubtask, updateSubtask, deleteSubtask,
    createTodoReminder, updateTodoReminder, deleteTodoReminder,
    snoozeTodoReminder, dismissTodoReminder, completeTodoReminder,
  } = useAuth();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<TodoCategory | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ------- Fetch -------
  const loadTodos = useCallback(async () => {
    try {
      setLocalError(null);
      const filters: Record<string, string> = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterCategory !== "all") filters.category = filterCategory;
      if (filterPriority !== "all") filters.priority = filterPriority;
      const res = await getTodos(
        Object.keys(filters).length > 0 ? (filters as never) : undefined,
      );
      setTodos(res.todos);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load todos";
      setLocalError(msg);
    }
  }, [getTodos, filterStatus, filterCategory, filterPriority]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  // Refetch when filters change
  useEffect(() => {
    if (!isAuthenticated || !hasFetched.current) return;
    loadTodos();
  }, [filterStatus, filterCategory, filterPriority, loadTodos, isAuthenticated]);

  // Flash success
  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ------- Handlers -------
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      flash("Todo deleted");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleStatusChange = async (todo: TodoItem, newStatus: TodoStatus) => {
    try {
      const updated = await updateTodo(todo.id, { status: newStatus });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      flash(`Marked as ${newStatus.replace("_", " ")}`);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Status update failed");
    }
  };

  const handleToggleSubtask = async (todoId: string, subtaskId: string, isCompleted: boolean) => {
    try {
      const updated = await updateSubtask(todoId, subtaskId, { is_completed: !isCompleted });
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id !== todoId) return t;
          return {
            ...t,
            subtasks: t.subtasks.map((s) => (s.id === subtaskId ? updated : s)),
          };
        }),
      );
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Subtask update failed");
    }
  };

  const handleAddSubtask = async (todoId: string, title: string) => {
    try {
      const sub = await addSubtask(todoId, title);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, subtasks: [...t.subtasks, sub] } : t,
        ),
      );
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add subtask");
    }
  };

  const handleDeleteSubtask = async (todoId: string, subtaskId: string) => {
    try {
      await deleteSubtask(todoId, subtaskId);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId
            ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
            : t,
        ),
      );
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to delete subtask");
    }
  };

  // Reminder actions
  const handleSnoozeReminder = async (todoId: string, dur: SnoozeDuration) => {
    try {
      const r = await snoozeTodoReminder(todoId, dur);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, reminder: r } : t)),
      );
      flash(`Snoozed for ${dur}`);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Snooze failed");
    }
  };

  const handleDismissReminder = async (todoId: string) => {
    try {
      const r = await dismissTodoReminder(todoId);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, reminder: r } : t)),
      );
      flash("Reminder dismissed");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Dismiss failed");
    }
  };

  const handleCompleteReminder = async (todoId: string) => {
    try {
      const r = await completeTodoReminder(todoId);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, reminder: r } : t)),
      );
      flash("Reminder completed");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Complete failed");
    }
  };

  const handleDeleteReminder = async (todoId: string) => {
    try {
      await deleteTodoReminder(todoId);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, reminder: undefined } : t)),
      );
      flash("Reminder removed");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  // Save (create / update)
  const handleSave = async (payload: CreateTodoPayload, reminderPayload?: CreateTodoReminderPayload) => {
    try {
      setLocalError(null);
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, {
          title: payload.title,
          description: payload.description,
          notes: payload.notes,
          category: payload.category,
          priority: payload.priority,
          due_date: payload.due_date,
          application_id: payload.application_id,
        });
        // Update subtasks: add new ones (they have empty id)
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        // Handle reminder
        if (reminderPayload && !editingTodo.reminder) {
          const r = await createTodoReminder(editingTodo.id, reminderPayload);
          setTodos((prev) =>
            prev.map((t) => (t.id === updated.id ? { ...t, reminder: r } : t)),
          );
        } else if (reminderPayload && editingTodo.reminder) {
          const r = await updateTodoReminder(editingTodo.id, reminderPayload);
          setTodos((prev) =>
            prev.map((t) => (t.id === updated.id ? { ...t, reminder: r } : t)),
          );
        }
        flash("Todo updated");
      } else {
        const newTodo = await createTodo(payload);
        setTodos((prev) => [newTodo, ...prev]);
        flash("Todo created");
      }
      setShowModal(false);
      setEditingTodo(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setLocalError(msg);
    }
  };

  // Search filter
  const filtered = todos.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.notes || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.status === "completed").length,
    pending: todos.filter((t) => t.status === "pending").length,
    inProgress: todos.filter((t) => t.status === "in_progress").length,
    urgent: todos.filter((t) => t.priority === "urgent" && t.status !== "completed").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My TODO List</h1>
            <p className="text-gray-500 mt-1">Manage tasks, track progress, and stay organized</p>
          </div>
          <button
            onClick={() => { setEditingTodo(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
            <span>✅</span> {successMsg}
          </div>
        )}
        {(localError) && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {localError}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", val: stats.total, bg: "bg-white", text: "text-gray-900" },
            { label: "Pending", val: stats.pending, bg: "bg-amber-50", text: "text-amber-700" },
            { label: "In Progress", val: stats.inProgress, bg: "bg-blue-50", text: "text-blue-700" },
            { label: "Completed", val: stats.completed, bg: "bg-green-50", text: "text-green-700" },
            { label: "Urgent", val: stats.urgent, bg: "bg-red-50", text: "text-red-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg border px-4 py-3 text-center`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as TodoStatus | "all"); hasFetched.current = true; }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value as TodoCategory | "all"); hasFetched.current = true; }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={filterPriority}
            onChange={(e) => { setFilterPriority(e.target.value as TodoPriority | "all"); hasFetched.current = true; }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by priority"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Todo list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700">No tasks yet</h3>
            <p className="text-gray-500 mt-1">Click &quot;New Task&quot; to add your first to-do item.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                expanded={expandedTodo === todo.id}
                onToggleExpand={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                onEdit={() => { setEditingTodo(todo); setShowModal(true); }}
                onDelete={() => setDeleteConfirm(todo.id)}
                onStatusChange={(s) => handleStatusChange(todo, s)}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onSnooze={handleSnoozeReminder}
                onDismiss={handleDismissReminder}
                onCompleteReminder={handleCompleteReminder}
                onDeleteReminder={handleDeleteReminder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <TodoFormModal
          todo={editingTodo}
          onClose={() => { setShowModal(false); setEditingTodo(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete Task?</h3>
            <p className="text-gray-500 mt-2 text-sm">This will permanently remove the task, all subtasks, and any reminder.</p>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Todo Card component
// ============================================================================

interface TodoCardProps {
  todo: TodoItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: TodoStatus) => void;
  onToggleSubtask: (todoId: string, subtaskId: string, isCompleted: boolean) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onDeleteSubtask: (todoId: string, subtaskId: string) => void;
  onSnooze: (todoId: string, dur: SnoozeDuration) => void;
  onDismiss: (todoId: string) => void;
  onCompleteReminder: (todoId: string) => void;
  onDeleteReminder: (todoId: string) => void;
}

function TodoCard({
  todo, expanded, onToggleExpand, onEdit, onDelete,
  onStatusChange, onToggleSubtask, onAddSubtask, onDeleteSubtask,
  onSnooze, onDismiss, onCompleteReminder, onDeleteReminder,
}: TodoCardProps) {
  const cat = getCategoryMeta(todo.category);
  const pri = getPriorityMeta(todo.priority);
  const isCompleted = todo.status === "completed";
  const isCancelled = todo.status === "cancelled";
  const isDone = isCompleted || isCancelled;
  const completedSubs = todo.subtasks.filter((s) => s.is_completed).length;
  const totalSubs = todo.subtasks.length;
  const progress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

  const [newSubtask, setNewSubtask] = useState("");
  const [showSnooze, setShowSnooze] = useState(false);

  // Overdue check
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !isDone;

  return (
    <div
      className={`bg-white rounded-xl border transition-shadow hover:shadow-md ${
        isDone ? "opacity-60" : ""
      } ${isOverdue ? "border-red-300" : "border-gray-200"}`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Quick complete checkbox */}
        <button
          onClick={() =>
            onStatusChange(isCompleted ? "pending" : "completed")
          }
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-semibold text-gray-900 ${isDone ? "line-through text-gray-500" : ""}`}
            >
              {todo.title}
            </h3>
            {/* Priority dot */}
            <span className={`w-2 h-2 rounded-full ${pri.dot}`} title={pri.label} />
            {/* Category badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
              {cat.icon} {cat.label}
            </span>
            {/* Status badge */}
            {todo.status === "in_progress" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                🔄 In Progress
              </span>
            )}
            {/* Reminder indicator */}
            {todo.reminder && todo.reminder.status === "active" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                🔔 Reminder
              </span>
            )}
          </div>
          {todo.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{todo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {todo.due_date && (
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                📅 {formatDate(todo.due_date)} {isOverdue && "(overdue)"}
              </span>
            )}
            {totalSubs > 0 && (
              <span>
                ✓ {completedSubs}/{totalSubs} subtasks
              </span>
            )}
            {todo.reminder?.email_enabled && (
              <span>📧 Email</span>
            )}
          </div>
          {/* Subtask progress bar */}
          {totalSubs > 0 && (
            <div className="mt-2 w-full max-w-xs bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleExpand}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Edit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 bg-gray-50/50 rounded-b-xl">
          {/* Status changer */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value)}
                className={`text-xs px-3 py-1 rounded-full border transition font-medium ${
                  todo.status === s.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          {todo.notes && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r text-sm text-amber-900">
              <span className="font-semibold">📝 Notes:</span> {todo.notes}
            </div>
          )}

          {/* Subtasks */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Subtasks ({completedSubs}/{totalSubs})</h4>
            {todo.subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => onToggleSubtask(todo.id, s.id, s.is_completed)}
                  title={s.is_completed ? 'Mark incomplete' : 'Mark complete'}
                  className={`w-4 h-4 rounded border flex items-center justify-center text-white ${
                    s.is_completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {s.is_completed && (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm flex-1 ${s.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {s.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask(todo.id, s.id)}
                  className="text-gray-300 hover:text-red-500 transition"
                  title="Delete subtask"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {/* Add subtask inline */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="+ Add subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSubtask.trim()) {
                    onAddSubtask(todo.id, newSubtask.trim());
                    setNewSubtask("");
                  }
                }}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newSubtask.trim()) {
                    onAddSubtask(todo.id, newSubtask.trim());
                    setNewSubtask("");
                  }
                }}
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Reminder section */}
          {todo.reminder && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-800">🔔 Reminder</h4>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    {todo.reminder.reminder_type === "recurring" ? "Recurring" : "One-time"}
                    {todo.reminder.recurrence_interval && ` (${todo.reminder.recurrence_interval.replace("_", " ")})`}
                    {" — "}
                    Next: {formatDateTime(todo.reminder.next_reminder_date)}
                  </p>
                  <p className="text-xs text-indigo-500 mt-0.5">
                    Status: {todo.reminder.status}
                    {todo.reminder.email_enabled && " | 📧 Email enabled"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <div className="relative">
                    <button
                      onClick={() => setShowSnooze(!showSnooze)}
                      className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-medium"
                    >
                      Snooze
                    </button>
                    {showSnooze && (
                      <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                        {SNOOZE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              onSnooze(todo.id, opt.value);
                              setShowSnooze(false);
                            }}
                            className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDismiss(todo.id)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 font-medium"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => onCompleteReminder(todo.id)}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => onDeleteReminder(todo.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Create/Edit Modal
// ============================================================================

interface TodoFormModalProps {
  todo: TodoItem | null;
  onClose: () => void;
  onSave: (payload: CreateTodoPayload, reminder?: CreateTodoReminderPayload) => void;
}

function TodoFormModal({ todo, onClose, onSave }: TodoFormModalProps) {
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [notes, setNotes] = useState(todo?.notes || "");
  const [category, setCategory] = useState<TodoCategory>(todo?.category || "other");
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || "medium");
  const [dueDate, setDueDate] = useState(toLocalInput(todo?.due_date));
  const [subtasks, setSubtasks] = useState<string[]>(
    todo?.subtasks.map((s) => s.title) || [""],
  );

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(!!todo?.reminder);
  const [reminderDate, setReminderDate] = useState(toLocalInput(todo?.reminder?.reminder_date));
  const [reminderType, setReminderType] = useState<ReminderType>(
    todo?.reminder?.reminder_type || "once",
  );
  const [recurrence, setRecurrence] = useState<RecurrenceInterval>(
    (todo?.reminder?.recurrence_interval as RecurrenceInterval) || "weekly",
  );
  const [emailEnabled, setEmailEnabled] = useState(todo?.reminder?.email_enabled || false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const payload: CreateTodoPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      category,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      subtasks: subtasks
        .filter((s) => s.trim())
        .map((s) => ({ title: s.trim() })),
    };

    let reminderPayload: CreateTodoReminderPayload | undefined;
    if (reminderEnabled && reminderDate) {
      reminderPayload = {
        reminder_date: new Date(reminderDate).toISOString(),
        reminder_type: reminderType,
        recurrence_interval: reminderType === "recurring" ? recurrence : undefined,
        email_enabled: emailEnabled,
      };
      // If creating new (not editing), include reminder inline
      if (!todo) {
        payload.reminder = reminderPayload;
        reminderPayload = undefined;
      }
    }

    onSave(payload, reminderPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-lg font-semibold text-white">
            {todo ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white" title="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the task"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Category & Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TodoCategory)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 text-xs px-2 py-2.5 rounded-lg border font-medium transition ${
                      priority === p.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date & Time</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or context..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtasks</label>
            {subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="text-gray-400 text-xs w-5 text-right">{i + 1}.</span>
                <input
                  type="text"
                  value={st}
                  onChange={(e) => {
                    const copy = [...subtasks];
                    copy[i] = e.target.value;
                    setSubtasks(copy);
                  }}
                  placeholder="Subtask title"
                  aria-label={`Subtask ${i + 1}`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {subtasks.length > 1 && (
                  <button
                    onClick={() => setSubtasks(subtasks.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-500"
                    title="Remove subtask"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setSubtasks([...subtasks, ""])}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
            >
              + Add subtask
            </button>
          </div>

          {/* Reminder toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">🔔 Set Reminder</span>
            </label>
          </div>

          {reminderEnabled && (
            <div className="bg-indigo-50 rounded-lg p-4 space-y-3 border border-indigo-100">
              {/* Reminder date */}
              <div>
                <label className="block text-xs font-medium text-indigo-800 mb-1">Reminder Date & Time</label>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Reminder type */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reminderType"
                    value="once"
                    checked={reminderType === "once"}
                    onChange={() => setReminderType("once")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  One-time
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reminderType"
                    value="recurring"
                    checked={reminderType === "recurring"}
                    onChange={() => setReminderType("recurring")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Recurring
                </label>
              </div>

              {reminderType === "recurring" && (
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Repeat Every</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceInterval)}
                    className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Recurrence interval"
                  >
                    {RECURRENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email reminder toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  aria-label="Enable email reminder"
                />
                <span className="text-sm text-indigo-800">📧 Also send email reminder</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {todo ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
