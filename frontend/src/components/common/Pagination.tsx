interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;

    let from = Math.max(1, currentPage - 2);
    const to = Math.min(totalPages, from + maxVisible - 1);

    if (to - from < maxVisible - 1) {
      from = Math.max(1, to - maxVisible + 1);
    }

    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
  };

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  const baseBtn =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition " +
    "focus:outline-none focus:ring-4 focus:ring-indigo-200/70 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const ghostBtn =
    "bg-white/80 backdrop-blur ring-1 ring-slate-200 text-slate-700 shadow-sm " +
    "hover:bg-white hover:-translate-y-0.5 active:translate-y-0";

  const activeBtn =
    "text-white ring-1 ring-indigo-200 shadow-[0_10px_25px_-18px_rgba(99,102,241,0.75)] " +
    "bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500";

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(baseBtn, ghostBtn, "w-10")}
          aria-label="Previous page"
        >
          ‹
        </button>

        {currentPage > 3 && (
          <>
            <button
              onClick={() => go(1)}
              className={cn(baseBtn, ghostBtn)}
              aria-label="Go to first page"
            >
              1
            </button>
            <span className="px-1 text-slate-400 select-none">…</span>
          </>
        )}

        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              baseBtn,
              p === currentPage ? activeBtn : ghostBtn,
              "min-w-[40px]",
            )}
          >
            {p}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            <span className="px-1 text-slate-400 select-none">…</span>
            <button
              onClick={() => go(totalPages)}
              className={cn(baseBtn, ghostBtn)}
              aria-label="Go to last page"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(baseBtn, ghostBtn, "w-10")}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className="text-xs text-slate-500">
        Trang{" "}
        <span className="font-semibold text-slate-700">{currentPage}</span> /{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </div>
    </div>
  );
}
