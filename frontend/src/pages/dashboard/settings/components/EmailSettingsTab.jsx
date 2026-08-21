import { useState } from 'react';
import {
  EnvelopeSimple,
  Storefront,
  Globe,
  Bell,
  Sliders,
  GearSix,
  Lock,
  CheckCircle,
  Warning,
  PaperPlaneTilt,
  WarningCircle,
  Eye
} from '@phosphor-icons/react';
import { Toggle, FormField, Input, SectionCard } from '../../../../components/ui/SettingsPrimitives';
import { testEmailWorkflow } from '../../../../api';
import { useNotifications } from '../../../../context/NotificationContext';

export default function EmailSettingsTab({
  emailFromName, setEmailFromName,
  emailFromAddress, setEmailFromAddress,
  emailReplyTo, setEmailReplyTo,
  emailFooter, setEmailFooter,
  emailConfirmationEnabled, setEmailConfirmationEnabled,
  emailReminderEnabled, setEmailReminderEnabled,
  emailPostVisitEnabled, setEmailPostVisitEnabled,
  smtpEnabled, setSmtpEnabled,
  smtpHost, setSmtpHost,
  smtpPort, setSmtpPort,
  smtpUsername, setSmtpUsername,
  smtpPassword, setSmtpPassword,
  smtpEncryption, setSmtpEncryption,
  smtpFromAddress, setSmtpFromAddress,
  emailSubjectApproved, setEmailSubjectApproved,
  emailBodyApproved, setEmailBodyApproved,
  emailSubjectCancelled, setEmailSubjectCancelled,
  emailBodyCancelled, setEmailBodyCancelled
}) {
  const { showToast } = useNotifications();
  const [testEmailAddr, setTestEmailAddr] = useState('patient@example.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const tags = [
    '{patient_name}',
    '{clinic_name}',
    '{date}',
    '{time}',
    '{service_name}',
    '{reference}',
    '{queue_number}',
    '{clinic_address}',
    '{clinic_phone}'
  ];

  const handleInsertTag = (tag, setFn, currentVal) => {
    setFn(currentVal ? `${currentVal} ${tag}` : tag);
  };

  const renderPreview = (template) => {
    if (!template) return '';
    return template
      .replace(/{patient_name}/g, 'Maria Santos')
      .replace(/{clinic_name}/g, emailFromName || 'Bright Smile Dental')
      .replace(/{date}/g, 'Jul 24, 2026')
      .replace(/{time}/g, '09:00 AM')
      .replace(/{service_name}/g, 'Teeth Cleaning')
      .replace(/{reference}/g, 'REF-984210')
      .replace(/{queue_number}/g, '#1')
      .replace(/{reason}/g, 'Schedule adjustment')
      .replace(/{clinic_address}/g, emailFooter || '123 Dental Ave, Quezon City')
      .replace(/{clinic_phone}/g, '09171234567');
  };

  const handleRunTest = async (e) => {
    e.preventDefault();
    if (!testEmailAddr.trim()) {
      showToast('Please enter a test recipient email address.', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testEmailWorkflow(testEmailAddr, emailSubjectApproved, emailBodyApproved);
      setTestResult(res);
      if (res.success) {
        showToast('Test Email workflow dispatched successfully!', 'success');
      } else {
        showToast('Test Email failed: ' + res.detail, 'error');
      }
    } catch (err) {
      setTestResult({
        success: false,
        detail: err.message
      });
      showToast('Test Email error: ' + err.message, 'error');
    } finally {
      setIsTesting(false);
    }

  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-linear-to-r from-blue-500/10 to-teal-500/5 dark:from-blue-500/10 dark:to-teal-500/5 border border-blue-500/15 dark:border-blue-500/20 rounded-3xl p-5 flex items-start gap-4 shadow-3xs">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <EnvelopeSimple size={20} weight="bold" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-on-surface dark:text-[#f2f0ed] font-sans">Email Workflow Automation &amp; SMTP Relay</h4>
          <p className="text-xs text-on-surface-variant/70 dark:text-slate-400 mt-1 font-semibold font-sans">Automate rich HTML booking confirmations, approval letters, pre-visit reminders, and post-visit treatment summaries.</p>
        </div>
      </div>

      {/* Identity Card */}
      <SectionCard title="CLINIC IDENTITY FOR EMAIL WORKFLOW" Icon={EnvelopeSimple}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="From Name">
            <Input Icon={Storefront} type="text" value={emailFromName} onChange={e => setEmailFromName(e.target.value)} placeholder="Bright Smile Dental" />
          </FormField>
          <FormField label="From Email Address">
            <Input Icon={EnvelopeSimple} type="email" value={emailFromAddress} onChange={e => setEmailFromAddress(e.target.value)} placeholder="hello@brightsmile.ph" />
          </FormField>
          <FormField label="Reply-to Email">
            <Input Icon={EnvelopeSimple} type="email" value={emailReplyTo} onChange={e => setEmailReplyTo(e.target.value)} placeholder="appointments@brightsmile.ph" />
          </FormField>
          <FormField label="Email Footer (Clinic Address)">
            <Input Icon={Globe} type="text" value={emailFooter} onChange={e => setEmailFooter(e.target.value)} placeholder="123 Dental Ave, Quezon City" />
          </FormField>
        </div>
      </SectionCard>

      {/* Workflow Toggles */}
      <SectionCard title="EMAIL WORKFLOW TRIGGERS" Icon={Bell}>
        <div className="divide-y divide-outline-variant/30 dark:divide-[#1b2b29]">
          <div className="flex items-center justify-between py-4.5 first:pt-0">
            <div>
              <h4 className="text-sm font-extrabold text-on-surface dark:text-[#f2f0ed] font-sans">Booking Confirmation Workflow</h4>
              <p className="text-[11px] font-bold text-on-surface-variant/70 dark:text-slate-455 mt-0.5 font-sans">Send confirmation receipt immediately after booking.</p>
            </div>
            <Toggle checked={emailConfirmationEnabled} onChange={setEmailConfirmationEnabled} />
          </div>
          <div className="flex items-center justify-between py-4.5">
            <div>
              <h4 className="text-sm font-extrabold text-on-surface dark:text-[#f2f0ed] font-sans">Appointment Reminder Workflow</h4>
              <p className="text-[11px] font-bold text-on-surface-variant/70 dark:text-slate-455 mt-0.5 font-sans">Send transactional alert reminder 24-48 hours before scheduled slots.</p>
            </div>
            <Toggle checked={emailReminderEnabled} onChange={setEmailReminderEnabled} />
          </div>
          <div className="flex items-center justify-between py-4.5 last:pb-0">
            <div>
              <h4 className="text-sm font-extrabold text-on-surface dark:text-[#f2f0ed] font-sans">Post-visit Summary Workflow</h4>
              <p className="text-[11px] font-bold text-on-surface-variant/70 dark:text-slate-455 mt-0.5 font-sans">Send automated summary &amp; treatment instructions after checkout.</p>
            </div>
            <Toggle checked={emailPostVisitEnabled} onChange={setEmailPostVisitEnabled} />
          </div>
        </div>
      </SectionCard>

      {/* Interactive Email Workflow Test Drawer */}
      <SectionCard title="LIVE EMAIL WORKFLOW TESTER" Icon={PaperPlaneTilt}>
        <form onSubmit={handleRunTest} className="space-y-4">
          <p className="text-xs font-semibold text-on-surface-variant/80 dark:text-slate-300 font-sans">
            Dispatch an instant test Email workflow to verify your SMTP server setup and email template layout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="email"
              value={testEmailAddr}
              onChange={e => setTestEmailAddr(e.target.value)}
              placeholder="patient@example.com"
              className="px-4 py-2.5 bg-slate-50 dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-xs font-bold font-mono focus:outline-none focus:border-blue-500 flex-1"
            />
            <button
              type="submit"
              disabled={isTesting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <PaperPlaneTilt size={16} weight="bold" />
              {isTesting ? 'Sending Email Test...' : 'Run Test Email Workflow'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs font-sans space-y-1.5 animate-fadeIn ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? <CheckCircle size={16} weight="bold" /> : <WarningCircle size={16} weight="bold" />}
                <span>{testResult.success ? 'Email Dispatch Verified!' : 'Dispatch Error'}</span>
              </div>
              <p className="font-mono text-[11px] opacity-90">{testResult.detail}</p>
            </div>
          )}
        </form>
      </SectionCard>

      {/* Custom SMTP & Templates Details */}
      <details open className="group border border-outline-variant/60 dark:border-[#1b2b29] bg-white dark:bg-[#131f1e] rounded-3xl overflow-hidden shadow-3xs transition-all duration-300">
        <summary className="px-6 py-4.5 flex items-center justify-between text-sm font-extrabold text-on-surface dark:text-[#f2f0ed] bg-slate-50 dark:bg-[#182625] cursor-pointer list-none select-none hover:bg-slate-100/50 dark:hover:bg-[#213533] transition-all duration-300 border-b border-transparent group-open:border-outline-variant/40 dark:group-open:border-[#1b2b29]">
          <span className="flex items-center gap-2.5 font-sans">
            <Sliders size={18} className="text-on-surface-variant/60 dark:text-slate-400" />
            Custom SMTP &amp; Email Templates
          </span>
          <span className="material-symbols-outlined text-on-surface-variant/60 dark:text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
        </summary>

        <div className="p-6 space-y-6 text-on-surface dark:text-[#f2f0ed]">
          {/* SMTP Config */}
          <div className="bg-slate-50/50 dark:bg-[#182625] p-5 rounded-2xl border border-outline-variant/50 dark:border-[#213533] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-on-surface dark:text-[#f2f0ed] uppercase tracking-wider font-sans">Use Custom SMTP Mail Server</h4>
                <p className="text-[11px] font-bold text-on-surface-variant/70 dark:text-slate-400 mt-0.5 font-sans">Send transactional emails via your own server credentials.</p>
              </div>
              <Toggle checked={smtpEnabled} onChange={setSmtpEnabled} />
            </div>
            {smtpEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-outline-variant/40 dark:border-[#213533] animate-fadeIn">
                <FormField label="SMTP Host">
                  <Input Icon={Globe} type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.mailtrap.io" />
                </FormField>
                <FormField label="SMTP Port">
                  <Input Icon={GearSix} type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" />
                </FormField>
                <FormField label="SMTP Username">
                  <Input Icon={EnvelopeSimple} type="text" value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} placeholder="username" />
                </FormField>
                <FormField label="SMTP Password">
                  <Input Icon={Lock} type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••" />
                </FormField>
                <FormField label="SMTP Encryption">
                  <select
                    value={smtpEncryption}
                    onChange={e => setSmtpEncryption(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold bg-white dark:bg-[#182625] border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-205 cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </FormField>
                <FormField label="From Email Address (Override)">
                  <Input Icon={EnvelopeSimple} type="email" value={smtpFromAddress} onChange={e => setSmtpFromAddress(e.target.value)} placeholder="noreply@myclinic.com" />
                </FormField>
              </div>
            )}
          </div>

          {/* Quick Tag Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant/70 dark:text-slate-400 font-sans">Click Tag to Quick Insert into Approved Body:</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleInsertTag(t, setEmailBodyApproved, emailBodyApproved)}
                  className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer border border-blue-500/20"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <div className="bg-slate-50/50 dark:bg-[#182625] p-5 rounded-2xl border border-outline-variant/50 dark:border-[#213533] space-y-3">
              <p className="text-[10px] font-black text-primary dark:text-inverse-primary uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <CheckCircle size={13} weight="bold" />
                Approved Email Template
              </p>
              <FormField label="Email Subject">
                <Input type="text" value={emailSubjectApproved} onChange={e => setEmailSubjectApproved(e.target.value)} />
              </FormField>
              <FormField label="Email Body (HTML allowed)">
                <textarea
                  className="w-full p-3.5 bg-white dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-[11px] font-mono focus:outline-none focus:bg-slate-50 dark:focus:bg-[#131f1e] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  rows="4"
                  value={emailBodyApproved}
                  onChange={e => setEmailBodyApproved(e.target.value)}
                />
              </FormField>

              {/* HTML Live Preview Box */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-sans">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Eye size={16} />
                  <span>Live Rendered Email Layout Preview:</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <p className="font-bold text-sm text-slate-900 dark:text-white mb-2">Subject: {renderPreview(emailSubjectApproved)}</p>
                  <hr className="my-2 border-slate-200 dark:border-slate-800" />
                  <div 
                    className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderPreview(emailBodyApproved) }}
                  />
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic font-mono">
                    Footer: {emailFooter || '123 Dental Ave, Quezon City'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-[#182625] p-5 rounded-2xl border border-outline-variant/50 dark:border-[#213533] space-y-3">
              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Warning size={13} weight="bold" />
                Cancelled Email Template
              </p>
              <FormField label="Email Subject">
                <Input type="text" value={emailSubjectCancelled} onChange={e => setEmailSubjectCancelled(e.target.value)} />
              </FormField>
              <FormField label="Email Body (HTML allowed)">
                <textarea
                  className="w-full p-3.5 bg-white dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-[11px] font-mono focus:outline-none focus:bg-slate-50 dark:focus:bg-[#131f1e] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all font-semibold"
                  rows="4"
                  value={emailBodyCancelled}
                  onChange={e => setEmailBodyCancelled(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
