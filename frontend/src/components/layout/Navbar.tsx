import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Logout,
  Assignment,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({ darkMode, onToggleDarkMode }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuEl, setMobileMenuEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    setMobileMenuEl(null);
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            mr: 'auto',
          }}
          onClick={() => navigate('/projects')}
        >
          <Assignment sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            TaskFlow
          </Typography>
        </Box>

        {/* Desktop controls */}
        {!isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onToggleDarkMode}
              size="small"
              id="dark-mode-toggle"
              aria-label="Toggle dark mode"
              sx={{ color: 'text.secondary' }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>

            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                textTransform: 'none',
                gap: 1,
                borderRadius: 3,
                px: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">
                {user?.name}
              </Typography>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          /* Mobile hamburger */
          <>
            <IconButton
              onClick={onToggleDarkMode}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton
              onClick={(e) => setMobileMenuEl(e.currentTarget)}
              sx={{ color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuEl}
              open={Boolean(mobileMenuEl)}
              onClose={() => setMobileMenuEl(null)}
            >
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">{user?.name}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
