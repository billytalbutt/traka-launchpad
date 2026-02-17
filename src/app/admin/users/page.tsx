"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, ChevronDown, ShieldCheck, Monitor, ChevronRight, Check, Eye, EyeOff } from "lucide-react";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/types";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  launchCount: number;
  rdpHost: string | null;
  rdpUsername: string | null;
  rdpPasswordSet: boolean;
}

interface RdpEditState {
  host: string;
  username: string;
  password: string;
  showPassword: boolean;
  saving: boolean;
  saved: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [rdpEdit, setRdpEdit] = useState<RdpEditState>({
    host: "",
    username: "",
    password: "",
    showPassword: false,
    saving: false,
    saved: false,
  });

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
    update: { role?: string; isActive?: boolean; isApproved?: boolean }
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

  const toggleRdpPanel = (user: UserData) => {
    if (expandedUserId === user.id) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(user.id);
      setRdpEdit({
        host: user.rdpHost || "",
        username: user.rdpUsername || "",
        password: "",
        showPassword: false,
        saving: false,
        saved: false,
      });
    }
  };

  const saveRdpForUser = async (userId: string) => {
    setRdpEdit((prev) => ({ ...prev, saving: true }));
    const payload: Record<string, string> = {
      rdpHost: rdpEdit.host,
      rdpUsername: rdpEdit.username,
    };
    if (rdpEdit.password) {
      payload.rdpPassword = rdpEdit.password;
    }

    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setRdpEdit((prev) => ({ ...prev, saving: false, saved: true, password: "" }));
      setTimeout(() => setRdpEdit((prev) => ({ ...prev, saved: false })), 2000);
      fetchUsers();
    } else {
      setRdpEdit((prev) => ({ ...prev, saving: false }));
      alert("Failed to save RDP config");
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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-8">
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">{users.length}</p>
          <p className="text-label text-text-secondary mt-0.5">Total Users</p>
        </div>
        <div className="panel rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-400">
            {users.filter((u) => !u.isApproved).length}
          </p>
          <p className="text-label text-text-secondary mt-0.5">Pending Approval</p>
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
                        <div className="flex items-center gap-2">
                          {!user.isApproved ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/[0.06] text-amber-400 border border-amber-500/20">
                              Pending Approval
                            </span>
                          ) : (
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
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {!user.isApproved && (
                            <button
                              onClick={() =>
                                handleUpdate(user.id, { isApproved: true })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/[0.15] transition-colors"
                              title="Approve user"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => toggleRdpPanel(user)}
                            className={cn(
                              "flex items-center gap-1 p-1.5 rounded-lg transition-colors text-xs",
                              expandedUserId === user.id
                                ? "text-purple-400 bg-purple-500/[0.08]"
                                : user.rdpHost
                                ? "text-purple-400/60 hover:text-purple-400 hover:bg-purple-500/[0.04]"
                                : "text-text-ghost hover:text-text-secondary hover:bg-white/[0.02]"
                            )}
                            title="Configure RDP"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <ChevronRight
                              className={cn(
                                "w-3 h-3 transition-transform",
                                expandedUserId === user.id && "rotate-90"
                              )}
                            />
                          </button>
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
                    {/* Expandable RDP config row */}
                    {expandedUserId === user.id && (
                      <tr className="bg-purple-500/[0.02]">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Monitor className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-medium text-purple-400">
                              RDP Configuration for {user.name || user.email}
                            </span>
                            {user.rdpPasswordSet && (
                              <span className="text-[10px] text-emerald-400 ml-1">
                                (password saved)
                              </span>
                            )}
                          </div>
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="text-[10px] text-text-ghost uppercase tracking-wider mb-1 block">
                                Hostname / IP
                              </label>
                              <input
                                type="text"
                                value={rdpEdit.host}
                                onChange={(e) =>
                                  setRdpEdit((prev) => ({
                                    ...prev,
                                    host: e.target.value,
                                  }))
                                }
                                placeholder="vm-hostname.corp.local"
                                className="w-full px-3 py-1.5 rounded-lg input-field text-xs font-mono"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-text-ghost uppercase tracking-wider mb-1 block">
                                Username
                              </label>
                              <input
                                type="text"
                                value={rdpEdit.username}
                                onChange={(e) =>
                                  setRdpEdit((prev) => ({
                                    ...prev,
                                    username: e.target.value,
                                  }))
                                }
                                placeholder="DOMAIN\username"
                                className="w-full px-3 py-1.5 rounded-lg input-field text-xs font-mono"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-text-ghost uppercase tracking-wider mb-1 block">
                                Password
                              </label>
                              <div className="relative">
                                <input
                                  type={rdpEdit.showPassword ? "text" : "password"}
                                  value={rdpEdit.password}
                                  onChange={(e) =>
                                    setRdpEdit((prev) => ({
                                      ...prev,
                                      password: e.target.value,
                                    }))
                                  }
                                  placeholder={
                                    user.rdpPasswordSet
                                      ? "Leave blank to keep"
                                      : "Password"
                                  }
                                  className="w-full px-3 py-1.5 pr-8 rounded-lg input-field text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRdpEdit((prev) => ({
                                      ...prev,
                                      showPassword: !prev.showPassword,
                                    }))
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-secondary transition-colors"
                                >
                                  {rdpEdit.showPassword ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => saveRdpForUser(user.id)}
                              disabled={rdpEdit.saving}
                              className="px-4 py-1.5 rounded-lg bg-purple-500/[0.1] border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/[0.2] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {rdpEdit.saved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Saved
                                </>
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
