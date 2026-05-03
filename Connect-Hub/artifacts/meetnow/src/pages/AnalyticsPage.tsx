import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetUserAnalytics, getGetUserAnalyticsQueryKey, type GetUserAnalyticsRange } from "@workspace/api-client-react";
import { Video, Clock, Users, MessageSquare, TrendingUp } from "lucide-react";

const fadeInUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [range, setRange] = useState<GetUserAnalyticsRange>("30d");

  const { data, isLoading } = useGetUserAnalytics({ range }, {
    query: { queryKey: getGetUserAnalyticsQueryKey({ range }) }
  });

  const analytics = data as {
    totalMeetings?: number;
    totalHoursMinutes?: string;
    totalMessages?: number;
    uniquePeopleMet?: number;
    meetingsHosted?: number;
    meetingsJoined?: number;
    dailyCounts?: { date: string; count: number }[];
    topContacts?: { name: string; meetingCount: number }[];
  } | null | undefined;

  const STATS = [
    { label: "Total meetings", value: String(analytics?.totalMeetings ?? 0), icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total time", value: analytics?.totalHoursMinutes ?? "0h 0m", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "People met", value: String(analytics?.uniquePeopleMet ?? 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Messages sent", value: String(analytics?.totalMessages ?? 0), icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const donutData = [
    { name: "Hosted", value: analytics?.meetingsHosted ?? 0 },
    { name: "Joined", value: analytics?.meetingsJoined ?? 0 },
  ];

  return (
    <DashboardLayout title="Analytics">
      <motion.div
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-6"
      >
        {/* Range picker */}
        <motion.div variants={fadeInUp} className="flex gap-2">
          {[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
            { value: "1y", label: "1 year" },
          ].map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value as GetUserAnalyticsRange)}
              data-testid={`range-${r.value}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                range === r.value ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" data-testid={`analytics-stat-${i}`}>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{isLoading ? "—" : stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Line chart: meetings per day */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Meetings over time</h3>
            </div>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={analytics?.dailyCounts ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    labelFormatter={l => `Date: ${l}`}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Donut: hosted vs joined */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-5">Meeting role</h3>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={donutData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {donutData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Top contacts */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-5">Top contacts by meetings</h3>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
          ) : (analytics?.topContacts ?? []).length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-sm">No contact data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics?.topContacts ?? []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="meetingCount" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
