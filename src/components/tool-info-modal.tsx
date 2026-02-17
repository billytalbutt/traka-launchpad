"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Monitor,
  ArrowUpRight,
  Mail,
  FileSearch,
  Database,
  FileSpreadsheet,
  Bot,
  CalendarCheck,
  Plug,
  Wrench,
  Ticket,
  BookOpen,
  Settings,
  type LucideProps,
} from "lucide-react";
import Image from "next/image";
import type { ToolWithFavorite } from "@/types";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "file-search": FileSearch,
  database: Database,
  "file-spreadsheet": FileSpreadsheet,
  bot: Bot,
  "calendar-check": CalendarCheck,
  plug: Plug,
  "layout-dashboard": Wrench,
  wrench: Wrench,
  mail: Mail,
  ticket: Ticket,
  "book-open": BookOpen,
  settings: Settings,
};

interface ToolInfoModalProps {
  tool: ToolWithFavorite | null;
  onClose: () => void;
  onLaunch: (tool: ToolWithFavorite) => void;
}

export function ToolInfoModal({ tool, onClose, onLaunch }: ToolInfoModalProps) {
  if (!tool) return null;

  const Icon = iconMap[tool.iconName] || Wrench;
  const accentColor = tool.color || "#FF8300";
  const isTrakaWEB = tool.iconName === "trakaweb";

  const helpSections = tool.helpText
    ? tool.helpText.split("\n\n").map((section) => {
        const lines = section.split("\n");
        const isHeading =
          lines[0].endsWith(":") && !lines[0].startsWith("•");
        return { heading: isHeading ? lines[0].replace(/:$/, "") : null, content: isHeading ? lines.slice(1) : lines };
      })
    : [];

  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="panel rounded-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header with accent */}
            <div className="relative">
              <div
                className="h-1 w-full"
                style={{ backgroundColor: accentColor }}
              />
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${accentColor}12`,
                        border: `1px solid ${accentColor}25`,
                      }}
                    >
                      {isTrakaWEB ? (
                        <Image
                          src="/traka-logo-dark.svg"
                          alt="TrakaWEB"
                          width={32}
                          height={32}
                          className="w-8 h-auto"
                        />
                      ) : (
                        <Icon
                          className="w-6 h-6"
                          style={{ color: accentColor }}
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-lg text-text-primary leading-tight">
                        {tool.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
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
                        <span className="w-px h-3 bg-border-subtle" />
                        <span
                          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            color: accentColor,
                            backgroundColor: `${accentColor}08`,
                          }}
                        >
                          {tool.category}
                        </span>
                        {tool.version && (
                          <>
                            <span className="w-px h-3 bg-border-subtle" />
                            <span className="text-text-ghost font-mono text-[10px]">
                              v{tool.version}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-text-ghost hover:text-text-secondary hover:bg-panel-hover transition-colors -mr-1 -mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-2">
              {/* Description */}
              <p className="text-text-secondary text-[13px] leading-relaxed mb-5">
                {tool.description}
              </p>

              {/* Help sections */}
              {helpSections.length > 0 && (
                <div className="space-y-4">
                  {helpSections.map((section, i) => (
                    <div key={i}>
                      {section.heading && (
                        <h3
                          className="font-display font-semibold text-xs uppercase tracking-wider mb-2"
                          style={{ color: accentColor }}
                        >
                          {section.heading}
                        </h3>
                      )}
                      <div className="space-y-1">
                        {section.content.map((line, j) => {
                          if (!line.trim()) return null;
                          const isBullet = line.trim().startsWith("•");
                          return (
                            <p
                              key={j}
                              className={`text-[13px] leading-relaxed ${
                                isBullet
                                  ? "text-text-secondary pl-1"
                                  : "text-text-secondary"
                              }`}
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!tool.helpText && (
                <div className="py-6 text-center">
                  <p className="text-text-ghost text-sm">
                    No additional information available for this tool.
                  </p>
                  <p className="text-text-ghost text-xs mt-1">
                    Contact the App Support team for help.
                  </p>
                </div>
              )}
            </div>

            {/* Footer with launch button */}
            <div className="p-4 border-t border-border-subtle">
              <button
                onClick={() => {
                  onLaunch(tool);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: accentColor }}
              >
                {tool.launchType === "WEB" ? (
                  <>
                    Open {tool.name}
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Launch {tool.name}
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
