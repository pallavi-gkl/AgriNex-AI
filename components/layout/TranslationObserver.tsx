"use client";

/**
 * @fileoverview TranslationObserver
 * A lightweight client-side component that watches for the
 * "agrinex:language-change" event and uses a MutationObserver
 * to re-translate any text nodes in the DOM that match known
 * dictionary keys — enabling instant, full-page translation
 * without a page reload.
 */

import { useEffect } from "react";
import { DICTIONARY } from "@/hooks/useTranslation";

// Build a flat reverse-lookup: englishText → { langCode: translatedText }
type ReverseMap = Map<string, Record<string, string>>;

let reverseMap: ReverseMap | null = null;

function buildReverseMap(): ReverseMap {
  if (reverseMap) return reverseMap;
  reverseMap = new Map();
  const en = DICTIONARY["en"] || {};
  Object.entries(en).forEach(([key, enText]) => {
    const translations: Record<string, string> = {};
    for (const lang of Object.keys(DICTIONARY)) {
      if (lang !== "en") {
        const val = DICTIONARY[lang]?.[key];
        if (val) translations[lang] = val;
      }
    }
    if (Object.keys(translations).length > 0) {
      // Index by the English value
      reverseMap!.set(enText.trim(), { en: enText, ...translations });
    }
  });
  return reverseMap;
}

// Walk all text nodes under a root element and replace matching text
function translateNode(root: Element, lang: string) {
  const map = buildReverseMap();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const tag = (node.parentElement?.tagName || "").toUpperCase();
      // Skip script/style nodes
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const textNode of nodes) {
    const original = textNode.textContent?.trim() || "";
    if (!original) continue;

    const entry = map.get(original);
    if (entry) {
      const target = lang === "en" ? entry["en"] : entry[lang];
      if (target && textNode.textContent?.trim() !== target) {
        textNode.textContent = textNode.textContent!.replace(original, target);
      }
    }
  }
}

// Also translate placeholder / title / aria-label attributes
function translateAttributes(root: Element, lang: string) {
  const map = buildReverseMap();
  const ATTRS = ["placeholder", "title", "aria-label", "data-tooltip"];

  root.querySelectorAll<HTMLElement>(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
    for (const attr of ATTRS) {
      const val = el.getAttribute(attr);
      if (!val) continue;
      const entry = map.get(val.trim());
      if (entry) {
        const target = lang === "en" ? entry["en"] : entry[lang];
        if (target && val.trim() !== target) {
          el.setAttribute(attr, target);
        }
      }
    }
  });
}

export default function TranslationObserver() {
  useEffect(() => {
    let currentLang = "en";

    // Try to pick up the persisted language immediately
    try {
      const cached = sessionStorage.getItem("agrinex-lang");
      if (cached) currentLang = cached;
    } catch (_) {}

    function applyTranslation(lang: string) {
      currentLang = lang;
      translateNode(document.body, lang);
      translateAttributes(document.body, lang);
    }

    // Apply on mount if language is non-English
    if (currentLang !== "en") {
      applyTranslation(currentLang);
    }

    // Listen for language-change events
    const handleLangChange = (e: Event) => {
      const code = (e as CustomEvent).detail?.code;
      if (code) applyTranslation(code);
    };
    window.addEventListener("agrinex:language-change", handleLangChange);

    // MutationObserver: re-translate newly inserted nodes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE && currentLang !== "en") {
            translateNode(node as Element, currentLang);
            translateAttributes(node as Element, currentLang);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("agrinex:language-change", handleLangChange);
      observer.disconnect();
    };
  }, []);

  return null;
}
