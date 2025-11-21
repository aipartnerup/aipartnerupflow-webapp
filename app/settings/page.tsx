'use client';

/**
 * Settings Page
 * 
 * Configure API settings and authentication
 */

import { Container, Title, Card, Stack, TextInput, Button, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

interface SettingsFormValues {
  apiUrl: string;
  authToken: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();

  const form = useForm<SettingsFormValues>({
    initialValues: {
      apiUrl: typeof window !== 'undefined' ? localStorage.getItem('api_url') || 'http://localhost:8000' : 'http://localhost:8000',
      authToken: typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.setValues({
        apiUrl: localStorage.getItem('api_url') || 'http://localhost:8000',
        authToken: localStorage.getItem('auth_token') || '',
      });
    }
  }, []);

  const handleSubmit = (values: SettingsFormValues) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_url', values.apiUrl);
      if (values.authToken) {
        localStorage.setItem('auth_token', values.authToken);
      } else {
        localStorage.removeItem('auth_token');
      }
      notifications.show({
        title: t('common.success'),
        message: t('settings.saveSettings') + ' ' + t('common.success'),
        color: 'green',
      });
    }
  };

  return (
    <Container size="md">
      <Title order={1} mb="xl">{t('settings.title')}</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <div>
              <Title order={3} mb="md">{t('settings.api')}</Title>
              <TextInput
                label={t('settings.apiUrl')}
                placeholder={t('settings.apiUrlPlaceholder')}
                {...form.getInputProps('apiUrl')}
              />
            </div>

            <Divider />

            <div>
              <Title order={3} mb="md">{t('settings.authentication')}</Title>
              <TextInput
                label={t('settings.authToken')}
                placeholder="Enter JWT token (optional)"
                type="password"
                {...form.getInputProps('authToken')}
              />
            </div>

            <Button type="submit" mt="md">
              {t('settings.saveSettings')}
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}

