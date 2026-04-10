import { Box, Typography, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
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
      <Warning sx={{ fontSize: 56, color: 'error.main', opacity: 0.7 }} />
      <Typography variant="h6" color="text.secondary">
        Oops!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry} sx={{ mt: 1 }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
