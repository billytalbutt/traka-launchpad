"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Clock, Save, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Setting {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  type: string;
  updatedAt: string;
  updatedBy: string | null;
}

const TIMEOUT_PRESETS = [
  { label: "1 hour", value: 1 },
  { label: "4 hours", value: 4 },
  { label: "8 hours", value: 8 },
  { label: "12 hours", value: 12 },
  { label: "24 hours", value: 24 },
  { label: "7 days", value: 168 },
  { label: "30 days", value: 720 },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data: Setting[] = await res.json();
      setSettings(data);
      const vals: Record<string, string> = {};
      data.forEach((s) => (vals[s.key] = s.value));
      setLocalValues(vals);
    }
    setLoading(false);
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: localValues[key] }),
    });

    if (res.ok) {
      setSaved(key);
      setTimeout(() => setSaved(null), 3000);
      fetchSettings();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save setting");
    }
    setSaving(null);
  };

  const sessionTimeoutSetting = settings.find(
    (s) => s.key === "session_timeout_hours"
  );
  const currentTimeoutHours = parseInt(
    localValues["session_timeout_hours"] ?? "8",
    10
  );

  function formatTimeout(hours: number) {
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-traka-orange/[0.08] border border-traka-orange/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-traka-orange" />
            </div>
            <h1 className="text-xl font-semibold text-text-primary">
              System Settings
            </h1>
          </div>
          <p className="text-sm text-text-secondary ml-11">
            Configure Launchpad behaviour. Admin access required.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="panel rounded-xl p-6 animate-pulse h-32"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Session Timeout Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-xl p-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-traka-orange/[0.06] border border-traka-orange/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-traka-orange" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-text-primary mb-1">
                  {sessionTimeoutSetting?.label ?? "Session Timeout"}
                </h2>
                {sessionTimeoutSetting?.description && (
                  <p className="text-sm text-text-secondary">
                    {sessionTimeoutSetting.description}
                  </p>
                )}
              </div>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              {TIMEOUT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() =>
                    setLocalValues((v) => ({
                      ...v,
                      session_timeout_hours: String(preset.value),
                    }))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    currentTimeoutHours === preset.value
                      ? "bg-traka-orange/[0.12] border-traka-orange/40 text-traka-orange"
                      : "bg-transparent border-border-subtle text-text-tertiary hover:border-traka-orange/30 hover:text-text-secondary"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 panel-raised rounded-lg px-3 py-2 border border-border-subtle flex-1 max-w-xs">
                <input
                  type="number"
                  min={1}
                  max={8760}
                  value={localValues["session_timeout_hours"] ?? "8"}
                  onChange={(e) =>
                    setLocalValues((v) => ({
                      ...v,
                      session_timeout_hours: e.target.value,
                    }))
                  }
                  className="bg-transparent text-text-primary text-sm w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-text-ghost whitespace-nowrap">
                  hours
                </span>
              </div>
              <span className="text-xs text-text-tertiary">
                = {formatTimeout(currentTimeoutHours)}
              </span>

              <button
                onClick={() => handleSave("session_timeout_hours")}
                disabled={saving === "session_timeout_hours"}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  saved === "session_timeout_hours"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-traka-orange/[0.08] border border-traka-orange/25 text-traka-orange hover:bg-traka-orange/[0.14]"
                )}
              >
                {saved === "session_timeout_hours" ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {saving === "session_timeout_hours" ? "Saving…" : "Save"}
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </p>
            )}

            {/* Note */}
            <div className="mt-5 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-ghost flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-traka-orange/40" />
                Timeout changes apply to new logins only. Users already logged
                in keep their current session until it expires naturally or they
                sign out.
              </p>
              {sessionTimeoutSetting?.updatedAt && (
                <p className="text-xs text-text-ghost mt-1.5 ml-5">
                  Last updated:{" "}
                  {new Date(sessionTimeoutSetting.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>

          {/* Future settings will be added here */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="panel rounded-xl p-5 border border-dashed border-border-subtle/50"
          >
            <p className="text-sm text-text-ghost text-center py-2">
              More settings will appear here as features are added.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
