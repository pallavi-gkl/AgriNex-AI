"use client";

import type { UserRole } from "@/types";

export interface KYCApp {
  profileId: string;
  fullName: string;
  phoneNumber: string;
  locationAddress: string;
  landCertificateUrl: string;
  submittedAt: string;
}

interface KYCApplicationListProps {
  applications: KYCApp[];
  selectedId: string | undefined;
  onSelect: (app: KYCApp) => void;
}

export default function KYCApplicationList({
  applications,
  selectedId,
  onSelect,
}: KYCApplicationListProps) {
  return (
    <div className="glass-panel h-full overflow-y-auto border-r border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5 bg-white/[0.01]">
        <h4 className="text-white font-semibold text-sm">KYC Applications</h4>
        <p className="text-slate-500 text-xs mt-0.5">
          {applications.length} Pending Verification
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No pending KYC applications found.
          </div>
        ) : (
          applications.map((app) => (
            <button
              key={app.profileId}
              onClick={() => onSelect(app)}
              className={`w-full p-4 text-left flex items-start gap-3 hover:bg-white/5 transition-all text-xs ${
                selectedId === app.profileId
                  ? "bg-purple-500/10 border-l-2 border-l-purple-500"
                  : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-sm flex-shrink-0">
                {app.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate text-sm">
                  {app.fullName}
                </p>
                <p className="text-slate-400 truncate mt-0.5">
                  {app.locationAddress}
                </p>
                <p className="text-slate-600 font-mono mt-1 text-[10px]">
                  Submitted: {new Date(app.submittedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
