'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SplashContextType {
  isSplashVisible: boolean;
  hasSplashCompleted: boolean;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hasSplashCompleted, setHasSplashCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
      setHasSplashCompleted(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SplashContext.Provider value={{ isSplashVisible, hasSplashCompleted }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}