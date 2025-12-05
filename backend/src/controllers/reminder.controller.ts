import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReminderModel } from '../models/reminder.model';

export async function createReminder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, name, description, time, days, isActive = true } = req.body;
    const userId = req.userId!;

    if (!type || !name || !time || !days || days.length === 0) {
      res.status(400).json({ error: 'Type, name, time, and days are required' });
      return;
    }

    const reminder = await ReminderModel.create({
      userId: new ObjectId(userId),
      type,
      name,
      description,
      time,
      days,
      isActive
    });

    res.status(201).json({
      id: reminder._id!.toString(),
      type: reminder.type,
      name: reminder.name,
      description: reminder.description,
      time: reminder.time,
      days: reminder.days,
      isActive: reminder.isActive
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getReminders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const reminders = await ReminderModel.findByUserId(userId);

    res.status(200).json(reminders.map(r => ({
      id: r._id!.toString(),
      type: r.type,
      name: r.name,
      description: r.description,
      time: r.time,
      days: r.days,
      isActive: r.isActive
    })));
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateReminder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updates = req.body;

    const reminder = await ReminderModel.update(id, userId, updates);
    if (!reminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    res.status(200).json({
      id: reminder._id!.toString(),
      type: reminder.type,
      name: reminder.name,
      description: reminder.description,
      time: reminder.time,
      days: reminder.days,
      isActive: reminder.isActive
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteReminder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const deleted = await ReminderModel.delete(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function toggleReminder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const reminder = await ReminderModel.toggleActive(id, userId);
    if (!reminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    res.status(200).json({
      id: reminder._id!.toString(),
      type: reminder.type,
      name: reminder.name,
      description: reminder.description,
      time: reminder.time,
      days: reminder.days,
      isActive: reminder.isActive
    });
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
