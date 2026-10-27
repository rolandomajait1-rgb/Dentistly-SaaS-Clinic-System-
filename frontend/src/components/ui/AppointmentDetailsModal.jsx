import React from 'react';

export default function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onCheckIn,
  onReschedule,
  onCancel,
  onViewPatient,
}) {
  if (!isOpen || !appointment) return null;

  // Extract appointment fields with fallbacks
  const patientName =
    appointment.patient?.full_name ||
    appointment.patient?.name ||
    appointment.name ||
    appointment.patient_name ||
    'Nathan Park';

  const rawDate = appointment.appointment_date || appointment.date || '2026-07-29';
  const appointmentDate = String(rawDate).split('T')[0];

  const rawTime = appointment.appointment_time || appointment.time || '09:00';
  const appointmentTime = String(rawTime).slice(0, 5);

  const duration =
    appointment.duration ||
    (appointment.service?.duration_minutes ? `${appointment.service.duration_minutes} minutes` : '30 minutes');

  const serviceName =
    appointment.service?.service_name ||
    appointment.service_name ||
    (typeof appointment.service === 'string' ? appointment.service : '') ||
    'Consultation';

  const doctorName =
    appointment.doctor_name ||
    appointment.doctor?.name ||
    appointment.dentist_name ||
    (typeof appointment.doctor === 'string' ? appointment.doctor : '') ||
    appointment.staff?.full_name ||
    appointment.staff_notes ||
    'Dr. Carlos Reyes';

  const status = appointment.status || 'Completed';

  // Get status styling matching Figma specification
  const getStatusBadge = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s === 'completed') {
      return { bg: '#B1FFB4', color: '#458A48', label: 'Completed' };
    }
    if (s === 'pending') {
      return { bg: '#FEF3C7', color: '#B45309', label: 'Pending' };
    }
    if (s === 'approved' || s === 'scheduled') {
      return { bg: '#DBEAFE', color: '#1D4ED8', label: statusStr || 'Scheduled' };
    }
    if (s === 'cancelled' || s === 'no-show') {
      return { bg: '#FEE2E2', color: '#DC2626', label: statusStr || 'Cancelled' };
    }
    if (s === 'serving' || s === 'in progress') {
      return { bg: '#EDE9FE', color: '#7C3AED', label: 'Serving' };
    }
    return { bg: '#F1F5F9', color: '#475569', label: statusStr };
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-[420px] sm:max-w-[440px] flex flex-col justify-start items-start bg-white shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10),0px_20px_25px_-5px_rgba(0,0,0,0.10)] rounded-[10px] overflow-hidden"
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 22.5,
          paddingBottom: 22.5,
        }}
      >
        {/* Header */}
        <div
          className="w-full flex justify-between items-center"
          style={{ paddingLeft: 15, paddingRight: 15 }}
        >
          <div
            style={{
              color: '#1E2939',
              fontSize: 14,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '700',
              lineHeight: '20px',
              wordWrap: 'break-word',
            }}
          >
            Appointment Details
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6A7282] hover:text-[#1E2939] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="#6A7282" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content Fields Container */}
        <div
          className="w-full flex flex-col justify-start items-start gap-[10px] overflow-hidden"
          style={{
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          {/* Field 1: Patient Name */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex justify-start items-center gap-[10px]">
                <div
                  className="w-4 h-4 p-[3px] bg-[#C5ECE3] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 4.8C5.9 4.8 6.6 4.1 6.6 3.2C6.6 2.3 5.9 1.6 5 1.6C4.1 1.6 3.4 2.3 3.4 3.2C3.4 4.1 4.1 4.8 5 4.8Z" stroke="#1A8A7A" strokeWidth="1" strokeLinecap="round" />
                    <path d="M2.2 8.4C2.2 7.1 3.4 6 5 6C6.6 6 7.8 7.1 7.8 8.4" stroke="#1A8A7A" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  style={{
                    color: '#1E2939',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '400',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  {patientName}
                </div>
              </div>
              {onViewPatient && (appointment.patient || appointment.patient_id) && (
                <button
                  type="button"
                  onClick={() => onViewPatient(appointment.patient || appointment)}
                  className="text-[11px] text-[#1A8A7A] hover:underline font-semibold cursor-pointer ml-2"
                >
                  View chart →
                </button>
              )}
            </div>
          </div>

          {/* Field 2: Date & Time */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-start items-center gap-[10px]">
              <div
                className="w-4 h-4 p-[3px] bg-[#C5ECE3] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="1.5" y="2" width="7" height="6.5" rx="1" stroke="#1A8A7A" strokeWidth="0.9" />
                  <path d="M1.5 4H8.5" stroke="#1A8A7A" strokeWidth="0.9" />
                  <path d="M3.5 1V2.5M6.5 1V2.5" stroke="#1A8A7A" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
              </div>
              <div
                style={{
                  color: '#1E2939',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '400',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                {appointmentDate} at {appointmentTime}
              </div>
            </div>
          </div>

          {/* Field 3: Duration */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-start items-center gap-[10px]">
              <div
                className="w-4 h-4 p-[3px] bg-[#C5ECE3] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke="#1A8A7A" strokeWidth="0.9" />
                  <path d="M5 2.5V5L6.5 6.5" stroke="#1A8A7A" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
              </div>
              <div
                style={{
                  color: '#1E2939',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '400',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                {duration}
              </div>
            </div>
          </div>

          {/* Field 4: Service */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-start items-center gap-[10px]">
              <div
                className="w-4 h-4 p-[3px] bg-[#C5ECE3] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1.5C3.5 1.5 2 2.5 2 4.5C2 6.5 3.5 8.5 5 8.5C6.5 8.5 8 6.5 8 4.5C8 2.5 6.5 1.5 5 1.5Z" stroke="#1A8A7A" strokeWidth="0.9" />
                  <path d="M5 3.5V6.5M3.5 5H6.5" stroke="#1A8A7A" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
              </div>
              <div
                style={{
                  color: '#1E2939',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '400',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                {serviceName}
              </div>
            </div>
          </div>

          {/* Field 5: Assigned Doctor */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-start items-center gap-[10px]">
              <div
                className="w-4 h-4 p-[3px] bg-[#C5ECE3] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="4" r="2.2" stroke="#1A8A7A" strokeWidth="0.9" />
                  <path d="M2 8.5C2 7 3.5 6 5 6C6.5 6 8 7 8 8.5" stroke="#1A8A7A" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
              </div>
              <div
                style={{
                  color: '#1E2939',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '400',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                Assigned: {doctorName}
              </div>
            </div>
          </div>

          {/* Field 6: Status */}
          <div
            className="w-full flex flex-col justify-center items-start bg-white rounded-[10px] shadow-[0px_0px_4px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ padding: '10px 15px' }}
          >
            <div className="flex justify-center items-center gap-[10px]">
              <div
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 2,
                  paddingBottom: 2,
                  background: '#C5ECE3',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: '#1A8A7A',
                    fontSize: 11,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '600',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  Status:
                </span>
              </div>
              <div
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 2,
                  paddingBottom: 2,
                  background: statusBadge.bg,
                  borderRadius: 9999,
                  display: 'inline-flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    color: statusBadge.color,
                    fontSize: 11,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '600',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Check in */}
        <div
          className="w-full flex items-center justify-start gap-[7.5px]"
          style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 7.5 }}
        >
          <button
            onClick={() => onCheckIn && onCheckIn(appointment)}
            className="flex-1 flex justify-center items-center gap-[10px] rounded-[10px] transition-colors cursor-pointer hover:bg-[#154E46]"
            style={{
              paddingLeft: 15,
              paddingRight: 15,
              paddingTop: 10,
              paddingBottom: 10,
              background: '#0F3E38',
              border: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.33 4L6 11.33L2.67 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              style={{
                color: 'white',
                fontSize: 14,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: '700',
                lineHeight: '20px',
                wordWrap: 'break-word',
              }}
            >
              Check in
            </span>
          </button>
        </div>

        {/* Secondary Actions Row: Reschedule + Cancel Appointment */}
        <div
          className="w-full flex items-center justify-start gap-[7.5px]"
          style={{ paddingLeft: 10, paddingRight: 10 }}
        >
          {/* Reschedule Button */}
          <button
            onClick={() => onReschedule && onReschedule(appointment)}
            className="flex-1 flex justify-center items-center gap-[10px] rounded-[10px] transition-colors cursor-pointer hover:bg-slate-50"
            style={{
              paddingLeft: 15,
              paddingRight: 15,
              paddingTop: 10,
              paddingBottom: 10,
              background: 'white',
              boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
              outline: '1px rgba(0, 0, 0, 0.05) solid',
              outlineOffset: '-1px',
              border: 'none',
            }}
          >
            <span
              style={{
                textAlign: 'center',
                color: '#6A7282',
                fontSize: 14,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: '700',
                lineHeight: '20px',
                wordWrap: 'break-word',
              }}
            >
              Reschedule
            </span>
          </button>

          {/* Cancel Appointment Button */}
          <button
            onClick={() => onCancel && onCancel(appointment)}
            className="flex-1 flex justify-center items-center gap-[10px] rounded-[10px] transition-colors cursor-pointer hover:bg-red-50/70"
            style={{
              paddingLeft: 15,
              paddingRight: 15,
              paddingTop: 10,
              paddingBottom: 10,
              background: 'white',
              boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
              outline: '1px rgba(0, 0, 0, 0.05) solid',
              outlineOffset: '-1px',
              border: 'none',
            }}
          >
            <span
              style={{
                textAlign: 'center',
                color: '#DA0F00',
                fontSize: 14,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: '700',
                lineHeight: '20px',
                wordWrap: 'break-word',
              }}
            >
              Cancel Appointment
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
