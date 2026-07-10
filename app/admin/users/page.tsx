"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, ShieldAlert, CheckCircle, XCircle, Ban, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  role: "farmer" | "consumer" | "admin";
  is_verified: boolean;
  trust_score: number;
  created_at: string;
}

async function fetchUsers(filters: { search: string; role: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.role) params.append("role", filters.role);

  const res = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user list");
  return res.json();
}

async function toggleUserSuspension(payload: { profileId: string; verify: boolean }) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const res = await fetch(`${API_URL}/api/admin/verify-farmer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      profileId: payload.profileId,
      status: payload.verify ? "APPROVED" : "REJECTED",
      rejectionReason: payload.verify
        ? "Your account status has been verified."
        : "Your account has been suspended by AgriNex administration.",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to toggle user status");
  }
  return res.json();
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading, error, refetch } = useQuery<UserProfile[]>({
    queryKey: ["adminUsers", search, roleFilter],
    queryFn: () => fetchUsers({ search, role: roleFilter }),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const handleToggleSuspension = async (profileId: string, currentVerified: boolean) => {
    await toggleMutation.mutateAsync({
      profileId,
      verify: !currentVerified,
    });
  };

  const getRoleBadge = (role: string) => {
  const { t } = useTranslation();
    switch (role) {
      case "admin":
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">{t("admin1")}</span>;
      case "farmer":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">{t("farmer")}</span>;
      case "consumer":
        return <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px]">{t("consumer1")}</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 font-bold text-[10px]">{role}</span>;
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 premium-card rounded-3xl shadow-sm">
        <p>Error loading users: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.01] p-4 rounded-2xl border-white/5">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500/50"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-semibold self-center mr-1">
            Role:
          </span>
          <div className="flex premium-card shadow-sm rounded-xl overflow-hidden border-white/5">
            {["", "farmer", "consumer", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  roleFilter === role
                    ? "bg-purple-500/20 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {role === "" ? "All" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="premium-card rounded-3xl shadow-sm overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-semibold bg-white/[0.02]">
                  <th className="py-3 px-4">{t("avatar")}</th>
                  <th className="py-3 px-4">{t("fullName")}</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">{t("schemeStatus")}</th>
                  <th className="py-3 px-4 text-center">{t("trustScore")}</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No users found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-xs">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 font-medium text-white">
                        {user.full_name}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {user.phone_number}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <CheckCircle className="w-3 h-3" /> {t("active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                            <XCircle className="w-3 h-3" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Trust Score */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-300">
                        {user.trust_score?.toFixed(2)}/5.00
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(user.created_at).toLocaleDateString("en-IN")}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          id={`toggle-suspension-btn-${user.id}`}
                          onClick={() => handleToggleSuspension(user.id, user.is_verified)}
                          disabled={toggleMutation.isPending}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 mx-auto transition-all ${
                            user.is_verified
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                          }`}
                        >
                          {user.is_verified ? (
                            <>
                              <Ban className="w-3.5 h-3.5" /> Suspend
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> {t("activate")}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}