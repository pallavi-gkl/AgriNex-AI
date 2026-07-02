"use client";

/**
 * @fileoverview VoiceAssistantContext — global state provider for the
 * Voice Assistant modal. Allows any component (VoiceAIButton, marketplace
 * mic button, etc.) to open/close the modal and pass pre-context.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface VoiceAssistantContextValue {
  isOpen: boolean;
  preContext: string | null;
  openModal: (preContext?: string) => void;
  closeModal: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextValue>({
  isOpen: false,
  preContext: null,
  openModal: () => {},
  closeModal: () => {},
});

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preContext, setPreContext] = useState<string | null>(null);

  const openModal = useCallback((ctx?: string) => {
    setPreContext(ctx ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPreContext(null);
  }, []);

  return (
    <VoiceAssistantContext.Provider value={{ isOpen, preContext, openModal, closeModal }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
}

export function useVoiceAssistant() {
  return useContext(VoiceAssistantContext);
}
