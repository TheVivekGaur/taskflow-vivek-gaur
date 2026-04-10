import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Assignment } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    if (!password.trim()) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/projects');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { error?: string; fields?: Record<string, string> };
        if (data.fields) setFieldErrors(data.fields);
        setError(data.error || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f0f9ff 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <Assignment sx={{ color: 'primary.main', fontSize: 36 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TaskFlow
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to your account to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }
              }}
              autoComplete="email"
              autoFocus
            />
            <TextField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              autoComplete="current-password"
            />

            <Button
              id="login-submit"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.4 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>
                Create one
              </Link>
            </Typography>

            {/* Test credentials hint */}
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }} icon={false}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Test Credentials
              </Typography>
              <br />
              <Typography variant="caption">
                Email: test@example.com · Password: password123
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
