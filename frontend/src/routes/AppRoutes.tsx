import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import React, { Suspense, lazy } from 'react';
import Loader from '../components/common/Loader';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader message="Loading..." />}>
      <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
    </Suspense>
  );
}
