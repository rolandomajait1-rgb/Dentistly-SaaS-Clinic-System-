import assets from '../../assets';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Dashboard',           icon: assets.iconDashboardActive },
  { id: 'schedule',  label: 'Appointments',        icon: assets.iconAppointments },
  { id: 'patients',  label: 'Patients',            icon: assets.iconPatients },
  { id: 'reports',   label: 'Reports & Analytics', icon: assets.iconReports },
  { id: 'staff',     label: 'Staff & Users',       icon: assets.iconStaffUsers },
  { id: 'settings',  label: 'Clinic Settings',     icon: assets.iconClinicSettings },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside
      className="hidden md:flex flex-col h-full bg-white shrink-0 z-20"
      style={{
        width: 260,
        height: '100vh',
        paddingTop: 20,
        paddingBottom: 20,
        boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.24) inset',
      }}
    >
      {/* Brand Header */}
      <div
        className="px-6 py-2 flex items-center gap-2.5 mb-6"
        style={{
          height: 75,
          borderRight: '0.67px rgba(255, 255, 255, 0.10) solid',
        }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.30),0px_4px_8px_3px_rgba(0,0,0,0.15)] bg-white border border-slate-100">
          <img src={assets.dashboardLogo || assets.pivodentLogo} alt="Pivodent" className="w-10 h-10 object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <div
            style={{
              color: '#1A5C54',
              fontSize: 20,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '700',
              lineHeight: '30px',
            }}
          >
            PIVODENT
          </div>
          <div
            style={{
              color: '#0E3F39',
              fontSize: 10,
              fontFamily: "'Quattrocento', serif",
              fontWeight: '400',
              lineHeight: '17px',
            }}
          >
            Dental Clinic
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-3.5 px-6 pt-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 cursor-pointer"
              style={
                isActive
                  ? {
                      background: 'white',
                      boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.30)',
                      borderRadius: 5,
                      outline: '1px white solid',
                      outlineOffset: '-1px',
                    }
                  : {
                      borderRadius: 10,
                    }
              }
            >
              <div className="w-[17px] h-[17px] flex items-center justify-center shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-[17px] h-[17px] object-contain"
                />
              </div>
              <span
                style={{
                  color: isActive ? '#0E3F39' : '#6A7282',
                  fontSize: 14,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: '500',
                  lineHeight: '20px',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Sign Out Section */}
      <div className="mt-auto px-6 pb-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 cursor-pointer"
          style={{ borderRadius: 10 }}
        >
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            <img src={assets.iconSignOut} alt="Sign out" className="w-4 h-4 object-contain" />
          </div>
          <span
            style={{
              color: '#6A7282',
              fontSize: 14,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '500',
              lineHeight: '20px',
            }}
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
