'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface NavbarContextType {
  hasAnimated: boolean;
  setHasAnimated: (animated: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if navbar has already animated in this session
    const hasVisited = sessionStorage.getItem('navbar-has-visited');
    const globalAnimated = typeof window !== 'undefined' ? window.__NAVBAR_ANIMATED__ : false;
    
    if (hasVisited || globalAnimated) {
      setHasAnimated(true);
    }
  }, []);

  const handleSetHasAnimated = (animated: boolean) => {
    setHasAnimated(animated);
    if (animated && typeof window !== 'undefined') {
      sessionStorage.setItem('navbar-has-visited', 'true');
      window.__NAVBAR_ANIMATED__ = true;
    }
  };

  return (
    <NavbarContext.Provider value={{ hasAnimated, setHasAnimated: handleSetHasAnimated }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}