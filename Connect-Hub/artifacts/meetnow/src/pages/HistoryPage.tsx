import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Video, Clock, Trash2, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMeetingHistory, getGetMeetingHistoryQueryKey, useDeleteMeeting, type GetMeetingHistoryStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return (
    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Live</span>
  );
  if (status === "ended") return (
    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Ended</span>
  );
  return <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{status}</span>;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GetMeetingHistoryStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = { page, limit: 10, ...(status !== "all" ? { status } : {}) };
  const { data, isLoading } = useGetMeetingHistory(params, {
    query: { queryKey: getGetMeetingHistoryQueryKey(params) }
  });

  const deleteMutation = useDeleteMeeting({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeetingHistoryQueryKey() });
        toast({ title: "Meeting deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete meeting", variant: "destructive" });
      },
    }
  });

  const rawMeetings: unknown[] = (data as { meetings?: unknown[] })?.meetings ?? (Array.isArray(data) ? data : []);
  const total: number = (data as { total?: number })?.total ?? rawMeetings.length;

  const meetings = rawMeetings.filter((m: unknown) => {
    const meeting = m as { title?: string };
    return !search || (meeting.title ?? "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="My Meetings">
      <motion.div
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-6"
      >
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search meetings..."
              data-testid="input-search-meetings"
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "ended"].map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s as GetMeetingHistoryStatus | "all"); setPage(1); }}
                data-testid={`filter-${s}`}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                  status === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="p-12 text-center">
              <Video size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No meetings found</p>
              <p className="text-gray-400 text-sm mt-1">Start your first meeting from the dashboard</p>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Meeting</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Duration</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {meetings.map((m: unknown, i: number) => {
                    const meeting = m as { id: number; roomId: string; title: string; status: string; createdAt: string; duration?: number | null };
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors" data-testid={`meeting-row-${meeting.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Video size={16} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{meeting.title}</div>
                              <div className="text-xs text-gray-400 font-mono">{meeting.roomId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                          {new Date(meeting.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock size={13} className="text-gray-400" />
                            {formatDuration(meeting.duration)}
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={meeting.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setLocation(`/meeting/${meeting.roomId}`)}
                              data-testid={`btn-rejoin-${meeting.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Join"
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate({ roomId: meeting.roomId })}
                              data-testid={`btn-delete-meeting-${meeting.id}`}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {total > 10 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{total} total meetings</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * 10 >= total}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
