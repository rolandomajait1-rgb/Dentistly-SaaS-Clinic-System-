import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export default function PatientDetailView({ patient, onBack }) {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'visits' | 'treatment'
  const [isEditing, setIsEditing] = useState(false);

  // Parse patient full name
  const rawName = patient?.full_name || 'Evelyn Hughes';
  const nameParts = rawName.trim().split(' ').filter(Boolean);
  const initialLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || 'Hughes';
  const initialFirstName = nameParts.length > 1 ? nameParts.slice(0, nameParts.length - 1).join(' ') : nameParts[0] || 'Evelyn';

  // Form State for Edit Mode (Image 3)
  const [formData, setFormData] = useState({
    lastName: initialLastName,
    firstName: initialFirstName,
    middleName: '',
    nickname: '',
    sex: patient?.gender || patient?.sex || 'Female',
    birthdate: patient?.birth_date || '1990-03-14',
    age: patient?.age ? String(patient.age) : '',
    religion: '',
    nationality: patient?.nationality || '',
    homeAddress: patient?.address || '123 Rizal St, Makati City',
    homeNo: '',
    officeNo: '',
    faxNo: '',
    mobileNo: patient?.contact_number || '+63 917 123 4567',
    email: patient?.email || 'evelyn@email.com',
    occupation: patient?.occupation || 'Accountant',
    dentalInsurance: patient?.insurance || '',
    effectiveDate: '',
    guardianName: 'Mark Hughes',
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    setIsEditing(false);
    showToast('Patient information updated successfully!', 'success');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Avatar initials
  const initials = rawName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'EH';

  const isReturning = patient?.is_returning !== false;
  const lastVisit = patient?.lastVisitDate || '2026-06-12';

  // Visit history data matching Image 1
  const visitHistory = [
    { date: '2026-06-12', service: 'Oral Prophylaxis', dentist: 'Dr. Maria Santos', status: 'Completed', price: '₱400' },
    { date: '2026-04-03', service: 'Dental Filling', dentist: 'Dr. Carlos Reyes', status: 'Completed', price: '₱600' },
    { date: '2026-01-18', service: 'Dental X-Ray', dentist: 'Dr. Maria Santos', status: 'Completed', price: '₱250' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#F0F4F3]" style={{ fontFamily: "'Work Sans', sans-serif" }}>

      {/* ── Sub-header Banner (Patient snapshot matching Images 1 - 4) ── */}
      <div className="w-full bg-white border-b border-black/10 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DCE8F5] text-[#1E3A5F] font-bold text-base flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-slate-900 text-lg font-bold">
                {formData.firstName} {formData.lastName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#047857]">
                {isReturning ? 'Returning' : 'New Patient'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1 font-normal">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-gray-400">call</span>
                {formData.mobileNo}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-gray-400">mail</span>
                {formData.email}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-gray-400">calendar_month</span>
                Last visit: {lastVisit}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons on top right (Images 2 & 3) */}
        {activeTab === 'personal' && (
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#0E3F39] hover:bg-[#14534B] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-[10px] border border-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-500">edit</span>
                <span>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs Navigation Bar (Images 1 - 4) ── */}
      <div className="w-full bg-white border-b border-black/10 px-6 sm:px-8 flex gap-8 shrink-0 overflow-x-auto no-scrollbar">
        {[
          { id: 'personal',  label: 'Personal Info' },
          { id: 'visits',    label: 'Visit History' },
          { id: 'treatment', label: 'Treatment Notes' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'personal') setIsEditing(false);
              }}
              className={`py-3.5 text-sm transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-[#0E3F39] text-[#0E3F39] font-bold'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-slate-800 font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Canvas ── */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">

        {/* ══════════ TAB 1: PERSONAL INFO (Images 2 & 3) ══════════ */}
        {activeTab === 'personal' && (
          <div className="max-w-[760px] w-full mx-auto bg-white rounded-[14px] p-6 sm:p-8 shadow-[0px_0px_4px_rgba(0,0,0,0.10)] border border-black/5 my-1">
            {/* Header with single clean dark-green underline */}
            <div className="pb-2 border-b-[1.5px] border-[#0E3F39] mb-6">
              <span className="text-[#0E3F39] text-xs font-bold uppercase tracking-wider">
                PERSONAL INFORMATION
              </span>
            </div>

            {/* Form Fields */}
            {isEditing ? (
              /* ── EDIT MODE (Image 3) ── */
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    NAME <span className="text-[9px] font-normal text-gray-400">(Last Name, First Name, Middle Name)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Hughes"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39] focus:ring-1 focus:ring-[#0E3F39]"
                    />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Evelyn"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39] focus:ring-1 focus:ring-[#0E3F39]"
                    />
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleChange('middleName', e.target.value)}
                      placeholder="Middle Name"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39] focus:ring-1 focus:ring-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Nickname & Sex */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">NICKNAME</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleChange('nickname', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2.5">SEX</label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                          type="radio"
                          name="editSex"
                          checked={formData.sex?.toLowerCase() === 'male'}
                          onChange={() => handleChange('sex', 'Male')}
                          className="w-4 h-4 text-[#0E3F39] focus:ring-[#0E3F39]"
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                          type="radio"
                          name="editSex"
                          checked={formData.sex?.toLowerCase() === 'female'}
                          onChange={() => handleChange('sex', 'Female')}
                          className="w-4 h-4 text-[#0E3F39] focus:ring-[#0E3F39]"
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Birthdate & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">BIRTHDATE (MM/DD/YYYY)</label>
                    <input
                      type="text"
                      value={formData.birthdate}
                      onChange={(e) => handleChange('birthdate', e.target.value)}
                      placeholder="1990-03-14"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">AGE</label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Religion & Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">RELIGION</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => handleChange('religion', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">NATIONALITY</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Home Address */}
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">HOME ADDRESS</label>
                  <input
                    type="text"
                    value={formData.homeAddress}
                    onChange={(e) => handleChange('homeAddress', e.target.value)}
                    placeholder="123 Rizal St, Makati City"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                  />
                </div>

                {/* Home No & Office No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">HOME NO.</label>
                    <input
                      type="text"
                      value={formData.homeNo}
                      onChange={(e) => handleChange('homeNo', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">OFFICE NO.</label>
                    <input
                      type="text"
                      value={formData.officeNo}
                      onChange={(e) => handleChange('officeNo', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Fax No & Cell No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">FAX NO.</label>
                    <input
                      type="text"
                      value={formData.faxNo}
                      onChange={(e) => handleChange('faxNo', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">CELL / MOBILE NO.</label>
                    <input
                      type="text"
                      value={formData.mobileNo}
                      onChange={(e) => handleChange('mobileNo', e.target.value)}
                      placeholder="+63 917 123 4567"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="evelyn@email.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                  />
                </div>

                {/* Occupation & Insurance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">OCCUPATION</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                      placeholder="Accountant"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">DENTAL INSURANCE</label>
                    <input
                      type="text"
                      value={formData.dentalInsurance}
                      onChange={(e) => handleChange('dentalInsurance', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                    />
                  </div>
                </div>

                {/* Effective Date */}
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">EFFECTIVE DATE</label>
                  <input
                    type="text"
                    value={formData.effectiveDate}
                    onChange={(e) => handleChange('effectiveDate', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">PARENT / GUARDIAN&apos;S NAME (FOR MINORS)</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => handleChange('guardianName', e.target.value)}
                    placeholder="Mark Hughes"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0E3F39]"
                  />
                </div>
              </div>
            ) : (
              /* ── READ-ONLY VIEW MODE (Image 2) ── */
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">NAME</span>
                    <span className="text-gray-400 text-[9px] tracking-wide">(Last Name, First Name, Middle Name)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {formData.lastName || 'Hughes'}
                    </div>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {formData.firstName || 'Evelyn'}
                    </div>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.middleName || '—'}
                    </div>
                  </div>
                </div>

                {/* Nickname & Sex */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">NICKNAME</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.nickname || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">SEX</span>
                    <div className="flex items-center gap-6 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          formData.sex?.toLowerCase() === 'male' ? 'border-[#0E3F39] bg-[#0E3F39]' : 'border-neutral-300'
                        }`}>
                          {formData.sex?.toLowerCase() === 'male' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${formData.sex?.toLowerCase() === 'male' ? 'text-[#0E3F39] font-bold' : 'text-neutral-400'}`}>Male</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          formData.sex?.toLowerCase() === 'female' ? 'border-[#0E3F39] bg-[#0E3F39]' : 'border-neutral-300'
                        }`}>
                          {formData.sex?.toLowerCase() === 'female' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${formData.sex?.toLowerCase() === 'female' ? 'text-[#0E3F39] font-bold' : 'text-neutral-400'}`}>Female</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birthdate & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">BIRTHDATE (MM/DD/YYYY)</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {formData.birthdate || '1990-03-14'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">AGE</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.age || '—'}
                    </div>
                  </div>
                </div>

                {/* Religion & Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">RELIGION</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.religion || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">NATIONALITY</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.nationality || '—'}
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">HOME ADDRESS</span>
                  <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                    {formData.homeAddress || '123 Rizal St, Makati City'}
                  </div>
                </div>

                {/* Home No & Office No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">HOME NO.</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.homeNo || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">OFFICE NO.</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.officeNo || '—'}
                    </div>
                  </div>
                </div>

                {/* Fax No & Cell No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">FAX NO.</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.faxNo || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">CELL / MOBILE NO.</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {formData.mobileNo || '+63 917 123 4567'}
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">EMAIL ADDRESS</span>
                  <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                    {formData.email || 'evelyn@email.com'}
                  </div>
                </div>

                {/* Occupation & Insurance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">OCCUPATION</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                      {formData.occupation || 'Accountant'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">DENTAL INSURANCE</span>
                    <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                      {formData.dentalInsurance || '—'}
                    </div>
                  </div>
                </div>

                {/* Effective Date */}
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">EFFECTIVE DATE</span>
                  <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-neutral-300">
                    {formData.effectiveDate || '—'}
                  </div>
                </div>

                {/* Guardian Name */}
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">PARENT / GUARDIAN&apos;S NAME (FOR MINORS)</span>
                  <div className="py-1 border-b border-black/10 min-h-8 flex items-center text-sm text-slate-800 font-medium">
                    {formData.guardianName || 'Mark Hughes'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ TAB 2: VISIT HISTORY (Image 1) ══════════ */}
        {activeTab === 'visits' && (
          <div className="w-full bg-white rounded-[14px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-xs font-semibold text-[#6A7282] bg-white">
                    <th className="py-4 px-6 font-semibold">Date</th>
                    <th className="py-4 px-6 font-semibold">Service</th>
                    <th className="py-4 px-6 font-semibold">Dentist</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-sm">
                  {visitHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800 text-xs">
                        {item.date}
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {item.service}
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {item.dentist}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-[#D1FAE5] text-[#047857] rounded-full text-xs font-semibold">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-800 font-medium text-xs">
                        {item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ TAB 3: TREATMENT NOTES (Image 4 & media_1791904956663.png) ══════════ */}
        {activeTab === 'treatment' && (
          <div className="w-full bg-white rounded-[14px] px-6 py-5 shadow-[0px_0px_4px_rgba(0,0,0,0.10)] border border-black/5">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                  Oral Prophylaxis
                </span>
                <span className="text-gray-400 text-xs">—</span>
                <span className="text-[#6A7282] text-xs sm:text-[13px] font-normal">
                  2026-06-12
                </span>
              </div>
              <span className="text-[#6A7282] text-xs sm:text-[13px] font-normal">
                Dr. Maria Santos
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-[19px]">
              Patient presented for regular cleaning. No new caries detected. Gum health improved since last visit.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
