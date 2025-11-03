'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageLoading from './PageLoading';

export default function RouteChangeHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPath) {
      // Scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Instant transition - no visible loading
      setIsLoading(true);
      setPreviousPath(pathname);
      
      // Immediately show new content
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 50); // Almost instant
      
      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  return (
    <>
      {/* PageLoading is invisible but kept for structure */}
      {isLoading && <PageLoading />}
      <div style={{ 
        opacity: isLoading ? 0.95 : 1, 
        transition: 'opacity 0.05s ease-in-out',
        transform: 'translateZ(0)' // Hardware acceleration
      }}>
        {children}
      </div>
    </>
  );
}