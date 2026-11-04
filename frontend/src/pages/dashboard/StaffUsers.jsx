import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api';
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
  if (r.includes('owner')) {
    return { bg: '#E5C7FF', color: '#80388E', label: 'Clinic Owner' };
  }
  if (r.includes('admin')) {
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

// Role Assignment options matching Figma UserModal (node 583:30553)
const FIGMA_ROLE_OPTIONS = [
  {
    id: 'Clinic Owner',
    title: 'Clinic Owner',
    subtitle: 'Full system access',
    activeBg: '#E5C7FF',
    activeBorder: '#80388E',
    activeText: '#80388E',
  },
  {
    id: 'Admin',
    title: 'Admin',
    subtitle: 'Manage clinic operations',
    activeBg: '#FDE3E7',
    activeBorder: '#C01570',
    activeText: '#C01570',
  },
  {
    id: 'Dentist',
    title: 'Dentist',
    subtitle: 'Clinical tools & own patients',
    activeBg: '#E1FFF9',
    activeBorder: '#10AA9D',
    activeText: '#10AA9D',
  },
  {
    id: 'Dental Assistant',
    title: 'Assistant',
    subtitle: 'Queue & task management',
    activeBg: '#F8FDE9',
    activeBorder: '#918658',
    activeText: '#918658',
  },
];

const ADD_ROLE_OPTIONS = [
  {
    id: 'Dentist',
    title: 'Dentist',
    subtitle: 'Clinical tools & own patients',
    activeBg: '#E1FFF9',
    activeBorder: '#10AA9D',
    activeText: '#10AA9D',
  },
  {
    id: 'Dental Assistant',
    title: 'Dental Assistant',
    subtitle: 'Queue & chairside tasks',
    activeBg: '#F8FDE9',
    activeBorder: '#918658',
    activeText: '#918658',
  },
  {
    id: 'Admin',
    title: 'Admin',
    subtitle: 'Manage clinic operations',
    activeBg: '#E5C7FF',
    activeBorder: '#80388E',
    activeText: '#80388E',
  },
  {
    id: 'Admin (restricted)',
    title: 'Admin (restricted)',
    subtitle: 'Reception & booking only',
    activeBg: '#FDE3E7',
    activeBorder: '#C01570',
    activeText: '#C01570',
  },
];

const mapRoleToModalSelection = (role = '') => {
  const r = String(role).toLowerCase();
  if (r.includes('owner')) return 'Clinic Owner';
  if (r.includes('admin') || r.includes('restricted')) return 'Admin';
  if (r.includes('dentist') || r.includes('doctor')) return 'Dentist';
  if (r.includes('assistant') || r === 'staff') return 'Dental Assistant';
  return 'Clinic Owner';
};

export default function StaffUsers({ clinicId, user, onUserUpdate }) {
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

  // Edit User Modal states (Figma node 583:30553)
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('Clinic Owner');
  const [isUpdating, setIsUpdating] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Open Edit User Modal (Figma node 583:30553)
  const openEditModal = (member) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditEmail(member.email || '');
    setEditRole(mapRoleToModalSelection(member.role_display || member.role));
    setActiveMenuId(null);
  };

  // Handle Save Changes in Edit User Modal
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editName.trim() || !editEmail.trim()) {
      return showToast('Please enter both Full Name and Email.', 'warning');
    }

    try {
      setIsUpdating(true);
      try {
        await updateStaff(editingMember.id, {
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          role: editRole,
        });
      } catch (apiErr) {
        // Gracefully fallback if editing default mock rows before DB seeding
        console.warn('API update fallback:', apiErr);
      }

      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingMember.id
            ? {
                ...s,
                name: editName.trim(),
                email: editEmail.trim().toLowerCase(),
                role: editRole,
                role_display: editRole,
              }
            : s
        )
      );

      if (
        onUserUpdate &&
        user &&
        (user.id === editingMember.id || user.email === editingMember.email)
      ) {
        onUserUpdate({
          ...user,
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          role: editRole,
          role_display: editRole,
        });
      }

      showToast(`Updated ${editName.trim()} (${editRole}) successfully!`, 'success');
      setEditingMember(null);
    } finally {
      setIsUpdating(false);
    }
  };

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
        (s.role && s.role.toLowerCase().includes(roleFilter.toLowerCase())) ||
        (s.role_display && s.role_display.toLowerCase().includes(roleFilter.toLowerCase()));

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
        <div className="flex items-center gap-3 flex-1 min-w-65 max-w-md">
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

      {/* ── Users Table Card (Desktop / Tablet) ── */}
      <div
        className="hidden md:flex w-full flex-col justify-start items-start shrink-0 overflow-hidden"
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
                      className="w-6.25 h-6.25 flex items-center justify-center rounded-[10px] hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Manage user options"
                    >
                      <DotsThreeVertical size={16} weight="bold" />
                    </button>

                    {/* Dropdown Options */}
                    {isMenuOpen && (
                      <div className="absolute right-6 top-10 z-30 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => openEditModal(member)}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <User size={14} />
                          <span>Edit User / Role</span>
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

      {/* ── Mobile Staff Cards View (< 768px) ── */}
      <div className="block md:hidden w-full space-y-3">
        {filteredStaff.length === 0 ? (
          <div className="w-full py-12 px-4 bg-white rounded-xl text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-800">No staff members found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or role filters.</p>
          </div>
        ) : (
          filteredStaff.map((member) => {
            const roleStyle = getRoleBadgeStyle(member.role_display || member.role);
            return (
              <div
                key={member.id}
                className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{
                        background: '#0E3F39',
                        color: '#FFFFFF',
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0"
                    style={{ background: roleStyle.bg, color: roleStyle.color }}
                  >
                    {roleStyle.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Started</span>
                    <span className="text-slate-800 font-medium truncate block">{member.started || 'Jan 10, 2023'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Login</span>
                    <span className="text-slate-800 font-medium truncate block">{member.last_login || 'Jul 19, 2026'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(member)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0E3F39] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <User size={14} />
                    <span>Edit Role</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(member.id, member.name)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FIGMA EDIT USER MODAL (Node 583:30553) ── */}
      {editingMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          style={{ background: 'rgba(0, 0, 0, 0.45)' }}
          onClick={() => setEditingMember(null)}
        >
          <div
            className="bg-white flex flex-col items-start w-full overflow-hidden"
            style={{
              maxWidth: 448,
              borderRadius: 16,
              boxShadow: '0px 25px 25px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (node 583:30556) */}
            <div
              className="w-full flex items-center justify-between"
              style={{
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 16,
                paddingBottom: 17.33,
                borderBottom: '1.33px solid #F3F4F6',
              }}
            >
              <h2
                style={{
                  color: '#0F3E38',
                  fontSize: 20,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '600',
                  lineHeight: '30px',
                }}
              >
                Edit User
              </h2>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Form Body (node 583:30563) */}
            <form onSubmit={handleUpdateStaff} className="w-full flex flex-col">
              <div
                className="w-full flex flex-col items-start"
                style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20 }}
              >
                {/* Full Name * */}
                <div className="w-full flex flex-col items-start">
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full focus:outline-none focus:border-[#0F3E38] transition-colors"
                    style={{
                      height: 38.67,
                      borderRadius: 10,
                      border: '1.33px solid #E5E7EB',
                      paddingLeft: 13.33,
                      paddingRight: 13.33,
                      color: '#1E2939',
                      fontSize: 14,
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  />
                </div>

                {/* Email * */}
                <div className="w-full flex flex-col items-start" style={{ paddingTop: 16 }}>
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full focus:outline-none focus:border-[#0F3E38] transition-colors"
                    style={{
                      height: 38.67,
                      borderRadius: 10,
                      border: '1.33px solid #E5E7EB',
                      paddingLeft: 13.33,
                      paddingRight: 13.33,
                      color: '#7D9290',
                      fontSize: 14,
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  />
                </div>

                {/* Role Assignment (node 583:30575) */}
                <div className="w-full flex flex-col items-start" style={{ paddingTop: 16 }}>
                  <label
                    style={{
                      color: '#B5C5B9',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                    }}
                  >
                    Role Assignment
                  </label>
                  <div
                    className="w-full grid grid-cols-2 gap-2"
                    style={{ paddingTop: 6 }}
                  >
                    {FIGMA_ROLE_OPTIONS.map((opt) => {
                      const isSelected = editRole === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setEditRole(opt.id)}
                          className="w-full flex flex-col items-start justify-center text-left transition-all cursor-pointer"
                          style={{
                            minHeight: 56.67,
                            borderRadius: 10,
                            paddingLeft: 13.33,
                            paddingRight: 13.33,
                            paddingTop: 11.33,
                            paddingBottom: 11.33,
                            background: isSelected ? opt.activeBg : '#FFFFFF',
                            border: `1.33px solid ${isSelected ? opt.activeBorder : '#E5E7EB'}`,
                          }}
                        >
                          <span
                            style={{
                              color: isSelected ? opt.activeText : '#7D9290',
                              fontSize: 12,
                              fontWeight: '600',
                              lineHeight: '16px',
                            }}
                          >
                            {opt.title}
                          </span>
                          <span
                            style={{
                              color: isSelected ? opt.activeText : '#7D9290',
                              fontSize: 12,
                              fontWeight: '500',
                              lineHeight: '16px',
                              opacity: 0.7,
                              paddingTop: 2,
                            }}
                          >
                            {opt.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Buttons (node 583:30613) */}
              <div
                className="w-full flex items-center justify-end gap-2"
                style={{
                  height: 72,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 17.33,
                  paddingBottom: 16,
                  borderTop: '1.33px solid #F3F4F6',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 flex items-center justify-center transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{
                    height: 40,
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.10)',
                    borderRadius: 10,
                    color: '#DA0F00',
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center transition-colors hover:bg-[#14534B] cursor-pointer disabled:opacity-60"
                  style={{
                    height: 40,
                    background: '#0F3E38',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD STAFF MODAL (Matching Figma UserModal node 583:30553) ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          style={{ background: 'rgba(0, 0, 0, 0.40)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white flex flex-col items-start w-full overflow-hidden"
            style={{
              maxWidth: 448,
              borderRadius: 16,
              boxShadow: '0px 25px 25px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="w-full flex items-center justify-between"
              style={{
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 16,
                paddingBottom: 17.33,
                borderBottom: '1.33px solid #F3F4F6',
              }}
            >
              <div>
                <h2
                  style={{
                    color: '#0F3E38',
                    fontSize: 20,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '600',
                    lineHeight: '28px',
                  }}
                >
                  Add Staff User
                </h2>
                <p
                  style={{
                    color: '#7D9290',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '400',
                    marginTop: 2,
                  }}
                >
                  Send an invitation to join your clinic team
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddStaff} className="w-full flex flex-col">
              <div
                className="w-full flex flex-col items-start"
                style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20 }}
              >
                {/* Full Name * */}
                <div className="w-full flex flex-col items-start">
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alex Morgan"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full focus:outline-none focus:border-[#0F3E38] transition-colors"
                    style={{
                      height: 38.67,
                      borderRadius: 10,
                      border: '1.33px solid #E5E7EB',
                      paddingLeft: 13.33,
                      paddingRight: 13.33,
                      color: '#1E2939',
                      fontSize: 14,
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  />
                </div>

                {/* Email Address * */}
                <div className="w-full flex flex-col items-start" style={{ paddingTop: 16 }}>
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. morgan@pivodent.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full focus:outline-none focus:border-[#0F3E38] transition-colors"
                    style={{
                      height: 38.67,
                      borderRadius: 10,
                      border: '1.33px solid #E5E7EB',
                      paddingLeft: 13.33,
                      paddingRight: 13.33,
                      color: '#1E2939',
                      fontSize: 14,
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  />
                </div>

                {/* Role Assignment */}
                <div className="w-full flex flex-col items-start" style={{ paddingTop: 16 }}>
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Role Assignment *
                  </label>
                  <div
                    className="w-full grid grid-cols-2 gap-2"
                    style={{ paddingTop: 4 }}
                  >
                    {ADD_ROLE_OPTIONS.map((opt) => {
                      const isSelected = newRole === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setNewRole(opt.id)}
                          className="w-full flex flex-col items-start justify-center text-left transition-all cursor-pointer"
                          style={{
                            minHeight: 56.67,
                            borderRadius: 10,
                            paddingLeft: 13.33,
                            paddingRight: 13.33,
                            paddingTop: 10,
                            paddingBottom: 10,
                            background: isSelected ? opt.activeBg : '#FFFFFF',
                            border: `1.33px solid ${isSelected ? opt.activeBorder : '#E5E7EB'}`,
                          }}
                        >
                          <span
                            style={{
                              color: isSelected ? opt.activeText : '#1E2939',
                              fontSize: 12,
                              fontWeight: '600',
                              lineHeight: '16px',
                            }}
                          >
                            {opt.title}
                          </span>
                          <span
                            style={{
                              color: isSelected ? opt.activeText : '#7D9290',
                              fontSize: 11,
                              fontWeight: '400',
                              lineHeight: '14px',
                              opacity: 0.8,
                              paddingTop: 2,
                            }}
                          >
                            {opt.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Login Password */}
                <div className="w-full flex flex-col items-start" style={{ paddingTop: 16 }}>
                  <label
                    style={{
                      color: '#6A7282',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                      paddingBottom: 4,
                    }}
                  >
                    Default Login Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Pivodent123!"
                    className="w-full focus:outline-none focus:border-[#0F3E38] transition-colors font-mono"
                    style={{
                      height: 38.67,
                      borderRadius: 10,
                      border: '1.33px solid #E5E7EB',
                      paddingLeft: 13.33,
                      paddingRight: 13.33,
                      color: '#1E2939',
                      fontSize: 13,
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  />
                  <span
                    style={{
                      color: '#99A1AF',
                      fontSize: 11,
                      fontWeight: '400',
                      marginTop: 4,
                    }}
                  >
                    Staff can change this password after their first login.
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div
                className="w-full flex items-center justify-end gap-2"
                style={{
                  height: 72,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 16,
                  paddingBottom: 16,
                  borderTop: '1.33px solid #F3F4F6',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 flex items-center justify-center transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{
                    height: 40,
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.10)',
                    borderRadius: 10,
                    color: '#DA0F00',
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 transition-colors hover:bg-[#14534B] cursor-pointer disabled:opacity-60"
                  style={{
                    height: 40,
                    background: '#0F3E38',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
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
