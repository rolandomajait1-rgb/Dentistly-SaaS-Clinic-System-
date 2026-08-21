import { useState, useCallback, useEffect } from 'react';
import { getPatientEhr, createPrescription } from '../../api';
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
    Active:      'bg-[#e5f6f4] text-primary border border-primary/20',
    Review:      'bg-surface-container-high text-on-surface-variant border border-outline-variant',
    Inactive:    'bg-surface-container text-on-surface-variant border border-outline-variant',
    'High Risk': 'bg-error-container text-error border border-error/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${s[status] || s['Review']}`}>
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  if (!name) name = 'Walk-in';
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    'bg-[#e5f6f4] text-primary',
    'bg-secondary-container text-on-secondary-container',
    'bg-surface-container-high text-on-surface-variant',
    'bg-error-container text-error',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0 border border-outline-variant ${color}`}>
      {initials}
    </div>
  );
}

// ─── Patient Detail Modal ─────────────────────────────────────────────────────
export default function PatientModal({ patient, onClose, isLarge = false }) {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
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

  const fetchEhr = useCallback(async () => {
    await Promise.resolve();
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
  }, [patient.id]);

  useEffect(() => {
    const tid = setTimeout(() => {
      fetchEhr();
    }, 0);
    return () => clearTimeout(tid);
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

  const handlePrint = (rx) => {
    const clinic = JSON.parse(localStorage.getItem('clinic') || '{}');
    const clinicName = clinic.name || 'DENTAL CLINIC';
    const clinicAddress = clinic.address || '';
    const clinicPhone = clinic.phone || '';
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

  const hasAlert = patient.medical_history && patient.medical_history !== 'None' && patient.medical_history !== '';
  const visits = ehrData?.appointments || patient.appointments || [];

  const containerClass = isLarge
    ? 'bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col h-[92vh] max-h-[92vh]'
    : 'bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]';

  const tabs = [
    { id: 'profile',       label: 'Visits & Profile',   icon: 'person' },
    { id: 'prescriptions', label: 'Prescriptions',      icon: 'prescriptions' },
  ];

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={containerClass}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modal-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={patient.full_name} size={isLarge ? 'lg' : 'md'} />
            <div>
              <h3 className={`font-bold text-on-surface ${isLarge ? 'text-lg' : 'text-base'}`}>{patient.full_name}</h3>
              <p className="text-xs text-on-surface-variant">
                {patient.contact_number}
                {visits.length > 0 && <span className="ml-2 text-on-surface-variant">· {visits.length} visit{visits.length !== 1 ? 's' : ''}</span>}
                {patient.computedStatus && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${
                    patient.computedStatus === 'High Risk' ? 'bg-error-container text-error border border-error/20' : 'bg-[#e5f6f4] text-primary border border-primary/20'
                  }`}>{patient.computedStatus}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLarge && (
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                Electronic Health Record
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="px-6 bg-surface-bright border-b border-outline-variant/60 flex gap-4 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 bg-surface-bright/20 p-6">

          {/* ─── Profile & Visits Tab ─── */}
          {activeTab === 'profile' && (
            <div className={isLarge ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-5'}>
              {/* Medical Alert */}
              <div className={`flex gap-3 p-4 rounded-lg border ${hasAlert ? 'bg-error-container/20 border-error/20' : 'bg-surface-container border-outline-variant'} ${isLarge ? 'lg:col-span-2' : ''}`}>
                <span className={`material-symbols-outlined mt-0.5 ${hasAlert ? 'text-error' : 'text-on-surface-variant'}`} style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                  {hasAlert ? 'medical_information' : 'check_circle'}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${hasAlert ? 'text-error' : 'text-on-surface'}`}>
                    {hasAlert ? 'Medical Alert' : 'No Medical Alerts'}
                  </h4>
                  <p className="text-xs mt-0.5 text-on-surface-variant">{patient.medical_history || 'No recorded allergies or chronic conditions.'}</p>
                </div>
              </div>

              {/* Patient Info (large view only) */}
              {isLarge && (
                <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                  <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Patient Information</h4>
                  {[
                    { label: 'Full Name', value: patient.full_name },
                    { label: 'Contact', value: patient.contact_number || '—' },
                    { label: 'Address', value: patient.address || '—' },
                    { label: 'Birthday', value: patient.birthday || '—' },
                    { label: 'Sex', value: patient.sex || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start pb-3 border-b border-outline-variant/30 last:border-0 last:pb-0">
                      <span className="text-xs text-on-surface-variant">{label}</span>
                      <span className="text-xs font-semibold text-on-surface text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Visit Log */}
              <div className={isLarge ? '' : ''}>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  Clinic Appointments ({visits.length})
                </h4>
                <div className={`space-y-2 overflow-y-auto pr-1 ${isLarge ? 'max-h-72' : 'max-h-80'}`}>
                  {visits.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant bg-white border border-outline-variant rounded-lg text-xs font-semibold">
                      No recorded visits yet.
                    </div>
                  ) : (
                    visits.map(app => (
                      <div key={app.id} className="flex justify-between items-center p-3 bg-white border border-outline-variant rounded-lg hover:border-outline/50 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-on-surface">{app.service?.service_name || 'General check-up'}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            Ref: {app.reference_number || 'WLK-' + app.id} · {app.appointment_date} · {formatTime(app.appointment_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">₱{(app.service?.price || 0).toLocaleString()}</p>
                          <span className={`text-[10px] font-bold mt-0.5 block ${
                            app.status === 'Completed' ? 'text-primary' :
                            app.status === 'Cancelled' ? 'text-error' : 'text-on-surface-variant'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Prescriptions Tab ─── */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              {isLoadingEhr ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
                  <p className="text-xs font-semibold">Loading prescriptions...</p>
                </div>
              ) : ehrError ? (
                <div className="p-4 bg-error-container text-error rounded-lg text-xs font-bold">{ehrError}</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Prescription History ({ehrData?.prescriptions?.length || 0})
                    </h4>
                    {!isAddingPrescription && (
                      <button
                        onClick={() => setIsAddingPrescription(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_document</span>
                        Write Prescription
                      </button>
                    )}
                  </div>

                  {/* Add Prescription Form */}
                  {isAddingPrescription && (
                    <form onSubmit={handleSavePrescription} className="bg-white border border-outline rounded-xl p-5 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-on-surface">New Prescription</h5>
                        <button type="button" onClick={() => setIsAddingPrescription(false)} className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Doctor Name *</label>
                          <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Jane Doe" required className="w-full px-3 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">PRC License Number</label>
                          <input type="text" value={prcNumber} onChange={e => setPrcNumber(e.target.value)} placeholder="123456" className="w-full px-3 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Medications / Rx Items *</label>
                        {medItems.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="grid grid-cols-12 gap-2 flex-1">
                              <input type="text" value={item.name} onChange={e => handleMedItemChange(idx, 'name', e.target.value)} placeholder="Medicine Name & strength" required={idx === 0} className="col-span-6 px-3 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary" />
                              <input type="text" value={item.dosage} onChange={e => handleMedItemChange(idx, 'dosage', e.target.value)} placeholder="Dosage" className="col-span-2 px-2 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary" />
                              <input type="text" value={item.frequency} onChange={e => handleMedItemChange(idx, 'frequency', e.target.value)} placeholder="Frequency" className="col-span-2 px-2 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary" />
                              <input type="text" value={item.quantity} onChange={e => handleMedItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" className="col-span-2 px-2 py-2 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary" />
                            </div>
                            <button type="button" onClick={() => handleRemoveMedRow(idx)} disabled={medItems.length === 1} className="p-1.5 text-error rounded-full hover:bg-error-container/20 disabled:opacity-30">
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddMedRow} className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 cursor-pointer">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                          Add Medication Row
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Special Instructions</label>
                        <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Directions for use" rows={2} className="w-full p-3 border border-outline-variant rounded-lg text-xs bg-white text-on-surface focus:outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
                        <button type="button" onClick={() => setIsAddingPrescription(false)} className="px-4 py-2 border border-outline-variant text-xs font-bold text-on-surface rounded-lg hover:bg-surface-container-high transition-all">Cancel</button>
                        <button type="submit" disabled={isSavingPrescription} className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-95 disabled:opacity-50 transition-all">
                          {isSavingPrescription ? 'Saving...' : 'Save Prescription'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Prescription List */}
                  <div className={`space-y-3 ${isLarge ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 space-y-0' : ''}`}>
                    {(!ehrData?.prescriptions || ehrData.prescriptions.length === 0) ? (
                      <div className={`text-center py-12 bg-white border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant ${isLarge ? 'lg:col-span-2' : ''}`}>
                        No prescriptions written for this patient yet.
                      </div>
                    ) : (
                      ehrData.prescriptions.map(rx => {
                        const items = typeof rx.items === 'string' ? JSON.parse(rx.items) : rx.items;
                        return (
                          <div key={rx.id} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm space-y-3 hover:border-outline transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-on-surface">Dr. {rx.doctor_name}</p>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">PRC No: {rx.prc_license_number || 'N/A'} &middot; Date: {rx.prescription_date}</p>
                              </div>
                              <button onClick={() => handlePrint(rx)} className="flex items-center gap-1 px-3 py-1 bg-surface-container border border-outline-variant text-[10px] font-bold uppercase tracking-wider text-on-surface-variant rounded-md hover:bg-surface-container-high transition-all cursor-pointer">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>print</span>
                                Print Rx
                              </button>
                            </div>
                            <div className="pl-2 border-l-2 border-primary/20 space-y-1.5">
                              {items.map((item, idx) => (
                                <div key={idx} className="text-xs text-on-surface">
                                  <span className="font-semibold">{item.name}</span>
                                  {item.dosage && <span className="text-on-surface-variant"> - {item.dosage}</span>}
                                  {item.frequency && <span className="text-on-surface-variant"> ({item.frequency})</span>}
                                  {item.quantity && <span className="text-on-surface-variant">, Qty: {item.quantity}</span>}
                                </div>
                              ))}
                            </div>
                            {rx.instructions && (
                              <div className="bg-surface-bright p-2.5 rounded-lg border border-outline-variant/40">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Instructions</p>
                                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{rx.instructions}</p>
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

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-bright flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-all">
            Close File
          </button>
        </div>
      </div>
    </div>
  );
}
