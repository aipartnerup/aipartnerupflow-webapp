'use client';

/**
 * Navigation Bar Component
 * 
 * Left sidebar navigation with menu items and sub-menus
 */

import { AppShell, NavLink, Group, Text } from '@mantine/core';
import {
  IconDashboard,
  IconList,
  IconPlus,
  IconPlayerPlay,
  IconSettings,
  IconChevronRight,
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (path: string) => pathname === path;

  return (
    <AppShell.Navbar p="md">
      <AppShell.Section>
        <Group p="md">
          <Text fw={700} size="lg">
            AIPartnerUpFlow
          </Text>
        </Group>
      </AppShell.Section>

      <AppShell.Section grow mt="md">
        <NavLink
          label={t('nav.dashboard')}
          leftSection={<IconDashboard size={16} />}
          active={isActive('/')}
          onClick={() => router.push('/')}
        />

        <NavLink
          label={t('nav.taskManagement')}
          leftSection={<IconList size={16} />}
          rightSection={<IconChevronRight size={16} />}
        >
          <NavLink
            label={t('nav.taskList')}
            active={isActive('/tasks')}
            onClick={() => router.push('/tasks')}
          />
          <NavLink
            label={t('nav.createTask')}
            leftSection={<IconPlus size={16} />}
            active={isActive('/tasks/create')}
            onClick={() => router.push('/tasks/create')}
          />
          <NavLink
            label={t('nav.runningTasks')}
            leftSection={<IconPlayerPlay size={16} />}
            active={isActive('/tasks/running')}
            onClick={() => router.push('/tasks/running')}
          />
        </NavLink>

        <NavLink
          label={t('nav.settings')}
          leftSection={<IconSettings size={16} />}
          active={isActive('/settings')}
          onClick={() => router.push('/settings')}
        />
      </AppShell.Section>
    </AppShell.Navbar>
  );
}

