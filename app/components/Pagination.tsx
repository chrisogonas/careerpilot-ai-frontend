"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Build page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg mt-4">
      {/* Left: item count + page size */}
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>
          {startItem}–{endItem} of {totalItems}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ‹ Prev
          </button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="px-2 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[2rem] px-2 py-1.5 text-sm font-medium rounded-lg transition ${
                  p === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next ›
          </button>
        </nav>
      )}
    </div>
  );
}
