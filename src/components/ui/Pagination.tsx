// src/components/ui/Pagination.tsx


"use client";

interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZES = [10, 20, 50, 100];

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];

    if (meta.total_pages <= 7) {
      for (let i = 1; i <= meta.total_pages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (meta.page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, meta.page - 1);
    const end = Math.min(
      meta.total_pages - 1,
      meta.page + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (meta.page < meta.total_pages - 2) {
      pages.push("...");
    }

    pages.push(meta.total_pages);

    return pages;
  };

  return (
    <div
      className="
        flex flex-col gap-4
        md:flex-row md:items-center md:justify-between
      "
    >
      {/* Info */}
      <div className="text-sm text-[#64748B]">
        Showing page{" "}
        <span className="font-medium text-[#0F1F3D]">
          {meta.page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[#0F1F3D]">
          {meta.total_pages}
        </span>{" "}
        ({meta.total} total records)
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Page Size */}
        {onPageSizeChange && (
          <select
            value={meta.page_size}
            onChange={(e) =>
              onPageSizeChange(Number(e.target.value))
            }
            className="
              h-10 rounded-lg border border-[#CBD5E1]
              bg-white px-3 text-sm text-[#0F1F3D]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#1A3260]/20
            "
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            disabled={meta.page === 1}
            onClick={() =>
              onPageChange(meta.page - 1)
            }
            className="
              rounded-lg border border-[#CBD5E1]
              px-3 py-2 text-sm
              transition-colors

              hover:bg-[#F8FAFC]

              disabled:pointer-events-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Prev
          </button>

          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-[#94A3B8]"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                aria-current={
                  page === meta.page
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onPageChange(page)
                }
                className={`
                  rounded-lg border px-3 py-2 text-sm
                  transition-colors

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#1A3260]/20

                  ${
                    page === meta.page
                      ? `
                        border-[#0F1F3D]
                        bg-[#0F1F3D]
                        text-white
                      `
                      : `
                        border-[#CBD5E1]
                        hover:bg-[#F8FAFC]
                        text-[#0F1F3D]
                      `
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={
              meta.page === meta.total_pages
            }
            onClick={() =>
              onPageChange(meta.page + 1)
            }
            className="
              rounded-lg border border-[#CBD5E1]
              px-3 py-2 text-sm
              transition-colors

              hover:bg-[#F8FAFC]

              disabled:pointer-events-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}