import { BASE_URL, getHeaders } from './client';

export async function getOverview() {
  const res = await fetch(`${BASE_URL}/overview`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch overview data.');
  return res.json();
}

export async function getAppointments() {
  const res = await fetch(`${BASE_URL}/appointments`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch appointments.');
  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create appointment.');
  }
  return res.json();
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status.');
  return res.json();
}

export async function getQueue() {
  const res = await fetch(`${BASE_URL}/queue`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch queue.');
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`${BASE_URL}/settings`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch settings.');
  return res.json();
}

export async function updateSettings(data) {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings.');
  return res.json();
}

export async function getServices() {
  const res = await fetch(`${BASE_URL}/services`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch services.');
  return res.json();
}

export async function addService(serviceName, price) {
  const res = await fetch(`${BASE_URL}/services`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ service_name: serviceName, price })
  });
  if (!res.ok) throw new Error('Failed to add service.');
  return res.json();
}

export async function updateService(id, serviceName, price) {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ service_name: serviceName, price })
  });
  if (!res.ok) throw new Error('Failed to update service.');
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete service.');
  return res.json();
}

export async function testEmailWorkflow(email, subject, body) {
  const res = await fetch(`${BASE_URL}/settings/test-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, subject, body })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to dispatch test Email workflow.');
  }
  return res.json();
}


