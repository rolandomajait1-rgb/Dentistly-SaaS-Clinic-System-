const PUBLIC_BASE_URL = 'http://127.0.0.1:8000/api/public/clinics';

export async function fetchPublicClinicInfo(slug) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/info`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch clinic information');
  }
  return res.json();
}

export async function fetchPublicClinicServices(slug) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/services`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch services');
  }
  return res.json();
}

export async function fetchPublicClinicSlots(slug) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/slots`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch available time slots');
  }
  return res.json();
}

export async function submitPublicBooking(slug, payload) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit appointment booking');
  }
  return data;
}

export async function lookupPublicAppointment(slug, query) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/appointments/lookup?query=${encodeURIComponent(query)}`, {
    headers: { 'Accept': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to lookup appointment');
  }
  return data;
}

export async function cancelPublicAppointment(slug, { reference_number, contact_number, reason }) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/appointments/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ reference_number, contact_number, reason })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel appointment');
  }
  return data;
}
