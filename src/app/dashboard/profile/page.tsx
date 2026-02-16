"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Shield, Activity, Star, Rocket } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { ToolWithFavorite } from "@/types";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<ToolWithFavorite[]>([]);
  const [stats, setStats] = useState({ totalLaunches: 0, favoriteCount: 0 });

  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((data: ToolWithFavorite[]) => {
        setTools(data);
        setStats({
          totalLaunches: data.reduce((sum, t) => sum + (t.launchCount || 0), 0),
          favoriteCount: data.filter((t) => t.isFavorite).length,
        });
      })
      .catch(() => {});
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative z-10 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label mb-3">Account</p>
        <h1 className="text-display-sm text-2xl text-text-primary">Profile</h1>
      </motion.div>

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel rounded-lg p-6 mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-traka-orange flex items-center justify-center">
            <span className="text-lg font-display font-bold text-white">
              {getInitials(session.user.name)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              {session.user.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-text-secondary text-sm">
                <Mail className="w-3 h-3" />
                {session.user.email}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-traka-orange">
                <Shield className="w-3 h-3" />
                {session.user.role?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            icon: Rocket,
            value: stats.totalLaunches,
            label: "Launches",
            color: "text-traka-orange",
          },
          {
            icon: Star,
            value: stats.favoriteCount,
            label: "Favorites",
            color: "text-traka-orange",
          },
          {
            icon: Activity,
            value: tools.length,
            label: "Available",
            color: "text-emerald-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="panel rounded-lg p-4 text-center"
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-2`} />
            <p className="text-xl font-display font-bold text-text-primary">
              {stat.value}
            </p>
            <p className="text-label text-[10px] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pinned tools list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-3.5 h-3.5 text-traka-orange" />
          <span className="text-label text-[10px]">Pinned Tools</span>
        </div>
        {tools.filter((t) => t.isFavorite).length === 0 ? (
          <p className="text-text-ghost text-sm">
            No favorites yet. Star tools from the launchpad.
          </p>
        ) : (
          <div className="space-y-1">
            {tools
              .filter((t) => t.isFavorite)
              .map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-panel-hover transition-colors"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: tool.color || "#0071E3",
                      boxShadow: `0 0 4px ${tool.color || "#0071E3"}40`,
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{tool.name}</p>
                  </div>
                  <span className="text-label text-[10px]">
                    {tool.category}
                  </span>
                </div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
