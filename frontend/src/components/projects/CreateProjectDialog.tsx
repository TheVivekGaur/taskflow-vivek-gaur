import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AxiosError } from 'axios';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}

export default function CreateProjectDialog({ open, onClose, onCreate }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCreate(name.trim(), description.trim());
      handleClose();
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create project');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create New Project</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}
        <TextField
          id="project-name-input"
          autoFocus
          label="Project Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign"
        />
        <TextField
          id="project-description-input"
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the project..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          id="create-project-submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
