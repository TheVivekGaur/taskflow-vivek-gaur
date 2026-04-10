import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { projectsApi } from '../api/projects.api';
import { useTaskStore } from '../store/useTaskStore';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import TaskFilters from '../components/tasks/TaskFilters';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import type { Project, Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Task store
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, setTasks } = useTaskStore();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadProject = useCallback(async () => {
    if (!id) return;
    setProjectLoading(true);
    setProjectError(null);
    try {
      const data = await projectsApi.getById(id);
      setProject(data);
      // Set tasks from project response
      setTasks(data.tasks || []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setProjectError('Project not found');
      else if (status === 403) setProjectError('You don\'t have access to this project');
      else setProjectError('Failed to load project');
    } finally {
      setProjectLoading(false);
    }
  }, [id, setTasks]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Handlers
  const handleCreateTask = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    if (!id) return;
    await addTask(id, data as CreateTaskPayload);
    setSnackbar({ open: true, message: 'Task created!', severity: 'success' });
  };

  const handleEditTask = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, data as UpdateTaskPayload);
    setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setSnackbar({ open: true, message: `Task moved to ${newStatus.replace('_', ' ')}`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to move task', severity: 'error' });
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  if (projectLoading || tasksLoading) return <Loader message="Loading project..." />;
  if (projectError) return <ErrorState message={projectError} onRetry={loadProject} />;
  if (!project) return <ErrorState message="Project not found" />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="text.secondary"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
          onClick={() => navigate('/projects')}
        >
          Projects
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {project.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/projects')} size="small">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {project.name}
            </Typography>
            {project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {project.description}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          id="add-task-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateModal}
        >
          Add Task
        </Button>
      </Box>

      {/* Filters */}
      <TaskFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchQuery}
      />

      {/* Kanban Board */}
      <KanbanBoard
        tasks={filteredTasks}
        onEdit={openEditModal}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onAddTask={openCreateModal}
      />

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
