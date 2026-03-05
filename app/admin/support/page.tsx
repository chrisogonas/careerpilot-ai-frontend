"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import { AdminSupportTicket } from "@/lib/types";

/* ── helpers ──────────────────────────────────────────────────── */

function Badge({ text, color }: { text: string; color: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-700",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{text}</span>;
}

const STATUS_COLORS: Record<string, "blue" | "yellow" | "green" | "gray"> = {
  new: "blue",
  read: "yellow",
  replied: "green",
  closed: "gray",
};

/* ── page ─────────────────────────────────────────────────────── */
export default function SupportPage() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const limit = 25;

  // Expanded ticket
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiClient.getSupportTickets(
        skip,
        limit,
        statusFilter || undefined,
        search.trim() || undefined,
      );
      setTickets(res.tickets);
      setTotal(res.total);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [skip, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  // Reset skip when filters change
  useEffect(() => { setSkip(0); }, [statusFilter, search]);

  const handleStatusChange = async (ticket: AdminSupportTicket, newStatus: string) => {
    try {
      await apiClient.updateTicketStatus(ticket.id, newStatus);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update ticket status");
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎫 Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage contact form submissions</p>
        </div>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm text-gray-600 font-medium">Search:</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or subject…"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-0"
            />
          </div>
          <p className="text-sm text-gray-500">{total} ticket{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="p-8 text-center text-gray-400">Loading…</div>}
      {err && <div className="p-8 text-center text-red-500">{err}</div>}

      {/* Tickets list */}
      {!loading && !err && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {tickets.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">No tickets found.</p>
          ) : (
            tickets.map((ticket) => {
              const isExpanded = expandedId === ticket.id;
              return (
                <div key={ticket.id} className="hover:bg-gray-50 transition">
                  {/* Summary row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge text={ticket.status} color={STATUS_COLORS[ticket.status] || "gray"} />
                        <span className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ticket.name} &lt;{ticket.email}&gt; · {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(ticket, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                      <span className="text-gray-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                        {ticket.message}
                      </div>
                      {ticket.user_id && (
                        <p className="mt-2 text-xs text-gray-400">User ID: {ticket.user_id}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
