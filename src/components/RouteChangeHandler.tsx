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
      setIsLoading(true);
      // Minimal loading time for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPreviousPath(pathname);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  return (
    <>
      {isLoading && <PageLoading />}
      <div style={{ opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        {children}
      </div>
    </>
  );
}