import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import { seedUsers, seedProjects, seedTasks } from './data';
import type { User, Project, Task, TaskStatus, TaskPriority } from '../types';

// In-memory data store
let users: (User & { password: string })[] = [...seedUsers];
let projects: Project[] = [...seedProjects];
let tasks: Task[] = [...seedTasks];

// Simple JWT-like token helpers
const createToken = (userId: string): string => {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 }));
};

const verifyToken = (authHeader: string | null): User | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    const user = users.find((u) => u.id === payload.userId);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email };
  } catch {
    return null;
  }
};

const DELAY_MS = 500;

export const handlers = [
  // ─── Auth ─────────────────────────────────────────────────

  // POST /auth/register
  http.post('http://localhost:4000/auth/register', async ({ request }) => {
    await delay(DELAY_MS);
    const body = (await request.json()) as { name?: string; email?: string; password?: string };

    if (!body.name || !body.email || !body.password) {
      const fields: Record<string, string> = {};
      if (!body.name) fields.name = 'is required';
      if (!body.email) fields.email = 'is required';
      if (!body.password) fields.password = 'is required';
      return HttpResponse.json({ error: 'validation failed', fields }, { status: 400 });
    }

    if (users.find((u) => u.email === body.email)) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { email: 'already exists' } },
        { status: 400 }
      );
    }

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      name: body.name,
      email: body.email,
      password: body.password,
    };
    users.push(newUser);

    const token = createToken(newUser.id);
    return HttpResponse.json(
      { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  }),

  // POST /auth/login
  http.post('http://localhost:4000/auth/login', async ({ request }) => {
    await delay(DELAY_MS);
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      const fields: Record<string, string> = {};
      if (!body.email) fields.email = 'is required';
      if (!body.password) fields.password = 'is required';
      return HttpResponse.json({ error: 'validation failed', fields }, { status: 400 });
    }

    const user = users.find((u) => u.email === body.email && u.password === body.password);
    if (!user) {
      return HttpResponse.json({ error: 'invalid credentials' }, { status: 401 });
    }

    const token = createToken(user.id);
    return HttpResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  }),

  // ─── Projects ─────────────────────────────────────────────

  // GET /projects
  http.get('http://localhost:4000/projects', async ({ request }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const userProjects = projects.filter((p) => p.owner_id === user.id);
    return HttpResponse.json({ projects: userProjects });
  }),

  // POST /projects
  http.post('http://localhost:4000/projects', async ({ request }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = (await request.json()) as { name?: string; description?: string };
    if (!body.name) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { name: 'is required' } },
        { status: 400 }
      );
    }

    const newProject: Project = {
      id: `prj_${uuidv4().slice(0, 8)}`,
      name: body.name,
      description: body.description || '',
      owner_id: user.id,
      created_at: new Date().toISOString(),
    };
    projects.push(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  // GET /projects/:id
  http.get('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.owner_id !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    return HttpResponse.json({ ...project, tasks: projectTasks });
  }),

  // PATCH /projects/:id
  http.patch('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const projectIndex = projects.findIndex((p) => p.id === params.id);
    if (projectIndex === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (projects[projectIndex].owner_id !== user.id)
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = (await request.json()) as { name?: string; description?: string };
    projects[projectIndex] = { ...projects[projectIndex], ...body };
    return HttpResponse.json(projects[projectIndex]);
  }),

  // DELETE /projects/:id
  http.delete('http://localhost:4000/projects/:id', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const projectIndex = projects.findIndex((p) => p.id === params.id);
    if (projectIndex === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (projects[projectIndex].owner_id !== user.id)
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    // Also remove associated tasks
    tasks = tasks.filter((t) => t.project_id !== params.id);
    projects.splice(projectIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Tasks ────────────────────────────────────────────────

  // GET /projects/:id/tasks
  http.get('http://localhost:4000/projects/:id/tasks', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') as TaskStatus | null;
    const assigneeFilter = url.searchParams.get('assignee');

    let projectTasks = tasks.filter((t) => t.project_id === params.id);
    if (statusFilter) projectTasks = projectTasks.filter((t) => t.status === statusFilter);
    if (assigneeFilter) projectTasks = projectTasks.filter((t) => t.assignee_id === assigneeFilter);

    return HttpResponse.json({ tasks: projectTasks });
  }),

  // POST /projects/:id/tasks
  http.post('http://localhost:4000/projects/:id/tasks', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      assignee_id?: string;
      due_date?: string;
    };

    if (!body.title) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { title: 'is required' } },
        { status: 400 }
      );
    }

    const newTask: Task = {
      id: `tsk_${uuidv4().slice(0, 8)}`,
      title: body.title,
      description: body.description || '',
      status: 'todo',
      priority: body.priority || 'medium',
      assignee_id: body.assignee_id || user.id,
      due_date: body.due_date || '',
      project_id: params.id as string,
      created_at: new Date().toISOString(),
    };
    tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // PATCH /tasks/:id
  http.patch('http://localhost:4000/tasks/:id', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const taskIndex = tasks.findIndex((t) => t.id === params.id);
    if (taskIndex === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee_id?: string;
      due_date?: string;
    };

    tasks[taskIndex] = { ...tasks[taskIndex], ...body };
    return HttpResponse.json(tasks[taskIndex]);
  }),

  // DELETE /tasks/:id
  http.delete('http://localhost:4000/tasks/:id', async ({ request, params }) => {
    await delay(DELAY_MS);
    const user = verifyToken(request.headers.get('Authorization'));
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const taskIndex = tasks.findIndex((t) => t.id === params.id);
    if (taskIndex === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    tasks.splice(taskIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
