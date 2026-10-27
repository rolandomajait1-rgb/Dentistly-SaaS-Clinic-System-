import { useState } from 'react';
import {
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { useNotifications } from '../../../context/NotificationContext';
import { testEmailWorkflow } from '../../../api';
import assets from '../../../assets';

const EmailIntegration = ({
  clinicData,
  clinicLogo = '',
  emailEnabled = false,
  setEmailEnabled,
  emailFromName = '',
  setEmailFromName,
  emailFromAddress = '',
  emailReplyTo = '',
  setEmailReplyTo,
  emailConfirmationEnabled = true,
  setEmailConfirmationEnabled,
  emailReminderEnabled = true,
  setEmailReminderEnabled,
  emailSubjectApproved,
  emailBodyApproved,
}) => {
  const { showToast } = useNotifications();

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const activeClinicLogo = clinicLogo || clinicData?.logo_url || '';
  const clinicDisplayName = emailFromName || clinicData?.clinic_name || 'Our Dental Clinic';
  const replyEmailDisplay = emailReplyTo || emailFromAddress || clinicData?.email || 'clinic@example.com';

  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!testEmailAddress.trim()) {
      showToast('Please enter an email address to receive the test email.', 'warning');
      return;
    }

    setSendingTestEmail(true);
    try {
      await testEmailWorkflow(
        testEmailAddress.trim(),
        emailSubjectApproved || `Confirmed: Appointment at ${clinicDisplayName}`,
        emailBodyApproved || `<p>Dear Patient, your appointment at ${clinicDisplayName} has been confirmed.</p>`
      );
      showToast('Test email sent successfully! Please check your inbox.', 'success');
    } catch (err) {
      showToast('Failed to send test email: ' + (err.message || 'Please check email settings'), 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#131f1e] rounded-xl p-5 border border-[#E2E8F0] dark:border-[#223331] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-4 transition-all font-['Work_Sans',sans-serif]">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#1b2b29]">
        <div className="flex items-center gap-2.5">
          <img
            src={assets.footerGmail}
            alt="Email"
            className="w-6 h-6 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E3F39] dark:text-[#85d5c9]">
                Email Notifications
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#1A8A7A]">
                Auto Relay
              </span>
            </div>
            <p className="text-xs text-[#6A7282] dark:text-slate-400 mt-0.5">
              Automated confirmations and reminders with your clinic branding.
            </p>
          </div>
        </div>

        {emailEnabled ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Disabled
          </span>
        )}
      </div>

      {/* Main Two-Column: Settings (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left: Email Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#182625] border border-slate-200 gap-4">
          <div className="space-y-3.5">
            {/* Sender Details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E3F39] dark:text-[#85d5c9]">
                Sender Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Clinic Display Name
                  </label>
                  <input
                    type="text"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    placeholder="e.g. PIVODENT Dental Clinic"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                  />
                  <p className="text-[10.5px] text-[#6A7282] dark:text-slate-400 mt-1">Sender name shown to patients.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] dark:text-slate-300 mb-1">
                    Clinic Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={emailReplyTo}
                    onChange={(e) => setEmailReplyTo(e.target.value)}
                    placeholder="e.g. info@pivodent.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                  />
                  <p className="text-[10.5px] text-[#6A7282] dark:text-slate-400 mt-1">Where patient replies are sent.</p>
                </div>
              </div>
            </div>

            {/* Notification Triggers */}
            <div className="space-y-2 pt-2.5 border-t border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E3F39] dark:text-[#85d5c9]">
                Automated Patient Emails
              </h4>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-teal-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={emailConfirmationEnabled}
                    onChange={(e) => setEmailConfirmationEnabled(e.target.checked)}
                    className="mt-0.5 rounded text-[#1A8A7A] focus:ring-[#1A8A7A] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#1E293B] dark:text-white">Booking Confirmation</p>
                    <p className="text-xs text-[#6A7282] dark:text-slate-400 mt-0.5">
                      Sent automatically once an appointment is approved.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-teal-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={emailReminderEnabled}
                    onChange={(e) => setEmailReminderEnabled(e.target.checked)}
                    className="mt-0.5 rounded text-[#1A8A7A] focus:ring-[#1A8A7A] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#1E293B] dark:text-white">24-Hour Visit Reminder</p>
                    <p className="text-xs text-[#6A7282] dark:text-slate-400 mt-0.5">
                      Sent 1 day before the visit to reduce no-shows.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Master Switch */}
          <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#1E293B] dark:text-white">Enable Patient Emails</p>
              <p className="text-xs text-[#6A7282] dark:text-slate-400">Send confirmations and visit reminders</p>
            </div>

            <button
              type="button"
              onClick={() => setEmailEnabled(!emailEnabled)}
              className="w-[46px] p-[2px] rounded-full transition-colors flex items-center cursor-pointer shrink-0"
              style={{
                background: emailEnabled ? '#1A8A7A' : '#CECECE',
                justifyContent: emailEnabled ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="w-[16px] h-[16px] bg-white rounded-full shadow-xs" />
            </button>
          </div>
        </div>

        {/* Right: Email Preview Panel */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-[#F8FAFC] dark:bg-[#0f1716] border border-slate-200 rounded-lg flex flex-col h-full min-h-[260px] overflow-hidden">
            
            {/* Header */}
            <div className="px-3 py-2 bg-white dark:bg-[#182625] border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src={assets.footerGmail}
                  alt="Email"
                  className="w-4 h-4 object-contain shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-[#1E293B] dark:text-white leading-none">Email Preview</p>
                  <p className="text-[10px] text-[#6A7282] dark:text-slate-400 mt-0.5">Patient View</p>
                </div>
              </div>

              {emailEnabled ? (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Disabled
                </span>
              )}
            </div>

            {/* Email Card Preview */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-2 flex flex-col min-h-[150px] max-h-[210px] text-xs">
              
              {/* Meta info */}
              <div className="p-2 bg-white border border-slate-200/80 rounded-md text-[10px] text-slate-500 space-y-0.5">
                <div className="truncate"><span className="font-semibold text-slate-600">From:</span> {clinicDisplayName}</div>
                <div className="truncate"><span className="font-semibold text-slate-600">Reply-To:</span> {replyEmailDisplay}</div>
                <div className="truncate"><span className="font-semibold text-slate-600">Subject:</span> Confirmed: Appointment at {clinicDisplayName}</div>
              </div>

              {/* Email Content */}
              <div className="p-2.5 bg-white border border-slate-200/80 rounded-md space-y-2 text-[11px] text-slate-700">
                <div className="text-center pb-1.5 border-b border-slate-100">
                  {activeClinicLogo && (
                    <img
                      src={activeClinicLogo}
                      alt={clinicDisplayName}
                      className="max-h-6 max-w-[100px] object-contain mx-auto mb-0.5 rounded"
                    />
                  )}
                  <p className="font-bold text-xs text-[#1A8A7A]">{clinicDisplayName}</p>
                </div>

                <p className="leading-snug">Dear <strong>Patient</strong>,</p>
                <p className="leading-snug">Your appointment has been confirmed!</p>

                <div className="p-2 bg-teal-50/60 rounded border border-teal-100 text-[10.5px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-800">Teeth Cleaning</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date &amp; Time:</span>
                    <span className="font-bold text-teal-800">Tomorrow at 10:00 AM</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 pt-0.5">
                  Need to reschedule? Simply reply to this email.
                </p>
              </div>

            </div>

            {/* Test Email Dispatcher */}
            <form
              onSubmit={handleSendTestEmail}
              className="p-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0"
            >
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email to test..."
                className="flex-1 bg-slate-100 text-[11px] text-slate-800 px-2.5 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
              />
              <button
                type="submit"
                disabled={!testEmailAddress.trim() || sendingTestEmail}
                className="px-2.5 py-1 bg-[#1A8A7A] hover:bg-[#147063] text-white text-[11px] font-semibold rounded-full flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
              >
                <PaperPlaneTilt size={11} weight="bold" />
                <span>{sendingTestEmail ? 'Sending...' : 'Send Test'}</span>
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default EmailIntegration;
