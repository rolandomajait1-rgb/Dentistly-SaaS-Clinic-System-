import { useMemo, useCallback, useState, useEffect } from 'react';
import { getOverview } from '../../api';
import assets from '../../assets';
import PatientModal from '../../components/patients/PatientModal';

export default function DashboardOverview({ setActiveTab }) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [overviewData, setOverviewData] = useState({
    stats: { totalPatients: 0, pendingAppointments: 0, activeQueue: 0, completedToday: 0 },
    todayAppointments: [],
  });

  const fetchOverview = useCallback(async () => {
    try {
      const data = await getOverview();
      setOverviewData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => { if (active) await fetchOverview(); })();
    return () => { active = false; };
  }, [fetchOverview]);

  // Default demo appointments matching the user's Figma specification
  const defaultAppointments = [
    {
      id: 1,
      time: '09:00',
      duration: '30min',
      name: 'Nathan Park',
      type: 'Returning',
      typeBg: '#D1FAE5',
      typeColor: '#047857',
      subtitle: 'Consultation · Dr. Carlos Reyes',
      status: 'Completed',
      statusBg: '#B1FFB4',
      statusColor: '#458A48',
    },
    {
      id: 2,
      time: '10:00',
      duration: '60min',
      name: 'Clara Mendoza',
      type: 'New Patient',
      typeBg: '#DBEAFE',
      typeColor: '#1D4ED8',
      subtitle: 'Teeth Whitening · Dr. Maria Santos',
      status: 'Completed',
      statusBg: '#B1FFB4',
      statusColor: '#458A48',
    },
    {
      id: 3,
      time: '13:00',
      duration: '15min',
      name: 'Tyler Brooks',
      type: 'New Patient',
      typeBg: '#DBEAFE',
      typeColor: '#1D4ED8',
      subtitle: 'Dental X-Ray · Dr. Maria Santos',
      status: 'Scheduled',
      statusBg: '#B1FFDF',
      statusColor: '#17A897',
    },
  ];

  const appointmentsList = useMemo(() => {
    if (overviewData.todayAppointments && overviewData.todayAppointments.length > 0) {
      return overviewData.todayAppointments.map((app, idx) => ({
        id: app.id || idx,
        time: app.appointment_time ? app.appointment_time.slice(0, 5) : '09:00',
        duration: '30min',
        name: app.patient?.full_name || 'Patient',
        type: idx % 2 === 0 ? 'Returning' : 'New Patient',
        typeBg: idx % 2 === 0 ? '#D1FAE5' : '#DBEAFE',
        typeColor: idx % 2 === 0 ? '#047857' : '#1D4ED8',
        subtitle: `${app.service?.service_name || 'Consultation'} · ${app.dentist_name || 'Dr. Maria Santos'}`,
        status: app.status === 'Completed' || app.status === 'completed' ? 'Completed' : 'Scheduled',
        statusBg: app.status === 'Completed' || app.status === 'completed' ? '#B1FFB4' : '#B1FFDF',
        statusColor: app.status === 'Completed' || app.status === 'completed' ? '#458A48' : '#17A897',
      }));
    }
    return defaultAppointments;
  }, [overviewData.todayAppointments]);

  const defaultAlerts = [
    {
      id: 1,
      message: "Patient escalation: 'Is extraction painful?' – needs response",
      time: '2 hours ago',
    },
    {
      id: 2,
      message: "Patient escalation: 'Is extraction painful?' – needs response",
      time: '2 hours ago',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" style={{ color: '#99A1AF' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#1A8A7A] border-t-transparent animate-spin" />
        <p style={{ fontSize: 12, fontFamily: "'Work Sans', sans-serif" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>

      {/* ── ROW 1: 3 METRIC CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        {/* Card 1: Revenue This Month */}
        <div
          style={{
            padding: 16,
            background: 'white',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
            borderRadius: 10,
            outline: '0.67px white solid',
            outlineOffset: '-0.67px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
              Revenue This Month
            </span>
            <img src={assets.iconRevenue} alt="Revenue" style={{ width: 18, height: 18, objectContain: 'contain' }} />
          </div>
          <div style={{ paddingTop: 8 }}>
            <span style={{ color: '#0E3F39', fontSize: 24, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '32px' }}>
              ₱148,200
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
              +12% vs last month
            </span>
          </div>
        </div>

        {/* Card 2: New Patients This Month */}
        <div
          style={{
            padding: 16,
            background: 'white',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
            borderRadius: 10,
            outline: '0.67px white solid',
            outlineOffset: '-0.67px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
              New Patients This Month
            </span>
            <img src={assets.iconNewPatients} alt="New Patients" style={{ width: 18, height: 18, objectContain: 'contain' }} />
          </div>
          <div style={{ paddingTop: 8 }}>
            <span style={{ color: '#0E3F39', fontSize: 24, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '32px' }}>
              10
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
              +3 vs last month
            </span>
          </div>
        </div>

        {/* Card 3: Cancellation Rate */}
        <div
          style={{
            padding: 16,
            background: 'white',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
            borderRadius: 10,
            outline: '0.67px white solid',
            outlineOffset: '-0.67px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
              Cancellation Rate
            </span>
            <img src={assets.iconCancellation} alt="Cancellation Rate" style={{ width: 18, height: 18, objectContain: 'contain' }} />
          </div>
          <div style={{ paddingTop: 8 }}>
            <span style={{ color: '#0E3F39', fontSize: 24, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '32px' }}>
              0%
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
              This month
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 2 METRIC CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
        {/* Card 4: No-shows Today */}
        <div
          style={{
            padding: 16,
            background: 'white',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
            borderRadius: 10,
            outline: '0.67px white solid',
            outlineOffset: '-0.67px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
              No-shows Today
            </span>
            <img src={assets.iconNoShows} alt="No-shows" style={{ width: 18, height: 18, objectContain: 'contain' }} />
          </div>
          <div style={{ paddingTop: 8 }}>
            <span style={{ color: '#0E3F39', fontSize: 24, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '32px' }}>
              2
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
              16.7% rate
            </span>
          </div>
        </div>

        {/* Card 5: Total Appointments Today */}
        <div
          style={{
            padding: 16,
            background: 'white',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.10)',
            borderRadius: 10,
            outline: '0.67px white solid',
            outlineOffset: '-0.67px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
              Total Appointments Today
            </span>
            <img src={assets.iconAppointmentsToday} alt="Total Appointments" style={{ width: 18, height: 18, objectContain: 'contain' }} />
          </div>
          <div style={{ paddingTop: 8 }}>
            <span style={{ color: '#0E3F39', fontSize: 24, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '32px' }}>
              12
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <span style={{ color: '#99A1AF', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
              6 remaining
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 3: ALERTS CARD ── */}
      <div
        style={{
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          borderRadius: 10,
          outline: '1.33px rgba(14, 63, 57, 0.10) solid',
          outlineOffset: '-1.33px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            paddingLeft: 18.75,
            paddingRight: 18.75,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottom: '1.33px rgba(14, 63, 57, 0.08) solid',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 7.50, display: 'flex' }}>
            <span style={{ color: '#1E2939', fontSize: 14, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '20px' }}>
              Alerts
            </span>
            <div
              style={{
                paddingLeft: 5.63,
                paddingRight: 5.63,
                paddingTop: 1.88,
                paddingBottom: 1.88,
                background: '#FEE2E2',
                borderRadius: 44739200,
                display: 'inline-flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: '#DC2626', fontSize: 11, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '15.71px' }}>
                3
              </span>
            </div>
          </div>
        </div>

        <div style={{ alignSelf: 'stretch', flexDirection: 'column', display: 'flex' }}>
          {defaultAlerts.map((alert, i) => (
            <div
              key={alert.id || i}
              style={{
                alignSelf: 'stretch',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 13.13,
                paddingBottom: 13.13,
                borderBottom: i < defaultAlerts.length - 1 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 11.25,
                display: 'inline-flex',
              }}
            >
              <div style={{ paddingTop: 1.88, display: 'flex', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: '#DCE8F5',
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <img src={assets.iconAlertMsg} alt="Alert" style={{ width: 14, height: 14, objectContain: 'contain' }} />
                </div>
              </div>
              <div style={{ flex: '1 1 0', flexDirection: 'column', display: 'inline-flex' }}>
                <span style={{ color: '#1E2939', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
                  {alert.message}
                </span>
                <div style={{ paddingTop: 3.75, display: 'flex' }}>
                  <span style={{ color: '#5A7A76', fontSize: 11, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16.50px' }}>
                    {alert.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 4: TODAY'S APPOINTMENTS CARD ── */}
      <div
        style={{
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          borderRadius: 10,
          outline: '1.33px rgba(14, 63, 57, 0.10) solid',
          outlineOffset: '-1.33px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            paddingLeft: 18.75,
            paddingRight: 18.75,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottom: '1.33px rgba(14, 63, 57, 0.08) solid',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#1E2939', fontSize: 14, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '20px' }}>
              Today's Appointments
            </span>
            <div
              style={{
                paddingLeft: 6,
                paddingRight: 6,
                paddingTop: 1,
                paddingBottom: 1,
                background: '#96FFC9',
                borderRadius: 44739200,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0E3F39', fontSize: 11, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '15.71px' }}>
                6
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('schedule')}
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 3.75,
              display: 'flex',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ textAlign: 'center', color: '#0E3F39', fontSize: 11.25, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '15px' }}>
              Full calendar
            </span>
            <img src={assets.iconArrowRight} alt="Arrow" style={{ width: 12, height: 12, objectContain: 'contain' }} />
          </button>
        </div>

        {/* Appointments List */}
        <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
          {appointmentsList.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                alignSelf: 'stretch',
                height: 75,
                paddingLeft: 18.75,
                paddingRight: 18.75,
                paddingTop: 11.25,
                paddingBottom: 11.25,
                borderBottom: index < appointmentsList.length - 1 ? '1.33px rgba(14, 63, 57, 0.06) solid' : 'none',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 15,
                display: 'inline-flex',
              }}
            >
              {/* Time Column */}
              <div style={{ width: 45, display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ color: '#1E2939', fontSize: 14, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '20px' }}>
                  {item.time}
                </span>
                <span style={{ color: '#5A7A76', fontSize: 11, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16.50px' }}>
                  {item.duration}
                </span>
              </div>

              {/* Patient Info Column */}
              <div style={{ flex: '1 1 0', display: 'inline-flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7.50 }}>
                  <span style={{ color: '#1E2939', fontSize: 14, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '20px' }}>
                    {item.name}
                  </span>
                  <div
                    style={{
                      paddingLeft: 8,
                      paddingRight: 8,
                      paddingTop: 2,
                      paddingBottom: 2,
                      background: item.typeBg,
                      borderRadius: 22369600,
                      display: 'inline-flex',
                    }}
                  >
                    <span style={{ color: item.typeColor, fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '500', lineHeight: '16px' }}>
                      {item.type}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6A7282', fontSize: 12, fontFamily: "'Work Sans', sans-serif", fontWeight: '400', lineHeight: '16px' }}>
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 2,
                  paddingBottom: 2,
                  background: item.statusBg,
                  borderRadius: 22369600,
                  display: 'inline-flex',
                }}
              >
                <span style={{ color: item.statusColor, fontSize: 11, fontFamily: "'Work Sans', sans-serif", fontWeight: '600', lineHeight: '16px' }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} isLarge />
      )}
    </div>
  );
}
