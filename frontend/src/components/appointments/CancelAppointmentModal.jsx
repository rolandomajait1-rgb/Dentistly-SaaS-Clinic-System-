import React, { useState, useEffect } from 'react';

const REASON_OPTIONS = [
  'Patient requested cancellation',
  'Patient no-show',
  'Doctor unavailable',
  'Scheduling conflict',
  'Emergency / Illness',
  'Travel or weather issue',
  'Other reason',
];

export default function CancelAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Reset form whenever a new appointment opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setCustomReason('');
    }
  }, [isOpen, appointment]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !appointment) return null;

  // Extract patient details
  const patientName =
    appointment.patient?.full_name ||
    appointment.patient?.name ||
    appointment.name ||
    appointment.patient_name ||
    'Patient';

  const serviceName =
    appointment.service?.service_name ||
    appointment.service_name ||
    (typeof appointment.service === 'string' ? appointment.service : '') ||
    'Consultation';

  // Format date: "July 19, 2026"
  const rawDate = appointment.appointment_date || appointment.date;
  let formattedDate = 'Scheduled Date';
  if (rawDate) {
    try {
      const dateParts = String(rawDate).split('T')[0].split('-');
      if (dateParts.length === 3) {
        const d = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
        formattedDate = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = String(rawDate);
    }
  }

  // Format time: "11:00 AM"
  const rawTime = appointment.appointment_time || appointment.time;
  let formattedTime = 'Scheduled Time';
  if (rawTime) {
    try {
      const parts = String(rawTime).split(':');
      const h = parseInt(parts[0], 10);
      const m = parts[1] || '00';
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      formattedTime = `${formattedH}:${m} ${ampm}`;
    } catch {
      formattedTime = String(rawTime);
    }
  }

  // Determine if appointment is within 24 hours (or past due)
  let isWithin24Hours = true;
  if (rawDate) {
    try {
      const dateStr = String(rawDate).split('T')[0];
      const timeStr = rawTime ? String(rawTime).slice(0, 8) : '00:00:00';
      const appDateTime = new Date(`${dateStr}T${timeStr}`);
      if (!isNaN(appDateTime.getTime())) {
        const now = new Date();
        const diffHours = (appDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        isWithin24Hours = diffHours <= 24;
      }
    } catch {
      isWithin24Hours = true;
    }
  }

  const handleConfirm = () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Other reason' && customReason.trim()) {
      finalReason = `Other: ${customReason.trim()}`;
    }
    if (onConfirm) {
      onConfirm(appointment, finalReason || null);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150"
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'inline-flex',
      }}
    >
      <div
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-appointment-title"
          style={{
            width: 384,
            maxWidth: 384,
            background: 'white',
            boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderRadius: 16,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'inline-flex',
            overflow: 'hidden',
          }}
        >
          {/* Main Content Area */}
          <div
            style={{
              alignSelf: 'stretch',
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 20,
              paddingBottom: 20,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
            }}
          >
            {/* Cancellation Lock Warning Banner */}
            <div
              style={{
                width: '100%',
                padding: 12,
                background: isWithin24Hours ? '#FEF3C7' : '#EFF6FF',
                borderRadius: 14,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 12,
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  paddingTop: 2,
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                {isWithin24Hours ? (
                  /* Warning Triangle SVG matching Figma 16x16 with #B45309 stroke */
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path
                      d="M8 2.5L14.2 13.5H1.8L8 2.5Z"
                      stroke="#B45309"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 6.5V9.5M8 11.6V11.8"
                      stroke="#B45309"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  /* Information Icon SVG for notice > 24 hours */
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <circle cx="8" cy="8" r="6" stroke="#2563EB" strokeWidth="1.33" />
                    <path d="M8 7.5V11M8 5V5.5" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div
                style={{
                  width: 284,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  display: 'inline-flex',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      color: isWithin24Hours ? '#973C00' : '#1E40AF',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                      wordWrap: 'break-word',
                    }}
                  >
                    {isWithin24Hours ? 'Cancellation Lock Warning' : 'Cancellation Notice'}
                  </div>
                </div>
                <div
                  style={{
                    alignSelf: 'stretch',
                    paddingTop: 2,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      width: 284,
                      color: isWithin24Hours ? '#BB4D00' : '#1D4ED8',
                      fontSize: 12,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '400',
                      lineHeight: '16px',
                      wordWrap: 'break-word',
                    }}
                  >
                    {isWithin24Hours
                      ? 'This appointment is within 24 hours. Canceling may trigger a late-cancellation fee and patient notification.'
                      : 'Canceling will free up this time slot and send a notification update to the patient.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Title: Cancel Appointment */}
            <div
              style={{
                width: 336,
                height: 36,
                paddingTop: 16,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
              }}
            >
              <div
                id="cancel-appointment-title"
                style={{
                  color: '#1E2939',
                  fontSize: 14,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '600',
                  lineHeight: '20px',
                  wordWrap: 'break-word',
                }}
              >
                Cancel Appointment
              </div>
            </div>

            {/* Target Description: Cancel {Patient}'s {Service} on {Date} at {Time}? */}
            <div
              style={{
                alignSelf: 'stretch',
                paddingTop: 4,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
              }}
            >
              <div style={{ width: 336 }}>
                <span
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '400',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  Cancel{' '}
                </span>
                <span
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '700',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  {patientName}&apos;s
                </span>
                <span
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '400',
                    lineHeight: '16px',
                    wordWrap: 'break-word',
                  }}
                >
                  {' '}{serviceName} on {formattedDate} at {formattedTime}?
                </span>
              </div>
            </div>

            {/* Label: Reason (optional) */}
            <div
              style={{
                width: 336,
                height: 36,
                paddingTop: 16,
                paddingBottom: 4,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
              }}
            >
              <label
                htmlFor="cancellation-reason-select"
                style={{
                  color: '#6A7282',
                  fontSize: 12,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '500',
                  lineHeight: '16px',
                  wordWrap: 'break-word',
                }}
              >
                Reason (optional)
              </label>
            </div>

            {/* Dropdown Container */}
            <div
              data-property-1="Container"
              style={{
                width: 336,
                height: 36,
                position: 'relative',
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  width: 336,
                  height: 36,
                  padding: '8px 10px',
                  left: 0,
                  top: 0,
                  position: 'absolute',
                  borderRadius: 10,
                  outline: '1.33px #E5E7EB solid',
                  outlineOffset: '-1.33px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: 10,
                  display: 'inline-flex',
                  background: 'white',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 10,
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      flex: '1 1 0',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 10,
                      display: 'flex',
                    }}
                  >
                    <select
                      id="cancellation-reason-select"
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: selectedReason ? '#1E2939' : '#1E2939',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      <option value="" style={{ color: '#99A1AF' }}>
                        Select reason...
                      </option>
                      {REASON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Chevron Down Arrow Icon matching Figma */}
                  <div
                    style={{
                      width: 16,
                      height: 15,
                      position: 'relative',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                      <path
                        d="M4 6L8 9.5L12 6"
                        stroke="#1E2939"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Custom Reason Input if "Other reason" is selected */}
            {selectedReason === 'Other reason' && (
              <div style={{ width: 336, paddingTop: 8 }}>
                <input
                  type="text"
                  placeholder="Specify cancellation details..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={250}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    outline: '1.33px #E5E7EB solid',
                    outlineOffset: '-1.33px',
                    border: 'none',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    color: '#1E2939',
                    background: '#F9FAFB',
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div
            style={{
              alignSelf: 'stretch',
              height: 72,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderTop: '1.33px #F3F4F6 solid',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              gap: 8,
              display: 'inline-flex',
            }}
          >
            {/* Keep Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-property-1="Default"
              className="hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              style={{
                flex: '1 1 0',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '1px rgba(0, 0, 0, 0.05) solid',
                outlineOffset: '-1px',
                border: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'flex',
              }}
            >
              <div
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
                Keep
              </div>
            </button>

            {/* Confirm Cancel Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              data-property-1="Default"
              className="hover:bg-red-50/70 transition-colors cursor-pointer disabled:opacity-50"
              style={{
                flex: '1 1 0',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'white',
                boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                borderRadius: 10,
                outline: '1px rgba(0, 0, 0, 0.05) solid',
                outlineOffset: '-1px',
                border: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'flex',
              }}
            >
              <div
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
                {isSubmitting ? 'Canceling...' : 'Confirm Cancel'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
