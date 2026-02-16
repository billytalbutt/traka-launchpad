"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Star, Rocket, Activity } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { SearchBar } from "@/components/search-bar";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import type { ToolWithFavorite } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<ToolWithFavorite[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data);
      }
    } catch (err) {
      console.error("Failed to fetch tools:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        !search ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [tools, search, category]);

  const favoriteTools = tools.filter((t) => t.isFavorite);

  const handleToggleFavorite = async (toolId: string) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId }),
    });

    if (res.ok) {
      const { isFavorite } = await res.json();
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, isFavorite } : t))
      );
    }
  };

  const handleLaunch = async (tool: ToolWithFavorite) => {
    await fetch(`/api/tools/${tool.id}/launch`, { method: "POST" });

    if (tool.launchType === "WEB" && tool.launchUrl) {
      window.open(tool.launchUrl, "_blank", "noopener,noreferrer");
    } else if (tool.launchType === "DESKTOP") {
      alert(
        `${tool.name} is a desktop application.\n\nPlease ensure it is installed on your machine. If you need the installer, contact your administrator.`
      );
    } else if (tool.launchType === "PROTOCOL" && tool.launchUrl) {
      window.location.href = tool.launchUrl;
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative z-10">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="text-label mb-3">{greeting}</p>
        <h1 className="text-display-lg text-3xl lg:text-4xl text-text-primary">
          {firstName}
          <span className="text-text-ghost">.</span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-text-secondary text-sm">
            {tools.length} tools available
          </span>
          <span className="w-px h-3 bg-border-subtle" />
          <span className="flex items-center gap-1.5 text-text-secondary text-sm">
            <Activity className="w-3 h-3 text-traka-orange" />
            {tools.reduce((sum, t) => sum + (t.launchCount || 0), 0)} total
            launches
          </span>
        </div>
      </motion.div>

      {/* Announcements */}
      <AnnouncementsBanner />

      {/* Quick access favorites — horizontal strip */}
      {favoriteTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-3.5 h-3.5 text-traka-orange" />
            <span className="text-label text-[10px]">Pinned</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favoriteTools.slice(0, 4).map((tool, i) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={i}
                onToggleFavorite={handleToggleFavorite}
                onLaunch={handleLaunch}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Toolbar — search + category filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />

        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-all ${
                category === cat
                  ? "bg-traka-orange/15 text-traka-orange border border-traka-orange/25"
                  : "text-text-secondary bg-panel/80 border border-border hover:text-text-primary hover:border-border-active"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tools grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-lg bg-panel border border-border-subtle animate-pulse"
              />
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <Rocket className="w-8 h-8 text-text-ghost mx-auto mb-3" />
            <p className="text-text-secondary text-sm font-medium">
              No tools found
            </p>
            <p className="text-text-ghost text-xs mt-1">
              {search
                ? "Try a different search term"
                : "No tools match the selected filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTools.map((tool, i) => (
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
      </motion.div>
    </div>
  );
}
