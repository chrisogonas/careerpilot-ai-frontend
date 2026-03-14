"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type {
  TodoItem,
  TodoSubtask,
  TodoReminder,
  TodoListResponse,
  CreateTodoPayload,
  UpdateTodoPayload,
  CreateTodoReminderPayload,
  DueTodoRemindersResponse,
  SnoozeDuration,
  TodoStatus,
  TodoCategory,
  TodoPriority,
} from "@/lib/types";

export interface UseTodosReturn {
  getTodos: (filters?: { status?: TodoStatus; category?: TodoCategory; priority?: TodoPriority }) => Promise<TodoListResponse>;
  getTodo: (todoId: string) => Promise<TodoItem>;
  createTodo: (payload: CreateTodoPayload) => Promise<TodoItem>;
  updateTodo: (todoId: string, payload: UpdateTodoPayload) => Promise<TodoItem>;
  deleteTodo: (todoId: string) => Promise<void>;
  addSubtask: (todoId: string, title: string) => Promise<TodoSubtask>;
  updateSubtask: (todoId: string, subtaskId: string, data: Partial<TodoSubtask>) => Promise<TodoSubtask>;
  deleteSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  createTodoReminder: (todoId: string, payload: CreateTodoReminderPayload) => Promise<TodoReminder>;
  updateTodoReminder: (todoId: string, payload: Partial<CreateTodoReminderPayload>) => Promise<TodoReminder>;
  deleteTodoReminder: (todoId: string) => Promise<void>;
  snoozeTodoReminder: (todoId: string, duration: SnoozeDuration) => Promise<TodoReminder>;
  dismissTodoReminder: (todoId: string) => Promise<TodoReminder>;
  completeTodoReminder: (todoId: string) => Promise<TodoReminder>;
  getDueTodoReminders: () => Promise<DueTodoRemindersResponse>;
}

export function useTodosApi(): UseTodosReturn {
  const getTodos = useCallback(async (filters?: { status?: TodoStatus; category?: TodoCategory; priority?: TodoPriority }): Promise<TodoListResponse> => {
    return await apiClient.getTodos(filters);
  }, []);

  const getTodo = useCallback(async (todoId: string): Promise<TodoItem> => {
    return await apiClient.getTodo(todoId);
  }, []);

  const createTodo = useCallback(async (payload: CreateTodoPayload): Promise<TodoItem> => {
    return await apiClient.createTodo(payload);
  }, []);

  const updateTodo = useCallback(async (todoId: string, payload: UpdateTodoPayload): Promise<TodoItem> => {
    return await apiClient.updateTodo(todoId, payload);
  }, []);

  const deleteTodo = useCallback(async (todoId: string): Promise<void> => {
    await apiClient.deleteTodo(todoId);
  }, []);

  const addSubtask = useCallback(async (todoId: string, title: string): Promise<TodoSubtask> => {
    return await apiClient.addSubtask(todoId, title);
  }, []);

  const updateSubtask = useCallback(async (todoId: string, subtaskId: string, data: Partial<TodoSubtask>): Promise<TodoSubtask> => {
    return await apiClient.updateSubtask(todoId, subtaskId, data);
  }, []);

  const deleteSubtask = useCallback(async (todoId: string, subtaskId: string): Promise<void> => {
    await apiClient.deleteSubtask(todoId, subtaskId);
  }, []);

  const createTodoReminder = useCallback(async (todoId: string, payload: CreateTodoReminderPayload): Promise<TodoReminder> => {
    return await apiClient.createTodoReminder(todoId, payload);
  }, []);

  const updateTodoReminder = useCallback(async (todoId: string, payload: Partial<CreateTodoReminderPayload>): Promise<TodoReminder> => {
    return await apiClient.updateTodoReminder(todoId, payload);
  }, []);

  const deleteTodoReminder = useCallback(async (todoId: string): Promise<void> => {
    await apiClient.deleteTodoReminder(todoId);
  }, []);

  const snoozeTodoReminder = useCallback(async (todoId: string, duration: SnoozeDuration): Promise<TodoReminder> => {
    return await apiClient.snoozeTodoReminder(todoId, duration);
  }, []);

  const dismissTodoReminder = useCallback(async (todoId: string): Promise<TodoReminder> => {
    return await apiClient.dismissTodoReminder(todoId);
  }, []);

  const completeTodoReminder = useCallback(async (todoId: string): Promise<TodoReminder> => {
    return await apiClient.completeTodoReminder(todoId);
  }, []);

  const getDueTodoReminders = useCallback(async (): Promise<DueTodoRemindersResponse> => {
    try {
      return await apiClient.getDueTodoReminders();
    } catch {
      return { due_reminders: [], count: 0 };
    }
  }, []);

  return {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    createTodoReminder,
    updateTodoReminder,
    deleteTodoReminder,
    snoozeTodoReminder,
    dismissTodoReminder,
    completeTodoReminder,
    getDueTodoReminders,
  };
}
