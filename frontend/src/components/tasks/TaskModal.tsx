import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskPriority, TaskStatus } from '../../types';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null; // null = create, Task = edit
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
}

export default function TaskModal({ open, onClose, task, onSubmit }: TaskModalProps) {
  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setAssigneeId(task.assignee_id || '');
      setDueDate(task.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setAssigneeId('');
      setDueDate('');
    }
    setError('');
  }, [task, open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          assignee_id: assigneeId.trim() || undefined,
          due_date: dueDate,
        } as UpdateTaskPayload);
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          priority,
          assignee_id: assigneeId.trim() || undefined,
          due_date: dueDate,
        } as CreateTaskPayload);
      }
      onClose();
    } catch {
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          id="task-title-input"
          autoFocus
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement user authentication"
        />

        <TextField
          id="task-description-input"
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            id="task-priority-select"
            select
            label="Priority"
            fullWidth
            margin="normal"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <MenuItem value="low">🟢 Low</MenuItem>
            <MenuItem value="medium">🟡 Medium</MenuItem>
            <MenuItem value="high">🔴 High</MenuItem>
          </TextField>

          {isEdit && (
            <TextField
              id="task-status-select"
              select
              label="Status"
              fullWidth
              margin="normal"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <MenuItem value="todo">📋 To Do</MenuItem>
              <MenuItem value="in_progress">🔄 In Progress</MenuItem>
              <MenuItem value="done">✅ Done</MenuItem>
            </TextField>
          )}
        </Box>

        <TextField
          id="task-assignee-input"
          label="Assignee"
          fullWidth
          margin="normal"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          placeholder="Assignee ID (e.g. usr_001)"
          helperText="Enter the user ID to assign this task"
        />

        <TextField
          id="task-due-date-input"
          label="Due Date"
          type="date"
          fullWidth
          margin="normal"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          id="task-submit-btn"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
