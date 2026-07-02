"use client";

/**
 * @fileoverview Floating Voice AI Button — fixed bottom-right corner.
 * Opens VoiceAssistantModal via shared context.
 * Phase 4: Wired to VoiceAssistantContext (replaces Phase 2 shell).
 */
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";

export default function VoiceAIButton() {
  const { openModal } = useVoiceAssistant();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="voice-wave-circle"
          style={{ width: 64, height: 64 }}
        />
        <div
          className="voice-wave-circle"
          style={{ width: 80, height: 80, animationDelay: "0.4s" }}
        />
      </div>

      <motion.button
        id="voice-ai-trigger-btn"
        onClick={() => openModal()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center z-10"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          boxShadow: "0 0 30px rgba(139,92,246,0.5), 0 4px 24px rgba(0,0,0,0.5)",
        }}
        aria-label="Open Voice Assistant"
      >
        <Mic className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}
