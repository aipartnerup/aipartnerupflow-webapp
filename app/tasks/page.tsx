'use client';

/**
 * Task List Page
 * 
 * Display list of all tasks with filtering and search
 */

import { Container, Title, Button, Group, TextInput, Table, Badge, ActionIcon, Tooltip, Text, Select, Stack, Alert } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/aipartnerupflow';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { IconPlus, IconSearch, IconEye, IconCopy, IconTrash, IconDatabase, IconInfoCircle, IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export default function TaskListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // List all tasks (not just running ones)
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', searchQuery, statusFilter],
    queryFn: () => apiClient.listTasks({ status: statusFilter }),
  });

  // Check examples status
  const { data: examplesStatus } = useQuery({
    queryKey: ['examples-status'],
    queryFn: () => apiClient.getExamplesStatus(),
    retry: false,
  });

  // Initialize examples mutation
  const initExamplesMutation = useMutation({
    mutationFn: (force: boolean) => apiClient.initExamples(force),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['examples-status'] });
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to initialize examples',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notifications.show({
        title: t('common.success'),
        message: t('tasks.delete') + ' ' + t('common.success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('common.error'),
        message: error.message || t('errors.apiError'),
        color: 'red',
      });
    },
  });

  const copyMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.copyTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notifications.show({
        title: t('common.success'),
        message: t('tasks.copy') + ' ' + t('common.success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('common.error'),
        message: error.message || t('errors.apiError'),
        color: 'red',
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.executeTask(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['running-tasks'] });
      notifications.show({
        title: t('common.success'),
        message: data.message || 'Task execution started',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('common.error'),
        message: error.message || 'Failed to execute task',
        color: 'red',
      });
    },
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

  const filteredTasks = tasks?.filter((task) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>{t('tasks.list')}</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/tasks/create')}
        >
          {t('nav.createTask')}
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder={t('common.search')}
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder={t('tasks.filterByStatus') || 'Filter by status'}
          value={statusFilter || null}
          onChange={(value) => setStatusFilter(value || undefined)}
          data={[
            { value: '', label: t('tasks.allStatuses') || 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          clearable
          style={{ width: 200 }}
        />
      </Group>

      {isLoading ? (
        <Text c="dimmed">{t('common.loading')}</Text>
      ) : filteredTasks.length === 0 ? (
        <Stack gap="md" align="center" py="xl">
          <Text c="dimmed" size="lg">{t('tasks.noTasks')}</Text>
          {examplesStatus?.available && (
            <Stack gap="sm" align="center" style={{ maxWidth: 500 }}>
              <Alert icon={<IconInfoCircle size={16} />} color="blue" title="Initialize Example Data">
                {examplesStatus.initialized
                  ? 'Example tasks are already initialized. You can force re-initialization if needed.'
                  : 'Initialize example tasks to get started. This will create sample tasks demonstrating various features.'}
              </Alert>
              <Group>
                <Button
                  leftSection={<IconDatabase size={16} />}
                  onClick={() => initExamplesMutation.mutate(false)}
                  loading={initExamplesMutation.isPending}
                  variant={examplesStatus.initialized ? 'outline' : 'filled'}
                >
                  {examplesStatus.initialized ? 'Re-initialize Examples' : 'Initialize Examples'}
                </Button>
                {examplesStatus.initialized && (
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => initExamplesMutation.mutate(true)}
                    loading={initExamplesMutation.isPending}
                  >
                    Force Re-initialize
                  </Button>
                )}
              </Group>
            </Stack>
          )}
          {!examplesStatus?.available && (
            <Alert icon={<IconInfoCircle size={16} />} color="yellow" title="Examples Module Not Available">
              Install examples module to enable example data initialization:
              <br />
              <code>pip install aipartnerupflow[examples]</code>
            </Alert>
          )}
        </Stack>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('tasks.id')}</Table.Th>
              <Table.Th>{t('tasks.name')}</Table.Th>
              <Table.Th>{t('tasks.status')}</Table.Th>
              <Table.Th>{t('tasks.progress')}</Table.Th>
              <Table.Th>{t('tasks.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredTasks.map((task) => (
              <Table.Tr key={task.id}>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    {task.id.substring(0, 8)}...
                  </Text>
                </Table.Td>
                <Table.Td>{task.name}</Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(task.status)}>
                    {task.status || 'pending'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {Math.round((task.progress || 0) * 100)}%
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label={t('tasks.view')}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    {(task.status === 'pending' || task.status === 'failed') && (
                      <Tooltip label="Execute Task">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => executeMutation.mutate(task.id)}
                          loading={executeMutation.isPending}
                        >
                          <IconPlayerPlay size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label={t('tasks.copy')}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => copyMutation.mutate(task.id)}
                        loading={copyMutation.isPending}
                      >
                        <IconCopy size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('tasks.delete')}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => deleteMutation.mutate(task.id)}
                        loading={deleteMutation.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}

