'use client';

/**
 * Task Detail Page
 * 
 * Display detailed information about a task, including tree structure
 */

import { Container, Title, Button, Group, Card, Text, Badge, Stack, Code, Tabs, Progress } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { apiClient, Task } from '@/lib/api/aipartnerupflow';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconTree, IconInfoCircle, IconCode, IconFileText } from '@tabler/icons-react';
import { TaskTreeView } from '@/components/tasks/TaskTreeView';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', params.id],
    queryFn: () => apiClient.getTask(params.id),
  });

  const { data: taskTree } = useQuery({
    queryKey: ['task-tree', params.id],
    queryFn: () => apiClient.getTaskTree(params.id),
    enabled: !!task,
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'in_progress':
        return 'blue';
      case 'cancelled':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  if (isLoading) {
    return (
      <Container size="xl">
        <Text c="dimmed">{t('common.loading')}</Text>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container size="xl">
        <Text c="red">{t('errors.taskNotFound')}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          {t('common.back')}
        </Button>
      </Group>

      <Title order={1} mb="xl">{task.name}</Title>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={16} />}>
            {t('tasks.detail')}
          </Tabs.Tab>
          <Tabs.Tab value="tree" leftSection={<IconTree size={16} />}>
            Tree View
          </Tabs.Tab>
          <Tabs.Tab value="inputs" leftSection={<IconCode size={16} />}>
            {t('taskForm.inputs')}
          </Tabs.Tab>
          <Tabs.Tab value="result" leftSection={<IconFileText size={16} />}>
            Result
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text fw={500}>{t('tasks.status')}</Text>
                <Badge color={getStatusColor(task.status)} size="lg">
                  {task.status || 'pending'}
                </Badge>
              </Group>
              {task.progress !== undefined && (
                <>
                  <Text fw={500} mb="xs">{t('tasks.progress')}</Text>
                  <Progress value={(task.progress || 0) * 100} mb="md" />
                </>
              )}
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">{t('tasks.id')}</Text>
                  <Code>{task.id}</Code>
                </div>
                {task.parent_id && (
                  <div>
                    <Text size="sm" c="dimmed">Parent ID</Text>
                    <Code>{task.parent_id}</Code>
                  </div>
                )}
              </Group>
              {task.created_at && (
                <Group justify="space-between" mt="md">
                  <div>
                    <Text size="sm" c="dimmed">{t('tasks.createdAt')}</Text>
                    <Text size="sm">{new Date(task.created_at).toLocaleString()}</Text>
                  </div>
                  {task.updated_at && (
                    <div>
                      <Text size="sm" c="dimmed">{t('tasks.updatedAt')}</Text>
                      <Text size="sm">{new Date(task.updated_at).toLocaleString()}</Text>
                    </div>
                  )}
                </Group>
              )}
            </Card>

            {task.error && (
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-6)' }}>
                <Text fw={500} c="red" mb="xs">Error</Text>
                <Code block>{task.error}</Code>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="tree" pt="md">
          {taskTree ? (
            <TaskTreeView task={taskTree} />
          ) : (
            <Text c="dimmed">No tree data available</Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="inputs" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Code block>{JSON.stringify(task.inputs || {}, null, 2)}</Code>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="result" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Code block>{JSON.stringify(task.result || {}, null, 2)}</Code>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

