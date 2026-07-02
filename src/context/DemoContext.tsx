"use client";

/**
 * @fileoverview Demo Mode context — toggles between live Supabase data
 * and realistic seed data for competition demonstrations.
 */
import React, { createContext, useContext, useState, useEffect } from "react";

interface DemoContextValue {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (val: boolean) => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemoMode: true,
  toggleDemoMode: () => {},
  setDemoMode: () => {},
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // Default to demo mode ON so judges see data immediately
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("agrinex_demo_mode");
    if (stored !== null) {
      setIsDemoMode(stored === "true");
    }
  }, []);

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem("agrinex_demo_mode", String(val));
  };

  const toggleDemoMode = () => setDemoMode(!isDemoMode);

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoContext);
}
