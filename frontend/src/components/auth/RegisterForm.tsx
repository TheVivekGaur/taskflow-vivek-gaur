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
import { Visibility, VisibilityOff, Email, Lock, Person, Assignment } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
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
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email';
    if (!password.trim()) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/projects');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { error?: string; fields?: Record<string, string> };
        if (data.fields) setFieldErrors(data.fields);
        setError(data.error || 'Registration failed');
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
      <Card sx={{ maxWidth: 440, width: '100%', overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Start managing your projects today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="register-name"
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }
              }}
              autoFocus
            />
            <TextField
              id="register-email"
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
            />
            <TextField
              id="register-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || 'At least 6 characters'}
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
              autoComplete="new-password"
            />

            <Button
              id="register-submit"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.4 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
