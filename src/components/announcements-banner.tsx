"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  author: { name: string | null };
}

const typeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    bg: string;
    border: string;
  }
> = {
  INFO: {
    icon: Info,
    accent: "text-traka-blue",
    bg: "bg-traka-blue/[0.04]",
    border: "border-traka-blue/10",
  },
  WARNING: {
    icon: AlertTriangle,
    accent: "text-amber-400",
    bg: "bg-amber-500/[0.04]",
    border: "border-amber-500/10",
  },
  UPDATE: {
    icon: Sparkles,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/[0.04]",
    border: "border-emerald-500/10",
  },
  NEW: {
    icon: Sparkles,
    accent: "text-traka-orange",
    bg: "bg-traka-orange/[0.04]",
    border: "border-traka-orange/10",
  },
};

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-8">
      <AnimatePresence>
        {visible.map((announcement) => {
          const config = typeConfig[announcement.type] || typeConfig.INFO;
          const IconComponent = config.icon;

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "rounded-lg border p-4 flex items-start gap-3",
                config.bg,
                config.border
              )}
            >
              <IconComponent
                className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.accent)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm">
                  {announcement.title}
                </p>
                <p className="text-text-secondary text-[13px] mt-0.5">
                  {announcement.content}
                </p>
              </div>
              <button
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(announcement.id))
                }
                className="p-1 rounded text-text-ghost hover:text-text-secondary transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
