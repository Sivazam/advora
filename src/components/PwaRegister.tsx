'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Register PWA service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('📱 [PWA Service Worker Registered]:', registration.scope);
          })
          .catch((error) => {
            console.warn('PWA registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
