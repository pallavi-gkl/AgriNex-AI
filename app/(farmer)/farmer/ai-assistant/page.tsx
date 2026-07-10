"use client";
import React from "react";
import AIChatWorkspace from "@/components/shared/AIChatWorkspace";

export default function FarmerAIAssistantPage() {
  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AIChatWorkspace platform="farmer" />
      </div>
    </div>
  );
}