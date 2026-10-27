import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  User,
  CaretRight,
  CaretLeft,
  Check,
  CalendarBlank,
  Clock,
  Star,
  ShieldCheck,
  CheckCircle,
  Stethoscope,
  X,
  Phone,
  EnvelopeSimple,
  MapPin,
  MagnifyingGlass,
  ArrowLeft,
  ChatCircleText
} from '@phosphor-icons/react';
import {
  fetchPublicClinicInfo,
  fetchPublicClinicServices,
  fetchPublicClinicSlots,
  submitPublicBooking,
  lookupPublicAppointment,
  cancelPublicAppointment,
  endMessengerConversation
} from '../../api';

// Default Dentists matching Figma design (Image 3)
const DEFAULT_DENTISTS = [
  {
    id: 'dr-hana-park',
    name: 'Dr. Hana Park',
    initials: 'HP',
    specialty: 'General & Cosmetic Dentistry',
    rating: '4.9',
    reviewsCount: 128,
    isAvailable: true,
    avatarBg: '#134E48',
  },
  {
    id: 'dr-james-kim',
    name: 'Dr. James Kim',
    initials: 'JK',
    specialty: 'Orthodontics & Implants',
    rating: '4.8',
    reviewsCount: 97,
    isAvailable: true,
    avatarBg: '#0F766E',
  },
  {
    id: 'dr-sofia-reyes',
    name: 'Dr. Sofia Reyes',
    initials: 'SR',
    specialty: 'Pediatric Dentistry',
    rating: '5',
    reviewsCount: 64,
    isAvailable: false,
    avatarBg: '#64748B',
  },
];

// Mock Returning Patients for instant demo matching Figma design
const MOCK_PATIENTS = {
  'p-001': {
    id: 'P-001',
    fullName: 'Evelyn Hughes',
    birthDate: '1996-07-21',
    age: 30,
    nationality: 'Filipino',
    occupation: 'UI/UX Designer',
    address: '123 Dental Avenue, Makati City',
    contact: '0917-555-0101',
    email: 'evelyn.hughes@example.com',
    insurance: 'Maxicare',
    referral: 'Friend recommendation',
    reason: 'Routine checkup and teeth cleaning',
  },
  'p-002': {
    id: 'P-002',
    fullName: 'Maria Santos',
    birthDate: '1992-03-15',
    age: 34,
    nationality: 'Filipino',
    occupation: 'Accountant',
    address: '456 Ayala Avenue, Makati City',
    contact: '0918-555-0202',
    email: 'maria.santos@example.com',
    insurance: 'Intellicare',
    referral: 'Facebook page',
    reason: 'Tooth sensitivity on upper right molar',
  },
  'p-003': {
    id: 'P-003',
    fullName: 'Juan Dela Cruz',
    birthDate: '1988-11-04',
    age: 38,
    nationality: 'Filipino',
    occupation: 'Architect',
    address: '789 Buendia Avenue, Pasig City',
    contact: '0919-555-0303',
    email: 'juan.delacruz@example.com',
    insurance: 'PhilHealth',
    referral: 'Google search',
    reason: 'Consultation for orthodontic braces',
  },
  'p-004': {
    id: 'P-004',
    fullName: 'Sofia Reyes',
    birthDate: '2000-09-12',
    age: 26,
    nationality: 'Filipino',
    occupation: 'Marketing Specialist',
    address: '101 BGC, Taguig City',
    contact: '0920-555-0404',
    email: 'sofia.reyes@example.com',
    insurance: 'None',
    referral: 'Walk-in referral',
    reason: 'Comprehensive checkup and teeth whitening',
  },
};

export default function PublicBookingPortal() {
  const [slug] = useState(() => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[2] || 'pivodent';
  });

  const [senderId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sender') || params.get('psid') || '';
  });

  const [urlPageId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page_id') || '';
  });

  // Messenger Return & End Conversation states
  const [returnCountdown, setReturnCountdown] = useState(null);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);

  // Clinic & Service Data
  const [clinicInfo, setClinicInfo] = useState(null);
  const [servicesData, setServicesData] = useState({});
  const [slotsData, setSlotsData] = useState({});
  const [loadingClinic, setLoadingClinic] = useState(true);

  // Main flow step:
  // 0: Entry / Patient Type Selection (New vs Returning)
  // 1: Personal Info
  // 2: Dental History
  // 3: Medical History
  // 4: Book Appointment (Sub-steps: 1 Service, 2 Dentist, 3 Date & Time, 4 Confirm)
  // 5: Confirmation / Booking Sent
  const [mainStep, setMainStep] = useState(0);

  // Step 4 Sub-steps: 1: Service, 2: Dentist, 3: Date & Time, 4: Confirm
  const [bookingSubStep, setBookingSubStep] = useState(1);

  // Returning Patient Modal / Lookup state
  const [showReturningLookup, setShowReturningLookup] = useState(false);
  const [returningIdInput, setReturningIdInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Step 1: Personal Information Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [nationality, setNationality] = useState('Filipino');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [dentalInsurance, setDentalInsurance] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [reasonForConsultation, setReasonForConsultation] = useState('');

  // Step 2: Dental History Form State
  const [previousDentist, setPreviousDentist] = useState('');
  const [lastDentalVisit, setLastDentalVisit] = useState('Within the last 6 months');
  const [dentalConcerns, setDentalConcerns] = useState({
    bleedingGums: false,
    sensitiveHotCold: false,
    clickingJaw: false,
    teethGrinding: false,
    pastBraces: false,
  });
  const [additionalDentalNotes, setAdditionalDentalNotes] = useState('');

  // Step 3: Medical History Form State
  const [generalHealth, setGeneralHealth] = useState('Good');
  const [underTreatment, setUnderTreatment] = useState(false);
  const [takingMeds, setTakingMeds] = useState('');
  const [allergies, setAllergies] = useState({
    penicillin: false,
    anesthetics: false,
    latex: false,
    aspirin: false,
    none: true,
  });
  const [medicalConditions, setMedicalConditions] = useState({
    highBloodPressure: false,
    diabetes: false,
    heartAilment: false,
    asthma: false,
    bleedingDisorders: false,
  });
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Step 4: Booking Selections
  const [selectedService, setSelectedService] = useState(null);
  const [serviceCategory, setServiceCategory] = useState('ALL');
  const [selectedDentist, setSelectedDentist] = useState(DEFAULT_DENTISTS[1]); // Default to Dr. James Kim as in Image 3
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [policyAgreed, setPolicyAgreed] = useState(true);

  // Booking Execution & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);

  // Auto-calculate Age from Birth Date
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      if (!isNaN(birth.getTime())) {
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
      }
    }
  }, [birthDate]);

  // Load Clinic Data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoadingClinic(true);
      try {
        const [infoRes, servicesRes, slotsRes] = await Promise.allSettled([
          fetchPublicClinicInfo(slug),
          fetchPublicClinicServices(slug),
          fetchPublicClinicSlots(slug),
        ]);

        if (mounted) {
          if (infoRes.status === 'fulfilled') setClinicInfo(infoRes.value);
          if (servicesRes.status === 'fulfilled') setServicesData(servicesRes.value || {});
          if (slotsRes.status === 'fulfilled') setSlotsData(slotsRes.value || {});
        }
      } catch (err) {
        console.error('Failed to load clinic information:', err);
      } finally {
        if (mounted) setLoadingClinic(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Flatten & Filter Services
  const allServicesList = useMemo(() => {
    const list = [];
    Object.entries(servicesData).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => list.push({ ...item, category }));
      }
    });
    // Fallback sample services if clinic has no services yet
    if (list.length === 0) {
      return [
        { id: 1, service_name: 'Routine Checkup', category: 'General', price: 500, duration_minutes: 30, description: 'Comprehensive oral examination and diagnostic evaluation.' },
        { id: 2, service_name: 'Teeth Cleaning (Oral Prophylaxis)', category: 'Preventive', price: 800, duration_minutes: 45, description: 'Gentle ultrasonic tartar removal and teeth polishing.' },
        { id: 3, service_name: 'Tooth Extraction', category: 'General', price: 1200, duration_minutes: 45, description: 'Safe tooth removal under local anesthesia.' },
        { id: 4, service_name: 'Orthodontic Consultation', category: 'Orthodontics', price: 1000, duration_minutes: 40, description: 'Alignment assessment and orthodontic braces treatment planning.' },
        { id: 5, service_name: 'Composite Dental Filling', category: 'Restorative', price: 900, duration_minutes: 40, description: 'Tooth-colored composite restoration for cavities.' },
        { id: 6, service_name: 'Laser Teeth Whitening', category: 'Cosmetic', price: 4500, duration_minutes: 60, description: 'High-grade professional cosmetic enamel brightening.' },
      ];
    }
    return list;
  }, [servicesData]);

  const serviceCategories = useMemo(() => {
    const cats = new Set(['ALL']);
    allServicesList.forEach((s) => cats.add(s.category || 'General'));
    return Array.from(cats);
  }, [allServicesList]);

  const filteredServices = useMemo(() => {
    if (serviceCategory === 'ALL') return allServicesList;
    return allServicesList.filter((s) => s.category === serviceCategory);
  }, [allServicesList, serviceCategory]);

  // Dentists list: prefer clinicInfo.dentists if available, fallback to DEFAULT_DENTISTS
  const dentistsList = useMemo(() => {
    return clinicInfo?.dentists && clinicInfo.dentists.length > 0
      ? clinicInfo.dentists
      : DEFAULT_DENTISTS;
  }, [clinicInfo]);

  // Set default selected service if not set
  useEffect(() => {
    if (!selectedService && allServicesList.length > 0) {
      setSelectedService(allServicesList[0]);
    }
  }, [allServicesList, selectedService]);

  // Viewed Month state for calendar navigation (default to current month)
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [loadingMonthSlots, setLoadingMonthSlots] = useState(false);

  // Next 12 months for dropdown selector
  const upcomingMonthsList = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      list.push({ val, label });
    }
    return list;
  }, []);

  const isFirstMonth = useMemo(() => {
    const today = new Date();
    return (
      viewedMonth.getFullYear() === today.getFullYear() &&
      viewedMonth.getMonth() === today.getMonth()
    );
  }, [viewedMonth]);

  const isLastMonth = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 11, 1);
    return (
      viewedMonth.getFullYear() === maxDate.getFullYear() &&
      viewedMonth.getMonth() === maxDate.getMonth()
    );
  }, [viewedMonth]);

  const minDateStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const maxDateStr = useMemo(() => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const handlePrevMonth = () => {
    const today = new Date();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const prev = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
    if (prev >= minMonth) {
      setViewedMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);
    const next = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
    if (next <= maxMonth) {
      setViewedMonth(next);
    }
  };

  const handleMonthSelect = (yearMonthStr) => {
    if (!yearMonthStr) return;
    const parts = yearMonthStr.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (y && m) {
        setViewedMonth(new Date(y, m - 1, 1));
      }
    }
  };

  const handleDateSelect = (dateStr) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (y && m) {
        const targetMonth = new Date(y, m - 1, 1);
        if (
          targetMonth.getFullYear() !== viewedMonth.getFullYear() ||
          targetMonth.getMonth() !== viewedMonth.getMonth()
        ) {
          setViewedMonth(targetMonth);
        }
      }
    }
  };

  // Available dates for the currently viewed month (excludes past dates and Sundays)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = viewedMonth.getFullYear();
    const month = viewedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d < today) {
        continue;
      }
      // Skip Sundays (0) if clinic is closed
      if (d.getDay() !== 0) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        dates.push({
          dateStr,
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: d.getDate(),
          monthName: d.toLocaleDateString('en-US', { month: 'short' }),
          fullFormatted: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        });
      }
    }
    return dates;
  }, [viewedMonth]);

  // Dynamically fetch and merge slots when viewedMonth changes
  useEffect(() => {
    const year = viewedMonth.getFullYear();
    const mm = String(viewedMonth.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${mm}`;

    const hasMonthData = Object.keys(slotsData).some((d) => d.startsWith(monthKey));
    if (!hasMonthData && slug) {
      let active = true;
      setLoadingMonthSlots(true);
      fetchPublicClinicSlots(slug, { month: monthKey })
        .then((newSlots) => {
          if (active && newSlots && typeof newSlots === 'object') {
            setSlotsData((prev) => ({ ...prev, ...newSlots }));
          }
        })
        .catch((err) => console.error('Failed to load slots for month:', err))
        .finally(() => {
          if (active) setLoadingMonthSlots(false);
        });
      return () => {
        active = false;
      };
    }
  }, [viewedMonth, slug, slotsData]);

  // Synchronize default selected date when month changes or on initial load
  useEffect(() => {
    if (availableDates.length > 0) {
      const isSelectedInView = availableDates.some((d) => d.dateStr === selectedDate);
      if (!selectedDate || !isSelectedInView) {
        setSelectedDate(availableDates[0].dateStr);
      }
    }
  }, [availableDates, selectedDate]);

  // Available Time Slots for selected date (only real available slots from clinic schedule)
  const availableTimeSlots = useMemo(() => {
    if (slotsData[selectedDate] && Array.isArray(slotsData[selectedDate])) {
      return slotsData[selectedDate].map(s => s.slot_time ? s.slot_time.substring(0, 5) : s);
    }
    // Return empty array when date is fully booked or closed
    return [];
  }, [slotsData, selectedDate]);

  useEffect(() => {
    if (availableTimeSlots.length > 0) {
      if (!selectedTime || !availableTimeSlots.includes(selectedTime)) {
        setSelectedTime(availableTimeSlots[0]);
      }
    } else {
      setSelectedTime('');
    }
  }, [availableTimeSlots, selectedTime]);

  // Handler: Select Returning Patient Mock or Lookup
  const handleSelectMockPatient = (patientKey) => {
    const p = MOCK_PATIENTS[patientKey.toLowerCase()];
    if (p) {
      setFullName(p.fullName);
      setBirthDate(p.birthDate);
      setAge(p.age.toString());
      setNationality(p.nationality);
      setOccupation(p.occupation);
      setAddress(p.address);
      setContact(p.contact);
      setEmail(p.email);
      setDentalInsurance(p.insurance);
      setReferralSource(p.referral);
      setReasonForConsultation(p.reason);
      setShowReturningLookup(false);
      setLookupError('');
      // Jump directly to Step 4 (Book Appointment)
      setMainStep(4);
      setBookingSubStep(1);
    }
  };

  const handleLookupSubmit = async (e) => {
    e?.preventDefault();
    if (!returningIdInput.trim()) return;

    const trimmed = returningIdInput.trim().toLowerCase();
    if (MOCK_PATIENTS[trimmed]) {
      handleSelectMockPatient(trimmed);
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await lookupPublicAppointment(slug, trimmed);
      if (res?.patient_found && res.patient) {
        const p = res.patient;
        setFullName(p.full_name || p.name || '');
        setBirthDate(p.dob || p.birth_date || '');
        setAge(p.age ? p.age.toString() : '');
        setNationality(p.nationality || 'Filipino');
        setOccupation(p.occupation || '');
        setAddress(p.address || '');
        setContact(p.contact || p.contact_number || '');
        setEmail(p.email || '');
        setDentalInsurance(p.insurance || '');
        setShowReturningLookup(false);
        setMainStep(4);
        setBookingSubStep(1);
      } else if (res?.appointments && res.appointments.length > 0) {
        const first = res.appointments[0];
        if (first.patient) {
          setFullName(first.patient.full_name || '');
          setContact(first.patient.contact_number || '');
          setEmail(first.patient.email || '');
          setAddress(first.patient.address || '');
          setAge(first.patient.age ? first.patient.age.toString() : '');
        }
        setShowReturningLookup(false);
        setMainStep(4);
        setBookingSubStep(1);
      } else {
        setLookupError('No patient record found for that ID or contact number. Please check or proceed as a New Patient.');
      }
    } catch (err) {
      setLookupError(err.message || 'Error searching patient record.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Submit Final Booking
  const handleFinalBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingError('Please choose a dental service, date, and appointment time.');
      return;
    }
    if (!fullName.trim() || !contact.trim()) {
      setBookingError('Please provide your full name and contact number.');
      setMainStep(1);
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    // Format Medical History string from form questionnaires
    const allergyList = Object.entries(allergies)
      .filter(([k, v]) => v && k !== 'none')
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    const conditionList = Object.entries(medicalConditions)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    const combinedMedicalHistory = [
      generalHealth ? `General Health: ${generalHealth}` : null,
      allergyList ? `Allergies: ${allergyList}` : 'No known allergies',
      conditionList ? `Conditions: ${conditionList}` : null,
      takingMeds ? `Medications: ${takingMeds}` : null,
    ].filter(Boolean).join('; ');

    const dentalConcernsList = Object.entries(dentalConcerns)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    const payload = {
      service_id: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      name: fullName.trim(),
      contact: contact.trim() || '0917-000-0000',
      email: email.trim() || undefined,
      address: address.trim() || 'Makati City',
      age: parseInt(age, 10) || 28,
      birth_date: birthDate || undefined,
      nationality: nationality || 'Filipino',
      occupation: occupation || undefined,
      insurance: dentalInsurance || undefined,
      referral: referralSource || undefined,
      medical_history: combinedMedicalHistory || 'None',
      dental_history: dentalConcernsList || undefined,
      reason: reasonForConsultation.trim() || selectedService.service_name,
      dentist_name: selectedDentist?.name || 'Dr. James Kim',
      sender_id: senderId || undefined,
    };

    try {
      const res = await submitPublicBooking(slug, payload);
      const formattedDateObj = new Date(`${selectedDate}T${selectedTime}`);
      const formattedDateTime = !isNaN(formattedDateObj.getTime())
        ? formattedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
          ' at ' +
          formattedDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : `${selectedDate} at ${selectedTime}`;

      const effectivePageId = res.fb_page_id || urlPageId || clinicInfo?.fb_page_id || '';
      const isFromMessenger = Boolean(senderId || res.fb_messenger_id);

      setConfirmationData({
        referenceNumber: res.reference_number || 'APT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        patientName: fullName.trim(),
        dentistName: selectedDentist?.name || 'Dr. James Kim',
        dentistInitials: selectedDentist?.initials || 'JK',
        serviceName: selectedService.service_name,
        dateTimeStr: res.date_time || formattedDateTime,
        contact: contact.trim(),
        fbPageId: effectivePageId,
        senderId: senderId || res.fb_messenger_id || '',
        isFromMessenger: isFromMessenger,
      });
      setMainStep(5);
    } catch (err) {
      setBookingError(err.message || 'Failed to schedule appointment. Please try selecting another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Messenger Return & End Conversation Helpers
  const handleReturnToMessenger = () => {
    const pageId = confirmationData?.fbPageId || urlPageId || clinicInfo?.fb_page_id;

    // 1. Try Messenger Extensions SDK to close webview cleanly
    if (typeof window !== 'undefined' && window.MessengerExtensions && typeof window.MessengerExtensions.requestCloseBrowser === 'function') {
      try {
        window.MessengerExtensions.requestCloseBrowser(
          function success() {},
          function error() {
            if (pageId) {
              window.location.href = `https://m.me/${pageId}`;
            } else {
              try { window.close(); } catch (e) {}
            }
          }
        );
        return;
      } catch (e) {
        // Fallback below
      }
    }

    // 2. Direct deep link back to Facebook Messenger chat thread
    if (pageId) {
      window.location.href = `https://m.me/${pageId}`;
    } else {
      try {
        window.close();
      } catch (e) {}
    }
  };

  const handleEndConversation = async () => {
    setIsEndingChat(true);
    setReturnCountdown(null); // Pause auto redirect
    try {
      const activeSender = senderId || confirmationData?.senderId;
      if (activeSender) {
        await endMessengerConversation(slug, activeSender);
      }
      setChatEnded(true);
    } catch (e) {
      setChatEnded(true);
    } finally {
      setIsEndingChat(false);
    }
  };

  // Handle Messenger return countdown
  useEffect(() => {
    if (mainStep === 5 && confirmationData?.isFromMessenger && !chatEnded && !cancellationSuccess) {
      setReturnCountdown(4);
    } else {
      setReturnCountdown(null);
    }
  }, [mainStep, confirmationData?.isFromMessenger, chatEnded, cancellationSuccess]);

  useEffect(() => {
    if (returnCountdown === null) return;
    if (returnCountdown <= 0) {
      handleReturnToMessenger();
      return;
    }
    const timer = setTimeout(() => {
      setReturnCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [returnCountdown]);

  // Cancel Booking
  const handleCancelBookingSubmit = async () => {
    if (!confirmationData?.referenceNumber) return;
    setIsCancelling(true);
    try {
      await cancelPublicAppointment(slug, {
        reference_number: confirmationData.referenceNumber,
        contact_number: confirmationData.contact || contact,
        reason: cancelReasonInput || 'Patient request via portal',
      });
      setCancellationSuccess(true);
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message || 'Unable to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Reset to Home
  const handleResetToHome = () => {
    setMainStep(0);
    setBookingSubStep(1);
    setConfirmationData(null);
    setCancellationSuccess(false);
    setBookingError('');
    setReturnCountdown(null);
    setChatEnded(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col select-none">
      
      {/* Top Header Bar (Fixed / Consistent across all screens) */}
      <header className="w-full bg-white border-b border-slate-100 px-6 sm:px-12 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Clinic Logo Mark (Custom clinic logo if available, or default SVG icon) */}
          {clinicInfo?.logo_url ? (
            <img
              src={clinicInfo.logo_url}
              alt={clinicInfo.clinic_name}
              className="w-10 h-10 rounded-xl object-contain border border-slate-200/90 bg-white p-1 shadow-3xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center p-1.5 shadow-3xs">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0E3F39"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C7.5 2 4 5 4 9c0 3.5 1.5 6.5 2.5 10 .8 2.8 2 3 3.5 3s2-2 2-4c0-2 .5-2 2-2s2 0 2 2c0 2 .5 4 2 4s2.7-.2 3.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3.5-7-8-7z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-[#0E3F39] leading-tight">
              {clinicInfo?.clinic_name || 'PIVODENT'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-medium leading-tight">
                Dental Clinic
              </span>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/70 leading-none">
                under Pivodent System
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Back button when in sub-steps */}
        {mainStep > 0 && (
          <button
            type="button"
            onClick={() => {
              if (mainStep === 5) {
                handleResetToHome();
              } else if (mainStep === 4 && bookingSubStep > 1) {
                setBookingSubStep((prev) => prev - 1);
              } else if (mainStep === 4 && bookingSubStep === 1) {
                setMainStep(3);
              } else {
                setMainStep((prev) => prev - 1);
              }
            }}
            className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Back</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-start">

        {/* ========================================================================= */}
        {/* SCREEN 0: BOOK AN APPOINTMENT (New vs Returning Patient Selection - Image 5) */}
        {/* ========================================================================= */}
        {mainStep === 0 && (
          <div className="w-full max-w-md mx-auto my-auto py-10 flex flex-col items-center text-center animate-fadeIn">
            {/* Top Icon Badge */}
            <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-[#1A8A7A] mb-4 shadow-3xs">
              <Stethoscope size={28} weight="duotone" />
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-2xl sm:text-[26px] font-black text-[#0E3F39] tracking-tight mb-1.5">
              Book an Appointment
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-8">
              Are you a new or returning patient?
            </p>

            {/* Selection Options */}
            <div className="w-full flex flex-col gap-3.5">
              
              {/* Option 1: New Patient */}
              <div
                onClick={() => setMainStep(1)}
                className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#1A8A7A] hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-teal-50 group-hover:text-[#1A8A7A] transition-colors">
                    <UserPlus size={22} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#0E3F39] transition-colors">
                      New Patient
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      First time visiting PIVODENT? Fill in your information and book your appointment.
                    </p>
                  </div>
                </div>
                <CaretRight size={18} className="text-slate-400 group-hover:text-[#1A8A7A] shrink-0 transition-colors" />
              </div>

              {/* Option 2: Returning Patient */}
              <div
                onClick={() => setShowReturningLookup(true)}
                className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#1A8A7A] hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-teal-50 group-hover:text-[#1A8A7A] transition-colors">
                    <User size={22} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#0E3F39] transition-colors">
                      Returning Patient
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Already registered? Enter your Patient ID to access your record and book.
                    </p>
                  </div>
                </div>
                <CaretRight size={18} className="text-slate-400 group-hover:text-[#1A8A7A] shrink-0 transition-colors" />
              </div>

            </div>

            {/* Mock IDs footer hint from Figma design */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span>Mock IDs:</span>
              {['P-001', 'P-002', 'P-003', 'P-004'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectMockPatient(id)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-[#0E3F39] font-medium text-slate-600 cursor-pointer transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>

            {/* Returning Patient Lookup Modal */}
            {showReturningLookup && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Returning Patient Access</h3>
                    <button
                      type="button"
                      onClick={() => setShowReturningLookup(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Enter your Patient ID (e.g. <strong>P-001</strong>) or registered phone number:
                  </p>

                  <form onSubmit={handleLookupSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        value={returningIdInput}
                        onChange={(e) => setReturningIdInput(e.target.value)}
                        placeholder="e.g. P-001 or 0917-555-0101"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                      />
                      <MagnifyingGlass size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>

                    {lookupError && (
                      <p className="text-[11px] text-rose-600 font-medium">{lookupError}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReturningLookup(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={lookupLoading || !returningIdInput.trim()}
                        className="flex-1 py-2 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {lookupLoading ? 'Searching...' : 'Continue'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEPS 1 to 4: TOP STEPPER BAR (Images 1, 3, 4) */}
        {/* ========================================================================= */}
        {mainStep >= 1 && mainStep <= 4 && (
          <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-between px-2 text-xs font-semibold">
              {[
                { num: 1, label: 'Personal Info' },
                { num: 2, label: 'Dental History' },
                { num: 3, label: 'Medical History' },
                { num: 4, label: 'Book Appointment' },
              ].map((step, idx) => {
                const isCompleted = mainStep > step.num;
                const isActive = mainStep === step.num;
                return (
                  <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#1A8A7A] text-white'
                            : isActive
                            ? 'bg-[#0E3F39] text-white ring-4 ring-[#0E3F39]/15'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check size={12} weight="bold" /> : step.num}
                      </div>
                      <span
                        className={`hidden sm:inline transition-colors ${
                          isActive
                            ? 'text-[#0E3F39] font-bold'
                            : isCompleted
                            ? 'text-slate-700 font-medium'
                            : 'text-slate-400 font-normal'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {idx < 3 && (
                      <div
                        className={`flex-1 h-[2px] mx-2 sm:mx-4 transition-colors ${
                          mainStep > step.num ? 'bg-[#1A8A7A]' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL INFORMATION (Image 1 & 4) */}
        {/* ========================================================================= */}
        {mainStep === 1 && (
          <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 animate-fadeIn">
            
            {/* Card 1: Personal Information */}
            <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#0E3F39] pb-2 border-b border-slate-100">
                Personal Information
              </h3>

              {/* Full Name * */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Last Name, First Name Middle Name"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                />
              </div>

              {/* Date of Birth * & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Age
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={age}
                    placeholder="Auto-calculated"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Nationality * & Occupation * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nationality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Filipino"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Occupation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Accountant / Student"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>
              </div>

              {/* Home Address * */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Home Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Barangay, City, Province"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                />
              </div>

              {/* Contact & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="0917-123-4567"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>
              </div>

              {/* Dental Insurance */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Dental Insurance
                </label>
                <input
                  type="text"
                  value={dentalInsurance}
                  onChange={(e) => setDentalInsurance(e.target.value)}
                  placeholder="e.g. Maxicare / Intellicare / PhilHealth"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                />
              </div>
            </div>

            {/* Card 2: Additional Information */}
            <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#0E3F39] pb-2 border-b border-slate-100">
                Additional Information
              </h3>

              {/* Whom may we thank for referring you? */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Whom may we thank for referring you?
                </label>
                <input
                  type="text"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  placeholder="e.g. Friend, Social Media, Google Search"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                />
              </div>

              {/* Reason for Consultation * */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Reason for Consultation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reasonForConsultation}
                  onChange={(e) => setReasonForConsultation(e.target.value)}
                  placeholder="Describe your main concern or chief complaint..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39] resize-none"
                />
              </div>
            </div>

            {bookingError && (
              <p className="text-xs text-rose-600 font-medium text-center">{bookingError}</p>
            )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-6 sm:px-12 py-3 flex items-center justify-between z-30 shadow-md">
              <button
                type="button"
                onClick={() => setMainStep(0)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim() || !contact.trim()) {
                    setBookingError('Please fill in your Full Name and Contact Number.');
                    return;
                  }
                  setBookingError('');
                  setMainStep(2);
                }}
                className="px-7 py-2.5 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <CaretRight size={14} weight="bold" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DENTAL HISTORY */}
        {/* ========================================================================= */}
        {mainStep === 2 && (
          <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 animate-fadeIn">
            <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#0E3F39] pb-2 border-b border-slate-100">
                Dental History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Previous Dentist (Optional)
                  </label>
                  <input
                    type="text"
                    value={previousDentist}
                    onChange={(e) => setPreviousDentist(e.target.value)}
                    placeholder="e.g. Dr. Martinez"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Last Dental Visit
                  </label>
                  <select
                    value={lastDentalVisit}
                    onChange={(e) => setLastDentalVisit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39] cursor-pointer"
                  >
                    <option value="Within the last 6 months">Within the last 6 months</option>
                    <option value="6 to 12 months ago">6 to 12 months ago</option>
                    <option value="More than a year ago">More than a year ago</option>
                    <option value="First dental visit ever">First dental visit ever</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes for common symptoms */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Do you currently experience any of the following?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {[
                    { key: 'bleedingGums', label: 'Bleeding gums when brushing or flossing' },
                    { key: 'sensitiveHotCold', label: 'Tooth sensitivity to hot, cold, or sweets' },
                    { key: 'clickingJaw', label: 'Clicking, popping, or pain in jaw joint' },
                    { key: 'teethGrinding', label: 'Clenching or grinding teeth during sleep' },
                    { key: 'pastBraces', label: 'Past orthodontic braces or retainers' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={dentalConcerns[item.key]}
                        onChange={(e) =>
                          setDentalConcerns((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="rounded text-[#0E3F39] focus:ring-[#0E3F39] w-4 h-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Additional Dental Notes or Specific Complaints
                </label>
                <textarea
                  rows={2}
                  value={additionalDentalNotes}
                  onChange={(e) => setAdditionalDentalNotes(e.target.value)}
                  placeholder="Any specific dental preferences or past bad experiences..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39] resize-none"
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-6 sm:px-12 py-3 flex items-center justify-between z-30 shadow-md">
              <button
                type="button"
                onClick={() => setMainStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setMainStep(3)}
                className="px-7 py-2.5 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: MEDICAL HISTORY */}
        {/* ========================================================================= */}
        {mainStep === 3 && (
          <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 animate-fadeIn">
            <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#0E3F39] pb-2 border-b border-slate-100">
                Medical History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    General Health Status
                  </label>
                  <select
                    value={generalHealth}
                    onChange={(e) => setGeneralHealth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39] cursor-pointer"
                  >
                    <option value="Good">Good / Healthy</option>
                    <option value="Fair">Fair</option>
                    <option value="Under Ongoing Treatment">Under Ongoing Treatment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Currently Taking Any Medications?
                  </label>
                  <input
                    type="text"
                    value={takingMeds}
                    onChange={(e) => setTakingMeds(e.target.value)}
                    placeholder="e.g. Maintenance meds, vitamins (or None)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>
              </div>

              {/* Known Allergies */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Known Drug & Material Allergies
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                  {[
                    { key: 'penicillin', label: 'Penicillin' },
                    { key: 'anesthetics', label: 'Anesthetics' },
                    { key: 'latex', label: 'Latex / Rubber' },
                    { key: 'aspirin', label: 'Aspirin' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={allergies[item.key]}
                        onChange={(e) =>
                          setAllergies((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="rounded text-[#0E3F39] focus:ring-[#0E3F39] w-4 h-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Existing Medical Conditions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {[
                    { key: 'highBloodPressure', label: 'High Blood Pressure / Hypertension' },
                    { key: 'diabetes', label: 'Diabetes' },
                    { key: 'heartAilment', label: 'Heart Ailment / Murmur' },
                    { key: 'asthma', label: 'Asthma / Respiratory Conditions' },
                    { key: 'bleedingDisorders', label: 'Bleeding Tendency / Blood Thinners' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={medicalConditions[item.key]}
                        onChange={(e) =>
                          setMedicalConditions((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="rounded text-[#0E3F39] focus:ring-[#0E3F39] w-4 h-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Emergency Contact Person
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Maria Santos (Spouse)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="0918-987-6543"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E3F39]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-6 sm:px-12 py-3 flex items-center justify-between z-30 shadow-md">
              <button
                type="button"
                onClick={() => setMainStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainStep(4);
                  setBookingSubStep(1);
                }}
                className="px-7 py-2.5 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: BOOK APPOINTMENT (Sub-steps: Service, Dentist, Date/Time, Confirm) */}
        {/* ========================================================================= */}
        {mainStep === 4 && (
          <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 animate-fadeIn">
            
            {/* Booking Sub-stepper matching Figma Image 3 */}
            <div className="w-full bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs font-semibold shadow-3xs">
              {[
                { num: 1, label: 'Service' },
                { num: 2, label: 'Dentist' },
                { num: 3, label: 'Date & Time' },
                { num: 4, label: 'Confirm' },
              ].map((sub, idx) => {
                const isCompleted = bookingSubStep > sub.num;
                const isActive = bookingSubStep === sub.num;
                return (
                  <div key={sub.num} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-[#1A8A7A] text-white'
                            : isActive
                            ? 'bg-[#0E3F39] text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check size={10} weight="bold" /> : sub.num}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs ${
                          isActive
                            ? 'text-[#0E3F39] font-bold'
                            : isCompleted
                            ? 'text-slate-700 font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        {sub.label}
                      </span>
                    </div>

                    {idx < 3 && (
                      <div
                        className={`flex-1 h-[1.5px] mx-2 sm:mx-3 ${
                          bookingSubStep > sub.num ? 'bg-[#1A8A7A]' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sub-step 1: Choose Dental Treatment / Service */}
            {bookingSubStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold text-[#0E3F39]">Choose a Service</h2>
                  <p className="text-xs text-slate-500">Select the treatment or consultation you require:</p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {serviceCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setServiceCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                        serviceCategory === cat
                          ? 'bg-[#0E3F39] text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredServices.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/30 border-[#1A8A7A] shadow-xs'
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {srv.service_name}
                            </h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#1A8A7A] text-white flex items-center justify-center shrink-0">
                                <Check size={12} weight="bold" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {srv.description || 'Professional dental care and treatment.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 font-medium">
                            {srv.duration_minutes || 30} mins
                          </span>
                          <span className="font-bold text-[#0E3F39]">
                            ₱{(srv.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-step 2: Choose a Dentist (Exact Match to Figma Image 3!) */}
            {bookingSubStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-base font-bold text-[#0E3F39]">
                  Choose a Dentist
                </h2>

                <div className="space-y-3">
                  {dentistsList.map((dentist) => {
                    const isSelected = selectedDentist?.id === dentist.id;
                    const isAvailable = dentist.isAvailable !== false && dentist.is_available !== false;

                    return (
                      <div
                        key={dentist.id}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedDentist(dentist);
                          }
                        }}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          !isAvailable
                            ? 'bg-white border-slate-200/80 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-teal-50/20 border-2 border-[#1A8A7A] shadow-xs cursor-pointer'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        {/* Dentist Profile */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ background: dentist.avatarBg || '#134E48' }}
                          >
                            {dentist.initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {dentist.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {dentist.specialty}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1">
                              <Star size={12} weight="fill" className="text-amber-400" />
                              <span className="font-bold">{dentist.rating}</span>
                              <span className="text-slate-400">({dentist.reviewsCount || 100} reviews)</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Selected Checkmark or Unavailable badge matching Figma Image 3 */}
                        <div>
                          {!isAvailable ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                              Unavailable
                            </span>
                          ) : isSelected ? (
                            <div className="w-6 h-6 rounded-full border border-[#1A8A7A] flex items-center justify-center text-[#1A8A7A]">
                              <Check size={14} weight="bold" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination carousel dots from Figma Image 3 */}
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <span className="w-2 h-2 rounded-full bg-[#0E3F39]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
              </div>
            )}

            {/* Sub-step 3: Choose Date & Time */}
            {bookingSubStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div>
                    <h2 className="text-base font-bold text-[#0E3F39]">Select Date & Time</h2>
                    <p className="text-xs text-slate-500">Pick an available appointment schedule:</p>
                  </div>

                  {/* Direct Date Picker Jump */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-3xs">
                      <CalendarBlank size={15} weight="bold" className="text-teal-700 shrink-0" />
                      <span>Select Date:</span>
                      <input
                        type="date"
                        min={minDateStr}
                        max={maxDateStr}
                        value={selectedDate}
                        onChange={(e) => handleDateSelect(e.target.value)}
                        className="text-xs font-bold text-[#0E3F39] bg-transparent border-0 focus:outline-none cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Month Navigator Header */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-3xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isFirstMonth}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-3xs"
                    title="Previous Month"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0E3F39] uppercase tracking-wide hidden sm:inline">
                      Month:
                    </span>
                    <select
                      value={`${viewedMonth.getFullYear()}-${String(viewedMonth.getMonth() + 1).padStart(2, '0')}`}
                      onChange={(e) => handleMonthSelect(e.target.value)}
                      className="text-xs sm:text-sm font-bold text-[#0E3F39] bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-600 cursor-pointer shadow-3xs"
                    >
                      {upcomingMonthsList.map((m) => (
                        <option key={m.val} value={m.val}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={isLastMonth}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-3xs"
                    title="Next Month"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>

                {/* Date Selection Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Available Dates in {viewedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </label>
                    {availableDates.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {availableDates.length} open {availableDates.length === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </div>

                  {availableDates.length > 0 ? (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                      {availableDates.map((item) => {
                        const isSelected = selectedDate === item.dateStr;
                        const hasLoadedSlots = slotsData && Object.keys(slotsData).length > 0;
                        const slotsForDay = slotsData[item.dateStr];
                        const isFullyBooked = hasLoadedSlots && (!slotsForDay || slotsForDay.length === 0);

                        return (
                          <button
                            key={item.dateStr}
                            type="button"
                            onClick={() => handleDateSelect(item.dateStr)}
                            className={`p-3 rounded-2xl border text-center shrink-0 transition-all cursor-pointer min-w-[76px] ${
                              isSelected
                                ? 'bg-[#0E3F39] text-white border-[#0E3F39] shadow-xs scale-102 ring-2 ring-teal-600/30'
                                : isFullyBooked
                                ? 'bg-slate-50 border-slate-200/60 text-slate-400 hover:bg-slate-100'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <p className="text-[10px] font-semibold uppercase">{item.dayName}</p>
                            <p className="text-base font-black my-0.5">{item.dayNumber}</p>
                            <p className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                              {isFullyBooked ? (
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">Full</span>
                              ) : (
                                item.monthName
                              )}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                      No remaining open dates in this month. Please navigate to the next month above.
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Available Time Slots for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Selected Date'}
                    </label>
                    {availableTimeSlots.length > 0 && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {availableTimeSlots.length} open {availableTimeSlots.length === 1 ? 'slot' : 'slots'}
                      </span>
                    )}
                  </div>

                  {loadingMonthSlots ? (
                    <div className="p-5 bg-teal-50/50 border border-teal-100 rounded-2xl text-center space-y-1 animate-pulse">
                      <p className="text-xs font-bold text-[#0E3F39]">Checking appointment slots...</p>
                      <p className="text-[11px] text-teal-700">Retrieving clinic availability for this schedule.</p>
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        const [hh, mm] = slot.split(':');
                        const hourNum = parseInt(hh, 10);
                        const ampm = hourNum >= 12 ? 'PM' : 'AM';
                        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
                        const displayTime = `${formattedHour}:${mm} ${ampm}`;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#1A8A7A] text-white border-[#1A8A7A] shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Clock size={12} weight="bold" />
                            <span>{displayTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                        <Clock size={18} weight="bold" />
                      </div>
                      <h4 className="text-xs font-bold text-amber-900">All Slots Booked for This Date</h4>
                      <p className="text-[11.5px] text-amber-700 leading-relaxed max-w-sm mx-auto">
                        There are no available time slots remaining on this day. Please select another date from the calendar above to choose your preferred time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-step 4: Review & Confirm */}
            {bookingSubStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold text-[#0E3F39]">Review & Confirm</h2>
                  <p className="text-xs text-slate-500">Please review your booking information before submitting:</p>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Patient</span>
                    <span className="text-xs font-bold text-slate-900">{fullName || 'Patient'}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Service</span>
                    <span className="text-xs font-bold text-[#0E3F39]">{selectedService?.service_name}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Dentist</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#134E48] text-white flex items-center justify-center text-[9px] font-bold">
                        {selectedDentist?.initials || 'JK'}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{selectedDentist?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Date & Time</span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedDate} at {selectedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Estimated Fee</span>
                    <span className="font-extrabold text-sm text-[#0E3F39]">
                      ₱{(selectedService?.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Policy Agreement Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyAgreed}
                    onChange={(e) => setPolicyAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#0E3F39] focus:ring-[#0E3F39] w-4 h-4"
                  />
                  <span>
                    I confirm that the personal and medical details provided are accurate. I agree to the clinic booking and cancellation policies.
                  </span>
                </label>

                {bookingError && (
                  <p className="text-xs text-rose-600 font-medium text-center">{bookingError}</p>
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-6 sm:px-12 py-3 flex items-center justify-between z-30 shadow-md">
              <button
                type="button"
                onClick={() => {
                  if (bookingSubStep > 1) {
                    setBookingSubStep((prev) => prev - 1);
                  } else {
                    setMainStep(3);
                  }
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Back</span>
              </button>

              {bookingSubStep < 4 ? (
                <button
                  type="button"
                  disabled={bookingSubStep === 3 && (!selectedTime || availableTimeSlots.length === 0)}
                  onClick={() => {
                    if (bookingSubStep === 3 && (!selectedTime || availableTimeSlots.length === 0)) {
                      return;
                    }
                    setBookingSubStep((prev) => prev + 1);
                  }}
                  className="px-7 py-2.5 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <CaretRight size={14} weight="bold" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || !policyAgreed}
                  onClick={handleFinalBookingSubmit}
                  className="px-8 py-2.5 rounded-xl bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Booking...' : 'Book Appointment'}</span>
                  <Check size={14} weight="bold" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: BOOKING CONFIRMATION SCREEN (Exact Match to Figma Image 2!) */}
        {/* ========================================================================= */}
        {mainStep === 5 && confirmationData && (
          <div className="w-full max-w-md mx-auto my-auto py-8 flex flex-col items-center text-center animate-fadeIn">
            
            {/* Success Checkmark Circle with soft green glow */}
            <div className="w-16 h-16 rounded-full bg-[#0E3F39] text-white flex items-center justify-center mb-4 ring-8 ring-emerald-500/15 shadow-sm">
              <Check size={32} weight="bold" />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl font-black text-[#0E3F39] tracking-tight mb-2">
              Booking sent!
            </h1>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
              Your appointment has been successfully scheduled. We will send you a notification for confirming booking. We look forward to seeing you!
            </p>

            {/* Messenger Return / Flow Banner */}
            {confirmationData.isFromMessenger && (
              <div className="w-full mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-left shadow-2xs">
                {!chatEnded ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-xs">
                        <ChatCircleText size={18} weight="fill" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Sent to Facebook Messenger
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {returnCountdown !== null && returnCountdown > 0 ? (
                            <span>
                              Returning to chat in <strong className="text-blue-700 font-bold">{returnCountdown}s</strong>...
                            </span>
                          ) : (
                            <span>Confirmation message sent to your chat</span>
                          )}
                        </p>
                      </div>
                      {returnCountdown !== null && returnCountdown > 0 && (
                        <button
                          type="button"
                          onClick={() => setReturnCountdown(null)}
                          className="ml-auto text-[10px] font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer"
                        >
                          Pause
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleReturnToMessenger}
                        className="w-full py-2.5 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ChatCircleText size={15} weight="bold" />
                        Back to Chat {returnCountdown ? `(${returnCountdown}s)` : ''}
                      </button>

                      <button
                        type="button"
                        onClick={handleEndConversation}
                        disabled={isEndingChat}
                        className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isEndingChat ? 'Ending...' : '👋 End Chat'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">👋</span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Conversation Ended
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Thank you for booking with us! Your chat session has been closed politely. You can message us again anytime.
                    </p>
                    <button
                      type="button"
                      onClick={handleReturnToMessenger}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ChatCircleText size={14} weight="bold" />
                      Open Messenger
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Appointment Details Card matching Image 2 */}
            <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Appointment Details
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {cancellationSuccess ? 'Cancelled' : 'Confirmed'}
                </span>
              </div>

              {/* Reference Code */}
              {confirmationData.referenceNumber && (
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Reference Code</span>
                  <span className="font-mono font-bold text-[#0E3F39] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                    {confirmationData.referenceNumber}
                  </span>
                </div>
              )}

              {/* Clinic */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Clinic</span>
                <span className="font-bold text-slate-900">{clinicInfo?.clinic_name || 'Dental Clinic'}</span>
              </div>

              {/* Patient */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Patient</span>
                <span className="font-bold text-slate-900">{confirmationData.patientName}</span>
              </div>

              {/* Dentist with Avatar */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Dentist</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#134E48] text-white flex items-center justify-center text-[9px] font-bold">
                    {confirmationData.dentistInitials || 'JK'}
                  </div>
                  <span className="font-bold text-slate-900">{confirmationData.dentistName}</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Date &amp; Time</span>
                <span className="font-bold text-slate-900">{confirmationData.dateTimeStr}</span>
              </div>

              {/* Service */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Service</span>
                <span className="font-bold text-slate-900">{confirmationData.serviceName}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleResetToHome}
                  className="w-full py-2.5 bg-[#0E3F39] hover:bg-[#15534b] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Back to Portal Home
                </button>

                {!cancellationSuccess && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

            </div>

            {/* Cancel Booking Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 text-left">
                  <h3 className="text-sm font-bold text-slate-900">Cancel Appointment</h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to cancel this booking? Please provide a brief reason:
                  </p>
                  <textarea
                    rows={2}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder="e.g. Schedule conflict or personal emergency..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={handleCancelBookingSubmit}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
 
      {/* SaaS Branding Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            {clinicInfo?.logo_url ? (
              <img
                src={clinicInfo.logo_url}
                alt={clinicInfo.clinic_name}
                className="w-5 h-5 rounded-md object-contain"
              />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            )}
            <span className="text-xs font-bold text-slate-700">
              {clinicInfo?.clinic_name || 'Dental Clinic'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Powered by</span>
            <span className="font-bold text-[#0E3F39] tracking-tight">PIVODENT</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Clinic Management & Real-Time Booking System</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
