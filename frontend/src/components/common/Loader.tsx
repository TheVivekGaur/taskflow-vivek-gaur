import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ message = 'Loading...', fullScreen = false }: LoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: fullScreen ? 0 : 8,
        minHeight: fullScreen ? '100vh' : 'auto',
      }}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
