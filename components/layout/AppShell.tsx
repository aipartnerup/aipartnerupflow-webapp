'use client';

/**
 * App Shell Component
 * 
 * Main layout wrapper with AppShell, Navbar, and Header
 */

import { AppShell as MantineAppShell } from '@mantine/core';
import { AppNavbar } from './Navbar';
import { AppHeader } from './Header';

interface AppShellWrapperProps {
  children: React.ReactNode;
}

export function AppShellWrapper({ children }: AppShellWrapperProps) {
  return (
    <MantineAppShell
      navbar={{ width: 250, breakpoint: 'sm' }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppNavbar />
      <AppHeader />
      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
