// src/components/layout/PageHeader.tsx

import { ReactNode } from "react";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <div
      className="
        mb-6 flex flex-col gap-4
        border-b border-[#E2E8F0]
        pb-5

        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div className="min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="
              mb-2 flex flex-wrap
              items-center gap-1
              text-sm text-[#94A3B8]
            "
          >
            {breadcrumbs.map((item, index) => {
              const isLast =
                index === breadcrumbs.length - 1;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="
                    flex items-center gap-1
                  "
                >
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="
                        transition-colors

                        hover:text-[#0F1F3D]

                        focus-visible:outline-none
                        focus-visible:text-[#0F1F3D]
                      "
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={
                        isLast
                          ? "page"
                          : undefined
                      }
                      className={
                        isLast
                          ? "text-[#475569]"
                          : undefined
                      }
                    >
                      {item.label}
                    </span>
                  )}

                  {!isLast && (
                    <ChevronRight
                      className="
                        h-4 w-4
                        text-[#CBD5E1]
                      "
                    />
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Title */}
        <h1
          className="
            break-words
            font-['Syne']
            text-2xl font-bold
            text-[#0F1F3D]
          "
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            className="
              mt-1 text-sm
              text-[#64748B]
            "
          >
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div
          className="
            flex flex-wrap
            items-center gap-3
          "
        >
          {actions}
        </div>
      )}
    </div>
  );
}