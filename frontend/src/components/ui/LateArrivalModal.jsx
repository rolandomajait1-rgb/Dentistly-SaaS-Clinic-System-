import React, { useEffect } from 'react';

/**
 * Utility to check if an appointment is late for today's schedule
 */
export const isAppointmentLate = (appointment, gracePeriodMinutes = 10) => {
  if (!appointment) return false;
  try {
    const rawDate = appointment.appointment_date || appointment.date;
    const rawTime = appointment.appointment_time || appointment.time;
    if (!rawDate || !rawTime) return false;
    const dateStr = String(rawDate).split('T')[0];
    const timeStr = String(rawTime).slice(0, 8);
    const appDateTime = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(appDateTime.getTime())) return false;
    const now = new Date();
    // Compare date
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (dateStr < todayStr) return true; // Past day appointment
    if (dateStr > todayStr) return false; // Future day appointment
    // Same day: check if current time > appointment time + grace period
    const diffMinutes = (now.getTime() - appDateTime.getTime()) / (1000 * 60);
    return diffMinutes > gracePeriodMinutes;
  } catch {
    return false;
  }
};

export default function LateArrivalModal({
  appointment,
  isOpen,
  onClose,
  onMoveToEndOfQueue,
  onPromptReschedule,
  isSubmitting = false,
}) {
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

  // Format time (e.g., "1:00 PM")
  const rawTime = appointment.appointment_time || appointment.time;
  let formattedTime = '1:00 PM';
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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150 select-none"
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.40)',
      }}
    >
      <div className="px-4 flex justify-start items-start">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="late-arrival-title"
          className="w-96 max-w-96 bg-white rounded-2xl shadow-2xl inline-flex flex-col justify-start items-start overflow-hidden"
          style={{ width: 384, maxWidth: 384 }}
        >
          {/* Main Card Content */}
          <div className="self-stretch px-6 py-5 flex flex-col justify-start items-start">
            {/* Header: Amber icon badge + Title / Patient name */}
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex justify-center items-center shrink-0"
                style={{ background: '#FEF3C7' }}
              >
                {/* Clock / Late Arrival Icon (#B45309) */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <circle cx="9" cy="9" r="6.75" stroke="#B45309" strokeWidth="1.5" />
                  <path
                    d="M9 5.5V9.25L11.75 11"
                    stroke="#B45309"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div
                    id="late-arrival-title"
                    className="justify-start text-sm font-medium leading-5"
                    style={{
                      color: '#1E293B',
                      fontFamily: "'Work Sans', sans-serif",
                    }}
                  >
                    Late Arrival
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div
                    className="justify-start text-xs font-normal leading-4 truncate max-w-[280px]"
                    style={{
                      color: '#99A1AF',
                      fontFamily: "'Work Sans', sans-serif",
                    }}
                  >
                    {patientName}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt sentence: "{Patient} arrived late for their {Time} appointment. How would you like to handle this?" */}
            <div className="self-stretch pt-3 flex flex-col justify-start items-start">
              <div
                className="w-80 justify-start leading-5"
                style={{
                  color: '#4A5565',
                  fontSize: 14,
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                <span className="font-semibold">{patientName}</span>
                <span className="font-normal"> arrived </span>
                <span className="font-semibold">late</span>
                <span className="font-normal"> for their </span>
                <span className="font-semibold">{formattedTime} appointment</span>
                <span className="font-normal">. How would you like to handle this?</span>
              </div>
            </div>

            {/* Action Cards Container */}
            <div className="self-stretch pt-4 flex flex-col justify-start items-start gap-2">
              {/* Option 1: Move to End of Queue */}
              <button
                type="button"
                onClick={() => onMoveToEndOfQueue && onMoveToEndOfQueue(appointment)}
                disabled={isSubmitting}
                className="w-80 p-3 rounded-[5px] inline-flex justify-start items-start gap-3 text-left transition-all cursor-pointer hover:bg-teal-50/50 hover:border-[#1A8A7A] disabled:opacity-50 group"
                style={{
                  border: '1.33px #E5E7EB solid',
                  background: 'white',
                }}
              >
                <div className="pt-0.5 flex justify-start items-start shrink-0">
                  {/* Teal queue / down-list arrow icon (#1A8A7A) */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path
                      d="M8 2V11M8 11L4.5 7.5M8 11L11.5 7.5"
                      stroke="#1A8A7A"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.5 13.5H13.5"
                      stroke="#1A8A7A"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="w-72 inline-flex flex-col justify-start items-start">
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div
                      className="justify-start text-xs font-medium leading-4 group-hover:text-[#1A8A7A] transition-colors"
                      style={{
                        color: '#1E293B',
                        fontFamily: "'Work Sans', sans-serif",
                      }}
                    >
                      Move to End of Queue
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div
                      className="justify-start text-xs font-normal leading-4"
                      style={{
                        color: '#99A1AF',
                        fontFamily: "'Work Sans', sans-serif",
                      }}
                    >
                      Place {patientName} at the end; others move up.
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Prompt Reschedule */}
              <button
                type="button"
                onClick={() => onPromptReschedule && onPromptReschedule(appointment)}
                disabled={isSubmitting}
                className="w-80 p-3 rounded-[5px] inline-flex justify-start items-start gap-3 text-left transition-all cursor-pointer hover:bg-violet-50/50 hover:border-[#7C3AED] disabled:opacity-50 group"
                style={{
                  border: '1.33px #E5E7EB solid',
                  background: 'white',
                }}
              >
                <div className="pt-0.5 flex justify-start items-start shrink-0">
                  {/* Violet Calendar / Reschedule icon (#7C3AED) */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#7C3AED" strokeWidth="1.33" />
                    <path d="M2 6.5H14" stroke="#7C3AED" strokeWidth="1.33" />
                    <path d="M5.2 1.5V3.5M10.8 1.5V3.5" stroke="#7C3AED" strokeWidth="1.33" strokeLinecap="round" />
                    <circle cx="8" cy="10" r="1.2" fill="#7C3AED" />
                  </svg>
                </div>
                <div className="w-72 inline-flex flex-col justify-start items-start">
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div
                      className="justify-start text-xs font-medium leading-4 group-hover:text-[#7C3AED] transition-colors"
                      style={{
                        color: '#1E293B',
                        fontFamily: "'Work Sans', sans-serif",
                      }}
                    >
                      Prompt Reschedule
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div
                      className="justify-start text-xs font-normal leading-4"
                      style={{
                        color: '#99A1AF',
                        fontFamily: "'Work Sans', sans-serif",
                      }}
                    >
                      Move to no-show and notify patient to re-book.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer: Cancel Button */}
          <div
            className="self-stretch h-16 px-6 py-4 inline-flex justify-end items-start gap-2"
            style={{
              borderTop: '1.33px #F3F4F6 solid',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-property-1="Default"
              className="flex-1 px-3.5 py-2.5 bg-white rounded-[10px] flex justify-center items-center gap-2.5 transition-colors cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              style={{
                boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.10)',
                outline: '1px rgba(0, 0, 0, 0.05) solid',
                outlineOffset: '-1px',
                border: 'none',
              }}
            >
              <div
                className="text-center justify-start text-sm font-bold leading-5"
                style={{
                  color: '#6A7282',
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                Cancel
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
