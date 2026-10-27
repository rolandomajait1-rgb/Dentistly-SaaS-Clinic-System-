import { BASE_URL, getHeaders } from './client';

export async function getOverview() {
  const res = await fetch(`${BASE_URL}/overview`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch overview data.');
  return res.json();
}

export async function getAnalytics(range = '6months') {
  const res = await fetch(`${BASE_URL}/analytics?range=${encodeURIComponent(range)}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch analytics data.');
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

export async function updateAppointmentStatus(id, status, cancellationReason = null, extraPayload = {}) {
  const payload = { status, ...extraPayload };
  if (cancellationReason) {
    payload.cancellation_reason = cancellationReason;
  }
  const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update status.');
  }
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

export async function getStaff() {
  const res = await fetch(`${BASE_URL}/staff`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch staff directory.');
  return res.json();
}

export async function createStaff(data) {
  const res = await fetch(`${BASE_URL}/staff`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create staff member.');
  }
  return res.json();
}

export async function deleteStaff(id) {
  const res = await fetch(`${BASE_URL}/staff/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete staff member.');
  return res.json();
}

export async function getNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch notifications.');
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark notification as read.');
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read.');
  return res.json();
}

export async function clearNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to clear notifications.');
  return res.json();
}




