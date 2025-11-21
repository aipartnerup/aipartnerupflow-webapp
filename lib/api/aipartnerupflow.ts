/**
 * AIPartnerUpFlow API Client
 * 
 * This client handles all communication with the aipartnerupflow API server
 * using JSON-RPC 2.0 protocol.
 */

import axios, { AxiosInstance } from 'axios';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

export interface Task {
  id: string;
  name: string;
  user_id?: string;
  parent_id?: string;
  priority?: number;
  dependencies?: Array<{ id: string; required: boolean }>;
  inputs?: Record<string, any>;
  schemas?: Record<string, any>;
  params?: Record<string, any>;
  status?: string;
  progress?: number;
  result?: any;
  error?: string;
  created_at?: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  children?: Task[];
  original_task_id?: string;
  has_copy?: boolean;
}

export interface TaskTree extends Task {
  children: Task[];
}

export interface CreateTaskResponse {
  status: string;
  root_task_id: string;
  progress: number;
  task_count: number;
}

export interface RunningTask {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export interface RunningTaskStatus {
  task_id: string;
  status: string;
  message?: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  uptime: number;
}

export class AIPartnerUpFlowClient {
  private client: AxiosInstance;
  private requestId = 0;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication if needed
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  private async rpcRequest<T>(endpoint: string, method: string, params?: any): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.requestId,
    };

    try {
      const response = await this.client.post<JsonRpcResponse<T>>(endpoint, request);
      
      if (response.data.error) {
        throw new Error(response.data.error.message || 'RPC Error');
      }
      
      return response.data.result as T;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'RPC Error');
      }
      throw error;
    }
  }

  // Task Management Methods

  /**
   * Create one or more tasks and execute them
   */
  async createTasks(tasks: Task[] | Task): Promise<CreateTaskResponse> {
    const taskArray = Array.isArray(tasks) ? tasks : [tasks];
    return this.rpcRequest<CreateTaskResponse>('/tasks', 'tasks.create', taskArray);
  }

  /**
   * Get task details by ID
   */
  async getTask(taskId: string): Promise<Task> {
    return this.rpcRequest<Task>('/tasks', 'tasks.get', { task_id: taskId });
  }

  /**
   * Get task detail (alias for getTask)
   */
  async getTaskDetail(taskId: string): Promise<Task> {
    return this.rpcRequest<Task>('/tasks', 'tasks.detail', { task_id: taskId });
  }

  /**
   * Get task tree structure starting from a task
   */
  async getTaskTree(taskId?: string, rootId?: string): Promise<TaskTree> {
    const params: any = {};
    if (taskId) params.task_id = taskId;
    if (rootId) params.root_id = rootId;
    return this.rpcRequest<TaskTree>('/tasks', 'tasks.tree', params);
  }

  /**
   * Update task properties
   */
  async updateTask(
    taskId: string,
    updates: {
      status?: string;
      inputs?: Record<string, any>;
      result?: any;
      error?: string;
      progress?: number;
      started_at?: string;
      completed_at?: string;
    }
  ): Promise<Task> {
    return this.rpcRequest<Task>('/tasks', 'tasks.update', {
      task_id: taskId,
      ...updates,
    });
  }

  /**
   * Delete a task (marks as deleted)
   */
  async deleteTask(taskId: string): Promise<{ success: boolean; task_id: string }> {
    return this.rpcRequest<{ success: boolean; task_id: string }>('/tasks', 'tasks.delete', {
      task_id: taskId,
    });
  }

  /**
   * Create a copy of a task tree for re-execution
   */
  async copyTask(taskId: string): Promise<TaskTree> {
    return this.rpcRequest<TaskTree>('/tasks', 'tasks.copy', { task_id: taskId });
  }

  /**
   * Cancel one or more running tasks
   */
  async cancelTasks(taskIds: string[], force = false): Promise<RunningTaskStatus[]> {
    return this.rpcRequest<RunningTaskStatus[]>('/tasks', 'tasks.cancel', {
      task_ids: taskIds,
      force,
    });
  }

  /**
   * List currently running tasks
   */
  async getRunningTasks(userId?: string, limit = 100): Promise<RunningTask[]> {
    return this.rpcRequest<RunningTask[]>('/tasks', 'tasks.running.list', {
      user_id: userId,
      limit,
    });
  }

  /**
   * Get status of one or more running tasks
   */
  async getRunningTaskStatus(taskIds: string[]): Promise<RunningTaskStatus[]> {
    return this.rpcRequest<RunningTaskStatus[]>('/tasks', 'tasks.running.status', {
      task_ids: taskIds,
    });
  }

  /**
   * Get count of running tasks
   */
  async getRunningTaskCount(userId?: string): Promise<{ count: number; user_id?: string }> {
    return this.rpcRequest<{ count: number; user_id?: string }>('/tasks', 'tasks.running.count', {
      user_id: userId,
    });
  }

  // System Methods

  /**
   * Check system health status
   */
  async getHealth(): Promise<SystemHealth> {
    return this.rpcRequest<SystemHealth>('/system', 'system.health', {});
  }

  /**
   * Get agent card (A2A Protocol)
   */
  async getAgentCard(): Promise<any> {
    const response = await this.client.get('/.well-known/agent-card');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new AIPartnerUpFlowClient();

