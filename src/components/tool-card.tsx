"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  ExternalLink,
  Monitor,
  FileSearch,
  Database,
  FileSpreadsheet,
  Bot,
  CalendarCheck,
  Plug,
  LayoutDashboard,
  Wrench,
  ArrowUpRight,
  Mail,
  Ticket,
  BookOpen,
  Info,
  Settings,
  type LucideProps,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ToolWithFavorite } from "@/types";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "file-search": FileSearch,
  database: Database,
  "file-spreadsheet": FileSpreadsheet,
  bot: Bot,
  "calendar-check": CalendarCheck,
  plug: Plug,
  "layout-dashboard": LayoutDashboard,
  wrench: Wrench,
  mail: Mail,
  ticket: Ticket,
  "book-open": BookOpen,
  settings: Settings,
};

interface ToolCardProps {
  tool: ToolWithFavorite;
  index: number;
  onToggleFavorite: (toolId: string) => void;
  onLaunch: (tool: ToolWithFavorite) => void;
  onShowInfo: (tool: ToolWithFavorite) => void;
}

export function ToolCard({
  tool,
  index,
  onToggleFavorite,
  onLaunch,
  onShowInfo,
}: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const Icon = iconMap[tool.iconName] || Wrench;
  const accentColor = tool.color || "#FF8300";

  const customIconMap: Record<string, string> = {
    trakaweb: "/trakaweb-logo.png",
    swagger: "/tool-icons/swagger-logo.png",
    confluence: "/tool-icons/confluence-logo.png",
    jira: "/tool-icons/jira-logo.png",
    smtp: "/tool-icons/smtp-logo.png",
    csv: "/tool-icons/csv-logo.png",
    "traka-ai": "/tool-icons/traka-ai-logo.png",
  };
  const customIcon = customIconMap[tool.iconName];

  const handleLaunch = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 300);
    onLaunch(tool);
  }, [tool, onLaunch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={cn(
          "relative rounded-lg overflow-hidden cursor-pointer h-full flex flex-col",
          "bg-panel border border-border-subtle",
          "transition-all duration-200",
          isHovered && "border-border bg-panel-hover",
          isPressed && "scale-[0.98]"
        )}
        onClick={handleLaunch}
      >
        {/* Top accent bar — the "status LED strip" */}
        <div className="h-[2px] w-full relative overflow-hidden">
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0.3,
              scaleX: isHovered ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className="h-full origin-left"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Header row: Icon + type badge + actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon container */}
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isHovered
                    ? `${accentColor}15`
                    : `${accentColor}08`,
                  border: `1px solid ${accentColor}${isHovered ? "25" : "12"}`,
                }}
              >
                {customIcon ? (
                  <Image
                    src={customIcon}
                    alt={tool.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain rounded-sm"
                  />
                ) : (
                  <Icon
                    className="w-5 h-5 transition-colors duration-200"
                    style={{ color: isHovered ? accentColor : "#8892AB" }}
                  />
                )}
              </div>

              {/* Launch type indicator */}
              <span className="text-label text-[10px] flex items-center gap-1">
                {tool.launchType === "WEB" ? (
                  <>
                    <ExternalLink className="w-3 h-3" />
                    WEB
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3" />
                    APP
                  </>
                )}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 -mr-1 -mt-1">
              {/* Info button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowInfo(tool);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  "text-text-ghost hover:text-text-tertiary hover:bg-white/[0.04]"
                )}
                title="More info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(tool.id);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  tool.isFavorite
                    ? "text-traka-orange"
                    : "text-text-ghost hover:text-text-tertiary"
                )}
              >
                <Star
                  className="w-3.5 h-3.5"
                  fill={tool.isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Title + Description */}
          <div className="flex-1">
            <h3
              className={cn(
                "font-display font-semibold text-[15px] leading-tight mb-1.5 transition-colors duration-200",
                isHovered ? "text-text-primary" : "text-text-primary"
              )}
            >
              {tool.name}
            </h3>
            <p className="text-text-secondary text-[13px] leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </div>

          {/* Footer: category + version + launch arrow */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  color: accentColor,
                  backgroundColor: `${accentColor}08`,
                }}
              >
                {tool.category}
              </span>
              {tool.version && (
                <span className="text-text-ghost font-mono text-[10px]">
                  v{tool.version}
                </span>
              )}
            </div>

            <motion.div
              animate={{
                x: isHovered ? 0 : -4,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight
                className="w-4 h-4"
                style={{ color: accentColor }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
