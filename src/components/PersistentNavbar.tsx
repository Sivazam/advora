'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

export default function PersistentNavbar() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client-side to prevent hydration issues
  if (!isClient) {
    return null;
  }

  return <Navbar />;
}