import { useState, useEffect } from 'react';
import {
  fetchPublicClinicInfo,
  fetchPublicClinicServices,
  fetchPublicClinicSlots,
  submitPublicBooking,
  lookupPublicAppointment,
  cancelPublicAppointment
} from '../../api';

export default function PublicBookingPortal() {
  // Parse slug from URL: /book/happysmiles or query param
  const [slug] = useState(() => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[2] || 'happysmiles';
  });

  // Dark/Light Theme state for public portal
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('portal_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portal_theme', 'light');
    }
  }, [isDarkMode]);

  // Main Portal Tab: 'book', 'track', 'info'
  const [portalTab, setPortalTab] = useState('book');

  // Clinic Data
  const [clinicInfo, setClinicInfo] = useState(null);
  const [services, setServices] = useState({});
  const [slots, setSlots] = useState({});
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);

  // Booking Wizard States
  const [bookingStep, setBookingStep] = useState(1); // 1: service, 2: date/time, 3: patient info, 4: ticket
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [reason, setReason] = useState('');

  // Submission & Ticket States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Lookup / Tracking States
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [cancellingAppt, setCancellingAppt] = useState(null); // Appt being cancelled
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState(null);

  // Load Clinic Data
  useEffect(() => {
    let isMounted = true;
    const loadPortalData = async () => {
      setIsLoadingClinic(true);
      try {
        const [infoRes, servicesRes, slotsRes] = await Promise.allSettled([
          fetchPublicClinicInfo(slug),
          fetchPublicClinicServices(slug),
          fetchPublicClinicSlots(slug),
        ]);

        if (isMounted) {
          if (infoRes.status === 'fulfilled') setClinicInfo(infoRes.value);
          if (servicesRes.status === 'fulfilled') setServices(servicesRes.value || {});
          if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value || {});
        }
      } catch (err) {
        console.error('Failed to load clinic public data:', err);
      } finally {
        if (isMounted) setIsLoadingClinic(false);
      }
    };

    loadPortalData();
    return () => { isMounted = false; };
  }, [slug]);

  // Submit Booking Handler
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setIsSubmitting(true);

    const payload = {
      service_id: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      name,
      contact,
      email: email || null,
      address,
      age: parseInt(age, 10),
      medical_history: medicalHistory,
      reason,
    };

    try {
      const data = await submitPublicBooking(slug, payload);
      setTicket(data);
      setBookingStep(4);
      // Pre-fill lookup query with generated reference for quick tracking
      if (data.reference_number) {
        setLookupQuery(data.reference_number);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search Lookup Handler
  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupError('');
    setIsSearchingLookup(true);
    try {
      const data = await lookupPublicAppointment(slug, lookupQuery.trim());
      setLookupResults(data);
      if (data.length === 0) {
        setLookupError('No appointments found matching your reference or contact details.');
      }
    } catch (err) {
      setLookupError(err.message || 'Error searching for appointment.');
      setLookupResults(null);
    } finally {
      setIsSearchingLookup(false);
    }
  };

  // Cancel Booking Handler
  const handleConfirmCancel = async () => {
    if (!cancellingAppt) return;
    setIsCancelling(true);
    try {
      await cancelPublicAppointment(slug, {
        reference_number: cancellingAppt.reference_number,
        contact_number: cancellingAppt.patient.contact_number,
        reason: cancelReason || 'Cancelled by patient via portal',
      });
      // Refresh lookup
      const updatedData = await lookupPublicAppointment(slug, lookupQuery.trim());
      setLookupResults(updatedData);
      setCancellingAppt(null);
      setCancelReason('');
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToReferenceClipboard = (ref) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeStr = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Filtered Services List
  const categoriesList = ['ALL', ...Object.keys(services)];
  const getFilteredServices = () => {
    let result = [];
    Object.entries(services).forEach(([cat, list]) => {
      if (selectedCategory === 'ALL' || selectedCategory === cat) {
        list.forEach((srv) => {
          if (
            !serviceSearch ||
            srv.service_name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
            cat.toLowerCase().includes(serviceSearch.toLowerCase())
          ) {
            result.push({ ...srv, categoryName: cat });
          }
        });
      }
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d0c] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ── TOP HERO BRANDING HEADER ── */}
      <header className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white border-b border-teal-700/40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              {clinicInfo?.logo_url ? (
                <img src={clinicInfo.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <span className="material-symbols-outlined text-teal-300 text-3xl">medical_services</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {clinicInfo?.clinic_name || 'Dental Clinic'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Verified Workspace
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-1 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {clinicInfo?.address || 'Manila, Philippines'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {clinicInfo?.contact_number || 'Contact Clinic'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-sm">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Quick Contact Badge */}
            <a
              href={`tel:${clinicInfo?.contact_number || ''}`}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">phone_in_talk</span>
              <span>Call Desk</span>
            </a>
          </div>
        </div>

        {/* ── PORTAL NAVIGATION TABS ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-2 border-t border-white/10 pt-2">
            {[
              { id: 'book', label: 'Book Appointment', icon: 'edit_calendar' },
              { id: 'track', label: 'Track Booking Status', icon: 'find_in_page' },
              { id: 'info', label: 'Clinic Info & FAQs', icon: 'info' },
            ].map((tab) => {
              const isActive = portalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPortalTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer border-b-2 ${
                    isActive
                      ? 'bg-slate-50 dark:bg-[#070d0c] text-teal-800 dark:text-teal-400 border-teal-500 font-extrabold shadow-sm'
                      : 'text-teal-100/70 hover:text-white hover:bg-white/5 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {isLoadingClinic && (
          <div className="py-20 text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">Loading Patient Portal details...</p>
          </div>
        )}

        {!isLoadingClinic && (
          <>
            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: BOOK APPOINTMENT WIZARD                                  */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {portalTab === 'book' && (
              <div className="bg-white dark:bg-[#0c1614] border border-slate-200 dark:border-teal-900/40 rounded-3xl shadow-xl overflow-hidden">
                
                {/* Wizard Header Progress Bar */}
                {bookingStep < 4 && (
                  <div className="bg-slate-50 dark:bg-[#091110] border-b border-slate-200 dark:border-teal-900/30 p-4">
                    <div className="max-w-xl mx-auto flex items-center justify-between">
                      {[
                        { step: 1, label: '1. Service' },
                        { step: 2, label: '2. Date & Time' },
                        { step: 3, label: '3. Details' },
                      ].map((item, idx) => {
                        const isCurrent = bookingStep === item.step;
                        const isDone = bookingStep > item.step;
                        return (
                          <div key={item.step} className="flex items-center flex-1">
                            <button
                              disabled={!isDone && !isCurrent}
                              onClick={() => setBookingStep(item.step)}
                              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isCurrent
                                  ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                                  : isDone
                                  ? 'text-slate-700 dark:text-slate-300'
                                  : 'text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                                isCurrent
                                  ? 'bg-teal-500 text-white'
                                  : isDone
                                  ? 'bg-slate-800 text-white dark:bg-teal-950 dark:text-teal-300'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {isDone ? '✓' : item.step}
                              </span>
                              <span className="hidden sm:inline">{item.label}</span>
                            </button>
                            {idx < 2 && (
                              <div className={`flex-1 h-0.5 mx-3 ${isDone ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 md:p-10">
                  {/* STEP 1: SERVICE SELECTION */}
                  {bookingStep === 1 && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                      <div className="text-center space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Select Dental Treatment</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Choose the dental procedure you require for your visit.</p>
                      </div>

                      {/* Search & Category Filter */}
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:w-72">
                          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                          <input
                            type="text"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            placeholder="Search service name..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/50 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
                          {categoriesList.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                selectedCategory === cat
                                  ? 'bg-teal-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Services Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {getFilteredServices().map((srv) => {
                          const isSelected = selectedService?.id === srv.id;
                          return (
                            <button
                              key={srv.id}
                              onClick={() => {
                                setSelectedService(srv);
                                setBookingStep(2);
                              }}
                              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md ${
                                isSelected
                                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                                  : 'bg-white dark:bg-[#091110] border-slate-200 dark:border-teal-900/30 hover:border-teal-400'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 block mb-1">
                                    {srv.categoryName}
                                  </span>
                                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                    {srv.service_name}
                                  </h3>
                                </div>
                                <span className="text-base font-black text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/40">
                                  ₱{Number(srv.price).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-teal-900/20 text-slate-500 dark:text-slate-400 text-xs">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">schedule</span>
                                  {srv.duration_minutes || 45} mins
                                </span>
                                <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  Select <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {getFilteredServices().length === 0 && (
                          <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
                            <span className="material-symbols-outlined text-4xl">format_list_bulleted</span>
                            <p className="text-xs font-bold">No matching services found.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DATE & TIME SELECTION */}
                  {bookingStep === 2 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="text-center space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Choose Appointment Slot</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Selected Treatment: <strong className="text-teal-600 dark:text-teal-400">{selectedService?.service_name}</strong> (₱{selectedService?.price?.toLocaleString()})
                        </p>
                      </div>

                      {/* Available Dates Horizontal Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Calendar Dates</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {Object.keys(slots).map((dateStr) => {
                            const isSelected = selectedDate === dateStr;
                            return (
                              <button
                                key={dateStr}
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setSelectedTime('');
                                }}
                                className={`px-4 py-3 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer flex flex-col items-center min-w-[100px] ${
                                  isSelected
                                    ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-105'
                                    : 'bg-white dark:bg-[#091110] border-slate-200 dark:border-teal-900/40 text-slate-700 dark:text-slate-200 hover:border-teal-400'
                                }`}
                              >
                                <span>{formatDateLabel(dateStr)}</span>
                                <span className="text-[10px] opacity-80 mt-0.5">{slots[dateStr]?.length} slots available</span>
                              </button>
                            );
                          })}

                          {Object.keys(slots).length === 0 && (
                            <p className="text-slate-400 text-xs py-4 pl-1">No open slots available for the next 30 days. Please contact clinic directly.</p>
                          )}
                        </div>
                      </div>

                      {/* Available Time Grid */}
                      {selectedDate && (
                        <div className="space-y-2 animate-fade-in pt-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Available Time Openings for {formatDateLabel(selectedDate)}
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                            {slots[selectedDate]?.map((timeStr) => {
                              const isSelected = selectedTime === timeStr;
                              return (
                                <button
                                  key={timeStr}
                                  onClick={() => setSelectedTime(timeStr)}
                                  className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-slate-900 text-white dark:bg-teal-400 dark:text-slate-950 border-transparent shadow-md'
                                      : 'bg-slate-50 dark:bg-[#07100e] border-slate-200 dark:border-teal-900/40 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                                  }`}
                                >
                                  {formatTimeStr(timeStr)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-teal-900/30">
                        <button
                          onClick={() => setBookingStep(1)}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          disabled={!selectedDate || !selectedTime}
                          onClick={() => setBookingStep(3)}
                          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                        >
                          Continue to Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PATIENT INFORMATION FORM */}
                  {bookingStep === 3 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="text-center space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Patient Contact Details</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Fill in your information to secure your appointment booking.</p>
                      </div>

                      <form onSubmit={handleSubmitBooking} className="space-y-4">
                        {bookingError && (
                          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            {bookingError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                            <input
                              required
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Juan Dela Cruz"
                              className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mobile Phone Number *</label>
                            <input
                              required
                              type="text"
                              value={contact}
                              onChange={(e) => setContact(e.target.value)}
                              placeholder="09123456789"
                              className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address (Optional)</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="juan@example.com"
                              className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Age *</label>
                            <input
                              required
                              type="number"
                              min="1"
                              max="120"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="28"
                              className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Home Address *</label>
                          <input
                            required
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street, Barangay, City/Town"
                            className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason for Visit / Symptoms *</label>
                          <input
                            required
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Severe toothache, annual dental checkup"
                            className="w-full h-11 px-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medical History & Allergies (Optional)</label>
                          <textarea
                            rows="2"
                            value={medicalHistory}
                            onChange={(e) => setMedicalHistory(e.target.value)}
                            placeholder="e.g. Hypertension, allergic to penicillin, diabetes"
                            className="w-full p-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-teal-900/30">
                          <button
                            type="button"
                            onClick={() => setBookingStep(2)}
                            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center gap-2"
                          >
                            {isSubmitting ? 'Submitting Booking...' : 'Confirm & Generate Ticket'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 4: DIGITAL APPOINTMENT TICKET */}
                  {bookingStep === 4 && (
                    <div className="max-w-md mx-auto text-center space-y-6 py-4 animate-fade-in">
                      <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Booking Confirmed!</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Your appointment reference has been generated. Please keep this ticket for clinic check-in.
                        </p>
                      </div>

                      {/* Ticket Card Container */}
                      <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl text-left border border-teal-500/30">
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-teal-950 to-slate-900 border-b border-teal-800/40 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">Appointment Ticket</span>
                            <span className="text-xs font-bold text-slate-300">{clinicInfo?.clinic_name}</span>
                          </div>
                          <span className="text-2xl font-black text-teal-400">#{ticket?.queue_number}</span>
                        </div>

                        {/* Ticket Content Body */}
                        <div className="p-6 space-y-4 bg-slate-900">
                          {/* Reference Pill */}
                          <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-2xl flex justify-between items-center">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-teal-300/80">Reference Code</p>
                              <p className="text-sm font-mono font-black text-white">{ticket?.reference_number}</p>
                            </div>
                            <button
                              onClick={() => copyToReferenceClipboard(ticket?.reference_number)}
                              className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-teal-400/30 transition-all cursor-pointer"
                            >
                              {copiedRef ? 'Copied!' : 'Copy'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Patient</p>
                              <p className="text-xs font-bold text-slate-100 mt-0.5">{name}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Treatment</p>
                              <p className="text-xs font-bold text-slate-100 mt-0.5">{selectedService?.service_name}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                              <p className="text-xs font-bold text-slate-100 mt-0.5">{formatDateLabel(selectedDate)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                              <p className="text-xs font-bold text-slate-100 mt-0.5">{formatTimeStr(selectedTime)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span className="material-symbols-outlined text-teal-400 text-sm">info</span>
                            <span>SMS notification dispatch initiated. Show this code upon arrival.</span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Quick Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => window.print()}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          Print Ticket
                        </button>
                        <button
                          onClick={() => {
                            setPortalTab('track');
                          }}
                          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">find_in_page</span>
                          Track Status Live
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: TRACK & MANAGE BOOKING                                    */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {portalTab === 'track' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-[#0c1614] border border-slate-200 dark:border-teal-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="text-center space-y-1 max-w-xl mx-auto">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Track Your Appointment</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your Reference Code (e.g. REF-XXXXXX) or Mobile Phone Number to check real-time booking status and queue position.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleLookupSubmit} className="flex gap-2 max-w-lg mx-auto">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-sm">search</span>
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        placeholder="Enter Reference Number or Mobile No."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs font-bold focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingLookup}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      {isSearchingLookup ? 'Searching...' : 'Lookup'}
                    </button>
                  </form>

                  {lookupError && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-bold text-center">
                      {lookupError}
                    </div>
                  )}

                  {/* Results List */}
                  {lookupResults && lookupResults.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                        Matching Appointments ({lookupResults.length})
                      </h3>

                      <div className="space-y-4">
                        {lookupResults.map((appt) => {
                          const statusLower = (appt.status || '').toLowerCase();
                          return (
                            <div
                              key={appt.id}
                              className="p-6 bg-slate-50 dark:bg-[#081210] border border-slate-200 dark:border-teal-900/30 rounded-2xl space-y-4 hover:border-teal-500/50 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-teal-900/30 pb-4">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/40">
                                    {appt.reference_number}
                                  </span>
                                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                                    {appt.service?.service_name}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Status Badge */}
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                    statusLower === 'approved' || statusLower === 'confirmed'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                      : statusLower === 'serving' || statusLower === 'in_progress'
                                      ? 'bg-teal-500 text-white animate-pulse'
                                      : statusLower === 'cancelled'
                                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300'
                                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300'
                                  }`}>
                                    {appt.status}
                                  </span>

                                  <div className="text-right">
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Queue #{appt.queue_number}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{appt.patient?.full_name}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Schedule Date</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{formatDateLabel(appt.appointment_date)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Schedule Time</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{formatTimeStr(appt.appointment_time)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Live Waiting Info</span>
                                  <span className="font-extrabold text-teal-600 dark:text-teal-400">
                                    {appt.patients_ahead > 0 ? `${appt.patients_ahead} ahead in queue` : 'Next in line'}
                                  </span>
                                </div>
                              </div>

                              {/* Cancellation Reason if cancelled */}
                              {statusLower === 'cancelled' && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 dark:text-rose-300">
                                  <strong>Reason:</strong> {appt.cancellation_reason || 'Cancelled'}
                                </div>
                              )}

                              {/* Action Bar */}
                              {statusLower !== 'cancelled' && statusLower !== 'completed' && (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setCancellingAppt(appt);
                                      setCancelReason('');
                                    }}
                                    className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-rose-200 dark:border-rose-800/40"
                                  >
                                    Cancel Booking
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: CLINIC INFO & FAQS                                        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {portalTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Left Card: Operating Info */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-[#0c1614] border border-slate-200 dark:border-teal-900/40 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500">storefront</span>
                      Clinic Schedule
                    </h3>

                    <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-teal-900/30">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <div key={day} className="flex justify-between py-2">
                          <span className="font-bold text-slate-600 dark:text-slate-300">{day}</span>
                          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">09:00 AM - 05:00 PM</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 text-rose-500 font-bold">
                        <span>Sunday</span>
                        <span>Closed / By Appointment</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-teal-300">Accepted Payments</h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['GCash', 'PayMaya', 'Cash', 'Credit Card', 'HMO / Insurance'].map((method) => (
                        <span key={method} className="px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-xs font-bold">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card: FAQs Accordion */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0c1614] border border-slate-200 dark:border-teal-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Find quick answers regarding clinic procedures, appointments, and location directions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {clinicInfo?.faqs && clinicInfo.faqs.length > 0 ? (
                      clinicInfo.faqs.map((faq) => {
                        const isOpen = openFaqId === faq.id;
                        return (
                          <div key={faq.id} className="border border-slate-200 dark:border-teal-900/30 rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                              className="w-full p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center bg-slate-50/50 dark:bg-[#091110] hover:bg-teal-50/30 transition-colors cursor-pointer"
                            >
                              <span>{faq.question}</span>
                              <span className="material-symbols-outlined text-teal-500 text-sm">
                                {isOpen ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>
                            {isOpen && (
                              <div className="p-4 bg-white dark:bg-[#0c1614] border-t border-slate-100 dark:border-teal-900/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-3">
                        {[
                          { q: 'What should I bring on my first dental appointment?', a: 'Please bring a valid ID, your appointment reference code, and any medical records or prescription history if available.' },
                          { q: 'How do I cancel or reschedule my appointment?', a: 'You can easily cancel your booking under the "Track Booking Status" tab using your Reference Code or phone number.' },
                          { q: 'Do you accept walk-in patients?', a: 'Walk-ins are welcomed, but priority queueing is strictly given to patients with confirmed online appointments.' },
                        ].map((faq, i) => (
                          <div key={i} className="border border-slate-200 dark:border-teal-900/30 rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setOpenFaqId(openFaqId === i ? null : i)}
                              className="w-full p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center bg-slate-50/50 dark:bg-[#091110] hover:bg-teal-50/30 transition-colors cursor-pointer"
                            >
                              <span>{faq.q}</span>
                              <span className="material-symbols-outlined text-teal-500 text-sm">
                                {openFaqId === i ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>
                            {openFaqId === i && (
                              <div className="p-4 bg-white dark:bg-[#0c1614] border-t border-slate-100 dark:border-teal-900/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── CANCELLATION MODAL ── */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1614] border border-slate-200 dark:border-teal-900/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">Cancel Appointment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to cancel appointment <strong>{cancellingAppt.reference_number}</strong>?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason for Cancellation</label>
              <textarea
                rows="2"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better"
                className="w-full p-3 bg-slate-50 dark:bg-[#07100e] border border-slate-200 dark:border-teal-900/40 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingAppt(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="mt-12 border-t border-slate-200 dark:border-teal-900/30 py-6 text-center text-xs text-slate-400 bg-white dark:bg-[#070d0c]">
        <p>© 2026 {clinicInfo?.clinic_name || 'Dental Clinic'} · Online Patient Booking Portal</p>
      </footer>
    </div>
  );
}
