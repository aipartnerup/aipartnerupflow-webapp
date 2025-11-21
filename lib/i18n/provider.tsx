'use client';

/**
 * I18n Provider Component
 * 
 * Wraps the app with i18n configuration
 */

import { useEffect } from 'react';
import '@/lib/i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is initialized in config.ts
  }, []);

  return <>{children}</>;
}

