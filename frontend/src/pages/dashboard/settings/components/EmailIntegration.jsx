import { useState } from 'react';
import { useNotifications } from '../../../../context/NotificationContext';
import { testEmailWorkflow } from '../../../../api';
import assets from '../../../../assets';

const EmailIntegration = ({
  clinicData,
  emailEnabled = true,
  setEmailEnabled,
  emailFromName = 'pivodent',
  setEmailFromName,
  emailReplyTo = 'rolandomajait1@gmail.com',
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

  const clinicDisplayName = emailFromName || clinicData?.clinic_name || 'pivodent';
  const replyEmailDisplay = emailReplyTo || clinicData?.email || 'rolandomajait1@gmail.com';

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
    <div
      className="w-full p-5 rounded-2xl shadow-[0px_1px_2px_0px_rgba(15,41,64,0.04)] outline-1 -outline-offset-1 outline-[#DFE7F1] flex flex-col justify-start items-start overflow-hidden font-['Work_Sans',sans-serif]"
      style={{
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.43) 0%, rgba(213, 226, 236, 0.29) 25%, rgba(255, 13, 0, 0.13) 50%, rgba(248, 223, 78, 0.12) 75%, rgba(118, 217, 168, 0.16) 100%), #FFFFFF',
      }}
    >
      {/* Top Header matching Figma 1:1 */}
      <div className="self-stretch pb-3 flex justify-between items-center">
        <div className="flex justify-start items-center gap-2.5">
          <div className="size-8 rounded-lg flex justify-center items-center">
            <img
              src={assets.footerGmail}
              alt="Email"
              className="size-7 object-contain"
            />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-0.5">
            <div className="inline-flex justify-start items-center gap-2">
              <div className="text-teal-950 text-sm md:text-base font-semibold font-['Work_Sans'] leading-5">
                Email Notifications
              </div>
              <div className="px-2 py-0.5 bg-yellow-100 rounded-[10px] flex justify-center items-center">
                <div className="text-yellow-600 text-[11px] font-medium font-['Work_Sans']">Auto Relay</div>
              </div>
            </div>
            <div className="text-[#64748B] text-xs font-normal font-['Work_Sans'] leading-4">
              Automated confirmations and reminders with your clinic branding.
            </div>
          </div>
        </div>
        <div className="px-2.5 py-0.5 bg-green-500 rounded-[30px] flex justify-center items-center gap-2">
          <div className="text-green-100 text-xs font-medium font-['Work_Sans'] leading-4">Active</div>
        </div>
      </div>

      <div className="self-stretch h-px bg-[#DFE7F1]/60" />

      {/* Main Two-Column Row matching Figma 1:1 */}
      <div className="w-full pt-3.5 flex flex-col lg:flex-row justify-start items-stretch gap-4">
        
        {/* Left: Sender Information & Automated Patient Emails */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-xl outline-1 -outline-offset-1 outline-[#DFE7F1] overflow-hidden flex flex-col justify-between p-4 gap-4">
          <div className="self-stretch flex flex-col justify-start items-start gap-2 mb-1">
            <div className="text-slate-700 text-xs font-bold font-['Work_Sans'] uppercase leading-4">
              Sender Information
            </div>
            <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-3">
              <div className="flex-1 w-full flex flex-col justify-start items-start gap-2">
                <div className="text-slate-700 text-xs font-medium font-['Work_Sans'] leading-4">
                  Clinic Display Name
                </div>
                <div className="self-stretch h-8.5 px-3 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(15,41,64,0.04)] outline-1 -outline-offset-1 outline-[#DFE7F1] flex items-center overflow-hidden">
                  <input
                    type="text"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName && setEmailFromName(e.target.value)}
                    placeholder="pivodent"
                    className="flex-1 text-teal-950 text-xs font-normal font-['Work_Sans'] leading-5 bg-transparent outline-none"
                  />
                </div>
                <div className="text-[#64748B] text-[10.5px] font-normal font-['Work_Sans']">
                  Sender name shown to patients.
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col justify-start items-start gap-2">
                <div className="text-slate-700 text-xs font-medium font-['Work_Sans'] leading-4">
                  Clinic Reply-To Email
                </div>
                <div className="self-stretch h-8.5 px-3 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(15,41,64,0.04)] outline-1 -outline-offset-1 outline-[#DFE7F1] flex items-center overflow-hidden">
                  <input
                    type="email"
                    value={emailReplyTo}
                    onChange={(e) => setEmailReplyTo && setEmailReplyTo(e.target.value)}
                    placeholder="e.g. info@pivodent.com"
                    className="flex-1 text-slate-700 placeholder-slate-400 text-xs font-normal font-['Work_Sans'] leading-5 bg-transparent outline-none"
                  />
                </div>
                <div className="text-[#64748B] text-[10.5px] font-normal font-['Work_Sans']">
                  Where patient replies are sent.
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="text-slate-700 text-xs font-bold font-['Work_Sans'] uppercase leading-4">
              Automated Patient Emails
            </div>

            {/* Checkbox Card 1 */}
            <div
              onClick={() => setEmailConfirmationEnabled && setEmailConfirmationEnabled(!emailConfirmationEnabled)}
              className="self-stretch px-3 py-1.5 bg-slate-50 rounded-lg outline-1 -outline-offset-1 outline-[#DFE7F1] flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
            >
              <div className="size-4 bg-[#002C39] rounded-sm flex justify-center items-center shrink-0">
                <div className="text-white text-xs font-bold font-['Work_Sans']">
                  {emailConfirmationEnabled ? '✓' : ''}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start items-start">
                <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">
                  Booking Confirmation
                </div>
                <div className="text-[#64748B] text-[10.5px] font-normal font-['Work_Sans']">
                  Sent automatically once an appointment is approved.
                </div>
              </div>
            </div>

            {/* Checkbox Card 2 */}
            <div
              onClick={() => setEmailReminderEnabled && setEmailReminderEnabled(!emailReminderEnabled)}
              className="self-stretch px-3 py-1.5 bg-slate-50 rounded-lg outline-1 -outline-offset-1 outline-[#DFE7F1] flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
            >
              <div className="size-4 bg-[#002C39] rounded-sm flex justify-center items-center shrink-0">
                <div className="text-white text-xs font-bold font-['Work_Sans']">
                  {emailReminderEnabled ? '✓' : ''}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start items-start">
                <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">
                  24-Hour Visit Reminder
                </div>
                <div className="text-[#64748B] text-[10.5px] font-normal font-['Work_Sans']">
                  Sent 1 day before the visit to reduce no-shows.
                </div>
              </div>
            </div>

            {/* Master Toggle */}
            <div className="self-stretch px-3 py-1.5 bg-white rounded-lg outline-1 -outline-offset-1 outline-[#DFE7F1] flex justify-between items-center">
              <div className="flex flex-col justify-start items-start">
                <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">
                  Enable Patient Emails
                </div>
                <div className="text-[#64748B] text-[10.5px] font-normal font-['Work_Sans']">
                  Send confirmations and visit reminders
                </div>
              </div>
              <div
                onClick={() => setEmailEnabled && setEmailEnabled(!emailEnabled)}
                className={`w-11 px-0.75 py-0.5 rounded-full inline-flex flex-col justify-center transition-colors cursor-pointer shrink-0 overflow-hidden ${
                  emailEnabled ? 'bg-teal-600 items-end' : 'bg-slate-300 items-start'
                }`}
              >
                <div className="size-3.5 relative bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Email Preview Box matching Figma 1:1 */}
        <div className="w-full lg:w-133.5 bg-white rounded-xl outline-1 -outline-offset-1 outline-[#DFE7F1] overflow-hidden flex flex-col justify-between shrink-0">
          
          {/* Header */}
          <div className="w-full h-11 px-3.5 py-2.5 bg-slate-50 border-b border-[#DFE7F1] flex justify-between items-center shrink-0">
            <div className="flex justify-start items-center gap-2">
              <div className="size-5 rounded-sm flex justify-center items-center">
                <img
                  src={assets.footerGmail}
                  alt="Email"
                  className="size-4 object-contain"
                />
              </div>
              <div className="flex flex-col justify-start items-start gap-px">
                <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">
                  Email Preview
                </div>
                <div className="text-[#64748B] text-[10px] font-normal font-['Work_Sans'] leading-none">
                  Patient View
                </div>
              </div>
            </div>
            <div className="px-2.5 py-0.5 bg-green-500 rounded-[30px] flex justify-center items-center gap-1.5">
              <div className="text-green-100 text-[11px] font-medium font-['Work_Sans'] leading-none">Active</div>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="w-full px-3.5 py-2 flex flex-col justify-between flex-1 text-xs overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="self-stretch justify-start">
                <span className="text-teal-950 text-xs font-semibold font-['Work_Sans']">From:</span>
                <span className="text-[#64748B] text-xs font-normal font-['Work_Sans']"> {clinicDisplayName}</span>
              </div>
              <div className="self-stretch justify-start">
                <span className="text-teal-950 text-xs font-semibold font-['Work_Sans']">Reply-To:</span>
                <span className="text-[#64748B] text-xs font-normal font-['Work_Sans']"> {replyEmailDisplay}</span>
              </div>
              <div className="self-stretch justify-start">
                <span className="text-teal-950 text-xs font-semibold font-['Work_Sans']">Subject:</span>
                <span className="text-[#64748B] text-xs font-normal font-['Work_Sans']"> Confirmed: Appointment at {clinicDisplayName}</span>
              </div>
            </div>

            <div className="self-stretch h-px bg-[#DFE7F1]" />

            {/* Centered Logo matching Figma */}
            <div className="self-stretch flex flex-col justify-start items-center gap-2 py-0.5">
              <div className="size-8 bg-slate-50 rounded-md outline-1 -outline-offset-1 outline-[#DFE7F1] flex justify-center items-center overflow-hidden">
                <img
                  src={assets.dashboardLogo || assets.pivodentLogo}
                  alt={clinicDisplayName}
                  className="size-5 object-contain"
                />
              </div>
              <div className="text-teal-950 text-[10.5px] font-medium font-['Work_Sans']">
                {clinicDisplayName}
              </div>
            </div>

            {/* Greeting & Message */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="self-stretch justify-start">
                <span className="text-teal-950 text-xs font-normal font-['Work_Sans']">Dear </span>
                <span className="text-teal-950 text-xs font-bold font-['Work_Sans']">Patient,</span>
              </div>
              <div className="self-stretch justify-start">
                <span className="text-teal-950 text-xs font-normal font-['Work_Sans']">Your appointment has been </span>
                <span className="text-[#002C39] text-xs font-bold font-['Work_Sans']">confirmed!</span>
              </div>
            </div>

            <div className="self-stretch h-px bg-[#DFE7F1]" />

            {/* Summary Row */}
            <div className="self-stretch flex justify-between items-start">
              <div className="text-[#64748B] text-xs font-normal font-['Work_Sans']">Service</div>
              <div className="text-teal-950 text-xs font-semibold font-['Work_Sans']">Tooth Cleaning</div>
            </div>
          </div>

          {/* Test Dispatcher Input Bar matching Figma 1:1 */}
          <form
            onSubmit={handleSendTestEmail}
            className="w-full h-11 bg-slate-50 border-t border-[#DFE7F1] px-2.5 flex items-center justify-between gap-2 shrink-0"
          >
            <div className="flex-1 h-7.5 px-2.5 bg-white rounded-lg outline-1 -outline-offset-1 outline-[#DFE7F1] flex items-center">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email to test..."
                className="w-full text-slate-700 placeholder-slate-400 text-xs font-normal font-['Work_Sans'] bg-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!testEmailAddress.trim() || sendingTestEmail}
              className="px-3 py-1.5 bg-[#002C39] hover:bg-[#003b4c] rounded-lg flex justify-center items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0 disabled:opacity-40"
            >
              <div className="size-3.5 relative overflow-hidden shrink-0">
                <div className="size-3 left-[1.17px] top-[1.17px] absolute outline-1 outline-offset-[-0.50px] outline-white" />
                <div className="w-1.5 h-1 left-[5.25px] top-[2.33px] absolute outline-1 outline-offset-[-0.50px] outline-white" />
              </div>
              <span className="text-white text-xs font-bold font-['Work_Sans'] leading-4">
                {sendingTestEmail ? 'Sending...' : 'Send Test'}
              </span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default EmailIntegration;
