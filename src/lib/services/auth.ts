// src/lib/services/auth.ts

const API_BASE = '/api/auth';

export async function register({ email, name, password }: { email: string; name: string; password: string }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout`, { method: 'POST' });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function resetPassword({ token, password }: { token: string; password: string }) {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function getProfile(token: string) {
  const res = await fetch('/api/user/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function updateProfile(token: string, data: { name?: string; email?: string; avatar?: string }) {
  const res = await fetch('/api/user/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await res.json();
  return await res.json();
} 