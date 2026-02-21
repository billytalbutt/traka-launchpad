"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Play,
  Square,
  RotateCw,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceStatus =
  | "Running"
  | "Stopped"
  | "Starting"
  | "Stopping"
  | "Paused"
  | "NotFound"
  | "Error";

interface ServiceEntry {
  name: string;
  displayName: string;
  description: string;
  color: string;
  logProvider: string;
  status: ServiceStatus;
  startType: string;
  exists: boolean;
  error: string | null;
}

interface LogEntry {
  time: string;
  level: string;
  message: string;
  source: string;
}

type ActionType = "start" | "stop" | "restart";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: ServiceStatus }) {
  if (status === "Running") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
      </span>
    );
  }
  if (status === "Starting" || status === "Stopping") {
    return (
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
    );
  }
  if (status === "Stopped") {
    return <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />;
  }
  return <span className="h-2.5 w-2.5 rounded-full bg-text-ghost" />;
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const map: Record<ServiceStatus, { label: string; classes: string }> = {
    Running: {
      label: "Running",
      classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    Stopped: {
      label: "Stopped",
      classes: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    Starting: {
      label: "Starting…",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    Stopping: {
      label: "Stopping…",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    Paused: {
      label: "Paused",
      classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    NotFound: {
      label: "Not Found",
      classes: "bg-panel text-text-ghost border-border-subtle",
    },
    Error: {
      label: "Error",
      classes: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const { label, classes } = map[status] ?? map.Error;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
        classes
      )}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
}

function LogLevelIcon({ level }: { level: string }) {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("error") || l.includes("critical"))
    return <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />;
  if (l.includes("warn"))
    return <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />;
  return <Info className="w-3 h-3 text-sky-400 flex-shrink-0" />;
}

function logLineColor(level: string): string {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("error") || l.includes("critical")) return "text-red-400";
  if (l.includes("warn")) return "text-amber-300";
  if (l.includes("info")) return "text-sky-300";
  return "text-slate-400";
}

function formatLogTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Log Panel
// ---------------------------------------------------------------------------

function LogPanel({
  serviceName,
  serviceDisplayName,
}: {
  serviceName: string;
  serviceDisplayName: string;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/services/${encodeURIComponent(serviceName)}?logs=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [serviceName]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!loading && logs.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, logs.length]);

  return (
    <div className="rounded-b-lg overflow-hidden border-t border-border-subtle">
      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a10] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-text-ghost" />
          <span className="text-[11px] font-mono text-text-ghost">
            Event log — {serviceDisplayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] font-mono text-text-ghost">
              {lastRefresh.toLocaleTimeString("en-GB")}
            </span>
          )}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary hover:text-text-secondary transition-colors disabled:opacity-40"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="h-64 overflow-y-auto bg-[#07070d] px-3 py-3 space-y-0.5 font-mono text-[11px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-text-ghost">
              <div className="w-3 h-3 border border-text-ghost border-t-transparent rounded-full animate-spin" />
              <span>Querying Windows Event Log…</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Terminal className="w-8 h-8 text-text-ghost opacity-30" />
            <p className="text-text-ghost">No events found in the last 3 days</p>
            <p className="text-text-ghost text-[10px]">
              The service may not write to the Windows Event Log
            </p>
          </div>
        ) : (
          <>
            {[...logs].reverse().map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2 py-0.5 px-1 rounded hover:bg-white/[0.03] transition-colors group"
              >
                <span className="text-text-ghost w-28 flex-shrink-0 tabular-nums leading-relaxed">
                  {formatLogTime(log.time)}
                </span>
                <LogLevelIcon level={log.level} />
                <span
                  className={cn(
                    "w-16 flex-shrink-0 uppercase leading-relaxed",
                    logLineColor(log.level)
                  )}
                >
                  {(log.level ?? "").slice(0, 4)}
                </span>
                <span className="text-slate-300 leading-relaxed break-all flex-1">
                  {log.message}
                </span>
                <span className="text-text-ghost text-[9px] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity leading-relaxed">
                  {log.source}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Service Card
// ---------------------------------------------------------------------------

function ServiceCard({
  service,
  onAction,
  actionLoading,
}: {
  service: ServiceEntry;
  onAction: (name: string, action: ActionType) => Promise<void>;
  actionLoading: string | null;
}) {
  const [logsOpen, setLogsOpen] = useState(false);
  const isLoading =
    actionLoading === service.name ||
    service.status === "Starting" ||
    service.status === "Stopping";

  const canStart = service.exists && service.status === "Stopped";
  const canStop = service.exists && service.status === "Running";
  const canRestart = service.exists && service.status === "Running";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel rounded-lg overflow-hidden"
      style={{
        borderLeft: `2px solid ${service.color}22`,
      }}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              {/* Color accent dot */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: service.color }}
              />
              <h3 className="text-base font-semibold text-text-primary truncate">
                {service.displayName}
              </h3>
            </div>
            <p className="text-xs text-text-secondary ml-4.5">
              {service.description}
            </p>
            {service.startType && (
              <p className="text-[10px] font-mono text-text-ghost ml-4.5 mt-1">
                {service.name} · {service.startType}
              </p>
            )}
          </div>
          <StatusBadge status={service.status} />
        </div>

        {/* Error/warning notices */}
        {!service.exists && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              Service not found — update{" "}
              <code className="font-mono text-amber-200">services.config.json</code>{" "}
              with the exact service name from services.msc.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Start */}
          <button
            onClick={() => onAction(service.name, "start")}
            disabled={!canStart || isLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              canStart && !isLoading
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                : "opacity-30 cursor-not-allowed bg-panel border border-border-subtle text-text-ghost"
            )}
          >
            {isLoading && actionLoading === service.name ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Start
          </button>

          {/* Stop */}
          <button
            onClick={() => onAction(service.name, "stop")}
            disabled={!canStop || isLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              canStop && !isLoading
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
                : "opacity-30 cursor-not-allowed bg-panel border border-border-subtle text-text-ghost"
            )}
          >
            <Square className="w-3 h-3" />
            Stop
          </button>

          {/* Restart */}
          <button
            onClick={() => onAction(service.name, "restart")}
            disabled={!canRestart || isLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              canRestart && !isLoading
                ? "bg-traka-orange/10 text-traka-orange border border-traka-orange/20 hover:bg-traka-orange/20 hover:border-traka-orange/40"
                : "opacity-30 cursor-not-allowed bg-panel border border-border-subtle text-text-ghost"
            )}
          >
            <RotateCw
              className={cn("w-3 h-3", isLoading && actionLoading === service.name && "animate-spin")}
            />
            Restart
          </button>

          {/* Logs toggle */}
          <button
            onClick={() => setLogsOpen((v) => !v)}
            className={cn(
              "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              logsOpen
                ? "bg-panel-raised text-text-secondary border border-border"
                : "bg-panel text-text-tertiary border border-border-subtle hover:text-text-secondary hover:bg-panel-hover"
            )}
          >
            <Terminal className="w-3 h-3" />
            Logs
            {logsOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Logs panel */}
      <AnimatePresence>
        {logsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <LogPanel
              serviceName={service.name}
              serviceDisplayName={service.displayName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Error toast
// ---------------------------------------------------------------------------

function ErrorToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="fixed bottom-6 right-6 z-50 max-w-md flex items-start gap-3 p-4 rounded-lg bg-[#1a0a0a] border border-red-500/30 shadow-2xl"
    >
      <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-300">Action failed</p>
        <p className="text-xs text-red-400/80 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="ml-auto text-text-ghost hover:text-text-secondary transition-colors text-xs"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Summary bar
// ---------------------------------------------------------------------------

function SummaryBar({ services }: { services: ServiceEntry[] }) {
  const running = services.filter((s) => s.status === "Running").length;
  const total = services.length;
  const allOk = running === total && total > 0;

  return (
    <div className="panel rounded-lg p-4 flex items-center gap-5">
      <div className="flex items-center gap-2">
        <StatusDot status={allOk ? "Running" : running === 0 ? "Stopped" : "Starting"} />
        <span className="text-sm font-semibold text-text-primary">
          {running}/{total}
        </span>
        <span className="text-sm text-text-secondary">services running</span>
      </div>

      {/* Mini status row */}
      <div className="flex items-center gap-2 ml-2">
        {services.map((s) => (
          <div key={s.name} className="relative group">
            <div
              className="w-2 h-5 rounded-full"
              style={{
                backgroundColor:
                  s.status === "Running"
                    ? "#34d399"
                    : s.status === "Stopped"
                    ? "#f87171"
                    : s.status === "Starting" || s.status === "Stopping"
                    ? "#fbbf24"
                    : "#334155",
              }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-panel-raised border border-border rounded text-[10px] text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {s.displayName}
            </div>
          </div>
        ))}
      </div>

      {allOk && (
        <span className="ml-auto text-xs text-emerald-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          All systems operational
        </span>
      )}
      {!allOk && running < total && total > 0 && (
        <span className="ml-auto text-xs text-amber-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {total - running} service{total - running > 1 ? "s" : ""} offline
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchServices = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/services");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setServices(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    // Poll every 8 seconds for status refresh
    pollRef.current = setInterval(() => fetchServices(true), 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchServices]);

  const handleAction = useCallback(
    async (name: string, action: ActionType) => {
      setActionLoading(name);
      // Optimistic: immediately set transitioning state
      setServices((prev) =>
        prev.map((s) =>
          s.name === name
            ? { ...s, status: action === "start" ? "Starting" : action === "stop" ? "Stopping" : "Stopping" }
            : s
        )
      );
      try {
        const res = await fetch(
          `/api/services/${encodeURIComponent(name)}/action`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          }
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        // Refresh status after short delay to let the service settle
        await new Promise((r) => setTimeout(r, 1500));
        await fetchServices(true);
      } catch (e) {
        setToastError(e instanceof Error ? e.message : "Action failed");
        await fetchServices(true);
      } finally {
        setActionLoading(null);
      }
    },
    [fetchServices]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-52 bg-panel rounded animate-pulse" />
        <div className="h-14 rounded-lg bg-panel animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-lg bg-panel animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400 opacity-60" />
        <p className="text-text-secondary text-sm">{error}</p>
        <button onClick={() => fetchServices()} className="btn-primary px-4 py-2 text-sm rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-traka-orange" />
            <div>
              <h1 className="text-display-sm text-2xl text-text-primary">
                Services
              </h1>
              <p className="text-text-secondary text-sm mt-0.5">
                Start, stop and monitor Windows services
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchServices()}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg panel-interactive text-text-secondary hover:text-text-primary text-xs transition-colors disabled:opacity-40"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary bar */}
      {services.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <SummaryBar services={services} />
        </motion.div>
      )}

      {/* Admin tip for start/stop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-2 p-3 rounded-lg bg-sky-500/5 border border-sky-500/15 mb-6"
      >
        <ShieldAlert className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-sky-300/80">
          Starting and stopping services requires the Launchpad to be running as{" "}
          <strong className="text-sky-300">Administrator</strong>. Right-click the
          desktop shortcut and choose &ldquo;Run as administrator&rdquo; if start/stop
          fails.
        </p>
      </motion.div>

      {/* Service cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((service, i) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <ServiceCard
              service={service}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          </motion.div>
        ))}
      </div>

      {/* Config note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-text-ghost text-xs font-mono mt-8 text-center"
      >
        Service definitions are managed in{" "}
        <code className="text-text-tertiary">services.config.json</code>
      </motion.p>

      {/* Error toast */}
      <AnimatePresence>
        {toastError && (
          <ErrorToast
            message={toastError}
            onDismiss={() => setToastError(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
