
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'inProcess', 'completed']),
  dueDate: z.string().optional(),
  assignedTo: z.array(z.string()),
  projectId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
