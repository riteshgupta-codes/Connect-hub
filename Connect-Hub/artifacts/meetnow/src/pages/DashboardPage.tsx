import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogIn, Calendar, Video, Clock, Users, X, Copy, Check, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useCreateMeeting, useGetMeetingHistory, getGetMeetingHistoryQueryKey,
  useGetSchedules, getGetSchedulesQueryKey, useGetAnalyticsOverview, getGetAnalyticsOverviewQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-live-dot" />
      Live
    </span>
  );
  if (status === "ended") return (
    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Ended</span>
  );
  return (
    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">Scheduled</span>
  );
}

function CreateMeetingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"type" | "configure" | "success">("type");
  const [title, setTitle] = useState("");
  const [passcode, setPasscode] = useState("");
  const [enablePasscode, setEnablePasscode] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateMeeting({
    mutation: {
      onSuccess: (data: { roomId: string }) => {
        setCreatedRoomId(data.roomId);
        setStep("success");
        queryClient.invalidateQueries({ queryKey: getGetMeetingHistoryQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to create meeting", variant: "destructive" });
      },
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ data: { title: title || undefined, passcode: enablePasscode ? passcode : undefined } });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${createdRoomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">New Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        {step === "type" && (
          <div className="p-6 flex flex-col gap-3">
            <p className="text-sm text-gray-500 mb-2">Choose meeting type</p>
            {[
              { label: "Instant meeting", desc: "Start right now", icon: Video },
              { label: "Schedule for later", desc: "Pick a date and time", icon: Calendar, disabled: true },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => !item.disabled && setStep("configure")}
                disabled={item.disabled}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <item.icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {step === "configure" && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My Meeting"
                data-testid="input-meeting-title-create"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enablePasscode} onChange={e => setEnablePasscode(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Require passcode</span>
            </label>
            {enablePasscode && (
              <input
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Set a passcode"
                data-testid="input-meeting-passcode"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
              />
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep("type")} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                data-testid="btn-create-meeting-submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {createMutation.isPending ? "Creating..." : "Create meeting"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Meeting created</h3>
            <p className="text-gray-500 text-sm mb-5">Share the link or room code with your participants</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <span className="font-mono text-sm text-gray-700 flex-1 truncate">{createdRoomId}</span>
              <button onClick={copyLink} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium flex-shrink-0">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Close</button>
              <button
                onClick={() => setLocation(`/meeting/${createdRoomId}`)}
                data-testid="btn-join-created-meeting"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Join now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function JoinMeetingModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();

  const handleJoin = () => {
    const roomId = code.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (roomId) setLocation(`/meeting/${roomId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Join a meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting code or link</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="abc-defg-hij or full link"
              data-testid="input-join-code"
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!code.trim()}
            data-testid="btn-join-submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Join meeting
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const { data: historyData } = useGetMeetingHistory(
    { limit: 4 },
    { query: { queryKey: getGetMeetingHistoryQueryKey({ limit: 4 }) } }
  );

  const { data: schedulesData } = useGetSchedules(
    { status: "upcoming", limit: 3 },
    { query: { queryKey: getGetSchedulesQueryKey({ status: "upcoming", limit: 3 }) } }
  );

  const { data: overview } = useGetAnalyticsOverview({
    query: { queryKey: getGetAnalyticsOverviewQueryKey() }
  });

  const meetings = (historyData as { meetings?: unknown[] })?.meetings ?? (Array.isArray(historyData) ? historyData : []);
  const schedules = Array.isArray(schedulesData) ? schedulesData : [];

  const QUICK_ACTIONS = [
    {
      label: "New meeting",
      desc: "Start an instant video call",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-white",
      onClick: () => setShowCreate(true),
      testId: "btn-new-meeting",
    },
    {
      label: "Join meeting",
      desc: "Enter a meeting code",
      icon: LogIn,
      color: "bg-white hover:bg-gray-50",
      textColor: "text-gray-900",
      border: true,
      onClick: () => setShowJoin(true),
      testId: "btn-join-meeting-dashboard",
    },
    {
      label: "Schedule",
      desc: "Plan a future meeting",
      icon: Calendar,
      color: "bg-white hover:bg-gray-50",
      textColor: "text-gray-900",
      border: true,
      onClick: () => setLocation("/dashboard/schedule"),
      testId: "btn-schedule-meeting",
    },
  ];

  return (
    <DashboardLayout title="Dashboard" action={
      <button
        onClick={() => setShowCreate(true)}
        data-testid="btn-new-meeting-header"
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Plus size={16} />
        New meeting
      </button>
    }>
      <AnimatePresence>
        {showCreate && <CreateMeetingModal onClose={() => setShowCreate(false)} />}
        {showJoin && <JoinMeetingModal onClose={() => setShowJoin(false)} />}
      </AnimatePresence>

      <motion.div
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-6"
      >
        {/* Greeting */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name?.split(" ")[0]}.</h2>
          <p className="text-gray-500 text-sm mt-0.5">Ready to collaborate?</p>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              data-testid={action.testId}
              className={`p-5 rounded-2xl text-left transition-all ${action.color} ${action.border ? "border border-gray-200" : ""} shadow-sm hover:shadow-md`}
            >
              <action.icon size={24} className={`mb-3 ${action.textColor === "text-white" ? "text-white/80" : "text-blue-600"}`} />
              <div className={`font-semibold text-sm ${action.textColor}`}>{action.label}</div>
              <div className={`text-xs mt-0.5 ${action.textColor === "text-white" ? "text-white/70" : "text-gray-500"}`}>{action.desc}</div>
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        {overview && (
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "This month", value: String((overview as { meetingsThisMonth?: number }).meetingsThisMonth ?? 0), icon: Video },
              { label: "Total hours", value: String((overview as { totalHours?: string }).totalHours ?? "0h 0m"), icon: Clock },
              { label: "People met", value: String((overview as { peopleMet?: number }).peopleMet ?? 0), icon: Users },
              { label: "Messages sent", value: String((overview as { messagesSent?: number }).messagesSent ?? 0), icon: Users },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`}>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent meetings */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Recent meetings</h3>
              <button onClick={() => setLocation("/dashboard/history")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {meetings.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No meetings yet</div>
              ) : meetings.slice(0, 4).map((m: unknown, i: number) => {
                const meeting = m as { id: string; roomId: string; title: string; status: string; createdAt: string };
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Video size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{meeting.title}</div>
                      <div className="text-xs text-gray-400">{new Date(meeting.createdAt).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={meeting.status} />
                    {meeting.status === "active" && (
                      <button
                        onClick={() => setLocation(`/meeting/${meeting.roomId}`)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Rejoin
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming schedules */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Upcoming schedules</h3>
              <button onClick={() => setLocation("/dashboard/schedule")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {schedules.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No upcoming schedules</div>
              ) : schedules.slice(0, 3).map((s: unknown, i: number) => {
                const schedule = s as { id: number; title: string; scheduledFor: string; durationMinutes: number };
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{schedule.title}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(schedule.scheduledFor).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{schedule.durationMinutes}min
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
