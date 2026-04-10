import { useMemo } from 'react';
import { Box } from '@mui/material';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
}

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange, onAddTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    return groups;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskObj = tasks.find((t) => t.id === active.id);
    if (!activeTaskObj) return;

    // Determine target status — could be dropped on a column or another task
    let targetStatus: TaskStatus | null = null;

    // Check if dropped on a column directly
    if (STATUSES.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Dropped on another task — find its status
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== activeTaskObj.status) {
      onStatusChange(activeTaskObj.id, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {STATUSES.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
          />
        ))}
      </Box>
      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
