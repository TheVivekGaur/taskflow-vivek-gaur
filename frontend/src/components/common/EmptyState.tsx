import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        textAlign: 'center',
      }}
    >
      {icon || (
        <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
      )}
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
