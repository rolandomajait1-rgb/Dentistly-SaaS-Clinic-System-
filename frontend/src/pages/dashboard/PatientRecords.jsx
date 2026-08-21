import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPatients, createPatient } from '../../api';
import PatientModal from '../../components/patients/PatientModal';
import { useNotifications } from '../../context/NotificationContext';
import {
  CaretRight,
  MagnifyingGlass,
  Plus,
  X,
  User,
  Phone,
  Stethoscope,
  MapPin,
  CalendarBlank,
  CircleNotch,
  Check
} from '@phosphor-icons/react';

// Date Formatter Helper e.g. "July 19, 2026"
const formatVisitDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
};

// Initials Helper e.g. "Evelyn Hughes" -> "EH", "RG", "CS"
const getInitials = (name) => {
  if (!name) return 'PT';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PatientRecords({ clinicId, user }) {
  const { showToast } = useNotifications();

  // Data states
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'New' | 'Returning'

  // Selected Patient for EHR modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Add Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGender, setNewGender] = useState('Female');
  const [newAge, setNewAge] = useState('');
  const [newMedicalNotes, setNewMedicalNotes] = useState('');
  const [newAssignedDoctor, setNewAssignedDoctor] = useState('Dr. Park');

  const fetchPatientList = useCallback(async () => {
    try {
      const data = await getPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      await fetchPatientList();
      if (active) setIsLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchPatientList, clinicId]);

  // Transform / Compute Patient fields for display
  const enrichedPatients = useMemo(() => {
    // List of standard doctors for fallback rotation if unassigned
    const fallbackDoctors = ['Dr. Park', 'Dr. Lee', 'Dr. Ahmed', 'Dr. Chen', 'Dr. Kim', 'Dr. Nguyen'];

    return patients.map((p, idx) => {
      const visits = p.appointments || [];
      const visitCount = typeof p.appointments_count === 'number' ? p.appointments_count : visits.length;

      // Determine patient type: Returning if > 1 visit, otherwise New Patient
      const isReturning = visitCount > 1 || p.is_returning === true || p.patient_type === 'returning';
      const patientType = isReturning ? 'Returning' : 'New Patient';

      // Last visit date
      let lastVisitDate = '—';
      if (visits.length > 0 && visits[0].appointment_date) {
        lastVisitDate = formatVisitDate(visits[0].appointment_date);
      } else if (p.created_at) {
        lastVisitDate = formatVisitDate(p.created_at);
      }

      // Dentist Assigned (from approver or doctor on latest appointment or fallback)
      let dentist = p.assigned_doctor;
      if (!dentist && visits.length > 0) {
        dentist = visits[0].approver?.user?.name || visits[0].approver?.name || visits[0].doctor_name;
      }
      if (!dentist) {
        dentist = fallbackDoctors[idx % fallbackDoctors.length];
      }

      return {
        ...p,
        visitCount,
        isReturning,
        patientType,
        lastVisitDate,
        dentistAssigned: dentist,
      };
    });
  }, [patients]);

  // Filter patients based on Search and Type Filter
  const filteredPatients = useMemo(() => {
    return enrichedPatients.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const name = (p.full_name || '').toLowerCase();
      const phone = (p.contact_number || '').toLowerCase();
      const dentist = (p.dentistAssigned || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || phone.includes(q) || dentist.includes(q);

      const matchesType =
        typeFilter === 'All' ||
        (typeFilter === 'New' && !p.isReturning) ||
        (typeFilter === 'Returning' && p.isReturning);

      return matchesSearch && matchesType;
    });
  }, [enrichedPatients, searchTerm, typeFilter]);

  // Handle Create Patient Form Submission
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newPhone.trim()) {
      return showToast('Patient Full Name and Contact Number are required.', 'warning');
    }

    setIsSubmitting(true);
    try {
      await createPatient({
        full_name: newFullName.trim(),
        contact_number: newPhone.trim(),
        email: newEmail.trim() || null,
        address: newAddress.trim() || null,
        gender: newGender,
        age: newAge ? parseInt(newAge, 10) : null,
        medical_history: newMedicalNotes.trim() || 'None',
        assigned_doctor: newAssignedDoctor,
      });

      showToast(`Patient ${newFullName.trim()} registered successfully!`, 'success');
      setNewFullName('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
      setNewAge('');
      setNewMedicalNotes('');
      setShowAddModal(false);
      await fetchPatientList();
    } catch (err) {
      showToast(err.message || 'Failed to create patient record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col w-full min-h-full overflow-x-hidden"
      style={{
        fontFamily: "'Work Sans', sans-serif",
        background: '#F0F4F3',
      }}
    >
      {/* ── Main Canvas Content Area (Design Spec) ── */}
      <div
        className="w-full flex-1 flex flex-col justify-start items-start gap-4 p-4 md:p-6 overflow-x-auto bg-[#F0F4F3]"
      >
        {/* ── Sub-header Search & Filter Controls Bar (Design Spec) ── */}
        <div className="w-full flex flex-wrap justify-between items-center gap-3">
          {/* Search Name Input Box */}
          <div
            className="flex items-center gap-2.5 px-3 py-1 flex-1 min-w-[260px] max-w-xl transition-all"
            style={{
              height: 45,
              background: 'rgba(255, 255, 255, 0.66)',
              boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
              borderRadius: 10,
            }}
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <MagnifyingGlass size={16} weight="bold" color="#6A7282" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name"
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-[#99A1AF] focus:outline-none font-medium"
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 12,
                fontWeight: '500',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* Right Group: Type Filter Tabs + Add Patient Button */}
          <div className="flex items-center gap-3">
            {/* Filter Tabs: All, New, Returning (Design Spec) */}
            <div
              className="flex items-center gap-1 bg-white p-1 rounded-[10px]"
              style={{
                height: 45,
                paddingLeft: 10,
                paddingRight: 10,
                outline: '1.33px #E5E7EB solid',
                outlineOffset: '-1.33px',
              }}
            >
              {['All', 'New', 'Returning'].map((tab) => {
                const isActive = typeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setTypeFilter(tab)}
                    className="transition-all cursor-pointer select-none"
                    style={
                      isActive
                        ? {
                            paddingLeft: 16,
                            paddingRight: 16,
                            paddingTop: 6,
                            paddingBottom: 6,
                            background: '#0E3F39',
                            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                            borderRadius: 5,
                            color: 'white',
                            fontSize: 12,
                            fontWeight: '600',
                            lineHeight: '16px',
                          }
                        : {
                            paddingLeft: 16,
                            paddingRight: 16,
                            paddingTop: 6,
                            paddingBottom: 6,
                            borderRadius: 10,
                            color: '#6A7282',
                            fontSize: 12,
                            fontWeight: '600',
                            lineHeight: '16px',
                          }
                    }
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* + Add New Patient Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 transition-all shadow-sm hover:opacity-95 active:scale-98 cursor-pointer shrink-0"
              style={{
                height: 45,
                paddingLeft: 16,
                paddingRight: 16,
                background: '#0F3E38',
                borderRadius: 10,
                color: 'white',
                fontSize: 13,
                fontWeight: '700',
                lineHeight: '20px',
              }}
            >
              <Plus size={16} weight="bold" color="white" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* ── Patients Table (Design Spec) ── */}
        <div
          className="w-full flex flex-col justify-start items-start shrink-0 overflow-hidden"
          style={{
            minWidth: 900,
            background: 'white',
            borderRadius: 10,
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
          }}
        >
          {/* Table Header Row (Height: 50px, Background: #F8FAFA) */}
          <div
            className="w-full flex items-center justify-start shrink-0"
            style={{
              height: 50,
              background: '#F8FAFA',
              borderBottom: '1px rgba(0, 0, 0, 0.05) solid',
            }}
          >
            {/* Column 1: Patient (25% width) */}
            <div className="flex-1 px-4 flex items-center justify-start">
              <span
                style={{
                  color: '#6A7282',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Patient
              </span>
            </div>

            {/* Column 2: Type (15% width) */}
            <div className="w-[140px] px-2 flex items-center justify-center text-center">
              <span
                style={{
                  color: '#6A7282',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Type
              </span>
            </div>

            {/* Column 3: Dentist Assigned (20% width) */}
            <div className="flex-1 px-4 flex items-center justify-center text-center">
              <span
                style={{
                  color: '#6A7282',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Dentist Assigned
              </span>
            </div>

            {/* Column 4: Last Visit (20% width) */}
            <div className="flex-1 px-4 flex items-center justify-center text-center">
              <span
                style={{
                  color: '#6A7282',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Last Visit
              </span>
            </div>

            {/* Column 5: Visits (10% width) */}
            <div className="w-[100px] px-2 flex items-center justify-center text-center">
              <span
                style={{
                  color: '#6A7282',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                Visits
              </span>
            </div>

            {/* Column 6: Action Column (width: 80px) */}
            <div className="w-[80px] px-2" />
          </div>

          {/* Table Body Rows */}
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <CircleNotch size={32} weight="bold" className="animate-spin text-[#0E3F39]" />
              <p className="text-xs font-medium">Loading patient directory...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="w-full text-center py-16 text-slate-400">
              <User size={44} weight="duotone" className="mx-auto mb-2 opacity-30 text-[#0E3F39]" />
              <p className="text-sm font-semibold text-slate-600">No patients found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm || typeFilter !== 'All'
                  ? 'Try adjusting your search or filter'
                  : 'Click "+ Add Patient" to register your first patient.'}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const initials = getInitials(patient.full_name);
              const isReturning = patient.isReturning;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full flex items-center justify-start transition-colors hover:bg-[#F9FCFB] cursor-pointer group select-none"
                  style={{
                    height: 83,
                    background: 'white',
                    borderBottom: '1px rgba(0, 0, 0, 0.05) solid',
                  }}
                >
                  {/* Column 1: Patient (Avatar + Full Name + Contact) */}
                  <div className="flex-1 px-4 flex items-center justify-start gap-3 min-w-0">
                    <div
                      className="shrink-0 flex items-center justify-center font-bold text-xs"
                      style={{
                        width: 33,
                        height: 33,
                        background: '#DCE8F5',
                        borderRadius: 20,
                        color: '#1E2939',
                        fontSize: 12,
                        fontWeight: '700',
                        lineHeight: '16px',
                      }}
                    >
                      {initials}
                    </div>

                    <div className="flex flex-col justify-center items-start min-w-0">
                      <span
                        className="truncate group-hover:text-[#0E3F39] transition-colors"
                        style={{
                          color: '#1E2939',
                          fontSize: 14,
                          fontWeight: '500',
                          lineHeight: '20px',
                        }}
                      >
                        {patient.full_name || 'Walk-in Patient'}
                      </span>
                      <span
                        className="truncate"
                        style={{
                          color: '#99A1AF',
                          fontSize: 12,
                          fontWeight: '400',
                          lineHeight: '16px',
                        }}
                      >
                        {patient.contact_number || 'No contact number'}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Type (Returning vs New Patient pill) */}
                  <div className="w-[140px] px-2 flex items-center justify-center">
                    {isReturning ? (
                      <div
                        style={{
                          paddingLeft: 8,
                          paddingRight: 8,
                          paddingTop: 2,
                          paddingBottom: 2,
                          background: '#D1FAE5',
                          borderRadius: 22369600,
                          color: '#047857',
                          fontSize: 12,
                          fontWeight: '500',
                          lineHeight: '16px',
                        }}
                      >
                        Returning
                      </div>
                    ) : (
                      <div
                        style={{
                          paddingLeft: 8,
                          paddingRight: 8,
                          paddingTop: 2,
                          paddingBottom: 2,
                          background: '#DBEAFE',
                          borderRadius: 22369600,
                          color: '#1D4ED8',
                          fontSize: 12,
                          fontWeight: '500',
                          lineHeight: '16px',
                        }}
                      >
                        New Patient
                      </div>
                    )}
                  </div>

                  {/* Column 3: Dentist Assigned */}
                  <div className="flex-1 px-4 flex items-center justify-center text-center">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontWeight: '400',
                        lineHeight: '20px',
                      }}
                    >
                      {patient.dentistAssigned || 'Dr. Park'}
                    </span>
                  </div>

                  {/* Column 4: Last Visit */}
                  <div className="flex-1 px-4 flex items-center justify-center text-center">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontWeight: '400',
                        lineHeight: '20px',
                      }}
                    >
                      {patient.lastVisitDate}
                    </span>
                  </div>

                  {/* Column 5: Visits Count */}
                  <div className="w-[100px] px-2 flex items-center justify-center text-center">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontWeight: '400',
                        lineHeight: '20px',
                      }}
                    >
                      {patient.visitCount}
                    </span>
                  </div>

                  {/* Column 6: Actions / Chevron Right Indicator */}
                  <div className="w-[80px] px-4 flex items-center justify-end">
                    <div className="p-1 rounded-full text-[#6A7282] group-hover:text-[#0E3F39] group-hover:translate-x-1 transition-all flex items-center justify-center">
                      <CaretRight size={16} weight="bold" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── ADD NEW PATIENT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0E3F39] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Register New Patient</h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Create a permanent electronic dental health file
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <User size={16} weight="duotone" className="absolute left-3 top-3 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Evelyn Hughes"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} weight="duotone" className="absolute left-3 top-3 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="0917-123-4567"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Gender, Age, and Assigned Dentist */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Dentist
                  </label>
                  <select
                    value={newAssignedDoctor}
                    onChange={(e) => setNewAssignedDoctor(e.target.value)}
                    className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Dr. Park">Dr. Park</option>
                    <option value="Dr. Lee">Dr. Lee</option>
                    <option value="Dr. Ahmed">Dr. Ahmed</option>
                    <option value="Dr. Chen">Dr. Chen</option>
                    <option value="Dr. Kim">Dr. Kim</option>
                    <option value="Dr. Nguyen">Dr. Nguyen</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Home Address (Optional)
                </label>
                <div className="relative">
                  <MapPin size={16} weight="duotone" className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Barangay, City / Municipality"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Medical Notes / Allergies */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Medical Alerts / Allergies (Optional)
                </label>
                <textarea
                  value={newMedicalNotes}
                  onChange={(e) => setNewMedicalNotes(e.target.value)}
                  placeholder="Allergies to penicillin, latex, local anesthesia, heart conditions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0E3F39] hover:bg-[#14534B] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} weight="bold" />
                      <span>Save Patient Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PATIENT EHR MODAL (Opens upon clicking any patient row) ── */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          isLarge={true}
        />
      )}
    </div>
  );
}
