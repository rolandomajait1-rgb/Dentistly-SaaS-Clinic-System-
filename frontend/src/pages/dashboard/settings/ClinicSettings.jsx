import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings, getServices, addService, deleteService, updateService } from '../../../api';
import FacebookIntegration from './FacebookIntegration';
import { useNotifications } from '../../../context/NotificationContext';
import {
  ChatText,
  EnvelopeSimple,
  Robot,
  ChatCircleText,
  FloppyDisk,
  RocketLaunch,
  CheckCircle,
  Plus,
  GearSix,
} from '@phosphor-icons/react';

import EmailSettingsTab from './components/EmailSettingsTab';
import ChatbotSettingsTab from './components/ChatbotSettingsTab';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function ClinicSettings({ onClinicUpdate, onLaunchWizard }) {
  const { showToast } = useNotifications();

  // Active Tab State (email, chatbot, messenger)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('active_settings_tab');
    return saved && saved !== 'gcal' && saved !== 'sms' ? saved : 'email';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('active_settings_tab', tabId);
  };

  // Base Clinic States
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  // Facebook & General Integration Data
  const [fbPageId, setFbPageId] = useState('');
  const [fbPageToken, setFbPageToken] = useState('');
  const [fbVerifyToken, setFbVerifyToken] = useState('dental_appointment_webhook_token');
  const [, setFbStatus] = useState('Disconnected');
  const [clinicData, setClinicData] = useState(null);

  // Granular SMS Settings
  const [smsSenderName, setSmsSenderName] = useState('');
  const [smsContactNumber, setSmsContactNumber] = useState('');
  const [smsFooterAddress, setSmsFooterAddress] = useState('');
  const [smsReminderEnabled, setSmsReminderEnabled] = useState(true);
  const [smsConfirmationEnabled, setSmsConfirmationEnabled] = useState(true);
  const [smsFollowupEnabled, setSmsFollowupEnabled] = useState(false);
  const [smsTemplateApproved, setSmsTemplateApproved] = useState('');
  const [smsTemplateCancelled, setSmsTemplateCancelled] = useState('');

  // Granular Email Settings
  const [emailFromName, setEmailFromName] = useState('');
  const [emailFromAddress, setEmailFromAddress] = useState('');
  const [emailReplyTo, setEmailReplyTo] = useState('');
  const [emailFooter, setEmailFooter] = useState('');
  const [emailConfirmationEnabled, setEmailConfirmationEnabled] = useState(true);
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(true);
  const [emailPostVisitEnabled, setEmailPostVisitEnabled] = useState(false);
  const [emailSubjectApproved, setEmailSubjectApproved] = useState('');
  const [emailBodyApproved, setEmailBodyApproved] = useState('');
  const [emailSubjectCancelled, setEmailSubjectCancelled] = useState('');
  const [emailBodyCancelled, setEmailBodyCancelled] = useState('');

  // Chatbot Settings
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [chatbotBotName, setChatbotBotName] = useState('SmileBot');
  const [chatbotWelcomeMessage, setChatbotWelcomeMessage] = useState('Hi! How can I help you today?');
  const [chatbotWelcomeTemplate, setChatbotWelcomeTemplate] = useState('');
  const [chatbotInstructions, setChatbotInstructions] = useState('');
  const [chatbotOperatingHours, setChatbotOperatingHours] = useState('Mon-Sat, 8am-6pm. Closed Sundays and holidays.');
  const [chatbotLocationAddress, setChatbotLocationAddress] = useState('');
  const [chatbotPaymentMethods, setChatbotPaymentMethods] = useState('Cash, GCash, Maya, Credit Card');

  // Custom Gateway Integration settings
  const [semaphoreApiKey, setSemaphoreApiKey] = useState('');
  const [semaphoreName, setSemaphoreName] = useState('');
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('tls');
  const [smtpFromAddress, setSmtpFromAddress] = useState('');

  // Services Catalog
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Editing state for inline services
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceName, setEditingServiceName] = useState('');
  const [editingServicePrice, setEditingServicePrice] = useState('');
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setClinicData(data);
      setClinicName(data.clinic_name || '');
      setClinicPhone(data.contact_number || '');
      setClinicAddress(data.address || '');

      const notifSettings = data.notification_settings || {};
      
      // SMS specific values
      setSmsSenderName(notifSettings.sms_sender_name ?? data.clinic_name ?? '');
      setSmsContactNumber(notifSettings.sms_contact_number ?? data.contact_number ?? '');
      setSmsFooterAddress(notifSettings.sms_footer_address ?? data.address ?? '');
      setSmsReminderEnabled(notifSettings.sms_reminder_enabled ?? true);
      setSmsConfirmationEnabled(notifSettings.sms_confirmation_enabled ?? true);
      setSmsFollowupEnabled(notifSettings.sms_followup_enabled ?? false);
      setSmsTemplateApproved(notifSettings.sms_template_approved ?? "Hi {patient_name}, your appointment at {clinic_name} on {date} at {time} for {service_name} has been APPROVED. Reference: {reference}. See you!");
      setSmsTemplateCancelled(notifSettings.sms_template_cancelled ?? "Hi {patient_name}, your appointment at {clinic_name} has been CANCELLED. {reason} Contact us at {clinic_phone}.");

      // Email specific values
      setEmailFromName(notifSettings.email_from_name ?? data.clinic_name ?? '');
      setEmailFromAddress(notifSettings.email_from_address ?? notifSettings.smtp_from_address ?? data.email ?? '');
      setEmailReplyTo(notifSettings.email_reply_to ?? '');
      setEmailFooter(notifSettings.email_footer ?? data.address ?? '');
      setEmailConfirmationEnabled(notifSettings.email_confirmation_enabled ?? true);
      setEmailReminderEnabled(notifSettings.email_reminder_enabled ?? true);
      setEmailPostVisitEnabled(notifSettings.email_post_visit_enabled ?? false);
      setEmailSubjectApproved(notifSettings.email_subject_approved ?? "Confirmed: Your Appointment at {clinic_name}");
      setEmailBodyApproved(notifSettings.email_body_approved ?? "<p>Dear {patient_name}, your appointment is confirmed for {date} at {time}.</p>");
      setEmailSubjectCancelled(notifSettings.email_subject_cancelled ?? "Cancelled: Your Appointment at {clinic_name}");
      setEmailBodyCancelled(notifSettings.email_body_cancelled ?? "<p>Dear {patient_name}, your appointment has been cancelled. {reason}</p>");

      // Chatbot specific values
      setChatbotEnabled(notifSettings.chatbot_enabled ?? true);
      setChatbotBotName(notifSettings.chatbot_bot_name ?? 'SmileBot');
      setChatbotWelcomeMessage(notifSettings.chatbot_welcome_message ?? 'Hi! How can I help you today?');
      setChatbotWelcomeTemplate(notifSettings.chatbot_welcome_template ?? "👋 Hi! Welcome to {clinic_name}! \n\nI'm your dental assistant. I can help you book appointments, check your schedule, or answer questions. \n\nLet's get started! 😊");
      setChatbotInstructions(notifSettings.chatbot_instructions ?? "We offer premium dental care at affordable pricing. Teeth cleaning starts at ₱800. We accept Cash, GCash, and Maxicare HMO.");
      setChatbotOperatingHours(notifSettings.chatbot_operating_hours ?? 'Mon-Sat, 8am-6pm. Closed Sundays and holidays.');
      setChatbotLocationAddress(notifSettings.chatbot_location_address ?? data.address ?? '');
      setChatbotPaymentMethods(notifSettings.chatbot_payment_methods ?? 'Cash, GCash, Maya, Credit Card');

      // Semaphore SMS details
      setSemaphoreApiKey(notifSettings.semaphore_api_key ?? '');
      setSemaphoreName(notifSettings.semaphore_name ?? 'SEMAPHORE');

      // SMTP Details
      setSmtpEnabled(notifSettings.smtp_enabled ?? false);
      setSmtpHost(notifSettings.smtp_host ?? '');
      setSmtpPort(notifSettings.smtp_port ?? '587');
      setSmtpUsername(notifSettings.smtp_username ?? '');
      setSmtpPassword(notifSettings.smtp_password ?? '');
      setSmtpEncryption(notifSettings.smtp_encryption ?? 'tls');
      setSmtpFromAddress(notifSettings.smtp_from_address ?? '');

      const integration = data.fb_page_integration;
      if (integration) {
        setFbPageId(integration.fb_page_id || '');
        setFbPageToken(integration.page_access_token || '');
        setFbVerifyToken(integration.webhook_verify_token || 'dental_appointment_webhook_token');
        setFbStatus(integration.is_active ? 'Connected' : 'Disconnected');
      } else {
        setFbVerifyToken('dental_appointment_webhook_token');
        setFbStatus('Disconnected');
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchServicesList = useCallback(async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchSettings(), fetchServicesList()]);
      setIsLoading(false);
    };
    init();
  }, [fetchSettings, fetchServicesList]);

  const handleSave = async () => {
    try {
      const response = await updateSettings({
        clinic_name: clinicName,
        contact_number: clinicPhone,
        address: clinicAddress,
        fb_page_id: fbPageId,
        page_access_token: fbPageToken,
        webhook_verify_token: fbVerifyToken,
        notification_settings: {
          sms_enabled: smsReminderEnabled || smsConfirmationEnabled || smsFollowupEnabled,
          email_enabled: emailConfirmationEnabled || emailReminderEnabled || emailPostVisitEnabled,
          sms_template_approved: smsTemplateApproved,
          sms_template_cancelled: smsTemplateCancelled,
          email_subject_approved: emailSubjectApproved,
          email_body_approved: emailBodyApproved,
          email_subject_cancelled: emailSubjectCancelled,
          email_body_cancelled: emailBodyCancelled,
          google_calendar_enabled: false,
          google_calendar_id: '',
          chatbot_enabled: chatbotEnabled,
          chatbot_welcome_template: chatbotWelcomeTemplate,
          chatbot_instructions: chatbotInstructions,
          semaphore_api_key: semaphoreApiKey,
          semaphore_name: semaphoreName,
          smtp_enabled: smtpEnabled,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_username: smtpUsername,
          smtp_password: smtpPassword,
          smtp_encryption: smtpEncryption,
          smtp_from_address: smtpFromAddress,

          // Granular SMS config
          sms_sender_name: smsSenderName,
          sms_contact_number: smsContactNumber,
          sms_footer_address: smsFooterAddress,
          sms_reminder_enabled: smsReminderEnabled,
          sms_confirmation_enabled: smsConfirmationEnabled,
          sms_followup_enabled: smsFollowupEnabled,

          // Granular Email config
          email_from_name: emailFromName,
          email_from_address: emailFromAddress,
          email_reply_to: emailReplyTo,
          email_footer: emailFooter,
          email_confirmation_enabled: emailConfirmationEnabled,
          email_reminder_enabled: emailReminderEnabled,
          email_post_visit_enabled: emailPostVisitEnabled,

          // Chatbot Q&A configuration
          chatbot_bot_name: chatbotBotName,
          chatbot_welcome_message: chatbotWelcomeMessage,
          chatbot_operating_hours: chatbotOperatingHours,
          chatbot_location_address: chatbotLocationAddress,
          chatbot_payment_methods: chatbotPaymentMethods,
        }
      });
      if (onClinicUpdate) {
        onClinicUpdate(response.clinic);
      }
      setClinicData(response.clinic);
      setFbStatus(response.clinic.fb_page_integration?.is_active ? 'Connected' : 'Disconnected');
      setSaveSuccess(true);
      showToast('Settings saved successfully!', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      showToast('Error saving settings: ' + err.message, 'error');
    }
  };

  const handleFacebookIntegrationUpdate = (integration) => {
    if (integration) {
      setFbStatus('Connected');
      setFbPageId(integration.fb_page_id);
      setFbVerifyToken(integration.webhook_verify_token);
    } else {
      setFbStatus('Disconnected');
      setFbPageId('');
      setFbPageToken('');
    }
    fetchSettings();
  };

  // Add Treatment Catalog Service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    try {
      await addService(newServiceName, parseFloat(newServicePrice));
      showToast('Treatment added to catalog.', 'success');
      setNewServiceName(''); 
      setNewServicePrice('');
      setShowAddForm(false);
      await fetchServicesList();
    } catch (err) {
      showToast('Error adding treatment: ' + err.message, 'error');
    }
  };

  // Delete/Deactivate Service from Catalog
  const handleDeleteService = (id) => {
    setDeletingServiceId(id);
  };

  // Inline edit handlers for service names and prices
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
        showToast('Treatment updated successfully.', 'success');
        await fetchServicesList();
      } catch (err) {
        showToast('Error updating treatment: ' + err.message, 'error');
      }
    }
    setEditingServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-550 dark:text-slate-400 gap-4 min-h-[50vh]">
        <div className="relative">
          <span className="block w-8 h-8 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-semibold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 md:p-6">
      
      {/* Modern Header */}
      <div className="max-w-[1400px] mx-auto mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-teal-600 flex items-center justify-center shadow-md shadow-primary/20">
                <GearSix size={24} className="text-white" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Clinic Settings
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Configure integrations and automation
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onLaunchWizard && (
                <button
                  onClick={onLaunchWizard}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <RocketLaunch size={16} weight="duotone" />
                  Setup Wizard
                </button>
              )}
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white scale-105'
                    : 'bg-linear-to-r from-primary to-teal-600 text-white hover:shadow-md hover:scale-[1.02]'
                }`}
              >
                {saveSuccess ? <CheckCircle size={16} weight="bold" /> : <FloppyDisk size={16} weight="bold" />}
                {saveSuccess ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
              <nav className="space-y-1">
                {[
                  { id: 'email', label: 'Email Server', icon: EnvelopeSimple },
                  { id: 'chatbot', label: 'AI Chatbot Q&A', icon: Robot },
                  { id: 'messenger', label: 'FB Messenger', icon: ChatCircleText },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-transparent'
                      }`}
                    >
                      <TabIcon size={20} weight={isActive ? 'duotone' : 'regular'} />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 md:p-8 space-y-8">
              <div className="space-y-6">

                {activeTab === 'email' && (
                  <EmailSettingsTab
                    emailFromName={emailFromName} setEmailFromName={setEmailFromName}
                    emailFromAddress={emailFromAddress} setEmailFromAddress={setEmailFromAddress}
                    emailReplyTo={emailReplyTo} setEmailReplyTo={setEmailReplyTo}
                    emailFooter={emailFooter} setEmailFooter={setEmailFooter}
                    emailConfirmationEnabled={emailConfirmationEnabled} setEmailConfirmationEnabled={setEmailConfirmationEnabled}
                    emailReminderEnabled={emailReminderEnabled} setEmailReminderEnabled={setEmailReminderEnabled}
                    emailPostVisitEnabled={emailPostVisitEnabled} setEmailPostVisitEnabled={setEmailPostVisitEnabled}
                    smtpEnabled={smtpEnabled} setSmtpEnabled={setSmtpEnabled}
                    smtpHost={smtpHost} setSmtpHost={setSmtpHost}
                    smtpPort={smtpPort} setSmtpPort={setSmtpPort}
                    smtpUsername={smtpUsername} setSmtpUsername={setSmtpUsername}
                    smtpPassword={smtpPassword} setSmtpPassword={setSmtpPassword}
                    smtpEncryption={smtpEncryption} setSmtpEncryption={setSmtpEncryption}
                    smtpFromAddress={smtpFromAddress} setSmtpFromAddress={setSmtpFromAddress}
                    emailSubjectApproved={emailSubjectApproved} setEmailSubjectApproved={setEmailSubjectApproved}
                    emailBodyApproved={emailBodyApproved} setEmailBodyApproved={setEmailBodyApproved}
                    emailSubjectCancelled={emailSubjectCancelled} setEmailSubjectCancelled={setEmailSubjectCancelled}
                    emailBodyCancelled={emailBodyCancelled} setEmailBodyCancelled={setEmailBodyCancelled}
                  />
                )}

                {activeTab === 'chatbot' && (
                  <ChatbotSettingsTab
                    chatbotEnabled={chatbotEnabled} setChatbotEnabled={setChatbotEnabled}
                    chatbotBotName={chatbotBotName} setChatbotBotName={setChatbotBotName}
                    chatbotWelcomeMessage={chatbotWelcomeMessage} setChatbotWelcomeMessage={setChatbotWelcomeMessage}
                    chatbotWelcomeTemplate={chatbotWelcomeTemplate} setChatbotWelcomeTemplate={setChatbotWelcomeTemplate}
                    chatbotInstructions={chatbotInstructions} setChatbotInstructions={setChatbotInstructions}
                    chatbotOperatingHours={chatbotOperatingHours} setChatbotOperatingHours={setChatbotOperatingHours}
                    chatbotLocationAddress={chatbotLocationAddress} setChatbotLocationAddress={setChatbotLocationAddress}
                    chatbotPaymentMethods={chatbotPaymentMethods} setChatbotPaymentMethods={setChatbotPaymentMethods}
                    services={services}
                    newServiceName={newServiceName} setNewServiceName={setNewServiceName}
                    newServicePrice={newServicePrice} setNewServicePrice={setNewServicePrice}
                    showAddForm={showAddForm} setShowAddForm={setShowAddForm}
                    handleAddService={handleAddService}
                    handleDeleteService={handleDeleteService}
                    editingServiceId={editingServiceId}
                    editingServiceName={editingServiceName} setEditingServiceName={setEditingServiceName}
                    editingServicePrice={editingServicePrice} setEditingServicePrice={setEditingServicePrice}
                    startEditing={startEditing}
                    saveInlineEdit={saveInlineEdit}
                  />
                )}

                {activeTab === 'messenger' && (
                  <FacebookIntegration
                    clinicData={clinicData || {}}
                    onIntegrationUpdate={handleFacebookIntegrationUpdate}
                  />
                )}

              </div>
            </div>
          </div>

          <ConfirmModal
            isOpen={deletingServiceId !== null}
            title="Remove Treatment"
            message="Are you sure you want to remove this treatment service from your catalog? Patients will no longer be able to book it."
            confirmText="Remove"
            cancelText="Cancel"
            type="danger"
            onConfirm={async () => {
              const id = deletingServiceId;
              setDeletingServiceId(null);
              try {
                await deleteService(id);
                showToast('Treatment removed from catalog.', 'info');
                await fetchServicesList();
              } catch (err) {
                showToast('Error deleting treatment: ' + err.message, 'error');
              }
            }}
            onCancel={() => setDeletingServiceId(null)}
          />

        </div>
      </div>
    </div>
  );
}
