"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Info,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

const typeOptions = [
  { value: "INFO", label: "Info", icon: Info, color: "text-traka-blue" },
  {
    value: "WARNING",
    label: "Warning",
    icon: AlertTriangle,
    color: "text-amber-400",
  },
  {
    value: "UPDATE",
    label: "Update",
    icon: Sparkles,
    color: "text-emerald-400",
  },
  {
    value: "NEW",
    label: "New Feature",
    icon: Sparkles,
    color: "text-traka-orange",
  },
];

const emptyAnnouncement = {
  title: "",
  content: "",
  type: "INFO",
  expiresAt: "",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof emptyAnnouncement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/announcements");
    if (res.ok) {
      setAnnouncements(await res.json());
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editing) return;

    const url = editingId
      ? `/api/announcements/${editingId}`
      : "/api/announcements";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editing,
        expiresAt: editing.expiresAt || null,
      }),
    });

    if (res.ok) {
      setEditing(null);
      setEditingId(null);
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAnnouncements();
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    await fetch(`/api/announcements/${announcement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !announcement.isActive }),
    });
    fetchAnnouncements();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-traka-blue" />
            <h1 className="text-display-sm text-2xl text-text-primary">Announcements</h1>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            Manage announcements shown on the dashboard
          </p>
        </motion.div>

        <button
          onClick={() => {
            setEditing({ ...emptyAnnouncement });
            setEditingId(null);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-panel animate-pulse"
              />
            ))
          : announcements.map((announcement, i) => {
              const typeInfo =
                typeOptions.find((t) => t.value === announcement.type) ||
                typeOptions[0];
              const TypeIcon = typeInfo.icon;

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "panel rounded-lg p-4",
                    !announcement.isActive && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <TypeIcon
                      className={cn("w-5 h-5 mt-0.5", typeInfo.color)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-text-primary">
                          {announcement.title}
                        </h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            announcement.isActive
                              ? "bg-emerald-500/[0.04] text-emerald-400"
                              : "bg-panel-hover text-text-tertiary"
                          )}
                        >
                          {announcement.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                        <span>By {announcement.author?.name || "Admin"}</span>
                        <span>{formatDate(announcement.createdAt)}</span>
                        {announcement.expiresAt && (
                          <span>
                            Expires {formatDate(announcement.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-xs transition-colors",
                          announcement.isActive
                            ? "text-text-secondary hover:text-amber-400 hover:bg-amber-500/[0.04]"
                            : "text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/[0.04]"
                        )}
                      >
                        {announcement.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setEditing({
                            title: announcement.title,
                            content: announcement.content,
                            type: announcement.type,
                            expiresAt: announcement.expiresAt
                              ? announcement.expiresAt.split("T")[0]
                              : "",
                          });
                          setEditingId(announcement.id);
                        }}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-traka-blue hover:bg-traka-blue/[0.06] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/[0.04] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
              setEditingId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-display-sm text-lg text-text-primary">
                  {editingId ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button
                  onClick={() => {
                    setEditing(null);
                    setEditingId(null);
                  }}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-hover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Title
                  </label>
                  <input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-label text-text-secondary mb-1">
                    Content
                  </label>
                  <textarea
                    value={editing.content}
                    onChange={(e) =>
                      setEditing({ ...editing, content: e.target.value })
                    }
                    rows={3}
                    className="input-field w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Type
                    </label>
                    <select
                      value={editing.type}
                      onChange={(e) =>
                        setEditing({ ...editing, type: e.target.value })
                      }
                      className="input-field w-full"
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label text-text-secondary mb-1">
                      Expires At
                    </label>
                    <input
                      type="date"
                      value={editing.expiresAt || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, expiresAt: e.target.value })
                      }
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
                <button
                  onClick={() => {
                    setEditing(null);
                    setEditingId(null);
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
                  {editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
