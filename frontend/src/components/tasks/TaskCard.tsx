import { memo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { Delete, Edit, CalendarToday, Flag } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityConfig = {
  high: { color: '#ef4444' as const, bg: '#fef2f2', label: 'High' },
  medium: { color: '#f59e0b' as const, bg: '#fffbeb', label: 'Medium' },
  low: { color: '#10b981' as const, bg: '#ecfdf5', label: 'Low' },
};

export default memo(function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '&:hover .task-actions': { opacity: 1 },
        borderLeft: 3,
        borderColor: priority.color,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Title + Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              flex: 1,
              mr: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.title}
          </Typography>
          <Box
            className="task-actions"
            sx={{
              display: 'flex',
              opacity: 0,
              transition: 'opacity 0.2s',
              gap: 0.25,
              flexShrink: 0,
            }}
          >
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                sx={{ width: 26, height: 26 }}
              >
                <Edit sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                sx={{ width: 26, height: 26, color: 'error.main' }}
              >
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Description preview */}
        {task.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
              lineHeight: 1.5,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Bottom meta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Flag sx={{ fontSize: '14px !important' }} />}
            label={priority.label}
            size="small"
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? `${priority.color}22` : priority.bg,
              color: priority.color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
              '& .MuiChip-icon': { color: priority.color },
            }}
          />
          {task.due_date && (
            <Chip
              icon={<CalendarToday sx={{ fontSize: '12px !important' }} />}
              label={new Date(task.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
});
