"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutGrid,
  Star,
  User,
  BarChart3,
  Wrench,
  Users,
  Megaphone,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ROLE_LABELS, type UserRole } from "@/types";

const mainNav = [
  { href: "/dashboard", icon: LayoutGrid, label: "Launchpad" },
  { href: "/dashboard/favorites", icon: Star, label: "Favorites" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

const adminNav = [
  { href: "/admin/tools", icon: Wrench, label: "Manage Tools" },
  { href: "/admin/users", icon: Users, label: "Manage Users" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/services", icon: Server, label: "Services" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => {
    const isActive =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all relative group",
          isActive
            ? "bg-traka-orange/[0.06]"
            : "hover:bg-panel-hover"
        )}
      >
        {/* Active indicator — left bar */}
        <div
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r transition-all",
            isActive
              ? "h-4 bg-traka-orange shadow-[0_0_6px_rgba(255,131,0,0.3)]"
              : "h-0 bg-transparent"
          )}
        />
        <Icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0 transition-colors",
            isActive ? "text-traka-orange" : "text-text-tertiary group-hover:text-traka-orange/70"
          )}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "text-[13px] whitespace-nowrap transition-colors",
                isActive
                  ? "font-medium text-text-primary"
                  : "font-normal text-text-secondary group-hover:text-text-primary"
              )}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-panel border-r border-border-subtle"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 h-11 border-b border-border-subtle overflow-hidden">
        <Image
          src="/launchpad-rocket-logo.png"
          alt="Launchpad"
          width={28}
          height={28}
          className="w-7 h-7 rounded-md flex-shrink-0"
        />
        <AnimatePresence mode="wait">
          {collapsed ? null : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col justify-center min-w-0 leading-none"
            >
              <Image
                src="/traka-mark.svg"
                alt="Traka"
                width={68}
                height={16}
                className="h-4 w-auto flex-shrink-0"
              />
              <span className="font-display font-semibold text-[9px] text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap mt-[1px]">
                Launchpad
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div className="mb-1">
          {!collapsed && (
            <p className="text-label px-3 mb-2 text-[10px]">Navigate</p>
          )}
        </div>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              {!collapsed ? (
                <p className="text-label text-[10px]">Admin</p>
              ) : (
                <div className="h-px bg-border-subtle mx-1" />
              )}
            </div>
            {adminNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border-subtle p-2 space-y-1">
        {/* User */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-md bg-panel-raised border border-border-subtle flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-mono font-medium text-traka-orange">
              {getInitials(session?.user?.name)}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-text-primary truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-text-ghost font-mono truncate">
                  {ROLE_LABELS[session?.user?.role as UserRole] || session?.user?.role?.toLowerCase()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/5 transition-colors flex-1 text-xs"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-panel-hover transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
