import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUpdateProfile, useChangePassword } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const fadeInUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const TABS = ["Profile", "Password", "Notifications", "Preferences"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfileMutation = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated" });
      },
      onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
    },
  });

  const changePasswordMutation = useChangePassword({
    mutation: {
      onSuccess: () => {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        toast({ title: "Password changed" });
      },
      onError: (err: { data?: { error?: string } }) => toast({ title: err?.data?.error ?? "Failed to change password", variant: "destructive" }),
    },
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ data: { name: name || undefined, displayName: displayName || undefined } });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ data: { currentPassword, newPassword } });
  };

  return (
    <DashboardLayout title="Settings">
      <motion.div
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-6 max-w-2xl"
      >
        {/* Tabs */}
        <motion.div variants={fadeInUp} className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-${tab.toLowerCase()}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {activeTab === "Profile" && (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Profile information</h2>
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  <div className="text-xs text-blue-600 capitalize mt-0.5">{user?.plan} plan</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  data-testid="input-settings-name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
                <input
                  value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="How you appear in meetings"
                  data-testid="input-settings-display-name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  value={user?.email ?? ""} disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="btn-save-profile"
                className="self-end px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === "Password" && (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Change password</h2>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
                <input
                  type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                  data-testid="input-current-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <input
                  type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                  data-testid="input-new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  data-testid="input-confirm-new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                data-testid="btn-change-password"
                className="self-end px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change password"}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === "Notifications" && (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Notification preferences</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Meeting reminders", desc: "Get notified 10 minutes before a scheduled meeting" },
                { label: "Meeting invitations", desc: "Receive notifications when invited to a meeting" },
                { label: "Recording ready", desc: "Get notified when a meeting recording is available" },
                { label: "Product updates", desc: "Learn about new features and improvements" },
              ].map(item => (
                <label key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded text-blue-600" />
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "Preferences" && (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Meeting preferences</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Join with microphone on", desc: "Automatically enable mic when joining a meeting" },
                { label: "Join with camera on", desc: "Automatically enable camera when joining a meeting" },
                { label: "Noise cancellation", desc: "Remove background noise from your audio" },
                { label: "Mirror my video", desc: "Show your own video mirrored, like a mirror" },
              ].map(item => (
                <label key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded text-blue-600" />
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
