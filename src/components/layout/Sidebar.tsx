// src/components/layout/Sidebar.tsx


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  Settings,
  Map,
  Percent,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "SALES_REP";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    roles: ["ADMIN", "MANAGER", "SALES_REP"],
    icon: LayoutDashboard,
  },
  {
    label: "Dealers",
    href: "/dealers",
    roles: ["ADMIN", "MANAGER", "SALES_REP"],
    icon: Users,
  },
  {
    label: "Products",
    href: "/products",
    roles: ["ADMIN", "MANAGER", "SALES_REP"],
    icon: Package,
  },
  {
    label: "Quotes",
    href: "/quotes",
    roles: ["ADMIN", "MANAGER", "SALES_REP"],
    icon: FileText,
  },
  {
    label: "Orders",
    href: "/orders",
    roles: ["ADMIN", "MANAGER", "SALES_REP"],
    icon: ShoppingCart,
  },
  {
    label: "Schemes",
    href: "/schemes",
    roles: ["ADMIN", "MANAGER"],
    icon: Percent,
  },
  {
    label: "Users",
    href: "/settings/users",
    roles: ["ADMIN"],
    icon: Settings,
  },
  {
    label: "Territories",
    href: "/settings/territories",
    roles: ["ADMIN"],
    icon: Map,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const { role } = useAuth();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filteredItems = navItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  const mainItems = filteredItems.filter(
    (item) =>
      !item.href.startsWith("/settings")
  );

  const settingsItems = filteredItems.filter(
    (item) =>
      item.href.startsWith("/settings")
  );

  return (
    <>
      {/* Mobile Trigger */}
      <button
        type="button"
        aria-label="Open sidebar"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="
          fixed left-4 top-4 z-50
          rounded-lg bg-[#0F1F3D]
          p-2 text-white shadow-lg

          transition-colors
          hover:bg-[#1A3260]

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#0F1F3D]/20

          md:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/40 backdrop-blur-[1px]
            md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-[260px] min-w-[260px]

          bg-[#0F1F3D] text-white
          transition-transform duration-300

          md:static md:translate-x-0

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            border-b border-white/10
            px-6 py-5
          "
        >
          <div>
            <h1
              className="
                font-['Syne']
                text-xl font-bold
              "
            >
              SupplySetu
            </h1>

            <p className="mt-1 text-xs text-white/60">
              Wholesale Management
            </p>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="
              rounded-md p-1
              transition-colors
              hover:bg-white/10

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/20

              md:hidden
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4">
          {/* Main */}
          <div className="space-y-2">
            {mainItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-sm font-medium
                    transition-all

                    ${
                      active
                        ? `
                          bg-[#1A3260]
                          text-white
                          shadow-sm
                        `
                        : `
                          text-white/70
                          hover:bg-white/10
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Settings */}
          {settingsItems.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p
                className="
                  mb-3 px-4 text-[10px]
                  font-semibold uppercase
                  tracking-[0.12em]
                  text-white/40
                "
              >
                Settings
              </p>

              <div className="space-y-2">
                {settingsItems.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      onClick={() =>
                        setOpen(false)
                      }
                      className={`
                        flex items-center gap-3
                        rounded-xl px-4 py-3
                        text-sm font-medium
                        transition-all

                        ${
                          active
                            ? `
                              bg-[#1A3260]
                              text-white
                              shadow-sm
                            `
                            : `
                              text-white/70
                              hover:bg-white/10
                              hover:text-white
                            `
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />

                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}