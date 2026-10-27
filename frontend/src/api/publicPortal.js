const resolvePublicBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/public/clinics`;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (window.location.port === '5173' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      return '/api/public/clinics';
    }
    return `http://${hostname}:8000/api/public/clinics`;
  }
  return '/api/public/clinics';
};

const PUBLIC_BASE_URL = resolvePublicBaseUrl();

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

export async function fetchPublicClinicSlots(slug, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${PUBLIC_BASE_URL}/${slug}/slots${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
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

export async function endMessengerConversation(slug, senderId) {
  const res = await fetch(`${PUBLIC_BASE_URL}/${slug}/end-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ sender_id: senderId })
  });
  return res.json().catch(() => ({ success: true }));
}

