"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { JobApplication, JobApplicationStatus } from "@/lib/types";
import { Briefcase, GripVertical, MapPin, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

// ── Column definitions ───────────────────────────────────────────────────────

interface PipelineColumn {
  id: JobApplicationStatus;
  label: string;
  color: string;       // border-top color
  bgColor: string;     // header background
  textColor: string;
}

const COLUMNS: PipelineColumn[] = [
  { id: "saved",        label: "Saved",        color: "border-t-slate-400",  bgColor: "bg-slate-50",   textColor: "text-slate-700" },
  { id: "applied",      label: "Applied",      color: "border-t-blue-500",   bgColor: "bg-blue-50",    textColor: "text-blue-700" },
  { id: "phone_screen", label: "Phone Screen", color: "border-t-cyan-500",   bgColor: "bg-cyan-50",    textColor: "text-cyan-700" },
  { id: "interview",    label: "Interview",    color: "border-t-amber-500",  bgColor: "bg-amber-50",   textColor: "text-amber-700" },
  { id: "final_round",  label: "Final Round",  color: "border-t-orange-500", bgColor: "bg-orange-50",  textColor: "text-orange-700" },
  { id: "offer",        label: "Offer",        color: "border-t-green-500",  bgColor: "bg-green-50",   textColor: "text-green-700" },
  { id: "accepted",     label: "Accepted",     color: "border-t-emerald-500",bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
  { id: "rejected",     label: "Rejected",     color: "border-t-red-400",    bgColor: "bg-red-50",     textColor: "text-red-700" },
  { id: "withdrawn",    label: "Withdrawn",    color: "border-t-gray-400",   bgColor: "bg-gray-50",    textColor: "text-gray-600" },
];

// ── Sortable Card ────────────────────────────────────────────────────────────

function SortableCard({ app }: { app: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
    data: { status: app.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-slate-300 hover:text-slate-500 flex-shrink-0">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <Link href={`/applications/${app.id}`} className="block">
            <h4 className="text-sm font-semibold text-slate-900 truncate hover:text-blue-600 transition-colors">
              {app.job_title}
            </h4>
          </Link>
          <p className="text-xs text-slate-500 truncate">{app.company_name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            {app.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {app.location}
              </span>
            )}
            {app.applied_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(app.applied_date).toLocaleDateString()}
              </span>
            )}
            {app.job_url && (
              <a
                href={app.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-blue-400 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overlay card (visible while dragging)
function DragOverlayCard({ app }: { app: JobApplication }) {
  return (
    <div className="bg-white rounded-lg border-2 border-blue-400 p-3 shadow-xl w-64">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{app.job_title}</h4>
          <p className="text-xs text-slate-500 truncate">{app.company_name}</p>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Column ──────────────────────────────────────────────────────────

function PipelineColumnComponent({
  column,
  apps,
}: {
  column: PipelineColumn;
  apps: JobApplication[];
}) {
  return (
    <div className={`flex flex-col rounded-lg border border-slate-200 border-t-4 ${column.color} bg-slate-50/50 min-w-[220px] max-w-[280px] flex-1`}>
      {/* Column Header */}
      <div className={`px-3 py-2.5 ${column.bgColor} rounded-t-sm`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${column.textColor}`}>
            {column.label}
          </h3>
          <span className={`text-xs font-semibold ${column.textColor} bg-white/60 px-2 py-0.5 rounded-full`}>
            {apps.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[120px] overflow-y-auto max-h-[calc(100vh-300px)]">
          {apps.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-xs text-slate-400 text-center">
                Drop here
              </p>
            </div>
          ) : (
            apps.map((app) => <SortableCard key={app.id} app={app} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ── Main Pipeline Component ──────────────────────────────────────────────────

interface ApplicationPipelineProps {
  applications: JobApplication[];
  onStatusChange: (id: string, newStatus: JobApplicationStatus) => Promise<void>;
}

export default function ApplicationPipeline({ applications, onStatusChange }: ApplicationPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track optimistic status overrides during drag
  const [overrideStatus, setOverrideStatus] = useState<Record<string, JobApplicationStatus>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  // Group applications by column (with optimistic overrides)
  const grouped = useMemo(() => {
    const groups: Record<JobApplicationStatus, JobApplication[]> = {
      saved: [], applied: [], phone_screen: [], interview: [],
      final_round: [], offer: [], accepted: [], rejected: [], withdrawn: [],
    };
    for (const app of applications) {
      const status = overrideStatus[app.id] || app.status;
      groups[status].push(app);
    }
    return groups;
  }, [applications, overrideStatus]);

  // Only show columns that have applications or are "core" workflow columns
  const visibleColumns = useMemo(() => {
    const coreStatuses: JobApplicationStatus[] = ["saved", "applied", "phone_screen", "interview", "offer"];
    return COLUMNS.filter(
      (col) => grouped[col.id].length > 0 || coreStatuses.includes(col.id)
    );
  }, [grouped]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeAppId = String(active.id);
    // Figure out which column the item is over
    const overApp = applications.find((a) => a.id === String(over.id));
    const overStatus = overApp
      ? overrideStatus[overApp.id] || overApp.status
      : (over.id as JobApplicationStatus);

    // Check if it's a valid column status
    if (COLUMNS.some((c) => c.id === overStatus)) {
      setOverrideStatus((prev) => {
        if (prev[activeAppId] === overStatus) return prev;
        return { ...prev, [activeAppId]: overStatus };
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      setOverrideStatus({});
      return;
    }

    const appId = String(active.id);
    const app = applications.find((a) => a.id === appId);
    if (!app) {
      setOverrideStatus({});
      return;
    }

    // Determine target status
    const overApp = applications.find((a) => a.id === String(over.id));
    let targetStatus: JobApplicationStatus;

    if (overApp && overApp.id !== appId) {
      targetStatus = overrideStatus[overApp.id] || overApp.status;
    } else if (COLUMNS.some((c) => c.id === String(over.id))) {
      targetStatus = String(over.id) as JobApplicationStatus;
    } else {
      targetStatus = overrideStatus[appId] || app.status;
    }

    setOverrideStatus({});

    // Only update if status actually changed
    if (targetStatus !== app.status) {
      await onStatusChange(appId, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverrideStatus({});
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {visibleColumns.map((col) => (
          <PipelineColumnComponent key={col.id} column={col} apps={grouped[col.id]} />
        ))}
      </div>

      <DragOverlay>
        {activeApp ? <DragOverlayCard app={activeApp} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
