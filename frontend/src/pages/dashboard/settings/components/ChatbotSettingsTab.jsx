import {
  Robot,
  ChatCircleText,
  Money,
  Globe,
  Clock,
  Sliders,
  CheckCircle,
  Plus,
  Trash,
  PencilSimple
} from '@phosphor-icons/react';
import { Toggle, FormField, Input, SectionCard } from '../../../../components/ui/SettingsPrimitives';

export default function ChatbotSettingsTab({
  chatbotEnabled, setChatbotEnabled,
  chatbotBotName, setChatbotBotName,
  chatbotWelcomeMessage, setChatbotWelcomeMessage,
  chatbotWelcomeTemplate, setChatbotWelcomeTemplate,
  chatbotInstructions, setChatbotInstructions,
  chatbotOperatingHours, setChatbotOperatingHours,
  chatbotLocationAddress, setChatbotLocationAddress,
  chatbotPaymentMethods, setChatbotPaymentMethods,
  // Services catalog props
  services,
  newServiceName, setNewServiceName,
  newServicePrice, setNewServicePrice,
  showAddForm, setShowAddForm,
  handleAddService,
  handleDeleteService,
  editingServiceId,
  editingServiceName, setEditingServiceName,
  editingServicePrice, setEditingServicePrice,
  startEditing,
  saveInlineEdit
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-linear-to-r from-indigo-500/10 to-teal-500/5 dark:from-indigo-500/10 dark:to-teal-500/5 border border-indigo-500/15 dark:border-indigo-500/20 rounded-3xl p-5 flex items-start gap-4 shadow-3xs">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Robot size={20} weight="bold" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-on-surface dark:text-[#f2f0ed] font-sans">AI Assistant Knowledge Base &amp; Catalog</h4>
          <p className="text-xs text-on-surface-variant/70 dark:text-slate-400 mt-1 font-semibold font-sans">Configure treatments, operating schedules, payment modes, and system instructions for SmileBot.</p>
        </div>
      </div>

      <SectionCard
        title="CHATBOT STATUS & IDENTITY"
        Icon={Robot}
        trailing={<Toggle checked={chatbotEnabled} onChange={setChatbotEnabled} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Bot Name">
            <Input Icon={Robot} type="text" value={chatbotBotName} onChange={e => setChatbotBotName(e.target.value)} placeholder="SmileBot" />
          </FormField>
          <FormField label="Welcome Message Tagline">
            <Input Icon={ChatCircleText} type="text" value={chatbotWelcomeMessage} onChange={e => setChatbotWelcomeMessage(e.target.value)} placeholder="Hi! How can I help you today?" />
          </FormField>
        </div>
      </SectionCard>

      {/* Services & Pricing List Inline Editor */}
      <div className="bg-white dark:bg-[#131f1e] border border-outline-variant/60 dark:border-[#1b2b29] rounded-3xl shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-outline-variant/60 dark:border-[#1b2b29] bg-slate-50/40 dark:bg-[#182625] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Money size={18} className="text-on-surface-variant/70 dark:text-slate-450" />
            <h3 className="font-extrabold text-xs tracking-wider text-on-surface dark:text-[#f2f0ed] uppercase font-sans">SERVICES &amp; PRICING LIST</h3>
            <span className="bg-primary/10 text-primary dark:text-inverse-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/25">
              PER CLINIC
            </span>
          </div>
        </div>
        <div className="divide-y divide-outline-variant/30 dark:divide-[#1b2b29]">
          {services.length === 0 ? (
            <p className="text-xs p-6 text-center text-on-surface-variant/50 dark:text-slate-400 font-semibold font-sans">No treatments registered in catalog.</p>
          ) : (
            services.map((svc, sIdx) => {
              const isEditing = editingServiceId === svc.id;
              return (
                <div key={svc.id} className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-[#182625]/40 transition-all gap-4 ${sIdx % 2 === 1 ? 'bg-slate-50/20 dark:bg-[#182625]/20' : ''}`}>
                  <div className="flex items-center justify-center w-5 h-5 rounded-md border border-outline-variant/80 dark:border-[#213533] bg-slate-100/50 dark:bg-[#101817] shrink-0">
                    <CheckCircle size={11} className="text-primary dark:text-inverse-primary" weight="bold" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editingServiceName}
                          onChange={e => setEditingServiceName(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-[#182625] border border-outline-variant/85 dark:border-[#213533] text-xs font-semibold text-on-surface dark:text-[#f2f0ed] rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-sans"
                          placeholder="Service name"
                        />
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-on-surface-variant/50 dark:text-slate-400 font-bold">₱</span>
                          <input
                            type="number"
                            value={editingServicePrice}
                            onChange={e => setEditingServicePrice(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-[#182625] border border-outline-variant/85 dark:border-[#213533] text-xs font-semibold text-on-surface dark:text-[#f2f0ed] rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                            placeholder="Price"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p
                          onClick={() => startEditing(svc)}
                          className="text-xs font-bold text-on-surface dark:text-[#f2f0ed] truncate cursor-pointer hover:text-primary transition-colors font-sans"
                          title="Click to edit name"
                        >
                          {svc.service_name}
                        </p>
                        <div className="flex items-center">
                          <span className="bg-primary/10 text-primary dark:text-inverse-primary font-extrabold text-[11px] rounded-lg px-2.5 py-0.5 border border-primary/20 font-mono tracking-wider">
                            ₱{(svc.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <button
                        onClick={() => saveInlineEdit(svc)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 transition-colors cursor-pointer"
                        title="Save Changes"
                      >
                        <CheckCircle size={14} weight="bold" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(svc)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#182625] text-on-surface-variant/60 hover:text-on-surface dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-outline-variant/40 dark:hover:border-transparent"
                        title="Edit inline"
                      >
                        <PencilSimple size={14} weight="bold" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-on-surface-variant/60 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/40 dark:hover:border-transparent"
                      title="Delete"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {showAddForm ? (
            <form onSubmit={handleAddService} className="p-6 bg-slate-50/50 dark:bg-[#182625]/20 space-y-3 border-t border-outline-variant/30 dark:border-[#1b2b29] animate-fadeIn">
              <p className="text-[10px] font-extrabold text-on-surface-variant/70 dark:text-slate-400 uppercase tracking-widest leading-none font-sans">New Service Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  placeholder="Treatment name"
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#182625] border border-outline-variant/85 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold font-sans"
                />
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-on-surface-variant/50 dark:text-slate-400 font-bold">₱</span>
                  <input
                    required
                    type="number"
                    value={newServicePrice}
                    onChange={e => setNewServicePrice(e.target.value)}
                    placeholder="Price"
                    className="w-full pl-7 pr-3.5 py-2 bg-white dark:bg-[#182625] border border-outline-variant/85 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-[#2b3d3b] dark:hover:bg-[#354c4a] text-xs font-bold rounded-lg text-on-surface-variant dark:text-slate-200 transition-all cursor-pointer border border-outline-variant/30 dark:border-transparent font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-xs font-black rounded-lg text-white dark:text-on-primary transition-all cursor-pointer shadow-sm hover:shadow font-sans"
                >
                  Save Treatment
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-slate-50/20 dark:bg-[#182625]/20 flex justify-center border-t border-outline-variant/30 dark:border-[#1b2b29]">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full max-w-xs py-2.5 bg-white dark:bg-[#182625] border border-outline-variant/85 dark:border-[#213533] hover:bg-slate-50 dark:hover:bg-[#213533] text-on-surface-variant dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs hover:border-primary/45 font-sans"
              >
                <Plus size={14} weight="bold" />
                Add Service
              </button>
            </div>
          )}
        </div>
      </div>

      <SectionCard title="CHATBOT Q&A" Icon={ChatCircleText}>
        <div className="space-y-4">
          <FormField label="Operating Hours Message">
            <Input Icon={Clock} type="text" value={chatbotOperatingHours} onChange={e => setChatbotOperatingHours(e.target.value)} placeholder="Mon-Sat, 8am-6pm. Closed Sundays and holidays." />
          </FormField>
          <FormField label="Location / Address Details">
            <Input Icon={Globe} type="text" value={chatbotLocationAddress} onChange={e => setChatbotLocationAddress(e.target.value)} placeholder="123 Dental Ave, Quezon City (beside SM North)" />
          </FormField>
          <FormField label="Payment Methods Accepted">
            <Input Icon={Money} type="text" value={chatbotPaymentMethods} onChange={e => setChatbotPaymentMethods(e.target.value)} placeholder="Cash, GCash, Maya, Credit Card" />
          </FormField>
        </div>
      </SectionCard>

      <details className="group border border-outline-variant/60 dark:border-[#1b2b29] bg-white dark:bg-[#131f1e] rounded-3xl overflow-hidden shadow-3xs transition-all duration-300">
        <summary className="px-6 py-4.5 flex items-center justify-between text-sm font-extrabold text-on-surface dark:text-[#f2f0ed] bg-slate-50 dark:bg-[#182625] cursor-pointer list-none select-none hover:bg-slate-100/50 dark:hover:bg-[#213533] transition-all duration-300 border-b border-transparent group-open:border-outline-variant/40 dark:group-open:border-[#1b2b29]">
          <span className="flex items-center gap-2.5 font-sans">
            <Sliders size={18} className="text-on-surface-variant/60 dark:text-slate-400" />
            Advanced Chatbot Persona &amp; Prompts
          </span>
          <span className="material-symbols-outlined text-on-surface-variant/60 dark:text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div className="p-6 space-y-4 text-on-surface dark:text-[#f2f0ed]">
          <FormField label="Chatbot Welcome Greeting Template" hint="Available tags: {clinic_name}, {patient_name}, {owner_name}, {clinic_phone}, {clinic_address}">
            <textarea
              className="w-full p-3.5 bg-slate-50/50 dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-[11px] font-mono focus:outline-none focus:bg-white dark:focus:bg-[#131f1e] focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
              rows="4"
              value={chatbotWelcomeTemplate}
              onChange={e => setChatbotWelcomeTemplate(e.target.value)}
            />
          </FormField>
          <FormField label="Chatbot Agent Instructions / Prompt" hint="Configure chatbot rules, billing parameters, promotional warnings, and general behavior.">
            <textarea
              className="w-full p-3.5 bg-slate-50/50 dark:bg-[#182625] border border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] rounded-xl text-[11px] font-mono focus:outline-none focus:bg-white dark:focus:bg-[#131f1e] focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
              rows="4"
              value={chatbotInstructions}
              onChange={e => setChatbotInstructions(e.target.value)}
              placeholder="e.g. GCash number is 09123456789. Cleanings are 10% off today!"
            />
          </FormField>
        </div>
      </details>
    </div>
  );
}
