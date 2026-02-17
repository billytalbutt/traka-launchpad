"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { ToolInfoModal } from "@/components/tool-info-modal";
import type { ToolWithFavorite } from "@/types";

export default function FavoritesPage() {
  const [tools, setTools] = useState<ToolWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoTool, setInfoTool] = useState<ToolWithFavorite | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data.filter((t: ToolWithFavorite) => t.isFavorite));
      }
    } catch (err) {
      console.error("Failed to fetch tools:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (toolId: string) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId }),
    });

    if (res.ok) {
      const { isFavorite } = await res.json();
      if (!isFavorite) {
        setTools((prev) => prev.filter((t) => t.id !== toolId));
      }
    }
  };

  const handleLaunch = async (tool: ToolWithFavorite) => {
    const res = await fetch(`/api/tools/${tool.id}/launch`, { method: "POST" });
    const data = await res.json();

    if (tool.launchType === "WEB") {
      const url = data.launchUrl || tool.launchUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } else if (tool.launchType === "DESKTOP") {
      if (data.desktopStatus === "launched") {
        // Tool launched successfully
      } else if (data.desktopStatus === "not_found") {
        alert(
          `${tool.name} was not found at the expected location.\n\n${data.error}\n\nPlease ensure it is installed or contact your administrator.`
        );
      } else if (data.desktopStatus === "error") {
        alert(
          `Failed to launch ${tool.name}.\n\n${data.error}\n\nPlease try launching it manually.`
        );
      } else {
        alert(
          `${tool.name} is a desktop application. No launch path is configured.\n\nContact your administrator to set up the launch path.`
        );
      }
    } else if (tool.launchType === "PROTOCOL" && tool.launchUrl) {
      window.location.href = tool.launchUrl;
    }
  };

  return (
    <div className="relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-3.5 h-3.5 text-traka-orange" />
          <span className="text-label text-[10px]">Favorites</span>
        </div>
        <h1 className="text-display-sm text-2xl text-text-primary">
          Pinned Tools
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Your frequently used tools for quick access
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg bg-panel border border-border-subtle animate-pulse"
            />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-8 h-8 text-text-ghost mx-auto mb-3" />
          <p className="text-text-secondary text-sm font-medium">
            No favorites yet
          </p>
          <p className="text-text-ghost text-xs mt-1">
            Click the star on any tool to pin it here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={i}
              onToggleFavorite={handleToggleFavorite}
              onLaunch={handleLaunch}
              onShowInfo={setInfoTool}
            />
          ))}
        </div>
      )}

      {/* Tool Info Modal */}
      <ToolInfoModal
        tool={infoTool}
        onClose={() => setInfoTool(null)}
        onLaunch={handleLaunch}
      />
    </div>
  );
}
