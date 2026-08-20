import { BASE_URL, getHeaders } from './client';

export async function getPatients() {
  const res = await fetch(`${BASE_URL}/patients`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch patients.');
  return res.json();
}

export async function getPatientEhr(patientId) {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/ehr`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch patient EHR data.');
  return res.json();
}

export async function createPrescription(patientId, data) {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/prescriptions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create prescription.');
  return res.json();
}
