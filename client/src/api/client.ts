const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status, data.details);
  }

  return data as T;
}

async function multipartRequest<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status, data.details);
  }
  return data as T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'ACCOUNTANT' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  impactArea: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  published?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: { name: string };
}

export interface FinancialReport {
  id: string;
  title: string;
  slug: string;
  periodLabel: string;
  summary?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  sourceType?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: { name: string };
}

export interface ResearchPublication {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  authors?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  sourceType?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: { name: string };
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: User }>('/auth/me'),

  createPledge: (data: {
    name: string;
    email: string;
    amount: number;
    message?: string;
    acknowledgedStatus: true;
  }) => request('/donation-pledges', { method: 'POST', body: JSON.stringify(data) }),

  subscribe: (data: {
    name: string;
    email: string;
    interestArea: string;
    message?: string;
    consent: true;
  }) => request('/subscribers', { method: 'POST', body: JSON.stringify(data) }),

  contact: (data: { name: string; email: string; topic: string; message: string }) =>
    request('/contact-messages', { method: 'POST', body: JSON.stringify(data) }),

  getPublicProjects: () => request<{ projects: Project[] }>('/projects/public'),

  getPublicUpdates: () => request<{ updates: UpdatePost[] }>('/updates/public'),

  getPublicUpdate: (slug: string) => request<{ update: UpdatePost }>(`/updates/public/${slug}`),

  getDashboard: () => request<{ stats: Record<string, number>; recentActivity: unknown[] }>('/admin/dashboard'),

  getUsers: () => request<{ users: User[] }>('/admin/users'),
  updateUser: (id: string, data: Partial<{ role: string; isActive: boolean }>) =>
    request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getPledges: () => request<{ pledges: unknown[] }>('/admin/donation-pledges'),
  updatePledge: (id: string, data: { status: string }) =>
    request(`/admin/donation-pledges/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getSubscribers: () => request<{ subscribers: unknown[] }>('/admin/subscribers'),

  getMessages: () => request<{ messages: unknown[] }>('/admin/contact-messages'),
  updateMessage: (id: string, data: { status: string }) =>
    request(`/admin/contact-messages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getAccounting: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ transactions: unknown[]; totals: { income: number; expenses: number; net: number } }>(
      `/admin/accounting${qs}`,
    );
  },
  createTransaction: (data: unknown) =>
    request('/admin/accounting', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: string, data: unknown) =>
    request(`/admin/accounting/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTransaction: (id: string) =>
    request(`/admin/accounting/${id}`, { method: 'DELETE' }),

  getProjects: () => request<{ projects: Project[] }>('/admin/projects'),
  createProject: (data: unknown) =>
    request('/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: unknown) =>
    request(`/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request(`/admin/projects/${id}`, { method: 'DELETE' }),

  getUpdates: () => request<{ updates: UpdatePost[] }>('/admin/updates'),
  createUpdate: (data: unknown) =>
    request('/admin/updates', { method: 'POST', body: JSON.stringify(data) }),
  updateUpdate: (id: string, data: unknown) =>
    request(`/admin/updates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUpdate: (id: string) => request(`/admin/updates/${id}`, { method: 'DELETE' }),

  getPublicFinancialReports: () => request<{ reports: FinancialReport[] }>('/financial-reports/public'),
  getPublicFinancialReport: (slug: string) =>
    request<{ report: FinancialReport }>(`/financial-reports/public/${slug}`),

  getPublicResearchPublications: () =>
    request<{ publications: ResearchPublication[] }>('/research-publications/public'),
  getPublicResearchPublication: (slug: string) =>
    request<{ publication: ResearchPublication }>(`/research-publications/public/${slug}`),

  getFinancialReports: () => request<{ reports: FinancialReport[] }>('/admin/financial-reports'),
  createFinancialReport: (formData: FormData) =>
    multipartRequest<{ report: FinancialReport }>('/admin/financial-reports', formData),
  updateFinancialReport: (id: string, formData: FormData) =>
    multipartRequest<{ report: FinancialReport }>(`/admin/financial-reports/${id}`, formData, 'PATCH'),
  deleteFinancialReport: (id: string) => request(`/admin/financial-reports/${id}`, { method: 'DELETE' }),

  getResearchPublications: () =>
    request<{ publications: ResearchPublication[] }>('/admin/research-publications'),
  createResearchPublication: (formData: FormData) =>
    multipartRequest<{ publication: ResearchPublication }>('/admin/research-publications', formData),
  updateResearchPublication: (id: string, formData: FormData) =>
    multipartRequest<{ publication: ResearchPublication }>(
      `/admin/research-publications/${id}`,
      formData,
      'PATCH',
    ),
  deleteResearchPublication: (id: string) =>
    request(`/admin/research-publications/${id}`, { method: 'DELETE' }),
};
