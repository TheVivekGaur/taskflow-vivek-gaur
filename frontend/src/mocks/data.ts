import type { User, Project, Task } from '../types';

// Seed user
export const seedUsers: (User & { password: string })[] = [
  {
    id: 'usr_001',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  },
];

// Seed project
export const seedProjects: Project[] = [
  {
    id: 'prj_001',
    name: 'Website Redesign',
    description: 'Q2 project — Complete overhaul of the marketing website',
    owner_id: 'usr_001',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'prj_002',
    name: 'Mobile App MVP',
    description: 'Build the first version of our iOS and Android app',
    owner_id: 'usr_001',
    created_at: '2026-04-03T14:30:00Z',
  },
];

// Seed tasks
export const seedTasks: Task[] = [
  {
    id: 'tsk_001',
    title: 'Design homepage wireframe',
    description: 'Create wireframes for the new homepage layout including hero section, features grid, and testimonials.',
    status: 'todo',
    priority: 'high',
    assignee_id: 'usr_001',
    due_date: '2026-04-15',
    project_id: 'prj_001',
    created_at: '2026-04-02T09:00:00Z',
  },
  {
    id: 'tsk_002',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment to staging.',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'usr_001',
    due_date: '2026-04-12',
    project_id: 'prj_001',
    created_at: '2026-04-02T10:00:00Z',
  },
  {
    id: 'tsk_003',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with request/response examples using OpenAPI spec.',
    status: 'done',
    priority: 'medium',
    assignee_id: 'usr_001',
    due_date: '2026-04-10',
    project_id: 'prj_001',
    created_at: '2026-04-01T15:00:00Z',
  },
  {
    id: 'tsk_004',
    title: 'Implement dark mode',
    description: 'Add theme toggle with system preference detection and localStorage persistence.',
    status: 'todo',
    priority: 'low',
    assignee_id: 'usr_001',
    due_date: '2026-04-20',
    project_id: 'prj_001',
    created_at: '2026-04-03T08:00:00Z',
  },
  {
    id: 'tsk_005',
    title: 'User authentication flow',
    description: 'Implement login, registration, and password reset with JWT tokens.',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'usr_001',
    due_date: '2026-04-14',
    project_id: 'prj_001',
    created_at: '2026-04-03T09:30:00Z',
  },
  {
    id: 'tsk_006',
    title: 'Database schema design',
    description: 'Design PostgreSQL schema for users, projects, and tasks with proper indexes.',
    status: 'done',
    priority: 'high',
    assignee_id: 'usr_001',
    due_date: '2026-04-05',
    project_id: 'prj_001',
    created_at: '2026-04-01T11:00:00Z',
  },
  // Tasks for Mobile App MVP project
  {
    id: 'tsk_007',
    title: 'Set up React Native project',
    description: 'Initialize project with Expo, configure navigation, and set up development environment.',
    status: 'todo',
    priority: 'high',
    assignee_id: 'usr_001',
    due_date: '2026-04-18',
    project_id: 'prj_002',
    created_at: '2026-04-04T10:00:00Z',
  },
  {
    id: 'tsk_008',
    title: 'Design app screens in Figma',
    description: 'Create high-fidelity mockups for all core screens including onboarding, home, and profile.',
    status: 'in_progress',
    priority: 'medium',
    assignee_id: 'usr_001',
    due_date: '2026-04-16',
    project_id: 'prj_002',
    created_at: '2026-04-04T11:00:00Z',
  },
];
