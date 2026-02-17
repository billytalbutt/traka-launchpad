"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Shield, Activity, Star, Rocket, Globe, Check, Monitor, Eye, EyeOff } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { ToolWithFavorite } from "@/types";
import { ROLE_LABELS, type UserRole } from "@/types";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<ToolWithFavorite[]>([]);
  const [stats, setStats] = useState({ totalLaunches: 0, favoriteCount: 0 });
  const [trakaWebUrl, setTrakaWebUrl] = useState("");
  const [urlSaved, setUrlSaved] = useState(false);
  const [urlSaving, setUrlSaving] = useState(false);
  const [rdpHost, setRdpHost] = useState("");
  const [rdpUsername, setRdpUsername] = useState("");
  const [rdpPassword, setRdpPassword] = useState("");
  const [rdpPasswordSet, setRdpPasswordSet] = useState(false);
  const [rdpShowPassword, setRdpShowPassword] = useState(false);
  const [rdpSaved, setRdpSaved] = useState(false);
  const [rdpSaving, setRdpSaving] = useState(false);

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

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { trakaWebUrl: string; rdpHost: string; rdpUsername: string; rdpPasswordSet: boolean }) => {
        setTrakaWebUrl(data.trakaWebUrl);
        setRdpHost(data.rdpHost);
        setRdpUsername(data.rdpUsername);
        setRdpPasswordSet(data.rdpPasswordSet);
      })
      .catch(() => {});
  }, []);

  const saveRdpConfig = async () => {
    setRdpSaving(true);
    try {
      const payload: Record<string, string> = {
        rdpHost,
        rdpUsername,
      };
      if (rdpPassword) {
        payload.rdpPassword = rdpPassword;
      }
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setRdpPasswordSet(data.rdpPasswordSet);
      setRdpPassword("");
      setRdpSaved(true);
      setTimeout(() => setRdpSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setRdpSaving(false);
    }
  };

  const saveTrakaWebUrl = async () => {
    setUrlSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trakaWebUrl }),
      });
      setUrlSaved(true);
      setTimeout(() => setUrlSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setUrlSaving(false);
    }
  };

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
                {ROLE_LABELS[session.user.role as UserRole] || session.user.role}
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

      {/* TrakaWEB URL setting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="panel rounded-lg p-6 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-3.5 h-3.5 text-traka-orange" />
          <span className="text-label text-[10px]">TrakaWEB URL</span>
        </div>
        <p className="text-text-secondary text-xs mb-3">
          Set your TrakaWEB server URL. Leave blank to use the default ({" "}
          <span className="text-text-tertiary font-mono">http://localhost/trakaweb</span>
          {" "}).
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={trakaWebUrl}
            onChange={(e) => setTrakaWebUrl(e.target.value)}
            placeholder="http://localhost/trakaweb"
            className="flex-1 px-3 py-2 rounded-lg input-field text-sm font-mono"
          />
          <button
            onClick={saveTrakaWebUrl}
            disabled={urlSaving}
            className="px-4 py-2 rounded-lg btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {urlSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </motion.div>

      {/* RDP / My VM configuration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="panel rounded-lg p-6 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-label text-[10px]">My VM — Remote Desktop</span>
        </div>
        <p className="text-text-secondary text-xs mb-3">
          Configure your personal VM for one-click Remote Desktop access. All
          three fields are required.
          {rdpPasswordSet && (
            <span className="text-emerald-400 ml-1">(Password is saved)</span>
          )}
        </p>
        <div className="space-y-2.5">
          <input
            type="text"
            value={rdpHost}
            onChange={(e) => setRdpHost(e.target.value)}
            placeholder="VM hostname or IP (e.g. my-vm.corp.local)"
            className="w-full px-3 py-2 rounded-lg input-field text-sm font-mono"
          />
          <input
            type="text"
            value={rdpUsername}
            onChange={(e) => setRdpUsername(e.target.value)}
            placeholder="Username (e.g. DOMAIN\username)"
            className="w-full px-3 py-2 rounded-lg input-field text-sm font-mono"
          />
          <div className="relative">
            <input
              type={rdpShowPassword ? "text" : "password"}
              value={rdpPassword}
              onChange={(e) => setRdpPassword(e.target.value)}
              placeholder={rdpPasswordSet ? "••••••••  (leave blank to keep current)" : "Password"}
              className="w-full px-3 py-2 pr-10 rounded-lg input-field text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setRdpShowPassword(!rdpShowPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-secondary transition-colors"
            >
              {rdpShowPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={saveRdpConfig}
              disabled={rdpSaving || !rdpHost || !rdpUsername}
              className="px-4 py-2 rounded-lg btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {rdpSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </motion.div>

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
