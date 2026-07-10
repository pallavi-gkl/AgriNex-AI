"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview AIAssistantDrawer
 * Right-side sliding panel that wraps the full AIChatWorkspace.
 * Slides in from the right without navigating away from the current page.
 * The panel and its close button are self-contained.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";
import AIChatWorkspace from "@/components/shared/AIChatWorkspace";
import type { Profile } from "@/types";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export default function AIAssistantDrawer({ isOpen, onClose, profile }: AIAssistantDrawerProps) {
  const { t } = useTranslation();
  const platform = profile?.role === "farmer" ? "farmer" : "consumer";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop — tap to close */}
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[44] lg:hidden"
            aria-hidden="true"
          />

          {/* Sliding Panel */}
          <motion.div
            key="ai-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="ag-ai-panel"
            role="dialog"
            aria-label={t("aiAssistantFarmer")}
          >
            {/* Full Chat Workspace — fills the entire panel via ag-ai-workspace-root CSS */}
            <AIChatWorkspace platform={platform} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}