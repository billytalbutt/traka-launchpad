"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Rocket,
  Users,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatRelativeTime, getInitials } from "@/lib/utils";

interface AnalyticsData {
  totalLaunches: number;
  recentLaunches: number;
  totalUsers: number;
  activeUsers: number;
  popularTools: { name: string; launches: number; color: string }[];
  chartData: { date: string; launches: number }[];
  recentActivity: {
    id: string;
    launchedAt: string;
    user: { name: string | null; email: string; image: string | null };
    tool: { name: string; iconName: string; color: string | null };
  }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-panel rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg bg-panel animate-pulse"
            />
          ))}
        </div>
        <div className="h-80 rounded-lg bg-panel animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "Total Launches",
      value: data.totalLaunches,
      icon: Rocket,
      color: "text-traka-blue",
    },
    {
      label: "This Week",
      value: data.recentLaunches,
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      label: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Active Users (7d)",
      value: data.activeUsers,
      icon: Activity,
      color: "text-traka-orange",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-traka-blue" />
          <h1 className="text-display-sm text-2xl text-text-primary">Analytics</h1>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          Tool usage statistics and activity overview
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="panel rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-label text-text-secondary mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Launch Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-lg p-6 lg:col-span-2"
        >
          <h3 className="text-display-sm text-lg text-text-primary mb-4">
            Launches (Last 30 Days)
          </h3>
          {data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="launches"
                  fill="#0078D4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-text-tertiary">
              No launch data yet
            </div>
          )}
        </motion.div>

        {/* Popular Tools */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="panel rounded-lg p-6"
        >
          <h3 className="text-display-sm text-lg text-text-primary mb-4">
            Most Popular Tools
          </h3>
          {data.popularTools.length > 0 ? (
            <div className="space-y-3">
              {data.popularTools.map((tool, i) => (
                <div key={tool.name} className="flex items-center gap-3">
                  <span className="text-xs text-text-tertiary w-5 text-right font-mono">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-primary font-medium truncate">
                        {tool.name}
                      </span>
                      <span className="text-xs text-text-secondary ml-2 font-mono">
                        {tool.launches}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-panel overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${
                            (tool.launches /
                              Math.max(
                                ...data.popularTools.map((t) => t.launches)
                              )) *
                            100
                          }%`,
                          backgroundColor: tool.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">No data yet</p>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-lg p-6 mt-6"
      >
        <h3 className="text-display-sm text-lg text-text-primary mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-secondary" />
          Recent Activity
        </h3>
        {data.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-panel-hover transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-traka-blue/[0.12] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-medium text-traka-blue">
                    {getInitials(activity.user.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">
                      {activity.user.name || activity.user.email}
                    </span>{" "}
                    <span className="text-text-secondary">launched</span>{" "}
                    <span
                      className="font-medium"
                      style={{ color: activity.tool.color || "#0078D4" }}
                    >
                      {activity.tool.name}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-text-tertiary flex-shrink-0 font-mono">
                  {formatRelativeTime(activity.launchedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-tertiary text-sm">No activity yet</p>
        )}
      </motion.div>
    </div>
  );
}
