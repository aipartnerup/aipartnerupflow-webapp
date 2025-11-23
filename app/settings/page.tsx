'use client';

/**
 * Settings Page
 * 
 * Configure API settings and authentication
 */

import { Container, Title, Card, Stack, TextInput, Button, Divider, Select, Group, Badge, Text, Tabs } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/aipartnerupflow';

interface SettingsFormValues {
  apiUrl: string;
  authToken: string;
}

interface LLMKeyFormValues {
  llmKey: string;
  provider: string;
}

const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'together', label: 'Together AI' },
  { value: 'ai21', label: 'AI21' },
  { value: 'replicate', label: 'Replicate' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'deepinfra', label: 'DeepInfra' },
  { value: 'default', label: 'Default (Auto-detect)' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const [llmKeyStatus, setLlmKeyStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('header');

  const form = useForm<SettingsFormValues>({
    initialValues: {
      apiUrl: typeof window !== 'undefined' ? localStorage.getItem('api_url') || 'http://localhost:8000' : 'http://localhost:8000',
      authToken: typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '',
    },
  });

  const llmKeyForm = useForm<LLMKeyFormValues>({
    initialValues: {
      llmKey: '',
      provider: 'default',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      form.setValues({
        apiUrl: localStorage.getItem('api_url') || 'http://localhost:8000',
        authToken: localStorage.getItem('auth_token') || '',
      });
      // Check if header-based LLM keys exist (per provider)
      const headerKeys: Record<string, boolean> = {};
      LLM_PROVIDERS.forEach(provider => {
        const key = localStorage.getItem(`llm_api_key_${provider.value}`);
        if (key) {
          headerKeys[provider.value] = true;
        }
      });
      // Also check legacy key (for backward compatibility)
      const legacyKey = localStorage.getItem('llm_api_key');
      if (legacyKey) {
        headerKeys['default'] = true;
      }
      if (Object.keys(headerKeys).length > 0) {
        setLlmKeyStatus(prev => ({ ...prev, ...headerKeys }));
      }
      // Load user config LLM key status
      loadLLMKeyStatus();
    }
  }, []);

  const loadLLMKeyStatus = async () => {
    try {
      const status = await apiClient.getLLMKeyStatus();
      const providers: Record<string, boolean> = {};
      if (status.providers) {
        Object.keys(status.providers).forEach(provider => {
          providers[provider] = true;
        });
      }
      if (status.has_key && status.provider) {
        providers[status.provider] = true;
      }
      setLlmKeyStatus(prev => ({ ...prev, ...providers }));
    } catch (error) {
      // User config extension might not be available, ignore
      console.debug('Could not load LLM key status:', error);
    }
  };

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

  const handleLLMKeySubmit = async (values: LLMKeyFormValues) => {
    if (!values.llmKey.trim()) {
      notifications.show({
        title: 'Error',
        message: 'LLM API key is required',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'header') {
        // Request Header method: store in localStorage per provider
        if (typeof window !== 'undefined') {
          const providerKey = values.provider === 'default' ? 'llm_api_key' : `llm_api_key_${values.provider}`;
          localStorage.setItem(providerKey, values.llmKey);
          setLlmKeyStatus(prev => ({ ...prev, [values.provider]: true }));
          notifications.show({
            title: 'Success',
            message: `LLM API key saved for provider: ${values.provider === 'default' ? 'Default' : values.provider} (Request Header method)`,
            color: 'green',
          });
          llmKeyForm.reset();
        }
      } else {
        // User Config method: save via API
        const provider = values.provider === 'default' ? undefined : values.provider;
        await apiClient.setLLMKey(values.llmKey, provider);
        await loadLLMKeyStatus();
        notifications.show({
          title: 'Success',
          message: `LLM API key saved for provider: ${provider || 'default'}`,
          color: 'green',
        });
        llmKeyForm.reset();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.error?.message || error?.message || 'Failed to save LLM key',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLLMKey = async (provider?: string) => {
    setLoading(true);
    try {
      // Check if this is a header-based key (stored in localStorage)
      const isHeaderKey = typeof window !== 'undefined' && (
        provider === 'default' ? localStorage.getItem('llm_api_key') : localStorage.getItem(`llm_api_key_${provider}`)
      );
      
      if (isHeaderKey) {
        // Remove from localStorage
        if (typeof window !== 'undefined') {
          const providerKey = provider === 'default' ? 'llm_api_key' : `llm_api_key_${provider}`;
          localStorage.removeItem(providerKey);
          setLlmKeyStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[provider || 'default'];
            return newStatus;
          });
          notifications.show({
            title: 'Success',
            message: `LLM API key removed for provider: ${provider === 'default' ? 'Default' : provider} (Request Header method)`,
            color: 'green',
          });
        }
      } else {
        // Delete via API (User Config method)
        const providerToDelete = provider === 'default' ? undefined : provider;
        await apiClient.deleteLLMKey(providerToDelete);
        await loadLLMKeyStatus();
        notifications.show({
          title: 'Success',
          message: `LLM API key deleted for provider: ${providerToDelete || 'default'}`,
          color: 'green',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.error?.message || error?.message || 'Failed to delete LLM key',
        color: 'red',
      });
    } finally {
      setLoading(false);
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

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Title order={3} mb="md">LLM API Key Configuration</Title>
        <Text size="sm" c="dimmed" mb="lg">
          Configure LLM API keys for executing AI tasks. You can use either Request Header method (stored locally) or User Config method (stored on server).
        </Text>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="header">Request Header (Local)</Tabs.Tab>
            <Tabs.Tab value="config">User Config (Server)</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="header" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Store LLM API keys in browser localStorage. Keys will be sent as X-LLM-API-KEY header with each request. 
                You can configure different keys for different providers (OpenAI, Anthropic, Google, etc.).
              </Text>
              
              {Object.keys(llmKeyStatus).filter(p => LLM_PROVIDERS.some(prov => prov.value === p)).length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Configured Providers:</Text>
                  <Stack gap="xs">
                    {Object.keys(llmKeyStatus)
                      .filter(p => LLM_PROVIDERS.some(prov => prov.value === p))
                      .map(provider => (
                        <Group key={provider} justify="space-between">
                          <Group gap="xs">
                            <Badge color="green">{provider === 'default' ? 'Default' : provider}</Badge>
                            <Text size="sm">API key configured (Request Header)</Text>
                          </Group>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteLLMKey(provider)}
                            loading={loading}
                          >
                            Delete
                          </Button>
                        </Group>
                      ))}
                  </Stack>
                </div>
              )}

              <form onSubmit={llmKeyForm.onSubmit(handleLLMKeySubmit)}>
                <Stack gap="md">
                  <Select
                    label="Provider"
                    placeholder="Select LLM provider"
                    data={LLM_PROVIDERS}
                    {...llmKeyForm.getInputProps('provider')}
                  />
                  <TextInput
                    label="LLM API Key"
                    placeholder="Enter your LLM API key"
                    type="password"
                    {...llmKeyForm.getInputProps('llmKey')}
                  />
                  <Button type="submit" loading={loading}>
                    Save LLM Key (Request Header)
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="config" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Store LLM API key on the server. Supports multiple providers per user. Requires llm-key-config extension.
              </Text>

              {Object.keys(llmKeyStatus).filter(p => p !== 'header').length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Configured Providers:</Text>
                  <Stack gap="xs">
                    {Object.keys(llmKeyStatus)
                      .filter(p => p !== 'header')
                      .map(provider => (
                        <Group key={provider} justify="space-between">
                          <Group gap="xs">
                            <Badge color="green">{provider === 'default' ? 'Default' : provider}</Badge>
                            <Text size="sm">API key configured</Text>
                          </Group>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteLLMKey(provider)}
                            loading={loading}
                          >
                            Delete
                          </Button>
                        </Group>
                      ))}
                  </Stack>
                </div>
              )}

              <form onSubmit={llmKeyForm.onSubmit(handleLLMKeySubmit)}>
                <Stack gap="md">
                  <Select
                    label="Provider"
                    placeholder="Select LLM provider"
                    data={LLM_PROVIDERS}
                    {...llmKeyForm.getInputProps('provider')}
                  />
                  <TextInput
                    label="LLM API Key"
                    placeholder="Enter your LLM API key"
                    type="password"
                    {...llmKeyForm.getInputProps('llmKey')}
                  />
                  <Button type="submit" loading={loading}>
                    Save LLM Key (User Config)
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Container>
  );
}

