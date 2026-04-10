import { Box, Typography, Chip, Button } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Add } from '@mui/icons-material';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../../types';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
}

const columnConfig: Record<TaskStatus, { label: string; color: string; emoji: string }> = {
  todo: { label: 'To Do', color: '#6366f1', emoji: '📋' },
  in_progress: { label: 'In Progress', color: '#f59e0b', emoji: '🔄' },
  done: { label: 'Done', color: '#10b981', emoji: '✅' },
};

export default function TaskColumn({ status, tasks, onEdit, onDelete, onAddTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 280,
        maxWidth: { xs: '100%', md: 400 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          px: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1.1rem' }}>{config.emoji}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {config.label}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              bgcolor: `${config.color}18`,
              color: config.color,
              fontWeight: 700,
              height: 22,
              minWidth: 22,
              fontSize: '0.75rem',
            }}
          />
        </Box>
        {status === 'todo' && (
          <Button
            size="small"
            startIcon={<Add />}
            onClick={onAddTask}
            sx={{ fontSize: '0.8rem', minWidth: 'auto' }}
          >
            Add
          </Button>
        )}
      </Box>

      {/* Droppable area */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Box
          ref={setNodeRef}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 1.5,
            borderRadius: 3,
            bgcolor: (theme) =>
              isOver
                ? theme.palette.mode === 'dark'
                  ? 'rgba(99,102,241,0.08)'
                  : 'rgba(99,102,241,0.04)'
                : theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(0,0,0,0.015)',
            border: 2,
            borderColor: isOver ? 'primary.main' : 'transparent',
            borderStyle: 'dashed',
            transition: 'all 0.2s ease',
            minHeight: 200,
          }}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                Drop tasks here
              </Typography>
            </Box>
          )}
        </Box>
      </SortableContext>
    </Box>
  );
}
