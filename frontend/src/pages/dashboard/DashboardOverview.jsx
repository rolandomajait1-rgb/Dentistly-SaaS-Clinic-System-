import { useMemo, useCallback, useState, useEffect } from 'react';
import { getOverview, updateAppointmentStatus } from '../../api';
import assets from '../../assets';
import { getRoleConfig } from '../../utils/permissions';
import PatientModal from '../../components/patients/PatientModal';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import CancelAppointmentModal from '../../components/appointments/CancelAppointmentModal';
import LateArrivalModal, { isAppointmentLate } from '../../components/appointments/LateArrivalModal';

const DEFAULT_SERVICE_MIX = [
  { name: 'Preventive',  color: '#047857', count: 9, keywords: ['clean', 'prophylaxis', 'checkup', 'fluoride', 'sealant', 'preventive', 'consult'] },
  { name: 'Restorative', color: '#7C3AED', count: 4, keywords: ['filling', 'pasta', 'crown', 'bridge', 'veneer', 'restor', 'inlay', 'composite'] },
  { name: 'Emergency',   color: '#DC2626', count: 2, keywords: ['emergency', 'pain', 'acute', 'trauma', 'urgent'] },
  { name: 'Endodontic',  color: '#B45309', count: 2, keywords: ['root canal', 'endo', 'pulp'] },
  { name: 'Diagnostic',  color: '#1D4ED8', count: 2, keywords: ['x-ray', 'xray', 'exam', 'diagnos', 'panoramic', 'periapical'] },
  { name: 'Surgical',    color: '#B91C1C', count: 1, keywords: ['extract', 'bunot', 'wisdom', 'surg', 'implant', 'odontectomy'] },
];

export default function DashboardOverview({ setActiveTab, clinic, user, onUserUpdate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [lateArrivalAppointment, setLateArrivalAppointment] = useState(null);
  const [isHandlingLate, setIsHandlingLate] = useState(false);
  const [overviewData, setOverviewData] = useState({
    stats: {
      totalPatients: 0,
      pendingAppointments: 0,
      activeQueue: 0,
      completedToday: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      revenueGrowth: 0,
      newPatientsThisMonth: 0,
      newPatientsLastMonth: 0,
      newPatientsGrowth: 0,
      cancellationRateThisMonth: 0,
      cancelledThisMonth: 0,
      totalAppointmentsThisMonth: 0,
      noShowsToday: 0,
      noShowsRateToday: 0,
      totalAppointmentsToday: 0,
      remainingToday: 0,
    },
    clinic: null,
    alerts: [],
    todayAppointments: [],
  });

  const roleConfig = getRoleConfig(user);
  const isDentist = roleConfig.roleKey === 'dentist';

  const fetchOverview = useCallback(async () => {
    try {
      const data = await getOverview();
      if (data) {
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await fetchOverview();
    })();
    return () => {
      active = false;
    };
  }, [fetchOverview]);

  const handleCheckIn = async (appointment) => {
    if (isAppointmentLate(appointment) && appointment.status !== 'Serving' && appointment.status !== 'Completed') {
      setLateArrivalAppointment(appointment);
      return;
    }
    try {
      if (appointment?.id) {
        await updateAppointmentStatus(appointment.id, 'Serving');
        await fetchOverview();
      }
    } catch (err) {
      console.error('Failed to check in appointment:', err);
    } finally {
      setSelectedAppointment(null);
    }
  };

  const handleReschedule = () => {
    setSelectedAppointment(null);
    if (setActiveTab) setActiveTab('schedule');
  };

  const handleCancelAppointment = (appointment) => {
    setCancellingAppointment(appointment || selectedAppointment);
  };

  const stats = overviewData.stats || {};
  const alerts = overviewData.alerts || [];

  const formatCurrency = (val) =>
    '₱' +
    Number(val || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') {
      return { label: 'Completed', bg: '#B1FFB4', color: '#458A48' };
    }
    if (
      s === 'approved' ||
      s === 'serving' ||
      s === 'in_progress' ||
      s === 'scheduled' ||
      s === 'confirmed'
    ) {
      return {
        label: status === 'serving' ? 'Serving' : status === 'Approved' ? 'Approved' : 'Scheduled',
        bg: '#B1FFDF',
        color: '#17A897',
      };
    }
    if (s === 'pending') {
      return { label: 'Pending', bg: '#FEF3C7', color: '#D97706' };
    }
    if (s === 'cancelled' || s === 'no_show' || s === 'missed') {
      return { label: 'Cancelled', bg: '#FEE2E2', color: '#DC2626' };
    }
    return { label: status || 'Scheduled', bg: '#B1FFDF', color: '#17A897' };
  };

  const appointmentsList = useMemo(() => {
    if (!overviewData.todayAppointments || overviewData.todayAppointments.length === 0) {
      return [];
    }
    return overviewData.todayAppointments.map((app, idx) => {
      const statusInfo = getStatusBadge(app.status);
      const isNew = app.patient_type === 'New Patient';
      return {
        id: app.id || idx,
        raw: app,
        time: app.appointment_time ? app.appointment_time.slice(0, 5) : '09:00',
        duration:
          app.duration ||
          (app.service?.duration_minutes ? `${app.service.duration_minutes}min` : '30min'),
        name: app.patient?.full_name || 'Patient',
        patient: app.patient,
        type: isNew ? 'New Patient' : 'Returning',
        typeBg: isNew ? '#DBEAFE' : '#D1FAE5',
        typeColor: isNew ? '#1D4ED8' : '#047857',
        serviceName: app.service?.service_name || 'Routine Checkup',
        subtitle: `${app.service?.service_name || 'Consultation'} · ${app.dentist_name || app.staff_notes || 'Assigned Staff'}`,
        status: statusInfo.label,
        statusBg: statusInfo.bg,
        statusColor: statusInfo.color,
      };
    });
  }, [overviewData.todayAppointments]);

  // Compute Dentist Service Mix dynamically if todayAppointments exist, otherwise fallback to Figma spec numbers
  const serviceMixCategories = useMemo(() => {
    const apps = overviewData.todayAppointments || [];
    if (apps.length === 0) {
      return DEFAULT_SERVICE_MIX;
    }

    const counts = DEFAULT_SERVICE_MIX.map((cat) => ({ ...cat, count: 0 }));
    apps.forEach((app) => {
      const svc = (app.service?.service_name || '').toLowerCase();
      const matched = counts.find((cat) => cat.keywords.some((kw) => svc.includes(kw)));
      if (matched) {
        matched.count += 1;
      } else {
        counts[0].count += 1;
      }
    });

    const total = counts.reduce((sum, c) => sum + c.count, 0);
    return total > 0 ? counts : DEFAULT_SERVICE_MIX;
  }, [overviewData.todayAppointments]);

  const serviceMixTotal = useMemo(() => {
    const sum = serviceMixCategories.reduce((acc, item) => acc + item.count, 0);
    return sum > 0 ? sum : 20;
  }, [serviceMixCategories]);

  const lastCompletedService = useMemo(() => {
    const completed = appointmentsList.find((a) => a.status.toLowerCase() === 'completed');
    return completed?.serviceName || 'Routine Checkup';
  }, [appointmentsList]);

  const currentMonthLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long' }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" style={{ color: '#99A1AF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#1A8A7A] border-t-transparent animate-spin" />
        <p style={{ fontSize: 12, fontFamily: "'Work Sans', sans-serif" }}>Loading dynamic dashboard...</p>
      </div>
    );
  }

  const clinicDisplayName =
    overviewData.clinic?.name || clinic?.clinic_name || 'Smile Care Clinic';
  const planName = overviewData.clinic?.plan || clinic?.subscription?.plan?.plan_name;

  return (
    <div className="w-full flex flex-col gap-5 p-4 md:p-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* ── TOP BANNER: CLINIC CONTEXT, ROLE PREVIEW SWITCHER & QUICK ACTIONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#0E3F39]/10 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-[#0E3F39] tracking-tight">
              {clinicDisplayName}
            </h1>
            {planName && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#1A8A7A]/10 text-[#1A8A7A]">
                {planName}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#5A7A76] mt-0.5">
            Welcome back, <span className="font-semibold text-[#1E2939]">{user?.name || 'Doctor'}</span>! Today is{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab && setActiveTab('schedule')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0E3F39] hover:bg-[#1A8A7A] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>+ Book Appointment</span>
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('patients')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0E3F39] bg-white border border-[#0E3F39]/20 hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            Patient Directory
          </button>
        </div>
      </div>

      {/* ── ROLE-BASED KPI & CLINICAL CARDS ── */}
      {isDentist ? (
        <>
          {/* DENTIST ROW 1: 2 KPI CARDS (Figma node 598:63521) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 1: My Patients Today (node 598:63522) */}
            <div
              style={{
                padding: 16.67,
                background: 'white',
                border: '0.67px solid #F3F4F6',
                boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.10), 0px 1px 1px rgba(0, 0, 0, 0.06)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#B5C5B9', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  My Patients Today
                </span>
                <img
                  src={assets.iconDentistPatients || assets.iconPatients}
                  alt="My Patients Today"
                  style={{ width: 18, height: 18, objectFit: 'contain' }}
                />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#064B42', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.totalAppointmentsToday || 4}
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#B5C5B9', fontSize: 12, fontWeight: '400', lineHeight: '16px' }}>
                  {stats.remainingToday || 2} remaining
                </span>
              </div>
            </div>

            {/* Card 2: Completed Today (node 598:63548) */}
            <div
              style={{
                padding: 16.67,
                background: 'white',
                border: '0.67px solid #F3F4F6',
                boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.10), 0px 1px 1px rgba(0, 0, 0, 0.06)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#B5C5B9', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  Completed Today
                </span>
                <img
                  src={assets.iconDentistCompleted || assets.iconAppointmentsToday}
                  alt="Completed Today"
                  style={{ width: 18, height: 18, objectFit: 'contain' }}
                />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#064B42', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.completedToday || 1}
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#B5C5B9', fontSize: 12, fontWeight: '400', lineHeight: '16px' }}>
                  {lastCompletedService}
                </span>
              </div>
            </div>
          </div>

          {/* DENTIST ROW 2: MY SERVICE MIX CARD (Figma node 598:63561) */}
          <div
            style={{
              width: '100%',
              background: 'white',
              border: '1.33px solid #E5E7EB',
              borderRadius: 16,
              padding: 21.33,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* Section Header (node 598:63562) */}
            <div className="flex items-center gap-2 w-full">
              <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                <img
                  src={assets.iconDentistServiceMix}
                  alt="Service Mix"
                  style={{ width: 14, height: 14, objectFit: 'contain' }}
                />
              </div>
              <div className="flex flex-col items-start">
                <span
                  style={{
                    color: '#0F3E38',
                    fontSize: 14,
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
                >
                  My Service Mix — {currentMonthLabel}
                </span>
                <span
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontWeight: '400',
                    lineHeight: '16px',
                  }}
                >
                  Procedure categories
                </span>
              </div>
            </div>

            {/* 6 Procedure Category Progress Bars (node 598:63572) */}
            <div className="w-full flex flex-col gap-2 pt-4">
              {serviceMixCategories.map((cat) => {
                const widthPct = Math.min(100, Math.round((cat.count / serviceMixTotal) * 100));
                return (
                  <div key={cat.name} className="w-full flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <span
                        style={{
                          color: cat.color,
                          fontSize: 12,
                          fontWeight: '500',
                          lineHeight: '16px',
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${widthPct}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                    <div className="w-6 shrink-0 text-right">
                      <span
                        style={{
                          color: '#0F3E38',
                          fontSize: 12,
                          fontWeight: '700',
                          lineHeight: '16px',
                        }}
                      >
                        {cat.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── OWNER / ADMIN / ASSISTANT ROW 1: 3 METRIC CARDS ── */}
          <div className={`grid grid-cols-1 ${roleConfig.canViewRevenue ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3.75`}>
            {/* Card 1: Revenue This Month */}
            {roleConfig.canViewRevenue && (
              <div
                style={{
                  padding: 16,
                  background: 'white',
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  borderRadius: 10,
                  outline: '0.67px white solid',
                  outlineOffset: '-0.67px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                  <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                    Revenue This Month
                  </span>
                  <img src={assets.iconRevenue} alt="Revenue" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                </div>
                <div style={{ paddingTop: 8 }}>
                  <span style={{ color: '#0E3F39', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                    {formatCurrency(stats.revenueThisMonth)}
                  </span>
                </div>
                <div style={{ paddingTop: 4 }}>
                  <span
                    style={{
                      color: (stats.revenueGrowth ?? 0) >= 0 ? '#10B981' : '#EF4444',
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: '16px',
                    }}
                  >
                    {(stats.revenueGrowth ?? 0) >= 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`} vs last month
                  </span>
                </div>
              </div>
            )}

            {/* Card 2: New Patients This Month */}
            <div
              style={{
                padding: 16,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '0.67px white solid',
                outlineOffset: '-0.67px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  New Patients This Month
                </span>
                <img src={assets.iconNewPatients} alt="New Patients" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#0E3F39', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.newPatientsThisMonth ?? 0}
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span
                  style={{
                    color: (stats.newPatientsGrowth ?? 0) >= 0 ? '#10B981' : '#EF4444',
                    fontSize: 12,
                    fontWeight: '500',
                    lineHeight: '16px',
                  }}
                >
                  {(stats.newPatientsGrowth ?? 0) >= 0 ? `+${stats.newPatientsGrowth}` : `${stats.newPatientsGrowth}`} vs last month
                </span>
              </div>
            </div>

            {/* Card 3: Cancellation Rate */}
            <div
              style={{
                padding: 16,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '0.67px white solid',
                outlineOffset: '-0.67px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  Cancellation Rate
                </span>
                <img src={assets.iconCancellation} alt="Cancellation Rate" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#0E3F39', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.cancellationRateThisMonth ?? 0}%
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '400', lineHeight: '16px' }}>
                  This month ({stats.cancelledThisMonth ?? 0} cancelled)
                </span>
              </div>
            </div>
          </div>

          {/* ── OWNER / ADMIN / ASSISTANT ROW 2: 2 METRIC CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.75">
            {/* Card 4: No-shows Today */}
            <div
              style={{
                padding: 16,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '0.67px white solid',
                outlineOffset: '-0.67px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  No-shows Today
                </span>
                <img src={assets.iconNoShows} alt="No-shows" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#0E3F39', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.noShowsToday ?? 0}
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '400', lineHeight: '16px' }}>
                  {stats.noShowsRateToday ?? 0}% rate today
                </span>
              </div>
            </div>

            {/* Card 5: Total Appointments Today */}
            <div
              style={{
                padding: 16,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '0.67px white solid',
                outlineOffset: '-0.67px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '500', lineHeight: '16px' }}>
                  Total Appointments Today
                </span>
                <img src={assets.iconAppointmentsToday} alt="Total Appointments" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <div style={{ paddingTop: 8 }}>
                <span style={{ color: '#0E3F39', fontSize: 24, fontWeight: '600', lineHeight: '32px' }}>
                  {stats.totalAppointmentsToday ?? 0}
                </span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#99A1AF', fontSize: 12, fontWeight: '400', lineHeight: '16px' }}>
                  {stats.remainingToday ?? 0} remaining ({stats.completedToday ?? 0} completed)
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TODAY'S APPOINTMENTS CARD ── */}
      <div
        style={{
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          borderRadius: 10,
          outline: '1.33px rgba(14, 63, 57, 0.10) solid',
          outlineOffset: '-1.33px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            paddingLeft: 18.75,
            paddingRight: 18.75,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottom: '1.33px rgba(14, 63, 57, 0.08) solid',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#1E2939', fontSize: 14, fontWeight: '600', lineHeight: '20px' }}>
              Today's Appointments
            </span>
            <div
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 2,
                paddingBottom: 2,
                background: appointmentsList.length > 0 ? '#96FFC9' : '#F3F4F6',
                borderRadius: 44739200,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0E3F39', fontSize: 11, fontWeight: '600', lineHeight: '15.71px' }}>
                {appointmentsList.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('schedule')}
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 3.75,
              display: 'flex',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                textAlign: 'center',
                color: '#0E3F39',
                fontSize: 11.25,
                fontWeight: '600',
                lineHeight: '15px',
              }}
            >
              Full Calendar
            </span>
            <img src={assets.iconArrowRight} alt="Arrow" style={{ width: 12, height: 12, objectFit: 'contain' }} />
          </button>
        </div>

        {/* Appointments List or Clean Empty State */}
        <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
          {appointmentsList.length === 0 ? (
            <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-[#FAFAF8]">
              <div className="w-12 h-12 rounded-full bg-[#1A8A7A]/10 flex items-center justify-center mb-3">
                <img
                  src={assets.iconAppointmentsToday}
                  alt="Calendar"
                  className="w-6 h-6 object-contain opacity-70"
                />
              </div>
              <h3 className="text-sm font-semibold text-[#1E2939] mb-1">
                No appointments scheduled for today
              </h3>
              <p className="text-xs text-[#5A7A76] max-w-sm mb-4">
                Your appointment queue is completely clear today. You can schedule a walk-in patient or check upcoming dates on the calendar.
              </p>
              <button
                onClick={() => setActiveTab && setActiveTab('schedule')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0E3F39] hover:bg-[#1A8A7A] transition-colors cursor-pointer"
              >
                + Schedule Patient
              </button>
            </div>
          ) : (
            appointmentsList.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => setSelectedAppointment(item.raw || item)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-3.5 border-b border-[#0E3F39]/6 last:border-b-0 transition-colors hover:bg-[#F9FAFB] cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Time Column */}
                  <div className="w-14 sm:w-16 shrink-0 flex flex-col items-start">
                    <span className="text-sm font-semibold text-[#1E2939] leading-tight">
                      {item.time}
                    </span>
                    <span className="text-[11px] text-[#5A7A76] leading-tight mt-0.5">
                      {item.duration}
                    </span>
                  </div>

                  {/* Patient Info Column */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#1E2939] truncate">
                        {item.name}
                      </span>
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0"
                        style={{ background: item.typeBg, color: item.typeColor }}
                      >
                        {item.type}
                      </span>
                    </div>
                    <span className="text-xs text-[#6A7282] truncate mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center justify-between sm:justify-end gap-2 ml-auto sm:ml-0 pl-16 sm:pl-0 shrink-0">
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0"
                    style={{ background: item.statusBg, color: item.statusColor }}
                  >
                    {item.status}
                  </span>
                  {item.patient && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(item.patient);
                      }}
                      className="text-[11px] text-[#1A8A7A] font-semibold hover:underline cursor-pointer"
                    >
                      View chart →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ALERTS CARD ── */}
      <div
        style={{
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          borderRadius: 10,
          outline: '1.33px rgba(14, 63, 57, 0.10) solid',
          outlineOffset: '-1.33px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            paddingLeft: 18.75,
            paddingRight: 18.75,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottom: '1.33px rgba(14, 63, 57, 0.08) solid',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 7.5, display: 'flex' }}>
            <span style={{ color: '#1E2939', fontSize: 14, fontWeight: '600', lineHeight: '20px' }}>
              Alerts
            </span>
            <div
              style={{
                paddingLeft: 7,
                paddingRight: 7,
                paddingTop: 2,
                paddingBottom: 2,
                background: alerts.length > 0 ? '#FEE2E2' : '#DCFCE7',
                borderRadius: 44739200,
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  color: alerts.length > 0 ? '#DC2626' : '#15803D',
                  fontSize: 11,
                  fontWeight: '600',
                  lineHeight: '15.71px',
                }}
              >
                {alerts.length}
              </span>
            </div>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={() => setActiveTab && setActiveTab('schedule')}
              className="text-xs text-[#0E3F39] hover:underline font-medium cursor-pointer"
            >
              Review Queue
            </button>
          )}
        </div>

        <div style={{ alignSelf: 'stretch', flexDirection: 'column', display: 'flex' }}>
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#5A7A76]">
              All caught up! No active warnings or pending action items.
            </div>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={alert.id || i}
                onClick={() => alert.tab && setActiveTab && setActiveTab(alert.tab)}
                style={{
                  alignSelf: 'stretch',
                  paddingLeft: 15,
                  paddingRight: 15,
                  paddingTop: 13.13,
                  paddingBottom: 13.13,
                  borderBottom: i < alerts.length - 1 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 11.25,
                  display: 'inline-flex',
                  cursor: alert.tab ? 'pointer' : 'default',
                }}
                className={alert.tab ? 'hover:bg-[#F9FAFB] transition-colors' : ''}
              >
                <div style={{ paddingTop: 1.88, display: 'flex', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      background: alert.type === 'warning' ? '#FEF3C7' : alert.type === 'success' ? '#DCFCE7' : '#DCE8F5',
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <img
                      src={assets.iconAlertMsg}
                      alt="Alert"
                      style={{ width: 14, height: 14, objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div style={{ flex: '1 1 0', flexDirection: 'column', display: 'inline-flex' }}>
                  <span style={{ color: '#1E2939', fontSize: 13, fontWeight: '400', lineHeight: '18px' }}>
                    {alert.message}
                  </span>
                  <div style={{ paddingTop: 3.75, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#5A7A76', fontSize: 11, fontWeight: '400', lineHeight: '16.5px' }}>
                      {alert.time}
                    </span>
                    {alert.tab && (
                      <span className="text-[10px] text-[#1A8A7A] font-semibold uppercase tracking-wider">
                        • View
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Details Modal from Figma */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCheckIn={handleCheckIn}
          onReschedule={handleReschedule}
          onCancel={handleCancelAppointment}
          onViewPatient={(patient) => setSelectedPatient(patient)}
        />
      )}

      {/* Cancel Appointment Confirmation Modal from Figma */}
      {cancellingAppointment && (
        <CancelAppointmentModal
          appointment={cancellingAppointment}
          isOpen={!!cancellingAppointment}
          onClose={() => setCancellingAppointment(null)}
          isSubmitting={isCancelling}
          onConfirm={async (app, reason) => {
            setIsCancelling(true);
            try {
              if (app?.id) {
                await updateAppointmentStatus(app.id, 'Cancelled', reason);
                await fetchOverview();
              }
              setCancellingAppointment(null);
              setSelectedAppointment(null);
            } catch (err) {
              console.error('Failed to cancel appointment:', err);
            } finally {
              setIsCancelling(false);
            }
          }}
        />
      )}

      {/* Late Arrival Confirmation Modal from Figma */}
      {lateArrivalAppointment && (
        <LateArrivalModal
          appointment={lateArrivalAppointment}
          isOpen={!!lateArrivalAppointment}
          onClose={() => setLateArrivalAppointment(null)}
          isSubmitting={isHandlingLate}
          onMoveToEndOfQueue={async (app) => {
            setIsHandlingLate(true);
            try {
              if (app?.id) {
                await updateAppointmentStatus(app.id, 'Approved', null, { move_to_end_of_queue: true });
                await fetchOverview();
              }
              setLateArrivalAppointment(null);
              setSelectedAppointment(null);
            } catch (err) {
              console.error('Failed to move to end of queue:', err);
            } finally {
              setIsHandlingLate(false);
            }
          }}
          onPromptReschedule={async (app) => {
            setIsHandlingLate(true);
            try {
              if (app?.id) {
                await updateAppointmentStatus(app.id, 'Cancelled', 'Late arrival - prompt reschedule');
                await fetchOverview();
              }
              setLateArrivalAppointment(null);
              setSelectedAppointment(null);
            } catch (err) {
              console.error('Failed to prompt reschedule:', err);
            } finally {
              setIsHandlingLate(false);
            }
          }}
        />
      )}

      {/* Patient Record Details Modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          isLarge
        />
      )}
    </div>
  );
}
