"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, ChevronDown } from "lucide-react";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/types";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  launchCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  };

  const handleUpdate = async (
    userId: string,
    update: { role?: string; isActive?: boolean }
  ) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });

    if (res.ok) {
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update user");
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-traka-blue" />
          <h1 className="text-display-sm text-2xl text-text-primary">Manage Users</h1>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          View and manage user accounts and roles
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">{users.length}</p>
          <p className="text-label text-text-secondary mt-0.5">Total Users</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-traka-orange">
            {users.filter((u) => u.role === "ADMIN").length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Admins</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {users.filter((u) => u.role === "APP_SUPPORT").length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">App Support</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-traka-blue">
            {users.filter((u) => u.role === "EU_TECH_SUPPORT" || u.role === "UK_TECH_SUPPORT").length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Tech Support</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">
            {users.filter((u) => u.isActive).length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Active</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="panel rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-4 text-label text-text-secondary font-medium">
                  User
                </th>
                <th className="text-left py-3 px-4 text-label text-text-secondary font-medium">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-label text-text-secondary font-medium hidden sm:table-cell">
                  Launches
                </th>
                <th className="text-left py-3 px-4 text-label text-text-secondary font-medium hidden sm:table-cell">
                  Joined
                </th>
                <th className="text-left py-3 px-4 text-label text-text-secondary font-medium">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-label text-text-secondary font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="py-3 px-4">
                        <div className="h-8 bg-panel rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border-subtle hover:bg-panel-hover transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-traka-blue/[0.12] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-traka-blue">
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">
                              {user.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border",
                            user.role === "ADMIN"
                              ? "bg-traka-orange/[0.06] text-traka-orange border-border-subtle"
                              : user.role === "APP_SUPPORT"
                              ? "bg-emerald-500/[0.06] text-emerald-400 border-border-subtle"
                              : user.role === "EU_TECH_SUPPORT"
                              ? "bg-traka-blue/[0.06] text-traka-blue border-border-subtle"
                              : "bg-purple-500/[0.06] text-purple-400 border-border-subtle"
                          )}
                        >
                          {ROLE_LABELS[user.role as UserRole] || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">
                        {user.launchCount}
                      </td>
                      <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            user.isActive
                              ? "bg-emerald-500/[0.04] text-emerald-400"
                              : "bg-red-500/[0.04] text-red-400"
                          )}
                        >
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleUpdate(user.id, { role: e.target.value })
                              }
                              className="appearance-none text-xs px-2.5 py-1.5 pr-7 rounded-lg bg-panel border border-border-subtle text-text-secondary hover:border-border transition-colors cursor-pointer focus:outline-none focus:border-traka-blue"
                            >
                              {ALL_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {ROLE_LABELS[role]}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-text-ghost pointer-events-none" />
                          </div>
                          <button
                            onClick={() =>
                              handleUpdate(user.id, {
                                isActive: !user.isActive,
                              })
                            }
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              user.isActive
                                ? "text-text-secondary hover:text-red-400 hover:bg-red-500/[0.04]"
                                : "text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/[0.04]"
                            )}
                            title={
                              user.isActive
                                ? "Disable account"
                                : "Enable account"
                            }
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
