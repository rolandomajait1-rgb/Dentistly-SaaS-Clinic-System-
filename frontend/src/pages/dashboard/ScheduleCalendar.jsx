import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAppointments, getServices, createAppointment, updateAppointmentStatus } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import {
  CaretLeft,
  CaretRight,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  PlayCircle,
  XCircle,
  Warning,
  X,
  User,
  Stethoscope,
  Phone,
  CalendarBlank,
  Clock,
  Tag,
  Check
} from '@phosphor-icons/react';

// Format Helpers
const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (timeString) => {
  if (!timeString) return '—';
  const parts = String(timeString).split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${m} ${ampm}`;
};

const TIME_SLOTS = [
  { label: '08:00 AM', value: '08:00:00' },
  { label: '09:00 AM', value: '09:00:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '01:00 PM', value: '13:00:00' },
  { label: '02:00 PM', value: '14:00:00' },
  { label: '03:00 PM', value: '15:00:00' },
  { label: '04:00 PM', value: '16:00:00' },
  { label: '05:00 PM', value: '17:00:00' },
];

export default function ScheduleCalendar({ user }) {
  const { showToast } = useNotifications();

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar View & Navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [patientTypeFilter, setPatientTypeFilter] = useState('all'); // 'all' | 'new' | 'returning'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Approved' | 'Pending' | 'Serving' | 'Completed' | 'Cancelled'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [daySummaryDate, setDaySummaryDate] = useState(null); // For "+ X more" modal

  // New Appointment Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPatientType, setNewPatientType] = useState('new'); // 'new' | 'returning'
  const [newServiceId, setNewServiceId] = useState('');
  const [newDate, setNewDate] = useState(formatDateString(new Date()));
  const [newTime, setNewTime] = useState('09:00:00');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Action Loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Appointments and Services
  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const data = await getServices();
      const sList = Array.isArray(data) ? data : [];
      setServices(sList);
      if (sList.length > 0 && !newServiceId) {
        setNewServiceId(sList[0].id);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [newServiceId]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchServices()]);
      if (isMounted) setLoading(false);
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchAppointments, fetchServices]);

  // Determine Returning Patient vs New Patient based on appointment history
  const patientAppointmentCounts = useMemo(() => {
    const counts = {};
    appointments.forEach((app) => {
      const key = app.patient_id || app.patient?.contact_number || app.patient?.full_name?.toLowerCase();
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [appointments]);

  const isReturningPatient = useCallback(
    (app) => {
      if (app.is_returning === true || app.patient_type === 'returning') return true;
      const key = app.patient_id || app.patient?.contact_number || app.patient?.full_name?.toLowerCase();
      return (patientAppointmentCounts[key] || 0) > 1;
    },
    [patientAppointmentCounts]
  );

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Week navigation
  const prevWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };
  const nextWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  // Day navigation
  const prevDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };
  const nextDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title Formatter
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Navigation button handler based on view
  const handlePrev = () => {
    if (viewMode === 'month') prevMonth();
    else if (viewMode === 'week') prevWeek();
    else prevDay();
  };

  const handleNext = () => {
    if (viewMode === 'month') nextMonth();
    else if (viewMode === 'week') nextWeek();
    else nextDay();
  };

  // Quick Open New Appointment for a specific date
  const openNewAppointmentForDate = (dateObj, defaultTime = '09:00:00') => {
    const formatted = formatDateString(dateObj);
    setNewDate(formatted);
    setNewTime(defaultTime);
    setShowAddModal(true);
  };

  // Handle New Appointment Submission
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      return showToast('Patient name and contact number are required.', 'warning');
    }
    if (!newServiceId) {
      return showToast('Please select a dental service.', 'warning');
    }

    setIsSubmitting(true);
    try {
      await createAppointment({
        patient_name: newName.trim(),
        phone: newPhone.trim(),
        service_id: newServiceId,
        date: newDate,
        time: newTime,
        medical_notes: newNotes.trim() || 'None',
      });

      showToast(`Appointment booked successfully for ${newName.trim()}!`, 'success');
      setNewName('');
      setNewPhone('');
      setNewNotes('');
      setShowAddModal(false);
      await fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to book appointment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (appointmentId, status) => {
    setActionLoadingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, status);
      showToast(`Appointment marked as ${status}.`, 'success');
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status } : null));
      }
      await fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const q = searchTerm.toLowerCase().trim();
      const patientName = app.patient?.full_name || '';
      const refNo = app.reference_number || '';
      const phone = app.patient?.contact_number || '';
      const matchesQuery = !q || patientName.toLowerCase().includes(q) || refNo.toLowerCase().includes(q) || phone.includes(q);

      const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();

      const isReturning = isReturningPatient(app);
      const matchesType =
        patientTypeFilter === 'all' ||
        (patientTypeFilter === 'returning' && isReturning) ||
        (patientTypeFilter === 'new' && !isReturning);

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [appointments, searchTerm, statusFilter, patientTypeFilter, isReturningPatient]);

  // Group appointments by date string YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((app) => {
      const dateKey = app.appointment_date ? String(app.appointment_date).split('T')[0] : '';
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(app);
      }
    });
    return map;
  }, [filteredAppointments]);

  // Compute Month Calendar Matrix
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dateObj = new Date(year, month - 1, d);
      cells.push({
        dayNumber: d,
        dateObj,
        dateString: formatDateString(dateObj),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      cells.push({
        dayNumber: d,
        dateObj,
        dateString: formatDateString(dateObj),
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month
    let nextMonthDay = 1;
    while (cells.length % 7 !== 0 || cells.length < 35) {
      const dateObj = new Date(year, month + 1, nextMonthDay);
      cells.push({
        dayNumber: nextMonthDay,
        dateObj,
        dateString: formatDateString(dateObj),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    // Split into weeks of 7
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  // Week View Days
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateObj: d,
        dateString: formatDateString(d),
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        dayNumber: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

  // Today indicator helper
  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div
      className="flex flex-col w-full min-h-full overflow-x-hidden"
      style={{
        fontFamily: "'Work Sans', sans-serif",
        background: '#F0F4F3',
      }}
    >
      {/* ── Sub-header Navigation & Controls Bar (Design Spec) ── */}
      <div
        className="w-full bg-white flex flex-col justify-start items-start gap-1 shrink-0 px-4 md:px-6 py-4 shadow-[0px_0px_4px_rgba(0,0,0,0.10)] border-b border-[#EBEBEB]"
      >
        <div className="w-full flex flex-wrap justify-between items-center gap-4">
          {/* Left: Date Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-[10px] hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              style={{
                outline: '1.33px #E5E7EB solid',
                outlineOffset: '-1.33px',
              }}
              title="Previous"
            >
              <CaretLeft size={16} weight="bold" color="#0A0A0A" />
            </button>

            <div className="min-w-[170px] text-center flex flex-col justify-center">
              <span
                style={{
                  color: '#0E3F39',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: '20px',
                }}
              >
                {getHeaderTitle()}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-[10px] hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              style={{
                outline: '1.33px #E5E7EB solid',
                outlineOffset: '-1.33px',
              }}
              title="Next"
            >
              <CaretRight size={16} weight="bold" color="#0A0A0A" />
            </button>

            <button
              onClick={jumpToToday}
              className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg text-[#0E3F39] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              Today
            </button>
          </div>

          {/* Center: View Switcher (Month, Week, Day) */}
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
            {['month', 'week', 'day'].map((mode) => {
              const isActive = viewMode === mode;
              const label = mode.charAt(0).toUpperCase() + mode.slice(1);
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
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
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: + New Appointment Button & Quick Search */}
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative hidden xl:block">
              <MagnifyingGlass size={14} weight="bold" className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient / ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-48 pl-8 pr-3 text-xs bg-[#F8FAFA] border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0E3F39]"
              />
            </div>

            {/* New Appointment button */}
            <button
              onClick={() => {
                setNewDate(formatDateString(currentDate));
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2.5 transition-all shadow-sm hover:opacity-95 active:scale-98 cursor-pointer"
              style={{
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 10,
                paddingBottom: 10,
                background: '#0F3E38',
                borderRadius: 10,
                color: 'white',
                fontSize: 14,
                fontWeight: '700',
                lineHeight: '20px',
              }}
            >
              <Plus size={16} weight="bold" color="white" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Canvas ── */}
      <div
        className="w-full flex-1 flex flex-col justify-start items-start gap-4 p-4 md:p-6 overflow-x-auto bg-[#F0F4F3]"
      >
        {/* ── Legend & Interactive Filter Bar (Design Spec) ── */}
        <div className="w-full flex flex-wrap justify-between items-center gap-3">
          {/* Patient Type Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <span
              style={{
                color: '#99A1AF',
                fontSize: 12,
                fontWeight: '500',
                lineHeight: '16px',
              }}
            >
              Patient Type
            </span>

            {/* Filter: All */}
            <button
              onClick={() => setPatientTypeFilter('all')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                patientTypeFilter === 'all' ? 'font-bold text-[#0E3F39] bg-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Types
            </button>

            {/* Filter: New Patient */}
            <button
              onClick={() => setPatientTypeFilter(patientTypeFilter === 'new' ? 'all' : 'new')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${
                patientTypeFilter === 'new' ? 'bg-blue-100/70 font-semibold ring-1 ring-blue-400' : 'hover:bg-slate-200/50'
              }`}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: '#1D4ED8',
                  borderRadius: 6,
                }}
              />
              <span
                style={{
                  color: patientTypeFilter === 'new' ? '#1D4ED8' : '#6A7282',
                  fontSize: 12,
                  fontWeight: patientTypeFilter === 'new' ? '600' : '400',
                  lineHeight: '16px',
                }}
              >
                New Patient
              </span>
            </button>

            {/* Filter: Returning Patient */}
            <button
              onClick={() => setPatientTypeFilter(patientTypeFilter === 'returning' ? 'all' : 'returning')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${
                patientTypeFilter === 'returning' ? 'bg-emerald-100/70 font-semibold ring-1 ring-emerald-400' : 'hover:bg-slate-200/50'
              }`}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: '#047857',
                  borderRadius: 6,
                }}
              />
              <span
                style={{
                  color: patientTypeFilter === 'returning' ? '#047857' : '#6A7282',
                  fontSize: 12,
                  fontWeight: patientTypeFilter === 'returning' ? '600' : '400',
                  lineHeight: '16px',
                }}
              >
                Returning Patient
              </span>
            </button>
          </div>

          {/* Status Filter Dropdown or Quick Chips */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0E3F39] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Serving">Serving</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ── MONTH VIEW CALENDAR (Design Spec) ── */}
        {viewMode === 'month' && (
          <div
            className="w-full flex flex-col justify-start items-start shrink-0"
            style={{
              minWidth: 720,
              background: 'white',
              borderRadius: 10,
              outline: '1.33px rgba(14, 63, 57, 0.10) solid',
              outlineOffset: '-1.33px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header Row: Sun, Mon, Tue, Wed, Thu, Fri, Sat */}
            <div
              className="w-full grid grid-cols-7"
              style={{
                borderBottom: '1.33px rgba(14, 63, 57, 0.08) solid',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className="flex flex-col justify-center items-center"
                  style={{
                    paddingTop: 9.38,
                    paddingBottom: 9.38,
                    background: '#F8FAFA',
                    borderRight: idx < 6 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                  }}
                >
                  <span
                    style={{
                      color: '#5A7A76',
                      fontSize: 11,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      lineHeight: '16.5px',
                      letterSpacing: '0.55px',
                    }}
                  >
                    {dayName}
                  </span>
                </div>
              ))}
            </div>

            {/* Weeks Matrix */}
            <div className="w-full flex flex-col">
              {monthMatrix.map((week, wIdx) => (
                <div key={wIdx} className="w-full grid grid-cols-7">
                  {week.map((cell, cIdx) => {
                    const cellApps = appointmentsByDate[cell.dateString] || [];
                    const maxVisible = 3;
                    const visibleApps = cellApps.slice(0, maxVisible);
                    const remainingCount = cellApps.length - maxVisible;
                    const cellIsToday = isToday(cell.dateObj);

                    return (
                      <div
                        key={cell.dateString}
                        className="flex flex-col justify-start items-start group transition-colors duration-100"
                        style={{
                          minHeight: 106,
                          padding: 5.63,
                          background: !cell.isCurrentMonth
                            ? 'rgba(255, 255, 255, 0.50)'
                            : cellIsToday
                            ? '#FAFDFD'
                            : 'white',
                          borderRight: cIdx < 6 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                          borderBottom:
                            wIdx < monthMatrix.length - 1 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                        }}
                      >
                        {/* Day Number Header */}
                        <div className="w-full flex justify-between items-center pb-1">
                          {cellIsToday ? (
                            <div
                              style={{
                                width: 18.75,
                                height: 18.75,
                                background: '#0E3F39',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  color: 'white',
                                  fontSize: 11.25,
                                  fontWeight: '600',
                                  lineHeight: '15px',
                                }}
                              >
                                {cell.dayNumber}
                              </span>
                            </div>
                          ) : (
                            <span
                              style={{
                                color: cell.isCurrentMonth ? '#6A7282' : '#D1D5DC',
                                fontSize: 11.25,
                                fontWeight: '600',
                                lineHeight: '15px',
                                paddingLeft: 2,
                              }}
                            >
                              {cell.dayNumber}
                            </span>
                          )}

                          {/* Quick Add icon on cell hover */}
                          <button
                            onClick={() => openNewAppointmentForDate(cell.dateObj)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 text-slate-400 hover:text-[#0E3F39] rounded transition-opacity cursor-pointer"
                            title={`Book appointment on ${cell.dateString}`}
                          >
                            <Plus size={12} weight="bold" />
                          </button>
                        </div>

                        {/* Appointments list in cell */}
                        <div className="w-full flex flex-col gap-1 pt-0.5">
                          {visibleApps.map((app) => {
                            const returning = isReturningPatient(app);
                            const patientName = app.patient?.full_name || 'Walk-in Patient';

                            return (
                              <button
                                key={app.id}
                                onClick={() => setSelectedAppointment(app)}
                                className="w-full flex items-center gap-1 px-1 rounded transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left overflow-hidden select-none"
                                title={`${patientName} (${formatTime(app.appointment_time)}) - ${app.service?.service_name || 'Appointment'} [${app.status}]`}
                                style={
                                  returning
                                    ? {
                                        height: 18,
                                        background: 'linear-gradient(90deg, #C7FFE2 0%, #80E5B1 100%)',
                                        borderRadius: 4,
                                      }
                                    : {
                                        height: 18,
                                        background: 'linear-gradient(90deg, white 0%, #DBEAFE 100%)',
                                        borderRadius: 4,
                                        border: '0.5px solid #BFDBFE',
                                      }
                                }
                              >
                                <div
                                  className="shrink-0"
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: returning ? '#047857' : '#1D4ED8',
                                  }}
                                />
                                <span
                                  className="truncate font-medium leading-none"
                                  style={{
                                    color: returning ? '#047857' : '#1D4ED8',
                                    fontSize: 10,
                                    lineHeight: '16px',
                                  }}
                                >
                                  {patientName}
                                </span>
                              </button>
                            );
                          })}

                          {/* "+ X more" pill if overflowing */}
                          {remainingCount > 0 && (
                            <button
                              onClick={() => setDaySummaryDate(cell.dateObj)}
                              className="flex items-center gap-1 px-1 py-0.5 rounded text-left hover:bg-slate-100 transition-colors cursor-pointer"
                              style={{
                                height: 18,
                                borderRadius: 4,
                              }}
                            >
                              <CaretRight size={10} color="#99A1AF" weight="bold" />
                              <span
                                style={{
                                  color: '#99A1AF',
                                  fontSize: 10,
                                  fontWeight: '500',
                                  lineHeight: '16px',
                                }}
                              >
                                {remainingCount} more
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WEEK VIEW ── */}
        {viewMode === 'week' && (
          <div
            className="w-full flex flex-col bg-white rounded-[10px] overflow-hidden"
            style={{
              outline: '1.33px rgba(14, 63, 57, 0.10) solid',
              outlineOffset: '-1.33px',
              minWidth: 720,
            }}
          >
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200/80 bg-[#F8FAFA]">
              {weekDays.map((wd, idx) => {
                const dayIsToday = isToday(wd.dateObj);
                const dayApps = appointmentsByDate[wd.dateString] || [];
                return (
                  <div
                    key={wd.dateString}
                    className="p-3 text-center flex flex-col items-center gap-1"
                    style={{
                      borderRight: idx < 6 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                    }}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5A7A76]">
                      {wd.dayName}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        dayIsToday ? 'bg-[#0E3F39] text-white' : 'text-slate-700'
                      }`}
                    >
                      {wd.dayNumber}
                    </div>
                    {dayApps.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayApps.length} appt{dayApps.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Week Columns */}
            <div className="grid grid-cols-7 min-h-[460px] divide-x divide-slate-100">
              {weekDays.map((wd) => {
                const dayApps = appointmentsByDate[wd.dateString] || [];
                return (
                  <div key={wd.dateString} className="p-2.5 flex flex-col gap-2 bg-white">
                    {dayApps.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border border-dashed border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-[11px] text-slate-400">No appointments</span>
                        <button
                          onClick={() => openNewAppointmentForDate(wd.dateObj)}
                          className="mt-2 text-[11px] font-bold text-[#0E3F39] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} weight="bold" /> Book
                        </button>
                      </div>
                    ) : (
                      dayApps.map((app) => {
                        const returning = isReturningPatient(app);
                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedAppointment(app)}
                            className="p-2.5 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col gap-1.5"
                            style={{
                              background: returning ? '#F0FDF8' : '#F8FAFF',
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-800">
                                {formatTime(app.appointment_time)}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                  returning
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {returning ? 'Returning' : 'New'}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-900 truncate">
                              {app.patient?.full_name || 'Walk-in'}
                            </p>

                            <p className="text-[11px] text-slate-500 truncate">
                              {app.service?.service_name || 'General Check-up'}
                            </p>

                            <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                              <span className="text-[10px] font-bold text-[#0E3F39]">
                                ₱{(app.service?.price || 0).toLocaleString()}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  app.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : app.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-700'
                                    : app.status === 'Serving'
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {viewMode === 'day' && (
          <div
            className="w-full flex flex-col bg-white rounded-[10px] overflow-hidden"
            style={{
              outline: '1.33px rgba(14, 63, 57, 0.10) solid',
              outlineOffset: '-1.33px',
              minWidth: 640,
            }}
          >
            {/* Day Header */}
            <div className="p-4 border-b border-slate-200 bg-[#F8FAFA] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0E3F39]">
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-slate-500">
                  {(appointmentsByDate[formatDateString(currentDate)] || []).length} scheduled appointments
                </p>
              </div>
              <button
                onClick={() => openNewAppointmentForDate(currentDate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E3F39] text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus size={14} weight="bold" /> Add for Today
              </button>
            </div>

            {/* Hourly Schedule */}
            <div className="divide-y divide-slate-100">
              {TIME_SLOTS.map((slot) => {
                const dayStr = formatDateString(currentDate);
                const dayApps = appointmentsByDate[dayStr] || [];
                const slotApps = dayApps.filter((a) => {
                  if (!a.appointment_time) return false;
                  return a.appointment_time.startsWith(slot.value.slice(0, 2));
                });

                return (
                  <div key={slot.value} className="flex min-h-[72px] hover:bg-slate-50/50 transition-colors">
                    {/* Time Column */}
                    <div className="w-28 p-3 border-r border-slate-100 text-xs font-bold text-slate-500 shrink-0 flex items-start justify-end pr-4">
                      {slot.label}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-2.5 flex flex-wrap gap-3 items-center">
                      {slotApps.length === 0 ? (
                        <button
                          onClick={() => openNewAppointmentForDate(currentDate, slot.value)}
                          className="text-xs text-slate-400 hover:text-[#0E3F39] font-medium flex items-center gap-1.5 py-1 px-3 rounded border border-dashed border-slate-200 hover:border-[#0E3F39] transition-colors cursor-pointer"
                        >
                          <Plus size={12} weight="bold" /> Book Slot at {slot.label}
                        </button>
                      ) : (
                        slotApps.map((app) => {
                          const returning = isReturningPatient(app);
                          return (
                            <div
                              key={app.id}
                              onClick={() => setSelectedAppointment(app)}
                              className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer flex-1 min-w-[280px]"
                              style={{
                                background: returning ? '#F0FDF8' : '#F8FAFF',
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                                  style={{
                                    background: returning ? '#047857' : '#1D4ED8',
                                    color: 'white',
                                  }}
                                >
                                  {(app.patient?.full_name || 'W')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">
                                      {app.patient?.full_name || 'Walk-in'}
                                    </h4>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        returning
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {returning ? 'Returning' : 'New Patient'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {app.service?.service_name || 'General check-up'} · ₱
                                    {(app.service?.price || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                                    app.status === 'Approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : app.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : app.status === 'Serving'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── APPOINTMENT DETAILS MODAL ── */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-[#0E3F39] text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-200">
                  Appointment Details
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedAppointment.patient?.full_name || 'Walk-in Patient'}
                </h3>
                <p className="text-xs text-emerald-100/80">
                  Ref: {selectedAppointment.reference_number || 'APT-STANDARD'}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status and Patient Type tags */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Patient Type:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isReturningPatient(selectedAppointment)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isReturningPatient(selectedAppointment) ? 'Returning Patient' : 'New Patient'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedAppointment.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedAppointment.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedAppointment.status === 'Serving'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              {/* Schedule Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2.5">
                  <CalendarBlank size={18} className="text-[#0E3F39]" weight="duotone" />
                  <div>
                    <span className="text-slate-400 block font-medium">Date</span>
                    <span className="font-bold text-slate-800">
                      {selectedAppointment.appointment_date
                        ? new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2.5">
                  <Clock size={18} className="text-[#0E3F39]" weight="duotone" />
                  <div>
                    <span className="text-slate-400 block font-medium">Time</span>
                    <span className="font-bold text-slate-800">
                      {formatTime(selectedAppointment.appointment_time)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2.5">
                  <Stethoscope size={18} className="text-[#0E3F39]" weight="duotone" />
                  <div>
                    <span className="text-slate-400 block font-medium">Dental Service</span>
                    <span className="font-bold text-slate-800">
                      {selectedAppointment.service?.service_name || 'General check-up'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2.5">
                  <Tag size={18} className="text-[#0E3F39]" weight="duotone" />
                  <div>
                    <span className="text-slate-400 block font-medium">Treatment Fee</span>
                    <span className="font-bold text-[#0E3F39]">
                      ₱{(selectedAppointment.service?.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-500" />
                  <span className="font-semibold text-slate-700">
                    {selectedAppointment.patient?.contact_number || 'No phone recorded'}
                  </span>
                </div>
                {selectedAppointment.patient?.contact_number && (
                  <a
                    href={`tel:${selectedAppointment.patient.contact_number}`}
                    className="text-[#0E3F39] font-bold hover:underline"
                  >
                    Call Patient
                  </a>
                )}
              </div>

              {/* Medical History / Notes */}
              {selectedAppointment.patient?.medical_history &&
                selectedAppointment.patient?.medical_history !== 'None' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                      <Warning size={14} weight="bold" /> Medical Alerts / Notes
                    </div>
                    <p className="text-rose-900">{selectedAppointment.patient.medical_history}</p>
                  </div>
                )}

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {selectedAppointment.status === 'Pending' && (
                  <>
                    <button
                      disabled={actionLoadingId === selectedAppointment.id}
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Approved')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={15} weight="bold" /> Approve Appointment
                    </button>
                    <button
                      disabled={actionLoadingId === selectedAppointment.id}
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Cancelled')}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle size={15} weight="bold" /> Decline
                    </button>
                  </>
                )}

                {selectedAppointment.status === 'Approved' && (
                  <>
                    <button
                      disabled={actionLoadingId === selectedAppointment.id}
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Serving')}
                      className="flex-1 py-2 px-3 bg-[#0E3F39] hover:bg-[#14534B] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PlayCircle size={15} weight="bold" /> Start Serving (Call In)
                    </button>
                    <button
                      disabled={actionLoadingId === selectedAppointment.id}
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Cancelled')}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle size={15} weight="bold" /> Cancel
                    </button>
                  </>
                )}

                {selectedAppointment.status === 'Serving' && (
                  <button
                    disabled={actionLoadingId === selectedAppointment.id}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'Completed')}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle size={15} weight="bold" /> Mark as Completed
                  </button>
                )}

                {['Completed', 'Cancelled'].includes(selectedAppointment.status) && (
                  <div className="w-full text-center py-1 text-xs text-slate-400 italic">
                    This appointment has been {selectedAppointment.status.toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DAY APPOINTMENTS SUMMARY MODAL (Triggered via "+ X more") ── */}
      {daySummaryDate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#0E3F39] text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">
                  {daySummaryDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-emerald-200">
                  {(appointmentsByDate[formatDateString(daySummaryDate)] || []).length} scheduled appointments
                </p>
              </div>
              <button
                onClick={() => setDaySummaryDate(null)}
                className="p-1 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
              {(appointmentsByDate[formatDateString(daySummaryDate)] || []).map((app) => {
                const returning = isReturningPatient(app);
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setDaySummaryDate(null);
                      setSelectedAppointment(app);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#0E3F39] hover:shadow-sm transition-all cursor-pointer flex justify-between items-center"
                    style={{
                      background: returning ? '#F0FDF8' : '#F8FAFF',
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{app.patient?.full_name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            returning ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {returning ? 'Returning' : 'New'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {app.service?.service_name} · {formatTime(app.appointment_time)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => {
                  setCurrentDate(daySummaryDate);
                  setViewMode('day');
                  setDaySummaryDate(null);
                }}
                className="text-xs font-bold text-[#0E3F39] hover:underline cursor-pointer"
              >
                Open in Day View
              </button>
              <button
                onClick={() => {
                  const target = daySummaryDate;
                  setDaySummaryDate(null);
                  openNewAppointmentForDate(target);
                }}
                className="px-3 py-1.5 bg-[#0E3F39] text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                + New Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW APPOINTMENT MODAL (Design System & Interactive Form) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0E3F39] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Book New Appointment</h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Schedule a dental clinic appointment or register walk-in
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              {/* Patient Type Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Patient Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPatientType('new')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      newPatientType === 'new'
                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                    New Patient
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPatientType('returning')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      newPatientType === 'returning'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
                    Returning Patient
                  </button>
                </div>
              </div>

              {/* Patient Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <User size={16} weight="duotone" className="absolute left-3 top-3 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Contact Phone Number */}
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
                    placeholder="09XXXXXXXXX"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Appointment Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all cursor-pointer"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Preferred Time *
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dental Service */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Dental Service / Treatment *
                </label>
                <div className="relative">
                  <Stethoscope size={16} weight="duotone" className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0E3F39] focus:bg-white transition-all cursor-pointer"
                  >
                    {services.length === 0 ? (
                      <option value="">Loading services...</option>
                    ) : (
                      services.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.service_name} — ₱{(svc.price || 0).toLocaleString()}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Medical Notes / Allergy Alerts */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Medical Notes / Health Alerts (Optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Allergies (Penicillin, Latex), hypertension, bleeding history..."
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
                    <span>Booking...</span>
                  ) : (
                    <>
                      <Check size={16} weight="bold" />
                      <span>Confirm Appointment</span>
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

