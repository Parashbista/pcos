import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createReminder, getReminders, updateReminder, deleteReminder, toggleReminder } from '../controllers/reminder.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createReminder);
router.get('/', getReminders);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/toggle', toggleReminder);

export default router;
