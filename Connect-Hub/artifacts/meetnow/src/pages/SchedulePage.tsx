import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Trash2, Clock, X, Check } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useCreateSchedule, useGetSchedules, getGetSchedulesQueryKey, useDeleteSchedule,
  type CreateScheduleBodyDurationMinutes
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function ScheduleForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [invitees, setInvitees] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateSchedule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSchedulesQueryKey() });
        toast({ title: "Meeting scheduled" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to schedule meeting", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    const scheduledFor = new Date(`${date}T${time}`).toISOString();
    const inviteeList = invitees.split(",").map(s => s.trim()).filter(Boolean);
    createMutation.mutate({
      data: { title, description: description || undefined, scheduledFor, durationMinutes: (parseInt(duration) || 60) as CreateScheduleBodyDurationMinutes, invitees: inviteeList }
    });
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
          <h2 className="font-semibold text-gray-900">Schedule a meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting title *</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Weekly team sync"
              data-testid="input-schedule-title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Optional meeting description"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)} required
                min={new Date().toISOString().split("T")[0]}
                data-testid="input-schedule-date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time *</label>
              <input
                type="time" value={time} onChange={e => setTime(e.target.value)} required
                data-testid="input-schedule-time"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
            <select
              value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors bg-white"
            >
              {["30", "45", "60", "90", "120"].map(d => (
                <option key={d} value={d}>{parseInt(d) >= 60 ? `${parseInt(d) / 60}h` : `${d}min`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Invite by email (comma-separated)</label>
            <input
              value={invitees} onChange={e => setInvitees(e.target.value)}
              placeholder="alice@example.com, bob@example.com"
              data-testid="input-schedule-invitees"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title || !date || !time}
              data-testid="btn-schedule-submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {createMutation.isPending ? "Scheduling..." : "Schedule meeting"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function SchedulePage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetSchedules({}, { query: { queryKey: getGetSchedulesQueryKey({}) } });
  const schedules = Array.isArray(data) ? data : [];

  const deleteMutation = useDeleteSchedule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSchedulesQueryKey() });
        toast({ title: "Schedule deleted" });
      },
    }
  });

  const statusColor = (status: string) => {
    if (status === "upcoming") return "bg-blue-50 text-blue-700";
    if (status === "completed") return "bg-gray-100 text-gray-600";
    if (status === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <DashboardLayout title="Schedule" action={
      <button
        onClick={() => setShowForm(true)}
        data-testid="btn-schedule-new"
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Plus size={16} />
        Schedule
      </button>
    }>
      <AnimatePresence>
        {showForm && <ScheduleForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      <motion.div
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-4"
      >
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : schedules.length === 0 ? (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No scheduled meetings</p>
            <p className="text-gray-400 text-sm mt-1">Schedule your first meeting to get started</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Schedule a meeting
            </button>
          </motion.div>
        ) : (
          schedules.map((s: unknown, i: number) => {
            const schedule = s as { id: number; title: string; description?: string | null; scheduledFor: string; durationMinutes: number; invitees: string[]; status: string };
            return (
              <motion.div
                key={i} variants={fadeInUp}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                data-testid={`schedule-card-${schedule.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(schedule.status)}`}>{schedule.status}</span>
                      </div>
                      {schedule.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{schedule.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(schedule.scheduledFor).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {schedule.durationMinutes >= 60 ? `${schedule.durationMinutes / 60}h` : `${schedule.durationMinutes}min`}
                        </span>
                        {schedule.invitees?.length > 0 && (
                          <span>{schedule.invitees.length} invited</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate({ id: schedule.id })}
                    data-testid={`btn-delete-schedule-${schedule.id}`}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </DashboardLayout>
  );
}
