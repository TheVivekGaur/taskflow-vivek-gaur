import { createTheme, type PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
            secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
            background: { default: '#f8fafc', paper: '#ffffff' },
            text: { primary: '#0f172a', secondary: '#475569' },
            success: { main: '#10b981' },
            warning: { main: '#f59e0b' },
            error: { main: '#ef4444' },
            divider: '#e2e8f0',
          }
        : {
            primary: { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1' },
            secondary: { main: '#22d3ee', light: '#67e8f9', dark: '#06b6d4' },
            background: { default: '#0f172a', paper: '#1e293b' },
            text: { primary: '#f1f5f9', secondary: '#94a3b8' },
            success: { main: '#34d399' },
            warning: { main: '#fbbf24' },
            error: { main: '#f87171' },
            divider: '#334155',
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.9rem',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)'
              : '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light'
                ? '0 10px 24px rgba(15,23,42,0.1)'
                : '0 10px 24px rgba(0,0,0,0.4)',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(15,23,42,0.06)'
              : '0 1px 3px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  });
