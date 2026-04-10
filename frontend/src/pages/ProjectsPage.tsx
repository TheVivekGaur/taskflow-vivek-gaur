import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { projectsApi } from '../api/projects.api';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectDialog from '../components/projects/CreateProjectDialog';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import type { Project } from '../types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (name: string, description: string) => {
    const newProject = await projectsApi.create({ name, description });
    setProjects((prev) => [newProject, ...prev]);
    setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
  };

  const handleDelete = async (id: string) => {
    const prev = [...projects];
    setProjects((p) => p.filter((proj) => proj.id !== id));
    try {
      await projectsApi.delete(id);
      setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
    } catch {
      setProjects(prev);
      setSnackbar({ open: true, message: 'Failed to delete project', severity: 'error' });
    }
  };

  if (loading) return <Loader message="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          id="create-project-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="large"
        >
          New Project
        </Button>
      </Box>

      {/* Content */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="Create your first project to start organizing tasks."
          actionLabel="Create Project"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {projects.map((project) => (
            <Box key={project.id}>
              <ProjectCard project={project} onDelete={handleDelete} />
            </Box>
          ))}
        </Box>
      )}

      {/* Create dialog */}
      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
