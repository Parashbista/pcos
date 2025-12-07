import api from './api';

export interface Reminder {
  id: string;
  type: 'food' | 'supplement' | 'medication';
  name: string;
  description?: string;
  time: string;
  days: string[];
  isActive: boolean;
}

export interface CreateReminderData {
  type: 'food' | 'supplement' | 'medication';
  name: string;
  description?: string;
  time: string;
  days: string[];
}

export const getReminders = async (): Promise<Reminder[]> => {
  const response = await api.get<Reminder[]>('/api/reminders');
  return response.data;
};

export const createReminder = async (data: CreateReminderData): Promise<Reminder> => {
  const response = await api.post<Reminder>('/api/reminders', data);
  return response.data;
};

export const updateReminder = async (id: string, data: Partial<CreateReminderData>): Promise<Reminder> => {
  const response = await api.put<Reminder>(`/api/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  await api.delete(`/api/reminders/${id}`);
};

export const toggleReminder = async (id: string): Promise<Reminder> => {
  const response = await api.patch<Reminder>(`/api/reminders/${id}/toggle`);
  return response.data;
};
