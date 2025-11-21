'use client';

/**
 * Header Component
 * 
 * Top header bar with title and user actions
 */

import { Group, Text, Select } from '@mantine/core';
import { AppShell } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || 'en';
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      setLanguage(value);
      i18n.changeLanguage(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', value);
      }
    }
  };

  return (
    <AppShell.Header p="md">
      <Group justify="space-between" h="100%">
        <Text fw={600} size="lg">
          {t('common.dashboard')}
        </Text>
        <Group>
          <Select
            leftSection={<IconLanguage size={16} />}
            value={language}
            onChange={handleLanguageChange}
            data={[
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文' },
            ]}
            w={120}
          />
        </Group>
      </Group>
    </AppShell.Header>
  );
}

