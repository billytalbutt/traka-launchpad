"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import { cn, getInitials, formatDate } from "@/lib/utils";

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">{users.length}</p>
          <p className="text-label text-text-secondary mt-0.5">Total Users</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">
            {users.filter((u) => u.role === "ADMIN").length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Administrators</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">
            {users.filter((u) => u.isActive).length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Active Users</p>
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
                              : "bg-panel-hover text-text-secondary border-border-subtle"
                          )}
                        >
                          {user.role}
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              handleUpdate(user.id, {
                                role:
                                  user.role === "ADMIN" ? "USER" : "ADMIN",
                              })
                            }
                            className="p-1.5 rounded-lg text-text-secondary hover:text-traka-blue hover:bg-traka-blue/[0.06] transition-colors"
                            title={
                              user.role === "ADMIN"
                                ? "Remove admin"
                                : "Make admin"
                            }
                          >
                            {user.role === "ADMIN" ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </button>
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
