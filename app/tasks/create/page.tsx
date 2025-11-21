'use client';

/**
 * Create Task Page
 * 
 * Form to create new tasks
 */

import { Container, Title, Button, Card, Stack, TextInput, Select, Textarea, NumberInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Task } from '@/lib/api/aipartnerupflow';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';

interface TaskFormValues {
  name: string;
  executor: string;
  priority: number;
  inputs: string;
  user_id?: string;
}

export default function CreateTaskPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormValues>({
    initialValues: {
      name: '',
      executor: '',
      priority: 2,
      inputs: '{}',
      user_id: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Task name is required' : null),
      executor: (value) => (value.length < 1 ? 'Executor is required' : null),
      inputs: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Invalid JSON format';
        }
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: (task: Task) => apiClient.createTasks(task),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notifications.show({
        title: t('common.success'),
        message: t('taskForm.create') + ' ' + t('common.success'),
        color: 'green',
      });
      router.push(`/tasks/${data.root_task_id}`);
    },
    onError: (error: any) => {
      notifications.show({
        title: t('common.error'),
        message: error.message || t('errors.apiError'),
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: TaskFormValues) => {
    try {
      const inputs = JSON.parse(values.inputs);
      const task: Task = {
        id: `task-${Date.now()}`,
        name: values.name,
        user_id: values.user_id || undefined,
        priority: values.priority,
        schemas: {
          method: values.executor,
        },
        inputs,
      };
      createMutation.mutate(task);
    } catch (error) {
      notifications.show({
        title: t('common.error'),
        message: 'Invalid JSON format',
        color: 'red',
      });
    }
  };

  return (
    <Container size="md">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="xl"
      >
        {t('common.back')}
      </Button>

      <Title order={1} mb="xl">{t('taskForm.title')}</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('taskForm.name')}
              placeholder={t('taskForm.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label={t('taskForm.executor')}
              placeholder={t('taskForm.executorPlaceholder')}
              description="Enter the executor ID (e.g., system_info_executor)"
              required
              {...form.getInputProps('executor')}
            />

            <Select
              label={t('taskForm.priority')}
              data={[
                { value: '0', label: t('taskForm.priorityUrgent') },
                { value: '1', label: t('taskForm.priorityHigh') },
                { value: '2', label: t('taskForm.priorityNormal') },
                { value: '3', label: t('taskForm.priorityLow') },
              ]}
              value={form.values.priority.toString()}
              onChange={(value) => form.setFieldValue('priority', parseInt(value || '2'))}
            />

            <TextInput
              label="User ID (Optional)"
              placeholder="Enter user ID"
              {...form.getInputProps('user_id')}
            />

            <Textarea
              label={t('taskForm.inputs')}
              placeholder='{"key": "value"}'
              minRows={6}
              required
              {...form.getInputProps('inputs')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => router.back()}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {t('taskForm.createAndExecute')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}

