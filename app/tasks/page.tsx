'use client';

/**
 * Task List Page
 * 
 * Display list of all tasks with filtering and search
 */

import { Container, Title, Button, Group, TextInput, Table, Badge, ActionIcon, Tooltip, Text } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/aipartnerupflow';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { IconPlus, IconSearch, IconEye, IconCopy, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export default function TaskListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Note: This is a placeholder - you may need to implement a list endpoint
  // For now, we'll use running tasks as an example
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', searchQuery],
    queryFn: () => apiClient.getRunningTasks(),
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
      </Group>

      {isLoading ? (
        <Text c="dimmed">{t('common.loading')}</Text>
      ) : filteredTasks.length === 0 ? (
        <Text c="dimmed">{t('tasks.noTasks')}</Text>
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

