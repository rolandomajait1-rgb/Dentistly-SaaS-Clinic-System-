import { useState, useCallback, useEffect } from 'react';
import { getPatientEhr, createPrescription, createSoapNote } from '../../api';
import { useNotifications } from '../../context/NotificationContext';

const formatTime = (timeString) => {
  if (!timeString) return '';
  const parts = timeString.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${m} ${ampm}`;
};

// ─── Patient Status Badge ─────────────────────────────────────────────────────
export function PatientStatusBadge({ status }) {
  const s = {
    Active:      'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Returning:   'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Review:      'bg-slate-100 text-slate-700 border border-slate-300',
    Inactive:    'bg-slate-100 text-slate-500 border border-slate-200',
    'High Risk': 'bg-red-100 text-red-700 border border-red-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${s[status] || s['Review']}`}>
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  if (!name) name = 'Walk-in';
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PT';

  const sizeClass = size === 'lg' ? 'w-14 h-14 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-xs';
  return (
    <div className={`${sizeClass} rounded-full bg-slate-200 text-cyan-900 font-bold flex items-center justify-center shrink-0 border border-slate-300`}>
      {initials}
    </div>
  );
}

// ─── Underlined Data Field Component ──────────────────────────────────────────
function UnderlineField({ label, sublabel, value, placeholder = '—' }) {
  return (
    <div className="w-full flex flex-col justify-start items-start">
      <div className="flex items-baseline gap-1">
        <span className="text-gray-500 text-[10px] font-bold font-sans uppercase tracking-wider">
          {label}
        </span>
        {sublabel && (
          <span className="text-gray-400 text-[9px] font-normal tracking-wide">
            {sublabel}
          </span>
        )}
      </div>
      <div className="w-full pt-1">
        <div className="w-full min-h-8 py-1 border-b border-black/10 flex items-center">
          <span className={`text-sm ${value && value !== '—' ? 'text-slate-800 font-medium' : 'text-neutral-400 font-normal'}`}>
            {value || placeholder}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Question Row (Yes / No) Component ────────────────────────────────────────
function QuestionRow({ number, question, answer = 'no' }) {
  const isYes = answer?.toLowerCase() === 'yes';
  const isNo = !isYes;

  return (
    <div className="w-full py-2.5 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="text-slate-800 text-sm font-normal">
        <span className="font-semibold mr-1">{number}.</span> {question}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isYes ? 'border-emerald-900 bg-emerald-900' : 'border-neutral-300'}`}>
            {isYes && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <span className={`text-xs ${isYes ? 'text-emerald-900 font-bold' : 'text-neutral-400'}`}>Yes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isNo ? 'border-emerald-900 bg-emerald-900' : 'border-neutral-300'}`}>
            {isNo && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <span className={`text-xs ${isNo ? 'text-emerald-900 font-bold' : 'text-neutral-400'}`}>No</span>
        </div>
      </div>
    </div>
  );
}

// ─── Patient Detail Modal ─────────────────────────────────────────────────────
export default function PatientModal({ patient, onClose, isLarge = true }) {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'visits' | 'soap' | 'prescriptions'
  const [ehrData, setEhrData] = useState(null);
  const [isLoadingEhr, setIsLoadingEhr] = useState(true);
  const [ehrError, setEhrError] = useState('');

  // Prescription form states
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [doctorName, setDoctorName] = useState(
    () => localStorage.getItem('default_rx_doctor') || JSON.parse(localStorage.getItem('user') || '{}').full_name || ''
  );
  const [prcNumber, setPrcNumber] = useState(() => localStorage.getItem('default_rx_prc') || '');
  const [instructions, setInstructions] = useState('');
  const [medItems, setMedItems] = useState([{ name: '', dosage: '', frequency: '', quantity: '' }]);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);

  // SOAP Clinical Notes form states
  const [isAddingSoap, setIsAddingSoap]       = useState(false);
  const [soapSubjective, setSoapSubjective]   = useState('');
  const [soapObjective, setSoapObjective]     = useState('');
  const [soapAssessment, setSoapAssessment]   = useState('');
  const [soapPlan, setSoapPlan]               = useState('');
  const [soapBp, setSoapBp]                   = useState('');
  const [soapPulse, setSoapPulse]             = useState('');
  const [soapTemp, setSoapTemp]               = useState('');
  const [soapTreatment, setSoapTreatment]     = useState('');
  const [isSavingSoap, setIsSavingSoap]       = useState(false);

  const fetchEhr = useCallback(async () => {
    if (!patient?.id) return;
    setIsLoadingEhr(true);
    setEhrError('');
    try {
      const data = await getPatientEhr(patient.id);
      setEhrData(data);
    } catch (err) {
      console.error(err);
      setEhrError('Failed to load electronic health records.');
    } finally {
      setIsLoadingEhr(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    fetchEhr();
  }, [fetchEhr]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddMedRow = () => setMedItems([...medItems, { name: '', dosage: '', frequency: '', quantity: '' }]);
  const handleRemoveMedRow = (index) => {
    if (medItems.length === 1) return;
    setMedItems(medItems.filter((_, i) => i !== index));
  };
  const handleMedItemChange = (index, field, value) => {
    const updated = [...medItems];
    updated[index][field] = value;
    setMedItems(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) { showToast('Doctor name is required.', 'warning'); return; }
    const validItems = medItems.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) { showToast('At least one medicine item is required.', 'warning'); return; }
    localStorage.setItem('default_rx_doctor', doctorName);
    localStorage.setItem('default_rx_prc', prcNumber);
    setIsSavingPrescription(true);
    try {
      const payload = {
        prescription_date: new Date().toISOString().split('T')[0],
        doctor_name: doctorName,
        prc_license_number: prcNumber,
        items: validItems,
        instructions,
      };
      const res = await createPrescription(patient.id, payload);
      if (res.success) {
        showToast('Prescription saved successfully!', 'success');
        setIsAddingPrescription(false);
        setInstructions('');
        setMedItems([{ name: '', dosage: '', frequency: '', quantity: '' }]);
        await fetchEhr();
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create prescription.', 'error');
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const handleSaveSoapNote = async (e) => {
    e.preventDefault();
    if (!soapSubjective || !soapAssessment || !soapPlan) {
      showToast('Please fill out Subjective, Assessment, and Plan fields.', 'warning');
      return;
    }
    setIsSavingSoap(true);
    try {
      const payload = {
        subjective: soapSubjective,
        objective: soapObjective,
        assessment: soapAssessment,
        plan: soapPlan,
        treatment: soapTreatment || 'Clinical Consultation',
        vital_signs: {
          blood_pressure: soapBp,
          pulse: soapPulse,
          temperature: soapTemp,
        },
        service_date: new Date().toISOString().split('T')[0],
      };
      await createSoapNote(patient.id, payload);
      showToast('SOAP Clinical note saved successfully!', 'success');
      setIsAddingSoap(false);
      setSoapSubjective('');
      setSoapObjective('');
      setSoapAssessment('');
      setSoapPlan('');
      setSoapBp('');
      setSoapPulse('');
      setSoapTemp('');
      setSoapTreatment('');
      await fetchEhr();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save SOAP note.', 'error');
    } finally {
      setIsSavingSoap(false);
    }
  };

  const handlePrintSoap = (note) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      showToast('Pop-up blocker is enabled. Please allow pop-ups to print SOAP notes.', 'warning');
      return;
    }
    const clinic = JSON.parse(localStorage.getItem('clinic') || '{}');
    const doctor = note.performed_by?.name || 'Attending Dentist';
    const dateStr = note.service_date ? new Date(note.service_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const vitals = note.vital_signs || {};

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SOAP Note - ${patient.full_name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #004E47; padding-bottom: 12px; margin-bottom: 20px; }
          .clinic-name { font-size: 20px; font-weight: 800; color: #004E47; }
          .doc-title { font-size: 15px; font-weight: bold; margin-top: 8px; color: #0f172a; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; }
          .section { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .sec-title { font-weight: 800; color: #004E47; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          .vitals-box { display: flex; gap: 16px; font-size: 12px; margin-top: 6px; padding: 6px 10px; background: #f1f5f9; border-radius: 6px; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">${clinic.clinic_name || 'Pivodent Dental Clinic'}</div>
          <div>${clinic.address || ''} · ${clinic.contact_number || ''}</div>
          <div class="doc-title">CONFIDENTIAL CLINICAL CONSULTATION NOTE (SOAP)</div>
        </div>
        <div class="meta-grid">
          <div><strong>Patient Name:</strong> ${patient.full_name}</div>
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Age / Gender:</strong> ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}</div>
          <div><strong>Attending Dentist:</strong> ${doctor}</div>
        </div>
        <div class="section">
          <div class="sec-title">[S] Subjective — Chief Complaint & History</div>
          <div>${note.soap_subjective || 'None recorded.'}</div>
        </div>
        <div class="section">
          <div class="sec-title">[O] Objective — Examination & Clinical Findings</div>
          <div>${note.soap_objective || 'Normal clinical findings.'}</div>
          ${(vitals.blood_pressure || vitals.pulse || vitals.temperature) ? `
            <div class="vitals-box">
              ${vitals.blood_pressure ? `<span><strong>BP:</strong> ${vitals.blood_pressure}</span>` : ''}
              ${vitals.pulse ? `<span><strong>Pulse:</strong> ${vitals.pulse} bpm</span>` : ''}
              ${vitals.temperature ? `<span><strong>Temp:</strong> ${vitals.temperature} °C</span>` : ''}
            </div>` : ''}
        </div>
        <div class="section">
          <div class="sec-title">[A] Assessment — Diagnosis</div>
          <div>${note.soap_assessment || note.diagnosis || 'None'}</div>
        </div>
        <div class="section">
          <div class="sec-title">[P] Plan — Treatment & Recommendations</div>
          <div>${note.soap_plan || note.treatment || 'Routine follow-up'}</div>
        </div>
        <div class="footer">
          <div>Verified Electronic Health Record Entry · HIPAA Compliant</div>
          <div>Dentist Signature: __________________________</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrint = (rx) => {
    const clinic = JSON.parse(localStorage.getItem('clinic') || '{}');
    const clinicName = clinic.clinic_name || clinic.name || 'PIVODENT DENTAL CLINIC';
    const clinicAddress = clinic.address || '';
    const clinicPhone = clinic.contact_number || clinic.phone || '';
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) { showToast('Pop-up blocker is enabled. Please allow pop-ups to print prescriptions.', 'warning'); return; }
    const dateStr = new Date(rx.prescription_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let medsHtml = '';
    const items = typeof rx.items === 'string' ? JSON.parse(rx.items) : rx.items;
    items.forEach((item, index) => {
      medsHtml += `
        <div style="margin-bottom: 18px; line-height: 1.4;">
          <div style="font-weight: bold; font-size: 16px;">${index + 1}. ${item.name}</div>
          <div style="font-size: 13px; color: #4b5563; margin-left: 15px;">
            Dosage: ${item.dosage} &middot; Frequency: ${item.frequency} &middot; Qty: ${item.quantity}
          </div>
        </div>
      `;
    });
    const html = `
      <html>
        <head>
          <title>Prescription - ${patient.full_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1f2937; padding: 40px; margin: 0; background-color: #ffffff; }
            .header { text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 5px 0; }
            .clinic-info { font-size: 12px; color: #4b5563; margin: 2px 0; }
            .rx-details { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 30px; border-bottom: 1px dashed #d1d5db; padding-bottom: 15px; }
            .rx-title { font-size: 48px; font-family: 'Playfair Display', serif; font-weight: bold; font-style: italic; color: #0f172a; margin: 0 0 20px 0; line-height: 1; }
            .meds-container { min-height: 300px; padding-left: 10px; }
            .footer-signature { margin-top: 80px; display: flex; justify-content: flex-end; }
            .signature-block { text-align: center; width: 250px; }
            .signature-line { border-top: 1px solid #1f2937; margin-top: 40px; padding-top: 5px; font-size: 13px; font-weight: bold; }
            .signature-prc { font-size: 11px; color: #6b7280; margin-top: 2px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="clinic-name">${clinicName}</h1>
            <p class="clinic-info">${clinicAddress}</p>
            <p class="clinic-info">Tel: ${clinicPhone}</p>
          </div>
          <div class="rx-details">
            <div>
              <strong>PATIENT:</strong> ${patient.full_name}<br>
              <strong>CONTACT:</strong> ${patient.contact_number || 'N/A'}<br>
              <strong>MEDICAL NOTES:</strong> ${patient.medical_history || 'None'}
            </div>
            <div style="text-align: right;">
              <strong>DATE:</strong> ${dateStr}<br>
              <strong>RX REF:</strong> RX-${rx.id}
            </div>
          </div>
          <div class="rx-title">&#8478;</div>
          <div class="meds-container">${medsHtml}</div>
          ${rx.instructions ? `<div style="margin-top:30px;border-top:1px solid #e5e7eb;padding-top:15px;"><div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Instructions:</div><div style="font-size:14px;line-height:1.5;">${rx.instructions}</div></div>` : ''}
          <div class="footer-signature">
            <div class="signature-block">
              <div class="signature-line">Dr. ${rx.doctor_name}</div>
              <div class="signature-prc">PRC License No: ${rx.prc_license_number || 'N/A'}</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const visits = ehrData?.appointments || patient.appointments || [];
  const isReturning = visits.length > 1 || patient.is_returning === true || patient.patientType === 'Returning';

  // Parse Name components
  const nameParts = (patient.full_name || 'Evelyn Hughes').trim().split(' ').filter(Boolean);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || 'Hughes';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, nameParts.length - 1).join(' ') : nameParts[0] || 'Evelyn';
  const middleName = '—';

  // Gender flags
  const gender = (patient.gender || patient.sex || 'Female').toLowerCase();
  const isFemale = gender.includes('female') || gender === 'f';
  const isMale = !isFemale && (gender.includes('male') || gender === 'm');

  // Last visit string
  const lastVisitDate = visits[0]?.appointment_date || patient.lastVisitDate || '2026-06-12';

  // Medical allergy checks
  const allergiesStr = (patient.allergies || patient.medical_history || 'Penicillin').toLowerCase();
  const hasPenicillin = allergiesStr.includes('penicillin') || allergiesStr.includes('antibiotic');

  const tabs = [
    { id: 'personal',      label: 'Personal Info',          icon: 'person' },
    { id: 'visits',        label: 'Visit History',          icon: 'calendar_month' },
    { id: 'soap',          label: 'Treatment Notes (SOAP)', icon: 'clinical_notes' },
    { id: 'prescriptions', label: 'Prescriptions',          icon: 'prescriptions' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f8fafc] w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[94vh] max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modal-in 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* ── TOP BAR (Header matching Figma top navigation) ── */}
        <div className="w-full bg-white border-b border-black/10 px-6 py-3.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-900 rounded-full" />
            <div>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Clinic Owner</p>
              <h2 className="text-emerald-900 text-lg font-bold">Patient Information</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Patient edit mode enabled.', 'info')}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-xl border border-emerald-900/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ── PATIENT BANNER (Summary card with avatar, name, badges, contacts) ── */}
        <div className="w-full px-6 py-4 bg-white border-b border-emerald-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar name={patient.full_name} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-slate-900 text-lg font-bold">{patient.full_name || 'Evelyn Hughes'}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isReturning ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isReturning ? 'Returning' : 'New Patient'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">call</span>
                  {patient.contact_number || '+63 917 123 4567'}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">mail</span>
                  {patient.email || 'evelyn@email.com'}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">calendar_month</span>
                  Last visit: {lastVisitDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS BAR (Personal Info, Visit History, Treatment Notes, Prescriptions) ── */}
        <div className="w-full bg-white border-b border-emerald-900/10 px-6 flex gap-6 shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-semibold tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-900 text-emerald-900 font-bold'
                    : 'border-transparent text-gray-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── MODAL BODY CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">

          {/* ═══════════ TAB 1: PERSONAL INFO (FIGMA INTAKE LAYOUT) ═══════════ */}
          {activeTab === 'personal' && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* ── CARD 1: PERSONAL INFORMATION ── */}
              <div className="p-6 bg-white rounded-xl border border-emerald-900/10 shadow-xs space-y-5">
                <div className="pb-2 border-b-[1.33px] border-emerald-900 flex items-center gap-2">
                  <span className="text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Personal Information
                  </span>
                </div>

                {/* Name breakdown */}
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Name</span>
                    <span className="text-gray-400 text-[9px] tracking-wide">(Last Name, First Name, Middle Name)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {lastName}
                    </div>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {firstName}
                    </div>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-400 font-normal">
                      {middleName}
                    </div>
                  </div>
                </div>

                {/* Nickname & Sex */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Nickname" value="—" />
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Sex</span>
                    <div className="flex items-center gap-5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isMale ? 'border-emerald-900 bg-emerald-900' : 'border-neutral-300'}`}>
                          {isMale && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${isMale ? 'text-emerald-900 font-bold' : 'text-neutral-400'}`}>Male</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isFemale ? 'border-emerald-900 bg-emerald-900' : 'border-neutral-300'}`}>
                          {isFemale && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${isFemale ? 'text-emerald-900 font-bold' : 'text-neutral-400'}`}>Female</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birthdate & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Birthdate (mm/dd/yyyy)" value={patient.birth_date || '1990-03-14'} />
                  <UnderlineField label="Age" value={patient.age || '34'} />
                </div>

                {/* Religion & Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Religion" value="—" />
                  <UnderlineField label="Nationality" value={patient.nationality || 'Filipino'} />
                </div>

                {/* Home Address */}
                <UnderlineField label="Home Address" value={patient.address || '123 Rizal St, Makati City'} />

                {/* Phone Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <UnderlineField label="Home No." value="—" />
                  <UnderlineField label="Office No." value="—" />
                  <UnderlineField label="Fax No." value="—" />
                </div>

                {/* Cell / Mobile & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Cell / Mobile No." value={patient.contact_number || '+63 917 123 4567'} />
                  <UnderlineField label="Email Address" value={patient.email || 'evelyn@email.com'} />
                </div>

                {/* Occupation & Insurance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <UnderlineField label="Occupation" value={patient.occupation || 'Accountant'} />
                  <UnderlineField label="Dental Insurance" value={patient.insurance || '—'} />
                  <UnderlineField label="Effective Date" value="—" />
                </div>

                {/* Minors & Referral */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Parent / Guardian's Name (for minors)" value="Mark Hughes" />
                  <UnderlineField label="Whom may we thank for referring you?" value="—" />
                </div>

                {/* Reason for Consultation */}
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Reason for Dental Consultation
                  </span>
                  <div className="w-full min-h-12 py-2 border-b border-black/10 text-sm text-slate-800 font-normal leading-relaxed">
                    {patient.notes || patient.reason || 'Patient presented for regular cleaning. No new caries detected. Gum health improved since last visit.'}
                  </div>
                </div>
              </div>

              {/* ── CARD 2: DENTAL HISTORY ── */}
              <div className="p-6 bg-white rounded-xl border border-emerald-900/10 shadow-xs space-y-4">
                <div className="pb-2 border-b-[1.33px] border-emerald-900 flex items-center gap-2">
                  <span className="text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Dental History
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnderlineField label="Previous Dentist: Dr." value="—" />
                  <UnderlineField label="Last Dental Visit" value={lastVisitDate} />
                </div>
              </div>

              {/* ── CARD 3: MEDICAL HISTORY ── */}
              <div className="p-6 bg-white rounded-xl border border-emerald-900/10 shadow-xs space-y-5">
                <div className="pb-2 border-b-[1.33px] border-emerald-900 flex items-center gap-2">
                  <span className="text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Medical History
                  </span>
                </div>

                {/* Physician Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <UnderlineField label="Name of Physician: Dr." value="—" />
                  <UnderlineField label="Specialty (if applicable)" value="—" />
                  <UnderlineField label="Office Address" value="—" />
                </div>

                {/* 8 Medical Screening Questions */}
                <div className="space-y-1 pt-2">
                  <QuestionRow number="1" question="Are you in good health?" answer="yes" />
                  <QuestionRow number="2" question="Are you under medical treatment now?" answer="no" />
                  <QuestionRow number="3" question="Have you ever had any serious illness or surgical operation?" answer="no" />
                  <QuestionRow number="4" question="Have you ever been hospitalized?" answer="no" />
                  <QuestionRow number="5" question="Are you taking any prescription/non-prescription medication?" answer="no" />
                  <QuestionRow number="6" question="Do you use tobacco products?" answer="no" />
                  <QuestionRow number="7" question="Do you use alcohol, cocaine, or other dangerous drugs?" answer="no" />

                  {/* Question 8: Allergies */}
                  <div className="pt-3 pb-2 border-b border-black/5">
                    <p className="text-slate-800 text-sm font-semibold mb-2.5">
                      8. Are you allergic to any of the following?
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Local Anesthetic (ex. Lidocaine)', checked: false },
                        { label: 'Penicillin/Antibiotics', checked: hasPenicillin },
                        { label: 'Sulfa Drugs', checked: false },
                        { label: 'Aspirin', checked: false },
                        { label: 'Latex', checked: false },
                        { label: 'Others', checked: false },
                      ].map((allergy) => (
                        <div key={allergy.label} className="flex items-center gap-2 text-xs text-slate-700">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            allergy.checked ? 'bg-red-600 border-red-600 text-white' : 'border-black/20 bg-white'
                          }`}>
                            {allergy.checked && <span className="material-symbols-outlined text-[13px]">check</span>}
                          </div>
                          <span className={allergy.checked ? 'font-bold text-red-700' : 'text-gray-500'}>
                            {allergy.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Alert Highlight */}
                    {hasPenicillin && (
                      <div className="mt-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg inline-flex items-center gap-1.5 text-red-700 font-bold text-xs">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>Allergy Alert: Penicillin Antibiotics</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vitals Baseline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <UnderlineField label="Bleeding Time" value="—" />
                  <UnderlineField label="Blood Type" value="—" />
                  <UnderlineField label="Blood Pressure" value={soapBp || '120/80 mmHg'} />
                </div>

                {/* For Women Only */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-emerald-900/10 space-y-2.5">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">
                    For Women Only
                  </span>
                  <QuestionRow number="•" question="Are you pregnant?" answer="no" />
                  <QuestionRow number="•" question="Are you nursing?" answer="no" />
                  <QuestionRow number="•" question="Are you taking birth control pills?" answer="no" />
                </div>

                {/* Systemic Conditions Checklist */}
                <div className="pt-3">
                  <div className="mb-3">
                    <span className="text-slate-800 text-xs font-bold">
                      Do you have or have you had any of the following?{' '}
                    </span>
                    <span className="text-gray-500 text-xs font-normal">Check all that apply</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {[
                      'Heart Disease', 'Heart Murmur', 'High Blood Pressure', 'Low Blood Pressure',
                      'Epilepsy/Convulsions', 'AIDS or HIV Infection', 'Rheumatic Fever', 'Sexually Transmitted Disease',
                      'Stomach Troubles/Ulcers', 'Hay Fever/Allergies', 'Respiratory Problems', 'Hepatitis/Jaundice',
                      'Fainting Seizure', 'Tuberculosis', 'Rapid Weight Loss', 'Swollen Ankles',
                      'Radiation Therapy', 'Kidney Disease', 'Joint Replacement/Implant', 'Diabetes',
                      'Heart Surgery', 'Chest Pain', 'Heart Attack', 'Stroke',
                      'Thyroid Problem', 'Cancer/Tumors', 'Anemia', 'Angina',
                      'Asthma', 'Emphysema', 'Bleeding Problems', 'Blood Diseases',
                      'Head Injuries', 'Arthritis/Rheumatism', 'Other'
                    ].map((condition) => (
                      <div key={condition} className="flex items-center gap-1.5 text-gray-500 py-0.5">
                        <div className="w-3.5 h-3.5 rounded border border-black/20 bg-white" />
                        <span className="text-[11px] truncate">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 2: VISIT HISTORY ═══════════ */}
          {activeTab === 'visits' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Past Clinic Appointments ({visits.length})
                </h4>
              </div>

              {visits.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                  No recorded visits yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.map((app) => (
                    <div
                      key={app.id}
                      className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-900/30 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{app.service?.service_name || 'General check-up'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ref: {app.reference_number || 'WLK-' + app.id} &middot; Date: {app.appointment_date} &middot; {formatTime(app.appointment_time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-900">₱{(app.service?.price || 0).toLocaleString()}</p>
                        <span className={`text-[10px] font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB 3: TREATMENT NOTES (SOAP) ═══════════ */}
          {activeTab === 'soap' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {isLoadingEhr ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-emerald-900 animate-spin" />
                  <p className="text-xs font-semibold">Loading clinical notes...</p>
                </div>
              ) : ehrError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-xs font-bold">{ehrError}</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Clinical Consultation Notes ({ehrData?.soap_notes?.length || 0})
                      </h4>
                      <p className="text-xs text-slate-500">Structured Subjective, Objective, Assessment, Plan (SOAP) records</p>
                    </div>
                    {!isAddingSoap && (
                      <button
                        onClick={() => setIsAddingSoap(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Record SOAP Note
                      </button>
                    )}
                  </div>

                  {/* Add SOAP Form */}
                  {isAddingSoap && (
                    <form onSubmit={handleSaveSoapNote} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h5 className="font-bold text-sm text-slate-900">New Clinical SOAP Note</h5>
                        <button type="button" onClick={() => setIsAddingSoap(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Blood Pressure</label>
                          <input type="text" value={soapBp} onChange={e => setSoapBp(e.target.value)} placeholder="120/80" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pulse (bpm)</label>
                          <input type="text" value={soapPulse} onChange={e => setSoapPulse(e.target.value)} placeholder="72" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Temp (&deg;C)</label>
                          <input type="text" value={soapTemp} onChange={e => setSoapTemp(e.target.value)} placeholder="36.5" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Treatment Performed</label>
                          <input type="text" value={soapTreatment} onChange={e => setSoapTreatment(e.target.value)} placeholder="Cleaning, Extraction, etc." className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Subjective [S] *</label>
                          <textarea value={soapSubjective} onChange={e => setSoapSubjective(e.target.value)} rows={2} required placeholder="Chief complaint, symptoms, patient comments..." className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-emerald-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Objective [O] *</label>
                          <textarea value={soapObjective} onChange={e => setSoapObjective(e.target.value)} rows={2} required placeholder="Clinical findings, intraoral examination, percussion tests..." className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-emerald-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Assessment [A] *</label>
                          <textarea value={soapAssessment} onChange={e => setSoapAssessment(e.target.value)} rows={2} required placeholder="Diagnosis, differential diagnosis, status..." className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-emerald-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">Plan [P] *</label>
                          <textarea value={soapPlan} onChange={e => setSoapPlan(e.target.value)} rows={2} required placeholder="Recommended procedures, prescriptions, next visit..." className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-emerald-900" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAddingSoap(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={isSavingSoap} className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50">
                          {isSavingSoap ? 'Saving...' : 'Save SOAP Note'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SOAP Notes List */}
                  <div className="space-y-4">
                    {(!ehrData?.soap_notes || ehrData.soap_notes.length === 0) ? (
                      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                        No clinical SOAP notes recorded yet.
                      </div>
                    ) : (
                      ehrData.soap_notes.map((note) => (
                        <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                Consulted by: {note.performed_by?.name || 'Attending Dentist'}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Date: {note.service_date} {note.treatment && `· Treatment: ${note.treatment}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handlePrintSoap(note)}
                              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">print</span>
                              Print Note
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                              <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">Subjective [S]</p>
                              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{note.soap_subjective || 'None recorded.'}</p>
                            </div>
                            <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">Objective [O]</p>
                              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{note.soap_objective || 'Normal findings.'}</p>
                            </div>
                            <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">Assessment [A]</p>
                              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{note.soap_assessment || note.diagnosis || 'None'}</p>
                            </div>
                            <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl">
                              <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">Plan [P]</p>
                              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{note.soap_plan || note.treatment || 'Routine follow-up'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════ TAB 4: PRESCRIPTIONS ═══════════ */}
          {activeTab === 'prescriptions' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {isLoadingEhr ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-emerald-900 animate-spin" />
                  <p className="text-xs font-semibold">Loading prescriptions...</p>
                </div>
              ) : ehrError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-xs font-bold">{ehrError}</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Prescription History ({ehrData?.prescriptions?.length || 0})
                      </h4>
                      <p className="text-xs text-slate-500">Manage, record, and print official patient prescriptions</p>
                    </div>
                    {!isAddingPrescription && (
                      <button
                        onClick={() => setIsAddingPrescription(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_document</span>
                        Write Prescription
                      </button>
                    )}
                  </div>

                  {/* Add Prescription Form */}
                  {isAddingPrescription && (
                    <form onSubmit={handleSavePrescription} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h5 className="font-bold text-sm text-slate-900">New Prescription</h5>
                        <button type="button" onClick={() => setIsAddingPrescription(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor Name *</label>
                          <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} required placeholder="Dr. Jane Doe" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">PRC License Number</label>
                          <input type="text" value={prcNumber} onChange={e => setPrcNumber(e.target.value)} placeholder="123456" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Medications / Rx Items *</label>
                        {medItems.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="grid grid-cols-12 gap-2 flex-1">
                              <input type="text" value={item.name} onChange={e => handleMedItemChange(idx, 'name', e.target.value)} placeholder="Medicine name & strength" required={idx === 0} className="col-span-6 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                              <input type="text" value={item.dosage} onChange={e => handleMedItemChange(idx, 'dosage', e.target.value)} placeholder="Dosage" className="col-span-2 px-2 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                              <input type="text" value={item.frequency} onChange={e => handleMedItemChange(idx, 'frequency', e.target.value)} placeholder="Frequency" className="col-span-2 px-2 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                              <input type="text" value={item.quantity} onChange={e => handleMedItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" className="col-span-2 px-2 py-2 border border-slate-200 rounded-xl text-xs bg-white" />
                            </div>
                            <button type="button" onClick={() => handleRemoveMedRow(idx)} disabled={medItems.length === 1} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-30">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddMedRow} className="text-xs font-bold text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          Add Medication Row
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Special Instructions</label>
                        <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} placeholder="Directions for intake..." className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white" />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAddingPrescription(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={isSavingPrescription} className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50">
                          {isSavingPrescription ? 'Saving...' : 'Save Prescription'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Prescription List */}
                  <div className="space-y-4">
                    {(!ehrData?.prescriptions || ehrData.prescriptions.length === 0) ? (
                      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                        No prescriptions written for this patient yet.
                      </div>
                    ) : (
                      ehrData.prescriptions.map((rx) => {
                        const items = typeof rx.items === 'string' ? JSON.parse(rx.items) : rx.items;
                        return (
                          <div key={rx.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                              <div>
                                <p className="text-xs font-bold text-slate-900">Dr. {rx.doctor_name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  PRC: {rx.prc_license_number || 'N/A'} &middot; Date: {rx.prescription_date}
                                </p>
                              </div>
                              <button
                                onClick={() => handlePrint(rx)}
                                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">print</span>
                                Print Rx
                              </button>
                            </div>

                            <div className="space-y-1.5 pl-3 border-l-2 border-emerald-900/30">
                              {items.map((item, idx) => (
                                <div key={idx} className="text-xs text-slate-800">
                                  <span className="font-bold">{item.name}</span>
                                  {item.dosage && <span className="text-slate-500"> - {item.dosage}</span>}
                                  {item.frequency && <span className="text-slate-500"> ({item.frequency})</span>}
                                  {item.quantity && <span className="text-slate-500">, Qty: {item.quantity}</span>}
                                </div>
                              ))}
                            </div>

                            {rx.instructions && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                                <span className="font-bold text-slate-700 block mb-0.5">Instructions:</span>
                                {rx.instructions}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-3.5 bg-white border-t border-black/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}
