import { BASE_URL, getHeaders } from './client';

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed.');
  }
  return res.json();
}

export async function googleLogin(credential) {
  const res = await fetch(`${BASE_URL}/auth/google-login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ credential })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Google login failed.');
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to logout.');
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed.');
  }
  return res.json();
}

export async function verifyEmail(token) {
  const res = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ token })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Email verification failed.');
  }
  return res.json();
}

export async function resendVerification(email) {
  const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to resend verification email.');
  }
  return res.json();
}
