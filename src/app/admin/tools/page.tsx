"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ExternalLink,
  Monitor,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/types";

interface Tool {
  id: string;
  name: string;
  description: string;
  iconName: string;
  launchUrl: string | null;
  launchType: string;
  category: string;
  version: string | null;
  isActive: boolean;
  sortOrder: number;
  color: string | null;
  allowedRoles: string | null;
  helpText: string | null;
}

const emptyTool: Omit<Tool, "id"> = {
  name: "",
  description: "",
  iconName: "wrench",
  launchUrl: "",
  launchType: "WEB",
  category: "General",
  version: "1.0.0",
  isActive: true,
  sortOrder: 0,
  color: "#0078D4",
  allowedRoles: null,
  helpText: null,
};

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const res = await fetch("/api/tools");
    if (res.ok) {
      setTools(await res.json());
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editing) return;

    const url = isNew ? "/api/tools" : `/api/tools/${editing.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    if (res.ok) {
      setEditing(null);
      setIsNew(false);
      fetchTools();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTools();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-traka-blue" />
            <h1 className="text-display-sm text-2xl text-text-primary">Manage Tools</h1>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            Add, edit, or remove tools from the launchpad
          </p>
        </motion.div>

        <button
          onClick={() => {
            setEditing({ id: "", ...emptyTool });
            setIsNew(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-panel animate-pulse"
              />
            ))
          : tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="panel rounded-lg p-4 flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${tool.color || "#0078D4"}15`,
                    border: `1px solid ${tool.color || "#0078D4"}30`,
                  }}
                >
                  {tool.launchType === "WEB" ? (
                    <ExternalLink
                      className="w-5 h-5"
                      style={{ color: tool.color || "#0078D4" }}
                    />
                  ) : (
                    <Monitor
                      className="w-5 h-5"
                      style={{ color: tool.color || "#0078D4" }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{tool.name}</h3>
                    {!tool.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/[0.04] text-red-400 border border-border-subtle">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary truncate">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-text-tertiary">
                  <span className="hidden sm:inline">{tool.category}</span>
                  {tool.version && <span className="hidden sm:inline">v{tool.version}</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-panel border border-border-subtle">
                    {tool.launchType}
                  </span>
                  {tool.allowedRoles && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-traka-blue/[0.06] text-traka-blue border border-traka-blue/20 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span className="hidden lg:inline">Restricted</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(tool);
                      setIsNew(false);
                    }}
                    className="p-2 rounded-lg text-text-secondary hover:text-traka-blue hover:bg-traka-blue/[0.06] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tool.id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/[0.04] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setEditing(null);
              setIsNew(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-display-sm text-lg text-text-primary">
                  {isNew ? "Add New Tool" : "Edit Tool"}
                </h2>
                <button
                  onClick={() => {
                    setEditing(null);
                    setIsNew(false);
                  }}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Name
                  </label>
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="input-field w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Info Panel Text
                  </label>
                  <p className="text-[11px] text-text-ghost mb-2">
                    Extended help text shown when users click the info button. Use blank lines to separate sections. Lines ending with &quot;:&quot; become headings. Start lines with &quot;•&quot; for bullet points.
                  </p>
                  <textarea
                    value={editing.helpText || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, helpText: e.target.value || null })
                    }
                    rows={6}
                    placeholder={"How to access:\nOpen in your browser at...\n\nWhat it does:\n• Feature one\n• Feature two\n\nContact:\nReach out to the App Support team."}
                    className="input-field w-full resize-none placeholder:text-text-ghost font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Category
                    </label>
                    <input
                      value={editing.category}
                      onChange={(e) =>
                        setEditing({ ...editing, category: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Version
                    </label>
                    <input
                      value={editing.version || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, version: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Launch URL
                  </label>
                  <input
                    value={editing.launchUrl || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, launchUrl: e.target.value })
                    }
                    placeholder="http://localhost:5173"
                    className="input-field w-full placeholder:text-text-ghost"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Launch Type
                    </label>
                    <select
                      value={editing.launchType}
                      onChange={(e) =>
                        setEditing({ ...editing, launchType: e.target.value })
                      }
                      className="input-field w-full"
                    >
                      <option value="WEB">Web</option>
                      <option value="DESKTOP">Desktop</option>
                      <option value="PROTOCOL">Protocol Handler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Icon Name
                    </label>
                    <input
                      value={editing.iconName}
                      onChange={(e) =>
                        setEditing({ ...editing, iconName: e.target.value })
                      }
                      placeholder="wrench"
                      className="input-field w-full placeholder:text-text-ghost"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editing.color || "#0078D4"}
                        onChange={(e) =>
                          setEditing({ ...editing, color: e.target.value })
                        }
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                      />
                      <input
                        value={editing.color || "#0078D4"}
                        onChange={(e) =>
                          setEditing({ ...editing, color: e.target.value })
                        }
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={editing.sortOrder}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input-field w-full"
                    />
                  </div>
                </div>

                {/* Role Access */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-traka-blue" />
                    <label className="text-label text-text-secondary">
                      Role Access
                    </label>
                  </div>
                  <p className="text-[11px] text-text-ghost mb-3">
                    Select which roles can access this tool. Leave all unchecked for universal access.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_ROLES.filter((r) => r !== "ADMIN").map((role) => {
                      const currentRoles = editing.allowedRoles
                        ? editing.allowedRoles.split(",").map((r) => r.trim())
                        : [];
                      const isChecked = currentRoles.includes(role);

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            let newRoles: string[];
                            if (isChecked) {
                              newRoles = currentRoles.filter((r) => r !== role);
                            } else {
                              newRoles = [...currentRoles, role];
                            }
                            setEditing({
                              ...editing,
                              allowedRoles: newRoles.length > 0 ? newRoles.join(",") : null,
                            });
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all text-left",
                            isChecked
                              ? "border-traka-blue/30 bg-traka-blue/[0.06] text-traka-blue"
                              : "border-border-subtle bg-panel text-text-secondary hover:border-border"
                          )}
                        >
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                              isChecked
                                ? "bg-traka-blue border-traka-blue"
                                : "border-border bg-transparent"
                            )}
                          >
                            {isChecked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {ROLE_LABELS[role as UserRole]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-label text-text-secondary">
                    Active
                  </label>
                  <button
                    onClick={() =>
                      setEditing({ ...editing, isActive: !editing.isActive })
                    }
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      editing.isActive ? "bg-traka-blue" : "bg-panel-hover"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                        editing.isActive ? "translate-x-5" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
                <button
                  onClick={() => {
                    setEditing(null);
                    setIsNew(false);
                  }}
                  className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-hover transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isNew ? "Create Tool" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
