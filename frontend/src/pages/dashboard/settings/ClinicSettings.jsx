import { useState, useEffect, useCallback, useRef } from 'react';
import { getSettings, updateSettings, getServices, addService, deleteService, updateService, testEmailWorkflow } from '../../../api';
import FacebookIntegration from './FacebookIntegration';
import EmailIntegration from './EmailIntegration';
import { useNotifications } from '../../../context/NotificationContext';
import {
  FloppyDisk,
  CheckCircle,
  Plus,
  Trash,
  PencilSimple,
  Check,
  X,
  Clock,
  PaperPlaneTilt,
  Camera,
  ArrowsClockwise,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import assets from '../../../assets';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const DEFAULT_OPERATING_HOURS = {
  monday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  tuesday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  wednesday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  thursday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  friday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  saturday: { enabled: true, open: '08:00 AM', close: '05:00 PM' },
  sunday: { enabled: false, open: '08:00 AM', close: '05:00 PM' },
};

const TIME_OPTIONS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '10:00 PM'
];

export default function ClinicSettings({ onClinicUpdate, onLaunchWizard }) {
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);

  // Active Sub-Tab: general, commu, schedule, cancel, services
  const [activeSubTab, setActiveSubTab] = useState(() => {
    const saved = localStorage.getItem('active_settings_subtab');
    return saved || 'general';
  });

  const handleSubTabChange = (tabId) => {
    setActiveSubTab(tabId);
    localStorage.setItem('active_settings_subtab', tabId);
  };

  // Base Clinic States (Tab 1: General Info)
  const [clinicName, setClinicName] = useState('PIVODENT');
  const [clinicTagline, setClinicTagline] = useState('Dental Clinic');
  const [clinicPhone, setClinicPhone] = useState('+63 92 8123 4567');
  const [clinicEmail, setClinicEmail] = useState('info@pivodent.com');
  const [clinicWebsite, setClinicWebsite] = useState('www.pivodent.com');
  const [clinicAddress, setClinicAddress] = useState('123 Dental Avenue, Makati City, Metro Manila');
  const [clinicLogo, setClinicLogo] = useState('');
  const [clinicData, setClinicData] = useState(null);

  // Tab 2: Communication Channels
  const [messengerEnabled, setMessengerEnabled] = useState(true);
  const [messengerHandle, setMessengerHandle] = useState('');

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailFromName, setEmailFromName] = useState('');
  const [emailFromAddress, setEmailFromAddress] = useState('');
  const [emailReplyTo, setEmailReplyTo] = useState('');
  const [emailFooter, setEmailFooter] = useState('');
  const [emailConfirmationEnabled, setEmailConfirmationEnabled] = useState(true);
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(true);
  const [emailPostVisitEnabled, setEmailPostVisitEnabled] = useState(false);
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('tls');
  const [smtpFromAddress, setSmtpFromAddress] = useState('');
  const [emailSubjectApproved, setEmailSubjectApproved] = useState('');
  const [emailBodyApproved, setEmailBodyApproved] = useState('');
  const [emailSubjectCancelled, setEmailSubjectCancelled] = useState('');
  const [emailBodyCancelled, setEmailBodyCancelled] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Tab 3: Schedule & Booking Rules
  const [bufferTime, setBufferTime] = useState('30 minutes');
  const [dailyCap, setDailyCap] = useState(1);
  const [advanceLimit, setAdvanceLimit] = useState('4 weeks');
  const [allowSameDay, setAllowSameDay] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [availableRooms, setAvailableRooms] = useState(2);
  const [operatingHours, setOperatingHours] = useState(DEFAULT_OPERATING_HOURS);
  const [bookingPolicyNotice, setBookingPolicyNotice] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Tab 4: Cancellation & No-Show
  const [cancellationLockWindow, setCancellationLockWindow] = useState(1);
  const [noShowGracePeriod, setNoShowGracePeriod] = useState(1);
  const [autoFlagNoShow, setAutoFlagNoShow] = useState(true);
  const [repeatNoShowThreshold, setRepeatNoShowThreshold] = useState(1);

  // Tab 5: Services & Pricing
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceName, setEditingServiceName] = useState('');
  const [editingServicePrice, setEditingServicePrice] = useState('');
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  // General Status
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettingsData = useCallback(async () => {
    try {
      const data = await getSettings();
      setClinicData(data);
      setClinicName(data.clinic_name || 'PIVODENT');
      setClinicPhone(data.contact_number || '+63 92 8123 4567');
      setClinicEmail(data.email || 'info@pivodent.com');
      setClinicAddress(data.address || '123 Dental Avenue, Makati City, Metro Manila');
      setClinicLogo(data.logo_url || '');

      const branding = data.branding_settings || {};
      setClinicTagline(branding.tagline || 'Dental Clinic');
      setClinicWebsite(branding.website || 'www.pivodent.com');
      if (branding.logo_url && !data.logo_url) {
        setClinicLogo(branding.logo_url);
      }

      const notifSettings = data.notification_settings || {};

      // Channels
      const isFbActive = Boolean(data.fb_page_integration?.is_active && data.fb_page_integration?.fb_page_id);
      setMessengerEnabled(notifSettings.messenger_enabled ?? isFbActive);
      setMessengerHandle(isFbActive ? (data.fb_page_integration?.fb_page_name || '') : '');
      setEmailEnabled(notifSettings.email_enabled ?? false);

      // Email Settings
      setEmailFromName(notifSettings.email_from_name ?? data.clinic_name ?? 'PIVODENT');
      setEmailFromAddress(notifSettings.email_from_address ?? notifSettings.smtp_from_address ?? data.email ?? 'info@pivodent.com');
      setEmailReplyTo(notifSettings.email_reply_to ?? '');
      setEmailFooter(notifSettings.email_footer ?? data.address ?? '');
      setEmailConfirmationEnabled(notifSettings.email_confirmation_enabled ?? true);
      setEmailReminderEnabled(notifSettings.email_reminder_enabled ?? true);
      setEmailPostVisitEnabled(notifSettings.email_post_visit_enabled ?? false);
      setEmailSubjectApproved(notifSettings.email_subject_approved ?? "Confirmed: Your Appointment at {clinic_name}");
      setEmailBodyApproved(notifSettings.email_body_approved ?? "<p>Dear {patient_name}, your appointment is confirmed for {date} at {time}.</p>");
      setEmailSubjectCancelled(notifSettings.email_subject_cancelled ?? "Cancelled: Your Appointment at {clinic_name}");
      setEmailBodyCancelled(notifSettings.email_body_cancelled ?? "<p>Dear {patient_name}, your appointment has been cancelled. {reason}</p>");

      // SMTP
      setSmtpEnabled(notifSettings.smtp_enabled ?? false);
      setSmtpHost(notifSettings.smtp_host ?? '');
      setSmtpPort(notifSettings.smtp_port ?? '587');
      setSmtpUsername(notifSettings.smtp_username ?? '');
      setSmtpPassword(notifSettings.smtp_password ?? '');
      setSmtpEncryption(notifSettings.smtp_encryption ?? 'tls');
      setSmtpFromAddress(notifSettings.smtp_from_address ?? '');

      // Schedule & Booking Rules
      setBufferTime(notifSettings.buffer_time ?? '30 minutes');
      setDailyCap(Number(notifSettings.daily_appointment_cap ?? 1));
      setAdvanceLimit(notifSettings.advance_booking_limit ?? '4 weeks');
      setAllowSameDay(notifSettings.allow_same_day_booking ?? true);
      setAutoConfirm(notifSettings.auto_confirm_appointments ?? true);
      setAvailableRooms(Number(notifSettings.available_rooms ?? 2));
      setBookingPolicyNotice(notifSettings.booking_policy_notice ?? '');

      // Operating Hours
      if (data.operating_hours && typeof data.operating_hours === 'object') {
        setOperatingHours({ ...DEFAULT_OPERATING_HOURS, ...data.operating_hours });
      }

      // Cancellation & No-Show
      setCancellationLockWindow(Number(notifSettings.cancellation_lock_window_hours ?? 1));
      setNoShowGracePeriod(Number(notifSettings.no_show_grace_period_minutes ?? 1));
      setAutoFlagNoShow(notifSettings.auto_flag_no_shows ?? true);
      setRepeatNoShowThreshold(Number(notifSettings.repeat_no_show_threshold ?? 1));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  }, []);

  const fetchServicesList = useCallback(async () => {
    try {
      const data = await getServices();
      setServices(data || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchSettingsData(), fetchServicesList()]);
      setIsLoading(false);
    };
    init();
  }, [fetchSettingsData, fetchServicesList]);

  // Handle Logo Upload via FileReader
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setClinicLogo(reader.result);
      showToast('Logo uploaded. Click Save Changes to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Operating Hours updater
  const updateDayHours = (dayId, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  // Main Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        clinic_name: clinicName,
        contact_number: clinicPhone,
        address: clinicAddress,
        email: clinicEmail,
        logo_url: clinicLogo,
        branding_settings: {
          tagline: clinicTagline,
          website: clinicWebsite,
          logo_url: clinicLogo,
        },
        operating_hours: operatingHours,
        notification_settings: {
          messenger_enabled: messengerEnabled,
          messenger_handle: messengerHandle,
          email_enabled: emailEnabled,

          // Granular Email
          email_from_name: emailFromName,
          email_from_address: emailFromAddress,
          email_reply_to: emailReplyTo,
          email_footer: emailFooter,
          email_confirmation_enabled: emailConfirmationEnabled,
          email_reminder_enabled: emailReminderEnabled,
          email_post_visit_enabled: emailPostVisitEnabled,
          email_subject_approved: emailSubjectApproved,
          email_body_approved: emailBodyApproved,
          email_subject_cancelled: emailSubjectCancelled,
          email_body_cancelled: emailBodyCancelled,

          // SMTP
          smtp_enabled: smtpEnabled,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_username: smtpUsername,
          smtp_password: smtpPassword,
          smtp_encryption: smtpEncryption,
          smtp_from_address: smtpFromAddress,

          // Schedule & Booking Rules
          buffer_time: bufferTime,
          daily_appointment_cap: dailyCap,
          advance_booking_limit: advanceLimit,
          allow_same_day_booking: allowSameDay,
          auto_confirm_appointments: autoConfirm,
          available_rooms: availableRooms,
          booking_policy_notice: bookingPolicyNotice,

          // Cancellation & No-Show
          cancellation_lock_window_hours: cancellationLockWindow,
          no_show_grace_period_minutes: noShowGracePeriod,
          auto_flag_no_shows: autoFlagNoShow,
          repeat_no_show_threshold: repeatNoShowThreshold,
        },
      };

      const response = await updateSettings(payload);
      if (onClinicUpdate) {
        onClinicUpdate(response.clinic);
      }
      setClinicData(response.clinic);
      setSaveSuccess(true);
      showToast('Clinic settings updated successfully!', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      showToast('Error saving settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Email dispatcher
  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      showToast('Please enter an email address for testing.', 'warning');
      return;
    }
    setSendingTestEmail(true);
    try {
      await testEmailWorkflow(testEmailAddress, emailSubjectApproved, emailBodyApproved);
      showToast('Test email sent successfully!', 'success');
    } catch (err) {
      showToast('Failed to send test email: ' + err.message, 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Services Catalog handlers
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;
    try {
      await addService(newServiceName.trim(), parseFloat(newServicePrice));
      showToast('Treatment added to catalog.', 'success');
      setNewServiceName('');
      setNewServicePrice('');
      setShowAddForm(false);
      await fetchServicesList();
    } catch (err) {
      showToast('Error adding treatment: ' + err.message, 'error');
    }
  };

  const startEditing = (svc) => {
    setEditingServiceId(svc.id);
    setEditingServiceName(svc.service_name);
    setEditingServicePrice(svc.price);
  };

  const saveInlineEdit = async (svc) => {
    if (editingServiceId !== svc.id) return;
    const nameToSave = editingServiceName.trim();
    const priceToSave = parseFloat(editingServicePrice);

    if (!nameToSave || isNaN(priceToSave)) {
      setEditingServiceId(null);
      return;
    }

    if (nameToSave !== svc.service_name || priceToSave !== svc.price) {
      try {
        await updateService(svc.id, nameToSave, priceToSave);
        showToast('Treatment updated.', 'success');
        await fetchServicesList();
      } catch (err) {
        showToast('Error updating treatment: ' + err.message, 'error');
      }
    }
    setEditingServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4 min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0E3F39] animate-spin" />
        <p className="text-sm font-semibold font-['Work_Sans'] text-[#0E3F39]">Loading clinic settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#F0F4F3] p-4 md:p-6 flex flex-col font-['Work_Sans',sans-serif]">
      
      {/* Hidden File Input for Logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main Settings Body Container */}
      <div className="w-full flex-1 flex flex-col md:flex-row items-start gap-4">
        
        {/* Left Sub-Sidebar (220px) */}
        <div
          className="w-full md:w-[220px] shrink-0 bg-[#F0F4F3] rounded-[10px] p-2 flex flex-col gap-2.5"
          style={{
            boxShadow: '0px 0px 8.7px rgba(78, 78, 78, 0.21)',
            outline: '1px white solid',
            outlineOffset: '-1px',
          }}
        >
          {/* 1. General Info */}
          <button
            type="button"
            onClick={() => handleSubTabChange('general')}
            className="w-full px-4 py-2.5 rounded-[10px] flex items-center gap-2.5 transition-all text-left cursor-pointer"
            style={{
              background: activeSubTab === 'general' ? '#E2ECE9' : 'transparent',
            }}
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.86" y="1.25" width="11.27" height="12.50" rx="1.5" stroke="#6A7282" strokeWidth="1.25"/>
                <circle cx="7.5" cy="7.5" r="2.5" stroke="#6A7282" strokeWidth="1.25"/>
              </svg>
            </div>
            <span
              style={{
                color: activeSubTab === 'general' ? '#0E3F39' : '#6A7282',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: activeSubTab === 'general' ? '600' : '500',
                lineHeight: '16px',
              }}
            >
              General Info
            </span>
          </button>

          {/* 2. Communication Channels */}
          <button
            type="button"
            onClick={() => handleSubTabChange('commu')}
            className="w-full px-4 py-2.5 rounded-[10px] flex items-center gap-2.5 transition-all text-left cursor-pointer"
            style={{
              background: activeSubTab === 'commu' ? '#E2ECE9' : 'transparent',
            }}
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.88" y="1.88" width="11.25" height="11.25" rx="2" stroke="#6A7282" strokeWidth="1.25"/>
                <path d="M4 5.5H11M4 8.5H9" stroke="#6A7282" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              style={{
                color: activeSubTab === 'commu' ? '#0E3F39' : '#6A7282',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: activeSubTab === 'commu' ? '600' : '500',
                lineHeight: '16px',
              }}
            >
              Communication Channels
            </span>
          </button>

          {/* 3. Schedule & Booking Rules */}
          <button
            type="button"
            onClick={() => handleSubTabChange('schedule')}
            className="w-full px-4 py-2.5 rounded-[10px] flex items-center gap-2.5 transition-all text-left cursor-pointer"
            style={{
              background: activeSubTab === 'schedule' ? '#E2ECE9' : 'transparent',
            }}
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.88" y="2.50" width="11.25" height="11.25" rx="2" stroke="#6A7282" strokeWidth="1.25"/>
                <path d="M4.5 1.5V3.5M10.5 1.5V3.5M1.88 5.5H13.13" stroke="#6A7282" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              style={{
                color: activeSubTab === 'schedule' ? '#0E3F39' : '#6A7282',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: activeSubTab === 'schedule' ? '600' : '500',
                lineHeight: '16px',
              }}
            >
              Schedule &amp; Booking Rules
            </span>
          </button>

          {/* 4. Cancellation & No-show */}
          <button
            type="button"
            onClick={() => handleSubTabChange('cancel')}
            className="w-full px-4 py-2.5 rounded-[10px] flex items-center gap-2.5 transition-all text-left cursor-pointer"
            style={{
              background: activeSubTab === 'cancel' ? '#E2ECE9' : 'transparent',
            }}
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.24" y="1.87" width="12.51" height="11.26" rx="2" stroke="#6A7282" strokeWidth="1.25"/>
                <path d="M5.5 5.5L9.5 9.5M9.5 5.5L5.5 9.5" stroke="#6A7282" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              style={{
                color: activeSubTab === 'cancel' ? '#0E3F39' : '#6A7282',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: activeSubTab === 'cancel' ? '600' : '500',
                lineHeight: '16px',
              }}
            >
              Cancellation &amp; No-show
            </span>
          </button>

          {/* 5. Services & Pricing */}
          <button
            type="button"
            onClick={() => handleSubTabChange('services')}
            className="w-full px-4 py-2.5 rounded-[10px] flex items-center gap-2.5 transition-all text-left cursor-pointer"
            style={{
              background: activeSubTab === 'services' ? '#E2ECE9' : 'transparent',
            }}
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3.75 3.13H11.25V11.88L7.5 10L3.75 11.88V3.13Z" stroke="#6A7282" strokeWidth="1.25" strokeLinejoin="round"/>
              </svg>
            </div>
            <span
              style={{
                color: activeSubTab === 'services' ? '#0E3F39' : '#6A7282',
                fontSize: 12,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: activeSubTab === 'services' ? '600' : '500',
                lineHeight: '16px',
              }}
            >
              Services &amp; Pricing
            </span>
          </button>
        </div>

        {/* Right Content Panel (flex-1) */}
        <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
          
          {/* Action / Save Bar */}
          <div className="w-full flex items-center justify-between bg-white rounded-[10px] p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#99A1AF] uppercase tracking-wider">Settings Panel:</span>
              <span className="text-sm font-bold text-[#0E3F39]">
                {activeSubTab === 'general' && 'General Information & Branding'}
                {activeSubTab === 'commu' && 'Patient Communication Channels'}
                {activeSubTab === 'schedule' && 'Schedule & Booking Rules'}
                {activeSubTab === 'cancel' && 'Cancellation & No-show Policies'}
                {activeSubTab === 'services' && 'Treatment Services & Pricing Catalog'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onLaunchWizard && (
                <button
                  type="button"
                  onClick={onLaunchWizard}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <ArrowsClockwise size={14} />
                  Setup Wizard
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-600'
                    : 'bg-[#1A8A7A] hover:bg-[#147063] active:scale-98'
                } disabled:opacity-50`}
              >
                {saveSuccess ? (
                  <>
                    <Check size={15} weight="bold" />
                    Saved!
                  </>
                ) : (
                  <>
                    <FloppyDisk size={15} weight="bold" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: GENERAL INFO */}
          {/* ========================================================================= */}
          {activeSubTab === 'general' && (
            <div className="w-full flex flex-col gap-4 animate-fadeIn">
              {/* Clinic Logo Card */}
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col gap-3"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  outline: '1.33px #F3F4F6 solid',
                  outlineOffset: '-1.33px',
                }}
              >
                <div
                  style={{
                    color: '#99A1AF',
                    fontSize: 12,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '700',
                    lineHeight: '16px',
                  }}
                >
                  Clinic Logo
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                  {/* Logo Image Preview */}
                  <div className="w-[70px] h-[72px] rounded-[11px] overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-[0px_1px_3px_rgba(0,0,0,0.30),0px_4px_8px_3px_rgba(0,0,0,0.15)]">
                    {clinicLogo ? (
                      <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-cover" />
                    ) : (
                      <img src={assets.dashboardLogo || assets.pivodentLogo} alt="Pivodent" className="w-[50px] h-[55px] object-contain" />
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <div
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '600',
                        lineHeight: '20px',
                      }}
                    >
                      Current Logo
                    </div>
                    <div
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      Used in reports, PDFs, and patient communications.
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1.5 rounded-[5px] flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-slate-50"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <Camera size={14} className="text-[#6B7280]" />
                      <span
                        style={{
                          color: '#6B7280',
                          fontSize: 12,
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '500',
                          lineHeight: '16px',
                        }}
                      >
                        Upload New Logo
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clinic General Form Card */}
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col gap-4"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  outline: '1.33px #F9FAFB solid',
                  outlineOffset: '-1.33px',
                }}
              >
                {/* 1. Clinic Name */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Clinic Name
                  </span>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Clinic Name"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>

                {/* 2. Tagline / Subtitle */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Tagline / Subtitle
                  </span>
                  <input
                    type="text"
                    value={clinicTagline}
                    onChange={(e) => setClinicTagline(e.target.value)}
                    placeholder="Dental Clinic"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>

                {/* 3. Phone */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Phone
                  </span>
                  <input
                    type="text"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    placeholder="+63 92 8123 4567"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>

                {/* 4. Email */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Email
                  </span>
                  <input
                    type="email"
                    value={clinicEmail}
                    onChange={(e) => setClinicEmail(e.target.value)}
                    placeholder="info@pivodent.com"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>

                {/* 5. Website */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Website
                  </span>
                  <input
                    type="text"
                    value={clinicWebsite}
                    onChange={(e) => setClinicWebsite(e.target.value)}
                    placeholder="www.pivodent.com"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>

                {/* 6. Address */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                  <span
                    style={{
                      color: '#6A7282',
                      fontSize: 14,
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      lineHeight: '20px',
                    }}
                  >
                    Address
                  </span>
                  <input
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder="123 Dental Avenue, Makati City, Metro Manila"
                    className="w-full sm:w-[550px] h-[40px] px-3 text-xs font-medium text-[#6A7282] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: COMMUNICATION CHANNELS */}
          {/* ========================================================================= */}
          {activeSubTab === 'commu' && (
            <div className="w-full flex flex-col gap-4 animate-fadeIn">
              
              {/* Channel 1: Facebook Messenger Integration */}
              <FacebookIntegration
                clinicData={clinicData || {}}
                messengerEnabled={messengerEnabled}
                onToggleMessenger={(val) => setMessengerEnabled(val)}
                onIntegrationUpdate={(integration) => {
                  fetchSettingsData();
                  if (integration) {
                    setMessengerHandle(integration.fb_page_name || integration.fb_page_id || '');
                    setMessengerEnabled(true);
                  } else {
                    setMessengerHandle('');
                    setMessengerEnabled(false);
                  }
                }}
              />

              {/* Channel 2: Email Notifications Integration */}
              <EmailIntegration
                clinicData={clinicData || {}}
                clinicLogo={clinicLogo}
                emailEnabled={emailEnabled}
                setEmailEnabled={setEmailEnabled}
                emailFromName={emailFromName}
                setEmailFromName={setEmailFromName}
                emailFromAddress={emailFromAddress}
                setEmailFromAddress={setEmailFromAddress}
                emailReplyTo={emailReplyTo}
                setEmailReplyTo={setEmailReplyTo}
                emailConfirmationEnabled={emailConfirmationEnabled}
                setEmailConfirmationEnabled={setEmailConfirmationEnabled}
                emailReminderEnabled={emailReminderEnabled}
                setEmailReminderEnabled={setEmailReminderEnabled}
                smtpHost={smtpHost}
                setSmtpHost={setSmtpHost}
                smtpPort={smtpPort}
                setSmtpPort={setSmtpPort}
                smtpUsername={smtpUsername}
                setSmtpUsername={setSmtpUsername}
                smtpPassword={smtpPassword}
                setSmtpPassword={setSmtpPassword}
                smtpEncryption={smtpEncryption}
                setSmtpEncryption={setSmtpEncryption}
                emailSubjectApproved={emailSubjectApproved}
                emailBodyApproved={emailBodyApproved}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SCHEDULE & BOOKING RULES */}
          {/* ========================================================================= */}
          {activeSubTab === 'schedule' && (
            <div className="w-full flex flex-col gap-4 animate-fadeIn">

              {/* Card 0: Your Public Booking Portal Link */}
              <div
                className="w-full bg-gradient-to-r from-[#0E3F39] to-[#1A8A7A] rounded-[12px] p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
              >
                <div className="flex flex-col gap-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full text-teal-200">
                      Live Patient Portal
                    </span>
                    <span className="text-xs text-teal-100 font-medium">Auto-sent by Chatbot on Booking Request</span>
                  </div>
                  <h4 className="text-base font-bold tracking-tight text-white mt-1">
                    Your Clinic's Public Booking Portal Link
                  </h4>
                  <p className="text-xs text-teal-100/80 leading-relaxed">
                    Patients can browse services, review your clinic policies, and book directly here:
                  </p>
                  <div className="mt-1 font-mono text-xs font-bold text-teal-300 bg-black/25 px-3 py-1.5 rounded-lg border border-white/10 break-all select-all">
                    {`${window.location.origin}/book/${clinicData?.slug || (clinicData?.clinic_name ? clinicData.clinic_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'happysmiles')}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = clinicData?.slug || (clinicData?.clinic_name ? clinicData.clinic_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'happysmiles');
                      const link = `${window.location.origin}/book/${slug}`;
                      navigator.clipboard.writeText(link);
                      setCopiedLink(true);
                      showToast('Public Booking link copied to clipboard!', 'success');
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-white text-[#0E3F39] hover:bg-teal-50 font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check size={16} /> : <PaperPlaneTilt size={16} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`/book/${clinicData?.slug || (clinicData?.clinic_name ? clinicData.clinic_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'happysmiles')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Preview</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>
              
              {/* Card 1: Booking Rules */}
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  outline: '1.33px #F9FAFB solid',
                  outlineOffset: '-1.33px',
                }}
              >
                {/* 1. Buffer Between Appointments */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Buffer Between Appointments
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Gap automatically added after each appointment.
                    </span>
                  </div>

                  <div
                    className="w-[200px] h-[40px] px-3 rounded-[5px] flex items-center justify-between bg-white cursor-pointer"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  >
                    <select
                      value={bufferTime}
                      onChange={(e) => setBufferTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-[#1E2939] focus:outline-none cursor-pointer"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="45 minutes">45 minutes</option>
                      <option value="60 minutes">60 minutes</option>
                    </select>
                  </div>
                </div>

                {/* 2. Daily Appointment Cap */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Daily Appointment Cap
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Maximum appointments per day across all dentists.
                    </span>
                  </div>

                  <div className="w-[200px] flex items-center gap-2">
                    <div
                      className="flex-1 h-[35px] px-3 rounded-[5px] flex items-center justify-between bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={dailyCap}
                        onChange={(e) => setDailyCap(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-sm font-normal text-[#1E2939] focus:outline-none"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => setDailyCap((prev) => prev + 1)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setDailyCap((prev) => Math.max(1, prev - 1))}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Advance Booking Limit */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Advance Booking Limit
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      How far in advance patients can book.
                    </span>
                  </div>

                  <div
                    className="w-[200px] h-[40px] px-3 rounded-[5px] flex items-center justify-between bg-white cursor-pointer"
                    style={{
                      outline: '1.33px #E5E7EB solid',
                      outlineOffset: '-1.33px',
                    }}
                  >
                    <select
                      value={advanceLimit}
                      onChange={(e) => setAdvanceLimit(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-[#1E2939] focus:outline-none cursor-pointer"
                    >
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="4 weeks">4 weeks</option>
                      <option value="8 weeks">8 weeks</option>
                      <option value="12 weeks">12 weeks</option>
                    </select>
                  </div>
                </div>

                {/* 4. Allow Same-Day Booking */}
                <div className="w-full py-3 flex items-center justify-between border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Allow Same-Day Booking
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      Patients can book appointments for today.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAllowSameDay(!allowSameDay)}
                    className="w-[60px] p-[3px] rounded-full transition-colors flex items-center cursor-pointer"
                    style={{
                      background: allowSameDay ? '#1A8A7A' : '#CECECE',
                      justifyContent: allowSameDay ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div className="w-[18px] h-[18px] bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.10)]" />
                  </button>
                </div>

                {/* 5. Auto-Confirm Appointments */}
                <div className="w-full py-3 flex items-center justify-between border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Auto-Confirm Appointments
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      Bookings are instantly confirmed without staff approval.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoConfirm(!autoConfirm)}
                    className="w-[60px] p-[3px] rounded-full transition-colors flex items-center cursor-pointer"
                    style={{
                      background: autoConfirm ? '#1A8A7A' : '#CECECE',
                      justifyContent: autoConfirm ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div className="w-[18px] h-[18px] bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.10)]" />
                  </button>
                </div>

                {/* 6. Available Room */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Available Room
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Rooms available in the clinic.
                    </span>
                  </div>

                  <div className="w-[200px] flex items-center gap-2">
                    <div
                      className="flex-1 h-[35px] px-3 rounded-[5px] flex items-center justify-between bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={availableRooms}
                        onChange={(e) => setAvailableRooms(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-sm font-normal text-[#1E2939] focus:outline-none"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => setAvailableRooms((prev) => prev + 1)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvailableRooms((prev) => Math.max(1, prev - 1))}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Clinic Booking Policy & Patient Reminders */}
                <div className="w-full py-4 flex flex-col gap-2 border-t border-[rgba(0,0,0,0.10)] mt-2">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Clinic Booking Policy & Patient Reminders
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Custom guidelines, rules, or requirements shown to patients on the booking portal (e.g. arrival times, valid IDs, HMO rules, down payments).
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={bookingPolicyNotice}
                    onChange={(e) => setBookingPolicyNotice(e.target.value)}
                    placeholder="e.g. Strictly by appointment. Please arrive 15 minutes before your schedule. Valid government ID and HMO card required. Cancellations must be made at least 24 hours in advance."
                    className="w-full p-3 rounded-[8px] bg-slate-50 border border-slate-200 text-xs text-[#1E2939] focus:outline-none focus:border-[#1A8A7A] focus:bg-white transition-all font-sans"
                  />
                </div>

              </div>

              {/* Card 2: Operating Hours */}
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                }}
              >
                <div
                  className="pb-4"
                  style={{
                    color: '#99A1AF',
                    fontSize: 14,
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '700',
                    lineHeight: '20px',
                  }}
                >
                  Operating Hours
                </div>

                {/* Days list */}
                <div className="flex flex-col divide-y divide-slate-100">
                  {DAYS_OF_WEEK.map((day) => {
                    const schedule = operatingHours[day.id] || { enabled: true, open: '08:00 AM', close: '05:00 PM' };
                    return (
                      <div
                        key={day.id}
                        className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        {/* Day Toggle & Label */}
                        <div className="flex items-center gap-3 w-44">
                          <button
                            type="button"
                            onClick={() => updateDayHours(day.id, 'enabled', !schedule.enabled)}
                            className="w-[44px] h-[24px] p-[2px] rounded-full transition-colors flex items-center cursor-pointer shrink-0"
                            style={{
                              background: schedule.enabled ? '#2A9D8F' : '#CECECE',
                              justifyContent: schedule.enabled ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <div className="w-[20px] h-[20px] bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.10)]" />
                          </button>

                          <span
                            style={{
                              color: schedule.enabled ? '#0E3F39' : '#99A1AF',
                              fontSize: 12,
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: '500',
                              lineHeight: '18px',
                            }}
                          >
                            {day.label}
                          </span>
                        </div>

                        {/* Start & End Time Range */}
                        <div className="flex items-center gap-3">
                          {/* Start Time Card */}
                          <div
                            className={`w-[160px] h-[40px] px-3 py-2 bg-white rounded-[5px] flex items-center justify-between ${
                              !schedule.enabled ? 'opacity-40 pointer-events-none' : ''
                            }`}
                            style={{
                              boxShadow: '0px 0px 4px rgba(150, 150, 150, 0.25)',
                            }}
                          >
                            <Clock size={16} className="text-[#0E3F39]" />
                            <select
                              value={schedule.open || '08:00 AM'}
                              disabled={!schedule.enabled}
                              onChange={(e) => updateDayHours(day.id, 'open', e.target.value)}
                              className="text-xs font-medium text-[#0E3F39] bg-transparent focus:outline-none cursor-pointer"
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span
                            style={{
                              color: '#99A1AF',
                              fontSize: 12,
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: '500',
                              lineHeight: '18px',
                            }}
                          >
                            TO
                          </span>

                          {/* End Time Card */}
                          <div
                            className={`w-[160px] h-[40px] px-3 py-2 bg-white rounded-[5px] flex items-center justify-between ${
                              !schedule.enabled ? 'opacity-40 pointer-events-none' : ''
                            }`}
                            style={{
                              boxShadow: '0px 0px 4px rgba(150, 150, 150, 0.25)',
                            }}
                          >
                            <Clock size={16} className="text-[#0E3F39]" />
                            <select
                              value={schedule.close || '05:00 PM'}
                              disabled={!schedule.enabled}
                              onChange={(e) => updateDayHours(day.id, 'close', e.target.value)}
                              className="text-xs font-medium text-[#0E3F39] bg-transparent focus:outline-none cursor-pointer"
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CANCELLATION & NO-SHOW */}
          {/* ========================================================================= */}
          {activeSubTab === 'cancel' && (
            <div className="w-full flex flex-col gap-4 animate-fadeIn">
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  outline: '1.33px #F9FAFB solid',
                  outlineOffset: '-1.33px',
                }}
              >
                {/* 1. Cancellation Lock Window */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Cancellation Lock Window
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Hours before appointment when cancel triggers a warning.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div
                      className="w-[180px] sm:w-[200px] h-[35px] px-3 rounded-[5px] flex items-center justify-between bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={cancellationLockWindow}
                        onChange={(e) => setCancellationLockWindow(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-sm font-normal text-[#1E2939] focus:outline-none"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => setCancellationLockWindow((prev) => prev + 1)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellationLockWindow((prev) => Math.max(0, prev - 1))}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div
                      className="w-[115px] h-[35px] rounded-[5px] flex items-center justify-center bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <span
                        style={{
                          color: '#99A1AF',
                          fontSize: 14,
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '500',
                          lineHeight: '20px',
                        }}
                      >
                        hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. No-Show Grace Period */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      No-Show Grace Period
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Minutes after appointment start before auto-flagging as no-show.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div
                      className="w-[180px] sm:w-[200px] h-[35px] px-3 rounded-[5px] flex items-center justify-between bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={noShowGracePeriod}
                        onChange={(e) => setNoShowGracePeriod(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-sm font-normal text-[#1E2939] focus:outline-none"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => setNoShowGracePeriod((prev) => prev + 1)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoShowGracePeriod((prev) => Math.max(0, prev - 1))}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div
                      className="w-[115px] h-[35px] rounded-[5px] flex items-center justify-center bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <span
                        style={{
                          color: '#99A1AF',
                          fontSize: 14,
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '500',
                          lineHeight: '20px',
                        }}
                      >
                        minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Auto-Flag No-shows */}
                <div className="w-full py-3 flex items-center justify-between border-b border-[rgba(0,0,0,0.10)]">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Auto-Flag No-shows
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      Automatically mark patients as no-show after grace period.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoFlagNoShow(!autoFlagNoShow)}
                    className="w-[60px] p-[3px] rounded-full transition-colors flex items-center cursor-pointer"
                    style={{
                      background: autoFlagNoShow ? '#1A8A7A' : '#CECECE',
                      justifyContent: autoFlagNoShow ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div className="w-[18px] h-[18px] bg-white rounded-full shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.10)]" />
                  </button>
                </div>

                {/* 4. Repeat No-show Threshold */}
                <div className="w-full py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: '#1E2939',
                        fontSize: 14,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '500',
                        lineHeight: '20px',
                      }}
                    >
                      Repeat No-show Threshold
                    </span>
                    <span
                      style={{
                        color: '#99A1AF',
                        fontSize: 12,
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '400',
                        lineHeight: '16.5px',
                      }}
                    >
                      Flag patient record after this many no-shows.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div
                      className="w-[180px] sm:w-[200px] h-[35px] px-3 rounded-[5px] flex items-center justify-between bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={repeatNoShowThreshold}
                        onChange={(e) => setRepeatNoShowThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-sm font-normal text-[#1E2939] focus:outline-none"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => setRepeatNoShowThreshold((prev) => prev + 1)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepeatNoShowThreshold((prev) => Math.max(1, prev - 1))}
                          className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div
                      className="w-[115px] h-[35px] rounded-[5px] flex items-center justify-center bg-white"
                      style={{
                        outline: '1.33px #E5E7EB solid',
                        outlineOffset: '-1.33px',
                      }}
                    >
                      <span
                        style={{
                          color: '#99A1AF',
                          fontSize: 14,
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '500',
                          lineHeight: '20px',
                        }}
                      >
                        occurrences
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SERVICES & PRICING */}
          {/* ========================================================================= */}
          {activeSubTab === 'services' && (
            <div className="w-full flex flex-col gap-4 animate-fadeIn">
              <div
                className="w-full bg-white rounded-[10px] p-5 flex flex-col gap-4"
                style={{
                  boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
                  outline: '1.33px #F9FAFB solid',
                  outlineOffset: '-1.33px',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#1E2939]">Treatment Services &amp; Pricing</h3>
                    <p className="text-xs text-[#99A1AF] mt-0.5">
                      Manage dental treatments offered by your clinic and their default rates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 bg-[#0E3F39] hover:bg-[#1A5C54] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} weight="bold" />
                    Add Treatment
                  </button>
                </div>

                {/* Add Service Form */}
                {showAddForm && (
                  <form onSubmit={handleAddService} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Treatment Name (e.g. Tooth Extraction)"
                      required
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="Price (₱)"
                      required
                      className="w-32 px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1A8A7A]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1A8A7A] hover:bg-[#147063] text-white text-xs font-bold rounded cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Services Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Treatment Name</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-slate-400">
                            No treatment services in catalog yet. Click &quot;Add Treatment&quot; to begin.
                          </td>
                        </tr>
                      ) : (
                        services.map((svc) => {
                          const isEditing = editingServiceId === svc.id;
                          return (
                            <tr key={svc.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingServiceName}
                                    onChange={(e) => setEditingServiceName(e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                  />
                                ) : (
                                  <span className="font-semibold text-slate-800">{svc.service_name}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingServicePrice}
                                    onChange={(e) => setEditingServicePrice(e.target.value)}
                                    className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-right"
                                  />
                                ) : (
                                  <span className="text-[#1A5C54] font-bold">₱{parseFloat(svc.price).toLocaleString()}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => saveInlineEdit(svc)}
                                      className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                                      title="Save"
                                    >
                                      <Check size={14} weight="bold" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingServiceId(null)}
                                      className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={14} weight="bold" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditing(svc)}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                      title="Edit Price/Name"
                                    >
                                      <PencilSimple size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingServiceId(svc.id)}
                                      className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      title="Remove"
                                    >
                                      <Trash size={15} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Delete Service Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingServiceId !== null}
        title="Remove Treatment"
        message="Are you sure you want to remove this treatment from the clinic catalog?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          const id = deletingServiceId;
          setDeletingServiceId(null);
          try {
            await deleteService(id);
            showToast('Treatment removed.', 'info');
            await fetchServicesList();
          } catch (err) {
            showToast('Error removing treatment: ' + err.message, 'error');
          }
        }}
        onCancel={() => setDeletingServiceId(null)}
      />

    </div>
  );
}

