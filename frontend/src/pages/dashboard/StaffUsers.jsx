import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStaff, createStaff, deleteStaff } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import {
  Plus,
  UserPlus,
  Trash,
  DotsThreeVertical,
  MagnifyingGlass,
  X,
  User,
  EnvelopeSimple,
  LockKey,
  ShieldCheck,
  Check,
} from '@phosphor-icons/react';

// Initials Helper e.g. "Dr. Sarah Jenkins" -> "SJ", "Admin_Name" -> "AD"
const getInitials = (name) => {
  if (!name) return 'ST';
  const clean = name.replace(/^Dr\.\s*/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Role styling helper matching Figma
const getRoleBadgeStyle = (role = '') => {
  const r = role.toLowerCase();
  if (r.includes('admin') && r.includes('restricted')) {
    return { bg: '#FDE3E7', color: '#C01570', label: 'Admin (restricted)' };
  }
  if (r.includes('admin') || r.includes('owner')) {
    return { bg: '#E5C7FF', color: '#80388E', label: 'Admin' };
  }
  if (r.includes('dentist') || r.includes('doctor')) {
    return { bg: '#E1FFF9', color: '#10AA9D', label: 'Dentist' };
  }
  if (r.includes('assistant')) {
    return { bg: '#F8FDE9', color: '#918658', label: 'Dental Assistant' };
  }
  if (r.includes('receptionist')) {
    return { bg: '#E0F2FE', color: '#0369A1', label: 'Receptionist' };
  }
  return { bg: '#E1FFF9', color: '#10AA9D', label: role || 'Staff' };
};

export default function StaffUsers({ clinicId, user }) {
  const { showToast } = useNotifications();

  // Staff users state
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'dentist' | 'assistant'

  // Add Staff Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Dentist');
  const [newPassword, setNewPassword] = useState('Pivodent123!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action Menu Dropdown state (id of staff member whose menu is open)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch Staff List
  const fetchStaffList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getStaff();
      if (res && res.staff) {
        setStaffList(res.staff);
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      // Fallback matching Figma spec
      setStaffList([
        {
          id: 1,
          name: 'Admin_Name',
          email: 'admin@pivodent.com',
          role: 'Admin',
          last_login: 'Jul 19, 2026 10:30 AM',
          started: 'Dec 12, 2022',
        },
        {
          id: 2,
          name: 'Dr. Park',
          email: 'park@pivodent.com',
          role: 'Dentist',
          last_login: 'Jul 19, 2026 10:30 AM',
          started: 'Jan 15, 2023',
        },
        {
          id: 3,
          name: 'Dr. Lee',
          email: 'lee@pivodent.com',
          role: 'Dentist',
          last_login: 'Jul 19, 2026 10:30 AM',
          started: 'Jan 10, 2023',
        },
        {
          id: 4,
          name: 'Miranda Bailey',
          email: 'bailey@pivodent.com',
          role: 'Dental Assistant',
          last_login: 'Jul 19, 2026 10:30 AM',
          started: 'Jan 10, 2023',
        },
        {
          id: 5,
          name: 'Pia Carlos',
          email: 'pia@pivodent.com',
          role: 'Admin (restricted)',
          last_login: 'Jul 19, 2026 10:30 AM',
          started: 'Jan 10, 2023',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Handle Add Staff Submit
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      return showToast('Please enter both Full Name and Email Address.', 'warning');
    }

    try {
      setIsSubmitting(true);
      const res = await createStaff({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        password: newPassword,
      });

      showToast(res.message || `Staff member ${newName.trim()} added successfully!`, 'success');
      setNewName('');
      setNewEmail('');
      setNewRole('Dentist');
      setNewPassword('Pivodent123!');
      setShowAddModal(false);
      await fetchStaffList();
    } catch (err) {
      showToast(err.message || 'Failed to add staff member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the staff directory?`)) {
      return;
    }

    try {
      await deleteStaff(id);
      showToast(`${name} removed successfully.`, 'success');
      setActiveMenuId(null);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      showToast(err.message || 'Failed to remove staff member.', 'error');
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === 'all' ||
        (s.role && s.role.toLowerCase().includes(roleFilter.toLowerCase()));

      return matchesQuery && matchesRole;
    });
  }, [staffList, searchTerm, roleFilter]);

  return (
    <div
      className="w-full flex-1 flex flex-col justify-start items-start gap-4 p-4 md:p-6 overflow-x-auto"
      style={{
        fontFamily: "'Work Sans', sans-serif",
        background: '#F0F4F3',
      }}
    >
      {/* ── Toolbar: Search, Role Filter, and + Add Staff Button ── */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3">
        {/* Left: Search input */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
          <div
            className="flex items-center gap-2.5 px-3 py-1 w-full transition-all"
            style={{
              height: 45,
              background: 'rgba(255, 255, 255, 0.80)',
              boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
              borderRadius: 10,
              border: '1px #E5E7EB solid',
            }}
          >
            <MagnifyingGlass size={16} weight="bold" color="#6A7282" />
            <input
              type="text"
              placeholder="Search staff name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Role Filter Pills & + Add Staff Button */}
        <div className="flex items-center gap-3">
          {/* Role Filter Selector */}
          <div
            className="flex items-center gap-1 p-0.5 rounded-[10px]"
            style={{ background: '#E5EAEA' }}
          >
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'dentist', label: 'Dentists' },
              { id: 'assistant', label: 'Assistants' },
              { id: 'admin', label: 'Admins' },
            ].map((opt) => {
              const isActive = roleFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setRoleFilter(opt.id)}
                  className="transition-all cursor-pointer select-none px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={
                    isActive
                      ? {
                          background: '#0E3F39',
                          color: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }
                      : {
                          color: '#5A7A76',
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* + Add Staff Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F3E38] hover:bg-[#14534B] active:scale-98 text-white rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            style={{
              height: 42,
              borderRadius: 10,
            }}
          >
            <Plus size={16} weight="bold" />
            <span>Add Staff User</span>
          </button>
        </div>
      </div>

      {/* ── Users Table Card (Exact Figma Spec) ── */}
      <div
        className="w-full flex flex-col justify-start items-start shrink-0 overflow-hidden"
        style={{
          minWidth: 720,
          background: 'white',
          borderRadius: 10,
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
        }}
      >
        {/* Table Header Row */}
        <div
          className="w-full grid grid-cols-12 items-center"
          style={{
            height: 50,
            background: 'white',
            borderBottom: '1px rgba(0, 0, 0, 0.05) solid',
          }}
        >
          {/* Col 1: User (4 cols) */}
          <div className="col-span-4 px-6 flex items-center">
            <span
              style={{
                color: '#6A7282',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: '20px',
              }}
            >
              User
            </span>
          </div>

          {/* Col 2: Role (2 cols) */}
          <div className="col-span-2 px-4 flex items-center justify-center">
            <span
              style={{
                color: '#6A7282',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: '20px',
              }}
            >
              Role
            </span>
          </div>

          {/* Col 3: Last Login (3 cols) */}
          <div className="col-span-3 px-4 flex items-center justify-center">
            <span
              style={{
                color: '#6A7282',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: '20px',
              }}
            >
              Last Login
            </span>
          </div>

          {/* Col 4: Started (2 cols) */}
          <div className="col-span-2 px-4 flex items-center justify-center">
            <span
              style={{
                color: '#6A7282',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: '20px',
              }}
            >
              Started
            </span>
          </div>

          {/* Col 5: Action (1 col) */}
          <div className="col-span-1 px-4 flex items-center justify-center">
            <span
              style={{
                color: '#6A7282',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: '20px',
              }}
            >
              Action
            </span>
          </div>
        </div>

        {/* Table Data Rows */}
        <div className="w-full flex flex-col divide-y divide-slate-100">
          {isLoading ? (
            <div className="w-full py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-6 h-6 rounded-full border-2 border-[#0E3F39] border-t-transparent animate-spin" />
              <span className="text-xs">Loading staff directory...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="w-full py-16 text-center text-slate-400 text-xs">
              No staff members found matching your search.
            </div>
          ) : (
            filteredStaff.map((member) => {
              const roleStyle = getRoleBadgeStyle(member.role_display || member.role);
              const initials = getInitials(member.name);
              const isMenuOpen = activeMenuId === member.id;

              return (
                <div
                  key={member.id}
                  className="w-full grid grid-cols-12 items-center hover:bg-slate-50/70 transition-colors relative"
                  style={{
                    height: 72,
                    borderBottom: '1px rgba(0, 0, 0, 0.05) solid',
                  }}
                >
                  {/* Col 1: User Avatar + Name/Email */}
                  <div className="col-span-4 px-6 flex items-center gap-3">
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        background: '#0F3E38',
                        borderRadius: '50%',
                      }}
                    >
                      <span
                        style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: '700',
                          lineHeight: '16px',
                        }}
                      >
                        {initials}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="truncate"
                        style={{
                          color: '#1E2939',
                          fontSize: 14,
                          fontWeight: '500',
                          lineHeight: '20px',
                        }}
                      >
                        {member.name}
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
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Role Badge */}
                  <div className="col-span-2 px-4 flex items-center justify-center">
                    <div
                      className="flex items-center justify-center px-2.5 py-0.5 rounded-full select-none"
                      style={{
                        background: roleStyle.bg,
                      }}
                    >
                      <span
                        style={{
                          color: roleStyle.color,
                          fontSize: 12,
                          fontWeight: '500',
                          lineHeight: '16px',
                        }}
                      >
                        {roleStyle.label}
                      </span>
                    </div>
                  </div>

                  {/* Col 3: Last Login */}
                  <div className="col-span-3 px-4 flex items-center justify-center">
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontWeight: '500',
                        lineHeight: '16px',
                      }}
                    >
                      {member.last_login || 'Jul 19, 2026 10:30 AM'}
                    </span>
                  </div>

                  {/* Col 4: Started */}
                  <div className="col-span-2 px-4 flex items-center justify-center">
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontWeight: '500',
                        lineHeight: '16px',
                      }}
                    >
                      {member.started || 'Jan 10, 2023'}
                    </span>
                  </div>

                  {/* Col 5: Action Button & Popup Menu */}
                  <div className="col-span-1 px-4 flex items-center justify-center relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                      className="w-[25px] h-[25px] flex items-center justify-center rounded-[10px] hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Manage user options"
                    >
                      <DotsThreeVertical size={16} weight="bold" />
                    </button>

                    {/* Dropdown Options */}
                    {isMenuOpen && (
                      <div className="absolute right-6 top-10 z-30 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            showToast(`Editing permissions for ${member.name}`, 'info');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <User size={14} />
                          <span>Permissions</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash size={14} />
                          <span>Remove Staff</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── ADD STAFF MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0E3F39] text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <UserPlus size={20} weight="bold" />
                <div>
                  <h3 className="font-bold text-base text-white">Add Clinic Staff User</h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Create new staff credentials and assign role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alex Morgan"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. morgan@pivodent.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'Dentist', bg: '#E1FFF9', color: '#10AA9D' },
                    { role: 'Dental Assistant', bg: '#F8FDE9', color: '#918658' },
                    { role: 'Admin', bg: '#E5C7FF', color: '#80388E' },
                    { role: 'Admin (restricted)', bg: '#FDE3E7', color: '#C01570' },
                  ].map((r) => {
                    const isSelected = newRole === r.role;
                    return (
                      <button
                        type="button"
                        key={r.role}
                        onClick={() => setNewRole(r.role)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0E3F39] bg-emerald-50/50 shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                        }`}
                      >
                        <span style={{ color: r.color }}>{r.role}</span>
                        {isSelected && <Check size={14} weight="bold" color="#0E3F39" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temporary Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Default Login Password
                </label>
                <div className="relative">
                  <LockKey size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Staff can change this password after their first login.
                </p>
              </div>

              {/* Action Buttons */}
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
                      <UserPlus size={16} weight="bold" />
                      <span>Create Staff User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
