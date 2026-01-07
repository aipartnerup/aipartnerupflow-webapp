'use client';

/**
 * App Shell Component
 * 
 * Main layout wrapper with AppShell and Navbar (left sidebar only)
 */

import { AppShell as MantineAppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppNavbar } from './Navbar';
import { useAutoLoginContext } from '@/lib/contexts/AutoLoginContext';
import { useEffect } from 'react';

interface AppShellWrapperProps {
  children: React.ReactNode;
}

export function AppShellWrapper({ children }: AppShellWrapperProps) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  
  // Get auto-login status from context
  const autoLoginStatus = useAutoLoginContext();
  
  useEffect(() => {
    // Auto-login detection runs automatically via AutoLoginProvider
    // The status can be used for future features like showing notifications
    if (autoLoginStatus.enabled && autoLoginStatus.verified) {
      // Auto-login is enabled and verified
      // Future: Could show a notification or update UI state here
      console.debug('Auto-login enabled and verified');
    }
  }, [autoLoginStatus]);

  return (
    <MantineAppShell
      navbar={{
        width: desktopOpened ? 260 : 60,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
          {/* Mobile menu toggle in header so it's accessible when navbar is hidden */}
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
        </div>
      </MantineAppShell.Header>
      <AppNavbar 
        onNavigate={closeMobile}
        mobileOpened={mobileOpened}
        desktopOpened={desktopOpened}
        onToggleMobile={toggleMobile}
        onToggleDesktop={toggleDesktop}
      />
      <MantineAppShell.Main style={{ transition: 'background-color 0.2s ease' }}>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
