import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import { Delete, FolderOpen, CalendarToday } from '@mui/icons-material';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover .delete-btn': { opacity: 1 },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/projects/${project.id}`)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              mb: 2,
            }}
          >
            <FolderOpen sx={{ color: '#fff', fontSize: 22 }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom noWrap>
            {project.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 40,
            }}
          >
            {project.description || 'No description provided'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Chip
              label={formattedDate}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Delete button */}
      <Tooltip title="Delete project">
        <IconButton
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'error.main',
            color: '#fff',
            '&:hover': { bgcolor: 'error.dark' },
            width: 30,
            height: 30,
          }}
        >
          <Delete fontSize="small" sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Card>
  );
}
