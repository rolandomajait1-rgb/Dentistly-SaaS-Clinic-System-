import { useState } from 'react';
import {
  EnvelopeSimple,
  CheckCircle,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { useNotifications } from '../../../context/NotificationContext';
import { testEmailWorkflow } from '../../../api';

const EmailIntegration = ({
  clinicData,
  clinicLogo = '',
  emailEnabled = false,
  setEmailEnabled,
  emailFromName = '',
  setEmailFromName,
  emailFromAddress = '',
  setEmailFromAddress,
  emailReplyTo = '',
  setEmailReplyTo,
  emailConfirmationEnabled = true,
  setEmailConfirmationEnabled,
  emailReminderEnabled = true,
  setEmailReminderEnabled,
  smtpHost = '',
  setSmtpHost,
  smtpPort = '587',
  setSmtpPort,
  smtpUsername = '',
  setSmtpUsername,
  smtpPassword = '',
  setSmtpPassword,
  smtpEncryption = 'tls',
  setSmtpEncryption,
  emailSubjectApproved,
  emailBodyApproved,
}) => {
  const { showToast } = useNotifications();

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const activeClinicLogo = clinicLogo || clinicData?.logo_url || '';
  const clinicDisplayName = emailFromName || clinicData?.clinic_name || 'PIVODENT Dental Clinic';
  const replyEmailDisplay = emailReplyTo || emailFromAddress || clinicData?.email || 'clinic@pivodent.com';

  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!testEmailAddress.trim()) {
      showToast('Please enter your email address to receive the test email.', 'warning');
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
    <div
      className="w-full bg-white dark:bg-[#131f1e] rounded-[12px] p-5 flex flex-col gap-4 transition-all shadow-xs border border-slate-200/80 dark:border-[#213533] font-sans"
      style={{
        outline: '1.33px rgba(14, 63, 57, 0.15) solid',
        outlineOffset: '-1.33px',
      }}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1b2b29]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#1A8A7A] flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800">
            <EnvelopeSimple size={18} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Email Notifications
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                Zero-IT Setup (Auto Relay)
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Automated patient emails with your Clinic Name, Logo, and replies routed directly to your inbox.
            </p>
          </div>
        </div>

        {/* Single Authoritative Status Badge */}
        {emailEnabled ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Disabled
          </span>
        )}
      </div>

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Simple Clinic Email Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div className="p-5 sm:p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#182625] border border-slate-200/80 dark:border-[#213533] flex flex-col justify-between h-full gap-5">
            
            <div className="space-y-4.5">
              
              {/* 1. Clinic Sender Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                  Sender Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Clinic Display Name
                    </label>
                    <input
                      type="text"
                      value={emailFromName}
                      onChange={(e) => setEmailFromName(e.target.value)}
                      placeholder="e.g. PIVODENT Dental Clinic"
                      className="w-full px-3 py-2 bg-white dark:bg-[#131f1e] border border-slate-200 dark:border-[#213533] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Pangalan ng clinic na makikita ng pasyente.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Clinic Reply-To Email
                    </label>
                    <input
                      type="email"
                      value={emailReplyTo}
                      onChange={(e) => setEmailReplyTo(e.target.value)}
                      placeholder="e.g. info@pivodent.com"
                      className="w-full px-3 py-2 bg-white dark:bg-[#131f1e] border border-slate-200 dark:border-[#213533] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Dito papasok ang email kapag nag-reply ang pasyente.</p>
                  </div>
                </div>
              </div>

              {/* 2. Automated Email Triggers */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-[#213533]">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                  Automated Patient Emails
                </h4>

                <div className="space-y-2">
                  {/* Trigger 1 */}
                  <label className="flex items-start gap-3 p-3 bg-white dark:bg-[#131f1e] rounded-xl border border-slate-200/70 dark:border-[#213533] cursor-pointer hover:border-teal-500/40 transition-all">
                    <input
                      type="checkbox"
                      checked={emailConfirmationEnabled}
                      onChange={(e) => setEmailConfirmationEnabled(e.target.checked)}
                      className="mt-0.5 rounded text-[#1A8A7A] focus:ring-[#1A8A7A] w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Appointment Confirmation Email
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Awtomatikong ipapadala sa pasyente kapag na-approve ang booking schedule.
                      </p>
                    </div>
                  </label>

                  {/* Trigger 2 */}
                  <label className="flex items-start gap-3 p-3 bg-white dark:bg-[#131f1e] rounded-xl border border-slate-200/70 dark:border-[#213533] cursor-pointer hover:border-teal-500/40 transition-all">
                    <input
                      type="checkbox"
                      checked={emailReminderEnabled}
                      onChange={(e) => setEmailReminderEnabled(e.target.checked)}
                      className="mt-0.5 rounded text-[#1A8A7A] focus:ring-[#1A8A7A] w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        24-Hour Visit Reminder
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ipapadala 1 araw bago ang appointment para maiwasan ang no-show ng pasyente.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Bottom Row: Master Switch */}
            <div className="pt-3.5 border-t border-slate-200/70 dark:border-[#213533] flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Enable Patient Email Notifications
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Awtomatikong magpapadala ng confirmation at reminder emails
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEmailEnabled(!emailEnabled)}
                className="w-[50px] p-[2.5px] rounded-full transition-colors flex items-center cursor-pointer shrink-0"
                style={{
                  background: emailEnabled ? '#1A8A7A' : '#CECECE',
                  justifyContent: emailEnabled ? 'flex-end' : 'flex-start',
                }}
              >
                <div className="w-[16px] h-[16px] bg-white rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.15)]" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Live Patient Email Preview & Test Sender */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-[#F8FAFC] dark:bg-[#0f1716] border border-slate-200 dark:border-[#1b2b29] rounded-xl flex flex-col h-full min-h-[350px] overflow-hidden">
            
            {/* Preview Header */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-[#182625] border-b border-slate-200/80 dark:border-[#1b2b29] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1A8A7A] text-white flex items-center justify-center text-[10px] font-bold">
                  @
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">Email Preview</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Patient View</p>
                </div>
              </div>

              {emailEnabled ? (
                <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  Disabled
                </span>
              )}
            </div>

            {/* Email Body Preview */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 flex flex-col min-h-[220px]">
              
              {/* Envelope Meta Header */}
              <div className="p-2.5 bg-white dark:bg-[#182625] rounded-lg border border-slate-200/70 dark:border-[#213533] space-y-1 shadow-3xs">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-500">From:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
                    {clinicDisplayName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-500">Reply-To:</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate">
                    {replyEmailDisplay}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Subject:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                    Confirmed: Appointment at {clinicDisplayName}
                  </span>
                </div>
              </div>

              {/* Email Content Card */}
              <div className="p-3.5 bg-white dark:bg-[#182625] rounded-lg border border-slate-200/70 dark:border-[#213533] space-y-3 shadow-3xs text-xs text-slate-700 dark:text-slate-300">
                <div className="flex flex-col items-center justify-center text-center pb-2.5 border-b border-slate-100 dark:border-[#213533] gap-1">
                  {activeClinicLogo && (
                    <img
                      src={activeClinicLogo}
                      alt={clinicDisplayName}
                      className="max-h-8 max-w-[130px] object-contain mb-0.5 rounded"
                    />
                  )}
                  <span className="font-extrabold text-xs text-[#1A8A7A]">
                    {clinicDisplayName}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-medium">
                    {clinicData?.address || 'Dental Clinic Auto-Notification'}
                  </span>
                </div>

                <p className="text-[11.5px] leading-relaxed">
                  Dear <strong>Maria Santos</strong>,
                </p>
                <p className="text-[11.5px] leading-relaxed">
                  Your appointment has been successfully scheduled and confirmed!
                </p>

                {/* Appointment Detail Badge */}
                <div className="p-2.5 bg-teal-50/60 dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-900/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Teeth Cleaning (Oral Prophylaxis)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Date &amp; Time:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-300">Tomorrow at 10:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Clinic Address:</span>
                    <span className="text-slate-700 dark:text-slate-300">{clinicData?.address || '123 Dental Avenue, Makati City'}</span>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-relaxed pt-1">
                  See you soon! Kung kailangan magpa-reschedule, maaari kayong mag-reply sa email na ito.
                </p>
              </div>

            </div>

            {/* Test Email Dispatcher Form (Anchored at the bottom) */}
            <form
              onSubmit={handleSendTestEmail}
              className="p-2 bg-white dark:bg-[#182625] border-t border-slate-200/80 dark:border-[#1b2b29] flex items-center gap-2 shrink-0"
            >
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter your email to test..."
                className="flex-1 bg-slate-100 dark:bg-[#131f1e] text-[11px] text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
              />
              <button
                type="submit"
                disabled={!testEmailAddress.trim() || sendingTestEmail}
                className="px-3.5 py-1.5 bg-[#1A8A7A] hover:bg-[#157265] active:bg-[#0E3F39] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all shrink-0"
              >
                <PaperPlaneTilt size={12} weight="bold" />
                <span>{sendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default EmailIntegration;
