import { Box, TextField, MenuItem, Chip, InputAdornment } from '@mui/material';
import { FilterList, Search } from '@mui/icons-material';
import type { TaskStatus, TaskPriority } from '../../types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  searchQuery: string;
  onStatusChange: (status: TaskStatus | 'all') => void;
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onSearchChange: (query: string) => void;
}

export default function TaskFilters({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: TaskFiltersProps) {
  const activeFilters = (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        mb: 3,
      }}
    >
      {/* Search */}
      <TextField
        id="task-search"
        placeholder="Search tasks..."
        size="small"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 200, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }
        }}
      />

      {/* Status filter */}
      <TextField
        id="status-filter"
        select
        size="small"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'all')}
        sx={{ minWidth: 140 }}
        label="Status"
      >
        <MenuItem value="all">All Statuses</MenuItem>
        <MenuItem value="todo">📋 To Do</MenuItem>
        <MenuItem value="in_progress">🔄 In Progress</MenuItem>
        <MenuItem value="done">✅ Done</MenuItem>
      </TextField>

      {/* Priority filter */}
      <TextField
        id="priority-filter"
        select
        size="small"
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
        sx={{ minWidth: 140 }}
        label="Priority"
      >
        <MenuItem value="all">All Priorities</MenuItem>
        <MenuItem value="high">🔴 High</MenuItem>
        <MenuItem value="medium">🟡 Medium</MenuItem>
        <MenuItem value="low">🟢 Low</MenuItem>
      </TextField>

      {activeFilters > 0 && (
        <Chip
          icon={<FilterList />}
          label={`${activeFilters} active`}
          size="small"
          color="primary"
          variant="outlined"
          onDelete={() => {
            onStatusChange('all');
            onPriorityChange('all');
          }}
        />
      )}
    </Box>
  );
}
