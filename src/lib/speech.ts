/**
 * @fileoverview Web Speech API controller for AgriNex AI voice assistant.
 * Provides SpeechController class for speech-to-text and speakText() for TTS.
 * LANGUAGE_CODES map is used by the VoiceAssistantModal and Phase 6 language switcher.
 */

/** BCP-47 language codes for Web Speech API (Indian locales) */
export const LANGUAGE_CODES: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

/** Human-readable language labels */
export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
};

/**
 * SpeechController wraps the Web Speech API SpeechRecognition interface.
 * Handles browser compatibility (webkit prefix) and provides clean start/stop.
 */
export class SpeechController {
  private recognition: any;

  constructor(langCode: string = "en-IN") {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = langCode;
      }
    }
  }

  /** Whether the browser supports speech recognition */
  public get isSupported(): boolean {
    return !!this.recognition;
  }

  /** Update the recognition language on the fly */
  public setLanguage(langCode: string): void {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  /**
   * Start listening for speech input.
   * @param onResult  Callback fired with the final transcript text
   * @param onError   Optional error callback
   */
  public startListening(
    onResult: (text: string) => void,
    onError?: (err: any) => void
  ): void {
    if (!this.recognition) return;
    this.recognition.onresult = (event: any) =>
      onResult(event.results[0][0].transcript);
    this.recognition.onerror = (err: any) => onError?.(err);
    this.recognition.start();
  }

  /** Stop listening */
  public stopListening(): void {
    this.recognition?.stop();
  }
}

/**
 * Speak text aloud using the browser SpeechSynthesis API.
 * @param text     The text to speak
 * @param langCode BCP-47 language code (e.g. "hi-IN")
 */
export function speakText(text: string, langCode: string = "en-IN"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}
