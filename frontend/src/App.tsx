import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, type PaletteMode } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { getTheme } from './theme/theme';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return (saved as PaletteMode) || 'light';
  });

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleDarkMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('taskflow_theme', next);
      return next;
    });
  };

  useEffect(() => {
    // Set meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? '#0f172a' : '#f8fafc');
    }
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Navbar darkMode={mode === 'dark'} onToggleDarkMode={toggleDarkMode} />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
