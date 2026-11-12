"use client";

import { useEffect, useSyncExternalStore } from "react";
import { translations } from "./translations";

type Language = "th" | "en";
const storageKey = "nextcore-language";
const listeners = new Set<() => void>();
let selectedLanguage: Language | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readLanguage(): Language {
  try {
    return (localStorage.getItem(storageKey) ?? selectedLanguage) === "th" ? "th" : "en";
  } catch {
    return selectedLanguage ?? "en";
  }
}

function serverLanguage(): Language {
  return "en";
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, readLanguage, serverLanguage);
  return {
    language,
    translate: (text: string) => translations[text]?.[language] ?? text,
  };
}

export function LanguageDocument() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return null;
}

export function LanguageToggle() {
  const { language } = useLanguage();

  function toggle() {
    const next = language === "en" ? "th" : "en";
    selectedLanguage = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The selection still works for this visit.
    }
    listeners.forEach((listener) => listener());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      lang={language === "en" ? "th" : "en"}
      aria-label={language === "en" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
      className="shrink-0 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-white hover:border-red-500"
    >
      {language === "en" ? "ไทย" : "EN"}
    </button>
  );
}

export function Text({ children }: { children: string }) {
  return useLanguage().translate(children);
}
