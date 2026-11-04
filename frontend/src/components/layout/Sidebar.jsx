import assets from '../../assets';
import { getRoleConfig } from '../../utils/permissions';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Dashboard',           icon: assets.iconDashboardActive },
  { id: 'schedule',  label: 'Appointments',        icon: assets.iconAppointments },
  { id: 'patients',  label: 'Patients',            icon: assets.iconPatients },
  { id: 'reports',   label: 'Reports & Analytics', icon: assets.iconReports },
  { id: 'staff',     label: 'Staff & Users',       icon: assets.iconStaffUsers },
  { id: 'settings',  label: 'Clinic Settings',     icon: assets.iconClinicSettings },
];

const getIconStyle = (itemId, isActive) => {
  if (isActive) {
    if (itemId === 'overview') {
      return {};
    }
    return {
      filter: 'brightness(0) saturate(100%) invert(18%) sepia(35%) saturate(1212%) hue-rotate(124deg) brightness(94%) contrast(92%)',
    };
  } else {
    if (itemId === 'overview') {
      return {
        filter: 'brightness(0) saturate(100%) invert(48%) sepia(10%) saturate(632%) hue-rotate(178deg) brightness(93%) contrast(88%)',
      };
    }
    return {};
  }
};

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }) {
  const roleConfig = getRoleConfig(user);
  const visibleNavItems = NAV_ITEMS.filter((item) => roleConfig.allowedTabs.includes(item.id));

  return (
    <aside
      className="hidden md:flex flex-col h-full bg-white shrink-0 border-r border-slate-100 select-none"
      style={{
        width: 255,
        height: '100vh',
        paddingTop: 28,
        paddingBottom: 28,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-1 mb-8">
        <div className="w-13 h-13 rounded-[18px] bg-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)] border border-slate-100/90">
          <img
            src={assets.dashboardLogo || assets.pivodentLogo}
            alt="Pivodent"
            className="w-8.5 h-8.5 object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div
            style={{
              background: 'linear-gradient(90deg, #1A5C54 0%, #00100E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 20,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '700',
              lineHeight: '30px',
              wordWrap: 'break-word',
              letterSpacing: '-0.01em',
            }}
          >
            PIVODENT
          </div>
          <div
            style={{
              color: '#486D69',
              fontSize: 12,
              fontFamily: "'Quattrocento', Georgia, serif",
              fontWeight: '400',
              lineHeight: '16px',
            }}
          >
            Dental Clinic
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-4.5" aria-label="Main navigation">
        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3.5 px-4 py-3 transition-all duration-150 cursor-pointer group ${
                isActive ? '' : 'hover:bg-slate-50/70'
              }`}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #FFFFFF 0%, #0F3E38 100%) border-box',
                      border: '1.5px solid transparent',
                      borderRadius: 8,
                      boxShadow: '0px 4px 14px rgba(15, 62, 56, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.04)',
                    }
                  : {
                      background: 'transparent',
                      border: '1.5px solid transparent',
                      borderRadius: 8,
                    }
              }
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-4.5 h-4.5 object-contain transition-all"
                  style={getIconStyle(item.id, isActive)}
                />
              </div>
              <span
                style={{
                  color: isActive ? '#0F3E38' : '#6A7282',
                  fontSize: 14.5,
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: isActive ? '600' : '500',
                  lineHeight: '20px',
                }}
                className={isActive ? '' : 'group-hover:text-[#0F3E38] transition-colors'}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Sign Out Section */}
      <div className="mt-auto pt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 transition-all duration-150 cursor-pointer group hover:bg-slate-50/70"
          style={{
            border: '1.5px solid transparent',
            borderRadius: 8,
          }}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <img
              src={assets.iconSignOut}
              alt="Sign out"
              className="w-4.5 h-4.5 object-contain transition-opacity"
            />
          </div>
          <span
            style={{
              color: '#6A7282',
              fontSize: 14.5,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '500',
              lineHeight: '20px',
            }}
            className="group-hover:text-[#0F3E38] transition-colors"
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
