"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import type { ToolWithFavorite } from "@/types";

export default function FavoritesPage() {
  const [tools, setTools] = useState<ToolWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);

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
    await fetch(`/api/tools/${tool.id}/launch`, { method: "POST" });

    if (tool.launchType === "WEB" && tool.launchUrl) {
      window.open(tool.launchUrl, "_blank", "noopener,noreferrer");
    } else if (tool.launchType === "DESKTOP") {
      alert(
        `${tool.name} is a desktop application.\n\nPlease ensure it is installed on your machine.`
      );
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
