"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  PenTool,
  Star,
  Search,
  Briefcase,
  Mic,
  Zap,
  ArrowUpDown,
  X,
} from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import type { ElementType } from "react";

// ── Type config ────────────────────────────────────────────────────────────

interface TypeMeta {
  icon: ElementType;
  label: string;
  color: string;
  bg: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  resume_tailor:  { icon: FileText,  label: "Resume Tailor",  color: "text-blue-600",    bg: "bg-blue-50" },
  cover_letter:   { icon: PenTool,   label: "Cover Letter",   color: "text-emerald-600", bg: "bg-emerald-50" },
  star_stories:   { icon: Star,      label: "STAR Stories",   color: "text-amber-600",   bg: "bg-amber-50" },
  job_analysis:   { icon: Search,    label: "Job Analysis",   color: "text-purple-600",  bg: "bg-purple-50" },
  application:    { icon: Briefcase, label: "Application",    color: "text-indigo-600",  bg: "bg-indigo-50" },
  mock_interview: { icon: Mic,       label: "Mock Interview", color: "text-rose-600",    bg: "bg-rose-50" },
};

const DEFAULT_META: TypeMeta = { icon: Zap, label: "Other", color: "text-gray-600", bg: "bg-gray-50" };

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDateTime(iso).date;
}

type SortField = "created_at" | "type" | "title" | "credits_used";
type SortDir = "asc" | "desc";

const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 48; // px per row (py-3 ≈ 48px)

// ── Component ──────────────────────────────────────────────────────────────

export default function ActivityTable({ items }: { items: ActivityItem[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Collect unique types present in the data
  const availableTypes = useMemo(
    () => Array.from(new Set(items.map((i) => i.type))).sort(),
    [items],
  );

  // Filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (q) {
        const meta = TYPE_META[item.type] ?? DEFAULT_META;
        const haystack = `${item.title} ${item.description ?? ""} ${meta.label}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, typeFilter]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "credits_used":
          cmp = (a.credits_used ?? 0) - (b.credits_used ?? 0);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "created_at" ? "desc" : "asc");
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No activity yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Your recent actions will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar: search + type chips ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
              typeFilter === null
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {availableTypes.map((t) => {
            const meta = TYPE_META[t] ?? DEFAULT_META;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  typeFilter === t
                    ? `${meta.bg} ${meta.color}`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results summary ── */}
      <p className="text-xs text-gray-400 mb-2">
        {sorted.length === items.length
          ? `${items.length} activit${items.length === 1 ? "y" : "ies"}`
          : `${sorted.length} of ${items.length} activities`}
      </p>

      {/* ── Table ── */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_minmax(90px,1fr)_2fr_minmax(160px,2fr)_70px_110px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span />
          <SortHeader label="Type"    field="type"         current={sortField} dir={sortDir} onSort={toggleSort} />
          <SortHeader label="Title"   field="title"        current={sortField} dir={sortDir} onSort={toggleSort} />
          <span className="hidden md:block">Description</span>
          <SortHeader label="Credits" field="credits_used" current={sortField} dir={sortDir} onSort={toggleSort} />
          <SortHeader label="When"    field="created_at"   current={sortField} dir={sortDir} onSort={toggleSort} />
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto divide-y divide-gray-100"
          style={{ maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT}px` }}
        >
          {sorted.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No matching activity found
            </div>
          ) : (
            sorted.map((item) => {
              const meta = TYPE_META[item.type] ?? DEFAULT_META;
              const Icon = meta.icon;
              const { time } = formatDateTime(item.created_at);
              const relative = formatRelative(item.created_at);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[40px_minmax(90px,1fr)_2fr_minmax(160px,2fr)_70px_110px] gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors text-sm"
                >
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${meta.bg}`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>

                  {/* Type label */}
                  <span className={`font-medium truncate ${meta.color}`}>
                    {meta.label}
                  </span>

                  {/* Title */}
                  <span className="text-gray-900 font-medium truncate">
                    {item.title}
                  </span>

                  {/* Description (hidden on mobile) */}
                  <span className="hidden md:block text-gray-500 text-xs truncate">
                    {item.description ?? "—"}
                  </span>

                  {/* Credits */}
                  <span className="text-gray-600 text-center tabular-nums">
                    {item.credits_used != null && item.credits_used > 0
                      ? `${item.credits_used}`
                      : "—"}
                  </span>

                  {/* Timestamp */}
                  <div className="text-right">
                    <span className="text-gray-600 text-xs" title={`${formatDateTime(item.created_at).date} ${time}`}>
                      {relative}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sort header helper ─────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 hover:text-gray-700 transition ${
        active ? "text-gray-700" : ""
      }`}
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${active ? "opacity-100" : "opacity-40"}`} />
      {active && (
        <span className="sr-only">{dir === "asc" ? "ascending" : "descending"}</span>
      )}
    </button>
  );
}
